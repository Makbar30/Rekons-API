const mysqlCon = require('./mysqlCon');

exports.insertImportGopay = values => {
    return new Promise(resolve => {
        var sql = `INSERT INTO transaction_import ( channel , transaction_id , bill_no , reference_id , transaction_date , 
            payment_date , amount , payment_amount ,
            status, isSame , imported_at, updated_at)
        SELECT * FROM (SELECT  '${values[2]}' as channel , '${values[5].replace("'","")}' as transaction_id ,
        ${parseInt(values[1].replace("'",""))} as bill_no , '${values[5].replace("'","")}' as reference_id , 
        CAST('${values[7]}' AS datetime) as transaction_date,  
        CAST('${values[8]}' AS datetime) as payment_date , ${parseInt(values[4])} as amount ,
        ${parseInt(values[4])} as payment_amount, '${values[6]}' as status , 0 as isSame, NOW() as imported_at, NOW() as updated_at) AS tmp
        WHERE NOT EXISTS (
        SELECT transaction_id FROM transaction_import WHERE transaction_id = '${values[5].replace("'","")}' AND channel = 'GO-PAY'
        ) LIMIT 1`;
        mysqlCon.query(sql, function (error, rows, fields) {
            if (error) {
                console.log(error);
            }
            resolve(rows);
        });
    });
}

exports.insertdataMPGOPAY = (data, ptg_kmdn, ptg_user, ptg_channel) => {
    return new Promise(resolve => {
        var total_nominal_akhir = data.gross_amount - (data.gross_amount * (ptg_kmdn + ptg_user + ptg_channel));
        var sql = `INSERT INTO transaction_mp ( bill_no, sender , receiver , channel ,   
            transaction_id , tgl_transaksi , tgl_pembayaran , total_amount , total_pembayaran,
           nama_penerima ,  bank_penerima , no_rekening_penerima, nama_rekening_penerima, status, isTransfer, imported_at, updated_at,
           transfered_at, isExport, potongan_kmdn, potongan_channel, potongan_cashback, total_akhir, reference_id)
        SELECT * 
        FROM (
            SELECT  ${parseInt(data.order_id)} as bill_no, '${data.username_pengirim_gopay}' as sender , '${data.username_penerima_gopay}' as receiver , 'gopay' as channel , '${data.transaction_id}' as transaction_id , CAST('${data.transaction_time}' AS datetime) as tgl_transaksi ,
            CAST('${data.transaction_time}' AS datetime) as tgl_pembayaran  , ${parseInt(data.gross_amount)} as total_amount , ${parseInt(data.gross_amount)} as total_pembayaran,
         "${data.masjid_nama}" as nama_penerima , '${data.bank_nama}' as bank_penerima , '${data.masjid_no_rekening}' as no_rekening_penerima , "${data.masjid_pemilik_rekening}" as nama_rekening_penerima, 
         '${data.transaction_status}' as status, "F" as isTransfer, NOW() as imported_at, '' as updated_at, '' as transfered_at,
         "F" as isExport,${ptg_kmdn} as potongan_kmdn,${ptg_channel} as potongan_channel, ${ptg_user} as potongan_cashback,
         ${total_nominal_akhir} as total_akhir, '${data.transaction_id}' as reference_id) AS tmp
        WHERE NOT EXISTS (
        SELECT transaction_id 
        FROM transaction_mp 
        WHERE transaction_id = '${data.transaction_id}' AND channel = 'gopay'
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

exports.updateDataGopay = values => {
    return new Promise(resolve => {
        var sql = `UPDATE transaction_import 
        SET isSame = 1 , updated_at = NOW()
        WHERE (bill_no = ${values} AND channel = 'GO-PAY') AND isSame = 0`;
        mysqlCon.query(sql, function (error, rows, fields) {
            if (error) {
                console.log(error);
            }
            resolve(rows);
        });
    });
}

