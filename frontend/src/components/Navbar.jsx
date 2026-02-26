import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { FaLocationDot } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { setSearchItems, setUserData } from "../redux/slice/userSlice";
import { toast } from "sonner";
import { FaPlus } from "react-icons/fa6";
import { LuReceiptIndianRupee } from "react-icons/lu";
import { resetOwnerState } from "../redux/slice/ownerSlice";

const Navbar = () => {
  const { userData, city, cartItems } = useSelector((store) => store.user);
  const { myShopData } = useSelector((store) => store.owner);
  const [showInfo, setShowInfo] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      if (response.data.success) {
        dispatch(resetOwnerState());
        dispatch(setUserData(null));
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    }
  };

  const handleSearchItems = async () => {
    try {
      const response = await axios.get(
        `${serverUrl}/api/item/search-items?query=${query}&city=${city}`,
        { withCredentials: true },
      );
      dispatch(setSearchItems(response.data));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (query) {
      handleSearchItems();
    } else {
      dispatch(setSearchItems(null));
    }
  }, [query]);

  return (
    <div className="w-full fixed top-0 left-0 z-[999] border-b-2 bg-orange-100 border-gray-200 shadow-xs">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between py-3 px-3 sm:px-6 gap-3 sm:gap-6">
        {/* LOGO */}
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="logo"
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
          />
        </Link>

        {userData?.user?.role === "user" && (
          <div className="hidden md:flex w-[70%] lg:w-[50%] xl:w-[45%] bg-white h-[50px] shadow rounded-xl items-center px-3 gap-4 border border-gray-200">
            {/* Location */}
            <div className="flex items-center gap-2 px-3 py-2 border-r border-gray-300">
              <FaLocationDot size={20} className="text-orange-500" />
              <span className="text-gray-700 font-medium truncate max-w-[100px] lg:max-w-full">
                {city}
              </span>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 w-full">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search delicious food..."
                className="w-full text-gray-600 placeholder-gray-400 outline-none text-sm sm:text-base"
              />
              <IoSearch
                onClick={handleSearchItems}
                size={28}
                className="text-gray-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-4 sm:gap-6">
          {userData?.user?.role === "user" && (
            <IoSearch
              size={26}
              className="text-gray-600 cursor-pointer hover:scale-110 transition md:hidden"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            />
          )}

          {userData?.user?.role === "owner" ? (
            <>
              {myShopData && (
                <button
                  onClick={() => navigate("/add-food")}
                  className="flex px-3 sm:px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition cursor-pointer gap-2 text-sm sm:text-base"
                >
                  <FaPlus size={20} />
                  <span className="hidden sm:flex">Add Food Item</span>
                </button>
              )}

              <div
                onClick={() => navigate("/my-orders")}
                className="flex px-3 sm:px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition cursor-pointer gap-2 relative text-sm sm:text-base"
              >
                <LuReceiptIndianRupee size={20} className="text-white" />
                <span className="hidden sm:flex">My Orders</span>
              </div>
            </>
          ) : (
            <>
              {userData?.user?.role === "user" && (
                <div
                  onClick={() => navigate("/cart")}
                  className="relative cursor-pointer hover:scale-110 transition"
                >
                  <FiShoppingCart size={24} className="text-gray-700" />
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] sm:text-xs px-[5px] py-[1px] rounded-full min-w-[18px] text-center">
                    {cartItems?.length}
                  </span>
                </div>
              )}

              <button
                onClick={() => navigate("/my-orders")}
                className="hidden md:flex px-3 sm:px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition cursor-pointer text-sm sm:text-base"
              >
                My Orders
              </button>
            </>
          )}

          {/* USER AVATAR */}
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 text-white font-semibold rounded-full flex items-center justify-center text-lg sm:text-xl shadow hover:scale-105 cursor-pointer transition"
            onClick={() => setShowInfo(!showInfo)}
          >
            {userData?.user?.fullName?.charAt(0)}
          </div>
        </div>

        {/* PROFILE DROPDOWN */}
        {showInfo && (
          <div className="absolute top-[75px] right-3 sm:right-6 w-44 sm:w-48 bg-white shadow-xl rounded-xl p-4 flex flex-col gap-3 border border-gray-200">
            <div className="text-gray-800 font-semibold text-base sm:text-lg truncate">
              {userData?.user?.fullName}
            </div>

            <div
              onClick={() => navigate("/my-orders")}
              className="text-gray-700 font-medium md:hidden cursor-pointer border-b pb-2 text-sm"
            >
              My Orders
            </div>

            <div
              onClick={handleLogout}
              className="cursor-pointer text-red-500 font-medium hover:bg-red-50 rounded-lg px-2 py-1 text-sm"
            >
              Logout
            </div>
          </div>
        )}
      </div>

      {/* MOBILE SEARCH BAR */}
      {showMobileSearch && (
        <div className="w-full px-3 py-2 bg-white shadow md:hidden">
          <div className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-xl">
            <div className="flex items-center gap-2 px-3 py-2 border-r border-gray-300">
              <FaLocationDot size={18} className="text-orange-500" />
              <span className="text-gray-700 font-medium truncate max-w-[80px]">
                {city}
              </span>
            </div>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search food..."
              className="w-full bg-transparent outline-none text-gray-700 text-sm"
            />

            <IoSearch
              onClick={handleSearchItems}
              size={24}
              className="text-gray-500 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
