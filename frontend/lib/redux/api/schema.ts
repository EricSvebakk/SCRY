import { fetchOptions, Reclustering } from "@/lib/types";

export type backendResponse = {
  response: any,
  timestamp?: string,
  ok: boolean
}

export type celeryFileLDRSchema = {
  numPCs: number;
}

export type celeryFileNLDRSchema = {
  adataKey: string;
  numPCs: number;
  minDist: number;
  spread: number;
  nNeighbors: number;
}

export type celeryFileLeidenSchema = {
  unsKey: string,
  neighborsKey: string,
  resolution: number,
}

export type celeryFileRGGSchema = {
  unsKey: string;
  nGenes: number;
  selectedGenes: string[];
}

export type celeryFileCopySchema = {
  newFileID: string;
  selectedObs: string;
  selectedObsClusters: string[];
}

export type celeryFileReclusterSchema = {
  reclustering: Reclustering;
}

export type celeryFileMergeSchema = {
  reclustering: Reclustering;
  fileDestID: string;
};

export type celeryCelltypistAnnotateSchema = {
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
