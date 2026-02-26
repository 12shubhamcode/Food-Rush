import React from "react";
import { FaMinus, FaPlus, FaTrash } from "react-icons/fa6";
import { useDispatch } from "react-redux";
import { removeCartItem, updateQuantity } from "../redux/slice/userSlice";

const CartItemCard = ({ data }) => {
  const dispatch = useDispatch();

  const handleIncrease = (id, currentQty) => {
    dispatch(updateQuantity({ id, quantity: currentQty + 1 }));
  };
  const handleDecrease = (id, currentQty) => {
    if (currentQty > 1) {
      dispatch(updateQuantity({ id, quantity: currentQty - 1 }));
    }
  };
  const handleRemoveItem = (id) => {
    dispatch(removeCartItem(id));
  };

  return (
    <div className="flex items-center justify-between bg-white p-4 shadow border rounded-xl">
      <div className="flex items-center gap-4">
        <img
          src={data?.image}
          alt=""
          className="h-24 w-24 object-cover rounded-md border"
        />
        <div>
          <h1 className="font-medium text-gray-800">{data?.name}</h1>
          <p className="text-sm text-gray-600">
            ₹{data?.price} x {data?.quantity}
          </p>
          <p className="text-gray-800 font-bold">
            ₹{data?.price * data?.quantity}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => handleDecrease(data?.id, data?.quantity)}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200  cursor-pointer"
        >
          <FaMinus size={12} />
        </button>
        <span>{data?.quantity}</span>
        <button
          onClick={() => handleIncrease(data?.id, data?.quantity)}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200  cursor-pointer"
        >
          <FaPlus size={12} />
        </button>
        <button
          onClick={() => handleRemoveItem(data?.id)}
          className="p-2 bg-red-100 text-red-500 rounded-full hover:bg-red-200 cursor-pointer"
        >
          <FaTrash size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItemCard;
