import {
  InitialPlotStateProps,
  fetchOptions,
  GDEFields,
  AnndataAttributeFields,
  AnndataAttributeData,
  AnndataAttributeKeys,
  AnndataAttributes,
  statusOptions,
  statusAttributes,
  triggerOptions,
  CelltypistModel,
  PlotConfiguration,
  geneReport,
  tagsBackendAPI,
  statusBackendAPI,
} from "@/lib/types";
import { createSlice, isRejectedWithValue, PayloadAction } from "@reduxjs/toolkit";
import { backendAPI } from "../api/api";

const initialPlotState: InitialPlotStateProps = {
  anndata: AnndataAttributeKeys.reduce(
    (acc, key) => {
      acc[key] = {}
      return acc;
    },
    {} as AnndataAttributes
  ),
  plot: {
    feature: {
      pointSize: 1,
      palette: "orange",
      background: "white",
    },
    cluster: {
      pointSize: 1,
      palette: "obs10",
      background: "white",
    },
    expression: {
      palette: ""
    }
  },
  data: {
    genes: [],
    GDE: {
      expression: null,
      dendrogram: null,
      genes: [],
      clusters: [],
      nGenes: 0,
      nClusters: 0,
      plotOptions: {
        coloring: "mean_expr",
        highlight: "rgg_order",
        expressionMin: 0,
        expressionMax: 0,
        expressionMinDefault: 0,
        expressionMaxDefault: 0,
        expressionIsDefault: true,
      },
    },
    annotationModels: {
      models: [],
      selected: null,
    }
  },
  filtering: {
    selected: {
      genes: [],
      clusters: [],
    },
  },
  navigation: {
    triggers: {
      saveFeaturePlotImage: null,
      saveScatterPlotImage: null
    }
  },
  status: fetchOptions.reduce(
    (acc, key) => {
      acc[key] = {
        inProgress: false,
        message: "",
      } as statusOptions
      return acc
    },
    {} as statusAttributes
  ),
  statusBackend: tagsBackendAPI.reduce(
    (acc, key) => {
      acc[key] = {
        inProgress: false,
        message: ""
      }
      return acc
    },
    {} as statusBackendAPI
  )
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
    setAnndataField<
      A extends keyof AnndataAttributeData,
      F extends keyof AnndataAttributeFields<AnndataAttributeData[A]>
    >(
      state: InitialPlotStateProps,
      action: PayloadAction<{
        attribute: A;
        field: F;
        value: AnndataAttributeFields<AnndataAttributeData[A]>[F];
      }>
    ) {
      const { attribute, field, value } = action.payload;

      (
        state.anndata[attribute] as AnndataAttributeFields<
          AnndataAttributeData[A]
        >
      )[field] = value;
    },
    setFieldAcrossAnndata<F extends keyof AnndataAttributeFields<any>>(
      state: InitialPlotStateProps,
      action: PayloadAction<{
        field: F;
        values: Partial<{
          [A in keyof AnndataAttributeData]: AnndataAttributeFields<
            AnndataAttributeData[A]
          >[F];
        }>;
      }>
    ) {
      const { field, values } = action.payload;

      for (const attr in values) {
        if (values[attr as keyof typeof values] !== undefined) {
          const typedAttr = attr as keyof AnndataAttributeData;
          const currentAttribute = state.anndata[
            typedAttr
          ] as AnndataAttributeFields<AnndataAttributeData[typeof typedAttr]>;
          currentAttribute[field] = values[typedAttr];
        }
      }
    },
    setPlotConfigField<
      A extends keyof PlotConfiguration
      // B extends PlotConfigurationData[A],
      // C extends keyof PlotConfigurationFields<B>,
    >(
      state: InitialPlotStateProps,
      action: PayloadAction<{
        plot: A;
        config: PlotConfiguration[A];
        // test: B;
        // field: C;
        // value: PlotConfigurationFields<PlotConfigurationData[A]>[B];
      }>
    ) {
      const { plot, config } = action.payload;
      
      state.plot[plot] = config;
      
      // state.plot[plot][field] = value;
      // obj[field]
      // (
      // )[field] = value;
    },
    setGDEField<K extends keyof GDEFields>(
      state: InitialPlotStateProps,
      action: PayloadAction<{ field: K; value: GDEFields[K] }>
    ) {
      state.data.GDE[action.payload.field] = action.payload.value;
    },
    setGenes: (state, action: PayloadAction<string[]>) => {
      state.data.genes = action.payload;
    },
    setSelectedClusters: (state, action: PayloadAction<string[]>) => {
      state.filtering.selected.clusters = action.payload;
    },
    setSelectedGenes: (state, action: PayloadAction<string[]>) => {
      state.filtering.selected.genes = action.payload;
    },
    setTrigger<K extends keyof triggerOptions>(
      state: InitialPlotStateProps,
      action: PayloadAction<{ type: K; value: triggerOptions[K] | null }>
    ) {
      state.navigation.triggers[action.payload.type] = action.payload.value;
    },
    setStatus: (
      state: InitialPlotStateProps,
      action: PayloadAction<{
        type: (typeof fetchOptions)[number];
        value: boolean;
        message?: string;
      }>
    ) => {
      const type = state.status[action.payload.type];

      type.inProgress = action.payload.value;

      if (action.payload.message !== undefined) {
        type.message = action.payload.message;
      }
    },
    // incrementRefreshCounter: (state: InitialPlotStateProps, action: PayloadAction<typeof refreshOptions[number]>) => {
    //   state.statusBackend[action.payload] += 1;
    // },
    setModelTypes: (
      state: InitialPlotStateProps,
      action: PayloadAction<CelltypistModel[]>
    ) => {
      state.data.annotationModels.models = action.payload;
    },
    setGeneReport(state, action: PayloadAction<geneReport>) {
      state.data.geneReport = action.payload;
    },
    
    
    setStatusBackend: (
      state: InitialPlotStateProps,
      action: PayloadAction<{
        type: (typeof tagsBackendAPI)[number];
        value: boolean;
        message?: string;
      }>
    ) => {
      const type = state.statusBackend[action.payload.type];

      type.inProgress = action.payload.value;

      if (action.payload.message !== undefined) {
        type.message = action.payload.message;
      }
    },
    
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      backendAPI.endpoints.fileHierarchy.matchPending,
      (state) => {
        state.statusBackend.HIERARCHY = {
          inProgress: true,
          message: "Loading in Anndata metadata"
        }
      }
    ),
    builder.addMatcher(
      backendAPI.endpoints.fileObsm.matchPending,
      (state) => {
        state.statusBackend.OBSM = {
          inProgress: true,
          message: "Loading embedding coordinates"
        }
      }
    ),
    builder.addMatcher(
      backendAPI.endpoints.fileObs.matchPending,
      (state) => {
        state.statusBackend.OBS = {
          inProgress: true,
          message: "Loading observation data"
        }
      }
    ),
    builder.addMatcher(
      backendAPI.endpoints.celeryFileNLDR.matchPending,
      (state) => {
        state.statusBackend.OBSM = {
          inProgress: true,
          message: "requesting changes"
        }
      }
    ),
    builder.addMatcher(
      backendAPI.endpoints.celeryFileLeiden.matchPending,
      (state) => {
        state.statusBackend.LEIDEN = {
          inProgress: true,
          message: "requesting changes"
        }
      }
    ),
    // ===========================================================================
    builder.addMatcher(
      backendAPI.endpoints.fileHierarchy.matchFulfilled,
      (state, action) => {
        const { response, ok } = action.payload;
        if (ok) {
          Object.keys(response).forEach((k: string) => {
            const key = k as keyof AnndataAttributeData
            state.anndata[key].keys = response[key];
          });
        }
        state.statusBackend.HIERARCHY.inProgress = false
      }
    ),
    builder.addMatcher(
      backendAPI.endpoints.fileObsm.matchFulfilled,
      (state, action) => {
        if (action.payload.ok) {
          state.anndata.obsm.data = action.payload.response
        }
        state.statusBackend.OBSM.inProgress = false
      }
    ),
    builder.addMatcher(
      backendAPI.endpoints.fileObs.matchFulfilled,
      (state, action) => {
        if (action.payload.ok) {
          state.anndata.obs.indices = action.payload.response
        }
        state.statusBackend.OBS.inProgress = false
      }
    ),
    // ===========================================================================
    builder.addMatcher(
      isRejectedWithValue,
      (state, action) => {
        console.log(action.type, action.payload);
        
        if (action.type.startsWith(backendAPI.reducerPath)) {
          
          // const { status, data } = action.payload as any;
          
          // if (status === 423) {
          //   console.error((data as any).detail)
          // }
        }
      }
    ),
    builder.addMatcher(
      backendAPI.endpoints.fileHierarchy.matchRejected,
      (state, action) => {
        state.statusBackend.HIERARCHY.inProgress = false
      }
    )
  }
});

export const {
  reset,
  setAnndataField,
  setFieldAcrossAnndata,
  setPlotConfigField,
  setGDEField,
  setGenes,
  setSelectedGenes,
  setSelectedClusters,
  setTrigger,
  setStatus,
  // incrementRefreshCounter,
  setModelTypes,
  setGeneReport,
  setStatusBackend
} = plotSlice.actions;

export default plotSlice.reducer;
