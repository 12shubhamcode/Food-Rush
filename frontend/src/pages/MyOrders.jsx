import React from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";
import { useEffect } from "react";
import { setMyOrders } from "../redux/slice/userSlice";

const MyOrders = () => {
  const { userData, myOrders,socket } = useSelector((store) => store.user);
  const navigate = useNavigate();
  const dispatch=useDispatch();



  return (
    <div className="min-h-screen bg-orange-50 flex justify-center w-full px-4">
      <div className="w-full max-w-[800px] p-4">
        <div className="absolute top-5 left-5 z-[10px] mb-2.5">
          <IoArrowBackOutline
            size={25}
            className="text-orange-600 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Orders</h1>
        <div className="space-y-6">
          {myOrders?.map((order, index) =>
            userData?.user?.role === "user" ? (
              <UserOrderCard data={order} key={index} />
            ) : userData?.user?.role === "owner" ? (
              <OwnerOrderCard data={order} key={index} />
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
