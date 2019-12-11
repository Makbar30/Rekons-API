const mysqlCon = require('./mysqlCon')

exports.updateExistingRekons = data => {
    return new Promise(resolve => {
        var sql = `UPDATE transaction_mp
        SET no_rekening_penerima = ${data.no_rek} , nama_rekening_penerima = '${data.nama_pemilik_rek}', bank_penerima = '${data.nama_bank}', updated_at = NOW()
        WHERE id = ${data.id_data} AND channel = '${data.channel}' `;
        mysqlCon.query(sql, function (error, rows, fields) {
            if (error) {
                console.log(error)
                throw error;
            }
            resolve(rows);
        });
    });
}

exports.getDetail = id => {
    return new Promise(resolve => {
        const sql = `SELECT *
        FROM transaction_mp tr
        WHERE tr.id = ${id} `;
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

exports.updateTransferStat = id => {
    return new Promise(resolve => {
        const sql = `UPDATE transaction_mp
        SET isTransfer = "T" , transfered_at = NOW()
        WHERE id = ${id}`;
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

exports.updateExportStat = data => {
    return new Promise(resolve => {
        const sql = `UPDATE transaction_mp
        SET isTransfer = "T" , transfered_at = NOW()
        WHERE nama_penerima = '${data.nama_penerima}' AND no_rekening_penerima = '${data.no_rekening_penerima}'` ;
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

