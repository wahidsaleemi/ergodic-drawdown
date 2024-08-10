// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable security/detect-object-injection */
import hashSum from "hash-sum";

import { MS_PER_WEEK } from "../constants";
import { distroColor } from "../content";
import { timeout } from "../helpers";
import { type DatasetList, type VolumeData } from "../types";

const signalState = { aborted: false };

const NAME = "volume normal distribution";

const drawdownNormalDistributionWorker = async (
  volumeDataset: VolumeData,
  drawdownDate: number,
  signal: AbortSignal,
): Promise<[string, DatasetList | undefined]> => {
  const id = hashSum(Math.random());
  console.time(NAME + id);
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
      console.timeEnd(NAME + id);
      return [id, undefined];
    } else {
      // console.log("loop normal");
    }

    let innerIndex = 0;
    for (const y of innerArray) {
      const x = drawdownDate + innerIndex * MS_PER_WEEK;
      if (!(x in groupedData)) groupedData[x] = [];
      groupedData[x].push(y);
      innerIndex++;
    }
  }

  const meanData = [];
  const upperData = [];
  const lowerData = [];

  for (const [x, values] of Object.entries(groupedData)) {
    index++;
    if (index % 50 === 0) await timeout();

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (signalState.aborted) {
      console.timeEnd(NAME + id);
      return [id, undefined];
    } else {
      // console.log("loop normal");
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
    const standardDeviation = Math.sqrt(variance);
    const date = Number.parseInt(x, 10);

    meanData.push({ x: date, y: mean });
    upperData.push({ x: date, y: mean + standardDeviation });
    lowerData.push({ x: date, y: mean - standardDeviation });
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
  ] satisfies DatasetList;
  signal.removeEventListener("abort", AbortAction);
  console.timeEnd(NAME + id);
  return [id, finalData];
};

export default drawdownNormalDistributionWorker;
