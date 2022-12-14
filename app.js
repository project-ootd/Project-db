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
      msg: "?????? ?????? ??????",
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
// ?????? ???????????? ????????? ??????

app.get("/notice", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM Notice ORDER BY id DESC");

  res.json(rows);
});

app.post("/notice", async (req, res) => {
  const {
    body: { contents },
  } = req;
  await pool.query(
    `
  INSERT INTO Notice
  SET reg_date = NOW(),
  title = '2022-05-18 07:00:00',
  checked = 0,
  contents = ?;
  `,
    [contents]
  );
  const [newRows] = await pool.query(`
  SELECT *
  FROM Notice
  ORDER BY id
  DESC
  `);
  res.json(newRows);
});

app.get("/notice/:id/", async (req, res) => {
  //const id = req.params.id;
  const { id } = req.params;

  const [rows] = await pool.query(
    `
  SELECT id, reg_date, title, contents
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

app.get("/NoticeContent", async (req, res) => {
  const [rows] = await pool.query(
    `
  SELECT *
  FROM Notice
  `
  );

  res.json(rows[0]);
});

app.get("/mainNotice", async (req, res) => {
  const [rows] = await pool.query(
    `
  SELECT *
  FROM Notice ORDER BY id DESC LIMIT 5
  `
  );

  res.json(rows);
});

app.get("/NoticeContent/:id", async (req, res) => {
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

app.get("/notice", async (req, res) => {
  const [rows] = await pool.query(`SELECT * FROM Notice`);

  res.json(rows);
});

app.post("/notice", async (req, res) => {
  const {
    body: { title, contents },
  } = req;
  await pool.query(
    `
  INSERT INTO Notice2
  SET reg_date = NOW(),
  title = ?,
  contents = ?;
  `,
    [title, contents]
  );
  const [newRows] = await pool.query(`
  SELECT *
  FROM Notice
  ORDER BY id
  DESC
  `);
  res.json(newRows);
});

app.patch("/notice/:id", async (req, res) => {
  const { id } = req.params;
  const { title, contents } = req.body;

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

  if (!title) {
    res.status(400).json({
      msg: "title required",
    });
    return;
  }

  if (!contents) {
    res.status(400).json({
      msg: "contents required",
    });
    return;
  }

  const [rs] = await pool.query(
    `
    UPDATE Notice
    SET title = ?,
    contents = ?,
    WHERE id = ?
    `,
    [title, contents, id]
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

app.patch("/notice/check/:id", async (req, res) => {
  const { id } = req.params;
  //id??? Notice??? ?????? ?????? ?????? ?????????
  //SELECT * FROM?????? id?????? ????????? ??? id??? ?????? ?????? ????????????????
  //if (!rows) ??? 404????????? ???????????? msg: "not found" ??????.
  //??????, check ??????????????? ???????????? ?????? ???????????? ???.
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
  //????????? ?????????? ??? ?????? mySQL ??????
  await pool.query(
    `
  UPDATE Notice
  SET checked = ?
  WHERE id = ?
  `,
    //check?????? ????????? ??????????
    //????????? ?????? ???????????? ????????? (0?????? 1, 1?????? 0)??? ???????????????.
    [!rows.checked, id]
  );
  //?????? ?????? ???, ?????? ?????? ????????? ????????? ???????????? ?????? ?????? ???.
  const [updatedNotice] = await pool.query(
    `
      SELECT * FROM Notice ORDER BY id DESC`,
    [id]
  );
  //???????????????
  res.json(updatedNotice);
  //res.send(id);
});

app.delete("/notice/:id", async (req, res) => {
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
    msg: `${id}??? ??????????????? ?????????????????????.`,
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
    `
  );
  res.json(ItemList);
});
// app.patch("/addHeart", async (req, res) => {
//   const {
//     body: { prdId, userId, checked },
//   } = req;

//   const [duplicate] = await pool.query(
//     `
//     SELECT *
//     FROM heart
//     WHERE prdId =? and userId = ?
//     `,
//     [prdId, userId]
//   );

//   const [[product]] = await pool.query(
//     `
//     SELECT *
//     FROM product
//     WHERE prdId =?
//     `,
//     [prdId]
//   );

//   if (duplicate.length == 0) {
//     const [row] = await pool.query(
//       `
//     INSERT INTO heart (prdId, userId, checked) VALUES (?,?, ?);

//     `,
//       [prdId, userId, !checked]
//     );
//   } else {
//     const [row] = await pool.query(
//       `
//       UPDATE heart SET checked = ? WHERE prdId = ? AND userId = ?

//     `,
//       [!checked, prdId, userId]
//     );
//   }
// });

// app.post("/getHeart", async (req, res) => {
//   const {
//     body: { userId, prdId },
//   } = req;
//   const [[prdLow]] = await pool.query(
//     `
//     SELECT *
//     FROM heart
//     WHERE userId =? and prdId =?
//     `,
//     [userId, prdId]
//   );

//   res.json(prdLow);
// });

// app.post("/HeartCount", async (req, res) => {
//   const {
//     body: { prdId },
//   } = req;
//   const [[prdLow]] = await pool.query(
//     `
//     SELECT count(checked) as checked FROM heart WHERE prdId = ? AND (checked = 1 OR checked = TRUE);
//     `,
//     [prdId]
//   );

//   res.json(prdLow);
//   console.log(prdLow);
// });
app.delete("/SBP/:prdId", async (req, res) => {
  const { prdId } = req.params;

  const [[cartRemove]] = await pool.query(
    `
    SELECT * FROM cart
    WHERE prdId = ?
    `,
    [prdId]
  );

  const [Remove] = await pool.query(
    `
    DELETE FROM cart
    WHERE prdId = ?
    `,
    [prdId]
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// ?????? ???????????? ????????? ??????

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
  //id??? Notice??? ?????? ?????? ?????? ?????????
  //SELECT * FROM?????? id?????? ????????? ??? id??? ?????? ?????? ????????????????
  //if (!rows) ??? 404????????? ???????????? msg: "not found" ??????.
  //??????, check ??????????????? ???????????? ?????? ???????????? ???.
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
  //????????? ?????????? ??? ?????? mySQL ??????
  await pool.query(
    `
  UPDATE Notice
  SET checked = ?
  WHERE id = ?
  `,
    //check?????? ????????? ??????????
    //????????? ?????? ???????????? ????????? (0?????? 1, 1?????? 0)??? ???????????????.
    [!rows.checked, id]
  );
  //?????? ?????? ???, ?????? ?????? ????????? ????????? ???????????? ?????? ?????? ???.
  const [updatedNotice] = await pool.query(
    `
      SELECT * FROM Notice ORDER BY id DESC`,
    [id]
  );
  //???????????????
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
    msg: `${id}??? ??????????????? ?????????????????????.`,
  });
});
