import { fetchOptions, Reclustering } from "@/lib/types";

export type backendResponse = {
  response: any,
  ok: boolean
}

export type celeryFileLDRSchema = {
  fileID: string;
  userID: string;
  numPCs: number;
}

export type celeryFileNLDRSchema = {
  fileID: string;
  userID: string;
  adataKey: string;
  numPCs: number;
  minDist: number;
  spread: number;
  nNeighbors: number;
}

export type celeryFileLeidenSchema = {
  fileID: string,
  userID: string;
  unsKey: string,
  resolution: number,
}

export type celeryFileRGGSchema = {
  fileID: string;
  userID: string;
  unsKey: string;
  nGenes: number;
  selectedGenes: string[];
}

export type celeryFileCopySchema = {
  fileID: string;
  userID: string;
  newFileID: string;
  selectedObs: string;
  selectedObsClusters: string[];
}

export type celeryFileReclusterSchema = {
  fileID: string;
  userID: string;
  reclustering: Reclustering;
}

export type celeryCelltypistAnnotateSchema = {
  fileID: string;
  userID: string;
  annotationKey: string;
  connectivitiesKey: string;
  annotationModel: string;
}

export type celeryStatusSchema = {
  taskID: string;
  statusID: typeof fetchOptions[number];
}

export type celeryResultSchema = {
  taskID: string;
}
