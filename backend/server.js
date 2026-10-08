import express from 'express'
import mysql from "mysql"
import cors from "cors";
import "dotenv/config";



const app=express();
app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
  "host": process.env.DB_HOST,
  "user": process.env.DB_USER,
  "password": process.env.DB_PASSWORD,
  "database": process.env.DB_NAME,
});
db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("MySQL database connected successfully");
  }
});

app.get('/users',(req,res)=>{
const sql="SELECT * from student";
db.query(sql,(err,result)=>{
    if(err) return response.json({Message:"failed"})
        return res.json(result);
})
})


app.post("/adduser", (req, res) => {
  console.log("Received body:", req.body);

  const { name, email, age } = req.body;

  if (!name || !email || age === undefined) {
    return res.status(400).json({
      message: "Name, email, and age are required",
    });
  }

  const sql = `
    INSERT INTO student (name, email, age)
    VALUES ?
  `;

  db.query(sql, [name, email, Number(age)], (err, result) => {
    if (err) {
      console.error("MySQL insert error:", err);
      return res.status(500).json({
        message: "Failed to add student",
        error: err.message,
      });
    }

    return res.status(201).json({
      message: "Student added successfully",
      userId: result.insertId,
    });
  });
});

app.get("/getuser/:id",(req,res)=>{
      const {id}=req.params
    const sql = "SELECT * FROM student WHERE id = ?";
  

db.query(sql,[id],(err,result)=>{
    if(err) return res.status(500).json({Message:"error in Server"})
          if (result.length === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }
       return res.json(result[0]);
})
})

app.put('/updateuser/:id',(req,res)=>{
    const {id}=req.params;
    const {name,email,age}=req.body
const sql=`update student set name=? ,email=?,age=? where id=?`

db.query(sql,[name,email,Number(age),id],(err,result)=>{
    if(err){
        console.error("error in server",err.message);
       return res.status(500).json({message:"error in serverssssss",  error: err.message,})
    }
    if(result.affectedRows===0){
        return res.status(404).json({
            message:"no student found",
            error:err.message
        })
    }
    res.status(200).json({
        status:200,
        message:"sucessfully updated"
    })
})
})
// app.get("/getuser/:id", (req, res) => {
//   const { id } = req.params;

//   const sql = "SELECT * FROM student WHERE id = ?";

//   db.query(sql, [id], (err, result) => {
//     if (err) {
//       return res.status(500).json({
//         message: "Error in server",
//       });
//     }

//     if (result.length === 0) {
//       return res.status(404).json({
//         message: "Student not found",
//       });
//     }

//     return res.json(result[0]);
//   });
// });


app.listen(8081,()=>{
console.log("listening")
})