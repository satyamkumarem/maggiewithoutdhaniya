require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = 3000;

mongoose
  .connect(process.env.URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ Mongo Error", err));

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  hasPaid: { type: Boolean, default: false },
  activeSessionId: String,
});

const User = mongoose.model("User", userSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("views"));

app.use(
  session({
    secret: "live-session-secret",
    resave: false,
    saveUninitialized: false,
  })
);


async function requireLogin(req, res, next) {
  if (!req.session.email) return res.redirect("/");
  next();
}

async function requirePayment(req, res, next) {
  const user = await User.findOne({ email: req.session.email });
  if (!user || !user.hasPaid) return res.redirect("/pay");
  next();
}

async function enforceSingleSession(req, res, next) {
  const user = await User.findOne({ email: req.session.email });
  if (user.activeSessionId !== req.sessionID) {
    req.session.destroy(() => res.redirect("/"));
    return;
  }
  next();
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.post("/login", async (req, res) => {
  const { name, email, password, key } = req.body;

  if (!email || password !== "a4abhijeet" || key !== "a4abhijeet") {
    return res.send("<h2>❌ Invalid Credentials</h2><a href='/'>Go Back</a>");
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({ name, email });
  }

  user.activeSessionId = req.sessionID;
  await user.save();

  req.session.email = email;

  if (user.hasPaid) {
    return res.redirect("/dashboard");
  }

  res.redirect("/pay");
});

app.get("/pay", requireLogin, async (req, res) => {
  const user = await User.findOne({ email: req.session.email });
  if (user.hasPaid) return res.redirect("/dashboard");

  res.sendFile(path.join(__dirname, "views", "pay.html"));
});

app.post("/payment-success", requireLogin, async (req, res) => {
  await User.updateOne({ email: req.session.email }, { hasPaid: true });
  res.redirect("/dashboard");
});

// Dashboard
app.get(
  "/dashboard",
  requireLogin,
  requirePayment,
  enforceSingleSession,
  (req, res) => {
    res.sendFile(path.join(__dirname, "views", "dashboard.html"));
  }
);

// Protected Pages
app.get(
  "/pdf",
  requireLogin,
  requirePayment,
  enforceSingleSession,
  (req, res) => res.sendFile(path.join(__dirname, "views", "pdf.html"))
);

app.get(
  "/mcq",
  requireLogin,
  requirePayment,
  enforceSingleSession,
  (req, res) => res.sendFile(path.join(__dirname, "views", "mcq.html"))
);

app.get(
  "/live",
  requireLogin,
  requirePayment,
  enforceSingleSession,
  (req, res) => res.sendFile(path.join(__dirname, "views", "live.html"))
);

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

app.listen(PORT, () =>
  console.log(`🚀 Server running at https://maggiewithoutdhaniya.up.railway.app`)
);
