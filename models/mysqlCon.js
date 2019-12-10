var mysql = require('mysql');

//- Connection configuration
var con  = mysql.createPool({
  connectionLimit : 10,
  host: "localhost",
  port: "3306",
  user: "root",
  password: "",
  database: "rekons_dev",
  multipleStatements: true
});


module.exports = con;