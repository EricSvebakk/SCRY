

import * as d3 from "d3";
import { AnndataIndices } from "../../types";
import { setTrigger } from "../../redux/reducers/plotReducer";

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

const FeatureScatterPlotGenerator = (props: {
  svgCurrent: HTMLCanvasElement;
  groupRefs: HTMLCanvasElement[];
  indices: AnndataIndices | undefined;
  coordinates: number[][];
  selectedClusters: string[];
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
  
  let coordinates = props.coordinates;
  const pointSize = (3.5 - 0.5 * Math.log10(coordinates.length));


  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(coordinates, (d: number[]) => d[0]) as [number, number])
    .range([paddingWidth, canvasWidth - paddingWidth]);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(coordinates, (d: number[]) => d[1]) as [number, number])
    .range([height - paddingHeight, paddingHeight]);

  // const svgContext = d3
  //   .select(props.svgCurrent)
  //   .append("svg")
  //   .attr("id", "herewego")
  //   .attr("width", width)
  //   .attr("height", height);

  const range = props.indices ? props.indices.categories as number[]: [0];
  const colorScheme = props.indices ? d3.interpolateOranges : (d: number) => "#888";
  
  
  
  console.log(Math.min(...range), Math.max(...range));
  
  // interpolateViridis
  // interpolateOranges
    
  const colorScale = d3
  .scaleSequential()
  .range([0, ...range])
  .interpolator(colorScheme)  
    
  const someContext: CanvasRenderingContext2D =
    props.groupRefs[0].getContext("2d")!;
    
  someContext.canvas.width = width;
  someContext.canvas.height = height;
  someContext.canvas.style.width = (width * 30).toString();
  someContext.canvas.style.height = (height * 30).toString();
  
  coordinates.forEach((e, i) => {

    someContext.beginPath();
    someContext.arc(
      xScale(e[0]),
      yScale(e[1]),
      pointSize * 0.1,
      0,
      2 * Math.PI
    );

    someContext.fillStyle = "#888"
    someContext.fill();
    someContext.closePath();
  });
  
  props.indices?.categories.forEach((e, i) => {
    
    const point = coordinates[i];
    
    someContext.beginPath();
    someContext.arc(
      xScale(point[0]),
      yScale(point[1]),
      pointSize,
      0,
      2 * Math.PI
    );
    
    someContext.fillStyle = (colorScale as d3.ScaleSequential<string, string>)(e as number);  
    someContext.fill();
    someContext.closePath();
  })
  
  if (!!props.imageTrigger) {
    const scale = 3;
    
    const imageWidth = 1000 * scale;
    const imageHeight = 1000 * scale;

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = imageWidth;
    finalCanvas.height = imageHeight;

    const finalCtx = finalCanvas.getContext("2d")!;
    finalCtx.imageSmoothingEnabled = true;

    finalCtx.fillStyle = "black";
    finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    const scaledxScale = d3
      .scaleLinear()
      .domain(d3.extent(coordinates, (d: number[]) => d[0]) as [number, number])
      .range([paddingWidth, imageWidth - paddingWidth]);

    const scaledyScale = d3
      .scaleLinear()
      .domain(d3.extent(coordinates, (d: number[]) => d[1]) as [number, number])
      .range([imageHeight - paddingHeight, paddingHeight]);

    coordinates.forEach((e, i) => {
      finalCtx.beginPath();
      finalCtx.arc(
        scaledxScale(e[0]),
        scaledyScale(e[1]),
        pointSize * 2,
        0,
        2 * Math.PI
      );

      finalCtx.fillStyle = "#888";
      finalCtx.fill();
      finalCtx.closePath();
    });

    props.indices?.categories.forEach((e, i) => {
      const point = coordinates[i];

      finalCtx.beginPath();
      finalCtx.arc(
        scaledxScale(point[0]),
        scaledyScale(point[1]),
        pointSize * 2,
        0,
        2 * Math.PI
      );

      finalCtx.fillStyle = (colorScale as d3.ScaleSequential<string, string>)(e as number);
      finalCtx.fill();
      finalCtx.closePath();
    });

    // Export the final canvas as an image
    const a = document.createElement("a");
    a.href = finalCanvas.toDataURL("image/png");
    a.download = `${props.imageTrigger}.png`;
    a.click();

    props.dispatch(
      setTrigger({ type: "saveScatterPlotImage", value: null })
    );
  }
  

  return () => {
    // svgContext.remove();
  };
};

export default FeatureScatterPlotGenerator;
