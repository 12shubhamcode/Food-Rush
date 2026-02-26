import React, { useEffect,  useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FaUtensils } from "react-icons/fa6";
import { toast } from "sonner";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/slice/ownerSlice";
import { LuLoaderCircle } from "react-icons/lu";
import useGetMyShop from "../hooks/useGetMyShop";

const EditItem = () => {
  useGetMyShop();
  const { myShopData } = useSelector((store) => store.owner);
  const [currentItem, setCurrentItem] = useState(null);
  const categories = [
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
  ];
  const { itemId } = useParams();
  const [name, setName] = useState(currentItem?.name);
  const [price, setPrice] = useState(0);
  const [frontendImg, setFrontendImg] = useState("");
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("Veg");
  const [backendImg, setBackendImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handeleImage = (e) => {
    const file = e.target.files[0];
    setBackendImg(file);
    setFrontendImg(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("foodType", foodType);
      formData.append("price", price);
      if (backendImg) {
        formData.append("image", backendImg);
      }
      const response = await axios.post(
        `${serverUrl}/api/item/edit-item/${itemId}`,
        formData,
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        dispatch(setMyShopData(response.data.shop));
        navigate("/")
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  const handleGetItemById = async () => {
    try {
      const response = await axios.get(
        `${serverUrl}/api/item/get-by-id/${itemId}`,
        { withCredentials: true }
      );

      setCurrentItem(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  handleGetItemById();
}, [itemId]);


 useEffect(() => {
  if (!currentItem) return;

  setName(currentItem.name);
  setPrice(currentItem.price);
  setFrontendImg(currentItem.image);
  setCategory(currentItem.category);
  setFoodType(currentItem.foodType);
}, [currentItem]);


  return (
    <div className="bg-orange-50 flex justify-center flex-col items-center p-6 min-h-screen relative">
      <div className="absolute top-5 left-5 z-[10px] mb-2.5">
        <IoArrowBackOutline
          size={25}
          className="text-orange-600 cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>
      <div className="max-w-lg w-full bg-white shadow-lg rounded-2xl p-8 border border-orange-100">
        <div className="flex flex-col mb-5 items-center">
          <div className="bg-orange-100 p-4 rounded-full mb-4 text-orange-500">
            <FaUtensils size={25} />
          </div>
          <div className="text-2xl font-bold text-gray-900">Edit Food</div>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm block font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter item name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div>
            <label className="text-sm block font-medium text-gray-700 mb-1">
              Food Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handeleImage}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            {frontendImg && (
              <div className="mt-2">
                <img
                  src={frontendImg}
                  alt=""
                  className="w-full h-48 object-cover rounded-lg border "
                />
              </div>
            )}
          </div>
          <div>
            <label className="text-sm block font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              placeholder="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div>
            <label className="text-sm block font-medium text-gray-700 mb-1">
              Select Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 cursor-pointer"
            >
              <option value="">Select Category</option>
              {categories.map((cate, index) => (
                <option value={cate} key={index}>
                  {cate}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm block font-medium text-gray-700 mb-1">
              Select Food Type
            </label>
            <select
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 cursor-pointer"
            >
              <option value="Veg">Veg</option>
              <option value="Non veg">Non Veg</option>
            </select>
          </div>

          {loading ? (
            <button className="px-4 py-3 mt-4 text-center bg-orange-600 text-white w-full flex items-center justify-center gap-2 border cursor-pointer rounded-lg hover:bg-orange-500 transition-all duration-300">
              <LuLoaderCircle className="mr-4 h-5 w-5 animate-spin text-white" />{" "}
              please wait
            </button>
          ) : (
            <button className="px-4 py-3 mt-4 text-center bg-orange-600 text-white w-full flex items-center justify-center gap-2 border cursor-pointer rounded-lg hover:bg-orange-500 transition-all duration-300">
              Edit Food
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditItem;
