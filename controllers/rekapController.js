const express = require('express');
var router = express.Router();

const { getDataBank, getDataImportByChannel, getDataMPByChannel, getRekapMasjidByReceiver , getNominalDataMP , getRekapBank , getRekapTrImport
       , getRekapTrMP , getRekapMasjid, getDatabyrek, getDatabyMasjid, getDatabyBank, getRekapMasjidByBank, getRekapBankByDate, getRekapMasjidByDate } = require('../models/rekap')

//show data summary sesuai semua data yg pertama dimunculkan
router.get('/alldata', (req, res) => {
    getRekap(req, res)
});

router.get('/detail/:receiver', (req, res) => {
    getDetailMasjid(req, res)
});

router.get('/exportdata/:start_date/:end_date', (req, res) => {
    getDataForExport(req, res)
});

router.get('/databychannel/:channel', (req, res) => {
    getAllDataByChannel(req, res)
});

//exportcsv
router.get('/exportcsv/:bank/:date', (req, res) => {
    exportCSV(req, res)
});

router.get('/getDataExport/:nama/:norek/:start_date/:end_date', (req, res) => {
    getDataByRekAndDate(req, res)
});

router.get('/getDataExport/:nama/:norek', (req, res) => {
    getDataByRek(req, res)
});

router.get('/getDataExport/:nama', (req, res) => {
    getDataByMasjid(req, res)
});

router.get('/getDataExport/:nama/:start_date/:end_date', (req, res) => {
    getDataByMasjidAndDate(req, res)
});

router.get('/getDataExportByBank/:bank/:start_date/:end_date', (req, res) => {
    getListDataByBankAndDate(req, res)
});

/*************************************** Function List **********************************************/

async function getAllDataByChannel(req, res) {

    const dataMP = await getDataMPByChannel(req.params.channel)
    const dataImport = await getDataImportByChannel(req.params.channel)

    if (dataMP && dataImport) {
        res.send({ data_MP: dataMP, data_Import: dataImport })
    }
}

async function getDetailMasjid(req, res) {

    const result = await getRekapMasjidByReceiver(req.params.receiver)
   

    if (result) {
        res.send({ detail_masjid: result })
    }
}

async function getRekap(req, res) {

    const dataRekapBank = await getRekapBank();
    const dataRekapImport = await getRekapTrImport();
    const dataRekapMP = await getRekapTrMP();
    const dataRekapMasjid = await getRekapMasjid();

    if (dataRekapBank && dataRekapImport && dataRekapMP) {
        res.send({ rekap_MP: dataRekapMP, rekap_Import: dataRekapImport, rekap_bank: dataRekapBank, rekap_rekening: dataRekapMasjid })
    }
}

async function getDataForExport(req, res) {

    const dataExport = await getRekapMasjidByDate(req.params.start_date, req.params.end_date);
    const dataRekapBank = await getRekapBankByDate(req.params.start_date, req.params.end_date);

    if (dataExport) {
        res.send({ by_akunRek: dataExport, by_akunBank: dataRekapBank })
    }
}

async function getDataByRek(req, res) {

    const dataExport = await getDatabyrek(req.params.nama, req.params.norek, req.params.start_date, req.params.end_date);

    if (dataExport) {
        res.send({ data_export: dataExport })
    }
}

async function getDataByRekAndDate(req, res) {

    const dataExport = await getDatabyrek(req.params.nama, req.params.norek, req.params.start_date, req.params.end_date);

    if (dataExport) {
        res.send({ data_export: dataExport })
    }
}

async function getDataByMasjid(req, res) {

    const dataExport = await getDatabyMasjid(req.params.nama);

    if (dataExport) {
        res.send({ data_export: dataExport })
    }
}

async function getDataByMasjidAndDate(req, res) {

    const dataExport = await getDatabyMasjidAndDate(req.params.nama, req.params.start_date, req.params.end_date);

    if (dataExport) {
        res.send({ data_export: dataExport })
    }
}


async function getListDataByBank(req, res) {

    const dataExport = await getDatabyBank(req.params.bank, req.params.start_date, req.params.end_date);
    const dataMasjid = await getRekapMasjidByBank(req.params.bank, req.params.start_date, req.params.end_date);

    if (dataExport) {
        res.send({ data_export: dataExport, data_masjid: dataMasjid })
    }
}

async function getListDataByBankAndDate(req, res) {

    const dataExport = await getDatabyBank(req.params.bank, req.params.start_date, req.params.end_date);
    const dataMasjid = await getRekapMasjidByBank(req.params.bank, req.params.start_date, req.params.end_date);

    if (dataExport) {
        res.send({ data_export: dataExport, data_masjid: dataMasjid })
    }
}


async function exportCSV(req, res) {
    var dataByBank = await getDataBank(req.params.bank, req.params.date);
    var dateNow = moment().format('L')
    if (dataByBank) {
        const csvfix = json2csv(dataByBank)
        res.attachment(`${dateNow}_transaksi${req.params.bank}.csv`);
        res.status(200).send(csvfix);
    } else {
        res.send("data tidak ada")
    }
}

module.exports = router;