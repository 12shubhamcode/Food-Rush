const User = require("../model/userSchema");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/token");

// register new user
async function register(req, res) {
  try {
    const { fullName, email, password, mobile, role } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exist" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be atleat 6 characters",
      });
    }

    if (mobile.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be atleat 10 digits",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({
      fullName,
      email,
      mobile,
      role,
      password: hashedPassword,
    });

    const token = await generateToken(user._id);
    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res
      .status(201)
      .json({ user, success: true, message: "User is created" });
  } catch (error) {
    console.log(error);
    res.status(500).json("server error");
  }
}

// login user
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user?.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });
    }

    const token = await generateToken(user._id);
    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res
      .status(200)
      .json({ user, success: true, message: "User Logged In" });
  } catch (error) {
    console.log(error);
    res.status(500).json("server error");
  }
}

// logout user
async function logout(req, res) {
  try {
    res.clearCookie("token");
    return res
      .status(200)
      .json({ success: true, message: "User logged out" });
  } catch (error) {
    console.log(error);
    res.status(500).json("server error");
  }
}

// get current user
async function getCurrentUser(req, res) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User Id not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ user});
  } catch (error) {
    console.log(error);
    res.status(500).json("server error");
  }
}

async function updateUserLocation(req, res) {
  try {
    const { lat, lon } = req.body;

    
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          "location.type": "Point",
          "location.coordinates": [lon, lat],
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Location updated",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json("server error");
  }
}




module.exports = { register, login, logout, getCurrentUser,updateUserLocation };
