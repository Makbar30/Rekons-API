const express = require('express');
var router = express.Router();
const mysqlCon = require('../models/mysqlCon');
const Excel = require('exceljs')
const fetch = require('node-fetch')
const { URLSearchParams } = require('url');
const async = require('async')
var _ = require('lodash');
var fs = require('fs');
const { insertImportFaspay, insertdataMPOVO, updateDataFaspay } = require('../models/ovo')
const { getParamsInput } = require('../models/params')

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
    convertCsvOVO(req, res)
});

//upload and convert csv & xlxs
router.get('/datarealtime', async (req, res) => {
    var dataKonekthing = await getDataKonekthing('ovo');

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

async function convertCsvOVO(req, res) {

    //1.fetching data dari dataKonekthing
    var dataKonekthing = await getDataKonekthing('ovo');
    var potonganKMDN = await getParamsInput("kmdn");
    var potonganUser = await getParamsInput("user");
    var potonganChannel = await getParamsInput("ovo")

    if (req.file.filename.includes("Faspay Debit Report")) {
        var workbook = new Excel.Workbook()
        console.log("type : ", req.file.mimetype)
        var dataFaspay = await convertxlsx(req.file.path, workbook)
        var countInsertFaspay = await insertData(dataFaspay);
        var countInsertMP = await matchingData(dataFaspay, dataKonekthing, potonganKMDN, potonganUser, potonganChannel);
        if (countInsertFaspay === 0 && countInsertMP.matchdata === 0 || countInsertMP.updatedData === 0) {
            fs.unlink(`./tmp/csv/${req.file.filename}`, function (err) {
                if (err) throw err;

                res.status(400).send({ status: 'failed', desc: "File sama isinya dan tidak ada yang match" })
            });
        } else {
            mysqlCon.query(`
                INSERT INTO attachment ( 
                    attachment_name , import_at , ext_name , channel
                  ) values ( 
                    '${req.file.filename}' , NOW() , '${req.file.mimetype}', 'ovo'
                  )`, async function (error, rows, fields) {

                if (error) {
                    res.status(400).send({ status: 'failed', desc: error })
                }
                res.send({ status: "success", data_masuk: countInsertFaspay, data_sama: countInsertMP.matchdata, updated_data_faspay: countInsertMP.updatedData })
            })
        }
    } else {
        fs.unlink(`./tmp/csv/${req.file.filename}`, function (err) {
            if (err) throw err;

            res.status(400).send({ status: 'failed', desc: "File bukan dari dashboard OVO (Faspay)" })
        });
    }
}

async function convertxlsx(path, workbook) {
    var workbooks = await workbook.xlsx.readFile(path);
    var sheet = await workbooks._worksheets[1];
    var dataOVO = [];
    await sheet.eachRow((row, rowIndex) => {
        const isOVO = row.values.includes("OVO", 4);
        if (isOVO) {
            dataOVO.push(row.values);
        }
    });

    return dataOVO
}

async function insertData(dataOVO) {
    let count = 0;
    for await (dataFaspay of dataOVO) {
        await insertImportFaspay(dataFaspay)
            .then(result => {
                console.log(result)
                if (result.insertId !== 0) {
                    count++;
                }
            })
    }

    return count;
}

async function matchingData(dataOVO, dataKonekthing, params_KMDN, params_user, params_channel) {
    let matchcount = 0;
    let updatecount = 0;

    for await (dataFaspay of dataOVO) {
        for await (dataMp of dataKonekthing) {
            if (parseInt(dataMp.bill_no) === parseInt(dataFaspay[6])) {
                await insertdataMPOVO(dataMp, params_KMDN, params_user, params_channel)
                    .then(async result => {
                        if (result.insertId !== 0) {
                            matchcount++;
                        }
                        await updateDataFaspay(dataFaspay[6])
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