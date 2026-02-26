import axios from "axios";
import React, { useEffect, useState } from "react";
import { serverUrl } from "../App";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaLocationDot, FaStore, FaUtensils } from "react-icons/fa6";
import FoodCard from "../components/FoodCard";

const ShopItems = () => {
  const { shopId } = useParams();
  const [items,setItems]=useState([]);
  const [shop,setShop]=useState([]);
  const navigate=useNavigate();

  const handleShopItems = async () => {

    try {
      const response = await axios.get(
        `${serverUrl}/api/item/get-item-by-shop/${shopId}`,
        { withCredentials: true },
      );
      setShop(response?.data?.shop)
      setItems(response?.data?.items)
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleShopItems();
  }, [shopId]);

  return <div className="min-h-screen bg-gray-100">
    {shop && 
    <div className="relative w-full md:h-80 lg:h-96 h-64">
<button onClick={()=>navigate("/")} className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-full shadow transition cursor-pointer"><FaArrowLeft size={20}/> <span className="text-white font-semibold">Back</span></button>

        <img src={shop?.image} alt=""  className="w-full h-full object-cover" />
        <div className="absolute flex flex-col items-center justify-center text-center px-4 inset-0 bg-gradient-to-b from-black/70 to-black/30">
        <FaStore className="text-white text-4xl mb-3 drop-shadow-md"/>
        <h1 className="text-3xl md:text-5xl text-white font-extrabold drop-shadow-lg">{shop?.name}</h1>
        <div className="mt-3 flex items-center gap-2">
            <FaLocationDot className="text-xl text-red-600/90 "/>
            <p className="text-xl font-medium text-white/90 ">{shop?.address}</p>
        </div>
            </div>
    </div>
    }

    <div className="max-w-7xl mx-auto px-6 py-10">
<h2 className="flex items-center justify-center gap-3 text-3xl font-bold mb-10 text-gray-800"><FaUtensils color="red" /> Our Menu</h2>
{items?.length>0?(
    <div className="flex flex-wrap justify-center gap-8">
        {items.map((item)=>(
            <FoodCard data={item} />
        ))}
    </div>
):(
    <p className="text-xl font-medium text-gray-700 text-center">No Items Available</p>
)}
    </div>
  </div>;
};

export default ShopItems;
