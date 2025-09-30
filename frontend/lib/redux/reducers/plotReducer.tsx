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
  errorAttributes,
  backendEndpoints,
} from "@/lib/types";
import {
  createSlice,
  isFulfilled,
  isPending,
  isRejectedWithValue,
  PayloadAction,
} from "@reduxjs/toolkit";
import { backendAPI } from "../api/api";

const initialPlotState: InitialPlotStateProps = {
  anndata: AnndataAttributeKeys.reduce((acc, key) => {
    acc[key] = {};
    return acc;
  }, {} as AnndataAttributes),
  plot: {
    feature: {
      pointSize: 1,
      palette: "orange",
      background: "white",
    },
    cluster: {
      pointSize: 1,
      palette: "obs9",
      background: "white",
    },
    expression: {
      palette: "",
    },
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
    },
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
      saveScatterPlotImage: null,
    },
  },
  status: fetchOptions.reduce((acc, key) => {
    acc[key] = {
      inProgress: false,
      message: "",
    } as statusOptions;
    return acc;
  }, {} as statusAttributes),
  statusBackend: backendEndpoints.reduce((acc, key) => {
    acc[key] = {
      inProgress: false,
      message: "",
    };
    return acc;
  }, {} as statusBackendAPI),
  error: backendEndpoints.reduce((acc, key) => {
    acc[key] = {
      message: "",
    };
    return acc;
  }, {} as errorAttributes),
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
    setPlotConfigField<A extends keyof PlotConfiguration>(
      state: InitialPlotStateProps,
      action: PayloadAction<{ plot: A; config: PlotConfiguration[A] }>
    ) {
      const { plot, config } = action.payload;

      state.plot[plot] = config;
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
        type: (typeof backendEndpoints)[number];
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
    setError: (
      state: InitialPlotStateProps,
      action: PayloadAction<{
        type: (typeof tagsBackendAPI)[number];
        message: string;
        time: string;
      }>
    ) => {
      const type = state.error[action.payload.type];

      type.message = action.payload.message;

      if (action.payload.time !== undefined) {
        type.time = action.payload.message;
      } else {
        type.time = undefined;
      }
    },
  },
  extraReducers: (builder) => {
    // Handles status messages
    builder.addMatcher(
      backendAPI.endpoints.fileHierarchy.matchPending,
      (state) => {
        state.statusBackend.fileHierarchy.message =
          "Loading in Anndata metadata";
      }
    ),
      builder.addMatcher(
        backendAPI.endpoints.fileObsm.matchPending,
        (state) => {
          state.statusBackend.fileObsm.message =
            "Loading embedding coordinates";
        }
      ),
      builder.addMatcher(backendAPI.endpoints.fileObs.matchPending, (state) => {
        state.statusBackend.fileObs.message = "Loading observation data";
      }),
      builder.addMatcher(
        backendAPI.endpoints.celeryFileNLDR.matchPending,
        (state) => {
          state.statusBackend.celeryFileNLDR.message = "requesting changes";
        }
      ),
      builder.addMatcher(
        backendAPI.endpoints.celeryFileLeiden.matchPending,
        (state) => {
          state.statusBackend.celeryFileLeiden.message = "requesting changes";
        }
      ),
      // ===========================================================================
      // Handles setting data correctly
      builder.addMatcher(
        backendAPI.endpoints.fileHierarchy.matchFulfilled,
        (state, action) => {
          const { response, ok } = action.payload;
          if (ok) {
            Object.keys(response).forEach((k: string) => {
              const key = k as keyof AnndataAttributeData;
              state.anndata[key].keys = response[key];
            });
          }
        }
      ),
      builder.addMatcher(
        backendAPI.endpoints.fileObsm.matchFulfilled,
        (state, action) => {
          if (action.payload.ok) {
            state.anndata.obsm.data = action.payload.response;
          }
        }
      ),
      builder.addMatcher(
        backendAPI.endpoints.fileObs.matchFulfilled,
        (state, action) => {
          if (action.payload.ok) {
            state.anndata.obs.indices = action.payload.response;
          }
        }
      ),
      builder.addMatcher(
        backendAPI.endpoints.fileGenes.matchFulfilled,
        (state, action) => {
          if (action.payload.ok) {
            state.data.genes = action.payload.response;
          }
        }
      ),
      builder.addMatcher(
        backendAPI.endpoints.fileFeatureCoordinates.matchFulfilled,
        (state, action) => {
          if (action.payload.ok) {
            state.anndata.var.indices = action.payload.response;
          }
        }
      ),
      builder.addMatcher(
        backendAPI.endpoints.celltypistModels.matchFulfilled,
        (state, action) => {
          if (action.payload.ok) {
            state.data.annotationModels.models = action.payload.response;
          }
        }
      ),
      // ===========================================================================
      // Handles status and error
      builder.addMatcher(isFulfilled, (state, action) => {
        console.log(action);
        if (
          action.type.startsWith(backendAPI.reducerPath) &&
          !isRejectedWithValue(action)
        ) {
          const endpoint = (action.meta.arg as any).endpointName;
          state.statusBackend[endpoint] = {
            inProgress: false,
            message: "",
          };
        }
      }),
      builder.addMatcher(isPending, (state, action) => {
        console.log(action);
        if (action.type.startsWith(backendAPI.reducerPath)) {
          const endpoint = (action.meta.arg as any).endpointName;
          state.statusBackend[endpoint].inProgress = true;
          if (state.statusBackend[endpoint].message === "") {
            state.statusBackend[endpoint].message = "pending";
          }
        }
      }),
      builder.addMatcher(isRejectedWithValue, (state, action) => {
        console.log(action);
        if (action.type.startsWith(backendAPI.reducerPath)) {
          const endpoint = (action.meta.arg as any).endpointName;
          state.statusBackend[endpoint] = {
            inProgress: false,
            message: "",
          };

          const payload = action.payload as {
            status?: number;
            data?: { detail?: string };
          };

          if (payload?.status === 423 && payload.data?.detail) {
            state.error[endpoint] = {
              message: payload.data.detail,
              time: new Date().toISOString(),
            };
          }

          // fallback
          else {
            state.error[endpoint] = {
              message: JSON.stringify(payload),
              time: new Date().toISOString(),
            };
          }
        }
      });
  },
});

export const {
  reset,
  setAnndataField,
  setPlotConfigField,
  setGDEField,
  setGenes,
  setSelectedGenes,
  setSelectedClusters,
  setTrigger,
  setStatus,
  setModelTypes,
  setGeneReport,
  setStatusBackend,
} = plotSlice.actions;

export default plotSlice.reducer;
