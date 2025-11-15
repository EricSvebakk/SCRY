
import * as d3 from "d3";
import {
  GDEFields,
  geneExpressionData,
  PlotConfigurationData,
  PlotConfigurationFields,
} from "../../types";
import { renderLegend } from "./DotPlotLegend";

type dotPlotGeneratorProps = {
  current: any;
  gde: GDEFields;
  config: PlotConfigurationFields<PlotConfigurationData["expression"]>;
};

const DotPlotSeparateLegend = (props: dotPlotGeneratorProps) => {
  const containerRect = props.current.getBoundingClientRect();

  const { config, gde } = props;
  const { expression, dendrogram } = gde;

  if (!expression || !dendrogram) {
    return;
  }

  const filteredExpression = expression;

  const width = containerRect.width;
  const height = containerRect.height;
  
  const legendWidth = getTextWidth(
    ["Average Expression", "Fraction Expression"],
    10
  );

  const yAxisLabelWidth = getTextWidth(
    expression.map((e) => e.cluster),
    10
  );
  
  const margin = {
    top: 40,
    right: 40,
    bottom: 40,
    left: 40,
  };
  
  const legendGap = 0;
  const colorBarHeight = 140;
  const colorBarWidth = 12;
  
  const plotWidth = width - (margin.left + margin.right);
  const plotHeight = height - (margin.top + margin.bottom);

    
  const maxScale = 5;
  const fracMax = Math.max(...filteredExpression.map((e) => e.frac_expr));
  const sizeScale = d3
    .scaleSqrt()
    .domain([0, fracMax])
    .range([0, maxScale]);

  let layerKey = config.layer as keyof geneExpressionData;
  let colorScale = null;
  let recordsTransformed = null;
  let transform = (t: number) => t;

  const isDefault = config.expressionIsDefault;
  let exprMin = config.expressionMin;
  let exprMax = config.expressionMax;

  if (layerKey === "pvals_adj") {
    transform = (t: number) => -Math.log10(t);
    
    recordsTransformed = filteredExpression
      .filter((e) => e.pvals_adj > 0)
      .map((record) => transform(record[layerKey] as number));
  }
  
  else {
    recordsTransformed = filteredExpression
      .map((record) => transform(record[layerKey] as number));
  }

  exprMin = isDefault ? Math.min(...recordsTransformed, 0) : exprMin;
  exprMax = isDefault ? Math.max(...recordsTransformed) : exprMax;

  switch (layerKey) {
    case "mean_expr":
      colorScale = d3
        .scaleSequential(d3.interpolateReds)
        .domain([exprMin, exprMax]);
      break;
    case "logfoldchange":
      colorScale = d3
        .scaleDiverging((t) => d3.interpolateRdBu(1 - t))
        .domain([exprMin, 0, exprMax]);
      break;
    case "pvals_adj":
      colorScale = d3
        .scaleSequential(d3.interpolateReds)
        .domain([exprMin, exprMax])
        .clamp(true);
      break;
    default:
      colorScale = d3.scaleSequential(d3.interpolateReds);
      break;
  }

  let expressionHighest: { [key: string]: number } = {};
  let expressionHighestIndex: { [key: string]: number } = {};
  const highlight = config.highlight;

  if (highlight !== "none") {
    filteredExpression.forEach((e, index) => {
      
      const current = transform(e[layerKey] as number);

      if (current == Infinity) {
        return;
      }

      if (!(e[highlight] in expressionHighest)) {
        expressionHighest[e[highlight]] = current;
        expressionHighestIndex[e[highlight]] = index;
      }

      if (highlight === "rgg_order" && e.rgg_order == 0) {
        expressionHighest[e.cluster] = 0;
        expressionHighestIndex[e.cluster] = index;
      } else if (
        highlight !== "rgg_order" &&
        current > expressionHighest[e[highlight]]
      ) {
        expressionHighest[e[highlight]] = current;
        expressionHighestIndex[e[highlight]] = index;
      }
    });
  }

  // =========================================================================

  const svgContext = d3
    .select(props.current)
    .append("svg")
    .attr("id", "svgContext")
    .attr("width", width)
    .attr("height", height);

  renderLegend({
    parentElem: svgContext as any,
    x: margin.left,
    y: margin.top,
    legendColWidth: legendWidth,
    colorBarHeight,
    colorBarWidth,
    colorScale: colorScale as any,
    exprMin,
    exprMax,
    sizeScale,
    fracMax,
    recordKey: layerKey as keyof geneExpressionData,
    plotHeight,
    bottomPad: 0,
  });

  return () => {
    svgContext.remove();
  };
};

function getTextWidth(labels: string[], fontSize: number) {
  
  // create svg, not svg html-element
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  document.body.appendChild(svg);
  
  // create svg text, not p html-element
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("font-size", `${fontSize}`);
  text.setAttribute("font-family", "sans-serif");
  svg.appendChild(text);

  let maxWidth = 0;

  for (const label of labels) {
    text.textContent = label;
    const width = text.getBBox().width;
    if (width > maxWidth) maxWidth = width;
  }

  // clean up svg afterwards
  svg.remove();

  return maxWidth;
}

export default DotPlotSeparateLegend;
