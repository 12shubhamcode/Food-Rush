import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setAddress, setCity, setState } from "../redux/slice/userSlice";
import { setCurraddress, setLocation } from "../redux/slice/mapSlice";

const useGetCity = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((store) => store.user);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      dispatch(setLocation({lat:latitude,lon:longitude}))

      const response = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${
          import.meta.env.VITE_GEO_APIKEY
        }`
      );
      dispatch(setCity(response?.data?.results[0]?.city));
      dispatch(setState(response?.data?.results[0]?.state));
      dispatch(setAddress(response?.data?.results[0]?.formatted ||response?.data?.results[0]?.address_line2 || response?.data?.results[0]?.address_line1));
      dispatch(setCurraddress(response?.data?.results[0]?.formatted ))
    });
  }, [userData]);
};

export default useGetCity;
