const express = require('express');
var router = express.Router();

const { getalldata, getalldatabychannel, getToplistby } = require('../models/dashboard')

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
    const topmasjid = await getToplistby("masjid");
    const topuser = await getToplistby("user");

    var result = [dataall, dataovo, datagopay, datalinkaja, datadana]

    if (result !== []) {
        res.send({ status: "success", data: result, list_top_masjid : topmasjid, list_top_user : topuser })
    }
}

module.exports = router;