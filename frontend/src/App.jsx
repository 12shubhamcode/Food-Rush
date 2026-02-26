import { Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { Toaster } from "sonner";
import ForgotPassword from "./pages/ForgotPassword";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import { useDispatch, useSelector } from "react-redux";
import Home from "./pages/Home";
import useGetCity from "./hooks/useGetCity";
import useGetMyShop from "./hooks/useGetMyShop";
import CreateEditShop from "./pages/CreateEditShop";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetItemByCity from "./hooks/useGetItemByCity";
import CartPage from "./pages/CartPage";
import CheckOut from "./pages/CheckOut";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrders from "./pages/MyOrders";
import useGetOrders from "./hooks/useGetOrders";
import useUpdateLocation from "./hooks/useUpdateLocation";
import TrackOrder from "./pages/TrackOrder";
import ShopItems from "./pages/ShopItems";
import { useEffect } from "react";
import { io } from "socket.io-client";
import {
  setMyOrders,
  setSocket,
  updateRealTimeStatus,
} from "./redux/slice/userSlice";
import { useRef } from "react";
export const serverUrl = "http://localhost:3002";

const App = () => {
  const { userData, socket, myOrders } = useSelector((store) => store.user);

  const dispatch = useDispatch();
  const socketInitialized = useRef(false);
  const ordersRef = useRef([]);

  useGetCurrentUser();
  useGetCity();
  useGetShopByCity();
  useGetItemByCity();
  useGetMyShop();
  useGetOrders();
  useUpdateLocation();

  useEffect(() => {
    ordersRef.current = myOrders;
  }, [myOrders]);

  useEffect(() => {
    if (socketInitialized.current) return; // stops double creation
    socketInitialized.current = true;

    const socketInstance = io(serverUrl, {
      withCredentials: true,
      transports: ["websocket"], // important
    });

    dispatch(setSocket(socketInstance));

    return () => {
      socketInstance.disconnect();
    };
  }, [dispatch]);

  // SEND IDENTITY AFTER LOGIN (DO NOT MOVE)
  useEffect(() => {
    if (!socket) return;
    if (!userData?.user?._id) return;

    socket.emit("identity", {
      userId: userData.user._id,
    });
  }, [socket, userData]);

  useEffect(() => {
    if (!socket || !userData?.user?._id) return;

    const handleNewOrder = (data) => {
      const ownerIdFromOrder = data?.shopOrders?.[0]?.owner?._id;
      const loggedInOwnerId = userData.user._id;

      if (ownerIdFromOrder === loggedInOwnerId) {
        const updatedOrders = [data, ...(ordersRef.current || [])];
        dispatch(setMyOrders(updatedOrders));
      }
    };

    socket.on("newOrder", handleNewOrder);

    socket.on("update-status", ({ orderId, shopId, status, userId }) => {
      if (userId === userData?.user?._id) {
        dispatch(updateRealTimeStatus({ orderId, shopId, status }));
      }
    });

   

    return () => {
      socket.off("newOrder", handleNewOrder);
      socket.off("update-status");
    };
  }, [socket, userData, dispatch]);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/register"
          element={!userData ? <Register /> : <Navigate to={"/"} />}
        />
        <Route
          path="/login"
          element={!userData ? <Login /> : <Navigate to={"/"} />}
        />
        <Route
          path="/forgot-password"
          element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />}
        />
        <Route
          path="/"
          element={userData ? <Home /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/create-edit-shop"
          element={userData ? <CreateEditShop /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/add-food"
          element={userData ? <AddItem /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/edit-item/:itemId"
          element={userData ? <EditItem /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/cart"
          element={userData ? <CartPage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/checkout"
          element={userData ? <CheckOut /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/order-placed"
          element={userData ? <OrderPlaced /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/my-orders"
          element={userData ? <MyOrders /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/track-order/:orderId"
          element={userData ? <TrackOrder /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/shop-items/:shopId"
          element={userData ? <ShopItems /> : <Navigate to={"/login"} />}
        />
      </Routes>
    </>
  );
};

export default App;
