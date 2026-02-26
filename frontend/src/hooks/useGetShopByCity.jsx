import axios from "axios";
import { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setShopsInMyCity } from "../redux/slice/userSlice";

const useGetShopByCity = () => {
  const dispatch = useDispatch();
  const { city } = useSelector((store) => store.user);

  useEffect(() => {
    if (!city) return;

    const fetchShops = async () => {
      try {
        const response = await axios.get(
          `${serverUrl}/api/shop/get-shop-by-city/${city}`,
          { withCredentials: true }
        );

        dispatch(setShopsInMyCity(response.data.shops || []));
      } catch (error) {
        console.log(error);
      }
    };

    fetchShops();
  }, [city, dispatch]);
};

export default useGetShopByCity;
