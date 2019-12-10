const express = require('express');
var router = express.Router();
const mysqlCon = require('../models/mysqlCon');
const Excel = require('exceljs')
const fetch = require('node-fetch')
const { URLSearchParams } = require('url');
const async = require('async')
var _ = require('lodash');
var fs = require('fs');
const { insertImportGopay, insertdataMPGOPAY, updateDataGopay } = require('../models/gopay')

/// ini untuk upload ///
const multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './tmp/csv');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
var upload = multer({ storage: storage }).single('file')

//upload and convert csv & xlxs
router.post('/upload', upload, (req, res) => {
    convertCsvGOPAY(req, res)
});

//upload and convert csv & xlxs
router.get('/datarealtime', async (req, res) => {
    var dataKonekthing = await getDataKonekthing('gopay');
    res.send({status:"success", result : dataKonekthing})
});

/*************************************** Function List **********************************************/

const getDataKonekthing = type => {
    return new Promise(resolve => {
        //1. get data dari api konekthing
        const url = 'https://muslimpocket.com/cms/Pembayaran/by_jenis';
        // The data we are going to send in our request

        const params = new URLSearchParams();
        params.append('jenis_payment', type)
        // The parameters we are gonna pass to the fetch function
        let fetchData = {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'key': 'TANYAKYAI'
            }
        }
        fetch(url, fetchData)
            .then(response => response.json())
            .then(data => { if (data) { resolve(dataKonekthing = data.result) } })

    });
}

async function convertCsvGOPAY(req, res) {

    //1.fetching data dari dataKonekthing
    var dataKonekthing = await getDataKonekthing('gopay');

    //get parameter for shared fee
    // var parameters = await getParameter('ovo');

    if (req.file.filename.includes("Gopay Debit Report")) {
        var workbook = new Excel.Workbook()
        console.log("type : ", req.file.mimetype)
        var dataGopay = await convertxlsx(req.file.path, workbook)
        var countInsertGopay = await insertData(dataGopay);
        var countInsertMP = await matchingData(dataGopay, dataKonekthing);
        if (countInsertGopay === 0 && countInsertMP.matchdata === 0 || countInsertMP.updatedData === 0) {
            fs.unlink(`./tmp/csv/${req.file.filename}`, function (err) {
                if (err) throw err;

                res.status(400).send({ status: 'failed', desc: "File sama isinya dan tidak ada yang match" })
            });
        } else {
            mysqlCon.query(`
                INSERT INTO attachment ( 
                    attachment_name , import_at , ext_name , channel
                  ) values ( 
                    '${req.file.filename}' , NOW() , '${req.file.mimetype}', 'gopay'
                  )`, async function (error, rows, fields) {

                if (error) {
                    res.status(400).send({ status: 'failed', desc: error })
                }
                res.send({ status: "success", data_masuk: countInsertGopay, data_sama: countInsertMP.matchdata, updated_data_gopay: countInsertMP.updatedData })
            })
        }
    } else {
        fs.unlink(`./tmp/csv/${req.file.filename}`, function (err) {
            if (err) throw err;

            res.status(400).send({ status: 'failed', desc: "File bukan dari dashboard GOPAY" })
        });
    }
}

async function convertxlsx(path, workbook) {
    var workbooks = await workbook.xlsx.readFile(path);
    var sheet = await workbooks._worksheets[1];
    var dataGOPAY = [];
    await sheet.eachRow((row, rowIndex) => {
        const isGOPAY = row.values.includes("GOPAY", 4);
        if (isGOPAY) {
            dataGOPAY.push(row.values);
        }
    });

    return dataGOPAY
}

async function insertData(dataGOPAY) {
    let count = 0;

    //var disini hanya untuk nunggu si async.each
    var insertImport = await async.each(dataGOPAY, function (data, resume) {
        insertImportGopay(data)
            .then(result => {
                console.log(result)
                if (result.insertId !== 0) {
                    count++;
                }
                resume();
            })
    });

    return count;
}

async function matchingData(dataGOPAY, dataKonekthing) {
    let matchcount = 0;
    let updatecount = 0;

    for await (dataGopay of dataGOPAY) {
        for await (dataMp of dataKonekthing) {
            if (parseInt(dataMp.bill_no) === parseInt(dataGopay[6])) {
                await insertdataMPGOPAY(dataMp)
                    .then(async result => {
                        if (result.insertId !== 0) {
                            matchcount++;
                        }
                        await updateDataGopay(dataGopay[6])
                            .then(result => {
                                if (result.affectedRows > 0) {
                                    updatecount++;
                                }
                            })
                    })
            }
        }
    }

    var objcount = {
        matchdata: matchcount,
        updatedData: updatecount
    }
    return objcount;
}


module.exports = router;