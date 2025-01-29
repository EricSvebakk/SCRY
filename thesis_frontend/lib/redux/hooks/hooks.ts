
import {
  useDispatch,
  useSelector,
  // useStore
} from "react-redux";
import type {
  RootState,
  AppDispatch,
  // AppStore,
} from "@/lib/redux/stores/store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
// export const useAppStore = useStore.withTypes<AppStore>()