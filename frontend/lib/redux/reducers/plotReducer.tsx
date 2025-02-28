import { obsData, obsmData, zarrHierarchy } from "@/lib/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RefObject, useRef } from "react";

type initialPlotStateProps = {
  svgRef: RefObject<SVGSVGElement> | null;
  groupRefs: RefObject<HTMLCanvasElement[]> | null;
  hierarchy: zarrHierarchy | null;
  obs: obsData | null;
  obsm: obsmData | null;
  labelSize: {
    [key: string]: number,
  }
  selectedEmbedding: string;
  selectedCategory: string;
  selectedLabel: string;
}

const initialPlotState: initialPlotStateProps = {
  svgRef: null,
  groupRefs: null,
  hierarchy: null,
  obs: null,
  obsm: null,
  labelSize: {},
  selectedEmbedding: "",
  selectedCategory: "",
  selectedLabel: "",
}

export const plotSlice = createSlice({
  name: "plotSomethingidk",
  initialState: initialPlotState,
  reducers: {
    reset: (state, action: PayloadAction<boolean>) => {
      if (action.payload) {
        state.selectedCategory = "";
        state.selectedEmbedding = "";
        state.selectedLabel = "";
        state.obs = null;
        state.obsm = null;
      }
    },
    setSVGRef: (state, action: PayloadAction<{}>) => {},
    setCanvasRefs: (state, action: PayloadAction<{}>) => {},
    setHierarchy: (state, action: PayloadAction<zarrHierarchy>) => {
      state.hierarchy = action.payload;
    },
    setObs: (state, action: PayloadAction<obsData | null>) => {
      state.obs = action.payload;
    },
    setObsm: (state, action: PayloadAction<obsmData | null>) => {
      state.obsm = action.payload;
    },
    setLabelSize: (state, action: PayloadAction<{}>) => {
      state.labelSize = action.payload;
    },
    setSelectedEmbedding: (state, action: PayloadAction<string>) => {
      state.selectedEmbedding = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSelectedLabel: (state, action: PayloadAction<string>) => {
      state.selectedLabel = action.payload;
    },
  },
});

export const {
  reset,
  setHierarchy,
  setObs,
  setObsm,
  setLabelSize,
  setSelectedEmbedding,
  setSelectedCategory,
  setSelectedLabel,
} = plotSlice.actions

export default plotSlice.reducer;