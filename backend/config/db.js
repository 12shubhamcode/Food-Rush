const mongoose = require("mongoose");

const db = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("mongo db connected");
  } catch (error) {
    console.log("error while connecting mongo db", error);
    process.exit(1);
  }
};

module.exports = db;
