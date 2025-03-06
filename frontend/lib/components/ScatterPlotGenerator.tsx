

import * as d3 from "d3";
import { obsData, obsmData } from "../types";
import { setLabelSize } from "../redux/reducers/plotReducer";

export const my_colors = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#bcbd22",
  "#17becf",
];

const ScatterPlotGenerator = (props: {
  title: string,
  svgCurrent: SVGSVGElement,
  groupRefs: HTMLCanvasElement[],
  obsData: obsData | null,
  obsmData: obsmData,
  dispatch: Function,
}) => {
  
  const containerRect = props.svgCurrent.getBoundingClientRect();
  const height = containerRect.height;
  const width = containerRect.width;
  
  const canvasWidth = height;
  const canvasHeight = height;
  
  const paddingRatio = 15;
  const paddingWidth = canvasWidth / paddingRatio;
  const paddingHeight = canvasHeight / paddingRatio;
  
  let labels = props.obsData ? props.obsData.labels : ["none"];
  let labelMap = props.obsData ? props.obsData.label_map : props.obsmData.coordinates.map((e) => 0);
  let colorScheme = props.obsData ? my_colors : ["black"];
  let coordinates = props.obsmData.coordinates;
  
  let labelSizeMap: {[key: string]: number} = {};
  
  props.obsData?.labels.forEach((e: string) => {
    labelSizeMap[e] = 0;
  });
  
  props.obsData?.label_map.forEach((f: number) => {
    const labelIndex = props.obsData?.labels[f]!;
    labelSizeMap[labelIndex] ++;
  })
  
  props.dispatch(setLabelSize(labelSizeMap))
  
  const pointSize = 3.5 - (0.5 * Math.log10(coordinates.length))

  const colorScale = d3
    .scaleOrdinal<string>()
    .domain(labels)
    .range(colorScheme);
    
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(coordinates, (d: number[]) => d[0]) as [number, number])
    .range([paddingWidth, canvasWidth - paddingWidth]);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(coordinates, (d: number[]) => d[1]) as [number, number])
    .range([height - paddingHeight, paddingHeight]);

  const svgContext = d3
    .select(props.svgCurrent)
    .append("svg")
    .attr("id", "herewego")
    .attr("width", width)
    .attr("height", height);
    
  const title = svgContext
    .append("text")
    .attr("text-anchor", "start")
    .style("alignment-baseline", "middle")
    .style("font-size", "15px")
    .attr("transform", "translate(20, 20)")
    .text(props.title);
    
  
  labels.forEach((label, labelIndex) => {
    
    const someContext: CanvasRenderingContext2D = props.groupRefs[labelIndex].getContext("2d")!
    
    someContext.canvas.width = width
    someContext.canvas.height = height
    
    labelMap.map((labelPosition, positionIndex) => {
      
      if (labelPosition !== labelIndex) return;
      
      const point = coordinates[positionIndex];
      
      someContext.beginPath();
      someContext.arc(xScale(point[0]), yScale(point[1]), pointSize, 0, 2 * Math.PI);
      someContext.fillStyle = labels.length > 0 ? colorScale(labels[labelMap[positionIndex]]) : "black";
      someContext.fill();
      someContext.closePath();
    })
      
  });

  return () => {
    svgContext.remove()
  }
  
};

export default ScatterPlotGenerator;
