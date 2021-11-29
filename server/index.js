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
  res.send(text);
});

app.listen(PORT, () => {
  console.log("Server is running on" + PORT);
});
