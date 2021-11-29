const express = require("express");
const db = require("./config/db");
const cors = require("cors");
const crypto = require("crypto");
const app = express();
const PORT = process.env.PORT || 5000;
var tmp = require("tmp");
var fs = require("fs");

app.use(cors());
app.use(express.json());

const querydata = "SELECT *" + " FROM pika_test";
// Route to get all posts
app.get("/api/getdata", (req, res) => {
  const id = req.params.id;
  db.query(querydata, id, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

app.get("/api/getusers", (req, res) => {
  db.query(
    `SELECT user.id, user.email as input, ` +
      `JSON_ARRAYAGG(roles.name) AS permissionName` +
      " FROM t_users as user " +
      "INNER JOIN t_users_roles_link as link ON link.id_user = user.id " +
      "INNER JOIN t_roles as roles ON roles.id = link.id_role " +
      "GROUP BY user.id ORDER BY user.id",
    [],
    (err, result) => {
      if (err) {
        console.log(err);
      }

      res.send(result);
    }
  );
});

// Route to get one post
app.get("/api/login/:id~:psw", (req, res) => {
  const id = req.params.id;
  const password = crypto
    .createHash("md5")
    .update(req.params.psw)
    .digest("hex");
  db.query(
    "SELECT * FROM t_users WHERE email = ? AND password = ? ",
    [id, password],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    }
  );
});

app.get("/", (req, res) => {
  var text = "Backend Timesheet: <p>/api/getdata</p>";
  text += "<p>/api/login/:id~:psw</p>";
  text += "<p>/api/getusers</p>";
  res.send(text);
});

app.listen(PORT, () => {
  console.log("Server is running on" + PORT);
});
