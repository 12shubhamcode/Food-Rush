const User = require("../model/userSchema");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/token");
const  {sentOtpMail}=require("../utils/mail")


//register new user
async function register(req, res) {
  try {
    const { fullName, email, password, mobile, role } = req.body;
    if (!fullName || !email || !password || !mobile || !role) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter the fields" });
    }
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
      secure: true,
      sameSite: "none",
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

//login user
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
      secure: true,
      sameSite: "none",
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

//logout user
async function logout(req, res) {
  try {
    res.clearCookie("token");
    return res.status(200).json({ success: true, message: "User logged out" });
  } catch (error) {
    console.log(error);
    res.status(500).json("server error");
  }
}

//send otp
async function sendOtp(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User doesn't exist" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;

    await user.save();

    await sentOtpMail(email, otp);
    return res
      .status(200)
      .json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json("server error");
  }
}

//verify otp
async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.resetOtp !== otp || user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid/Expires OTP" });
    }

    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;

    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json("server error");
  }
}

//reset password
async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.isOtpVerified) {
      return res
        .status(400)
        .json({ success: false, message: "otp verification required" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    isOtpVerified = false;

    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "OTP reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json("server error");
  }
}

//google auth
async function googleAuth(req, res) {
  try {
    const { fullName, email, mobile, role } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        fullName,
        email,
        mobile,
        role,
      });
    }

    const token = await generateToken(user._id);
    res.cookie("token", token, {
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return res
      .status(200)
      .json({ user, success: true, message: "Google Authentication complete" });
  } catch (error) {
    console.log(error);
    res.status(500).json("server error");
  }
}

module.exports = {
  register,
  login,
  logout,
  sendOtp,
  verifyOtp,
  resetPassword,
  googleAuth,
};
