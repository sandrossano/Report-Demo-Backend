const mysql = require("mysql");

const db = mysql.createConnection({
  host: "", //cambiare per test,
  user: "pikachu1",
  password: "pikachu1",
  database: "pika"
});

module.exports = db;
