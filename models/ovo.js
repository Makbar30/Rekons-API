const mysqlCon = require('./mysqlCon');

exports.insertImportFaspay = values => {
    return new Promise(resolve => {
        var sql = `INSERT INTO transaction_import ( channel , transaction_id , bill_no , reference_id , transaction_date , 
            payment_date , amount , payment_amount ,
            status, isSame , imported_at, updated_at)
        SELECT * FROM (SELECT  '${values[4]}' as channel , '${values[5]}' as transaction_id ,
        ${parseInt(values[6])} as bill_no , '${values[7]}' as reference_id , 
        CAST('${values[11]}' AS datetime) as transaction_date,  
        CAST('${values[12]}' AS datetime) as payment_date , ${parseInt(values[13])} as amount ,
        ${parseInt(values[14])} as payment_amount, '${values[15]}' as status , 0 as isSame, NOW() as imported_at, NOW() as updated_at) AS tmp
        WHERE NOT EXISTS (
        SELECT transaction_id FROM transaction_import WHERE transaction_id = '${values[5]}' AND channel = 'OVO'
        ) LIMIT 1`;
        mysqlCon.query(sql, function (error, rows, fields) {
            if (error) {
                console.log(error);
            }
            resolve(rows);
        });
    });
}

exports.insertdataMPOVO = (data, ptg_kmdn, ptg_user, ptg_channel) => {
    return new Promise(resolve => {
        var total_nominal_akhir = data.payment_total - (data.payment_total * (ptg_kmdn + ptg_user + ptg_channel));
        var sql = `INSERT INTO transaction_mp ( bill_no, sender , receiver , channel ,   
            transaction_id , tgl_transaksi , tgl_pembayaran , total_amount , total_pembayaran,
           nama_penerima ,  bank_penerima , no_rekening_penerima, nama_rekening_penerima, status, isTransfer, imported_at, updated_at,
           transfered_at, isExport, potongan_kmdn, potongan_channel, potongan_cashback, total_akhir, reference_id)
        SELECT * 
        FROM (
            SELECT  ${parseInt(data.bill_reff)} as bill_no, '${data.username_pengirim_ovo}' as sender , '${data.username_penerima_ovo}' as receiver , 'ovo' as channel , '${data.trx_id}' as transaction_id , CAST('${data.bill_date}' AS datetime) as tgl_transaksi ,
            CAST('${data.payment_date}' AS datetime) as tgl_pembayaran  , ${parseInt(data.bill_total)} as total_amount , ${parseInt(data.payment_total)} as total_pembayaran,
         "${data.masjid_nama}" as nama_penerima , '${data.bank_nama}' as bank_penerima , '${data.masjid_no_rekening}' as no_rekening_penerima , "${data.masjid_pemilik_rekening}" as nama_rekening_penerima, 
         '${data.payment_status_desc}' as status, "F" as isTransfer, NOW() as imported_at, '' as updated_at, '' as transfered_at,
         "F" as isExport,${ptg_kmdn} as potongan_kmdn,${ptg_channel} as potongan_channel, ${ptg_user} as potongan_cashback,
         ${total_nominal_akhir} as total_akhir, '${data.payment_reff}' as reference_id) AS tmp
        WHERE NOT EXISTS (
        SELECT transaction_id 
        FROM transaction_mp 
        WHERE transaction_id = '${data.trx_id}' AND channel = 'ovo'
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

exports.updateDataFaspay = values => {
    return new Promise(resolve => {
        var sql = `UPDATE transaction_import 
        SET isSame = 1 , updated_at = NOW()
        WHERE (bill_no = ${values} AND channel = 'OVO') AND isSame = 0`;
        mysqlCon.query(sql, function (error, rows, fields) {
            if (error) {
                console.log(error);
            }
            resolve(rows);
        });
    });
}

