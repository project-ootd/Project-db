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
  // console.log("prdRow", prdRow);

  res.json(prdRow);
  // res.send([prdRow]);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// ↓↓ 공지사항 데이터 ↓↓

const getData = async () => {
  const data = await axios.get("http://localhost:4000/notices");
};

app.get("/notices/:id/:contentId", async (req, res) => {
  // params 여러개 받기
  const data = {
    notices: {
      id: req.params.id,
      contentId: req.params.contentId,
    },
  };

  const {
    notices: { id, contentId },
  } = data;
});

app.get("/notices", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM Notice ORDER BY id DESC");
  getData();
  res.json(rows);
});

app.post("/notices", async (req, res) => {
  const {
    body: { text },
  } = req;
  await pool.query(
    `
  INSERT INTO Notice
  SET reg_date = NOW(),
  perform_date = '2022-05-18 07:00:00',
  checked = 0,
  text = ?;
  `,
    [text]
  );
  const [newRows] = await pool.query(`
  SELECT *
  FROM Notice
  ORDER BY id
  DESC
  `);
  res.json(newRows);
});

app.get("/notices/:id/", async (req, res) => {
  //const id = req.params.id;
  const { id } = req.params;

  const [rows] = await pool.query(
    `
  SELECT *
  FROM Notice
  WHERE id = ?
  `,
    [id]
  );
  if (rows.length === 0) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }

  res.json(rows[0]);
});

app.patch("/notices/:id", async (req, res) => {
  const { id } = req.params;
  const { perform_date, text } = req.body;

  const [rows] = await pool.query(
    `
    SELECT *
    FROM Notice
    WHERE id = ?
    `,
    [id]
  );

  if (rows.length === 0) {
    res.status(404).json({
      msg: "not found",
    });
  }

  if (!perform_date) {
    res.status(400).json({
      msg: "perform_date required",
    });
    return;
  }

  if (!text) {
    res.status(400).json({
      msg: "text required",
    });
    return;
  }

  const [rs] = await pool.query(
    `
    UPDATE Notice
    SET perform_date = ?,
    text = ?
    WHERE id = ?
    `,
    [perform_date, text, id]
  );

  const [updatednotices] = await pool.query(
    `
    SELECT *
    FROM Notice
    ORDER BY id DESC
    `
  );
  res.json(updatednotices);
});

app.patch("/notices/check/:id", async (req, res) => {
  const { id } = req.params;
  //id번 Notice가 없을 수도 있기 때문에
  //SELECT * FROM으로 id값을 불러옴 → id가 없는 값을 불러온다면?
  //if (!rows) 로 404에러를 할당하며 msg: "not found" 출력.
  //또한, check 초기상태를 파악하기 위해 불러와야 함.
  const [[rows]] = await pool.query(
    `
    SELECT *
  FROM Notice WHERE id = ?
  `,
    [id]
  );
  if (!rows) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }
  //문제가 없다면? → 수정 mySQL 넣기
  await pool.query(
    `
  UPDATE Notice
  SET checked = ?
  WHERE id = ?
  `,
    //check값은 어떻게 바꾸나?
    //위에서 받은 초기값의 반전값 (0이면 1, 1이면 0)을 반영시켜줌.
    [!rows.checked, id]
  );
  //값을 바꾼 후, 바꾼 값을 저장한 새로운 테이블을 다시 보여 줌.
  const [updatedNotice] = await pool.query(
    `
      SELECT * FROM Notice ORDER BY id DESC`,
    [id]
  );
  //반환시켜줌
  res.json(updatedNotice);
  //res.send(id);
});

app.delete("/notices/:id", async (req, res) => {
  const { id } = req.params;

  const [[NoticeRow]] = await pool.query(
    `
    SELECT *
    FROM Notice
    WHERE id = ?`,
    [id]
  );

  if (NoticeRow === undefined) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }

  const [rs] = await pool.query(
    `DELETE FROM Notice
    WHERE id = ?`,
    [id]
  );
  res.json({
    msg: `${id}번 할일이 삭제되었습니다.`,
  });
});
