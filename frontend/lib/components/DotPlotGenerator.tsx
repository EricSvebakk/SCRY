

import * as d3 from "d3";
import { DotplotOptions, geneDendrogramData, geneExpressionData } from "../types";
import { AppDispatch } from "../redux/stores/store";
import { setDotplotOptions } from "../redux/reducers/plotReducer";


type dotPlotGeneratorProps = {
  current: any;
  plotData: geneExpressionData[];
  dendrogramData: geneDendrogramData,
  nGenes: number, 
  dpOptions: DotplotOptions,
  dispatch: AppDispatch
};

const DotPlotGenerator = (props: dotPlotGeneratorProps) => {
  const containerRect = props.current.getBoundingClientRect();
  
  const width = containerRect.width;
  const height = containerRect.height;
  
  const margin = { top: 80, right: 40, bottom: 40, left: 40, yAxis: 25 };
  
  const dendroWidth = 40
  const dendroHeight = height - (margin.top + margin.bottom);
  
  const plotWidth = width - (dendroWidth + margin.left + margin.yAxis + margin.right);
  const plotHeight = height - (margin.top + margin.bottom);
  
  // =========================================================================
  
  const expressionValues = props.plotData.map((e) => e.mean_expr);

  const expressionMin = Math.min(...expressionValues, 0);
  const expressionMax = Math.max(...expressionValues);

  const fracValues = props.plotData.map((e) => e.frac_expr);
  const fracMin = Math.min(...fracValues, 0);
  const fracMax = Math.max(...fracValues);
  
  const genes = props.plotData.map((e) => e.gene);
  const cluster = props.plotData.map((e) => e.cluster);
  
  function isUnique(value: any, index: number, array: any[]) {
    return array.indexOf(value) === index;
  }
  
  const largest = Math.max(genes.filter(isUnique).length, cluster.filter(isUnique).length)
  const maxScale = width / (largest * 3.5)

  console.log("dims:  ", plotWidth + "x" + plotHeight);
  console.log("range: ", expressionMin, expressionMax)
  console.table("min(x,y) = " + largest);
  
  console.log("unique", genes.filter(isUnique).length)

  // =========================================================================
  
  // Scales
  const xScale = d3
    .scaleBand()
    .domain(genes)
    .range([0, plotWidth])
    .padding(0.2);
    
  const xBandwidth = xScale.step();
  const newPlotHeight = cluster.filter(isUnique).length * xBandwidth
  
  const yScale = d3
    .scaleBand()
    .domain(cluster)
    .range([0, plotHeight])
    .padding(0.2);

  let recordKey = props.dpOptions.coloring as keyof geneExpressionData;
  let colorScale = null;
  let recordsTransformed = null;
  let transform = (t: number) => (t);
  
  const isDefault = props.dpOptions.expressionIsDefault;
  let exprMin = props.dpOptions.expressionMin;
  let exprMax = props.dpOptions.expressionMax;
  
  switch (recordKey) {
    case "mean_expr":
      recordsTransformed = props.plotData.map((e) => e[recordKey] as number);
      
      exprMin = isDefault
        ? Math.min(...recordsTransformed)
        : exprMin;
      
      exprMax = isDefault
        ? Math.max(...recordsTransformed)
        : exprMax;
      
      colorScale = d3
        .scaleSequential(d3.interpolateReds)
        .domain([exprMin, exprMax])
      break;
      
    case "logfoldchange":
      recordsTransformed = props.plotData.map((e) => e[recordKey] as number);
      
      exprMin = isDefault
        ? Math.min(...recordsTransformed)
        : exprMin;
    
      exprMax = isDefault
        ? Math.max(...recordsTransformed)
        : exprMax;
      
      colorScale = d3
        .scaleDiverging((t) => d3.interpolateRdBu(1 - (0.1 + (0.8 *t))))
        .domain([exprMin, 0, exprMax])
      break;
      
    case "pvals_adj":
      transform = (t: number) => (-Math.log10(t));
      recordsTransformed = props.plotData.filter((e) => e.pvals_adj > 0).map((e) => transform(e[recordKey] as number));
      
      exprMin = isDefault
        ? 0
        : exprMin;
    
      exprMax = isDefault
        ? Math.max(...recordsTransformed)
        : exprMax;
      
      colorScale = d3
        .scaleSequential(d3.interpolateReds)
        .domain([exprMin, exprMax])
        .clamp(true);
      break;
      
    default:
      colorScale = d3.scaleSequential(d3.interpolateReds);
      break;
  }
  
  console.log(exprMin, exprMax, isDefault)
  
  if (props.dpOptions.expressionIsDefault) {
    props.dispatch(setDotplotOptions({
      ...props.dpOptions,
      expressionMinDefault: exprMin,
      expressionMaxDefault: exprMax,
    }))
  }
  
  let highest_expression: { [key: string]: number } = {}
  let highest_expression_pos: { [key: string]: number } = {}
  const highlight = props.dpOptions.highlight;
  
  if (highlight != "none") {    
    props.plotData.forEach((e, i) => {
      const cur_num = transform(e[recordKey] as number);
      
      if (cur_num == Infinity) {
        return;
      }
      
      if (!(e[highlight] in highest_expression)) {
        highest_expression[e[highlight]] = cur_num;
        highest_expression_pos[e[highlight]] = i;
      }
      
      if (cur_num > highest_expression[e[highlight]]) {
        highest_expression[e[highlight]] = cur_num;
        highest_expression_pos[e[highlight]] = i;
      }
    })
  }

  const sizeScale = d3
    .scaleSqrt()
    .domain([0, fracMax])
    .range([0, maxScale]); // Adjust max size for dots

  // =========================================================================
  
  const svgContext = d3
    .select(props.current)
    .append("svg")
    .attr("id", "svgContext")
    .attr("width", width)
    .attr("height", height);
  
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

  const dendroRoot = d3.hierarchy(props.dendrogramData as any);
  const clusterLayout = d3.cluster().size([dendroHeight, dendroWidth])
  
  clusterLayout(dendroRoot);
  
  dendroRoot.each((d) => {
    if (!d.children && d.data.name) {
      d.x = yScale(d.data.name + "")! + (yScale.bandwidth() / 2)
    }
  });
  
  function realignInternalNodes(node: d3.HierarchyNode<any>) {
    if (node.children) {
      node.children.forEach(realignInternalNodes);
      node.x = d3.mean(node.children.map(d => d.x))!;
    }
  }
  
  realignInternalNodes(dendroRoot)
  
  function elbow(d: any) {
    return "M" + d.source.y + "," + d.source.x + "V" + d.target.x + "H" + d.target.y;
  }
  
  dendroContext
    .selectAll(".link")
    .data(dendroRoot.links())
    .join("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", "1px")
    .attr("d", elbow)
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
  dendroContext
    .selectAll(".node")
    .data(dendroRoot.descendants().filter((d) => !!d.children))
    .join("text")
    .attr("class", "node")
    .attr("text-anchor", "start")
    .text((d) => d.data.name)
    .attr("transform", d => `translate(${d.y},${d.x})`);
    
  // =========================================================================
  
  const xAxis = svgContext
    .append("g")
    .attr("id", "myaxes")
    .attr("transform", `translate(${margin.left + margin.yAxis + dendroWidth}, ${margin.top})`)
    .call(d3.axisTop(xScale))
    .selectAll("text")
    .attr("transform", "translate(9,0) rotate(-45)")
    .style("text-anchor", "start")

  const yAxis = svgContext
    .append("g")
    .attr("transform", `translate(${margin.left + margin.yAxis + dendroWidth}, ${margin.top})`)
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    // .attr("transform", "translate(-2,-8) rotate(-45)")
    .style("text-anchor", "end")
  
  const plotGroup = svgContext
    .append("g")
    .attr("id", "plotgroup")
    .attr("transform", `translate(${margin.left + margin.yAxis + dendroWidth}, ${margin.top})`);

  props.plotData.forEach((record: geneExpressionData, i: number) => {
    
    const color = transform(record[recordKey] as number);
    
    // Filters out p-vals == 0
    if (color == Infinity) {
      return;
    }
    
    const circleId = `gene_dot_id_${i}`;
    
    const gene_index = record.gene;
    
    const isHighlighted = highlight != "none" && highest_expression_pos[record[highlight]] == i;
    const highlightColor = highlight == "cluster" ? "green" : "purple";
    
    plotGroup
      .append("circle")
      .attr("id", circleId)
      .attr("cx", xScale(gene_index)! + xScale.bandwidth() / 2)
      .attr("cy", yScale(record.cluster)! + yScale.bandwidth() / 2)
      .attr("r", sizeScale(record.frac_expr))
      .attr("fill", colorScale(color))
      .style("stroke", isHighlighted ? highlightColor: "none")
      .style("stroke-width", 2)
      
    plotGroup
      .append("circle")
      .attr("cx", xScale(gene_index)! + xScale.bandwidth() / 2)
      .attr("cy", yScale(record.cluster)! + yScale.bandwidth() / 2)
      .attr("r", maxScale)
      .attr("fill", "transparent")
      .style("pointer-events", "all")
      .on("mouseover", function (this: any, event: MouseEvent) {
        tooltip
          .style("opacity", 1)
          .style("display", "block")
        d3
          .select(`#${circleId}`)
          .style("stroke", "black")
          .style("opacity", 1);
      })
      .on("mousemove", function (this:any, event: MouseEvent) {
        
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
        
        tooltip
          .style("left", `${left}px`)
          .style("top", `${top}px`)
          .html(`
            <table>
              <tr>
                <td>Cluster label</td>
                <td>${record.cluster}</td>
              </tr>
              <tr>
                <td>Gene label</td>
                <td>${record.gene} (${genes.indexOf(gene_index)})</td>
              </tr>
              <tr>
                <td>% of expressed cells</td>
                <td>${record.frac_expr.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Gene Expression</td>
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
                <td>${(record.pvals_adj !== 0 ? -Math.log10(record.pvals_adj) : 0).toFixed(2)}</td>
              </tr>
            </table>
          `);
      })
      .on("mouseleave", function (this: any, event: MouseEvent) {
        tooltip
          .style("opacity", 0);
        d3
          .select(`#${circleId}`)
          .style("stroke", isHighlighted ? highlightColor: "none")
      });
    
  })

  return () => {
    svgContext.remove();
    tooltip.remove();
  };
};

export default DotPlotGenerator;
