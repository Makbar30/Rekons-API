const express = require('express');
var router = express.Router();
const { updateExistingRekons, getDetail, updateTransferStat } = require('../models/rekons');

router.put('/', (req, res) => {
    updateRekons(req, res)
});

//exportcsv
router.get('/:id', (req, res) => {
    getDetailRekons(req, res)
});

router.put('/:id', (req, res) => {
    updateIsTransfer(req, res)
});

/*************************************** Function List **********************************************/

async function updateRekons(req, res) {
    updateExistingRekons(req.body)
    .then(rows => {
        res.send({status: "success", result : rows})
    }).catch(error => {
        console.log(error)
    })
}

async function getDetailRekons(req, res) {
    getDetail(req.params.id)
    .then(rows =>{
        res.send({status: "success", result : rows[0]})
    })
}

async function updateIsTransfer(req, res) {
    updateTransferStat(req.params.id)
    .then(rows =>{
        res.send({status: "success", result : rows[0]})
    })
}


module.exports = router;