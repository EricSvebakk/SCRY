
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type fileType = {
  id: string;
  name: string;
  fileType: string;
}

interface FileState {
  files: fileType[];
  selectedFiles: string[];
  activeFile: string;
}

const initialFileState: FileState = {
  files: [],
  selectedFiles: [],
  activeFile: ""
};

export const fileSlice = createSlice({
  name: "file",
  initialState: initialFileState,
  reducers: {
    addFile: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        fileType: string;
        // col2: string;
      }>
    ) => {
      // console.log("addFile", action.payload);

      if (!state.files.includes(action.payload)) {
        state.files.push(action.payload);
      }
    },
    addFiles: (
      state,
      action: PayloadAction<
        {
          id: string;
          name: string;
          fileType: string;
        }[]
      >
    ) => {
      // console.log("addFiles", action.payload, state.files);

      const newFiles = action.payload.filter((file) => {
        const fileIDs = state.files.map((f) => f.id);
        return !fileIDs.includes(file.id);
      });

      state.files = state.files.concat(newFiles);
    },
    deleteFile: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        col2: string;
      }>
    ) => {
      state.files = state.files.filter((file) => file.id !== action.payload.id);
    },
    selectFile: (state, action: PayloadAction<string>) => {
      state.selectedFiles.push(action.payload);
    },
    selectFiles: (state, action: PayloadAction<string[]>) => {
      console.log("selectFiles", action.payload);

      state.selectedFiles = action.payload;
    },
    deselectFile: (state, action: PayloadAction<string>) => {
      state.selectedFiles = state.selectedFiles.filter(
        (id) => id !== action.payload
      );
    },
    setActiveFile: (state, action: PayloadAction<string>) => {
      state.activeFile = action.payload;
    },
  },
});

export const {
  addFile,
  addFiles,
  deleteFile,
  selectFile,
  selectFiles,
  deselectFile,
  setActiveFile,
} = fileSlice.actions;

export default fileSlice.reducer;