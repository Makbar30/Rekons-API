const express = require('express');
var router = express.Router();

const { getDataBank, getDataImportByChannel, getDataMPByChannel, getNominalDataImport , getNominalDataMP , getRekapBank , getRekapTrImport
       , getRekapTrMP } = require('../models/rekap')

//show data summary sesuai semua data yg pertama dimunculkan
router.get('/alldata', (req, res) => {
    getRekap(req, res)
});

router.get('/databychannel/:channel', (req, res) => {
    getAllDataByChannel(req, res)
});

//exportcsv
router.get('/exportcsv/:bank/:date', (req, res) => {
    exportCSV(req, res)
});


async function getAllDataByChannel(req, res) {

    const dataMP = await getDataMPByChannel(req.params.channel)
    const dataImport = await getDataImportByChannel(req.params.channel)
    const nominalImport = await getNominalDataImport(req.params.channel)
    const nominalMP = await getNominalDataMP(req.params.channel)

    if (dataMP && dataImport && nominalImport && nominalMP) {
        res.send({ data_MP: dataMP, data_Import: dataImport, nominal_Import: nominalImport, nominal_MP: nominalMP })
    }
}

async function getRekap(req, res) {

    const dataRekapBank = await getRekapBank();
    const dataRekapImport = await getRekapTrImport();
    const dataRekapMP = await getRekapTrMP();

    if (dataRekapBank && dataRekapImport && dataRekapMP) {
        res.send({ rekap_MP: dataRekapMP, rekap_Import: dataRekapImport, rekap_bank: dataRekapBank })
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