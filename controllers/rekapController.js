const express = require('express');
var router = express.Router();

const { getDataBank, getDataImportByChannel, getDataMPByChannel, getRekapMasjidByReceiver , getRekapBank , getRekapTrImport, getListMasjidByBank, getListTrByBank
       , getRekapTrMP , getRekapMasjid, getDatabyMasjid, getDatabyBank, getRekapMasjidByBank, getRekapBankByDate, getRekapMasjidByDate, getDatabyMasjidAndDate, getRekapMasjidByReceiverAndDate} = require('../models/rekap')

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

router.get('/getDataExportByBank/:bank', (req, res) => {
    getListDataByBank(req, res)
});

//exportcsv
router.get('/exportcsv/:bank/:date', (req, res) => {
    exportCSV(req, res)
});

router.get('/getDataExport/:receiver', (req, res) => {
    getDataByMasjid(req, res)
});

router.get('/getDataExport/:receiver/:start_date/:end_date', (req, res) => {
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

async function getDataByMasjid(req, res) {

    const dataExport = await getDatabyMasjid(req.params.receiver);
    const dataMasjid = await getRekapMasjidByReceiver(req.params.receiver);

    if (dataExport) {
        res.send({ data_export: dataExport, data_masjid: dataMasjid })
    }
}

async function getDataByMasjidAndDate(req, res) {

    const dataExport = await getDatabyMasjidAndDate(req.params.receiver, req.params.start_date, req.params.end_date);
    const dataMasjid = await getRekapMasjidByReceiverAndDate(req.params.receiver, req.params.start_date, req.params.end_date);

    if (dataExport) {
        res.send({ data_export: dataExport, data_masjid: dataMasjid })
    }
}


async function getListDataByBank(req, res) {

    const dataExport = await getListTrByBank(req.params.bank);
    const dataMasjid = await getListMasjidByBank(req.params.bank);

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