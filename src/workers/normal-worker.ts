// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable security/detect-object-injection */
import hashSum from "hash-sum";

import { distroColor } from "../content";
import { timeout } from "../helpers";
import { type Data, type DatasetList } from "../types";

const signalState = { aborted: false };

const normalDistributionWorker = async (
  volumeDataset: Data,
  signal: AbortSignal,
): Promise<[string, DatasetList | undefined]> => {
  const id = hashSum(Math.random());
  console.time("normal" + id);
  signalState.aborted = false;

  // eslint-disable-next-line functional/functional-parameters
  const AbortAction = (): void => {
    signal.removeEventListener("abort", AbortAction);
    console.warn("Aborted", id);
    signalState.aborted = true;
  };

  signal.addEventListener("abort", AbortAction);

  const groupedData: Record<number, number[]> = {};
  let index = 0;
  for (const innerArray of volumeDataset) {
    index++;
    if (index % 50 === 0) await timeout();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (signalState.aborted) {
      console.timeEnd("normal" + id);
      return [id, undefined];
    } else {
      // console.log("loop quantile");
    }
    for (const point of innerArray) {
      if (!(point.x in groupedData)) {
        groupedData[point.x] = [];
      }
      groupedData[point.x].push(point.y);
    }
  }
  const statsData: Record<number, { mean: number; stdDev: number }> = {};
  for (const [x, values] of Object.entries(groupedData) as unknown as Array<
    [number, number[]]
  >) {
    index++;
    if (index % 50 === 0) await timeout();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (signalState.aborted) {
      console.timeEnd("normal" + id);
      return [id, undefined];
    } else {
      // console.log("loop quantile");
    }
    let sum = 0;
    let sumOfSquares = 0;
    const count = values.length;

    for (const value of values) {
      sum += value;
      sumOfSquares += value * value;
    }

    const mean = sum / count;
    const variance = sumOfSquares / count - mean * mean;

    statsData[x] = { mean, stdDev: Math.sqrt(variance) };
  }

  const meanData = [];
  const upperData = [];
  const lowerData = [];

  for (const x of Object.keys(statsData)) {
    index++;
    if (index % 50 === 0) await timeout();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (signalState.aborted) {
      console.timeEnd("normal" + id);
      return [id, undefined];
    } else {
      // console.log("loop quantile");
    }
    const date = Number.parseInt(x, 10);
    const { mean, stdDev } = statsData[date];

    meanData.push({ x: date, y: mean });
    upperData.push({ x: date, y: mean + stdDev });
    lowerData.push({ x: date, y: mean - stdDev });
  }
  const finalData = [
    {
      borderColor: "blue",
      borderDash: [15, 5],
      borderWidth: 1,
      data: meanData,
      fill: false,
      label: "Mean Drawdown",
      pointRadius: 0,
      tension: 0,
      yAxisID: "y1",
    },
    {
      backgroundColor: distroColor,
      borderWidth: 0,
      data: upperData,
      fill: "-1",
      label: "1 Standard Deviation",
      pointRadius: 0,
      tension: 0,
      yAxisID: "y1",
    },
    {
      backgroundColor: distroColor,
      borderWidth: 0,
      data: lowerData,
      fill: "-2",
      label: "1 Standard Deviation",
      pointRadius: 0,
      tension: 0,
      yAxisID: "y1",
    },
  ];
  signal.removeEventListener("abort", AbortAction);
  console.timeEnd("normal" + id);
  return [id, finalData];
};

export default normalDistributionWorker;
