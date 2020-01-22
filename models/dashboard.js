const mysqlCon = require('./mysqlCon');

exports.getalldata = () => {
    return new Promise(resolve => {
        var sql = `SELECT a.*, a.Total_Nominal_Seluruh_Transaksi - (a.Total_Nominal_Potongan_Channel + a.Total_Nominal_Potongan_KMDN + a.Total_Rejeki_Poin) as Total_Seluruh_Nominal_Akhir
        FROM(
            SELECT "all" as Channel, COUNT(*) as Total_Seluruh_Transaksi, SUM(ti.payment_amount) as Total_Nominal_Seluruh_Transaksi, SUM(ti.payment_amount * ti.potongan_kmdn) as Total_Nominal_Potongan_KMDN, SUM(ti.payment_amount * ti.potongan_channel) as Total_Nominal_Potongan_Channel, SUM(ti.payment_amount * ti.potongan_cashback) as Total_Rejeki_Poin
        FROM transaction_import ti 
        )a`;
        mysqlCon.query(sql, function (error, rows, fields) {
            if (error) {
                console.log(error);
            }
            resolve(rows[0]);
        });
    });
}

exports.getToplistby = type => {
    return new Promise(resolve => {
        if(type === "masjid"){
            var sql = `SELECT 
            a.* , 
            (a.nominal_transaksi_awal - (a.nominal_potongan_kmdn + a.nominal_potongan_cashback + a.nominal_potongan_channel)) as total_akhir
            FROM(
                SELECT 
                    tr.receiver, 
                    tr.no_rekening_penerima, 
                    tr.nama_rekening_penerima, 
                    tr.nama_penerima, 
                    tr.bank_penerima, 
                    count(tr.receiver) as jumlah_transaksi, 
                    SUM(tr.total_pembayaran) as nominal_transaksi_awal, 
                    SUM(ti.potongan_kmdn*tr.total_pembayaran) as nominal_potongan_kmdn, 
                    SUM(ti.potongan_channel * tr.total_pembayaran) as nominal_potongan_channel, 
                    SUM(ti.potongan_cashback * tr.total_pembayaran) as nominal_potongan_cashback
                FROM transaction_mp tr
                LEFT JOIN transaction_import ti ON ti.reference_id = tr.reference_id
              GROUP BY tr.receiver
            ) a
            ORDER BY total_akhir DESC
            LIMIT 5;`
        }else if(type === "user"){
            var sql = `SELECT 
            a.* , 
            (a.nominal_transaksi_awal - (a.nominal_potongan_kmdn + a.nominal_potongan_cashback + a.nominal_potongan_channel)) as total_akhir
            FROM(
                SELECT 
                    tr.sender, 
                    count(tr.sender) as jumlah_transaksi, 
                    SUM(tr.total_pembayaran) as nominal_transaksi_awal, 
                    SUM(ti.potongan_kmdn*tr.total_pembayaran) as nominal_potongan_kmdn, 
                    SUM(ti.potongan_channel * tr.total_pembayaran) as nominal_potongan_channel, 
                    SUM(ti.potongan_cashback * tr.total_pembayaran) as nominal_potongan_cashback
                FROM transaction_mp tr
                LEFT JOIN transaction_import ti ON ti.reference_id = tr.reference_id
              GROUP BY tr.sender
            ) a
            ORDER BY total_akhir DESC
            LIMIT 5;`
        }
        
        mysqlCon.query(sql, function (error, rows, fields) {
            if (error) {
                console.log(error);
            }
            resolve(rows);
        });
    });
}

exports.getalldatabychannel = channel => {
    return new Promise(resolve => {
        var sql = `SELECT a.*, IFNULL((a.Total_Nominal_Seluruh_Transaksi - (a.Total_Nominal_Potongan_Channel + a.Total_Nominal_Potongan_KMDN + a.Total_Rejeki_Poin)),0) as Total_Seluruh_Nominal_Akhir
        FROM(
            SELECT "${channel}" as Channel, COUNT(*) as Total_Seluruh_Transaksi, IFNULL(SUM(ti.payment_amount),0) as Total_Nominal_Seluruh_Transaksi, IFNULL(SUM(ti.payment_amount * ti.potongan_kmdn),0) as Total_Nominal_Potongan_KMDN, IFNULL(SUM(ti.payment_amount * ti.potongan_channel),0) as Total_Nominal_Potongan_Channel, IFNULL(SUM(ti.payment_amount * ti.potongan_cashback),0) as Total_Rejeki_Poin
        FROM transaction_import ti 
        WHERE ti.channel = "${channel}"
        )a`;
        mysqlCon.query(sql, function (error, rows, fields) {
            if (error) {
                console.log(error);
            }
            resolve(rows[0]);
        });
    });
}