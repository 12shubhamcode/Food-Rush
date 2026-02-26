const jwt = require("jsonwebtoken");

async function generateToken(userId) {
  try {
    const token = await jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return token;
  } catch (error) {
    console.log(error);
  }
}

module.exports = generateToken;
