const mysqlCon = require('./mysqlCon')

exports.getRekapBank = () => {
    return new Promise(resolve => {
        const sql = `SELECT DATE_FORMAT(tr.tgl_pembayaran,"%Y-%m-%d") as pembayaran_tgl, tr.bank_penerima, count(tr.bank_penerima) as jumlah_transaksi, SUM(tr.total_amount) as nominal_transaksi
        FROM transaction_mp tr
        GROUP BY DATE_FORMAT(tr.tgl_pembayaran,"%Y-%m-%d")  , tr.bank_penerima
        ORDER BY tr.tgl_pembayaran`;
        console.log(sql)
        mysqlCon.query(sql,
            function (error, rows, fields) {
                if (error) {
                    console.log(error)
                } else {
                    resolve(rows);
                }
            });
    });
}

exports.getRekapTrImport = () => {
    return new Promise(resolve => {
        const sql = `SELECT *
        FROM transaction_import tr
        ORDER BY tr.payment_date ASC`;
        console.log(sql)
        mysqlCon.query(sql,
            function (error, rows, fields) {
                if (error) {
                    console.log(error)
                } else {
                    resolve(rows);
                }
            });
    });
}

exports.getDataBank = (bank, date) => {
    return new Promise(resolve => {
        var sql = `SELECT no_rekening_penerima, nama_rekening_penerima, total_pembayaran 
        FROM transaction
        WHERE bank_penerima = '${bank}' AND tgl_transaksi = '${date}'`;
        console.log(sql)
        mysqlCon.query(sql,
            function (error, rows, fields) {
                if (error) {
                    console.log(error)
                } else {
                    // console.log(rows[0])
                    resolve(rows);
                }
            });
    });
}


exports.getRekapTrMP = () => {
    return new Promise(resolve => {
        const sql = `SELECT *
        FROM transaction_mp tr
        ORDER BY tr.tgl_pembayaran ASC `;
        console.log(sql)
        mysqlCon.query(sql,
            function (error, rows, fields) {
                if (error) {
                    console.log(error)
                } else {
                    resolve(rows);
                }
            });
    });
}


exports.getDataMPByChannel = channel => {
    return new Promise(resolve => {
        if (channel === "ovo") {
            var sql = `SELECT  * from transaction_mp tr
            WHERE tr.channel = '${channel}'
            ORDER BY tr.bill_no ASC `;
        } else if (channel === "linkaja") {
            var sql = `SELECT  * from transaction_mp tr
            WHERE tr.channel = '${channel}'
            ORDER BY tr.tgl_pembayaran ASC `;
        } else {
            var sql = `SELECT  * from transaction_mp tr
            WHERE tr.channel = '${channel}' `;
        }

        console.log(sql)
        mysqlCon.query(sql,
            function (error, rows, fields) {
                if (error) {
                    console.log(error)
                } else {
                    resolve(rows);
                }
            });
    });
}

exports.getDataImportByChannel = channel => {
    return new Promise(resolve => {
        if (channel === "ovo") {
            var sql = `SELECT  * from transaction_import tr
            WHERE tr.channel = '${channel}'
            ORDER BY tr.bill_no ASC `;
        } else if (channel === "linkaja") {
            var sql = `SELECT  * from transaction_import tr
            WHERE tr.channel = '${channel}'
            ORDER BY tr.payment_date ASC `;
        } else {
            var sql = `SELECT  * from transaction_import tr
            WHERE tr.channel = '${channel}' `;
        }

        console.log(sql)
        mysqlCon.query(sql,
            function (error, rows, fields) {
                if (error) {
                    console.log(error)
                } else {
                    resolve(rows);
                }
            });
    });
}

exports.getNominalDataImport = channel => {
    return new Promise(resolve => {
        var sql = `SELECT IFNULL(COUNT(id),0) as jumlah_transaksi, IFNULL(SUM(tr.payment_amount),0) as amount from transaction_import tr
        WHERE tr.channel = '${channel}' `;
        console.log(sql)
        mysqlCon.query(sql,
            function (error, rows, fields) {
                if (error) {
                    console.log(error)
                } else {
                    resolve(rows[0]);
                }
            });
    });
}

exports.getNominalDataMP = channel => {
    return new Promise(resolve => {
        var sql = `SELECT IFNULL(COUNT(id),0) as jumlah_transaksi, IFNULL(SUM(tr.total_pembayaran),0) as amount from transaction_mp tr
        WHERE tr.channel = '${channel}' `;
        console.log(sql)
        mysqlCon.query(sql,
            function (error, rows, fields) {
                if (error) {
                    console.log(error)
                } else {
                    resolve(rows[0]);
                }
            });
    });
}