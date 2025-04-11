import { obsData, obsExpressionData, obsmData, zarrHierarchy } from "@/lib/types";
import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import { RefObject } from "react";

type ProgressOptions = {
  generate_leiden: boolean;
  generate_umap: boolean;
  get_file_hierarchy: boolean;
  get_file_obs: boolean;
  get_file_obsm: boolean;
  get_filenames: boolean;
  get_genes: boolean;
};

type initialPlotStateProps = {
  svgRef: RefObject<SVGSVGElement> | null;
  groupRefs: RefObject<HTMLCanvasElement[]> | null;
  hierarchy: zarrHierarchy | null;
  obs: obsData | null;
  obsm: obsmData | null;
  genes: string[];
  obsExpression: obsExpressionData[];
  labelSize: {
    [key: string]: number;
  };
  selectedEmbedding: string;
  selectedCategory: string;
  selectedLabels: string[];
  selectedGenes: string[];
  inProgress: {
    [key in keyof ProgressOptions]: ProgressOptions[key]
  }
};

const initialPlotState: initialPlotStateProps = {
  svgRef: null,
  groupRefs: null,
  hierarchy: null,
  obs: null,
  obsm: null,
  genes: [],
  obsExpression: [],
  labelSize: {},
  selectedEmbedding: "",
  selectedCategory: "",
  selectedLabels: [],
  selectedGenes: [],
  inProgress: {
    generate_leiden: false,
    generate_umap: false,
    get_file_hierarchy: false,
    get_file_obs: false,
    get_file_obsm: false,
    get_filenames: false,
    get_genes: false
  },
};

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
    setGenes: (state, action: PayloadAction<string[]>) => {
      state.genes = action.payload;
    },
    setObsExpression: (state, action: PayloadAction<obsExpressionData[]>) => {
      state.obsExpression = action.payload;
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
    setSelectedGenes: (state, action: PayloadAction<string[]>) => {
      state.selectedGenes = action.payload;
    },
    setInProgress<K extends keyof ProgressOptions>(
      state: Draft<initialPlotStateProps>,
      action: PayloadAction<{ type: K, value: ProgressOptions[K] }>
    ) {
      state.inProgress[action.payload.type] = action.payload.value;
    }
  },
});

export const {
  reset,
  setHierarchy,
  setObs,
  setObsm,
  setGenes,
  setObsExpression,
  setLabelSize,
  setSelectedEmbedding,
  setSelectedCategory,
  setSelectedLabels,
  setSelectedGenes,
  setInProgress
} = plotSlice.actions;

export default plotSlice.reducer;