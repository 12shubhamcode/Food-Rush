import React from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CartItemCard from "../components/CartItemCard";
const CartPage = () => {
  const { cartItems, totalAmount } = useSelector((store) => store.user);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-orange-50 flex justify-center p-6 ">
      <div className="max-w-[800px] w-full">
        <div className="flex items-center gap-5 mb-4">
          <div className="absolute top-5 left-5 z-[10px] mb-2.5">
            <IoArrowBackOutline
              size={25}
              className="text-orange-600 cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>
          <h1 className="text-gray-900 text-2xl font-bold text-start">
            Your Cart
          </h1>
        </div>
        {cartItems?.length === 0 ? (
          <p className="text-gray-700 text-xl text-center">
            Your cart is empty
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {cartItems?.map((item, index) => (
                <CartItemCard key={index} data={item} />
              ))}
            </div>

            <div className="bg-white rounded-xl mt-6 p-4 shadow flex justify-between items-center border">
              <h1 className="text-lg font-semibold">Total amout </h1>
              <span className="text-xl font-bold text-orange-600">
                ₹{totalAmount}
              </span>
            </div>
            <div className="mt-3 flex justify-end">
              <button onClick={()=>navigate("/checkout")} className="px-5 py-4 bg-orange-500 text-white rounded-xl text-xl active:scale-95 font-medium cursor-pointer">
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
