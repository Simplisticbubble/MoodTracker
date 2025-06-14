require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret";

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection with explicit database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Connection events
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB in database:", mongoose.connection.name);
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Schema & Model
const moodSchema = new mongoose.Schema({
  date: Date,
  mood: String,
  note: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const Mood = mongoose.model("Mood", moodSchema);
const User = mongoose.model("User", UserSchema);

// Routes
app.get("/moods", async (req, res) => {
  try {
    const token = req.header("auth-token");
    if (!token) return res.status(401).json({ error: "Access denied" });

    const verified = jwt.verify(token, JWT_SECRET);
    const moods = await Mood.find({ user: verified._id });

    // Convert UTC dates back to local dates for display
    const moodsWithLocalDates = moods.map((mood) => ({
      ...mood._doc,
      date: new Date(mood.date), // Converts UTC to local time
    }));

    res.json(moodsWithLocalDates);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/moods", async (req, res) => {
  // let { date, mood, note } = req.body;

  // // Normalize date to remove time (sets it to midnight UTC)
  // const normalizedDate = new Date(date);
  // normalizedDate.setHours(0, 0, 0, 0);

  // // Find or update mood entry for that calendar day
  // const existing = await Mood.findOne({ date: normalizedDate });

  // if (existing) {
  //   existing.mood = mood;
  //   existing.note = note;
  //   await existing.save();
  //   res.json(existing);
  // } else {
  //   const newMood = new Mood({ date: normalizedDate, mood, note });
  //   await newMood.save();
  //   res.json(newMood);
  // }
  try {
    const token = req.header("auth-token");
    if (!token) return res.status(401).json({ error: "Access denied" });

    const verified = jwt.verify(token, JWT_SECRET);
    let { date, mood, note } = req.body;

    // Proper timezone handling - convert to UTC start of day
    const userDate = new Date(date);
    const normalizedDate = new Date(
      Date.UTC(
        userDate.getUTCFullYear(),
        userDate.getUTCMonth(),
        userDate.getUTCDate()
      )
    );

    // Find or update mood entry
    const existing = await Mood.findOne({
      date: normalizedDate,
      user: verified._id,
    });

    if (existing) {
      existing.mood = mood;
      existing.note = note;
      await existing.save();
      res.json(existing);
    } else {
      const newMood = new Mood({
        date: normalizedDate,
        mood,
        note,
        user: verified._id,
      });
      await newMood.save();
      res.json(newMood);
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.status(400).send("User not found");

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Invalid password");

  const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
    expiresIn: "30d",
  });
  res.header("auth-token", token).send({ token, username: user.username });
});
// Add this route to verify tokens
app.get("/protected-route", async (req, res) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(verified._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
});
// Add this to your server.js
// Add this to your server.js
app.get("/api/verify-token", async (req, res) => {
  const token = req.header("auth-token");

  // For debugging - log incoming token
  console.log("Verifying token:", token);

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ valid: false, error: "No token provided" });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    console.log("Token verified for user ID:", verified._id);

    const user = await User.findById(verified._id).select("-password");
    if (!user) {
      console.log("User not found for token");
      return res.status(401).json({ valid: false, error: "User not found" });
    }

    res.json({
      valid: true,
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (err) {
    console.log("Token verification failed:", err.message);
    res.status(401).json({
      valid: false,
      error: "Token verification failed",
      details: err.message,
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
