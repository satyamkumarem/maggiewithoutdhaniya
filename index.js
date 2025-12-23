const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("views"));

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Form submit
app.post("/login", (req, res) => {
  const { password } = req.body;

  if (password !== "a4abhijeet") {
    return res.send("<h2>❌ Wrong Password</h2><a href='/'>Go Back</a>");
  }

  res.redirect("/pay");
});

// Payment page
app.get("/pay", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "pay.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
