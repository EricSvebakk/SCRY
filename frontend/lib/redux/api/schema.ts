import { fetchOptions, Reclustering } from "@/lib/types";

export type backendResponse = {
  response: any,
  ok: boolean
}

export type celeryFileLDRSchema = {
  fileID: string;
  numPCs: number;
}

export type celeryFileNLDRSchema = {
  fileID: string;
  adataKey: string;
  numPCs: number;
  minDist: number;
  spread: number;
  nNeighbors: number;
}

export type celeryFileLeidenSchema = {
  fileID: string,
  unsKey: string,
  resolution: number,
}

export type celeryFileRGGSchema = {
  fileID: string;
  unsKey: string;
  nGenes: number;
  selectedGenes: string[];
}

export type celeryFileCopySchema = {
  fileID: string;
  newFileID: string;
  selectedObs: string;
  selectedObsClusters: string[];
}

export type celeryFileReclusterSchema = {
  fileID: string;
  reclustering: Reclustering;
}

export type celeryCelltypistAnnotateSchema = {
  fileID: string;
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
