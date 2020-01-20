const mysqlCon = require('./mysqlCon');

exports.insertImportDanapay = (values, ptg_kmdn, ptg_user, ptg_channel) => {
    return new Promise(resolve => {
        var total_nominal_akhir = (parseInt(values[8])*0.01) - (parseInt(values[8]) * (ptg_kmdn + ptg_user + ptg_channel)) *0.01;
        var bill_no = values[4]
        var sql = `INSERT INTO transaction_import ( channel , transaction_id , bill_no , reference_id , 
            transaction_date , payment_date , amount , payment_amount , status, isSame, imported_at, updated_at,
            potongan_channel, potongan_cashback, potongan_kmdn,
            total_akhir, customer)
        SELECT * FROM (SELECT 'DANA' as channel , '${values[4]}' as transaction_id , ${bill_no.substr(bill_no.length - 3)} as bill_no , 
        '${values[4]}' as reference_id , CAST('${values[10]}' AS datetime) as transaction_date,  
        CAST('${values[10]}' AS datetime) as payment_date , ${parseInt(values[8])*0.01} as amount , ${parseInt(values[8])*0.01} as payment_amount, 
       'SUCCESS' as status , 0 as isSame, NOW() as imported_at, NOW() as updated_at,
       ${ptg_channel} as potongan_channel, ${ptg_user} as potongan_cashback, ${ptg_kmdn} as potongan_kmdn,
       ${total_nominal_akhir} as total_akhir,'${values[7]}' as customer ) AS tmp
        WHERE NOT EXISTS (
        SELECT transaction_id FROM transaction_import WHERE transaction_id = '${values[4]}' AND channel = 'DANA'
        ) LIMIT 1`;
        mysqlCon.query(sql, function (error, rows, fields) {
            if (error) {
                console.log(error);
            }
            resolve(rows);
        });
    });
}

exports.insertdataMPDANA = data => {
    return new Promise(resolve => {
        var trx_id = data.acquirementId
        var sql = `INSERT INTO transaction_mp (  bill_no, sender , receiver , channel ,   
            transaction_id , tgl_transaksi , tgl_pembayaran , total_amount , total_pembayaran,
           nama_penerima ,  bank_penerima , no_rekening_penerima, nama_rekening_penerima, status, isTransfer,
           imported_at, updated_at, transfered_at, reference_id)
        SELECT * 
        FROM (
            SELECT  ${trx_id.substr(trx_id.length - 3)} as bill_no, '${data.username_pengirim_dana}' as sender , 
            '${data.username_penerima_dana}' as receiver , 'dana' as channel , 
            '${data.acquirementId}' as transaction_id , CAST('${data.paydate}' AS datetime) as tgl_transaksi ,
            CAST('${data.paydate}' AS datetime) as tgl_pembayaran  , 
            ${parseInt(data.amount)} as total_amount , ${parseInt(data.amount)} as total_pembayaran,
         "${data.masjid_nama}" as nama_penerima , '${data.bank_nama}' as bank_penerima , 
         '${data.masjid_no_rekening}' as no_rekening_penerima , "${data.masjid_pemilik_rekening}" as nama_rekening_penerima, 
         '${data.acquirementStatus}' as status, "F" as isTransfer, NOW() as imported_at, '' as updated_at, '' as transfered_at,
        '${data.acquirementId}' as reference_id ) AS tmp
        WHERE NOT EXISTS (
        SELECT transaction_id 
        FROM transaction_mp 
        WHERE transaction_id = '${data.trx_id}' AND channel = 'dana'
        ) 
        LIMIT 1`;
        mysqlCon.query(sql, function (error, rows, fields) {
            if (error) {
                console.log(error);
            }
            resolve(rows);
        });
    });
}

exports.updateDataDanapay = values => {
    return new Promise(resolve => {
        var sql = `UPDATE transaction_import 
        SET isSame = 1 , updated_at = NOW()
        WHERE (transaction_id =  '${values}' AND channel = 'DANA') AND isSame = 0`;
        mysqlCon.query(sql, function (error, rows, fields) {
            if (error) {
                console.log(error);
            }
            resolve(rows);
        });
    });
}

