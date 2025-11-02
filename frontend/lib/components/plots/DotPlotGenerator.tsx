
import * as d3 from "d3";
import {
  GDEFields,
  geneExpressionData,
  PlotConfigurationData,
  PlotConfigurationFields,
} from "../../types";
import { AppDispatch } from "../../redux/stores/store";
import { setPlotConfigField } from "../../redux/reducers/plotReducer";
import { renderLegend } from "./DotPlotLegend";

type dotPlotGeneratorProps = {
  current: any;
  gde: GDEFields;
  config: PlotConfigurationFields<PlotConfigurationData["expression"]>;
  dispatch: AppDispatch;
};

const DotPlotGenerator = (props: dotPlotGeneratorProps) => {
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
    top: 80,
    right: legendWidth + 90,
    bottom: 40,
    left: yAxisLabelWidth + 50,
  };
  
  const legendGap = 0;
  const colorBarHeight = 140;
  const colorBarWidth = 12;
  
  const plotWidth = width - (margin.left + margin.right);
  const plotHeight = height - (margin.top + margin.bottom);

  const clusters = filteredExpression
    .filter((e) => e.rgg_order === 0)
    .toSorted((a, b) => {
      switch (config.sortClustersBy) {
        case "alphabetical":
          return a.cluster.localeCompare(b.cluster, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        case "dendrogram":
          return a.dendro_order - b.dendro_order;
      }
    })
    .map((e) => e.cluster);

  const genes = filteredExpression
    .toSorted((a, b) => {
      switch (config.sortGenesBy) {
        case "alphabetical":
          return a.gene.localeCompare(b.gene, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        case "mean":
          return b.mean_expr - a.mean_expr;
        case "fraction":
          return b.frac_expr - a.frac_expr;
        case "rgg_order":
          return 0;
      }
    })
    .map((e) => e.gene);
  
  const xScale = d3
    .scaleBand()
    .domain(genes)
    .range([0, plotWidth])
    .padding(0.2);
    
  const yScale = d3
    .scaleBand()
    .domain(clusters)
    .range([0, plotHeight])
    .padding(0.2);
    
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

  if (isDefault) {
    props.dispatch(
      setPlotConfigField({
        plot: "expression",
        config: {
          ...config,
          expressionMinDefault: exprMin,
          expressionMaxDefault: exprMax,
        },
      })
    );
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
    x: margin.left + plotWidth + legendGap,
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

  const dendroContext = svgContext
    .append("svg")
    .attr("id", "dendroContext")
    .attr("width", width)
    .attr("height", height);

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("z-index", 20)
    .style("position", "absolute")
    .style("opacity", 0)
    .style("display", "none")
    .style("overflow", "hidden")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

  // =========================================================================

  // const dendroRoot = d3.hierarchy(dendrogram as any);
  // const clusterLayout = d3.cluster().size([dendroHeight, dendroWidth]);

  // clusterLayout(dendroRoot);

  // dendroRoot.each((d) => {
  //   if (!d.children && d.data.name) {
  //     d.x = yScale(d.data.name + "")! + yScale.bandwidth() / 2;
  //   }
  // });

  // function realignInternalNodes(node: d3.HierarchyNode<any>) {
  //   if (node.children) {
  //     node.children.forEach(realignInternalNodes);
  //     node.x = d3.mean(node.children.map((d) => d.x))!;
  //   }
  // }

  // realignInternalNodes(dendroRoot);

  // function elbow(d: any) {
  //   return (
  //     "M" + d.source.y + "," + d.source.x + "V" + d.target.x + "H" + d.target.y
  //   );
  // }

  // dendroContext
  //   .selectAll(".link")
  //   .data(dendroRoot.links())
  //   .join("path")
  //   .attr("class", "link")
  //   .attr("fill", "none")
  //   .attr("stroke", "black")
  //   .attr("stroke-width", "1px")
  //   .attr("d", elbow)
  //   .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // dendroContext
  //   .selectAll(".node")
  //   .data(dendroRoot.descendants().filter((d) => !!d.children))
  //   .join("text")
  //   .attr("class", "node")
  //   .attr("text-anchor", "start")
  //   .text((d) => d.data.name)
  //   .attr("transform", d => `translate(${d.y},${d.x})`);

  // =========================================================================

  const xAxis = svgContext
    .append("g")
    .attr("id", "myaxes")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .call(d3.axisTop(xScale))
    .selectAll("text")
    .attr("transform", "translate(9,0) rotate(-45)")
    .style("user-select", "none")
    .style("text-anchor", "start")
    .style("border", "1px solid red");

  const yAxis = svgContext
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .style("user-select", "none")
    .style("text-anchor", "end")
    .style("border", "1px solid red");

  const plotGroup = svgContext
    .append("g")
    .attr("id", "plotgroup")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .style("border", "1px solid red");

  filteredExpression.forEach((record: geneExpressionData, i: number) => {
    const color = transform(record[layerKey] as number);

    // Filters out p-vals == 0
    if (color == Infinity) {
      return;
    }

    const circleId = `gene_dot_id_${i}`;

    const gene_index = record.gene;

    const isHighlighted =
      (highlight === "rgg_order" &&
        expressionHighestIndex[record.cluster] === i) ||
      (highlight !== "none" &&
        highlight !== "rgg_order" &&
        expressionHighestIndex[record[highlight]] == i);

    const highlightColor = "green";

    plotGroup
      .append("circle")
      .attr("id", circleId)
      .attr("cx", xScale(gene_index)! + xScale.bandwidth() / 2)
      .attr("cy", yScale(record.cluster)! + yScale.bandwidth() / 2)
      .attr("r", sizeScale(record.frac_expr))
      .attr("fill", colorScale(color))
      .style("stroke", isHighlighted ? highlightColor : "none")
      .style("stroke-width", 2);

    plotGroup
      .append("circle")
      .attr("cx", xScale(gene_index)! + xScale.bandwidth() / 2)
      .attr("cy", yScale(record.cluster)! + yScale.bandwidth() / 2)
      .attr("r", maxScale)
      .attr("fill", "transparent")
      .style("pointer-events", "all")
      .classed("cluster_" + record.cluster, true)
      .classed("some_shit", true)
      .on("mouseover", function (this: any, event: MouseEvent) {
        tooltip
          .style("pointer-events", "auto")
          .style("opacity", 1)
          .style("display", "block");
        d3.select(`#${circleId}`).style("stroke", "black").style("opacity", 1);

        // plotGroup
        //   .selectAll(".cluster_" + record.cluster)
        //   .style("stroke", "orange")
        //   .style("stroke-width", 3);

        // plotGroup
        //   .selectAll(".some_shit")
        //   .style("stroke", "orange")
        //   .style("stroke-width", 3)
        //   .classed("highlight-rank1", true);

        // plotGroup
        //   // .selectAll("circle")
        //     .selectAll(".some_shit")
        //   .filter(function (d, j: any) {
        //     const other = expression[j];
        //     // return other?.gene === record.gene && other?.rgg_order == 0;
        //     // return  other?.rgg_order == record.rgg_order;
        //     return other?.rgg_order == 0;
        //   })
        //   .style("stroke", "orange")
        //   .style("stroke-width", 3)
        //   .classed("highlight-rank1", true);
      })
      .on("mousemove", function (this: any, event: MouseEvent) {
        const bbox = (tooltip.node() as HTMLElement).getBoundingClientRect();
        const tooltipWidth = bbox.width;
        const tooltipHeight = bbox.height;

        const offsetX = 10;
        const offsetY = 10;

        let left = event.pageX + offsetX;
        let top = event.pageY + offsetY;

        // Prevent tooltip from overflowing right edge
        if (left + tooltipWidth > window.innerWidth) {
          left = event.pageX - tooltipWidth - offsetX;
        }

        // Prevent tooltip from overflowing bottom edge
        if (top + tooltipHeight > window.innerHeight) {
          top = event.pageY - tooltipHeight - offsetY;
        }

        tooltip.style("left", `${left}px`).style("top", `${top}px`).html(`
            <table>
              <tr>
                <td style="width:200px;">Cluster label</td>
                <td>${record.cluster}</td>
              </tr>
              <tr>
                <td>Gene label</td>
                <td>${record.gene}</td>
              </tr>
              <tr>
                <td>Gene rank in cluster</td>
                <td>#${record.rgg_order + 1}</td>
              </tr>
              <tr>
                <td>% of cells expressing gene</td>
                <td>${(record.frac_expr * 100).toFixed(2)}%</td>
              </tr>
              <tr>
                <td>Average gene expression</td>
                <td>${record.mean_expr.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Log fold change</td>
                <td>${record.logfoldchange.toFixed(2)}</td>
              </tr>
              <tr>
                <td>P-value</td>
                <td>${record.pvals_adj.toExponential(2)}</td>
              </tr>
              <tr>
                <td>-log10(P)</td>
                <td>${(record.pvals_adj !== 0
                  ? -Math.log10(record.pvals_adj)
                  : 0
                ).toFixed(2)}</td>
              </tr>
            </table>
          `);
      })
      .on("mouseleave", function (this: any, event: MouseEvent) {
        tooltip.style("pointer-events", "none").style("opacity", 0);

        d3.select(`#${circleId}`).style(
          "stroke",
          isHighlighted ? highlightColor : "none"
        );

        // plotGroup
        //   .selectAll(".cluster_" + record.cluster)
        //   .style("stroke", "none")
        //   .style("stroke-width", 2)

        // plotGroup
        //   .selectAll(".some_shit")
        //   .style("stroke", "none")
        //   .style("stroke-width", 2)

        // Remove highlight from all #1 rank circles
        // plotGroup
        //   .selectAll(".highlight-rank1")
        //   .style("stroke", "none")
        //   .style("stroke-width", 2)
        // .classed("highlight-rank1", false);
      });
  });

  return () => {
    svgContext.remove();
    tooltip.remove();
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

export default DotPlotGenerator;
