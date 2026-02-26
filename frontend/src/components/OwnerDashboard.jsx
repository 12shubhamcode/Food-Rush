import React from "react";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import { FaPen, FaUtensils } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import OwnerItemCard from "./OwnerItemCard";
import useGetMyShop from "../hooks/useGetMyShop";

const OwnerDashboard = () => {
  useGetMyShop();
  const { myShopData } = useSelector((store) => store.owner);
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />

      {/* NO SHOP */}
      {!myShopData && (
        <div className="flex justify-center items-center px-4 py-12">
          <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col items-center text-center px-8 py-10">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-500 mb-6">
                <FaUtensils size={28} />
              </div>

              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Add Your Restaurant
              </h2>

              <p className="text-gray-500 text-sm leading-relaxed">
                Start managing your restaurant by adding your shop details.
                Showcase your menu and reach more customers.
              </p>

              <button
                onClick={() => navigate("/create-edit-shop")}
                className="flex px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition cursor-pointer gap-2 mt-3"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHOP EXISTS */}
      {myShopData && (
        <div className="w-full flex flex-col items-center gap-6 px-4 sm:px-6 ">
          <h1 className="text-2xl sm:text-3xl text-gray-900 flex items-center text-center gap-4 font-bold mt-8">
            <FaUtensils size={30} className="text-orange-500" />
            Welcome to {myShopData.name}
          </h1>

          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-orange-100 hover:shadow-2xl transition-all duration-300 w-full max-w-3xl relative">
            <div
              className="absolute top-1 right-1 bg-orange-500 text-white rounded-full shadow-md hover:bg-orange-600 transition-colors cursor-pointer p-3"
              onClick={() => navigate("/create-edit-shop")}
            >
              <FaPen />
            </div>

            <img
              src={myShopData.image}
              alt={myShopData.name}
              className="w-full h-48 sm:h-64 object-cover"
            />

            <div className="p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl text-gray-800 font-semibold mb-2">
                {myShopData.name}
              </h1>
              <p className="text-gray-600 ">
                {myShopData.city},{myShopData.state}
              </p>
              <p className="text-gray-600 mb-1">{myShopData.address}</p>
            </div>
          </div>

          {/* EMPTY ITEMS */}
          {Array.isArray(myShopData.items) &&
            myShopData.items.length === 0 && (
              <div className="flex justify-center items-center px-4 py-12">
                <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col items-center text-center px-8 py-10">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-500 mb-6">
                      <FaUtensils size={28} />
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                      Your Food item
                    </h2>

                    <p className="text-gray-500 text-sm leading-relaxed">
                      Share your delicious creations with your customers by
                      adding them to menu.
                    </p>

                    <button
                      onClick={() => navigate("/add-food")}
                      className="flex px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition cursor-pointer gap-2 mt-3"
                    >
                      Add Food
                    </button>
                  </div>
                </div>
              </div>
            )}

          {/* ITEMS LIST */}
          {Array.isArray(myShopData.items) &&
            myShopData.items.length > 0 && (
              <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
                {myShopData.items.map((item, index) => (
                  <OwnerItemCard data={item} key={item._id || index} />
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
