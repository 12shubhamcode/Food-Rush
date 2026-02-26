import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setAddress, setCity, setState } from "../redux/slice/userSlice";
import { setCurraddress, setLocation } from "../redux/slice/mapSlice";

const useUpdateLocation = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((store) => store.user);

  useEffect(() => {
    const updateLocation = async (lat, lon) => {
      const response = await axios.post(
        `${serverUrl}/api/user/update-location`,
        {
          lat,
          lon,
        },
        { withCredentials: true },
      )
     
    };

    navigator.geolocation.watchPosition((pos)=>{
        updateLocation(pos.coords.latitude,pos.coords.longitude)
    })
  }, [userData]);
};

export default useUpdateLocation;
