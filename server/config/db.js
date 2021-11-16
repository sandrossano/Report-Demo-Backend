const mysql = require("mysql");

const db = mysql.createConnection({
  host: "db-demo.cghmbrpjvqls.eu-central-1.rds.amazonaws.com", //cambiare per test,
  user: "pikachu1",
  password: "pikachu1",
  database: "pika"
});

module.exports = db;
