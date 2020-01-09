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