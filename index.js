import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port =3000;
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

async function checkReviews(){
    const result = await db.query (
      "SELECT * FROM reads ORDER BY title"
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
        "SELECT * FROM reads WHERE id = $1" ,[reviewId] 
    );
    review = result.rows;
    console.log(reviewId);
    res.render("review.ejs", {
        review:review
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