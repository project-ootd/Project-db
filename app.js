import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 4000;
const pool = mysql.createPool({
  host: "localhost",
  user: "sbsst",
  password: "sbs123414",
  database: "team",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get("/test1", async (req, res) => {
  const [rows] = await pool.query(
    `
  SELECT *
  FROM user 
  `
  );

  res.json(rows);
});

app.get("/test2", async (req, res) => {
  const [rows] = await pool.query(
    `
    SELECT * FROM product
    
  `
  );

  res.json(rows);
});

app.get("/KGDP", async (req, res) => {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM product
    WHERE category LIKE 'K%'
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
  FROM user
  WHERE id = ?
  AND
  pw = ?
  `,
    [id, pw]
  );
  console.log(userRow);
  if (userRow) {
    return res.send(true);
  }
  res.send(false);
});

app.post("/test1", async (req, res) => {
  const {
    body: { id, pw, name },
  } = req;

  // console.log(id, pw, name);
  // const { text } = req.body;

  const [row] = await pool.query(
    `
    INSERT INTO user
    SET id = ?,
    pw = ?,
    name = ?
    `,
    [id, pw, name]
  );

  const [rows] = await pool.query(`
    SELECT *
    FROM user
    `);

  res.json(rows);
});
app.post("/prdlist", async (req, res) => {
  const {
    body: { prdno },
  } = req;
  // console.log("prdno", prdno);
  var like = "%" + prdno + "%";
  console.log("like", like);

  const [prdRow] = await pool.query(
    `
    SELECT *
    FROM product 
    WHERE category LIKE ?;
  `,
    [like]
  );
  // console.log("prdRow", prdRow);

  res.json(prdRow);
  console.log(prdRow);
  // res.send([prdRow]);
});

app.post("/product", async (req, res) => {
  const {
    body: { prdId },
  } = req;
  console.log("prdId", prdId);

  const [[prdRow]] = await pool.query(
    `
  SELECT *
  FROM product
  WHERE prdId = ?
  `,
    [prdId]
  );

  res.json(prdRow);
  // res.send([prdRow]);
});
app.post("/SearchPage", async (req, res) => {
  // const [prdRow] = await pool.query(
  //   `
  //   SELECT *
  //   FROM product

  //   `,
  //   [prdName]
  // );
  const {
    body: { search },
  } = req;
  var like = "%" + search + "%";
  const [prdLow] = await pool.query(
    `
    SELECT *
    FROM product
    WHERE prdName LIKE ?;
    `,
    [like]
  );
  console.log(prdLow);
  res.json(prdLow);
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
