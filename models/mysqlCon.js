var mysql = require('mysql');

//- Connection configuration
var con  = mysql.createPool({
  connectionLimit : 10,
  host: "localhost",
  port: "3306",
  user: "root",
  password: "muslimpocket2019!@#",
  database: "rekonsiliasi_dev",
  multipleStatements: true
});


module.exports = con;