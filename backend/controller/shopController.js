const Shop = require("../model/shopSchema");
const uploadOnCloudinary = require("../utils/cloudinary");

async function createAndEditShop(req, res) {
  try {
    const { name, city, state, address } = req.body;
    const normalizedCity = city.toLowerCase().trim();
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    let shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      shop = await Shop.create({
        name,
        city: normalizedCity,
        state,
        address,
        image,
        owner: req.userId,
      });
    } else {
      shop = await Shop.findByIdAndUpdate(
        shop._id,
        {
          name,
          city: normalizedCity,
          state,
          address,
          image,
          owner: req.userId,
        },
        { new: true },
      );
    }

    await shop.populate(["owner", "items"]);

    return res
      .status(201)
      .json({ shop, success: true, message: "Shop created" });
  } catch (error) {
    console.log(error);
    return res.status(500).json("server error");
  }
}

async function getMyShop(req, res) {
  try {
    const shop = await Shop.findOne({ owner: req.userId })
      .populate("owner")
      .populate({
        path: "items",
        options: { sort: { updatedAt: -1 } },
      });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "You have not created a shop yet",
      });
    }

    return res.status(200).json({
      success: true,
      shop,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("server error");
  }
}

async function getShopByCity(req, res) {
  try {
    const normalizedCity = req.params.city.toLowerCase().trim();

    const shops = await Shop.find({ city: normalizedCity }).populate("items");

    if (shops.length === 0) {
      return res.status(200).json({ shops: [], success: true });
    }

    return res.status(200).json({
      shops,
      success: true,
      message: "Shop found",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("server error");
  }
}

module.exports = { createAndEditShop, getMyShop, getShopByCity };
