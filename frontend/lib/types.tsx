
export type obsData = {
  labels: string[];
  label_map: number[];
}

export type obsmData = {
  coordinates: number[][];
}

export type obsExpressionData = {
  label: string;
  mean_expr: { [subKey: string]: number };
  num_expr: { [subKey: string]: number };
};

export type zarrHierarchy = {
  X: string[];
  layers: string[];
  obs: string[];
  obsm: string[];
  obsp: string[];
  raw: string[];
  uns: string[];
  var: string[];
  varm: string[];
  varp: string[];
};

export type TooltipKey = "X_umap" | "X_tsne" | "X_pca";

export const tooltips: Record<TooltipKey, string> = {
  X_umap: "Uniform Manifold Aproximation and Projection",
  X_tsne: "T-distributed Stochastic Neighbor Embedding",
  X_pca: "Principal Component Analysis",
};