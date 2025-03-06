import { obsData, obsExpressionData, obsmData, zarrHierarchy } from "@/lib/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RefObject, useRef } from "react";

type initialPlotStateProps = {
  svgRef: RefObject<SVGSVGElement> | null;
  groupRefs: RefObject<HTMLCanvasElement[]> | null;
  hierarchy: zarrHierarchy | null;
  obs: obsData | null;
  obsm: obsmData | null;
  obsExpression: obsExpressionData[];
  labelSize: {
    [key: string]: number;
  };
  selectedEmbedding: string;
  selectedCategory: string;
  selectedLabels: string[];
};

const initialPlotState: initialPlotStateProps = {
  svgRef: null,
  groupRefs: null,
  hierarchy: null,
  obs: null,
  obsm: null,
  obsExpression: [],
  labelSize: {},
  selectedEmbedding: "",
  selectedCategory: "",
  selectedLabels: [],
}

export const plotSlice = createSlice({
  name: "plotSomethingidk",
  initialState: initialPlotState,
  reducers: {
    reset: (state, action: PayloadAction<boolean>) => {
      if (action.payload) {        
        for (const key of Object.keys(initialPlotState)) {
          (state as any)[key] = (initialPlotState as any)[key];
        }
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
    setObsExpression: (state, action: PayloadAction<obsExpressionData[]>) => {
      state.obsExpression = action.payload
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
    setSelectedLabels: (state, action: PayloadAction<string[]>) => {
      state.selectedLabels = action.payload;
    },
  },
});

export const {
  reset,
  setHierarchy,
  setObs,
  setObsm,
  setObsExpression,
  setLabelSize,
  setSelectedEmbedding,
  setSelectedCategory,
  setSelectedLabels,
} = plotSlice.actions

export default plotSlice.reducer;