const express = require('express');
var router = express.Router();
const mysqlCon = require('../models/mysqlCon');
const Excel = require('exceljs')
const fetch = require('node-fetch')
const { URLSearchParams } = require('url');
const async = require('async')
var _ = require('lodash');
var fs = require('fs');
const { insertImportDanapay, insertdataMPDANA, updateDataDanapay } = require('../models/dana')

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
    convertCsvDANA(req, res)
});

//upload and convert csv & xlxs
router.get('/datarealtime', async (req, res) => {
    var dataKonekthing = await getDataKonekthing('dana');
    res.send({ status: "success", result: dataKonekthing })
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

async function convertCsvDANA(req, res) {

    //1.fetching data dari dataKonekthing
    // var dataKonekthing = await getDataKonekthing('dana');

    //get parameter for shared fee
    // var parameters = await getParameter('dana');

    if (req.file.filename.includes("MERCHANT_SETTLEMENT_")) {
        var workbook = new Excel.Workbook()
        console.log("type : ", req.file.mimetype)
        var dataDanapay = await convertxlsx(req.file.path, workbook)
        res.send({ status: "success", data_convert: dataDanapay })
        // var countInsertDanapay = await insertData(dataDanapay);
        // var countInsertMP = await matchingData(dataDanapay, dataKonekthing);
        // if (countInsertDanapay === 0 && countInsertMP.matchdata === 0 || countInsertMP.updatedData === 0) {
        //     fs.unlink(`./tmp/csv/${req.file.filename}`, function (err) {
        //         if (err) throw err;

        //         res.status(400).send({ status: 'failed', desc: "File sama isinya dan tidak ada yang match" })
        //     });
        // } else {
        //     mysqlCon.query(`
        //         INSERT INTO attachment ( 
        //             attachment_name , import_at , ext_name , channel
        //           ) values ( 
        //             '${req.file.filename}' , NOW() , '${req.file.mimetype}', 'dana'
        //           )`, async function (error, rows, fields) {

        //         if (error) {
        //             res.status(400).send({ status: 'failed', desc: error })
        //         }
        //         res.send({ status: "success", data_masuk: countInsertDanapay, data_sama: countInsertMP.matchdata, updated_data_danapay: countInsertMP.updatedData })
        //     })
        // }
    } else {
        fs.unlink(`./tmp/csv/${req.file.filename}`, function (err) {
            if (err) throw err;

            res.status(400).send({ status: 'failed', desc: "File bukan dari dashboard DANA (Danapay)" })
        });
    }
}

async function convertxlsx(path, workbook) {
    var options = {
        map(value, index) {
            switch (index) {
                case 0:
                    // column 1 is string
                    return value.toString();
                case 1:
                    // column 2 is a date
                    return value.toString();
                case 4:
                    // column 3 is JSON of a formula value
                    return value.toString();
                default:
                    // the rest are numbers
                    return value;
            }
        }
    };
    var workbooks = await workbook.csv.readFile(path, options);
    // var sheet = await workbooks._worksheets[1];
    var dataDANA = [];
    await workbooks.eachRow({ includeEmpty: false }, function (row, rowNumber) {
        console.log("Row " + rowNumber + " = " + row.values)
        // const isDANA = row.values.includes("DANA", 4);
        // if (isDANA) {
        dataDANA.push(row.values);
        // }
    });

    return dataDANA
}

async function insertData(dataDANA) {
    let count = 0;

    //var disini hanya untuk nunggu si async.each
    var insertImport = await async.each(dataDANA, function (data, resume) {
        insertImportDanapay(data)
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

async function matchingData(dataDANA, dataKonekthing) {
    let matchcount = 0;
    let updatecount = 0;

    for await (dataDanapay of dataDANA) {
        for await (dataMp of dataKonekthing) {
            if (parseInt(dataMp.bill_no) === parseInt(dataDanapay[6])) {
                await insertdataMPDANA(dataMp)
                    .then(async result => {
                        if (result.insertId !== 0) {
                            matchcount++;
                        }
                        await updateDataDanapay(dataDanapay[6])
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