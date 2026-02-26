import React from "react";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { useEffect } from "react";
import { useState } from "react";
import { toast } from "sonner";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const DeliveryBoyDashboard = () => {
  const { userData, socket } = useSelector((store) => store.user);

  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null); 
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayDeliveries,setTodayDeliveries]=useState([]);

  useEffect(() => {
    if (!socket || userData?.user?.role !== "deliveryBoy") return;
    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          setDeliveryBoyLocation({ lat: latitude, lon: longitude });

          socket.emit("updateLocation", {
            latitude,
            longitude,
            userId: userData?.user?._id,
          });
        },
        (error) => {
          console.log(error);
        },
        {
          enableHighAccuracy: true,
        }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [socket, userData]);

 
    const ratePerDerlivery=50; 
    const totalEarning=todayDeliveries.reduce((sum,d)=>sum+d.count*ratePerDerlivery,0)


  const getAssignment = async () => {
    try {
      const response = await axios.get(
        `${serverUrl}/api/order/get-assignments`,
        { withCredentials: true }
      );
      setAvailableAssignments(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getCurrentOrder = async () => {
    try {
      setLoading(true); 

      const response = await axios.get(
        `${serverUrl}/api/order/get-current-order`,
        { withCredentials: true }
      );

      setCurrentOrder(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false); 
    }
  };

  const acceptOrder = async (assignmentId) => {
    try {
      const response = await axios.get(
        `${serverUrl}/api/order/accept-order/${assignmentId}`,
        { withCredentials: true }
      );
      await getCurrentOrder();
      if (response.data.success) {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sendOtp = async () => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        {
          orderId: currentOrder?.orderId,
          shopOrderId: currentOrder?.shopOrder?._id,
        },
        { withCredentials: true }
      );
      setShowOtpBox(true);

      if (response.data.success) {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/order/verify-delivery-otp`,
        {
          orderId: currentOrder?.orderId,
          shopOrderId: currentOrder?.shopOrder?._id,
          otp,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        location.reload()
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleTodayDeliveries = async () => {
    try {
      const response = await axios.get(
        `${serverUrl}/api/order/get-today-delivery`,
       
        { withCredentials: true }
      );

      console.log(response.data)
      setTodayDeliveries(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewAssignment = (data) => {
      if (data.sendTo === userData?.user?._id) {
        setAvailableAssignments((prev) => [...(prev || []), data]);
      }
    };

    socket.on("newAssignment", handleNewAssignment);

    return () => {
      socket.off("newAssignment", handleNewAssignment);
    };
  }, [socket, userData]);

  useEffect(() => {
    getAssignment();
    getCurrentOrder();
    handleTodayDeliveries()
  }, [userData]);

  return (
    <div className="w-screen flex items-center flex-col gap-5 min-h-screen">
      <Navbar />

      <div className="w-full max-w-[800px] flex flex-col gap-5 items-center">
        <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-start items-center w-[90%] border border-orange-100">
          <h1 className="font-bold text-xl text-orange-500 mb-2 ">
            Welcome, {userData?.user?.fullName}
          </h1>
          <p className="text-orange-500">
            <span className="font-semibold">Latitude:</span>
            {deliveryBoyLocation?.lat} ,{" "}
            <span className="font-semibold">Longitude:</span>
            {deliveryBoyLocation?.lon}
          </p>
        </div>


         <div className="bg-white rounded-2xl shadow-md p-5 w-[90%] mb-4 border border-orange-100">
          <h1 className="text-lg font-bold mb-3 text-orange-500">Today Deliveries</h1>

          <ResponsiveContainer width="100%" height={200}>
      <BarChart data={todayDeliveries}>
        <CartesianGrid strokeDasharray="3 3"/>
        <XAxis dataKey="hour" tickFormatter={(h)=>`${h}:00`} />
          <YAxis  allowDecimals={false} />
          <Tooltip formatter={(value)=>[value,"orders"]} labelFormatter={(label)=>`${label}:00`} />
            <Bar dataKey="count" fill="orange" />
      </BarChart>
          </ResponsiveContainer>

          <div className="max-w-sm mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg text-center">
            <h1 className="text-xl font-semibold text-gray-800 mb-2">Today's Earning</h1>
            <span className="text-2xl font-bold text-green-500">₹{totalEarning}</span>
          </div>
         </div>


        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
            <p className="text-center text-gray-600">Loading...</p>
          </div>
        )}

        {/* No Current Order */}
        {!loading && !currentOrder && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[90%]  border border-orange-100">
            <h1 className="flex items-center text-lg font-bold mb-2 gap-2">
              Availabel Orders
            </h1>

            <div className="space-y-4">
              {availableAssignments?.length > 0 ? (
                availableAssignments.map((a, index) => (
                  <div
                    key={index}
                    className="flex border rounded-lg p-4 justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-bold">{a?.shopName}</p>
                      <p className="text-sm font-medium text-gray-600">
                        <span className="text-gray-700 font-semibold">
                          Delivery Address:
                        </span>{" "}
                        {a?.deliveryAddress?.text}
                      </p>
                      <p className="font-xs text-gray-600">
                        {a?.items?.length} item | ₹{a?.subtotal}
                      </p>
                    </div>
                    <button
                      onClick={() => acceptOrder(a.assignmentId)}
                      className="bg-orange-500 px-2 py-1 text-white active:scale-95 cursor-pointer rounded-lg "
                    >
                      Accept
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-sm">No Available Orders</p>
              )}
            </div>
          </div>
        )}

        {/* Has Current Order */}
        {!loading && currentOrder && (
          <div className="bg-white p-5 shadow-md rounded-2xl w-[90%] border border-orange-100 mb-5">
            <h2 className="text-lg font-bold mb-3">📦Get Current Order</h2>

            <div className="border rounded-lg p-4 mb-3">
              <p className="text-sm font-semibold text-gray-900">
                {currentOrder?.shopName}
              </p>
              <p className="text-sm text-gray-800">
                {currentOrder?.deliveryAddress?.text}
              </p>
              <p className="text-xs text-gray-600">
                {currentOrder?.shopOrder?.shopOrderItems?.length} item | ₹
                {currentOrder?.shopOrder?.subtotal}
              </p>
            </div>

            <DeliveryBoyTracking
              data={{
                deliveryBoyLocation:
                  deliveryBoyLocation || {
                    lat: userData?.user?.location?.coordinates[1],
                    lon: userData?.user?.location?.coordinates[0],
                  },
                customerLocation: {
                  lat: currentOrder?.deliveryAddress?.latitude,
                  lon: currentOrder?.deliveryAddress?.longitude,
                },
              }}
            />

            {!showOtpBox ? (
              <button
                onClick={sendOtp}
                className="bg-green-500 text-white px-3 py-2 rounded-lg active:scale-95 mt-4 transition-all duration-300 w-full hover:bg-green-600 font-semibold cursor-pointer"
              >
                Mark As Delivered
              </button>
            ) : (
              <div className="mt-4 p-4 rounded-md bg-gray-50 border">
                <p className="text-sm font-semibold mb-2 text-gray-700">
                  Enter OTP send to{" "}
                  <span className="text-orange-500">
                    {currentOrder?.customer?.fullName}
                  </span>
                </p>
                <input
                  onChange={(e) => setOtp(e.target.value)}
                  value={otp}
                  type="text"
                  placeholder="Enter OTP"
                  className="px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 w-full border rounded-lg mb-3"
                />
                <button
                  className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 rounded-lg px-3 py-2 transition-all duration-300 text-white font-semibold cursor-pointer"
                  onClick={verifyOtp}
                >
                  Submit OTP
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryBoyDashboard;