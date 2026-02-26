import React from "react";
import { MdPhone } from "react-icons/md";
import axios from "axios";
import { serverUrl } from "../App";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../redux/slice/userSlice";
import { useState } from "react";

const OwnerOrderCard = ({ data }) => {
  const [availableBoys, setAvailableBoys] = useState([]);
  const dispatch = useDispatch();
  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true },
      );
      if (response.data.success) {
        toast.success(response.data.message);
        dispatch(updateOrderStatus({ orderId, shopId, status }));
        setAvailableBoys(response.data.availableBoys);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div className="bg-white p-4 shadow rounded-lg space-y-">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {data?.user?.fullName}
        </h2>
        <p className="text-gray-600 text-sm">{data?.user?.email}</p>
        <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
          {" "}
          <MdPhone /> <span>{data?.user?.mobile}</span>
        </p>
        {data.paymentMethod === "online" ? (
          <p className="text-gray-600 text-sm">
            Payment: {data?.payment ? "True" : "False"}
          </p>
        ) : (
          <p className="text-gray-600 text-sm">
            Payment method: {data?.paymentMethod}
          </p>
        )}
      </div>

      <div className="flex items-start text-gray-600 gap-2 text-sm flex-col">
        <p>{data?.deliveryAddress?.text}</p>
        <p className="text-xs text-gray-600">
          Lat: {data?.deliveryAddress?.latitude} , Lon:{" "}
          {data?.deliveryAddress?.longitude}
        </p>
      </div>
      <div>
        <div className="flex overflow-x-auto space-x-4 pb-1 mt-2">
          {data?.shopOrders?.[0]?.shopOrderItems?.map((item, index) => (
            <div
              key={index}
              className="shrink-0 w-40 border rounded-lg p-1 bg-white"
            >
              <img
                src={item?.item?.image}
                alt=""
                className="rounded-lg w-full object-cover"
              />
              <p className="text-gray-700 font-semibold text-sm text-center mt-1">
                {item?.name}
              </p>
              <p className="text-gray-700 font-semibold text-sm text-center mt-1">
                Qty: {item?.quantity} x ₹{item?.price}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200">
          <p className="text-sm ">
            status:{" "}
            <span className="text-orange-500 font-semibold capitalize">
              {data?.shopOrders?.[0]?.status}
            </span>{" "}
          </p>
          <select
            onChange={(e) =>
              handleUpdateStatus(
                data?._id,
                data?.shopOrders?.[0]?.shop?._id,
                e.target.value,
              )
            }
            className="rounded-lg px-3 py-1 border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500  cursor-pointer"
          >
            <option value="">Change</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="out of delivery">Out Of Delivery</option>
          </select>
        </div>
      </div>

      {data?.shopOrders[0]?.status === "out of delivery" && (
        <div className="mt-3 p-2 border rounded-lg text-sm bg-orange-50">
          {data?.shopOrders[0]?.assignedDeliveryBoy ? (
            <p className="text-gray-700 font-medium">Assigned Delivery Boys:</p>
          ) : (
            <p className="text-gray-700 font-medium">Available Delivery Boy</p>
          )}

          {availableBoys?.length > 0 ? (
            availableBoys?.map((b, index) => (
              <div className="text-gray-800">
                {b?.fullName}-{b?.mobile}
              </div>
            ))
          ) : data?.shopOrders[0]?.assignedDeliveryBoy ? (
            <div>
              {data?.shopOrders[0]?.assignedDeliveryBoy?.fullName} -{" "}
              {data?.shopOrders[0]?.assignedDeliveryBoy?.mobile}{" "}
            </div>
          ) : (
            <div>Waiting for delivery boy to accept</div>
          )}
        </div>
      )}

      <div className="text-right font-bold text-gray-900 text-sm mt-2">
        <p>Total: ₹{data?.shopOrders?.[0]?.subtotal}</p>
      </div>
    </div>
  );
};

export default OwnerOrderCard;
