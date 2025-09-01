
import * as d3 from "d3";

export type linearScaleColorType = (t: number) => string;
export type sequentialScaleColorType = string[];


export const linearScaleColorOptions: { [key: string]: linearScaleColorType } = {
  orange: d3.interpolateOranges,
  viridis: d3.interpolateViridis,
  magma: d3.interpolateMagma,
};


export const sequentialScaleColorOptions: { [key: string]: sequentialScaleColorType } = {
  // custom: [
  //   "#1f77b4",
  //   "#ff7f0e",
  //   "#2ca02c",
  //   "#d62728",
  //   "#9467bd",
  //   "#8c564b",
  //   "#e377c2",
  //   "#bcbd22",
  //   "#17becf",
  // ],
  cat10: d3.schemeCategory10 as [],
  obs10: d3.schemeObservable10 as [],
  pastel: d3.schemePastel1 as [],
  paired: d3.schemePaired as [],
};