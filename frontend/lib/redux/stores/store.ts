
import { configureStore } from "@reduxjs/toolkit";
import fileReducer from "@/lib/redux/reducers/reducer1"
import { someApi } from "../api/api";
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
  reducer: {
    fileReducer: fileReducer,
    [someApi.reducerPath]: someApi.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(someApi.middleware),
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