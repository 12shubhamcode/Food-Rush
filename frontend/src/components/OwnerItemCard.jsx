import React from "react";
import { FaPen, FaTrash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../redux/slice/ownerSlice";
import { toast } from "sonner";
import axios from "axios";

const OwnerItemCard = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleDeleteItem = async () => {
    try {

      const response = await axios.delete(
        `${serverUrl}/api/item/delete/${data._id}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        dispatch(setMyShopData(response.data.shop));
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    }
  };

 return (
  <div className="w-full max-w-2xl mb-5 bg-white border border-orange-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
    <div className="flex gap-4 p-4">
      {/* Image */}
      <div className="w-28 h-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={data?.image}
          alt={data?.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 leading-tight">
            {data.name}
          </h2>

          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium">
              {data.category}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
              {data.foodType}
            </span>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-lg font-bold text-orange-600">
            ₹{data.price}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/edit-item/${data._id}`)}
              className="p-2 rounded-full text-orange-500 hover:bg-orange-100 transition"
              title="Edit item"
            >
              <FaPen size={16} />
            </button>

            <button
              onClick={handleDeleteItem}
              className="p-2 rounded-full text-red-500 hover:bg-red-100 transition"
              title="Delete item"
            >
              <FaTrash size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

};

export default OwnerItemCard;
