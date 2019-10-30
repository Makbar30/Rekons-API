const express = require('express');
var router = express.Router();
const { addParam , getParams , getParamsDetail , getParamsInput , updateParam , paramsRemove  } = require('../models/params')

// add params
router.post('/add', (req, res) => {
    addParam(req, res)
});

//read or get data params
router.get('/get/params', (req, res) => {
    getParams(req, res)
});

//read or get data params detail by id
router.get('/get/paramsdetail/:id_parameter', (req, res) => {
    getParamsDetail(req, res)
});

router.get('/get/paramsinput', (req, res) => {
    getParamsInput(req, res)
});

//update
router.put('/update', (req, res) => {
    updateParam(req, res)
});

//delete
router.delete('/delete', (req, res) => {
    paramsRemove(req, res)
});

module.exports = router;