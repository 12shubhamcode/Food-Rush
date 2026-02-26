import React from "react";
import { useNavigate } from "react-router-dom";
import { MdCheckCircle } from "react-icons/md";

const OrderPlaced = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center space-y-6">
        
        {/* Success Icon */}
        <div className="flex justify-center">
          <MdCheckCircle size={90} className="text-green-500" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800">
          Order Placed Successfully!
        </h1>

        {/* Message */}
        <p className="text-gray-600 text-sm">
          Thank you for your order 🎉  
          Your food is being prepared and will be delivered soon.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={() => navigate("/my-orders")}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition active:scale-95"
          >
            View My Orders
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full border border-orange-500 text-orange-500 py-3 rounded-xl font-semibold hover:bg-orange-50 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPlaced;
