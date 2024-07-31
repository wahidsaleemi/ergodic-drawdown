import {
  CategoryScale,
  Chart as ChartJS,
  type ChartData,
  type ChartOptions,
  Filler,
  LinearScale,
  LineElement,
  LogarithmicScale,
  type Point,
  PointElement,
  TimeScale,
  Tooltip,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import zoom from "chartjs-plugin-zoom";
import { useCallback, useMemo } from "react";
import { Line } from "react-chartjs-2";

import { isMobile } from "./constants";
import { type HalvingData } from "./types";

const watermarkPlugin = {
  afterDraw: (chart: ChartJS) => {
    const context = chart.ctx;
    context.save();
    const text = `${isMobile() ? "" : "gildedpleb.github.io/ergodic-drawdown | "}@gildedpleb `;
    const fontSize = isMobile() ? 10 : 18;
    context.font = `${fontSize}px Arial`;
    context.textAlign = "right";
    context.textBaseline = "bottom";
    context.fillStyle = "#999";
    const x = chart.chartArea.right;
    const y = chart.chartArea.bottom;
    context.fillText(text, x, y);
    context.restore();
  },
  id: "watermark",
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  LogarithmicScale,
  annotationPlugin,
  zoom,
  TimeScale,
  Filler,
  watermarkPlugin,
);

interface IChart {
  dataProperties: ChartData<"line", Array<Point | null | number>>;
  halvings: HalvingData;
}

const Chart = ({ dataProperties, halvings }: IChart): JSX.Element => {
  const annotations = useCallback(
    (): Array<Record<string, number | object | string>> =>
      Object.entries(halvings).map(([, timestamp], index) => ({
        borderColor: "green",
        borderWidth: 0.5,
        label: {
          content: `Halving ${index + 1}`,
          position: "center",
        },
        scaleID: "x",
        type: "line",
        value: timestamp * 1000,
      })),
    [halvings],
  );

  const options = useMemo(() => {
    return {
      animation: false,
      plugins: {
        annotation: {
          annotations: annotations(),
        },
        filler: {
          propagate: true,
        },
        zoom: isMobile()
          ? {}
          : {
              pan: {
                enabled: true,
                mode: "x",
              },
              zoom: {
                mode: "x",
                pinch: { enabled: true },
                wheel: { enabled: true, speed: 0.1 },
              },
            },
      },
      scales: {
        x: {
          min: "2010-01-01",
          ticks: {
            callback: function (value: number | string) {
              const date = new Date(value).toDateString().split(" ");
              return `${date[1]} ${date[3]}`;
            },
          },
          time: {
            parser: "yyyy-mm-dd",
            tooltipFormat: "MM/dd/yyyy",
            unit: "week",
          },
          title: { display: true, text: "Date" },
          type: "time",
        },
        y: {
          ticks: {
            callback: (value: number | string) => {
              const numericValue =
                typeof value === "string" ? Number.parseFloat(value) : value;
              return isMobile()
                ? numericValue.toExponential()
                : numericValue.toString();
            },
          },
          title: { display: true, text: "Price (Log Scale)" },
          type: "logarithmic",
        },
        y1: {
          beginAtZero: true,
          min: 0,
          position: "right",
          title: { display: true, text: "BTC Volume" },
          type: "linear",
        },
      },
    } satisfies ChartOptions<"line">;
  }, [annotations]);

  // eslint-disable-next-line react/react-in-jsx-scope
  return <Line data={dataProperties} options={options} />;
};

export default Chart;
