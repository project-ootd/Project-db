import axios from "axios";
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const port = 4000;
const pool = mysql.createPool({
  host: "localhost",
  user: "sbsst",
  password: "sbs123414",
  database: "sellitems",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get("/Test1", async (req, res) => {
  const { id, itemname, price } = req.params;
  const [rows] = await pool.query(`SELECT * FROM items`, [id, itemname, price]);

  res.json(rows);
});

app.get("/Login", async (req, res) => {
  const [log] = await pool.query(`SELECT * FROM Logintable`);

  res.json(log);
});

app.patch("/Item", async (req, res) => {
  const { id, itemname, price } = req.params;

  const [[item]] = await pool.query(
    `
    SELECT * FROM items
    `,
    [id, itemname, price]
  );
  res.json(item);
});
app.get("/Test1", async (req, res) => {
  const [rows] = await pool.query(
    `
  SELECT *
  FROM Logintable 
  `
  );

  res.json(rows);
});

app.get("/test1", async (req, res) => {
  const [rows] = await pool.query(
    `
  SELECT *
  FROM Logintable 
  `
  );

  res.json(rows);
});

app.post("/test1/doLogin", async (req, res) => {
  const {
    body: { id, pw },
  } = req;

  const [[userRow]] = await pool.query(
    `
  SELECT *
  FROM Logintable
  WHERE id = ?
  AND
  pw = ?
  `,
    [id, pw]
  );
  // console.log(userRow);
  if (userRow) {
    return res.send(true);
  }
  res.send(false);
});

app.get("/test1/login", async (req, res) => {
  console.log(req.body);
  // const [rows] = await pool.query(
  //   `
  // SELECT *
  // FROM user
  // WHERE id = ?
  // AND
  // pw = ?
  // `,
  //   [id, pw]
  // );
  // // {
  // //   rows ? res.json(true) : res.json(false);
  // // }
  // console.log(rows);
  // if (rows.length === 0) {
  //   res.json(false);
  // } else if (rows.length !== 0) {
  //   res.json(true);
  // }
  // res.json(rows);
  // if (res.json) {
  //   res.json(true);
  // } else if (!res.json) {
  //   res.json(false);
  // }
  res.send("login");
});

app.post("/test1", async (req, res) => {
  const {
    body: { id, pw, name },
  } = req;

  // console.log(id, pw, name);
  // const { text } = req.body;

  const [row] = await pool.query(
    `
    INSERT INTO Logintable
    SET id = ?,
    pw = ?,
    name = ?
    `,
    [id, pw, name]
  );

  const [rows] = await pool.query(`
    SELECT *
    FROM Logintable
    `);

  res.json(rows);
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
