
import { FileState, fileType } from "@/lib/types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { backendAPI } from "../api/api";

const initialFileState: FileState = {
  files: [],
  selectedFiles: [],
  activeFile: "",
  userID: "",
  passKey: "",
};

export const fileSlice = createSlice({
  name: "file",
  initialState: initialFileState,
  reducers: {
    addFile: (state, action: PayloadAction<fileType>) => {
      if (!state.files.includes(action.payload)) {
        state.files.push(action.payload);
      }
    },
    addFiles: (state, action: PayloadAction<fileType[]>) => {
      const newFiles = action.payload.filter((file) => {
        const fileIDs = state.files.map((f) => f.id);
        return !fileIDs.includes(file.id);
      });

      state.files = state.files.concat(newFiles);
    },
    deleteFile: (state, action: PayloadAction<fileType>) => {
      state.files = state.files.filter((file) => file.id !== action.payload.id);
    },
    selectFile: (state, action: PayloadAction<string>) => {
      state.selectedFiles.push(action.payload);
    },
    selectFiles: (state, action: PayloadAction<string[]>) => {
      state.selectedFiles = action.payload;
    },
    deselectFile: (state, action: PayloadAction<string>) => {
      state.selectedFiles = state.selectedFiles.filter((id) => id !== action.payload);
    },
    setActiveFile: (state, action: PayloadAction<string>) => {
      state.activeFile = action.payload;
    },
    setActiveUser: (state, action: PayloadAction<string>) => {
      state.userID = action.payload;
    },
    setPassKey: (state, action: PayloadAction<string>) => {
      state.passKey = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      backendAPI.endpoints.systemFiles.matchFulfilled,
      (state, action) => {
        const { response, ok } = action.payload;
        if (ok) {
          
          const fileRows = response.files
            .map((e: string, i: number) => ({
              id: e,
              name: e,
              fileSize: response.h5ad_sizes[i],
              fileType: e.split(".")[1],
            }));
          
          const updatesFiles = state.files.map((file) => {
            const newFile = fileRows.find((f: any) => f.id === file.id)
            return newFile ? newFile : file
          });
          
          const newFiles = fileRows.filter((f: any) => !state.files.some((file) => f.id === file.id))
          
          state.files = [...updatesFiles, ...newFiles]
          
        }
      }
    )
  }
});

export const {
  addFile,
  addFiles,
  deleteFile,
  selectFile,
  selectFiles,
  deselectFile,
  setActiveFile,
  setActiveUser,
  setPassKey
} = fileSlice.actions;

export default fileSlice.reducer;