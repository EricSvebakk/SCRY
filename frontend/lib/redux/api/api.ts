
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { backendResponse, celeryCelltypistAnnotateSchema, celeryFileCopySchema, celeryFileLDRSchema, celeryFileLeidenSchema, celeryFileMergeSchema, celeryFileNLDRSchema, celeryFileReclusterSchema, celeryFileRGGSchema, celeryResultSchema, celeryStatusSchema } from "./schema";
import { tagsBackendAPI } from "@/lib/types";
import { RootState } from "../stores/store";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export const backendAPI = createApi({
  reducerPath: "backendAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: BACKEND_ENDPOINT,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      headers.set("file_id", state.plotReducer.system.files.active);
      headers.set("pass_key", state.plotReducer.system.user.passKey);
      headers.set("user_id", state.plotReducer.system.user.id);
      return headers;
    },
  }),
  // tagTypes: tagsBackendAPI,
  endpoints: (builder) => ({
    systemFiles: builder.query<backendResponse, void>({
      query: () => `system/files`,
      // providesTags: ["HIERARCHY"]
    }),
    metadata: builder.query<backendResponse, void>({
      query: () => `file/metadata`,
    }),
    fileHierarchy: builder.query<backendResponse, void>({
      query: () => `file/hierarchy`,
      // providesTags: ["HIERARCHY"]
    }),
    fileObs: builder.query<backendResponse, { obs: string }>({
      query: ({ obs }) => `file/obs?obs=${obs}`,
    }),
    fileObsm: builder.query<backendResponse, { obsm: string }>({
      query: ({ obsm }) => `file/obsm?obsm=${obsm}`,
    }),
    fileGenes: builder.query<backendResponse, void>({
      query: () => `file/genes`,
    }),
    fileFeatureCoordinates: builder.query<
      backendResponse,
      { featureKey: string }
    >({
      query: ({ featureKey }) =>
        `file/feature/coordinates?feature_key=${featureKey}`,
    }),
    celltypistModels: builder.query<backendResponse, void>({
      query: () => `celltypist/models`,
    }),
    // CELERY
    celeryFileLDR: builder.mutation<backendResponse, celeryFileLDRSchema>({
      query: (body) => {
        const formData = new FormData();
        formData.append("n_pcs", body.numPCs.toString());
        return {
          url: `celery/file/ldr`,
          method: "POST",
          body: formData,
        };
      },
      // invalidatesTags: ["HIERARCHY"]
    }),
    celeryFileNLDR: builder.mutation<backendResponse, celeryFileNLDRSchema>({
      query: (body) => {
        const formData = new FormData();
        formData.append("adata_key", body.adataKey);
        formData.append("n_pcs", body.numPCs.toString());
        formData.append("min_dist", body.minDist.toString());
        formData.append("spread", body.spread.toString());
        formData.append("n_neighbors", body.nNeighbors.toString());
        return {
          url: `file/nldr`,
          method: "POST",
          body: formData,
        };
      },
      // invalidatesTags: ["HIERARCHY"]
    }),
    Leiden: builder.mutation<backendResponse, celeryFileLeidenSchema>(
      {
        query: (body) => {
          const formData = new FormData();
          formData.append("uns_key", body.unsKey);
          formData.append("neighbors_key", body.neighborsKey);
          formData.append("resolution", body.resolution.toString());
          return {
            url: `file/leiden`,
            method: "POST",
            body: formData,
          };
        },
        // invalidatesTags: ["HIERARCHY"]
      }
    ),
    celeryFileRGG: builder.mutation<backendResponse, celeryFileRGGSchema>({
      query: (body) => {
        const formData = new FormData();
        formData.append("uns_key", body.unsKey);
        formData.append("n_genes", body.nGenes.toString());
        body.selectedGenes.forEach((gene) => {
          formData.append("selected_genes", gene);
        });
        return {
          url: `file/rgg`,
          method: "POST",
          body: formData,
        };
      },
      // invalidatesTags: ["HIERARCHY"]
    }),
    celeryFileCopy: builder.mutation<backendResponse, celeryFileCopySchema>({
      query: (body) => {
        const formData = new FormData();
        formData.append("new_file_id", body.newFileID);
        formData.append("selected_obs", body.selectedObs);
        body.selectedObsClusters.forEach((cluster) => {
          formData.append("selected_obs_clusters", cluster);
        });
        return {
          url: `file/copy`,
          method: "POST",
          body: formData,
        };
      },
    }),
    celeryFileRecluster: builder.mutation<
      backendResponse,
      celeryFileReclusterSchema
    >({
      query: (body) => {
        return {
          url: `file/recluster`,
          method: "POST",
          body: body.reclustering,
        };
      },
      // invalidatesTags: ["HIERARCHY"]
    }),
    celeryFileMerge: builder.mutation<backendResponse, celeryFileMergeSchema>({
      query: (body) => {
        return {
          url: `file/merge`,
          method: "POST",
          body: {
            observation: body.reclustering,
            file_path_dest: body.fileDestID,
          },
        };
      },
      // invalidatesTags: ["HIERARCHY"]
    }),
    celeryCelltypistAnnotate: builder.mutation<
      backendResponse,
      celeryCelltypistAnnotateSchema
    >({
      query: (body) => {
        const formData = new FormData();
        formData.append("annotation_key", body.annotationKey);
        formData.append("connectivities_key", body.connectivitiesKey);
        formData.append("annotation_model", body.annotationModel);
        return {
          url: `celltypist/annotate`,
          method: "POST",
          body: formData,
        };
      },
      // invalidatesTags: ["HIERARCHY"]
    }),
    celeryStatus: builder.query<backendResponse, { taskID: string }>({
      query: ({ taskID }) => `celery/status?task_id=${taskID}`,
    }),
    celeryResult: builder.query<backendResponse, { taskID: string }>({
      query: ({ taskID }) => `celery/result?task_id=${taskID}`,
    }),
  }),
});

export const { 
  useSystemFilesQuery,
  useLazyMetadataQuery,
  useFileHierarchyQuery,
  // useFileObsQuery,
  // useFileObsmQuery,
  useFileGenesQuery,
  // useFileFeatureCoordinatesQuery,
  useCelltypistModelsQuery,
  // LAZY
  useLazySystemFilesQuery,
  useLazyFileHierarchyQuery,
  useLazyFileObsQuery,
  useLazyFileObsmQuery,
  useLazyFileFeatureCoordinatesQuery,
  useLazyCelltypistModelsQuery,
  // CELERY
  // useCeleryFileLDRMutation,
  useCeleryFileNLDRMutation,
  useLeidenMutation,
  useCeleryFileRGGMutation,
  useCeleryFileCopyMutation,
  useCeleryFileReclusterMutation,
  useCeleryFileMergeMutation,
  useCeleryCelltypistAnnotateMutation,
  // STATUS
  useCeleryStatusQuery,
  useCeleryResultQuery,
} = backendAPI;