const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("views"));

app.use(
  session({
    secret: "live-session-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static("public"));

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Login
app.post("/login", (req, res) => {
  const { password } = req.body;

  if (password !== "a4abhijeet") {
    return res.send("<h2>❌ Wrong Password</h2><a href='/'>Go Back</a>");
  }

  // Mark user as authenticated
  req.session.isAuthenticated = true;
  res.redirect("/pay");
});

// Protect Pay Route
app.get("/pay", (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.redirect("/");
  }

  res.sendFile(path.join(__dirname, "views", "pay.html"));
});

// Logout (optional)
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
