import React, { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import { categories } from "../category.js";
import CategoryCard from "./CategoryCard";
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import { useSelector } from "react-redux";
import useGetShopsByCity from "../hooks/useGetMyShop.jsx";
import FoodCard from "./FoodCard.jsx";
import { useNavigate } from "react-router-dom";


const UserDashboard = () => {
  const { city, shopsInMyCity, itemsInMyCity,searchItems } = useSelector(
    (store) => store.user,
  );

  useGetShopsByCity();

  const [showCateLeftButton, setShowCateLeftButton] = useState(false);
  const [showCateRightButton, setShowCateRightButton] = useState(false);
  const [showShopLeftButton, setShowShopLeftButton] = useState(false);
  const [showShopRightButton, setShowShopRightButton] = useState(false);
  const [updatedItemList, setUpdatedItemList] = useState([]);

  const cateScrollRef = useRef();
  const shopScrollRef = useRef();
  const navigate = useNavigate();

  const handleByCategory = (category) => {
    if (category === "All") {
      setUpdatedItemList(itemsInMyCity);
    } else {
      const fileterItemList = itemsInMyCity?.filter(
        (i) => i.category === category,
      );
      setUpdatedItemList(fileterItemList);
    }
  };

  useEffect(() => {
    setUpdatedItemList(itemsInMyCity);
  }, [itemsInMyCity]);

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current;
    if (element) {
      setLeftButton(element.scrollLeft > 0);
      setRightButton(
        element.scrollLeft + element.clientWidth < element.scrollWidth,
      );
    }
  };

  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

 
  useEffect(() => {
    updateButton(cateScrollRef, setShowCateLeftButton, setShowCateRightButton);
    updateButton(shopScrollRef, setShowShopLeftButton, setShowShopRightButton);

    const cateScrollHandler = () =>
      updateButton(
        cateScrollRef,
        setShowCateLeftButton,
        setShowCateRightButton,
      );

    const shopScrollHandler = () =>
      updateButton(
        shopScrollRef,
        setShowShopLeftButton,
        setShowShopRightButton,
      );

    if (cateScrollRef.current) {
      cateScrollRef.current.addEventListener("scroll", cateScrollHandler);
    }

    if (shopScrollRef.current) {
      shopScrollRef.current.addEventListener("scroll", shopScrollHandler);
    }

    return () => {
      if (cateScrollRef.current) {
        cateScrollRef.current.removeEventListener("scroll", cateScrollHandler);
      }
      if (shopScrollRef.current) {
        shopScrollRef.current.removeEventListener("scroll", shopScrollHandler);
      }
    };
  }, [categories]);

  return (
    <div className="min-h-screen ">
      <Navbar />

        {searchItems && searchItems?.items?.length>0 && 
        <div className="w-full bg-white shadow-md rounded-2xl mt-4 flex items-center flex-col gap-5  text-center max-w-6xl">
          <h1 className="text-gray-900 sm:text-3xl text-2xl font-semibold mt-3  ">Search Results</h1>
        
        <div className="w-full h-auto flex flex-wrap gap-6 justify-center mb-5">
          {searchItems?.items?.map((item)=>(
            <FoodCard data={item} key={item._id} />
          ))}
        </div>
        </div>
        }

      <div className="w-full max-w-6xl mx-auto gap-6 px-4 py-6">
        {/* Heading */}
        <div className="flex flex-col gap-1">
          <h1 className="text-gray-900 text-2xl sm:text-3xl font-bold">
            Inspiration for your first order
          </h1>
        </div>

        {/* Slider Section */}
        <div className="relative w-full rounded-2xl p-4">
          {/* Left Button */}
          {showCateLeftButton && (
            <button
              className="
              absolute left-2 top-1/2 -translate-y-1/2 z-10
              bg-white rounded-full p-1
              shadow-md text-orange-500
              hover:text-orange-600 hover:scale-105
              transition-all cursor-pointer
            "
              onClick={() => scrollHandler(cateScrollRef, "left")}
            >
              <FaCircleChevronLeft size={28} />
            </button>
          )}

          {/* Categories */}
          <div
            ref={cateScrollRef}
            className="flex gap-5 overflow-x-auto scroll-smooth pb-3 px-8 scrollbar-hide"
          >
            {categories.map((cate, idx) => (
              <div
                key={idx}
                className="transition-transform hover:scale-[1.03]"
              >
                <CategoryCard
                  name={cate.category}
                  image={cate.image}
                  onClick={() => handleByCategory(cate?.category)}
                />
              </div>
            ))}
          </div>

          {/* Right Button */}
          {showCateRightButton && (
            <button
              className="
              absolute right-2 top-1/2 -translate-y-1/2 z-10
              bg-white rounded-full p-1
              shadow-md text-orange-500
              hover:text-orange-600 hover:scale-105
              transition-all cursor-pointer
            "
              onClick={() => scrollHandler(cateScrollRef, "right")}
            >
              <FaCircleChevronRight size={28} />
            </button>
          )}
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col gap5 items-start p-3">
        <h1 className="text-gray-900 text-2xl sm:text-3xl font-bold">
          Best shop in <span className="text-orange-600">{city}</span>
        </h1>

        <div className="relative w-full rounded-2xl p-4">
          {/* Left Button */}
          {showShopLeftButton && (
            <button
              className="
              absolute left-2 top-1/2 -translate-y-1/2 z-10
              bg-white rounded-full p-1
              shadow-md text-orange-500
              hover:text-orange-600 hover:scale-105
              transition-all cursor-pointer
            "
              onClick={() => scrollHandler(shopScrollRef, "left")}
            >
              <FaCircleChevronLeft size={28} />
            </button>
          )}

          {/* Shops */}
          <div
            ref={shopScrollRef}
            className="flex gap-5 overflow-x-auto scroll-smooth pb-3 px-8 scrollbar-hide"
          >
            {Array.isArray(shopsInMyCity) &&
              shopsInMyCity.map((shop, idx) => (
                <div
                  key={idx}
                  className="transition-transform hover:scale-[1.03]"
                >
                  <CategoryCard
                    name={shop.name}
                    image={shop.image}
                    onClick={() => navigate(`/shop-items/${shop._id}`)}
                  />
                </div>
              ))}
          </div>

          {/* Right Button */}
          {showShopRightButton && (
            <button
              className="
              absolute right-2 top-1/2 -translate-y-1/2 z-10
              bg-white rounded-full p-1
              shadow-md text-orange-500
              hover:text-orange-600 hover:scale-105
              transition-all cursor-pointer
            "
              onClick={() => scrollHandler(shopScrollRef, "right")}
            >
              <FaCircleChevronRight size={28} />
            </button>
          )}
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col gap5 items-start p-3">
        <h1 className="text-gray-900 text-2xl sm:text-3xl font-bold">
          Suggested Food Items
        </h1>
        <div className="flex  flex-wrap w-full h-auto gap-5 justify-center">
          {updatedItemList?.map((item, index) => (
            <FoodCard key={index} data={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
