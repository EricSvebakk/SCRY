

import * as d3 from "d3";
import { AnndataIndices } from "../types";
import { setTrigger } from "../redux/reducers/plotReducer";

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

const ScatterPlotGenerator = (props: {
  svgCurrent: HTMLCanvasElement;
  groupRefs: HTMLCanvasElement[];
  indices: AnndataIndices | undefined;
  coordinates: number[][];
  dispatch: Function;
  imageTrigger: any | null;
}) => {
  const containerRect = props.svgCurrent.getBoundingClientRect();
  const height = containerRect.height;
  const width = containerRect.width;

  const canvasWidth = width;
  const canvasHeight = height;

  const paddingRatio = 24;
  const paddingWidth = canvasWidth / paddingRatio;
  const paddingHeight = canvasHeight / paddingRatio;

  let labels = props.indices ? props.indices.categories : ["none"];
  let labelMap = props.indices
    ? props.indices.codes
    : props.coordinates.map((e) => 0);
  let colorScheme = props.indices ? my_colors : ["black"];
  let coordinates = props.coordinates;

  let labelSizeMap: { [key: string]: number } = {};

  props.indices?.categories.forEach((e: string) => {
    labelSizeMap[e] = 0;
  });

  props.indices?.codes.forEach((f: number) => {
    const labelIndex = props.indices?.categories[f]!;
    labelSizeMap[labelIndex]++;
  });

  // props.dispatch(setLabelSize(labelSizeMap))

  const pointSize = 3.5 - 0.5 * Math.log10(coordinates.length);

  const colorScale = d3
    .scaleOrdinal<string>()
    .domain(labels)
    .range(colorScheme);

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(coordinates, (d: number[]) => d[0]) as [number, number])
    .range([paddingWidth, canvasWidth - paddingWidth]);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(coordinates, (d: number[]) => d[1]) as [number, number])
    .range([height - paddingHeight, paddingHeight]);

  const svgContext = d3
    .select(props.svgCurrent)
    .append("svg")
    .attr("id", "herewego")
    .attr("width", width)
    .attr("height", height);

  labels.forEach((label, labelIndex) => {
    const someContext: CanvasRenderingContext2D =
      props.groupRefs[labelIndex].getContext("2d")!;

    someContext.canvas.width = width;
    someContext.canvas.height = height;
    someContext.canvas.style.width = (width * 30).toString();
    someContext.canvas.style.height = (height * 30).toString();

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
          ? colorScale(labels[labelMap[positionIndex]])
          : "black";
      someContext.fill();
      someContext.closePath();
      
    });
  });

  if (!!props.imageTrigger) {
    const scale = 3;

    // const imageWidth = 1584 * scale;
    // const imageHeight = 396 * scale;
    const imageWidth = width * scale;
    const imageHeight = height * scale;

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = imageWidth;
    finalCanvas.height = imageHeight;

    const finalCtx = finalCanvas.getContext("2d")!;
    finalCtx.imageSmoothingEnabled = true;

    finalCtx.fillStyle = "white";
    finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    const scaledxScale = d3
      .scaleLinear()
      .domain(d3.extent(coordinates, (d: number[]) => d[0]) as [number, number])
      .range([paddingWidth, imageWidth - paddingWidth]);

    const scaledyScale = d3
      .scaleLinear()
      .domain(d3.extent(coordinates, (d: number[]) => d[1]) as [number, number])
      .range([imageHeight - paddingHeight, paddingHeight]);

    labels.forEach((label, labelIndex) => {
      labelMap.map((labelPosition, positionIndex) => {
        if (labelPosition !== labelIndex) return;

        const point = coordinates[positionIndex];

        finalCtx.beginPath();
        finalCtx.arc(
          scaledxScale(point[0]),
          scaledyScale(point[1]),
          pointSize * 2,
          0,
          2 * Math.PI
        );
        finalCtx.fillStyle =
          labels.length > 0
            ? colorScale(labels[labelMap[positionIndex]])
            : "black";
        finalCtx.fill();
        finalCtx.closePath();
      });
    });

    // Export the final canvas as an image
    const a = document.createElement("a");
    a.href = finalCanvas.toDataURL("image/png");
    a.download = `${props.imageTrigger}.png`;
    a.click();

    props.dispatch(setTrigger({ type: "saveScatterPlotImage", value: null }));
  }

  return () => {
    svgContext.remove();
  };
};

export default ScatterPlotGenerator;
