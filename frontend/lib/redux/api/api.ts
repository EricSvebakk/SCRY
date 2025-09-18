
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { backendResponse, celeryCelltypistAnnotateSchema, celeryFileCopySchema, celeryFileLDRSchema, celeryFileLeidenSchema, celeryFileNLDRSchema, celeryFileReclusterSchema, celeryFileRGGSchema, celeryResultSchema, celeryStatusSchema } from "./schema";
import { tagsBackendAPI } from "@/lib/types";

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "";

export const backendAPI = createApi({
  reducerPath: "backendAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: BACKEND_ENDPOINT
  }),
  // tagTypes: tagsBackendAPI,
  endpoints: (builder) => ({
    fileHierarchy: builder.query<backendResponse, { fileID: string, userID: string }>({
      query: ({ fileID, userID }) => `file/hierarchy?file_id=${fileID}&user_id=${userID}`,
      // providesTags: ["HIERARCHY"]
    }),
    fileObs: builder.query<backendResponse, { fileID: string, userID: string, obs: string }>({
      query: ({ fileID, userID, obs }) => `file/obs?file_id=${fileID}&user_id=${userID}&obs=${obs}`
    }),
    fileObsm: builder.query<backendResponse, { fileID: string, userID: string, obsm: string }>({
      query: ({ fileID, userID, obsm}) => `file/obsm?file_id=${fileID}&user_id=${userID}&obsm=${obsm}`
    }),
    fileGenes: builder.query<backendResponse, { fileID: string, userID: string }>({
      query: ({ fileID, userID }) => `file/genes?file_id=${fileID}&user_id=${userID}`
    }),
    fileFeatureCoordinates: builder.query<backendResponse, { fileID: string, userID: string, featureKey: string }>({
      query: ({ fileID, userID, featureKey }) => `file/feature/coordinates?file_id=${fileID}&user_id=${userID}&feature_key=${featureKey}`
    }),
    celltypistModels: builder.query<backendResponse, void>({
      query: () => `celltypist/models`
    }),
    // CELERY
    celeryFileLDR: builder.mutation<backendResponse, celeryFileLDRSchema>({
      query: (body) => {
        const formData = new FormData();
        formData.append("file_id", body.fileID);
        formData.append("user_id", body.userID);
        formData.append("n_pcs", body.numPCs.toString());
        return {
          url: `celery/file/ldr`,
          method: 'POST',
          body: formData,
        }
      },
      // invalidatesTags: ["HIERARCHY"]
    }),
    celeryFileNLDR: builder.mutation<backendResponse, celeryFileNLDRSchema>({
      query: (body) => {
        const formData = new FormData();
        formData.append("file_id", body.fileID);
        formData.append("user_id", body.userID);
        formData.append("adata_key", body.adataKey);
        formData.append("n_pcs", body.numPCs.toString());
        formData.append("min_dist", body.minDist.toString());
        formData.append("spread", body.spread.toString());
        formData.append("n_neighbors", body.nNeighbors.toString());
        return {
          url: `file/nldr`,
          method: 'POST',
          body: formData
        }
      },
      // invalidatesTags: ["HIERARCHY"]
    }),
    celeryFileLeiden: builder.mutation<backendResponse, celeryFileLeidenSchema>({
      query: (body) => {
        const formData = new FormData();
        formData.append("file_id", body.fileID);
        formData.append("user_id", body.userID);
        formData.append("uns_key", body.unsKey);
        formData.append("resolution", body.resolution.toString());
        return {
          url: `file/leiden`,
          method: 'POST',
          body: formData,
        }
      },
      // invalidatesTags: ["HIERARCHY"]
    }),
    celeryFileRGG: builder.mutation<backendResponse, celeryFileRGGSchema>({
      query: (body) => {
        const formData = new FormData();
        formData.append("file_id", body.fileID);
        formData.append("user_id", body.userID);
        formData.append("uns_key", body.unsKey);
        formData.append("n_genes", body.nGenes.toString());
        body.selectedGenes.forEach((gene) => {
          formData.append("selected_genes", gene)
        });
        return {
          url: `file/rgg`,
          method: 'POST',
          body: formData,
        }
      },
      // invalidatesTags: ["HIERARCHY"]
    }),
    celeryFileCopy: builder.mutation<backendResponse, celeryFileCopySchema>({
      query: (body) => {
        const formData = new FormData();
        formData.append("file_id", body.fileID);
        formData.append("user_id", body.userID);
        formData.append("new_file_id", body.newFileID);
        formData.append("selected_obs", body.selectedObs);
        body.selectedObsClusters.forEach((cluster) => {
          formData.append("selected_obs_clusters", cluster);
        });
        return {
          url: `file/copy`,
          method: 'POST',
          body: formData,  
        }
      }
    }),
    celeryFileRecluster: builder.mutation<backendResponse, celeryFileReclusterSchema>({
      query: (body) => {
        return {
          url: `file/recluster?file_id=${body.fileID}&user_id=${body.userID}`,
          method: 'POST',
          body: body.reclustering,
        }
      },
      // invalidatesTags: ["HIERARCHY"]
    }),
    celeryCelltypistAnnotate: builder.mutation<backendResponse, celeryCelltypistAnnotateSchema>({
      query: (body) => {
        const formData = new FormData();
        formData.append("file_id", body.fileID);
        formData.append("user_id", body.userID);
        formData.append("annotation_key", body.annotationKey);
        formData.append("connectivities_key", body.connectivitiesKey);
        formData.append("annotation_model", body.annotationModel);
        return {
          url: `celltypist/annotate`,
          method: 'POST',
          body: formData,
        }
      },
      // invalidatesTags: ["HIERARCHY"]
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
  // useFileObsQuery,
  // useFileObsmQuery,
  useFileGenesQuery,
  // useFileFeatureCoordinatesQuery,
  // useCelltypistModelsQuery,
  // LAZY
  useLazyFileHierarchyQuery,
  useLazyFileObsQuery,
  useLazyFileObsmQuery,
  useLazyFileFeatureCoordinatesQuery,
  // CELERY
  // useCeleryFileLDRMutation,
  useCeleryFileNLDRMutation,
  useCeleryFileLeidenMutation,
  useCeleryFileRGGMutation,
  useCeleryFileCopyMutation,
  useCeleryFileReclusterMutation,
  useCeleryCelltypistAnnotateMutation,
  // STATUS
  useCeleryStatusQuery,
  useCeleryResultQuery,
} = backendAPI;