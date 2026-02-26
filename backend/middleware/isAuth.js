const jwt = require("jsonwebtoken");

async function isAuth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Not authorized login again" });
    }

    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodeToken) {
      return res
        .status(400)
        .json({ success: false, message: "Token not verified" });
    }
   
    req.userId = decodeToken.userId;

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json("server error");
  }
}

module.exports = isAuth;
