const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user_model");
const Token = require("../models/token_model");

const router = express.Router();

// Define a route to register a new user
router.post("/register", async (req, res) => {
  try {
    // Extract username and password from request body
    const salt = await bcrypt.genSalt(10);

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user with the hashed password
    const user = new User({
      phone: req.body.phone,
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      address: req.body.address,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }

    res.status(500).json({ error: "Error registering user " });
  }
});

// Define a route to authenticate a user and generate a JWT
router.post("/login", async (req, res) => {
  try {
    // Extract username and password from request body
    const { email, password } = req.body;

    // Find the user in the database by their username
    const user = await User.findOne({ email });

    // If user not found or password doesn't match, return an error
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }
    const existingToken = await Token.findOne({ userId: user._id });
    if (existingToken) {
      // Expire the previous token
      clearTimeout(existingToken.timer);
      await Token.findByIdAndRemove(existingToken._id);
    }

    // Generate a JWT with the user ID as the payload
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "300m",
    });
    // set a timer of 30min after that token will expire
    const timer = setTimeout(async () => {
      // Remove the expired token from the data store
      await Token.findByIdAndRemove(tokenObj._id);
    }, 3000000);
    // Save the new token in the data store
    const tokenObj = new Token({
      userId: user._id,
      token: token,
      timer: timer,
    });
    await tokenObj.save();

    res.json({
      success: true,
      message: "User logged in successfully",
      userId: user._id,
      token: {
        accessToken: token,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Error authenticating user" });
  }
});

module.exports = router;
