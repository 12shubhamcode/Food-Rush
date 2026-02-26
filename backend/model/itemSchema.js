const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Pizza",
        "Pasta",
        "Burgers",
        "Sandwiches",
        "Indian",
        "Chinese",
        "Italian",
        "Mexican",
        "Desserts",
        "Beverages",
        "Healthy",
        "Fast Food",
      ],
      required: true,
    },
    price: {
      type: Number,
      min: 0,
      required: true,
    },
    foodType: {
      type: String,
      enum: ["Veg", "Non veg"],
      required: true,
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },

  { timestamps: true },
);

const Item = mongoose.model("Item", itemSchema);
module.exports = Item;
