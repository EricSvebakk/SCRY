
import { configureStore } from "@reduxjs/toolkit";
import plotReducer from "../reducers/plotReducer";
import { backendAPI } from "../api/api";
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
  reducer: {
    plotReducer: plotReducer,
    [backendAPI.reducerPath]: backendAPI.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(backendAPI.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch