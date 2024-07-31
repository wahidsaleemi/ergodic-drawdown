import hashSum from "hash-sum";

import { quantileColor } from "../content";
import { quantile, timeout } from "../helpers";
import { type DatasetList } from "../types";

const signalState = { aborted: false };

const quantileWorker = async (
  volumeDataset: DatasetList,
  signal: AbortSignal,
): Promise<[string, DatasetList | undefined]> => {
  const id = hashSum([...String(Date.now())].reverse());
  console.time("quantile" + id);
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
      console.timeEnd("quantile" + id);
      return [id, undefined];
    } else {
      // console.log("loop quantile");
    }
    for (const point of innerArray.data) {
      if (!(point.x in groupedData)) {
        groupedData[point.x] = [];
      }
      groupedData[point.x].push(point.y);
    }
  }

  const quantileData: Record<number, Record<string, number>> = {};
  for (const [x, values] of Object.entries(groupedData) as unknown as Array<
    [number, number[]]
  >) {
    index++;
    if (index % 50 === 0) await timeout();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (signalState.aborted) {
      console.timeEnd("quantile" + id);
      return [id, undefined];
    } else {
      // console.log("loop quantile");
    }
    const sortedValues = values.sort((first, second) => first - second);
    // eslint-disable-next-line security/detect-object-injection
    quantileData[x] = {
      medianInner: quantile(sortedValues, 0.5),
      q000: quantile(sortedValues, 0),
      q001: quantile(sortedValues, 0.01),
      q005: quantile(sortedValues, 0.05),
      q025: quantile(sortedValues, 0.25),
      q075: quantile(sortedValues, 0.75),
      q095: quantile(sortedValues, 0.95),
      q099: quantile(sortedValues, 0.99),
      q100: quantile(sortedValues, 1),
    };
  }

  // Prepare datasets for ChartJS
  const medianData = [];
  const q000Data = [];
  const q001Data = [];
  const q005Data = [];
  const q025Data = [];
  const q075Data = [];
  const q095Data = [];
  const q099Data = [];
  const q100Data = [];
  for (const [
    x,
    { medianInner, q000, q001, q005, q025, q075, q095, q099, q100 },
  ] of Object.entries(quantileData)) {
    index++;
    if (index % 50 === 0) await timeout();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (signalState.aborted) {
      console.timeEnd("quantile" + id);
      return [id, undefined];
    } else {
      // console.log("loop quantile");
    }
    const date = Number.parseInt(x, 10);
    medianData.push({ x: date, y: medianInner });
    q000Data.push({ x: date, y: q000 });
    q001Data.push({ x: date, y: q001 });
    q005Data.push({ x: date, y: q005 });
    q025Data.push({ x: date, y: q025 });
    q075Data.push({ x: date, y: q075 });
    q095Data.push({ x: date, y: q095 });
    q099Data.push({ x: date, y: q099 });
    q100Data.push({ x: date, y: q100 });
  }
  const finalData = [
    {
      backgroundColor: quantileColor,
      borderWidth: 0,
      data: q000Data,
      fill: "+4",
      label: "Lowest Sampled Remaining",
      pointRadius: 0,
      tension: 0,
      yAxisID: "y1",
    },
    {
      backgroundColor: quantileColor,
      borderWidth: 0,
      data: q001Data,
      fill: "+3",
      label: "1st Percentile",
      pointRadius: 0,
      tension: 0,
      yAxisID: "y1",
    },
    {
      backgroundColor: quantileColor,
      borderWidth: 0,
      data: q005Data,
      fill: "+2",
      label: "5th Percentile",
      pointRadius: 0,
      tension: 0,
      yAxisID: "y1",
    },
    {
      backgroundColor: quantileColor,
      borderWidth: 0,
      data: q025Data,
      fill: "+1",
      label: "25th Percentile",
      pointRadius: 0,
      tension: 0,
      yAxisID: "y1",
    },
    {
      borderColor: "green",
      borderDash: [15, 5],
      borderWidth: 2,
      data: medianData,
      fill: false,
      label: "Median",
      pointRadius: 0,
      tension: 0,
      yAxisID: "y1",
    },
    {
      backgroundColor: quantileColor,
      borderWidth: 0,
      data: q075Data,
      fill: "-1",
      label: "75th Percentile",
      pointRadius: 0,
      tension: 0,
      yAxisID: "y1",
    },
    {
      backgroundColor: quantileColor,
      borderWidth: 0,
      data: q095Data,
      fill: "-2",
      label: "95th Percentile",
      pointRadius: 0,
      tension: 0,
      yAxisID: "y1",
    },
    {
      backgroundColor: quantileColor,
      borderWidth: 0,
      data: q099Data,
      fill: "-3",
      label: "99th Percentile",
      pointRadius: 0,
      tension: 0,
      yAxisID: "y1",
    },
    {
      backgroundColor: quantileColor,
      borderWidth: 0,
      data: q100Data,
      fill: "-4",
      label: "Highest Sampled Remaining",
      pointRadius: 0,
      tension: 0,
      yAxisID: "y1",
    },
  ];
  signal.removeEventListener("abort", AbortAction);
  console.timeEnd("quantile" + id);
  return [id, finalData];
};

export default quantileWorker;
