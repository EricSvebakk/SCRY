

import * as d3 from "d3";

const LargeDatasetCanvasPlot = (props: {
  svgCurrent: SVGSVGElement,
  groupRefs: [],
  plotData: {
    coordinates: number[][],
    labels: string[]
    label_map: number[]
  },
}) => {
  const { coordinates, labels, label_map } = props.plotData;
  
  const containerRect = props.svgCurrent.getBoundingClientRect();
  const height = containerRect.height;
  const width = containerRect.width;

  // Prepare the unique labels and map them to colors
  // const uniqueLabels = Array.from(new Set(labels));
  const colorScale = d3
    .scaleOrdinal<string>()
    .domain(labels)
    .range(d3.schemeCategory10); // Use provided colors or default to d3.schemeCategory10
    
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


  labels.forEach((label, index) => {
    
    const someContext: CanvasRenderingContext2D = props.groupRefs[index].getContext("2d")
    
    someContext.canvas.width = width
    someContext.canvas.height = height
    
    label_map.map((f, j) => {
      
      if (f !== index) return;
      
      const point = coordinates[j];
      
      someContext.beginPath();
      someContext.arc(xScale(point[0]), yScale(point[1]), 1, 0, 2 * Math.PI);
      someContext.fillStyle = colorScale(labels[label_map[j]]); // Apply color based on the label
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
      .attr("fill", colorScale(labels[index]))
      .style("padding", "5px");
      // .style("zIndex", 11);

    legendRow
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
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
      // .attr("fill", "")
      // .style("zIndex", 12)
      .on("mouseover", (event, d) => {
        props.groupRefs[index].style.zIndex = "5";

        labels.forEach((label_temp, index_other) => {
          label !== label_temp
            ? (props.groupRefs[index_other]!.style.opacity = "0%")
            : label_temp;
        });
      })
      .on("mouseout", () => {
        labels.forEach((label_temp, index_other) => {
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
