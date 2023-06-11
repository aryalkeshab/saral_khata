const jwt = require("jsonwebtoken");
const Token = require("../models/token_model");
// Middleware to authenticate the JWT
async function authenticateToken(req, res, next) {
  // Get the token from the request header
  const token = req.headers.authorization;
  console.log("Token:", token);

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const tokenExists = await Token.findOne({ token: token });
    if (!tokenExists) {
      res.status(401).json({ error: "Unauthorized Request" });
      return;
    }
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error) {
      if (error.name === "JsonWebTokenError") {
        // Invalid token
        res.status(401).json({ error: "Invalid token" });
      } else if (error.name === "TokenExpiredError") {
        // Token expired
        res.status(401).json({
          error: "Token expired !! Please Login Again to continue.",
        });
      } else {
        // Other errors
        res.status(500).json({ error: "Error verifying token" });
      }
      return;
    }
  }
}

// Verify the token

module.exports = authenticateToken;
