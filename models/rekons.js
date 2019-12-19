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
        const sql = `SELECT a.*, (a.total_pembayaran - (a.nominal_potongan_kmdn + a.nominal_potongan_cashback + a.nominal_potongan_channel)) as total_akhir
        FROM(
                SELECT tr.*, (ti.potongan_kmdn * tr.total_pembayaran) as nominal_potongan_kmdn, (ti.potongan_channel * tr.						total_pembayaran) as 	nominal_potongan_channel, (ti.potongan_cashback * tr.total_pembayaran) as 							nominal_potongan_cashback, ti.potongan_channel, ti.potongan_kmdn, ti.potongan_cashback
                FROM transaction_mp tr
                LEFT JOIN transaction_import ti ON ti.reference_id = tr.reference_id
                WHERE tr.id = ${id}
            )a `;
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

