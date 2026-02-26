import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { useEffect } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import DeliveryBoyTracking from "../components/DeliveryBoyTracking";
import { useSelector } from "react-redux";

const TrackOrder = () => {
  const {socket}=useSelector((store)=>store.user)
  const { orderId } = useParams();
  const [currentOrder,setCurrentOrder]=useState();
  const [liveLocations,setLiveLocations]=useState({});
  const navigate=useNavigate();
  const handleGetOrder = async () => {
    try {
      const response = await axios.get(
        `${serverUrl}/api/order/get-order-by-id/${orderId}`,
        { withCredentials: true },
      );
     setCurrentOrder(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(()=>{
socket.on("updateDeliveryLocation",({deliveryBoyId,latitude,longitude})=>{
setLiveLocations(prev=>({
  ...prev,
  [deliveryBoyId]:{lat:latitude,lon:longitude}
}))
})
  },[])

  useEffect(() => {

    handleGetOrder();
  }, [orderId]);
  return <div className="max-w-4xl mx-auto p-4 flex flex-col gap-4 ">
    <div className="relative top-5 left-5 z-[10px] mb-2.5 flex items-center gap-4">
            <IoArrowBackOutline
              size={25}
              className="text-orange-600 cursor-pointer"
              onClick={() => navigate("/")}
            />
            <h1 className="text-2xl font-bold md:text-center">Track order</h1>
          </div>

          {currentOrder?.shopOrders?.map((shopOrder,index)=>(
            <div key={index} className="bg-white shadow-md rounded-xl space-y-2 p-4 border border-orange-200">
              <div>
                 <p className="text-lg font-bold mb-2 text-orange-500">{shopOrder?.shop?.name}</p>
               <p ><span className="font-semibold">Items: </span>{shopOrder?.shopOrderItems?.map((item)=>item?.name).join(",")}</p>
               <p> <span className="font-semibold">Subtotal: </span>₹{shopOrder?.subtotal}</p>
               <p><span className="font-semibold">Delivery Address: </span>{currentOrder?.deliveryAddress?.text}</p>
              </div>

              {shopOrder?.status!=="delivered"?<>
              <h2 className="text-xl text-orange-600 font-bold mt-4">Delivery Boy</h2>
              {shopOrder?.assignedDeliveryBoy?
               <div>
                <p ><span className="font-semibold">Name: </span>{shopOrder?.assignedDeliveryBoy?.fullName}</p>
                <p ><span className="font-semibold">Contact No: </span>{shopOrder?.assignedDeliveryBoy?.mobile}</p>
              </div> : <p>Delivery boy not assigned yet.</p> }
              </>: <p className="font-bold text-2xl text-green-600">Delivered</p> }

              {shopOrder?.assignedDeliveryBoy && shopOrder?.status!=="delivered" &&
              <div className="h-[400px w-full rounded-2xl overflow-hidden shadow-md]">
                <DeliveryBoyTracking data={{
                deliveryBoyLocation: liveLocations[shopOrder?.assignedDeliveryBoy?._id]||{ 
                 
                  lat:shopOrder?.assignedDeliveryBoy?.location?.coordinates[1],
                  lon:shopOrder?.assignedDeliveryBoy?.location?.coordinates[0]
                },
                customerLocation:{
                  lat:currentOrder?.deliveryAddress?.latitude,
                  lon:currentOrder?.deliveryAddress?.longitude
                }
              }} />
              </div>
              }
            </div>
          ))}
  </div>;
};

export default TrackOrder;
