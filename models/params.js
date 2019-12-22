const mysqlCon = require('../models/mysqlCon')

exports.addParam = (req, res) => {

    var sql = `INSERT INTO parameter (nama_parameter, nilai_parameter, channel, isDeleted)
                VALUES('${req.body.nama_parameter}','${req.body.nilai_parameter}','${req.body.channel}', 0)`

    mysqlCon.query(sql, function (error, rows, fields) {
        if (error) {
            res.send({ status: "error", desc: error })
        } else {
            res.send({ status: "success", desc: "Success" })
        }
    });

}

exports.updateParam = (req, res) => {
    var sql = `UPDATE parameter 
                            SET
                            nilai_parameter = '${req.body.nilai_parameter}' ,  
	                                WHERE
                                    id_parameter = '${req.params.id_parameter}' `;
    mysqlCon.query(sql, function (error, rows, fields) {
        if (error) {
            res.send({ status: "error", desc: error })
        } else {
            res.send({ status: "success", desc: "Success update" })
        }
    });
}

exports.paramsRemove = (req, res) => {
    const sql = `delete from parameter
	                                WHERE
                                    id_parameter = '${req.body.id_parameter}' `;
    mysqlCon.query(sql, function (error, rows, fields) {
        if (error) {
            res.send({ status: "error", desc: error })
        } else {
            res.send({ status: "success", desc: "Success delete" })
        }
    });
}

exports.getParams = (req, res) => {

    var sql = `SELECT  * from parameter `;

    mysqlCon.query(sql, function (error, rows, fields) {
        if (error) {
            console.log(error)
        } else {
            res.send(rows)
        }
    });
}

exports.getParamsDetail = (req, res) => {

    var sql = `SELECT * from parameter p
                WHERE p.id_parameter = '${req.params.id_parameter}' `;

    mysqlCon.query(sql, function (error, rows, fields) {
        if (error) {
            console.log(error)
        } else {
            res.send(rows)
        }
    });
}

exports.getParamsInput = channel => {
    return new Promise(resolve => {
        const sql = `SELECT nilai_parameter FROM parameter WHERE channel = '${channel}' `
        mysqlCon.query(sql, function (error, rows, fields) {
            if (error) {
                console.log(error);
            }
            resolve(rows[0].nilai_parameter);
        });
    });
}