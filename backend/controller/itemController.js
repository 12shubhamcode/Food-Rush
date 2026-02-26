const Item = require("../model/itemSchema");
const Shop = require("../model/shopSchema");
const uploadOnCloudinary = require("../utils/cloudinary");

async function addItems(req, res) {
  try {
    const { name, category, foodType, price } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const shop = await Shop.findOne({ owner: req.userId }).populate("items");
    if (!shop) {
      return res
        .status(400)
        .json({ success: false, message: "Shop not found" });
    }

    const item = await Item.create({
      name,
      category,
      foodType,
      price,
      image,
      shop: shop._id,
    });
    shop.items.push(item._id);
    await shop.save();
    await shop.populate("items owner");

    return res
      .status(201)
      .json({ shop, success: true, message: "Item created" });
  } catch (error) {
    console.log(error);
    return res.status(500).json("server error");
  }
}

async function editItems(req, res) {
  try {
    const itemId = req.params.itemId;
    const { name, category, foodType, price } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const item = await Item.findByIdAndUpdate(
      itemId,
      {
        name,
        category,
        foodType,
        price,
        image,
      },
      { new: true },
    );

    if (!item) {
      return res
        .status(400)
        .json({ success: false, message: "Item not found" });
    }
    return res
      .status(200)
      .json({ item, success: true, message: "Item update" });
  } catch (error) {
    console.log(error);
    return res.status(500).json("server error");
  }
}

async function getItemById(req, res) {
  try {
    const { itemId } = req.params;

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(400).json({
        success: false,
        message: "Item not found",
      });
    }

    return res.status(200).json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json("server error");
  }
}

async function deleteItem(req, res) {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(400).json({
        success: false,
        message: "Item not found",
      });
    }
    const shop = await Shop.findOne({ owner: req.userId });
    shop.items = shop.items.filter((i) => i.toString() !== item._id.toString());
    await shop.save();
    await shop.populate("items");
    return res.status(200).json({
      success: true,
      message: "Item deleted successfully",
      shop,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json("server error");
  }
}

async function getItemByCity(req, res) {
  try {
    const { city } = req.params;
    const normalizedCity = city.toLowerCase().trim();
    if (!city) {
      return res
        .status(400)
        .json({ success: false, message: "City is required" });
    }
    const shops = await Shop.find({ city: normalizedCity }).populate("items");
    if (!shops) {
      return res
        .status(400)
        .json({ success: false, message: "Shop not found" });
    }
    const shopIds = shops.map((shop) => shop._id);
    const items = await Item.find({ shop: { $in: shopIds } });

    return res.status(200).json(items);
  } catch (error) {
    console.error(error);
    return res.status(500).json("server error");
  }
}

async function getItemByShop(req, res) {
  try {
    const { shopId } = req.params;
    const shop = await Shop.findById(shopId).populate("items");
    if (!shop) {
      return res
        .status(400)
        .json({ success: false, message: "Shop not found" });
    }

    return res.status(200).json({
      shop,
      items: shop.items,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json("server error");
  }
}

async function searchItems(req, res) {
  try {
    const { query, city } = req.query;
    if (!query || !city) {
      return null;
    }
   const normalizedCity = city.toLowerCase().trim();

    const shops = await Shop.find({ city: normalizedCity }).populate("items");
    if (!shops) {
      return res
        .status(400)
        .json({ success: false, message: "Shop not found" });
    }

    if (shops.length === 0) {
      return res.status(200).json({ shops: [], success: true });
    }

    const shopId = shops.map((s) => s._id);
    const items = await Item.find({
      shop: { $in: shopId },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    }).populate("shop", "name image");

    return res.status(200).json({
      items,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json("server error");
  }
}

async function rating(req,res) {
  try {
    const {itemId,rating}=req.body;
    if (!itemId|| !rating) {
      return res.status(400).json({success:false,message:"Item Id and rating is required"})
    }
    if (rating<1 || rating>5) {
        return res.status(400).json({success:false,message:"rating must be between 1 to 5"})
    }

    const item = await Item.findById(itemId)
    if (!item) {
        return res.status(400).json({success:false,message:"Item not found"})
    }

    const newCount=item.rating.count +1;
    const newAverage=(item.rating.average*item.rating.count +rating)/newCount

    item.rating.count=newCount
    item.rating.average=newAverage
    
    await item.save()

    return res.status(200).json({rating:item.rating})
  } catch (error) {
    console.error(error);
    return res.status(500).json("server error");
  }
}

module.exports = {
  addItems,
  editItems,
  getItemById,
  deleteItem,
  getItemByCity,
  getItemByShop,
  searchItems,
  rating
};
