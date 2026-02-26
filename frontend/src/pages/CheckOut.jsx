import React, { useEffect, useState } from "react";
import {
  IoArrowBackOutline,
  IoLocationSharp,
  IoSearchOutline,
} from "react-icons/io5";
import { FaCreditCard, FaMobileAlt } from "react-icons/fa";
import { MdDeliveryDining, MdOutlineMyLocation } from "react-icons/md";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { setCurraddress, setLocation } from "../redux/slice/mapSlice";
import { serverUrl } from "../App";
import axios from "axios";
import { toast } from "sonner";
import { addMyOrder } from "../redux/slice/userSlice";

const RecenterMap = ({ location }) => {
  if (location?.lat && location?.lon) {
    const map = useMap();
    map.setView([location?.lat, location?.lon], 16, { animate: true });
  }
  return null;
};

const CheckOut = () => {
  const { location, curraddress } = useSelector((store) => store.map);
  const { cartItems, totalAmount, userData } = useSelector(
    (store) => store.user,
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [addressInput, setAddressInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const deliveryFee = totalAmount > 500 ? 0 : 40;
  const amountWithDeliveryFee = totalAmount + deliveryFee;

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng;
    dispatch(setLocation({ lat, lon: lng }));
    getAddressByLatLng(lat, lng);
  };

  const getCurrentLocation = () => {
    const latitude = userData?.user?.location?.coordinates?.[1];
    const longitude = userData?.user?.location?.coordinates?.[0];

    dispatch(setLocation({ lat: latitude, lon: longitude }));
    getAddressByLatLng(latitude, longitude);
  };

  const getAddressByLatLng = async (lat, lng) => {
    const response = await axios.get(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${
        import.meta.env.VITE_GEO_APIKEY
      }`,
    );
    dispatch(setCurraddress(response?.data?.results[0]?.formatted));
  };

  const getLatLngByAddress = async () => {
    try {
      const response = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${
          import.meta.env.VITE_GEO_APIKEY
        }`,
      );
      const { lat, lon } = response?.data?.features[0]?.properties;
      dispatch(setLocation({ lat, lon }));
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setAddressInput(curraddress);
  }, [curraddress]);

  const handlePlaceOrder = async () => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/order/place-order`,
        {
          paymentMethod,
          deliveryAddress: {
            text: addressInput,
            latitude: location?.lat,
            longitude: location?.lon,
          },
          totalAmount,
          cartItems,
        },
        { withCredentials: true },
      );
      if (paymentMethod === "cod") {
        dispatch(addMyOrder(response.data));
        navigate("/order-placed");
      } else {
        const orderId = response.data.orderId;
        const razorOrder = response.data.razorOrder;
        openRazorpayWindow(orderId, razorOrder);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    }
  };

  const openRazorpayWindow = (orderId, razorOrder) => {
    const optios = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: "INR",
      name: "Food Rush",
      description: "Food delivery website",
      order_id: razorOrder.id,
      handler: async function (evnet) {
        try {
          const response = await axios.post(
            `${serverUrl}/api/order/verify-payment`,
            {
              razorpay_payment_id: evnet.razorpay_payment_id,
              orderId,
            },
            { withCredentials: true },
          );
          dispatch(addMyOrder(response.data));
          navigate("/order-placed");
        } catch (error) {
          console.log(error);
          toast.error(error.response?.data?.message);
        }
      },
    };

    const rzp = new window.Razorpay(optios);
    rzp.open();
  };

  return (
    <div className="bg-orange-50 min-h-screen flex items-center justify-center p-6 ">
      <div className="absolute top-5 left-5 z-[10px] mb-2.5">
        <IoArrowBackOutline
          size={25}
          className="text-orange-600 cursor-pointer"
          onClick={() => navigate("/cart")}
        />
      </div>

      <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h1 className="text-2xl text-gray-800 font-bold">Checkout</h1>
        {/* map section  */}
        <section>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
            <IoLocationSharp size={25} className="text-orange-500" /> Delivery
            Location
          </h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Enter your delivery address..."
              className="flex-1 border p-2 rounded-lg border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              onClick={getLatLngByAddress}
              className="bg-orange-500 hover:bg-orange-600 rounded-lg text-white px-3 py-2 flex items-center justify-center cursor-pointer"
            >
              {" "}
              <IoSearchOutline size={25} />{" "}
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 rounded-lg text-white px-3 py-2 flex items-center justify-center cursor-pointer">
              {" "}
              <MdOutlineMyLocation
                onClick={getCurrentLocation}
                size={25}
              />{" "}
            </button>
          </div>

          <div className="rounded-xl overflow-hidden border">
            <div className="w-full h-64 flex items-center justify-center">
              <MapContainer
                className={"w-full h-full"}
                center={[location?.lat, location?.lon]}
                zoom={16}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap location={location} />
                <Marker
                  position={[location?.lat, location?.lon]}
                  draggable
                  eventHandlers={{ dragend: onDragEnd }}
                />
              </MapContainer>
            </div>
          </div>
        </section>

        {/* payment section  */}
        <section>
          <h2 className="text-lg text-gray-800 font-semibold mb-3">
            Payment Method
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setPaymentMethod("cod")}
              className={`flex cursor-pointer  items-center gap-3 rounded-xl text-left p-4 border transition ${paymentMethod === "cod" ? "border-orange-500 bg-orange-50 shadow" : "border-gray-200 hover:border-gray-300"}`}
            >
              <span className="inline-flex h-10 w-10 bg-green-100 items-center justify-center rounded-full">
                <MdDeliveryDining size={22} className="text-green-600" />
              </span>
              <div>
                <p className="font-medium text-gray-800">Cash On Delivery</p>
                <p className="text-sm text-gray-600">
                  Pay when your food arrives
                </p>
              </div>
            </div>
            <div
              onClick={() => setPaymentMethod("online")}
              className={`flex cursor-pointer items-center gap-3 rounded-xl text-left p-4 border transition ${paymentMethod === "online" ? "border-orange-500 bg-orange-50 shadow" : "border-gray-200 hover:border-gray-300"}`}
            >
              <span className="inline-flex h-10 w-10 bg-purple-100 items-center justify-center rounded-full">
                <FaMobileAlt className="text-purple-600" size={22} />
              </span>
              <span className="inline-flex h-10 w-10 bg-blue-100 items-center justify-center rounded-full">
                <FaCreditCard className="text-blue-600" size={22} />
              </span>
              <div>
                <p className="text-gray-800 font-medium">
                  UPI / Credit card / Debit card
                </p>
                <p className="text-gray-600 text-sm">Pay Securly Online</p>
              </div>
            </div>
          </div>
        </section>

        {/* order summary section  */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Order Summary
          </h2>
          <div className="rounded-xl border p-4 bg-gray-50 space-y-2">
            {cartItems.map((item, index) => (
              <div
                key={index}
                className="flex justify-between text-sm text-gray-700"
              >
                <span>
                  {item?.name} x {item?.quantity}
                </span>
                <span>₹{item?.price * item?.quantity}</span>
              </div>
            ))}
            <hr className="border-gray-200 my-2" />
            <div className="text-gray-800 font-medium flex justify-between">
              <span>Subtotal</span>
              <span>₹{totalAmount}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-orange-500 pt-2">
              <span>Total</span>
              <span>₹{amountWithDeliveryFee}</span>
            </div>
          </div>
        </section>

        <button
          onClick={handlePlaceOrder}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold py-3 cursor-pointer active:scale-95 transition-all duration-300 text-xl"
        >
          {paymentMethod === "cod" ? "Place Order" : "Pay & Place Order"}
        </button>
      </div>
    </div>
  );
};

export default CheckOut;
