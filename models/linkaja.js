const mysqlCon = require('./mysqlCon');

exports.insertImportLinkaja = (values, payment_date, transaction_date, ptg_kmdn, ptg_user, ptg_channel) => {
    return new Promise(resolve => {
        var total_nominal_akhir = parseInt(values[7]) - (parseInt(values[7]) * (ptg_kmdn + ptg_user + ptg_channel));
        var sql = `INSERT INTO transaction_import ( channel , transaction_id , bill_no , reference_id , 
            transaction_date , payment_date , amount , payment_amount , status, isSame, imported_at, updated_at,
            potongan_channel, potongan_cashback, potongan_kmdn,
            total_akhir, customer)
        SELECT * 
        FROM (SELECT  'LINKAJA' as channel , '${values[1]}' as transaction_id , 0 as bill_no , 
        '${values[1]}' as reference_id , CAST('${transaction_date}' AS datetime) as transaction_date,  
        CAST('${payment_date}' AS datetime) as payment_date , ${parseInt(values[7])} as amount , ${parseInt(values[7])} as payment_amount, 
       '${values[5]}' as status , 0 as isSame, NOW() as imported_at, NOW() as updated_at,
       ${ptg_channel} as potongan_channel, ${ptg_user} as potongan_cashback, ${ptg_kmdn} as potongan_kmdn,
       ${total_nominal_akhir} as total_akhir,'${values[11]}' as customer ) AS tmp
        WHERE NOT EXISTS (
        SELECT transaction_id 
        FROM transaction_import 
        WHERE transaction_id = '${values[1]}' AND channel = 'LINKAJA' 
        ) LIMIT 1`
        mysqlCon.query(sql, function (error, rows, fields) {
            if (error) {
                console.log(error);
            }
            resolve(rows)
        })
    });
}

exports.insertdataMPLinkAja = (values, data, transaction_date) => {
    return new Promise(resolve => {
        var sql = ` 
        INSERT INTO transaction_mp ( bill_no, sender , receiver , channel ,   
            transaction_id , tgl_transaksi , tgl_pembayaran , total_amount , total_pembayaran,
           nama_penerima ,  bank_penerima , no_rekening_penerima, nama_rekening_penerima, status, isTransfer,
           imported_at, updated_at, transfered_at, reference_id)
        SELECT * 
        FROM (
            SELECT  ${parseInt(data.trxId)} as bill_no, '${data.username_pengirim_linkaja}' as sender , 
            '${data.username_penerima_linkaja}' as receiver , 'linkaja' as channel , 
            '${values[1]}' as transaction_id , CAST('${transaction_date}' AS datetime) as tgl_transaksi ,
            CAST('${data.transactionDate}' AS datetime) as tgl_pembayaran  , 
            ${parseInt(data.amount)} as total_amount , ${parseInt(data.amount)} as total_pembayaran,
         "${data.masjid_nama}" as nama_penerima , '${data.bank_nama}' as bank_penerima , 
         '${data.masjid_no_rekening}' as no_rekening_penerima , "${data.masjid_pemilik_rekening}" as nama_rekening_penerima, 
         '${data.status}' as status, "F" as isTransfer, NOW() as imported_at, '' as updated_at, '' as transfered_at,
        '${data.refNum}' as reference_id) AS tmp
        WHERE NOT EXISTS (
        SELECT transaction_id 
        FROM transaction_mp 
        WHERE bill_no = ${parseInt(data.trxId)} AND channel = 'linkaja'
        ) 
        LIMIT 1`
        mysqlCon.query(sql, function (error, rows, fields) {
            if (error) {
                console.log(error);
            }

            resolve(rows)
        })
    });
}

exports.updateDataLinkaja = (data, payment_date) => {
    return new Promise(resolve => {
        var sql = `UPDATE transaction_import 
        SET isSame = 1, reference_id = '${data.refNum}', updated_at = NOW(), bill_no = ${data.trxId} 
        WHERE (payment_date = CAST('${payment_date}' AS datetime) AND channel = 'LINKAJA') AND isSame = 0`
        mysqlCon.query(sql, function (error, rows, fields) {
            if (error) {
                console.log(error);
            }
            resolve(rows)
        })
    });
}

