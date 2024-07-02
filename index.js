import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'readnation',
    password: 'sudo123',
    port: 5432
  });
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
db.connect();
let data = [];
app.get("/",async (req,res)=>{
    if(req.query.sortby){
        const result = await db.query(`SELECT id,type,code,rating FROM books_list ORDER BY ${req.query.sortby} ${req.query.by}`);
        data = result.rows;
        console.log(data);
        res.render("index.ejs",{data:data});
    }else{
        const result = await db.query("SELECT id,type,code,rating FROM books_list");
        data = result.rows;
        res.render("index.ejs",{data:data});
    }
});

app.get("/view/:id",async (req,res)=>{
    const result= await db.query("SELECT * FROM books_list WHERE id=$1;",[req.params.id]);
    res.render("view.ejs",{book:result.rows[0]});
});

app.get("/new",async (req,res)=>{
    res.render("new.ejs");
});
app.post("/new",async (req,res)=>{
    const t = req.body;
    try
    {
        await db.query("INSERT INTO books_list(title,notes,read_on,type,code,rating) VALUES ($1,$2,$3,$4,$5,$6)",
        [t.title,t.notes,t.date,t.type,t.code,t.rating]);
    }catch(err){
        console.error(err);
    }
    res.redirect("/")
});

app.get("/edit/:id",async (req,res)=>{
    const result = await db.query("SELECT * FROM books_list WHERE id=$1;",[req.params.id]);
    res.render("edit.ejs",{book:result.rows[0]});
});
app.post("/edit/:id",async (req,res)=>{
    const t = req.body;
    let date = t.date.split(" ");
    date = date[0]+" "+date[1]+" "+date[2]+" "+date[3];
    try
    {
        await db.query("UPDATE books_list SET title=$1, notes=$2, read_on =$3, type=$4, code=$5, rating=$6 WHERE id=$7;",
        [t.title,t.notes,date,t.type,t.code,t.rating,req.params.id]);
    }catch(err){
        console.error(err);
    }
    res.redirect("/")
});
app.get("/delete/:id",async (req,res)=>{
    await db.query("DELETE FROM books_list WHERE id=$1;",[req.params.id]); 
    res.redirect("/");
});
app.listen(port, ()=>{
    console.log(`Server running at port ${port}:`);
});