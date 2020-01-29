const express = require('express');
var router = express.Router();

const { getalldata, getalldatabychannel, getToplistby, getalldatabymty } = require('../models/dashboard')

//show data summary
router.get('/alldata', (req, res) => {
    getAllData(req, res)
});

//show data summary by month
router.get('/alldatabymty', (req, res) => {
    getAllDataMty(req, res)
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

async function getAllDataMty(req, res) {

    const dataall = await getalldatabymty()
    

    if (result !== []) {
        res.send({ status: "success", data: dataall})
    }
}

module.exports = router;