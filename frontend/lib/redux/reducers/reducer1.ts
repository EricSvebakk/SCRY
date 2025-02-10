
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface FileState {
  files: {
    id: string;
    name: string;
    col2: string;
  }[];
  selectedFiles: string[];
}

const initialFileState: FileState = {
  files: [],
  selectedFiles: [],
};

export const fileSlice = createSlice({
  name: "file",
  initialState: initialFileState,
  reducers: {
    addFile: (state, action: PayloadAction<{
      id: string;
      name: string;
      col2: string;
    }>) => {
      
      // console.log("addFile", action.payload);
      
      if (!state.files.includes(action.payload)) {
        state.files.push(action.payload);
      }
    },
    addFiles: (state, action: PayloadAction<{
      id: string;
      name: string;
      col2: string;
    }[]>) => {
      
      // console.log("addFiles", action.payload, state.files);
      
      const newFiles = action.payload.filter(file => {
        const fileIDs = state.files.map(f => f.id);
        return !fileIDs.includes(file.id);
      });

      state.files = state.files.concat(newFiles);
    },
    deleteFile: (state, action: PayloadAction<{
      id: string;
      name: string;
      col2: string;
    }>) => {
      state.files = state.files.filter(file => file.id !== action.payload.id);
    },
    selectFile: (state, action: PayloadAction<string>) => {
      state.selectedFiles.push(action.payload);
    },
    selectFiles: (state, action: PayloadAction<string[]>) => {
      
      console.log("selectFiles", action.payload);
      
      state.selectedFiles = action.payload;
    },
    deselectFile: (state, action: PayloadAction<string>) => {
      state.selectedFiles = state.selectedFiles.filter(id => id !== action.payload);
    }
  },
});

export const { addFile, addFiles, deleteFile, selectFile, selectFiles, deselectFile } = fileSlice.actions;

export default fileSlice.reducer;

// export interface CounterState {
//   value: number;
// }

// const initialState: CounterState = {
//   value: 0,
// };

// export const counterSlice = createSlice({
//   name: "counter",
//   initialState,
//   reducers: {
//     increment: (state) => {
//       // Redux Toolkit allows us to write "mutating" logic in reducers. It
//       // doesn't actually mutate the state because it uses the Immer library,
//       // which detects changes to a "draft state" and produces a brand new
//       // immutable state based off those changes
//       state.value += 1;
//     },
//     decrement: (state) => {
//       state.value -= 1;
//     },
//     incrementByAmount: (state, action: PayloadAction<number>) => {
//       state.value += action.payload;
//     },
//   },
// });

// // Action creators are generated for each case reducer function
// export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// export default counterSlice.reducer;