import React, { useEffect, useRef, useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa6";
import { toast } from "sonner";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/slice/ownerSlice";
import { LuLoaderCircle } from "react-icons/lu";
import useGetMyShop from "../hooks/useGetMyShop";

const CreateEditShop = () => {
  useGetMyShop();
  const { myShopData } = useSelector((store) => store.owner);
  const { city, state, address } = useSelector((store) => store.user);
  const [name, setName] = useState(myShopData?.name || "");
  const [addresses, setAddresses] = useState(myShopData?.address || address);
  const [cities, setCities] = useState(myShopData?.city || city);
  const [states, setStates] = useState(myShopData?.state || state);
  const [frontendImg, setFrontendImg] = useState(myShopData?.image || null);
  const [backendImg, setBackendImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handeleImage = (e) => {
    const file = e.target.files[0];
    setBackendImg(file);
    setFrontendImg(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("city", cities);
      formData.append("state", states);
      formData.append("address", addresses);
      if (backendImg) {
        formData.append("image", backendImg);
      }
      const response = await axios.post(
        `${serverUrl}/api/shop/create-edit-shop`,
        formData,
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        dispatch(setMyShopData(response.data.shop));
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  if (!myShopData) return;

  setName((prev) => prev || myShopData.name || "");
  setAddresses((prev) => prev || myShopData.address || "");
  setCities((prev) => prev || myShopData.city || "");
  setStates((prev) => prev || myShopData.state || "");
  setFrontendImg((prev) => prev || myShopData.image || null);
}, [myShopData]);



  return (
    <div className="bg-orange-50 flex justify-center flex-col items-center p-6 min-h-screen relative">
      <div className="absolute top-5 left-5 z-[10px] mb-2.5">
        <IoArrowBackOutline
          size={25}
          className="text-orange-600 cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>
      <div className="max-w-lg w-full bg-white shadow-lg rounded-2xl p-8 border border-orange-100">
        <div className="flex flex-col mb-5 items-center">
          <div className="bg-orange-100 p-4 rounded-full mb-4 text-orange-500">
            <FaUtensils size={25} />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {myShopData ? "Edit shop" : "Add shop"}
          </div>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm block font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter Shop name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div>
            <label className="text-sm block font-medium text-gray-700 mb-1">
              Shop Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handeleImage}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            {frontendImg && (
              <div className="mt-2">
                <img
                  src={frontendImg}
                  alt=""
                  className="w-full h-48 object-cover rounded-lg border "
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm block font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                placeholder="City"
                value={cities}
                onChange={(e) => setCities(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="text-sm block font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                placeholder="State"
                value={states}
                onChange={(e) => setStates(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>
          <div>
            <label className="text-sm block font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              placeholder="Enter Shop address"
              value={addresses}
              onChange={(e) => setAddresses(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          {loading ? (
            <button className="px-4 py-3 mt-4 text-center bg-orange-600 text-white w-full flex items-center justify-center gap-2 border cursor-pointer rounded-lg hover:bg-orange-500 transition-all duration-300">
              <LuLoaderCircle className="mr-4 h-5 w-5 animate-spin text-white" />{" "}
              please wait
            </button>
          ) : (
            <button className="px-4 py-3 mt-4 text-center bg-orange-600 text-white w-full flex items-center justify-center gap-2 border cursor-pointer rounded-lg hover:bg-orange-500 transition-all duration-300">
              Add Shop
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateEditShop;
