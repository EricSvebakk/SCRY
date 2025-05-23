

import * as d3 from "d3";
import { geneExpressionData } from "../types";


type dotPlotGeneratorProps = {
  current: any;
  plotData: geneExpressionData[];
};

const DotPlotGenerator = (props: dotPlotGeneratorProps) => {
  const containerRect = props.current.getBoundingClientRect();
  const height = containerRect.height;
  const width = containerRect.width;

  const margin = { top: 55, right: 40, bottom: 40, left: 40 };
  const plotWidth = width - (margin.left + margin.right);
  const plotHeight = height - (margin.top + margin.bottom);

  const expressionValues = props.plotData.map((e) => e.mean_expr);

  const expressionMin = Math.min(...expressionValues, 0);
  const expressionMax = Math.max(...expressionValues);

  const fracValues = props.plotData.map((e) => e.frac_expr);
  const fracMin = Math.min(...fracValues, 0);
  const fracMax = Math.max(...fracValues);

  const genes = props.plotData.map((e) => e.gene);
  const groups = props.plotData.map((e) => e.group);
  
  function isUnique(value: any, index: number, array: any[]) {
    return array.indexOf(value) === index;
  }
  
  const largest = Math.max(genes.filter(isUnique).length, groups.filter(isUnique).length)
  const maxScale = 180/largest
  
  const transformNum = (num: number) => {
    return num - (fracMin - 1);
  };

  const info = {
    expr: {
      min: expressionMin,
      max: expressionMax,
      num_vals: expressionValues.length
    },
    num: {
      min: fracMin,
      max: fracMax,
      num_vals: fracValues.length
    },
    numTransformed: {
      min: transformNum(fracMin),
      max: transformNum(fracMax),
      num_vals: fracValues.length
    },
  };

  console.log("dims: ", plotWidth + "x" + plotHeight);
  console.table(largest);
  console.table(info);

  // Scales
  const xScale = d3
    .scaleBand()
    .domain(genes)
    .range([0, plotWidth])
    .padding(0.2);

  const yScale = d3
    .scaleBand()
    .domain(groups)
    .range([0, plotHeight])
    .padding(0.2);

  const colorScale = d3
    // .scaleSequential(d3.interpolateHclLong("purple", "orange"))
    .scaleSequential(d3.interpolateReds)
    .domain([0, expressionMax]); // Adjust value-to-color mapping

  const sizeScale = d3
    .scaleSqrt()
    .domain([0, fracMax])
    .range([0, maxScale]); // Adjust max size for dots

  const svgContext = d3
    .select(props.current)
    .append("svg")
    .attr("id", "bruuuther")
    .attr("width", width)
    .attr("height", height);

  const tooltip = d3
    // .select(props.current)
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("width", "20px")
    .attr("height", "20px")
    .style("z-index", 20)
    .style("position", "absolute")
    .style("opacity", 0)
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

  const xAxis = svgContext
    .append("g")
    .attr("id", "myaxes")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .call(d3.axisTop(xScale))
    .selectAll("text")
    .attr("transform", "translate(9,0) rotate(-45)")
    .style("text-anchor", "start")

  const yAxis = svgContext
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .attr("transform", "translate(-2,-8) rotate(-45)")
    .style("text-anchor", "end")

  const plotGroup = svgContext
    .append("g")
    .attr("id", "plotgroup")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  props.plotData.forEach((record: geneExpressionData, i: number) => {
    
    const meanExpr = record.mean_expr;
    const fracExpr = record.frac_expr;
    
    const circleId = `gene_dot_id_${i}`
    
    plotGroup
      .append("circle")
      .attr("id", circleId)
      .attr("cx", xScale(record.gene)! + xScale.bandwidth() / 2)
      .attr("cy", yScale(record.group)! + yScale.bandwidth() / 2)
      .attr("r", sizeScale(fracExpr))
      .attr("fill", colorScale(meanExpr))
      
    plotGroup
      .append("circle")
      .attr("cx", xScale(record.gene)! + xScale.bandwidth() / 2)
      .attr("cy", yScale(record.group)! + yScale.bandwidth() / 2)
      .attr("r", maxScale)
      .attr("fill", "transparent")
      .style("pointer-events", "all")
      .on("mouseover", function (this: any, event: MouseEvent) {
        tooltip
          .style("opacity", 1)
        d3
          .select(`#${circleId}`)
          .style("stroke", "black")
          .style("opacity", 1);
      })
      .on("mousemove", function (this:any, event: MouseEvent) {
        tooltip
          .html(`# of cells expressed: ${fracExpr.toFixed(2)} <br>Expression: ${meanExpr.toFixed(2)}`)
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY + "px");
      })
      .on("mouseleave", function (this: any, event: MouseEvent) {
        tooltip
          .style("opacity", 0);
        d3
          .select(`#${circleId}`)
          .style("stroke", "none")
      });
    
  })

  return () => {
    svgContext.remove();
    tooltip.remove();
  };
};

export default DotPlotGenerator;
