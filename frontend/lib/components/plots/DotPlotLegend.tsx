
import * as d3 from "d3";
import { geneExpressionData } from "@/lib/types";

type legendConfig = {
  parentElem: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  x: number;
  y: number;
  legendColWidth: number;
  colorBarHeight: number;
  colorBarWidth: number;
  colorScale: d3.ScaleSequential<string> | d3.ScaleDiverging<string>;
  exprMin: number;
  exprMax: number;
  sizeScale: d3.ScalePower<number, number, never>;
  fracMax: number;
  recordKey: keyof geneExpressionData;
  plotHeight: number;
  bottomPad: number;
};

function drawLegendExpression(
  legend: d3.Selection<SVGGElement, unknown, null, undefined>,
  config: legendConfig
) {
  
  const {
    colorScale,
    exprMin,
    exprMax,
    colorBarHeight,
    colorBarWidth,
    recordKey,
    legendColWidth,
  } = config;
  
  function colorTitleFor(key: keyof geneExpressionData) {
    switch (key) {
      case "mean_expr":
        return "Average expression";
      case "logfoldchange":
        return "Log fold change";
      case "pvals_adj":
        return "-log10(p)";
      default:
        return String(key);
    }
  }
  
  legend.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "-0.35em")
    .attr("font-size", 12)
    .attr("font-family", "sans-serif")
    .attr("font-weight", 600)
    .text(colorTitleFor(recordKey));

  const gradientX = 6;
  const barX = 0;
  const id = "legendExpressionGradient"
  const defs = legend.append("defs");
  
  const gradient = defs
    .append("linearGradient")
    .attr("id", id)
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "100%")
    .attr("y2", "0%");

  const samplingSteps = 24;
  for (let i = 0; i <= samplingSteps; i++) {
    const n = i / samplingSteps;
    const nNormal = exprMin + n * (exprMax - exprMin);
    gradient
      .append("stop")
      .attr("offset", `${n * 100}%`)
      .attr("stop-color", (colorScale as any)(nNormal));
  }

  legend.append("rect")
    .attr("x", barX)
    .attr("y", gradientX)
    .attr("width", colorBarWidth)
    .attr("height", colorBarHeight)
    .attr("rx", 2)
    .attr("fill", `url(#${id})`);

  const scaleY = d3
    .scaleLinear()
    .domain([exprMin, exprMax])
    .range([gradientX + colorBarHeight, gradientX]);

  const axis = d3
    .axisRight(scaleY)
    .ticks(5)
    .tickSize(4)
    .tickFormat((d: any) => recordKey === "pvals_adj" ? d3.format("~g")(d) : d3.format("~g")(d));

  const axisX = barX + colorBarWidth + 6;
  const axisG = legend
    .append("g")
    .attr("transform", `translate(${axisX},0)`)
    .call(axis as any);

  axisG
    .selectAll("text")
    .attr("font-size", 11)
    .attr("font-family", "sans-serif");
    
  axisG
    .selectAll("line,path")
    .attr("stroke", "#555");

  const totalWidth = axisX - barX + 24;
  const widthShift = Math.max(0, (legendColWidth - totalWidth) / 2);
  
  legend.attr("transform", legend.attr("transform") + ` translate(${widthShift},0)`);
}

function drawLegendFraction(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  config: legendConfig
) {
  
  const {
    sizeScale,
    fracMax,
    legendColWidth
  } = config
  
  g.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "-0.35em")
    .attr("font-size", 12)
    .attr("font-family", "sans-serif")
    .attr("font-weight", 600)
    .text("Fraction expressing");

  const sizeSteps = [0, fracMax * 0.5, fracMax];
  const rowHeight = 22;
  const marginTop = 6;
  const marginLeft = 8;

  const rows = g
    .selectAll(".size-row")
    .data(sizeSteps)
    .join("g")
    .attr("class", "size-row")
    .attr("transform", (_, i) => `translate(0, ${marginTop + i * rowHeight})`);

  rows
    .append("circle")
    .attr("cx", (d) => sizeScale(fracMax))
    .attr("cy", 0)
    .attr("r", (d) => Math.max(0.5, sizeScale(d)))
    .attr("fill", "none")
    .attr("stroke", "#333");

  rows
    .append("text")
    .attr("x", (d) => sizeScale(fracMax) + Math.max(sizeScale(d), 0.5) + marginLeft)
    .attr("y", 0)
    .attr("dy", "0.35em")
    .attr("font-size", 11)
    .attr("font-family", "sans-serif")
    .text((d) => d3.format(".0%")(d));

  const blockMaxX = sizeScale(fracMax) + sizeScale(fracMax) + 36;
  const widthShift = Math.max(0, (legendColWidth - blockMaxX) / 2);
  
  g.attr("transform", g.attr("transform") + ` translate(${widthShift},0)`);
}

export function renderLegend(props: legendConfig) {

  const legendGap = 48;
  
  const root = props.parentElem
    .append("g")
    .attr("id", "dotplot-legend")
    .attr("transform", `translate(${props.x}, ${props.y})`);
  
  const legendExpression = root
    .append("g")
    .attr("transform", `translate(0, 0)`);
  
  const legendFraction = root
    .append("g")
    .attr("transform", `translate(0, ${props.colorBarHeight + legendGap})`);
      
  drawLegendExpression(legendExpression, props);
  drawLegendFraction(legendFraction, props);

  const legendHeight = (root.node() as SVGGElement).getBBox().height;
  const finalBottom = props.y + props.plotHeight - props.bottomPad;
  const currentBottom = props.y + legendHeight;
  const dy = finalBottom - currentBottom;
  const finalY = props.y + Math.max(dy, 0);

  root.attr("transform", `translate(${props.x}, ${finalY})`);
}

