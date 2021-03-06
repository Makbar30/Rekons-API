const express = require('express');
var router = express.Router();
const mysqlCon = require('../models/mysqlCon');
const Excel = require('exceljs')
const fetch = require('node-fetch')
const { URLSearchParams } = require('url');
const async = require('async')
var _ = require('lodash');
const moment = require('moment');
var fs = require('fs');
const { insertImportLinkaja, insertdataMPLinkAja, updateDataLinkaja } = require('../models/linkaja')
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
var upload = multer({ storage: storage })

router.post('/upload', upload.single('file'), (req, res) => {
    convertCsvLinkAja(req, res)
});

router.get('/datarealtime', async (req, res) => {
    var dataKonekthing = await getDataKonekthing('linkaja');
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

async function convertCsvLinkAja(req, res) {

    //1.fetching data dari dataKonekthing
    var dataKonekthing = await getDataKonekthing('linkaja');
    var potonganKMDN = await getParamsInput("kmdn");
    var potonganUser = await getParamsInput("user");
    var potonganChannel = await getParamsInput("linkaja")

    if (req.file.filename.includes("ORG_muslimpocket_wco_")) {
        var workbook = new Excel.Workbook()
        console.log("type : ", req.file.mimetype)
        var dataLinkaja = await convertxlsx(req.file.path, workbook);
        var countInsertLinkAja = await insertData(dataLinkaja, potonganKMDN, potonganUser, potonganChannel);
        var countInsertMPLinkaja = await matchingData(dataLinkaja, dataKonekthing)

        if (countInsertLinkAja === 0 && countInsertMPLinkaja.matchdata === 0 && countInsertMPLinkaja.updatedData === 0) {
            fs.unlink(`./tmp/csv/${req.file.filename}`, function (err) {
                if (err) throw err;
                // if no error, file has been deleted successfully
                res.status(400).send({ status: 'failed', desc: "File sama isinya dan tidak ada yang match" })
            });
        } else {
            mysqlCon.query(`
                            INSERT INTO attachment ( 
                            attachment_name , import_at , ext_name , channel
                            ) values ( 
                            '${req.file.filename}' , NOW() , '${req.file.mimetype}', 'linkaja'
          )`, function (error, rows, fields) {
                if (error) {
                    res.status(400).send({ status: 'failed', desc: error })
                }
                res.send({ status: "success", data_masuk: countInsertLinkAja, data_sama: countInsertMPLinkaja.matchdata, updated_data_linkaja: countInsertMPLinkaja.updatedData })
            });
        }


    } else {
        fs.unlink(`./tmp/csv/${req.file.filename}`, function (err) {
            if (err) throw err;
            // if no error, file has been deleted successfully
            res.status(400).send({ status: 'failed', desc: "File bukan dari dashboard Linkaja" })
        });
    }
}

function convertdatetime(datetime) {
    var date = datetime.split(" ");
    var splitdate = date[0].split("/").reverse().join("-");
    var newdate = splitdate.concat(" ", date[1]);
    return newdate;
}

async function convertxlsx(path, workbook) {
    var workbooks = await workbook.xlsx.readFile(path);
    var sheet = await workbooks._worksheets[1];
    var dataLinkAja = [];
    await sheet.eachRow((row, rowIndex) => {
        const isLinkaja = row.values.includes("IDR", 6)
        if (isLinkaja) {
            dataLinkAja.push(row.values);
        }
    });

    return dataLinkAja
}

async function insertData(dataLinkAja, params_KMDN, params_user, params_channel) {
    let count = 0;
    for await (data of dataLinkAja) {
        var transaction_date = await convertdatetime(data[3])
        var payment_date = await convertdatetime(data[2])
        await insertImportLinkaja(data, payment_date, transaction_date, params_KMDN, params_user, params_channel)
            .then(result => {
                if (result.insertId !== 0) {
                    count++;
                }

            })
    }
    return count;
}

async function matchingData(dataLinkAja, dataKonekthing) {
    let matchcount = 0;
    let updatecount = 0;

    for await (data of dataLinkAja) {
        var payment_date = convertdatetime(data[2])
        var transaction_date = convertdatetime(data[3])
        for await (dataMp of dataKonekthing) {
            const isMatch = dataMp.transactionDate === moment(`${payment_date}`).format('YYYY-MM-DD HH:mm:ss')
            const isMatchAlt = dataMp.transactionDate === moment(`${payment_date}`).add(1, 'seconds').format('YYYY-MM-DD HH:mm:ss')
            if (isMatch || isMatchAlt) {
                await insertdataMPLinkAja(data, dataMp, transaction_date)
                    .then(async result => {
                        console.log("import sama")
                        if (result.insertId !== 0) {
                            matchcount++;
                        }
                        await updateDataLinkaja(dataMp, payment_date)
                            .then(result => {
                                console.log("update sama")
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

    return objcount
}

module.exports = router;