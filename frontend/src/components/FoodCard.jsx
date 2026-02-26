import { useState } from "react";
import {
  FaCartShopping,
  FaDrumstickBite,
  FaLeaf,
  FaMinus,
  FaPlus,
  FaRegStar,
  FaStar,
} from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/slice/userSlice";

const FoodCard = ({ data }) => {
  const { cartItems } = useSelector((store) => store.user);
  const [quantity, setQuantity] = useState(0);
  const dispatch = useDispatch();

  const renderstars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar className="text-yellow-500 text-lg" />
        ) : (
          <FaRegStar className="text-yellow-500 text-lg" />
        ),
      );
    }
    return stars;
  };

  const handleIncrease = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
  };
  const handleDecrease = () => {
    const newQuantity = quantity - 1;
    if (quantity > 0) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="mt-5 w-55 bg-white shadow-md hover:shadow-xl rounded-lg transition-all duration-300 border-2 border-orange-200 flex flex-col overflow-hidden">
      <div className="flex justify-center items-center w-full h-40 relative bg-white">
        <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow">
          {data.foodType === "Veg" ? (
            <FaLeaf className="text-xl text-green-600" />
          ) : (
            <FaDrumstickBite className="text-xl text-red-600" />
          )}
        </div>
        <img
          src={data?.image}
          alt=""
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="flex-1 flex flex-col p-4">
        <h1 className="font-semibold text-gray-900 text-base truncate">
          {data?.name}
        </h1>
        <div className="flex gap-1 items-center mt-1">
          {renderstars(data?.rating?.average || 0)}
          <span className="text-sm text-gray-600">
            {data?.rating?.count || 0}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-auto p-3">
        <span className="text-gray-900 text-lg font-bold ">₹{data?.price}</span>
        <div className="flex items-center rounded-full  border overflow-hidden shadow-sm">
          <button
            className="px-2 py-1 hover:bg-gray-100 transition cursor-pointer"
            onClick={handleDecrease}
          >
            <FaMinus size={12} />
          </button>
          <span>{quantity}</span>
          <button
            className="px-2 py-1 hover:bg-gray-100 transition cursor-pointer"
            onClick={handleIncrease}
          >
            <FaPlus size={12} />
          </button>
          <button
            onClick={() =>{
              quantity>0?
              dispatch(
                addToCart({
                  id: data._id,
                  name: data.name,
                  price: data.price,
                  image: data.image,
                  shop: data.shop,
                  quantity,
                  foodType: data.foodType,
                }),
              ):null
             } }
            className={`${
              cartItems.some((i) => i?.id === data?._id)
                ? "bg-gray-800"
                : "bg-orange-500"
            } text-white px-3 py-2 transition-colors cursor-pointer`}
          >
            <FaCartShopping size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
