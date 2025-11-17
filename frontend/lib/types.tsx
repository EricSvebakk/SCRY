import { backendAPI } from "./redux/api/api";

// ==== Related to reducer =================================================================
export type InitialPlotStateProps = {
  system: systemFields;
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
  status: statusType;
  // status: statusAttributes;
  error: errorType;
};

export type fileType = {
  id: string;
  name: string;
  fileSize: number;
  fileType: string;
};

export type systemFields = {
  user: {
    id: string;
    passKey: string;
  };
  files: {
    all: fileType[];
    selected: fileType[];
    active: string;
  };
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
    showHiddenPoints: boolean;
    showLegend: boolean;
  };
  cluster: {
    pointSize: number;
    showHiddenPoints: boolean;
    showLegend: boolean;
  };
  expression: {
    selected: string[];
    sortClustersBy: sortClustersByType;
    sortGenesBy: sortGenesByType;
    sortClustersByDirection: sortByDirectionType;
    sortGenesByDirection: sortByDirectionType;
    layer: colorTypes;
    highlight: highlightType;
    expressionMin: number;
    expressionMax: number;
    expressionMinDefault: number;
    expressionMaxDefault: number;
    expressionIsDefault: boolean;
  };
};

export type PCOther = {
  palette: string;
  width?: number;
  height?: number;
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
  batch: number;
  dendro_order: number;
  within_cluster_rank: number;
};

export type geneDendrogramData = {
  name: string | null;
  children: geneDendrogramData[];
  distance: number;
};

// export type DotplotOptions = {
//   coloring: colorTypes;
//   highlight: highlightType;
//   expressionMin: number;
//   expressionMax: number;
//   expressionMinDefault: number;
//   expressionMaxDefault: number;
//   expressionIsDefault: boolean;
// };

export type GDEFields = {
  selected: string | null;
  expression: geneExpressionData[] | null;
  dendrogram: geneDendrogramData | null;
  nGenes: number;
  nClusters: number;
  genes: string[];
  clusters: string[];
  // plotOptions: {
  //   [key in keyof DotplotOptions]: DotplotOptions[key];
  // };
};

export type SelectedFields = {
  genes: string[];
  clusters: string[];
};

export type colorTypes = "mean_expr" | "logfoldchange" | "pvals_adj";

export type highlightType = "cluster" | "gene" | "rgg_order" | "none";

export type sortClustersByType = "dendrogram" | "alphabetical";
export type sortGenesByType = "rgg_order" | "mean" | "fraction" | "alphabetical";
export type sortByDirectionType = "ascending" | "descending";

// Equivalent to Object.keys(backendAPI.endpoints) but this offers better type support
export const endpoints: readonly string[] = [
  "SystemFiles",
  "CelltypistModels",
  "Metadata",
  "Hierarchy",
  "Obs",
  "Obsm",
  "Genes",
  "Feature",
  "statusTask",
  "statusResult",
  "Embedding",
  "Leiden",
  "DGE",
  "FileCopy",
  "FileRecluster",
  "FileMerge",
  "CelltypistAnnotate",
];

export type statusOptions = {
  inProgress: boolean;
  timestamp: string;
  message: string;
};

export type statusType = {
  [key in (typeof endpoints)[number]]: statusOptions;
};

export type errorOptions = {
  message: string;
  time?: string;
}

export type errorType = {
  [key in (typeof endpoints)[number]]: errorOptions;
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

export type AutocompleteOption = {
  label: string;
  id: number;
  description?: string;
  value?: string;
};

export type FileState = {
  files: fileType[];
  selectedFiles: string[];
  activeFile: string;
  userID: string;
  passKey: string;
};