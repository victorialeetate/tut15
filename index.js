require('dotenv').config();
const express = require("express");
const { Pool } = require('pg');
const app = express();


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 2
});

app.get("/", (req, res) => {
    const sql = "SELECT * FROM books ORDER BY id";
    pool.query(sql, [], (err, result) => {
        let message = "";
        let model = {};
        if (err) {
            message = `Error - ${err.message}`;
        } else {
            message = "success";
            model = result.rows;
        }
        res.render("index", { message: message, model: model });
    });
});

app.get("/edit/:id", (req, res) => {
    const sql = "SELECT * FROM books WHERE id = $1";
    pool.query(sql, [req.params.id], (err, result) => {
        let book = {};
        if (err) {
            book = {};
        } else {
            book = result.rows[0];
        }
        res.render("index", { book: book });
    });
});

app.post("/edit/:id", (req, res) => {
    const { title, author, comments } = req.body;
    const sql = "UPDATE books SET title = $1, author = $2, comments = $3 WHERE id = $4";
    pool.query(sql, [title, author, comments, req.params.id], (err, result) => {
        if (err) {
            res.send("Error updating book");
        } else {
            res.redirect("/");
        }
    });
});


app.get("/add", (req, res) => {
    res.render("index", { book: {} });
});

app.post("/add", (req, res) => {
    const { title, author, comments } = req.body;
    const sql = "INSERT INTO books (title, author, comments) VALUES ($1, $2, $3)";
    pool.query(sql, [title, author, comments], (err, result) => {
        if (err) {
            res.send("Error adding book");
        } else {
            res.redirect("/");
        }
    });
});

app.post("/delete/:id", (req, res) => {
    const sql = "DELETE FROM books WHERE id = $1";
    pool.query(sql, [req.params.id], (err, result) => {
        if (err) {
            res.send("Error deleting book");
        } else {
            res.redirect("/");
        }
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server started at http://localhost:3000/");
});
