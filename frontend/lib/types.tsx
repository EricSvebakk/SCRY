import { RefObject } from "react";

export type initialPlotStateProps = {
  svgRef: RefObject<SVGSVGElement> | null;
  groupRefs: RefObject<HTMLCanvasElement[]> | null;
  hierarchy: zarrHierarchy | null;
  obs: obsData | null;
  obsm: obsmData | null;
  genes: string[] | null;
  geneExpression: geneExpressionData[];
  geneDendrogram: geneDendrogramData | null
  labelSize: {
    [key: string]: number;
  };
  selectedEmbedding: string;
  selectedCategory: string;
  selectedLabels: string[];
  selectedGenes: string[];
  inProgress: {
    [key in keyof ProgressOptions]: ProgressOptions[key]
  }
};

export type ProgressOptions = {
  generate_leiden: boolean;
  generate_umap: boolean;
  generate_ranked_genes_groups: boolean;
  get_rgg_dotplot: boolean;
  get_ranked_genes_groups: boolean;
  get_file_hierarchy: boolean;
  get_file_obs: boolean;
  get_file_obsm: boolean;
  get_filenames: boolean;
  get_genes: boolean;
};

export type dgeAttributes = {
  names: string[];
  scores: number[];
  logfoldchanges: number[];
  pvals: number[];
  pvals_adj: number[];
};

export type obsData = {
  labels: string[];
  label_map: number[];
}

export type obsmData = {
  coordinates: number[][];
}

export type geneExpressionData = {
  gene: string;
  group: string;
  mean_expr: number;
  frac_expr: number;
};

export type geneDendrogramData = {
  name: string | null;
  children: geneDendrogramData[];
  distance: number
}

export type zarrHierarchy = {
  X: string[];
  layers: string[];
  obs: string[];
  obsm: string[];
  obsp: string[];
  raw: string[];
  uns: {
    [key: string]: any;
  }
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

export type fileType = {
  id: string;
  name: string;
  fileSize: number;
  fileType: string;
}

export interface FileState {
  files: fileType[];
  selectedFiles: string[];
  activeFile: string;
}

export type AutocompleteOption = {
  label: string;
  id: number;
}