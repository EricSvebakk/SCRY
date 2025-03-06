

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

  const margin = { top: 80, right: 20, bottom: 20, left: 80 };
  const plotWidth = width - (margin.left + margin.right);
  const plotHeight = height - (margin.top + margin.bottom);

  const expressionValues = props.plotData.flatMap(d => Object.values(d.mean_expr));
  const expressionMin = Math.min(...expressionValues);
  const expressionMax = Math.max(...expressionValues);
  
  const numValues = props.plotData.flatMap(d => Object.values(d.num_expr));
  const numMin = Math.min(...numValues);
  const numMax = Math.max(...numValues);

  const genes = props.plotData.flatMap((d: obsExpressionData) => Object.keys(d.mean_expr));
  const groups = props.plotData.map((e: obsExpressionData) => e.label);

  const transformNum = (num: number) => {
    return num - (numMin - 1);
  };
  
  const info = {
    expr: {
      min: expressionMin,
      max: expressionMax
    },
    num: {
      min: numMin,
      max: numMax
    },
    numTransformed: {
      min: transformNum(numMin),
      max: transformNum(numMax)
    },
  };
  
  console.log("dims: ", plotWidth + "x" + plotHeight);
  console.table(info);

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
        .attr("zIndex", 10);
    });
  });

  return () => {
    svgContext.remove();
  };
};

export default DotPlotGenerator;
