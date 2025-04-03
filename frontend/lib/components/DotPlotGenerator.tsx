

import * as d3 from "d3";
import { obsExpressionData } from "../types";


type dotPlotGeneratorProps = {
  current: any;
  plotData: obsExpressionData[];
};

const DotPlotGenerator = (props: dotPlotGeneratorProps) => {
  const containerRect = props.current.getBoundingClientRect();
  const height = containerRect.height;
  const width = containerRect.width;

  const margin = { top: 100, right: 20, bottom: 20, left: 80 };
  const plotWidth = width - (margin.left + margin.right);
  const plotHeight = height - (margin.top + margin.bottom);

  const expressionValues = props.plotData.flatMap((d) =>
    Object.values(d.mean_expr)
  );
  const expressionMin = Math.min(...expressionValues);
  const expressionMax = Math.max(...expressionValues);

  const numValues = props.plotData.flatMap((d) => Object.values(d.num_expr));
  const numMin = Math.min(...numValues);
  const numMax = Math.max(...numValues);

  const genes = props.plotData.flatMap((d: obsExpressionData) =>
    Object.keys(d.mean_expr)
  );
  const groups = props.plotData.map((e: obsExpressionData) => e.label);

  const transformNum = (num: number) => {
    return num - (numMin - 1);
  };

  const info = {
    expr: {
      min: expressionMin,
      max: expressionMax,
    },
    num: {
      min: numMin,
      max: numMax,
    },
    numTransformed: {
      min: transformNum(numMin),
      max: transformNum(numMax),
    },
  };

  console.log("dims: ", plotWidth + "x" + plotHeight);
  console.table(info);

  // var tooltipSVG = d3
  //   .select("#dotplot_tooltip")
  //   .append("svg")

  // Scales
  const xScale = d3
    .scaleBand()
    .domain(groups)
    .range([0, plotWidth])
    .padding(0.2);

  const yScale = d3
    .scaleBand()
    .domain(genes)
    .range([0, plotHeight])
    .padding(0.2);

  const colorScale = d3
    .scaleSequential(d3.interpolateHclLong("purple", "orange"))
    .domain([0, expressionMax]); // Adjust value-to-color mapping

  const sizeScale = d3
    .scaleSqrt()
    .domain([0, transformNum(numMax)])
    .range([0, 12]); // Adjust max size for dots

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
    .style("position", "absolute")
    .style("opacity", 0)
    .style("zIndex", 10)
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

  // Three function that change the tooltip when user hover / move / leave a cell
  const mouseover = (event: MouseEvent) => {
    tooltip
      .style("opacity", 1);
    d3
      .select(this)
      .style("stroke", "black")
      .style("opacity", 1);
  };
  const mousemove = (event: MouseEvent, geneNum: number, geneExpr: number) => {
    
    // console.log(d3.pointer(event), event.pageX, event.pageY);
    // console.log(d);
    
    tooltip
      .html(`# of cells expressed: ${geneNum}<br>Expression: ${geneExpr}`)
      // .style("left", d3.pointer(event)[0] + "px")
      // .style("top", d3.pointer(event)[1] + "px");
      .style("left", event.pageX + 20 + "px")
      .style("top", event.pageY + "px");
      
  };
  const mouseleave = (event: MouseEvent) => {
    tooltip
      .style("opacity", 0);
    d3
      .select(this)
      .style("stroke", "none")
      .style("opacity", 0.8);
  };

  const xAxis = svgContext
    .append("g")
    .attr("id", "myaxes")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .call(d3.axisTop(xScale))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "start")
    .attr("dx", "-0.5em")
    .attr("dy", "-0.5em");

  const yAxis = svgContext
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .attr("dx", "1.0em")
    .attr("dy", "-1.0em")
    .style("text-anchor", "end");

  const plotGroup = svgContext
    .append("g")
    .attr("id", "plotgroup")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  genes.forEach((gene, geneIndex) => {
    groups.forEach((group, groupIndex) => {
      const groupMeanObj = props.plotData[groupIndex].mean_expr;
      const groupNumObj = props.plotData[groupIndex].num_expr;

      const groupObjkeys = Object.keys(groupMeanObj);

      const geneNum = groupNumObj[groupObjkeys[geneIndex]];
      const geneExpr = groupMeanObj[groupObjkeys[geneIndex]];

      plotGroup
        .append("circle")
        .attr("cx", xScale(group)! + xScale.bandwidth() / 2)
        .attr("cy", yScale(gene)! + yScale.bandwidth() / 2)
        .attr("r", sizeScale(transformNum(geneNum)))
        .attr("fill", colorScale(geneExpr))
        .attr("zIndex", 5)
        .on("mouseover", mouseover)
        .on("mousemove", (event: MouseEvent) => mousemove(event, geneNum, geneExpr))
        .on("mouseleave", mouseleave);
    });
  });

  return () => {
    svgContext.remove();
    tooltip.remove();
  };
};

export default DotPlotGenerator;
