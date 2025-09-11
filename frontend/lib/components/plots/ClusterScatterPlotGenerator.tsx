

import * as d3 from "d3";
import { AnndataIndices, PlotConfigurationData, PlotConfigurationFields } from "../../types";
import { setTrigger } from "../../redux/reducers/plotReducer";
import { sequentialScaleColorOptions } from "@/lib/design";

export const my_colors = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#bcbd22",
  "#17becf",
];

const ClusterScatterPlotGenerator = (props: {
  groupRefs: HTMLCanvasElement[];
  config: PlotConfigurationFields<PlotConfigurationData["cluster"]>;
  indices: AnndataIndices | undefined;
  coordinates: number[][];
  selectedClusters: string[];
  dispatch: Function;
  imageTrigger: any | null;
}): () => void => {

  if (props.groupRefs.length == 0) {
    return () => {};
  }

  const containerRect = props.groupRefs[0].getBoundingClientRect();

  const height = containerRect.height;
  const width = containerRect.width;

  const canvasWidth = width;
  const canvasHeight = height;

  const paddingRatio = 24;
  const paddingWidth = canvasWidth / paddingRatio;
  const paddingHeight = canvasHeight / paddingRatio;
  const paddingRight = 100;

  let coordinates = props.coordinates;
  const pointSize = 3.5 - 0.5 * Math.log10(coordinates.length);

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(coordinates, (d: number[]) => d[0]) as [number, number])
    .range([paddingWidth, canvasWidth - paddingWidth]);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(coordinates, (d: number[]) => d[1]) as [number, number])
    .range([height - paddingHeight, paddingHeight]);

  let labels = props.indices
    ? (props.indices.categories as string[])
    : ["none"];
  let labelMap = props.indices
    ? props.indices.codes
    : props.coordinates.map((e) => 0);

  let colorScheme = props.indices && props.config.palette ? sequentialScaleColorOptions[props.config.palette] : ["black"];

  let labelSizeMap: { [key: string]: number } = {};

  props.indices?.categories.forEach((e: string | number) => {
    labelSizeMap[e] = 0;
  });

  props.indices?.codes.forEach((f: number) => {
    const labelIndex = props.indices?.categories[f]!;
    labelSizeMap[labelIndex]++;
  });

  const colorScale = d3
    .scaleOrdinal<string>()
    .domain(labels)
    .range(colorScheme);

  labels.forEach((label, labelIndex) => {
    const someContext: CanvasRenderingContext2D =
      props.groupRefs[labelIndex].getContext("2d")!;

    someContext.canvas.width = width;
    someContext.canvas.height = height;
    someContext.canvas.style.width = (width * 100).toString();
    someContext.canvas.style.height = (height * 100).toString();

    labelMap.map((labelPosition, positionIndex) => {
      if (labelPosition !== labelIndex) return;

      const point = coordinates[positionIndex];

      someContext.beginPath();
      someContext.arc(
        xScale(point[0]),
        yScale(point[1]),
        pointSize,
        0,
        2 * Math.PI
      );

      someContext.fillStyle =
        labels.length > 0
          ? (colorScale as d3.ScaleOrdinal<string, string>)(
              labels[labelMap[positionIndex]]
            )
          : "black";

      someContext.fill();
      someContext.closePath();
    });
    
  });

  if (!!props.imageTrigger) {
    const scale = props.config.scale ?? 1;

    const plotWidth = 1000 * scale;
    const legendWidth = props.selectedClusters.length !== 0 ? (500 * scale) : 0;
    const imageWidth = (plotWidth + legendWidth);
    const imageHeight = plotWidth;
    const imagePadding = plotWidth / 24;
    
    const fontSize = plotWidth / 50;
    const legendSquareSize = plotWidth / 40;
    // const legendPadding = canvasWidth / 50;

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = imageWidth;
    finalCanvas.height = imageHeight;

    const finalCtx = finalCanvas.getContext("2d")!;
    finalCtx.imageSmoothingEnabled = true;

    finalCtx.fillStyle = props.config.background ? props.config.background : "white";
    finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    const scaledxScale = d3
      .scaleLinear()
      .domain(d3.extent(coordinates, (d: number[]) => d[0]) as [number, number])
      .range([imagePadding, imageWidth - (legendWidth + imagePadding)]);

    const scaledyScale = d3
      .scaleLinear()
      .domain(d3.extent(coordinates, (d: number[]) => d[1]) as [number, number])
      .range([imageHeight - imagePadding, imagePadding]);

    // const legendScale = d3
    //   .scaleBand(labels, [imagePadding, imageHeight - imagePadding])
      
    // console.log(labels, props.selectedClusters)

    coordinates.forEach((e, i) => {
      finalCtx.beginPath();
      finalCtx.arc(
        scaledxScale(e[0]),
        scaledyScale(e[1]),
        pointSize * scale,
        0,
        2 * Math.PI
      );

      finalCtx.fillStyle = "#888";
      finalCtx.fill();
      finalCtx.closePath();
    });
    
    let step_index = 0;

    labels.forEach((label, labelIndex) => {
      if (!props.selectedClusters.includes(label)) {
        return;
      }

      labelMap.map((labelPosition, positionIndex) => {
        if (labelPosition !== labelIndex) return;

        const point = coordinates[positionIndex];

        finalCtx.beginPath();
        finalCtx.arc(
          scaledxScale(point[0]),
          scaledyScale(point[1]),
          pointSize * scale,
          0,
          2 * Math.PI
        );
        finalCtx.fillStyle =
          labels.length > 0
            ? (colorScale as d3.ScaleOrdinal<string, string>)(
                labels[labelMap[positionIndex]]
              )
            : "black";
        finalCtx.fill();
        finalCtx.closePath();
      });
      
      const legendX = plotWidth + imagePadding;
      const step = legendSquareSize + legendSquareSize / 2;
      
      finalCtx.fillRect(
        legendX,
        imagePadding + (step_index * step) - legendSquareSize / 2,
        legendSquareSize,
        legendSquareSize
      );
      
      finalCtx.textBaseline = "middle";
      finalCtx.font = `${fontSize}px serif`;
      finalCtx.fillText(
        label,
        legendX + legendSquareSize + fontSize / 2,
        imagePadding + (step_index * step)
      );
            
      step_index += 1;
    });

    // Export the final canvas as an image
    const a = document.createElement("a");
    a.href = finalCanvas.toDataURL("image/png");
    a.download = `${props.imageTrigger}.png`;
    a.click();

    props.dispatch(setTrigger({ type: "saveScatterPlotImage", value: null }));
  }

  return () => {
    // svgContext.remove();
  };
};

export default ClusterScatterPlotGenerator;
