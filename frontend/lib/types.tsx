// ==== Related to reducer =================================================================
export type InitialPlotStateProps = {
  anndata: AnndataAttributes;
  plot: PlotConfiguration;
  data: {
    annotationModels: {
      models: CelltypistModel[]
      selected: CelltypistModelType | null;
    }
    genes: string[];
    GDE: GDEFields;
    geneReport?: geneReport;
  };
  filtering: {
    selected: SelectedFields;
  };
  navigation: {
    triggers: {
      [key in keyof triggerOptions]: triggerOptions[key] | null;
    };
  };
  statusBackend: statusBackendAPI;
  status: statusAttributes;
};

export type AnndataAttributeData = {
  obs: number[];
  var: string[];
  uns: Object;
  obsm: number[][];
  varm: number[][];
  obsp: number[][];
};

export type AnndataAttributeFields<T> = {
  keys?: string[];
  selectedKey?: string;
  indices?: AnndataIndices;
  data?: T;
};

export type AnndataIndices = {
  categories: string[] | number[];
  codes: number[];
};

export type AnndataAttributes = {
  [K in keyof AnndataAttributeData]: AnndataAttributeFields<
    AnndataAttributeData[K]
  >;
};

// Used in initialization of state
export const AnndataAttributeKeys: (keyof AnndataAttributeData)[] = [
  "obs",
  "var",
  "uns",
  "obsm",
  "varm",
  "obsp",
] as const;

export type PlotConfigurationData = {
  feature: {
    pointSize: number;
  },
  cluster: {
    pointSize: number;
  },
  expression: {}
}

export type PCOther = {
  palette: string;
  background?: string;
  scale?: number;
}

export type PlotConfigurationFields<T extends PlotConfigurationData[keyof PlotConfigurationData]> = PCOther & T

export type PlotConfiguration = {
  [K in keyof PlotConfigurationData]: PlotConfigurationFields<PlotConfigurationData[K]>
}

// Used in initialization of state
export const PlotTypes: (keyof PlotConfigurationData)[] = [
  "feature",
  "cluster",
  "expression",
] as const;

export type geneExpressionData = {
  gene: string;
  cluster: string;
  mean_expr: number;
  frac_expr: number;
  pvals_adj: number;
  logfoldchange: number;
  rgg_order: number;
};

export type geneDendrogramData = {
  name: string | null;
  children: geneDendrogramData[];
  distance: number;
};

export type DotplotOptions = {
  coloring: colorTypes;
  highlight: highlightType;
  expressionMin: number;
  expressionMax: number;
  expressionMinDefault: number;
  expressionMaxDefault: number;
  expressionIsDefault: boolean;
};

export type GDEFields = {
  expression: geneExpressionData[] | null;
  dendrogram: geneDendrogramData | null;
  genes: string[];
  clusters: string[];
  nGenes: number;
  nClusters: number;
  plotOptions: {
    [key in keyof DotplotOptions]: DotplotOptions[key];
  };
};

export type SelectedFields = {
  genes: string[];
  clusters: string[];
};

export type colorTypes = "mean_expr" | "logfoldchange" | "pvals_adj";

export type highlightType = "cluster" | "gene" | "rgg_order" | "none";

export const fetchOptions = [
  "generate_leiden",
  "generate_umap",
  "generate_ranked_genes_groups",
  "get_rgg_dotplot",
  "get_ranked_genes_groups",
  "get_file_hierarchy",
  "get_file_obs",
  "get_file_obsm",
  "get_filenames",
  "get_genes",
  "get_embedding",
  "get_clustering",
  "get_celltypist_annotations",
  "get_model_types",
  "get_feature_coordinates",
  "save_file_as",
  "post_new_observation",
] as const;

export type statusOptions = {
  inProgress: boolean;
  message: string;
};

export type statusAttributes = {
  [key in (typeof fetchOptions)[number]]: statusOptions;
};

export type triggerOptions = {
  saveScatterPlotImage: string;
  saveFeaturePlotImage: string;
};

export type CelltypistModelType = string;

export type CelltypistModel = {
  model: CelltypistModelType;
  description: string;
};

export type geneReport = {
  id: string;
  symbol: string;
  description: string;
  summary: string[];
  synonyms: string[];
  source: string;
  taxonmy: {
    id: string;
    name: string;
  }
}

export type Cluster = {
  label: string;
  subclusters: string[];
}

export type Reclustering = {
  file: string;
  name: string;
  base: string;
  clusters: Cluster[];
}

export const tagsBackendAPI = [
  "HIERARCHY",
  "OBSM",
  "OBS",
  "LEIDEN",
  "ANNOTATION",
  "RGG",
] as const

export type statusBackendAPI = {
  [key in (typeof tagsBackendAPI)[number]]: statusOptions;
};

// export const refreshOptions = [
//   "hierarchy"
// ] as const

// export type refreshAttributes = {
//   [key in (typeof refreshOptions)[number]]: number;
// };

// ==== Not related to reducer =============================================================

export type dgeAttributes = {
  names: string[];
  scores: number[];
  logfoldchanges: number[];
  pvals: number[];
  pvals_adj: number[];
};

export type obsmData = {
  coordinates: number[][];
};

export type fileType = {
  id: string;
  name: string;
  fileSize: number;
  fileType: string;
};


export type AutocompleteOption = {
  label: string;
  id: number;
  description?: string;
};

export type FileState = {
  files: fileType[];
  selectedFiles: string[];
  activeFile: string;
  userID: string;
};