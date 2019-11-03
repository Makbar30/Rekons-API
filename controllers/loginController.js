const express = require('express');
var router = express.Router();
const mysqlCon = require('../models/mysqlCon');
const jwt = require("jsonwebtoken")
const _ = require("lodash")
const config = require('../config')

//login
router.post('/', (req, res) => {
    var userID = req.body.userID;
    var Password = req.body.password;

    if (!_.isEmpty(userID) && !_.isEmpty(Password)) {

        login(req, res)

    } else {
        res.send({ status: "error", desc: "user and password cant null" });
    }

});
/*************************************** Function List **********************************************/


function login(req, res) {
    const sql = `select * from users where email = '${req.body.userID}' and password = '${req.body.password}'`;

    let token;

    mysqlCon.query(sql, function (error, rows, fields) {
        if (error) {
            console.log(error)
            res.send({ status: "error", desc: error })
        } else {
            if (!_.isEmpty(rows)) {
                token = giveToken(req.body.email)
            } else {
                rows = '';
            }
            res.send({ userProfile: rows, token: token })
        }
    });
}

function giveToken(userID) {

    let token = jwt.sign({ username: userID },
        config.secret,
        {
            expiresIn: '24h'
        }
    );

    return token;

}

module.exports = router;