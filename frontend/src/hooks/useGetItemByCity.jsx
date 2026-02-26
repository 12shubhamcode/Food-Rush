import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setItemsInMyCity, setUserData } from "../redux/slice/userSlice";

const useGetItemByCity = () => {
  const dispatch = useDispatch();
  const {city}=useSelector((store)=>store.user)

  useEffect(() => {
    const fetchItems = async () => {
         if (!city) return;
      try {
        const response = await axios.get(`${serverUrl}/api/item/get-item-by-city/${city}`, {
          withCredentials: true,
        });
        dispatch(setItemsInMyCity(response.data));
      } catch (error) {
        console.log(error);
      }
    };
    fetchItems();
  }, [city]);
};

export default useGetItemByCity;
