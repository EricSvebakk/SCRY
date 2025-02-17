

import * as d3 from "d3";
import { obsData, obsmData } from "../types";

let my_colors = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  // "#7f7f7f",
  "#bcbd22",
  "#17becf",
];

// let my_colors = d3.schemeCategory10

const LargeDatasetCanvasPlot = (props: {
  title: string,
  svgCurrent: SVGSVGElement,
  groupRefs: HTMLCanvasElement[],
  obsData: obsData | null,
  obsmData: obsmData,
}) => {
  
  const containerRect = props.svgCurrent.getBoundingClientRect();
  const height = containerRect.height;
  const width = containerRect.width;
  
  const canvasWidth = ((width / 12) * 8)
  const legendWidth = ((width / 12) * 3)
  const paddingWidth = width - (canvasWidth + legendWidth)
  
  let tempLabels = props.obsData ? props.obsData.labels : ["none"];
  let tempLabelMap = props.obsData ? props.obsData.label_map : props.obsmData.coordinates.map((e) => 0);
  let colorScheme = props.obsData ? my_colors : ["black"];
  let coordinates = props.obsmData.coordinates;
  
  const pointSize = 3.5 - (0.5 * Math.log10(coordinates.length))

  // Prepare the unique labels and map them to colors
  const colorScale = d3
    .scaleOrdinal<string>()
    .domain(tempLabels)
    .range(colorScheme);
    
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(coordinates, (d: number[]) => d[0]) as [number, number]) // Assuming plotData is an array of [x, y] coordinates
    .range([50, canvasWidth]); // Adjusted to leave space for the legend on the right

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(coordinates, (d: number[]) => d[1]) as [number, number])
    .range([height - 50, 50]);

  // Context for drawing legends and title
  const svgContext = d3
    .select(props.svgCurrent)
    .append("svg")
    .attr("id", "herewego")
    .attr("width", width)
    .attr("height", height);
    
  // Context for title
  const title = svgContext
    .append("text")
    .attr("text-anchor", "start")
    .style("alignment-baseline", "middle")
    .style("font-size", "15px")
    .attr("transform", "translate(20, 20)")
    .text(props.title);
  
  const legend = svgContext
    .append("g")
    .attr("transform", `translate(${canvasWidth + paddingWidth/2}, 50)`); // Position the legend on the right side
    
  
  tempLabels.forEach((label, index) => {
    
    const someContext: CanvasRenderingContext2D = props.groupRefs[index].getContext("2d")!
    
    someContext.canvas.width = width
    someContext.canvas.height = height
    
    tempLabelMap.map((f, j) => {
      
      if (f !== index) return;
      
      const point = coordinates[j];
      
      someContext.beginPath();
      someContext.arc(xScale(point[0]), yScale(point[1]), pointSize, 0, 2 * Math.PI);
      someContext.fillStyle = tempLabels.length > 0 ? colorScale(tempLabels[tempLabelMap[j]]) : "black"; // Apply color based on the label
      someContext.fill();
      someContext.closePath();
    })
    
    const legendRow = legend
      .append("g")
      .attr("id", "legend_" + label)
      .attr("transform", `translate(0, ${index * 30})`) // Space each legend item vertically
      
    legendRow
      .append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", colorScale(tempLabels[index]))
      .style("padding", "5px");

    legendRow
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .attr("transform", "translate(5, 0)")
      .attr("text-anchor", "start")
      .style("alignment-baseline", "middle")
      .style("font-size", "15px")
      .text(label);
      
    legendRow
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", 30)
      .attr("transform", "translate(0, -5)")
      .style("opacity", "0%")
      .on("mouseover", () => {
        props.groupRefs[index].style.zIndex = "8";

        tempLabels.forEach((label_temp, index_other) => {
          if (label !== label_temp) {
            props.groupRefs[index_other]!.style.filter = "grayscale(1)";
          }
        });
      })
      .on("mouseout", () => {
        props.groupRefs[index].style.zIndex = "5";
        
        tempLabels.forEach((label_temp, index_other) => {
          if (label !== label_temp) {
            props.groupRefs[index_other]!.style.filter = "grayscale(0)";
            props.groupRefs[index_other]!.style.opacity = "100%";
          }
        });
      })
      .on("click", () => {
        tempLabels.forEach((label_temp, index_other) => {
          if (label !== label_temp) {
            props.groupRefs[index_other]!.style.opacity = "0%"
          }
        });
        
      })
      
  });

  return () => {
    svgContext.remove()
  }
  
};

export default LargeDatasetCanvasPlot;
