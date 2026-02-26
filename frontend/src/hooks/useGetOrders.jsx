import axios from "axios";
import { setMyOrders } from "../redux/slice/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { useEffect } from "react";

const useGetOrders = () => {
  const { userData, myOrders } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userData) return;

    const fetchMyOrders = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/order/my-orders`, {
          withCredentials: true,
        });

        //  merge API orders + realtime orders safely
        const existing = Array.isArray(myOrders) ? myOrders : [];

        const existingIds = new Set(existing.map(o => o._id));
        const merged = [...res.data];

        existing.forEach(o => {
          if (!existingIds.has(o._id)) {
            merged.unshift(o);
          }
        });

        dispatch(setMyOrders(merged)); // ALWAYS send array
      } catch (error) {
        console.log(error);
      }
    };

    fetchMyOrders();
  }, [userData, dispatch]);

};

export default useGetOrders;
