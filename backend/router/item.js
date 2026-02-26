const express = require("express");
const isAuth = require("../middleware/isAuth");
const {
  addItems,
  editItems,
  getItemById,
  deleteItem,
  getItemByCity,
  getItemByShop,
  searchItems,
  rating,
} = require("../controller/itemController");
const upload = require("../middleware/multer");

const router = express.Router();

router.post("/add-item", isAuth, upload.single("image"), addItems);
router.post("/edit-item/:itemId", isAuth, upload.single("image"), editItems);
router.get("/get-by-id/:itemId", isAuth, getItemById);
router.delete("/delete/:itemId", isAuth, deleteItem);
router.get("/get-item-by-city/:city",isAuth, getItemByCity);
router.get("/get-item-by-shop/:shopId",isAuth, getItemByShop);
router.get("/search-items",isAuth, searchItems);
router.post("/rating",isAuth, rating);

module.exports = router;
