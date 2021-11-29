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

const queryroles = "SELECT name" + " FROM t_roles";
// Route to get all posts
app.get("/api/getroleslist", (req, res) => {
  const id = req.params.id;
  db.query(queryroles, id, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

const queryapp = "SELECT name" + " FROM t_app";
// Route to get all posts
app.get("/api/getapplist", (req, res) => {
  const id = req.params.id;
  db.query(queryapp, id, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

app.get("/api/getusers", (req, res) => {
  db.query(
    `SELECT user.id, user.email as input, user.password as psw, ` +
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

app.get("/api/getroles", (req, res) => {
  db.query(
    `SELECT roles.id, roles.name as input, ` +
      `JSON_ARRAYAGG(app.name) AS permissionName` +
      " FROM t_roles as roles " +
      "INNER JOIN t_roles_app_link as link ON link.id_role = roles.id " +
      "INNER JOIN t_app as app ON app.id = link.id_app " +
      "GROUP BY roles.id ORDER BY roles.id",
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

app.get("/api/deleteuser/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM t_users WHERE id = ? ", [id], (err, result) => {
    if (err) {
      console.log(err);
    }
    db.query(
      "DELETE FROM t_users_roles_link WHERE id_user = ? ",
      [id],
      (err, result) => {
        res.send(result);
      }
    );
  });
});

app.get("/api/deleterole/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM t_roles WHERE id = ? ", [id], (err, result) => {
    if (err) {
      console.log(err);
    }
    db.query(
      "DELETE FROM t_users_roles_link WHERE id_role = ? ",
      [id],
      (err, result) => {
        db.query(
          "DELETE FROM t_roles_app_link WHERE id_role = ? ",
          [id],
          (err, result) => {
            res.send(result);
          }
        );
      }
    );
  });
});

app.get("/api/createuser/:id~:email~:psw~:arrayroles", (req, res) => {
  const id = req.params.id;
  const email = req.params.email;
  const psw = req.params.psw;
  var array = req.params.arrayroles.split(",");
  for (var j = 0; j < array.length; j++) {
    array[j] = array[j].replace(/['"]+/g, "").trim();
    array[j] = array[j].replace(/['[]+/g, "").trim();
    array[j] = array[j].replace(/(])+/g, "").trim();
  }
  db.query(
    "INSERT INTO t_users (`id`, `email`, `password`) VALUES (?, ?, ?)",
    [id, email, psw],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      for (var i = 0; i < array.length; i++) {
        db.query(
          "INSERT INTO t_users_roles_link (`id_user`, `id_role`)" +
            " VALUES (?, (SELECT id FROM t_roles WHERE name = ? ) )",
          [id, array[i]],
          (err, result) => {
            if (err) {
              console.log(err.sqlMessage);
              console.log(err.sql);
            }
          }
        );
      }
    }
  );
});

app.get("/api/createrole/:id~:email~:arrayroles", (req, res) => {
  const id = req.params.id;
  const email = req.params.email;
  var array = req.params.arrayroles.split(",");
  for (var j = 0; j < array.length; j++) {
    array[j] = array[j].replace(/['"]+/g, "").trim();
    array[j] = array[j].replace(/['[]+/g, "").trim();
    array[j] = array[j].replace(/(])+/g, "").trim();
  }
  db.query(
    "INSERT INTO t_roles (`id`, `name`) VALUES (?, ?)",
    [id, email],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      for (var i = 0; i < array.length; i++) {
        db.query(
          "INSERT INTO t_roles_app_link (`id_role`, `id_app`)" +
            " VALUES (?, (SELECT id FROM t_app WHERE name = ? ) )",
          [id, array[i]],
          (err, result) => {
            if (err) {
              console.log(err.sqlMessage);
              console.log(err.sql);
            }
          }
        );
      }
    }
  );
});

app.get("/api/edituser/:id~:email~:psw~:arrayroles", (req, res) => {
  const id = req.params.id;
  const email = req.params.email;
  const psw = req.params.psw;
  var array = req.params.arrayroles.split(",");
  for (var j = 0; j < array.length; j++) {
    array[j] = array[j].replace(/['"]+/g, "").trim();
    array[j] = array[j].replace(/['[]+/g, "").trim();
    array[j] = array[j].replace(/(])+/g, "").trim();
  }

  db.query("DELETE FROM t_users WHERE id = ? ", [id], (err, result) => {
    if (err) {
      console.log(err);
    }
    db.query(
      "DELETE FROM t_users_roles_link WHERE id_user = ? ",
      [id],
      (err, result) => {
        db.query(
          "INSERT INTO t_users (`id`, `email`, `password`) VALUES (?, ?, ?)",
          [id, email, psw],
          (err, result) => {
            if (err) {
              console.log(err);
            }
            for (var i = 0; i < array.length; i++) {
              db.query(
                "INSERT INTO t_users_roles_link (`id_user`, `id_role`)" +
                  " VALUES (?, (SELECT id FROM t_roles WHERE name = ? ) )",
                [id, array[i]],
                (err, result) => {
                  if (err) {
                    console.log(err.sqlMessage);
                    console.log(err.sql);
                  }
                }
              );
            }
          }
        );
      }
    );
  });
});

app.get("/api/editrole/:id~:email~:arrayroles", (req, res) => {
  const id = req.params.id;
  const email = req.params.email;
  var array = req.params.arrayroles.split(",");
  for (var j = 0; j < array.length; j++) {
    array[j] = array[j].replace(/['"]+/g, "").trim();
    array[j] = array[j].replace(/['[]+/g, "").trim();
    array[j] = array[j].replace(/(])+/g, "").trim();
  }

  db.query("DELETE FROM t_roles WHERE id = ? ", [id], (err, result) => {
    if (err) {
      console.log(err);
    }
    db.query(
      "DELETE FROM t_users_roles_link WHERE id_role = ? ",
      [id],
      (err, result) => {
        db.query(
          "DELETE FROM t_roles_app_link WHERE id_role = ? ",
          [id],
          (err, result) => {
            db.query(
              "INSERT INTO t_roles (`id`, `name`) VALUES (?, ?)",
              [id, email],
              (err, result) => {
                if (err) {
                  console.log(err);
                }
                for (var i = 0; i < array.length; i++) {
                  db.query(
                    "INSERT INTO t_roles_app_link (`id_user`, `id_role`)" +
                      " VALUES (?, (SELECT id FROM t_app WHERE name = ? ) )",
                    [id, array[i]],
                    (err, result) => {
                      if (err) {
                        console.log(err.sqlMessage);
                        console.log(err.sql);
                      }
                    }
                  );
                }
              }
            );
          }
        );
      }
    );
  });
});

app.get("/", (req, res) => {
  var text = "Backend Timesheet: <p>/api/getdata</p>";
  text += "<p>/api/login/:id~:psw</p>";
  text += "<p>/api/getusers</p>";
  text += "<p>/api/getroles</p>";
  text += "<p>/api/getroleslist</p>";
  text += "<p>/api/getapplist</p>";
  text += "<p>/api/deleteuser/:id</p>";
  text += "<p>/api/deleterole/:id</p>";
  text += '<p>/api/createuser/:id~:email~:psw~["Ruolo1","Ruolo3"]</p>';
  text += "<p>/api/createrole/:id~:email~:arrayroles</p>";
  text += '<p>/api/edituser/:id~:email~:psw~["Ruolo1","Ruolo3"]</p>';
  text += "<p>/api/editrole/:id~:email~:arrayroles</p>";
  //text += '<p>/api/createlink_user/:id~["Ruolo1","Ruolo3"]';
  res.send(text);
});

app.listen(PORT, () => {
  console.log("Server is running on" + PORT);
});
