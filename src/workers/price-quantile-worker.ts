// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable security/detect-object-injection */
import hashSum from "hash-sum";

import { bitcoinColor, priceQuantileColor } from "../content";
import { quantile, timeout } from "../helpers";
import { type Data, type DatasetList } from "../types";

const signalState = { aborted: false };

const NAME = "price quantile";

const priceQuantileWorker = async (
  priceDataset: Data,
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
  for (const innerArray of priceDataset) {
    index++;
    if (index % 50 === 0) await timeout();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (signalState.aborted) {
      console.timeEnd(NAME + id);
      return [id, undefined];
    } else {
      // console.log("loop price quantile 1");
    }
    for (const { x, y } of innerArray) {
      if (!(x in groupedData)) groupedData[x] = [];
      groupedData[x].push(y);
    }
  }

  const medianData = [];
  const q000 = [];
  const q001 = [];
  const q005 = [];
  const q025 = [];
  const q075 = [];
  const q095 = [];
  const q099 = [];
  const q100 = [];

  for (const [x, values] of Object.entries(groupedData)) {
    index++;
    if (index % 50 === 0) await timeout();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (signalState.aborted) {
      console.timeEnd(NAME + id);
      return [id, undefined];
    } else {
      // console.log("loop price quantile 2");
    }
    const sortedValues = values.sort((first, second) => first - second);
    const date = Number.parseInt(x, 10);
    medianData.push({ x: date, y: quantile(sortedValues, 0.5) });
    q000.push({ x: date, y: quantile(sortedValues, 0) });
    q001.push({ x: date, y: quantile(sortedValues, 0.01) });
    q005.push({ x: date, y: quantile(sortedValues, 0.05) });
    q025.push({ x: date, y: quantile(sortedValues, 0.25) });
    q075.push({ x: date, y: quantile(sortedValues, 0.75) });
    q095.push({ x: date, y: quantile(sortedValues, 0.95) });
    q099.push({ x: date, y: quantile(sortedValues, 0.99) });
    q100.push({ x: date, y: quantile(sortedValues, 1) });
  }

  const finalData = [
    {
      backgroundColor: priceQuantileColor,
      borderWidth: 0,
      data: q000,
      fill: "+4",
      label: "Lowest Sampled Bitcoin Price",
      pointRadius: 0,
      tension: 0,
    },
    {
      backgroundColor: priceQuantileColor,
      borderWidth: 0,
      data: q001,
      fill: "+3",
      label: "1st Percentile Bitcoin Price",
      pointRadius: 0,
      tension: 0,
    },
    {
      backgroundColor: priceQuantileColor,
      borderWidth: 0,
      data: q005,
      fill: "+2",
      label: "5th Percentile Bitcoin Price",
      pointRadius: 0,
      tension: 0,
    },
    {
      backgroundColor: priceQuantileColor,
      borderWidth: 0,
      data: q025,
      fill: "+1",
      label: "25th Percentile Bitcoin Price",
      pointRadius: 0,
      tension: 0,
    },
    {
      borderColor: bitcoinColor,
      borderDash: [15, 5],
      borderWidth: 1,
      data: medianData,
      fill: false,
      label: "Median Bitcoin Price",
      pointRadius: 0,
      tension: 0,
    },
    {
      backgroundColor: priceQuantileColor,
      borderWidth: 0,
      data: q075,
      fill: "-1",
      label: "75th Percentile Bitcoin Price",
      pointRadius: 0,
      tension: 0,
    },
    {
      backgroundColor: priceQuantileColor,
      borderWidth: 0,
      data: q095,
      fill: "-2",
      label: "95th Percentile Bitcoin Price",
      pointRadius: 0,
      tension: 0,
    },
    {
      backgroundColor: priceQuantileColor,
      borderWidth: 0,
      data: q099,
      fill: "-3",
      label: "99th Percentile Bitcoin Price",
      pointRadius: 0,
      tension: 0,
    },
    {
      backgroundColor: priceQuantileColor,
      borderWidth: 0,
      data: q100,
      fill: "-4",
      label: "Highest Sampled Bitcoin Price",
      pointRadius: 0,
      tension: 0,
    },
  ];
  signal.removeEventListener("abort", AbortAction);
  console.timeEnd(NAME + id);
  return [id, finalData];
};

export default priceQuantileWorker;
