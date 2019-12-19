const mysqlCon = require('./mysqlCon')

exports.getRekapBank = () => {
    return new Promise(resolve => {
        const sql = `SELECT a.*, (a.nominal_transaksi_awal - (a.nominal_potongan_kmdn + a.nominal_potongan_cashback + a.nominal_potongan_channel)) as total_akhir
        FROM(
            SELECT tr.bank_penerima as nama_bank, count(tr.bank_penerima) as jumlah_transaksi, 
                        SUM(tr.total_pembayaran) as nominal_transaksi_awal, SUM(ti.potongan_kmdn*tr.total_pembayaran) as nominal_potongan_kmdn,
                        SUM(ti.potongan_channel * tr.total_pembayaran) as nominal_potongan_channel, SUM(ti.potongan_cashback * tr.				total_pembayaran) as nominal_potongan_cashback
            FROM transaction_mp tr
            LEFT JOIN transaction_import ti ON ti.reference_id = tr.reference_id
            GROUP BY tr.bank_penerima
            ) a
        ORDER BY total_akhir DESC`;
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

exports.getRekapBankByDate = (start_date, end_date) => {
    return new Promise(resolve => {
        const sql = `SELECT a.*, (a.nominal_transaksi_awal - (a.nominal_potongan_kmdn + a.nominal_potongan_cashback + a.nominal_potongan_channel)) as total_akhir
        FROM(
            SELECT tr.bank_penerima as nama_bank, count(tr.bank_penerima) as jumlah_transaksi, 
                        SUM(tr.total_pembayaran) as nominal_transaksi_awal, SUM(ti.potongan_kmdn*tr.total_pembayaran) as nominal_potongan_kmdn,
                        SUM(ti.potongan_channel * tr.total_pembayaran) as nominal_potongan_channel, SUM(ti.potongan_cashback * tr.				total_pembayaran) as nominal_potongan_cashback
            FROM transaction_mp tr
            LEFT JOIN transaction_import ti ON ti.reference_id = tr.reference_id
            WHERE (tr.isTransfer = "F" AND (tr.tgl_transaksi BETWEEN "${start_date}" AND "${end_date}"))
            GROUP BY tr.bank_penerima
            ) a
        ORDER BY total_akhir DESC`;
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

exports.getRekapMasjidByDate = (start_date, end_date) => {
    return new Promise(resolve => {
        const sql = `SELECT a.* , (a.nominal_transaksi_awal - (a.nominal_potongan_kmdn + a.nominal_potongan_cashback + a.nominal_potongan_channel)) as total_akhir
        FROM(
            SELECT tr.receiver, tr.no_rekening_penerima, tr.nama_rekening_penerima, tr.nama_penerima, tr.bank_penerima, count(tr.					bank_penerima) as jumlah_transaksi, SUM(tr.total_pembayaran) as nominal_transaksi_awal, SUM(ti.potongan_kmdn*tr.total_pembayaran) as nominal_potongan_kmdn, SUM(ti.potongan_channel * tr.total_pembayaran) as 					nominal_potongan_channel, SUM(ti.potongan_cashback * tr.total_pembayaran) as nominal_potongan_cashback
            FROM transaction_mp tr
            LEFT JOIN transaction_import ti ON ti.reference_id = tr.reference_id
            WHERE (tr.isTransfer = "F" AND (tr.tgl_transaksi BETWEEN "${start_date}" AND "${end_date}"))
          GROUP BY tr.nama_penerima
        ) a
        ORDER BY total_akhir DESC`;
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
        const sql = `SELECT a.* , (a.nominal_transaksi_awal - (a.nominal_potongan_kmdn + a.nominal_potongan_cashback + a.nominal_potongan_channel)) as total_akhir
        FROM(
            SELECT tr.receiver, tr.no_rekening_penerima, tr.nama_rekening_penerima, tr.nama_penerima, tr.bank_penerima, count(tr.					bank_penerima) as jumlah_transaksi, SUM(tr.total_pembayaran) as nominal_transaksi_awal, SUM(ti.potongan_kmdn*tr.total_pembayaran) as nominal_potongan_kmdn, SUM(ti.potongan_channel * tr.total_pembayaran) as 					nominal_potongan_channel, SUM(ti.potongan_cashback * tr.total_pembayaran) as nominal_potongan_cashback
            FROM transaction_mp tr
            LEFT JOIN transaction_import ti ON ti.reference_id = tr.reference_id
          GROUP BY tr.nama_penerima
        ) a
        ORDER BY total_akhir DESC`;
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
        const sql = `SELECT a.*, (a.payment_amount - (a.nominal_potongan_channel + a.nominal_potongan_kmdn + a.nominal_potongan_cashback)) as nominal_akhir  FROM (
            SELECT  tr.*, (tr.payment_amount * tr.potongan_channel) as nominal_potongan_channel , (tr.payment_amount * tr.potongan_kmdn) as nominal_potongan_kmdn, (tr.payment_amount * tr.potongan_cashback) as nominal_potongan_cashback  
            from transaction_import tr
            ) a
            ORDER BY a.payment_date ASC`;
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
        const sql = `SELECT a.*, (a.total_pembayaran - (a.nominal_potongan_kmdn + a.nominal_potongan_cashback + a.nominal_potongan_channel)) as total_akhir
        FROM(
                SELECT tr.*, (ti.potongan_kmdn * tr.total_pembayaran) as nominal_potongan_kmdn, (ti.potongan_channel * tr.						total_pembayaran) as 	nominal_potongan_channel, (ti.potongan_cashback * tr.total_pembayaran) as 							nominal_potongan_cashback
                FROM transaction_mp tr
                LEFT JOIN transaction_import ti ON ti.reference_id = tr.reference_id
            )a`;
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
        const sql = `SELECT a.*, (a.total_pembayaran - (a.nominal_potongan_kmdn + a.nominal_potongan_cashback + a.nominal_potongan_channel)) as total_akhir
        FROM(
                SELECT tr.*, (ti.potongan_kmdn * tr.total_pembayaran) as nominal_potongan_kmdn, (ti.potongan_channel * tr.						total_pembayaran) as 	nominal_potongan_channel, (ti.potongan_cashback * tr.total_pembayaran) as 							nominal_potongan_cashback
                FROM transaction_mp tr
                LEFT JOIN transaction_import ti ON ti.reference_id = tr.reference_id
                WHERE tr.channel = "${channel}" 
            )a`;
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

        var sql = `SELECT a.*, (a.payment_amount - (a.nominal_potongan_channel + a.nominal_potongan_kmdn + a.nominal_potongan_cashback)) as nominal_akhir  FROM (
        SELECT  tr.*, (tr.payment_amount * tr.potongan_channel) as nominal_potongan_channel , (tr.payment_amount * tr.potongan_kmdn) as nominal_potongan_kmdn, (tr.payment_amount * tr.potongan_cashback) as nominal_potongan_cashback  
        from transaction_import tr
        WHERE tr.channel = '${channel}'
        ) a
        ORDER BY a.payment_date ASC `;
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

exports.getDatabyrek = (nama_penerima, no_rekening_penerima, start_date, end_date) => {
    return new Promise(resolve => {
        const sql = `SELECT a.*, (a.total_pembayaran - (a.nominal_potongan_kmdn + a.nominal_potongan_cashback + a.nominal_potongan_channel)) as total_akhir
        FROM(
                SELECT tr.*, (ti.potongan_kmdn * tr.total_pembayaran) as nominal_potongan_kmdn, (ti.potongan_channel * tr.						total_pembayaran) as 	nominal_potongan_channel, (ti.potongan_cashback * tr.total_pembayaran) as 							nominal_potongan_cashback
                FROM transaction_mp tr
                LEFT JOIN transaction_import ti ON ti.reference_id = tr.reference_id
                WHERE ((tr.nama_penerima = "${nama_penerima}" AND tr.no_rekening_penerima = '${no_rekening_penerima}') AND (tr.isTransfer = "F" AND (tr.tgl_transaksi BETWEEN "${start_date}" AND 	"${end_date}")))
            )a`;
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

exports.getDatabyMasjidAndDate = (nama_penerima, start_date, end_date) => {
    return new Promise(resolve => {
        const sql = `SELECT a.*, (a.total_pembayaran - (a.nominal_potongan_kmdn + a.nominal_potongan_cashback + a.nominal_potongan_channel)) as total_akhir
        FROM(
                SELECT tr.*, (ti.potongan_kmdn * tr.total_pembayaran) as nominal_potongan_kmdn, (ti.potongan_channel * tr.						total_pembayaran) as 	nominal_potongan_channel, (ti.potongan_cashback * tr.total_pembayaran) as 							nominal_potongan_cashback
                FROM transaction_mp tr
                LEFT JOIN transaction_import ti ON ti.reference_id = tr.reference_id
                WHERE (tr.nama_penerima = "${nama_penerima}" AND (tr.isTransfer = "F" AND (tr.tgl_transaksi BETWEEN "${start_date}" AND 	"${end_date}")))
            )a`;
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

exports.getDatabyBank = (bank, start_date, end_date) => {
    return new Promise(resolve => {
        const sql = `SELECT a.*, (a.total_pembayaran - (a.nominal_potongan_kmdn + a.nominal_potongan_cashback + a.nominal_potongan_channel)) as total_akhir
        FROM(
                SELECT tr.*, (ti.potongan_kmdn * tr.total_pembayaran) as nominal_potongan_kmdn, (ti.potongan_channel * tr.total_pembayaran) as nominal_potongan_channel, (ti.potongan_cashback * tr.total_pembayaran) as 							nominal_potongan_cashback
                FROM transaction_mp tr
                LEFT JOIN transaction_import ti ON ti.reference_id = tr.reference_id
                WHERE (tr.bank_penerima = "${bank}" AND (tr.isTransfer = "F" AND (tr.tgl_transaksi BETWEEN "${start_date}" AND 	"${end_date}")))
            )a
        ORDER BY a.nama_penerima ASC`;
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

exports.getRekapMasjidByBank = (bank, start_date, end_date) => {
    return new Promise(resolve => {
        const sql = `SELECT a.* , (a.nominal_transaksi_awal - (a.nominal_potongan_kmdn + a.nominal_potongan_cashback + a.nominal_potongan_channel)) as total_akhir
        FROM(
            SELECT tr.receiver, tr.no_rekening_penerima, tr.nama_rekening_penerima, tr.nama_penerima, tr.bank_penerima, count(tr.bank_penerima) as jumlah_transaksi, SUM(tr.total_pembayaran) as nominal_transaksi_awal, SUM(ti.potongan_kmdn * tr.total_pembayaran) as nominal_potongan_kmdn, SUM(ti.potongan_channel * tr.total_pembayaran) as 			nominal_potongan_channel, SUM(ti.potongan_cashback * tr.total_pembayaran) as nominal_potongan_cashback
            FROM transaction_mp tr
            LEFT JOIN transaction_import ti ON ti.reference_id = tr.reference_id
            WHERE (tr.bank_penerima = "${bank}" AND (tr.isTransfer = "F" AND (tr.tgl_transaksi BETWEEN "${start_date}" AND 	"${end_date}")))
          GROUP BY tr.nama_penerima
        ) a
        ORDER BY a.nama_penerima ASC`;
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