import express, { query } from "express";
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
  // console.log(userRow);
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
  // console.log("like", like);

  const [prdRow] = await pool.query(
    `
    SELECT *
    FROM product 
    WHERE category LIKE ?;
  `,
    [like]
  );

  res.json(prdRow);
  // console.log(prdRow);
});

app.post("/product", async (req, res) => {
  const {
    body: { prdId },
  } = req;
  // console.log("prdId", prdId);

  const [[prdRow]] = await pool.query(
    `
  SELECT *
  FROM product
  WHERE prdId = ?
  `,
    [prdId]
  );

  res.json(prdRow);
});

app.post("/cart", async (req, res) => {
  const {
    body: { prdId },
  } = req;

  const [duplicate] = await pool.query(
    `
    SELECT *
    FROM product
    WHERE prdId =?
    `,
    [prdId]
  );

  const [[product]] = await pool.query(
    `
    SELECT *
    FROM product
    WHERE prdId =?
    `,
    [prdId]
  );

  console.log(product.prdPrice);

  if (duplicate.length == 0) {
    const [row] = await pool.query(
      `
    INSERT INTO cart (prdId, userId, checked,amount, price ) VALUES (?,?, false, 1, ?);
    
    `,
      [prdId, userId, product.prdPrice]
    );
  } else {
    res.json({
      msg: "같은 상품 존재",
    });
  }
});

app.post("/cartlist", async (req, res) => {
  const {
    body: { userId },
  } = req;

  const [cartRow] = await pool.query(
    `
    SELECT *
    FROM cart
    WHERE userId = ?
    `,
    [userId]
  );

  res.json(cartRow);
});

app.patch("/amount/:prdId", async (req, res) => {
  const { prdId } = req.params;
  // const { setCount } = req.body;
  const {
    body: { count, price },
  } = req;

  console.log("count", req.body.count);

  console.log("price", req.body.price);

  await pool.query(
    `
    UPDATE cart SET amount = ?, price = ? WHERE prdId = ?
  `,

    [count, price, prdId]
  );

  const [[cartRow]] = await pool.query(
    `
    SELECT *
    FROM cart
    WHERE prdId = ?
    `,
    [prdId]
  );

  res.json(cartRow);
});

app.post("/cartList2", async (req, res) => {
  const {
    body: { prdId },
  } = req;

  // console.log("prdId", prdId);

  const [[cartRow]] = await pool.query(
    `
    SELECT *
    FROM product
    WHERE prdId = ?
    `,
    [prdId]
  );

  res.json(cartRow);
  // console.log("cartRow", cartRow);
});
app.post("/SearchPage", async (req, res) => {
  const {
    body: { search },
  } = req;
  var like = "%" + search + "%";
  const [prdLow] = await pool.query(
    `
    SELECT *
    FROM product
    WHERE prdName LIKE ?
    `,
    [like]
  );
  console.log(prdLow);
  if (search) {
    res.json(prdLow);
  }
});

app.post("/totalPrice", async (req, res) => {
  const {
    body: { userId },
  } = req;

  const [[totalPrice]] = await pool.query(
    `
    SELECT SUM(price) AS price FROM cart WHERE userId = ?`,
    [userId]
  );

  res.json(totalPrice);
});

app.patch("/check/:userId/:prdId", async (req, res) => {
  const { userId, prdId } = req.params;

  console.log("userId", userId);

  console.log("prdId", prdId);
  const [[rows]] = await pool.query(
    `
    SELECT *
  FROM cart where userId = ? and prdId = ?
  `,
    [userId, prdId]
  );
  await pool.query(
    `
  UPDATE cart
  SET checked = ?
  WHERE userId = ? and prdId =?
  `,

    [!rows.checked, userId, prdId]
  );
  res.send(userId);
});
// ↓↓ 공지사항 데이터 ↓↓

app.get("/notices", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM Notice ORDER BY id DESC");

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
    text = ?,
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
    msg: `${id}번 공지사항이 삭제되었습니다.`,
  });
});
app.post("/SBP", async (req, res) => {
  const { prdId } = req.body;

  const [[postItem]] = await pool.query(
    `
    SELECT * FROM product
    WHERE prdId = ?
    `,
    [prdId]
  );
  const id = postItem.prdId;
  await pool.query(
    `
    INSERT INTO cart
    SET prdId = ?,
    prdName = ?,
    prdEname = ?,
    prdPrice = ?,
    prdImg = ?
    `,
    [
      id,
      postItem.prdName,
      postItem.prdEname,
      postItem.prdPrice,
      postItem.prdImg,
    ]
  );

  const [CartRow] = await pool.query(
    `
    SELECT * FROM cart
    WHERE prdId = ?
    `,
    [id]
  );
});
app.get("/SBP", async (req, res) => {
  const {
    body: { prdId },
  } = req;
  const [ItemList] = await pool.query(
    `
    SELECT * FROM 
    cart 
    `,
    [prdId]
  );
  res.json(ItemList);
});
app.patch("/addHeart", async (req, res) => {
  const {
    body: { prdId, userId, checked },
  } = req;

  const [duplicate] = await pool.query(
    `
    SELECT *
    FROM heart
    WHERE prdId =? and userId = ?
    `,
    [prdId, userId]
  );

  const [[product]] = await pool.query(
    `
    SELECT *
    FROM product
    WHERE prdId =?
    `,
    [prdId]
  );

  if (duplicate.length == 0) {
    const [row] = await pool.query(
      `
    INSERT INTO heart (prdId, userId, checked) VALUES (?,?, ?);
    
    `,
      [prdId, userId, !checked]
    );
  } else {
    const [row] = await pool.query(
      `
      UPDATE heart SET checked = ? WHERE prdId = ? AND userId = ? 
    
    `,
      [!checked, prdId, userId]
    );
  }
});

app.post("/getHeart", async (req, res) => {
  const {
    body: { userId, prdId },
  } = req;
  const [[prdLow]] = await pool.query(
    `
    SELECT *
    FROM heart
    WHERE userId =? and prdId =?
    `,
    [userId, prdId]
  );

  res.json(prdLow);
});

app.post("/HeartCount", async (req, res) => {
  const {
    body: { prdId },
  } = req;
  const [[prdLow]] = await pool.query(
    `
    SELECT count(checked) as checked FROM heart WHERE prdId = ? AND (checked = 1 OR checked = TRUE);
    `,
    [prdId]
  );

  res.json(prdLow);
  console.log(prdLow);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// ↓↓ 공지사항 데이터 ↓↓
