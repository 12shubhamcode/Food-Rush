import { configureStore } from "@reduxjs/toolkit";
import  userSlice  from "../redux/slice/userSlice";
import  ownerSliceSlice  from "../redux/slice/ownerSlice";
import  mapSlice  from "../redux/slice/mapSlice";

export const store = configureStore({
  reducer: {
    user: userSlice,
    owner:ownerSliceSlice,
    map:mapSlice
  },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        //  ignore socket in Redux
        ignoredActions: ["user/setSocket"],
        ignoredPaths: ["user.socket"],
      },
    }),
});
