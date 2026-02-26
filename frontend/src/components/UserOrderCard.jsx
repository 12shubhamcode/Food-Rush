import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";

const UserOrderCard = ({ data }) => {
  const [selectedRating, setSelectedRating] = useState({}); //itemId:rating
  const navigate = useNavigate();
  const formateDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleRating = async (itemId, rating) => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/item/rating`,
        {
          itemId,
          rating,
        },
        { withCredentials: true },
      );
      setSelectedRating((prev) => ({
        ...prev,
        [itemId]: rating,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white p-4 shadow rounded-lg space-y-4">
      <div className="flex justify-between border-b pb-2">
        <h2 className="font-semibold">Order #{data?._id.slice(-6)}</h2>
        <p className="text-sm text-gray-600">
          Date: {formateDate(data?.createdAt)}
        </p>
        <div className="text-right">
          {data.paymentMethod === "cod" ? (
            <p className="text-gray-600 text-sm">
              {data?.paymentMethod?.toUpperCase()}
            </p>
          ) : (
            <p className="text-gray-600 text-sm ">
              <span className="font-semibold text-gray-700">Payment: </span>
              {data?.payment ? "True" : "False"}
            </p>
          )}

          <p className="text-blue-600">{data?.shopOrders[0]?.status}</p>
        </div>
      </div>

      {data?.shopOrders?.map((shopOrder, index) => (
        <div
          key={index}
          className="border rounded-lg p-3 bg-orange-50 space-y-3"
        >
          <p className="font-medium">{shopOrder?.shop?.name}</p>

          <div className="flex overflow-x-auto space-x-4 pb-2">
            {shopOrder?.shopOrderItems?.map((item, index) => (
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

                {data?.shopOrders[0]?.status === "delivered" && (
                  <div className="flex space-x-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(item?.item?._id, star)}
                        className={`text-xl cursor-pointer ${
                          selectedRating[item?.item?._id] >= star
                            ? "text-yellow-500"
                            : "text-gray-500"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center border-t pt-2">
            <p className="font-semibold">Subtotal: ₹{shopOrder?.subtotal}</p>
            <span className="text-blue-600 text-sm font-semibold">
              {" "}
              {shopOrder?.status}
            </span>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center border-t pt-2">
        <h1 className="font-bold text-lg text-gray-900">
          Total: ₹{data?.totalAmount}
        </h1>
        {data?._id && (
          <button
            onClick={() => navigate(`/track-order/${data._id}`)}
            className="text-white bg-orange-500 rounded-xl p-4 font-semibold cursor-pointer active:scale-95"
          >
            Track Order
          </button>
        )}
      </div>
    </div>
  );
};

export default UserOrderCard;
