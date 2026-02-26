const express = require("express");
const { createAndEditShop, getMyShop, getShopByCity } = require("../controller/shopController");
const isAuth = require("../middleware/isAuth");
const upload = require("../middleware/multer");

const router = express.Router();

router.post("/create-edit-shop", isAuth, upload.single("image"), createAndEditShop);
router.get("/get-my-shop", isAuth, getMyShop);
router.get("/get-shop-by-city/:city", getShopByCity);

module.exports = router;
