

import { obsData, obsmData } from "@/app/(pages)/files/[fileID]/page";
import * as d3 from "d3";

const LargeDatasetCanvasPlot = (props: {
  svgCurrent: SVGSVGElement,
  groupRefs: [],
  obsData: obsData | null,
  obsmData: obsmData,
}) => {
  
  const containerRect = props.svgCurrent.getBoundingClientRect();
  const height = containerRect.height;
  const width = containerRect.width;
  
  let tempLabels = props.obsData ? props.obsData.labels : ["none"];
  let tempLabelMap = props.obsData ? props.obsData.label_map : props.obsmData.coordinates.map((e) => 0);
  let colorScheme = props.obsData ? d3.schemeCategory10 : ["black"];
  let coordinates = props.obsmData.coordinates;

  // Prepare the unique labels and map them to colors
  // const uniqueLabels = Array.from(new Set(labels));
  const colorScale = d3
    .scaleOrdinal<string>()
    .domain(tempLabels)
    .range(colorScheme); // Use provided colors or default to d3.schemeCategory10
    
  // Set up scales based on data extent
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(coordinates, (d: number[]) => d[0])) // Assuming plotData is an array of [x, y] coordinates
    .range([50, width - 150]); // Adjusted to leave space for the legend on the right

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(coordinates, (d: number[]) => d[1]))
    .range([height - 50, 50]);

  // Draw axes using D3 on an SVG
  const svgContext = d3
    .select(props.svgCurrent)
    .append("svg")
    .attr("id", "herewego")
    .attr("width", width)
    .attr("height", height);
  
  const legend = svgContext
    .append("g")
    .attr("transform", `translate(${width - 100}, 50)`) // Position the legend on the right side
    
  
  tempLabels.forEach((label, index) => {
    
    const someContext: CanvasRenderingContext2D = props.groupRefs[index].getContext("2d")
    
    someContext.canvas.width = width
    someContext.canvas.height = height
    
    tempLabelMap.map((f, j) => {
      
      if (f !== index) return;
      
      const point = coordinates[j];
      
      someContext.beginPath();
      someContext.arc(xScale(point[0]), yScale(point[1]), 1, 0, 2 * Math.PI);
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
      // .style("zIndex", 11);

    legendRow
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .attr("transform", "translate(5, 0)")
      .attr("text-anchor", "start")
      .style("alignment-baseline", "middle")
      .style("font-size", "15px")
      // .style("zIndex", 11)
      .text(label);
      
    legendRow
      .append("rect")
      .attr("width", 100)
      .attr("height", 30)
      .attr("transform", "translate(0, -5)")
      .style("opacity", "0%")
      .on("mouseover", (event, d) => {
        props.groupRefs[index].style.zIndex = "5";

        tempLabels.forEach((label_temp, index_other) => {
          label !== label_temp
            ? (props.groupRefs[index_other]!.style.opacity = "0%")
            : label_temp;
        });
      })
      .on("mouseout", () => {
        tempLabels.forEach((label_temp, index_other) => {
          label !== label_temp
            ? (props.groupRefs[index_other]!.style.opacity = "100%")
            : label_temp;
        });
      });
      
  });

  
  return () => {
    svgContext.remove()
  }
  
};

export default LargeDatasetCanvasPlot;
