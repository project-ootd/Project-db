import axios from "axios";
import  express from "express";
import mysql from "mysql2/promise";


const app = express();

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

app.get("/sellitems", async (req,res)=>{
    const [rows] = await pool.query(`SELECT * FROM Logintable `);

    res.json(rows);
})

app.get("/Login", async(req,res)=>{
  const {id,password} = req.params;

  const [[login]] = await pool.query(
    `
    SELECT *
    FROM id =?,
    password = ?,
    `,[id,password]
  )
  if(id === undefined && password === undefined){
    app.status(404).json({
      msg:"not found"
    })
    return
  }
  res.json(login)
 })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
