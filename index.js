import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port =3000;
const API_SEARCH_URL = "https://openlibrary.org/search.json";
const API_COVER_URL = "https://covers.openlibrary.org/b/id/";
const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'nidari',
  password: 'Ted123',
  port: 5432
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let reviews = [];
let review = [];
let books = [];

async function checkReviews(){
    const result = await db.query (
      "SELECT *,TO_CHAR(date_read, 'DD-MM-YYYY') as formatted_date FROM reads ORDER BY title"
    );
    reviews = result.rows;
    return reviews;
  }

//   async function checkReview(){
//     let reviewId = req.body.reviewId;
//     const result = await db.query(
//         "SELECT * FROM reads WHERE id = $1" , [reviewId]
//     );
//   }

app.get("/", async(req, res) => {
    const reviews = await checkReviews();
    res.render("index.ejs", {
    reviews: reviews,
  });
});

app.get("/admin", (req, res) => {
    res.render("admin.ejs");
});

app.get("/list", async(req, res) => {
    const reviews = await checkReviews();
    res.render("list.ejs", {
        reviews: reviews
    });
});

app.get("/view/:id", async(req, res) => {
    const reviewId = req.params.id;
    const result = await db.query(
        "SELECT *,TO_CHAR(date_read, 'DD-MM-YYYY') as formatted_date FROM reads WHERE id = $1" ,[reviewId] 
    );
    review = result.rows;
    console.log(reviewId);
    res.render("review.ejs", {
        review:review
    });
});

app.get("/edit/:id", async(req, res) => {
  const reviewId = req.params.id;
  const result = await db.query(
    "SELECT * FROM reads WHERE id = $1" , [reviewId]
  );
  review = result.rows;
  res.render("edit.ejs", {
    review: review
  });
});

app.post("/add",async (req, res) => {
    const title = req.body.title;
    const author = req.body.author;
    const genre = req.body.genre;
    const date = req.body.date;
    const cover = req.body.image;
    const content = req.body.content;
    const rating = req.body.rating;
    
    const result = await db.query (
      "INSERT INTO reads (title, author, date_read, cover, content, rating, genre) VALUES ($1, $2, $3, $4, $5, $6, $7)", [title, author, date, cover, content, rating, genre]
    );
    res.redirect("/admin");
});

app.post("/editRead/:id", async(req, res) => {
    const editId = req.params.id;
    const title = req.body.editTitle;
    const author = req.body.editAuthor;
    const genre = req.body.editGenre;
    const cover = req.body.editImage;
    const content = req.body.content;
    const rating = req.body.editRating;
    
    const result = await db.query (
      "UPDATE reads SET title = $1, author = $2, cover = $3, content = $4, rating = $5, genre = $6 WHERE id = $7" , [title, author, cover, content, rating, genre, editId]
    );
    res.redirect("/list");
});

app.post("/search", async (req, res) => {
  let bookTitle = req.body.title;

  try{
    const response = await axios.get(API_SEARCH_URL + "?q=" + bookTitle);
    const bookData = JSON.stringify(response.data);
    const book = bookData.docs;

    const bookDetails = book.results;
    console.log(book);
    res.render("addRead.ejs", {books: book});
  }
  catch(error){
    console.log(`Book not found`);
    res.render("addRead.ejs");
  }
})

app.get("/delete/:id",async (req, res) => {
    const reviewId = req.params.id;
    console.log(reviewId);
    try {
      await db.query(
        "DELETE FROM reads WHERE id = $1",
        [reviewId]
      );
      res.redirect("/list");
    } catch (err) {
      console.log(err);
    }
  });

app.listen(port, (req, res) => {
    console.log(`Server running on port:${port}. Happy coding`);
});