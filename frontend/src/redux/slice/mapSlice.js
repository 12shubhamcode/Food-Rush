import { createSlice } from "@reduxjs/toolkit";

const mapSlice = createSlice({
  name: "map",
  initialState: {
    location: {
      lat: null,
      lon: null,
    },
    curraddress: null,
  },
  reducers: {
    setLocation: (state, action) => {
      const { lat, lon } = action.payload;
      state.location.lat = lat;
      state.location.lon = lon;
    },
    setCurraddress: (state, action) => {
      state.curraddress = action.payload;
    },
  },
});

export const { setCurraddress, setLocation } = mapSlice.actions;
export default mapSlice.reducer;
