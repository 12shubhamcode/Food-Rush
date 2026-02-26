import React from "react";
import { useSelector } from "react-redux";
import UserDashboard from "../components/UserDashboard";
import OwnerDashboard from "../components/OwnerDashboard";
import DeliveryBoyDashboard from "../components/DeliveryBoyDashboard";

const Home = () => {
  const { userData } = useSelector((store) => store.user);

  return (
    <div className="w-[100vw] min-h-[100vh] pt-[100px] flex flex-col items-center bg-orange-50 ">
      {userData?.user?.role === "user" && <UserDashboard />}
      {userData?.user?.role === "owner" && <OwnerDashboard />}
      {userData?.user?.role === "deliveryBoy" && <DeliveryBoyDashboard />}
    </div>
  );
};

export default Home;
