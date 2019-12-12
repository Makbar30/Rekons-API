const mysqlCon = require('./mysqlCon')

exports.getRekapBank = () => {
    return new Promise(resolve => {
        const sql = `SELECT tr.bank_penerima, count(tr.bank_penerima) as jumlah_transaksi, SUM(tr.total_akhir) as nominal_transaksi
                FROM transaction_mp tr
				GROUP BY tr.bank_penerima
                ORDER BY nominal_transaksi DESC`;
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

exports.getRekapMasjid = () => {
    return new Promise(resolve => {
        const sql = `SELECT tr.no_rekening_penerima, tr.nama_rekening_penerima, tr.nama_penerima, tr.bank_penerima, count(tr.bank_penerima) as jumlah_transaksi, SUM(tr.total_akhir) as nominal_transaksi
        FROM transaction_mp tr
        GROUP BY tr.nama_penerima
        ORDER BY nominal_transaksi DESC`;
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

exports.getDatabyrek = (nama_penerima, no_rekening_penerima) => {
    return new Promise(resolve => {
        const sql = `SELECT * FROM transaction_mp 
        WHERE nama_penerima = "${nama_penerima}" AND no_rekening_penerima = '${no_rekening_penerima}'`;
        console.log(sql)
        mysqlCon.query(sql,
            function (error, rows, fields) {
                if (error) {
                    console.log(error)
                    throw error
                } else {
                    resolve(rows);
                }
            });
    });
}

exports.getDatabyMasjid = nama_penerima => {
    return new Promise(resolve => {
        const sql = `SELECT * FROM transaction_mp 
        WHERE nama_penerima = "${nama_penerima}"`;
        console.log(sql)
        mysqlCon.query(sql,
            function (error, rows, fields) {
                if (error) {
                    console.log(error)
                    throw error
                } else {
                    resolve(rows);
                }
            });
    });
}

exports.getDatabyBank = bank => {
    return new Promise(resolve => {
        const sql = `SELECT * FROM transaction_mp 
        WHERE bank_penerima = "${bank}"`;
        console.log(sql)
        mysqlCon.query(sql,
            function (error, rows, fields) {
                if (error) {
                    console.log(error)
                    throw error
                } else {
                    resolve(rows);
                }
            });
    });
}