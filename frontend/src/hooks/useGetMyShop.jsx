import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/slice/ownerSlice";

const useGetMyShop = () => {
  const { userData } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userData) {
    dispatch(setMyShopData(null));
    return;
  }
    const fetchMyShop = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/shop/get-my-shop`, {
          withCredentials: true,
        });

        dispatch(setMyShopData(res.data.shop));
      } catch (error) {
        // dispatch(setMyShopData(null));
        console.log(error);
      }
    };

    fetchMyShop();
  }, [userData,dispatch]);
};

export default useGetMyShop;
