import {
  InitialPlotStateProps,
  GDEFields,
  AnndataAttributeFields,
  AnndataAttributeData,
  AnndataAttributeKeys,
  AnndataAttributes,
  triggerOptions,
  CelltypistModel,
  PlotConfiguration,
  geneReport,
  statusType,
  errorAttributes,
  endpoints,
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
  system: {
    user: {
      id: "",
      passKey: "",
    },
    files: {
      all: [],
      selected: [],
      active: "",
    },
  },
  anndata: AnndataAttributeKeys.reduce((acc, key) => {
    acc[key] = {};
    return acc;
  }, {} as AnndataAttributes),
  plot: {
    feature: {
      pointSize: 1,
      showLegend: true,
      showHiddenPoints: true,
      palette: "orange",
      background: "white",
    },
    cluster: {
      pointSize: 1,
      showLegend: true,
      showHiddenPoints: true,
      palette: "obs9",
      background: "white",
    },
    expression: {
      palette: "",
      selected: [],
      layer: "mean_expr",
      highlight: "rgg_order",
      sortClustersBy: "dendrogram",
      sortClustersByDirection: "ascending",
      sortGenesBy: "rgg_order",
      sortGenesByDirection: "ascending",
      expressionMin: 0,
      expressionMax: 0,
      expressionMinDefault: 0,
      expressionMaxDefault: 0,
      expressionIsDefault: true,
    },
  },
  data: {
    genes: [],
    GDE: {
      selected: null,
      expression: null,
      dendrogram: null,
      genes: [],
      clusters: [],
      nGenes: 0,
      nClusters: 0,
      // plotOptions: {
      // },
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
  status: endpoints.reduce((acc, key) => {
    acc[key] = {
      inProgress: false,
      timestamp: "",
      message: "",
    };
    return acc;
  }, {} as statusType),
  error: endpoints.reduce((acc, key) => {
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
    setActiveFile: (state, action: PayloadAction<string>) => {
      state.system.files.active = action.payload;
    },
    setActiveUser: (state, action: PayloadAction<string>) => {
      state.system.user.id = action.payload;
    },
    setPassKey: (state, action: PayloadAction<string>) => {
      state.system.user.passKey = action.payload;
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

      type attrType = AnndataAttributeFields<AnndataAttributeData[A]>;

      (state.anndata[attribute] as attrType)[field] = value;

      // if (field === "keys" && state.system.files.active !== "") {
      //   localStorage.setItem(`${state.system.files.active}_${attribute}`, JSON.stringify(value));
      // }
      // else if (field === "selectedKey" && state.anndata[attribute].keys && !state.anndata[attribute].keys.includes(value as string)) {
      // }
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
    // setStatus: (
    //   state: InitialPlotStateProps,
    //   action: PayloadAction<{
    //     type: (typeof fetchOptions)[number];
    //     value: boolean;
    //     message?: string;
    //   }>
    // ) => {
    //   const type = state.status[action.payload.type];

    //   type.inProgress = action.payload.value;

    //   if (action.payload.message !== undefined) {
    //     type.message = action.payload.message;
    //   }
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
        type: (typeof endpoints)[number];
        value: boolean;
        timestamp?: string;
        message?: string;
      }>
    ) => {
      const type = state.status[action.payload.type];

      type.inProgress = action.payload.value;

      if (action.payload.timestamp !== undefined) {
        type.timestamp = action.payload.timestamp;
      }

      if (action.payload.message !== undefined) {
        type.message = action.payload.message;
      }
    },
    setError: (
      state: InitialPlotStateProps,
      action: PayloadAction<{
        type: (typeof endpoints)[number];
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
      backendAPI.endpoints.SystemFiles.matchPending,
      (state) => {
        state.status.SystemFiles.message = "Loading in available files";
      }
    ),
      builder.addMatcher(
        backendAPI.endpoints.Metadata.matchPending,
        (state) => {
          state.status.Metadata.message = "Loading in AnnData metadata";
        }
      ),
      builder.addMatcher(
        backendAPI.endpoints.Hierarchy.matchPending,
        (state) => {
          state.status.Hierarchy.message = "Loading in Anndata metadata";
        }
      ),
      builder.addMatcher(backendAPI.endpoints.Obs.matchPending, (state) => {
        state.status.Obs.message = "Loading observation data";
      }),
      builder.addMatcher(backendAPI.endpoints.Obsm.matchPending, (state) => {
        state.status.Obsm.message = "Loading embedding coordinates";
      }),
      builder.addMatcher(backendAPI.endpoints.Genes.matchPending, (state) => {
        state.status.Genes.message = "Loading gene labels";
      }),
      builder.addMatcher(backendAPI.endpoints.Feature.matchPending, (state) => {
        state.status.Feature.message = "Loading feature coordinates";
      }),
      builder.addMatcher(
        backendAPI.endpoints.CelltypistModels.matchPending,
        (state) => {
          state.status.CelltypistModels.message =
            "Loading CellTypist models";
        }
      ),
      // builder.addMatcher(
      //   backendAPI.endpoints.celeryFileLDR.matchPending,
      //   (state) => {
      //     state.statusBackend.celeryFileLDR.message = "Requesting linear dimensioal reduction";
      //   }
      // ),
      builder.addMatcher(
        backendAPI.endpoints.Embedding.matchPending,
        (state) => {
          state.status.Embedding.message =
            "Requesting non-linear dimensioal reduction";
        }
      ),
      builder.addMatcher(backendAPI.endpoints.Leiden.matchPending, (state) => {
        state.status.Leiden.message = "Requesting clustering";
      }),
      // builder.addMatcher(
      //   backendAPI.endpoints.celeryFileLDR.matchPending,
      //   (state) => {
      //     state.statusBackend.celeryFileLDR.message = "Loading gene labels";
      //   }
      // ),
      // ===========================================================================
      // Handles setting data correctly
      builder.addMatcher(
        backendAPI.endpoints.SystemFiles.matchFulfilled,
        (state, action) => {
          const { response, ok } = action.payload;
          if (ok) {
            const fileRows = response.files.map((e: string, i: number) => ({
              id: e,
              name: e,
              fileSize: response.h5ad_sizes[i],
              fileType: e.split(".")[1],
            }));

            const updatesFiles = state.system.files.all.map((file) => {
              const newFile = fileRows.find((f: any) => f.id === file.id);
              return newFile ? newFile : file;
            });

            const newFiles = fileRows.filter(
              (f: any) =>
                !state.system.files.all.some((file) => f.id === file.id)
            );

            state.system.files.all = [...updatesFiles, ...newFiles];
          }
        }
      ),
      builder.addMatcher(
        backendAPI.endpoints.Metadata.matchFulfilled,
        (state, action) => {
          const { response, ok } = action.payload;

          if (ok) {
            const { hierarchy, genes } = response;

            state.data.genes = genes;

            Object.keys(hierarchy).forEach((k: string) => {
              const key = k as keyof AnndataAttributeData;
              state.anndata[key].keys = hierarchy[key];

              // localStorage.setItem(`${state.system.files.active}_${key}`, JSON.stringify(response[key]));
            });
          }
        }
      ),
      builder.addMatcher(
        backendAPI.endpoints.Hierarchy.matchFulfilled,
        (state, action) => {
          const { response, ok } = action.payload;
          if (ok) {
            Object.keys(response).forEach((k: string) => {
              const key = k as keyof AnndataAttributeData;
              state.anndata[key].keys = response[key];

              // localStorage.setItem(`${state.system.files.active}_${key}`, JSON.stringify(response[key]));
            });
          }
        }
      ),
      builder.addMatcher(
        backendAPI.endpoints.Obsm.matchFulfilled,
        (state, action) => {
          // console.log(action);
          if (action.payload.ok) {
            state.anndata.obsm.data = action.payload.response;
          }
        }
      ),
      builder.addMatcher(
        backendAPI.endpoints.Obs.matchFulfilled,
        (state, action) => {
          if (action.payload.ok) {
            state.anndata.obs.indices = action.payload.response;
          }
        }
      ),
      builder.addMatcher(
        backendAPI.endpoints.Genes.matchFulfilled,
        (state, action) => {
          if (action.payload.ok) {
            state.data.genes = action.payload.response;
          }
        }
      ),
      builder.addMatcher(
        backendAPI.endpoints.Feature.matchFulfilled,
        (state, action) => {
          if (action.payload.ok) {
            state.anndata.var.indices = action.payload.response;
          }
        }
      ),
      builder.addMatcher(
        backendAPI.endpoints.CelltypistModels.matchFulfilled,
        (state, action) => {
          if (action.payload.ok) {
            state.data.annotationModels.models = action.payload.response;
          }
        }
      ),
      // ===========================================================================
      // Handles status and error
      builder.addMatcher(isFulfilled, (state, action) => {
        console.log((action.meta.arg as any).endpointName, action);
        if (
          action.type.startsWith(backendAPI.reducerPath) &&
          !isRejectedWithValue(action)
        ) {
          const endpoint = (action.meta.arg as any).endpointName;
          state.status[endpoint] = {
            inProgress: false,
            timestamp: "",
            message: "",
          };
        }
      }),
      builder.addMatcher(isPending, (state, action) => {
        if (action.type.startsWith(backendAPI.reducerPath)) {
          const endpoint = (action.meta.arg as any).endpointName;
          state.status[endpoint].inProgress = true;
          if (state.status[endpoint].message === "") {
            state.status[endpoint].message = "pending";
          }
        }
      }),
      builder.addMatcher(isRejectedWithValue, (state, action) => {
        // console.log(action);
        if (action.type.startsWith(backendAPI.reducerPath)) {
          const endpoint = (action.meta.arg as any).endpointName;
          state.status[endpoint] = {
            inProgress: false,
            timestamp: "",
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
  setActiveFile,
  setActiveUser,
  setPassKey,
  setAnndataField,
  setPlotConfigField,
  setGDEField,
  setGenes,
  setSelectedGenes,
  setSelectedClusters,
  setTrigger,
  setModelTypes,
  setGeneReport,
  setStatusBackend,
} = plotSlice.actions;

export default plotSlice.reducer;
