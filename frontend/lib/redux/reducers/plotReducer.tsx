import { obsData, geneExpressionData, obsmData, zarrHierarchy, initialPlotStateProps, ProgressOptions, geneDendrogramData, colorTypes, DotplotOptions } from "@/lib/types";
import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";

const initialPlotState: initialPlotStateProps = {
  svgRef: null,
  groupRefs: null,
  hierarchy: null,
  obs: null,
  obsm: null,
  genes: null,
  geneExpression: [],
  geneDendrogram: null,
  nGenes: null,
  nClusters: null,
  labelSize: {},
  dotplotOptions: {
    title: "",
    coloring: "mean_expr",
    highlight: "cluster",
    expressionMin: 0,
    expressionMax: 0,
    expressionMinDefault: 0,
    expressionMaxDefault: 0,
    expressionIsDefault: true
  },
  selectedEmbedding: "",
  selectedCategory: "",
  selectedLabels: [],
  selectedGenes: [],
  inProgress: {
    generate_ranked_genes_groups: false,
    generate_leiden: false,
    generate_umap: false,
    get_rgg_dotplot: false,
    get_ranked_genes_groups: false,
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
    setGenes: (
      state: Draft<initialPlotStateProps>,
      action: PayloadAction<string[]>
    ) => {
      state.genes = action.payload;
    },
    setGeneExpression: (state, action: PayloadAction<geneExpressionData[]>) => {
      state.geneExpression = action.payload;
    },
    setGeneDendrogram: (state, action: PayloadAction<geneDendrogramData>) => {
      state.geneDendrogram = action.payload;
    },
    setNGenes: (state, action: PayloadAction<number>) => {
      state.nGenes = action.payload;
    },
    setNClusters: (state, action: PayloadAction<number>) => {
      state.nClusters = action.payload;
    },
    setLabelSize: (state, action: PayloadAction<{}>) => {
      state.labelSize = action.payload;
    },
    setDotplotOptions: (state, action: PayloadAction<DotplotOptions>) => {
      state.dotplotOptions = action.payload;
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
  setGeneExpression,
  setGeneDendrogram,
  setNGenes,
  setNClusters,
  setLabelSize,
  setDotplotOptions,
  setSelectedEmbedding,
  setSelectedCategory,
  setSelectedLabels,
  setSelectedGenes,
  setInProgress
} = plotSlice.actions;

export default plotSlice.reducer;