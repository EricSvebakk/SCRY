
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { backendResponse, celeryCelltypistAnnotateSchema, celeryFileCopySchema, celeryFileLDRSchema, celeryFileLeidenSchema, celeryFileNLDRSchema, celeryFileReclusterSchema, celeryFileRGGSchema, celeryResultSchema, celeryStatusSchema } from "./schema";
import { tagsBackendAPI } from "@/lib/types";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export const backendAPI = createApi({
  reducerPath: "backendAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: BACKEND_ENDPOINT
  }),
  tagTypes: tagsBackendAPI,
  endpoints: (builder) => ({
    fileHierarchy: builder.query<backendResponse, { fileID: string }>({
      query: ({fileID}) => `file/hierarchy?file_id=${fileID}`,
      providesTags: ["HIERARCHY"]
    }),
    fileObs: builder.query<backendResponse, { fileID: string, obs: string }>({
      query: ({fileID, obs}) => `file/obs?file_id=${fileID}&obs=${obs}`
    }),
    fileObsm: builder.query<backendResponse, { fileID: string, obsm: string }>({
      query: ({fileID, obsm}) => `file/obsm?file_id=${fileID}&obsm=${obsm}`
    }),
    fileGenes: builder.query<backendResponse, { fileID: string }>({
      query: ({fileID}) => `file/obs?file_id=${fileID}`
    }),
    fileFeatureCoordinates: builder.query<backendResponse, { fileID: string, featureKey: string }>({
      query: ({fileID, featureKey}) => `file/obs?file_id=${fileID}&feature_key=${featureKey}`
    }),
    celltypistModels: builder.query<backendResponse, void>({
      query: () => `celltypist/models`
    }),
    celeryFileLDR: builder.mutation<backendResponse, celeryFileLDRSchema>({
      query: (body) => ({
        url: `celery/file/ldr`,
        method: 'POST',
        body: {
          file_id: body.fileID,
          n_pcs: body.numPCs
        },
      }),
      invalidatesTags: ["HIERARCHY"]
    }),
    celeryFileNLDR: builder.mutation<backendResponse, celeryFileNLDRSchema>({
      query: (body) => {
        const formData = new FormData();
        formData.append("file_id", body.fileID);
        formData.append("adata_key", body.adataKey);
        formData.append("n_pcs", body.numPCs.toString());
        formData.append("min_dist", body.minDist.toString());
        formData.append("spread", body.spread.toString());
        formData.append("n_neighbors", body.nNeighbors.toString());
        return {
          url: `celery/file/nldr`,
          method: 'POST',
          body: formData
        }
      },
      invalidatesTags: ["HIERARCHY"]
    }),
    celeryFileLeiden: builder.mutation<backendResponse, celeryFileLeidenSchema>({
      query: (body) => ({
        url: `celery/file/leiden`,
        method: 'POST',
        body: {
          file_id: body.fileID,
          adata_key: body.unsKey,
          resolution: body.resolution
        },
      }),
      invalidatesTags: ["HIERARCHY"]
    }),
    celeryFileRGG: builder.mutation<backendResponse, celeryFileRGGSchema>({
      query: (body) => ({
        url: `celery/file/rgg`,
        method: 'POST',
        body: {
          file_id: body.fileID,
          uns_key: body.unsKey,
          n_genes: body.nGenes,
          selected_genes: body.selectedGenes
        },
      }),
      invalidatesTags: ["HIERARCHY"]
    }),
    celeryFileCopy: builder.mutation<backendResponse, celeryFileCopySchema>({
      query: (body) => ({
        url: `celery/file/copy`,
        method: 'POST',
        body: {
          file_id: body.fileID,
          new_file_id: body.newFileID,
          selected_obs: body.selectedObs,
          selected_obs_clusters: body.selectedObsClusters
        },
      })
    }),
    celeryFileRecluster: builder.mutation<backendResponse, celeryFileReclusterSchema>({
      query: (body) => ({
        url: `celery/file/recluster`,
        method: 'POST',
        body: {
          file_id: body.fileID,
          observation: body.reclustering
        },
      }),
      invalidatesTags: ["HIERARCHY"]
    }),
    celeryCelltypistAnnotate: builder.mutation<backendResponse, celeryCelltypistAnnotateSchema>({
      query: (body) => ({
        url: `celery/file/annotate`,
        method: 'POST',
        body: {
          file_id: body.fileID,
          annotation_key: body.annotationKey,
          connectivities_key: body.connectivitiesKey,
          annotation_model: body.annotationModel
        },
      }),
      invalidatesTags: ["HIERARCHY"]
    }),
    celeryStatus: builder.query<backendResponse, { taskID: string }>({
      query: ({ taskID }) => `celery/status?task_id=${taskID}`
    }),
    celeryResult: builder.query<backendResponse, { taskID: string }>({
      query: ({ taskID }) => `celery/result?task_id=${taskID}`
    }),
  })
});

export const { 
  useFileHierarchyQuery,
  useLazyFileHierarchyQuery, // Lazy
  useFileObsQuery,
  useLazyFileObsQuery, // Lazy
  useFileObsmQuery,
  useLazyFileObsmQuery, // Lazy
  useFileGenesQuery,
  useFileFeatureCoordinatesQuery,
  useCelltypistModelsQuery,
  useCeleryFileLDRMutation,
  useCeleryFileNLDRMutation,
  useCeleryFileLeidenMutation,
  useCeleryFileRGGMutation,
  useCeleryFileCopyMutation,
  useCeleryFileReclusterMutation,
  useCeleryCelltypistAnnotateMutation,
  useCeleryStatusQuery,
  useCeleryResultQuery,
} = backendAPI;