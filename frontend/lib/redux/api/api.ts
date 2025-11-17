import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  backendResponse,
  celeryCelltypistAnnotateSchema as CelltypistAnnotateSchema,
  celeryFileCopySchema as FileCopySchema,
  celeryFileLeidenSchema as LeidenSchema,
  celeryFileMergeSchema as FileMergeSchema,
  celeryFileNLDRSchema as EmbeddingSchema,
  celeryFileReclusterSchema as FileReclusterSchema,
  celeryFileRGGSchema as DGESchema,
} from "./schema";
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
    SystemFiles: builder.query<backendResponse, void>({
      query: () => `system/files`,
    }),
    CelltypistModels: builder.query<backendResponse, void>({
      query: () => `celltypist/models`,
    }),
    Metadata: builder.query<backendResponse, void>({
      query: () => `file/metadata`,
    }),
    Hierarchy: builder.query<backendResponse, void>({
      query: () => `file/hierarchy`,
    }),
    Obs: builder.query<backendResponse, { obs: string }>({
      query: ({ obs }) => `file/obs?obs=${obs}`,
    }),
    Obsm: builder.query<backendResponse, { obsm: string }>({
      query: ({ obsm }) => `file/obsm?obsm=${obsm}`,
    }),
    Genes: builder.query<backendResponse, void>({
      query: () => `file/genes`,
    }),
    Feature: builder.query<backendResponse, { featureKey: string }>({
      query: ({ featureKey }) => `file/feature?feature_key=${featureKey}`,
    }),
    statusTask: builder.query<backendResponse, { taskID: string }>({
      query: ({ taskID }) => `status/task?task_id=${taskID}`,
    }),
    statusResult: builder.query<backendResponse, { taskID: string }>({
      query: ({ taskID }) => `status/result?task_id=${taskID}`,
    }),
    // celeryFileLDR: builder.mutation<backendResponse, celeryFileLDRSchema>({
    //   query: (body) => {
    //     const formData = new FormData();
    //     formData.append("n_pcs", body.numPCs.toString());
    //     return {
    //       url: `celery/file/ldr`,
    //       method: "POST",
    //       body: formData,
    //     };
    //   },
    // }),
    Embedding: builder.mutation<backendResponse, EmbeddingSchema>({
      query: (body) => {
        const formData = new FormData();
        formData.append("adata_key", body.adataKey);
        formData.append("n_pcs", body.numPCs.toString());
        formData.append("min_dist", body.minDist.toString());
        formData.append("spread", body.spread.toString());
        formData.append("n_neighbors", body.nNeighbors.toString());
        return {
          url: `compute/embedding`,
          method: "POST",
          body: formData,
        };
      },
    }),
    Leiden: builder.mutation<backendResponse, LeidenSchema>({
      query: (body) => {
        const formData = new FormData();
        formData.append("uns_key", body.unsKey);
        formData.append("neighbors_key", body.neighborsKey);
        formData.append("resolution", body.resolution.toString());
        return {
          url: `compute/leiden`,
          method: "POST",
          body: formData,
        };
      },
    }),
    DGE: builder.mutation<backendResponse, DGESchema>({
      query: (body) => {
        const formData = new FormData();
        formData.append("uns_key", body.unsKey);
        formData.append("n_genes", body.nGenes.toString());
        body.selectedGenes.forEach((gene) => {
          formData.append("selected_genes", gene);
        });
        return {
          url: `compute/dge`,
          method: "POST",
          body: formData,
        };
      },
    }),
    FileCopy: builder.mutation<backendResponse, FileCopySchema>({
      query: (body) => {
        const formData = new FormData();
        formData.append("new_file_id", body.newFileID);
        formData.append("selected_obs", body.selectedObs);
        body.selectedObsClusters.forEach((cluster) => {
          formData.append("selected_obs_clusters", cluster);
        });
        return {
          url: `compute/copy`,
          method: "POST",
          body: formData,
        };
      },
    }),
    FileRecluster: builder.mutation<backendResponse, FileReclusterSchema>(
      {
        query: (body) => {
          return {
            url: `compute/recluster`,
            method: "POST",
            body: body.reclustering,
          };
        },
      }
    ),
    FileMerge: builder.mutation<backendResponse, FileMergeSchema>({
      query: (body) => {
        return {
          url: `compute/merge`,
          method: "POST",
          body: {
            observation: body.reclustering,
            file_path_dest: body.fileDestID,
          },
        };
      },
    }),
    CelltypistAnnotate: builder.mutation<
      backendResponse,
      CelltypistAnnotateSchema
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
    }),
  }),
});

export const {
  // QUERY
  useSystemFilesQuery,
  useGenesQuery,
  useCelltypistModelsQuery,
  useStatusTaskQuery,
  useStatusResultQuery,
  // LAZY QUERY
  useLazyHierarchyQuery,
  useLazySystemFilesQuery,
  useLazyMetadataQuery,
  useLazyObsQuery,
  useLazyObsmQuery,
  useLazyFeatureQuery,
  useLazyCelltypistModelsQuery,
  // MUTATION
  useEmbeddingMutation,
  useLeidenMutation,
  useDGEMutation,
  useFileCopyMutation,
  useFileReclusterMutation,
  useFileMergeMutation,
  useCelltypistAnnotateMutation,
} = backendAPI;
