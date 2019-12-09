const express = require('express');
var router = express.Router();
const { updateExistingRekons, getDetail } = require('../models/rekons');

router.put('/', (req, res) => {
    updateRekons(req, res)
});

//exportcsv
router.get('/:id', (req, res) => {
    getDetailRekons(req, res)
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
        res.send({status: "success", result : rows})
    })
}

module.exports = router;