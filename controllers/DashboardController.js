const express = require('express');
var router = express.Router();

const { getalldata, getalldatabychannel } = require('../models/dashboard')

//show data summary sesuai semua data yg pertama dimunculkan
router.get('/alldata', (req, res) => {
    getAllData(req, res)
});


/*************************************** Function List **********************************************/

async function getAllData(req, res) {

    const dataall = await getalldata()
    const dataovo = await getalldatabychannel("ovo")
    const datagopay = await getalldatabychannel("gopay")
    const datalinkaja = await getalldatabychannel("linkaja")
    const datadana = await getalldatabychannel("dana")

    var result = [dataall, dataovo, datagopay, datalinkaja, datadana]

    if (result !== []) {
        res.send({ status: "success", data: result })
    }
}

module.exports = router;