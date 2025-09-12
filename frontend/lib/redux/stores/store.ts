
import { configureStore } from "@reduxjs/toolkit";
import fileReducer from "@/lib/redux/reducers/fileReducer"
import plotReducer from "../reducers/plotReducer";
import { backendAPI } from "../api/api";
import { setupListeners } from "@reduxjs/toolkit/query";

// console.info("Creating store...")
export const store = configureStore({
  reducer: {
    fileReducer: fileReducer,
    plotReducer: plotReducer,
    [backendAPI.reducerPath]: backendAPI.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(backendAPI.middleware),
});

// export const makeStore = () => {
//   return configureStore({
//     reducer: {
//       counterReducer,
//     },
//   })
// }

setupListeners(store.dispatch);

// export type AppStore = ReturnType<typeof makeStore>
// export type RootState = ReturnType<AppStore["getState"]>
// export type AppDispatch = AppStore["dispatch"]
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch