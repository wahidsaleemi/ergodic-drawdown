/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair */
/* eslint-disable unicorn/prefer-spread */
/* eslint-disable security/detect-object-injection */
import "./App.css";
import "chartjs-adapter-date-fns";

import {
  CategoryScale,
  Chart as ChartJS,
  type ChartOptions,
  Filler,
  LinearScale,
  LineElement,
  LogarithmicScale,
  PointElement,
  TimeScale,
  Tooltip,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import zoom from "chartjs-plugin-zoom";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";

import {
  fetchBlockByHeight,
  getCurrentBlockHeight,
  getCurrentPrice,
  getInterimWeeklyData,
} from "./api";
import marketData from "./bitcoin_weekly_prices_transformed_2.json";
import {
  MS_PER_DAY,
  MS_PER_WEEK,
  MS_PER_YEAR,
  WEEKS_PER_EPOCH,
  WEEKS_PER_YEAR,
} from "./constants";
import ForkUs from "./fork-us";
import {
  applyModel,
  calculateHalvings,
  generateColor,
  getStartingPriceNormalized,
  loadHalvings,
  quantile,
  saveHalvings,
  weeksSinceLastHalving,
} from "./helpers";
import {
  basicGrowthModel,
  cagrModel,
  linearModel,
  powerLawModel,
  rainbowChartModel,
  stockToFlowModel,
  stockToFlowModelNew,
} from "./models";
import { type Dataset, type DatasetList, type HalvingData } from "./types";
import {
  bubble,
  type IWalk,
  momentumDrift,
  pingPong,
  random,
  sawtooth,
  shark,
  sinusoidal,
  USElections,
} from "./walks";

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
);

const inputLabels = {
  clampBottom: "Min:",
  clampTop: "Clamp Price to Max:",
  costOfLiving: "Yearly Expenses (USD):",
  distroDate: "BTC drawdown starts:",
  epoch: "Epoch Count (1-100):",
  inflation: "Expected Annual Inflation (%):",
  model: "Model:",
  renderDistro: "Normal Distribution:",
  renderDrawdown: "Drawdown Walks:",
  renderExpenses: "Expenses:",
  renderModelMax: "Model Max:",
  renderModelMin: "Model Min:",
  renderQuantile: "Quantile:",
  renderWalk: "Price Walks:",
  samples: "Statistical Sample Count (1k-10k):",
  samplesToRender: "Walks to render",
  totalBitcoin: "Bitcoin Holdings:",
  vol: "Volatility (0-1):",
  walk: "Walk Strategy:",
};

const fieldLabels = {
  drawdown: "Drawdown",
  graph: "Visualization",
  model: "Price Model",
  render: "Render",
};

const title = "Ergodic Bitcoin Drawdown via Monte Carlo Simulation";

const distroColor = "rgba(0, 0, 255, 0.4)";
const quantileColor = "rgba(0, 255, 0, 0.1)";

const models = [
  linearModel,
  basicGrowthModel,
  powerLawModel,
  rainbowChartModel,
  cagrModel,
  stockToFlowModelNew,
  stockToFlowModel,
];

const modelMap = {
  [basicGrowthModel.modelType]: basicGrowthModel,
  [cagrModel.modelType]: cagrModel,
  [linearModel.modelType]: linearModel,
  [powerLawModel.modelType]: powerLawModel,
  [rainbowChartModel.modelType]: rainbowChartModel,
  [stockToFlowModel.modelType]: stockToFlowModel,
  [stockToFlowModelNew.modelType]: stockToFlowModelNew,
} as const;

const walks: Record<string, IWalk> = {
  Bubble: bubble,
  Momentum: momentumDrift,
  Pong: pingPong,
  Random: random,
  Saw: sawtooth,
  Shark: shark,
  Sin: sinusoidal,
  "Vote Counting": USElections,
} as const;

/**
 *
 * @param value - value to debounce
 * @param delay - debounce delay
 * @returns debounced value
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

type Data = Array<Array<{ x: number; y: number }>>;
type RawData = Array<{ close: number; time: number }>;

const StochasticGraph = (): React.ReactNode => {
  const [data, setData] = useState<Data>([]);
  const [samples, setSamples] = useState<number | undefined>(1000);
  const debouncedSamples = useDebounce<number | undefined>(samples, 300);
  const [samplesToRender, setSamplesToRender] = useState<number | undefined>(9);
  const [epochCount, setEpochCount] = useState<number>(10);
  const [volatility, setVolatility] = useState<number>(0.1);
  const debouncedVolatility = useDebounce<number>(volatility, 300);
  const [halvings, setHalvings] = useState<HalvingData>(loadHalvings());
  const [interim, setInterim] = useState<RawData>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [bitcoin, setBitcoin] = useState<number>(3.125);
  const [costOfLiving, setCostOfLiving] = useState<number>(100_000);
  const [inflation, setInflation] = useState<number>(8);
  const [zero, setZero] = useState<number>(0);
  const [distroDate, setDistroDate] = useState(Date.now() + 8 * MS_PER_YEAR);
  const debouncedDistroDate = useDebounce<number>(distroDate, 500);
  const [average, setAverage] = useState<number>(0);
  const [median, setMedian] = useState<number>(0);
  const [currentBlock, setCurrentBlock] = useState<number>(0);
  const [model, setModel] = useState<string>(powerLawModel.modelType);
  const [walk, setWalk] = useState<string>("Bubble");
  const [clampTop, setClampTop] = useState<boolean>(false);
  const [clampBottom, setClampBottom] = useState<boolean>(false);
  const [renderWalk, setRenderWalk] = useState<boolean>(true);
  const [renderDrawdown, setRenderDrawdown] = useState<boolean>(false);
  const [renderModelMax, setRenderModelMax] = useState<boolean>(true);
  const [renderModelMin, setRenderModelMin] = useState<boolean>(true);
  const [renderExpenses, setRenderExpenses] = useState<boolean>(true);
  const [renderDistro, setRenderDistro] = useState<boolean>(false);
  const [renderQuantile, setRenderQuantile] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const currentHeight = await getCurrentBlockHeight();
      setCurrentBlock(currentHeight);
      const neededHalvings = calculateHalvings(currentHeight);
      const storedHalvings = loadHalvings();
      const halvingsToFetch = neededHalvings.filter(
        (height) => !(height.toString() in storedHalvings),
      );
      if (halvingsToFetch.length === 0) return;
      const fetchPromises = halvingsToFetch.map(async (height) => ({
        [height.toString()]: await fetchBlockByHeight(height),
      }));
      const fetchedDataArrays = await Promise.all(fetchPromises);
      const fetchedHalvings: HalvingData = {};
      for (const dataObject of fetchedDataArrays) {
        const key = Object.keys(dataObject)[0];
        fetchedHalvings[key] = dataObject[key];
      }
      const updatedHalvings = { ...storedHalvings, ...fetchedHalvings };
      saveHalvings(updatedHalvings);
      setHalvings(updatedHalvings);
    };
    fetchData().catch(console.error);
  }, []);

  useEffect(() => {
    if (debouncedSamples === undefined || currentPrice === 0) return;
    const lastHalving = weeksSinceLastHalving(halvings);
    if (debouncedSamples === data.length) {
      const GTcurrant = data[0].length / WEEKS_PER_EPOCH > epochCount;
      const LTnext = data[0].length / WEEKS_PER_EPOCH < epochCount + 1;
      if (GTcurrant && LTnext) {
        // Do nothing
      } else if (GTcurrant && !LTnext) {
        const last = -(
          (Math.floor(data[0].length / WEEKS_PER_EPOCH) - epochCount) *
          WEEKS_PER_EPOCH
        );
        const newData = data.map((sample) => sample.slice(0, last));
        setData(newData);
      } else if (!GTcurrant && LTnext) {
        const newData = data.map((sample) => {
          const newEpoch = walks[walk]({
            clampBottom,
            clampTop,
            start: getStartingPriceNormalized(
              modelMap[model],
              sample.at(-1)?.y ?? currentPrice,
              sample.length,
              currentBlock,
            ),
            startDay: sample.length === 0 ? lastHalving : 0,
            volatility: debouncedVolatility,
          });
          return sample.concat(
            applyModel(
              newEpoch,
              modelMap[model],
              sample.at(-1)?.x,
              sample.length,
              currentBlock,
              currentPrice,
            ),
          );
        });
        setData(newData);
      }
    } else if (debouncedSamples > data.length) {
      const additionalData: Data = [];
      const startingPrice = getStartingPriceNormalized(
        modelMap[model],
        currentPrice,
        undefined,
        currentBlock,
      );

      for (let index = data.length; index < debouncedSamples; index++) {
        let innerGraph: number[] = [];
        for (let jndex = 0; jndex < epochCount; jndex++) {
          const stuff = walks[walk]({
            clampBottom,
            clampTop,
            start: innerGraph.at(-1) ?? startingPrice,
            startDay: innerGraph.length === 0 ? lastHalving : innerGraph.length,
            volatility: debouncedVolatility,
          });
          innerGraph = innerGraph.concat(stuff);
        }
        additionalData.push(
          applyModel(
            innerGraph,
            modelMap[model],
            undefined,
            undefined,
            currentBlock,
            currentPrice,
          ),
        );
      }
      setData(data.concat(additionalData));
    } else if (debouncedSamples < data.length) {
      setData(data.slice(0, debouncedSamples));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrice, epochCount, halvings, debouncedSamples, currentBlock]);

  useEffect(() => {
    if (debouncedSamples === undefined || currentPrice === 0) return;
    const graphs: Data = [];
    const startingPrice = getStartingPriceNormalized(
      modelMap[model],
      currentPrice,
      undefined,
      currentBlock,
    );
    const lastHalving = weeksSinceLastHalving(halvings);
    for (let index = 0; index < debouncedSamples; index++) {
      let innerGraph: number[] = [];

      for (let jndex = 0; jndex < epochCount; jndex++) {
        const stuff = walks[walk]({
          clampBottom,
          clampTop,
          start: innerGraph.at(-1) ?? startingPrice,
          startDay: innerGraph.length === 0 ? lastHalving : innerGraph.length,
          volatility: debouncedVolatility,
        });
        innerGraph = innerGraph.concat(stuff);
      }
      graphs.push(
        applyModel(
          innerGraph,
          modelMap[model],
          undefined,
          undefined,
          currentBlock,
          currentPrice,
        ),
      );
    }
    setData(graphs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedVolatility, model, walk, clampBottom, clampTop]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const newData = await getInterimWeeklyData();
      setInterim(newData);
    };
    fetchData().catch(console.error);
  }, []);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const newPrice = await getCurrentPrice();
      setCurrentPrice(newPrice.close);
    };
    fetchData().catch(console.error);
  }, []);

  const marketDataset = useMemo(
    () => ({
      borderColor: "rgb(246, 145, 50)",
      borderWidth: 0.5,
      data: marketData,
      label: `Bitcoin Historic Price`,
      pointRadius: 0,
      tension: 0,
    }),
    [],
  );

  const interimDataset = useMemo(
    () => ({
      borderColor: "rgb(246, 145, 50)",
      borderWidth: 0.5,
      data: interim.map((item) => ({
        x: item.time * 1000,
        y: item.close,
      })),
      label: `Bitcoin Historic Price`,
      pointRadius: 0,
      tension: 0,
    }),
    [interim],
  );

  const randomWalkDatasets: DatasetList = useMemo(() => {
    if (samplesToRender === undefined) return [];
    return data.slice(0, samplesToRender).map((graph, index) => ({
      borderColor: generateColor(index),
      borderWidth: 0.5,
      data: graph,
      label: `Potential Bitcoin Price (${index})`,
      pointRadius: 0,
      tension: 0,
    }));
  }, [data, samplesToRender]);

  const minModelDataset = useMemo(() => {
    if (!renderModelMin) return {} as Dataset;
    return {
      borderColor: "green",
      borderWidth: 0.5,
      data: (data[0] ?? []).map((item, index) => ({
        x: item.x,
        y: modelMap[model].minPrice({
          currentBitcoinBlock: currentBlock,
          currentBitcoinPrice: currentPrice,
          week: index,
        }),
      })),
      label: `Model Min Value`,
      pointRadius: 0,
      tension: 0,
    } satisfies Dataset;
  }, [currentBlock, data, model, currentPrice, renderModelMin]);

  const maxModelDataset = useMemo(() => {
    if (!renderModelMax) return {} as Dataset;
    return {
      borderColor: "red",
      borderWidth: 0.5,
      data: (data[0] ?? []).map((item, index) => ({
        x: item.x,
        y: modelMap[model].maxPrice({
          currentBitcoinBlock: currentBlock,
          currentBitcoinPrice: currentPrice,
          week: index,
        }),
      })),
      label: `Model Max Value`,
      pointRadius: 0,
      tension: 0,
    } satisfies Dataset;
  }, [currentBlock, data, model, currentPrice, renderModelMax]);

  const volumeDataset = useMemo(() => {
    let localZero = 0;
    const finalBalance: number[] = [];
    const now = Date.now();
    const adjustedDif = Math.floor(
      (debouncedDistroDate + MS_PER_DAY - now) / MS_PER_WEEK,
    );
    const iterations = epochCount * WEEKS_PER_EPOCH - adjustedDif;
    const startDistro = new Date(debouncedDistroDate);
    const weeklyInflationRate =
      (1 + inflation / 100) ** (1 / WEEKS_PER_YEAR) - 1;

    const mapped = data.map((graph, index) => {
      let weeklyCostOfLiving = costOfLiving / WEEKS_PER_YEAR;
      let previous = bitcoin;
      const dataArray = [];

      for (let innerIndex = 0; innerIndex < iterations; innerIndex++) {
        const x = startDistro.getTime() + innerIndex * MS_PER_WEEK;
        if (previous <= 0) {
          dataArray.push({ x, y: 0 });
          continue;
        }
        const adjustedInnerIndex = innerIndex + adjustedDif;
        if (innerIndex !== 0) weeklyCostOfLiving *= 1 + weeklyInflationRate;
        const y = previous - weeklyCostOfLiving / graph[adjustedInnerIndex]?.y;
        previous = y;
        dataArray.push({ x, y });
      }

      const dataSet = {
        borderColor: generateColor(index),
        borderWidth: 1,
        data: dataArray,
        label: `BTC Amount (${index})`,
        pointRadius: 0,
        tension: 0,
        yAxisID: "y1",
      };

      const last = dataSet.data.at(-1);
      if (last !== undefined && last.y <= 0) localZero += 1;
      if (last !== undefined) finalBalance.push(last.y);
      return dataSet;
    });

    setZero(localZero);
    let sum = 0;
    for (const number of finalBalance) sum += number;
    setAverage(sum / finalBalance.length);

    const sortedValues = finalBalance.sort((first, second) => first - second);
    setMedian(quantile(sortedValues, 0.5));

    return mapped;
  }, [data, bitcoin, epochCount, debouncedDistroDate, costOfLiving, inflation]);

  const distro: DatasetList = useMemo(() => {
    if (!renderDistro) return [];
    const groupedData: Record<number, number[]> = {};
    for (const innerArray of volumeDataset) {
      for (const point of innerArray.data) {
        if (!(point.x in groupedData)) {
          groupedData[point.x] = [];
        }
        groupedData[point.x].push(point.y);
      }
    }
    const statsData: Record<number, { mean: number; stdDev: number }> = {};
    for (const x of Object.keys(groupedData) as unknown as number[]) {
      const values = groupedData[x];
      const mean =
        values.reduce((accumulator, value) => accumulator + value, 0) /
        values.length;
      const variance =
        values.reduce(
          (accumulator, value) => accumulator + (value - mean) ** 2,
          0,
        ) / values.length;
      statsData[x] = { mean, stdDev: Math.sqrt(variance) };
    }

    const meanData = [];
    const upperData = [];
    const lowerData = [];

    for (const x of Object.keys(statsData)) {
      const date = Number.parseInt(x, 10);
      const { mean, stdDev } = statsData[date];

      meanData.push({ x: date, y: mean });
      upperData.push({ x: date, y: mean + stdDev });
      lowerData.push({ x: date, y: mean - stdDev });
    }

    return [
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
  }, [renderDistro, volumeDataset]);

  const distroQ: DatasetList = useMemo(() => {
    if (!renderQuantile) return [];
    const groupedData: Record<number, number[]> = {};
    for (const innerArray of volumeDataset) {
      for (const point of innerArray.data) {
        if (!(point.x in groupedData)) {
          groupedData[point.x] = [];
        }
        groupedData[point.x].push(point.y);
      }
    }

    const quantileData: Record<number, Record<string, number>> = {};
    for (const x in groupedData) {
      const values = groupedData[x];
      const sortedValues = values.sort((first, second) => first - second);
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
    for (const x in quantileData) {
      const date = Number.parseInt(x, 10);
      const { medianInner, q000, q001, q005, q025, q075, q095, q099, q100 } =
        quantileData[x];
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
    return [
      {
        backgroundColor: quantileColor,
        borderWidth: 0,
        data: q000Data,
        fill: "+4",
        label: "Lowest Sampled Return",
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
        label: "Highest Sampled Return",
        pointRadius: 0,
        tension: 0,
        yAxisID: "y1",
      },
    ];
  }, [renderQuantile, volumeDataset]);

  const costOfLivingDataset = useMemo(() => {
    const now = Date.now();
    const weeklyInflationRate =
      (1 + inflation / 100) ** (1 / WEEKS_PER_YEAR) - 1;
    let weeklyCostOfLiving = costOfLiving / WEEKS_PER_YEAR;
    const numberOfWeeks = epochCount * WEEKS_PER_EPOCH;
    const dataPoints = Array.from({ length: numberOfWeeks }, (_, index) => {
      if (index !== 0) weeklyCostOfLiving *= 1 + weeklyInflationRate;
      const x = now + index * MS_PER_WEEK;
      const y = weeklyCostOfLiving * WEEKS_PER_YEAR;
      return { x, y };
    });

    return {
      borderColor: "magenta",
      borderDash: [5, 5],
      borderWidth: 1,
      data: dataPoints,
      label: `Weekly Adjusted Cost of Living Annualized`,
      pointRadius: 0,
      tension: 0,
    };
  }, [costOfLiving, epochCount, inflation]);

  const dataProperties = useMemo(
    () =>
      ({
        datasets: [
          marketDataset,
          interimDataset,
          ...(renderWalk ? randomWalkDatasets : []),
          ...(renderDrawdown ? volumeDataset.slice(0, samplesToRender) : []),
          ...(renderModelMin ? [minModelDataset] : []),
          ...(renderModelMax ? [maxModelDataset] : []),
          ...(renderExpenses ? [costOfLivingDataset] : []),
          ...distro,
          ...distroQ,
        ],
      }) satisfies { datasets: DatasetList },
    [
      marketDataset,
      interimDataset,
      renderWalk,
      randomWalkDatasets,
      samplesToRender,
      renderDrawdown,
      volumeDataset,
      renderModelMin,
      minModelDataset,
      renderModelMax,
      maxModelDataset,
      renderExpenses,
      costOfLivingDataset,
      distro,
      distroQ,
    ],
  );

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

  const options = useMemo(
    () =>
      ({
        animation: { duration: 0 },
        plugins: {
          annotation: { annotations: annotations() },
          filler: {
            propagate: true,
          },
          zoom: {
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
      }) satisfies ChartOptions<"line">,
    [annotations],
  );

  const handleEpoch: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const value = Number.parseInt(event.target.value, 10);
      if (value >= 1 && value <= 100) setEpochCount(value);
    },
    [],
  );

  const handleSamples: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (event.target.value === "") {
        setSamples(undefined);
        return;
      }
      const value = Number.parseInt(event.target.value, 10);
      if (value >= 0 && value <= 10_000) setSamples(value);
    },
    [],
  );

  const handleSamplesToRender: React.ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      if (event.target.value === "") {
        setSamplesToRender(undefined);
        return;
      }
      const value = Number.parseInt(event.target.value, 10);
      if (value >= 0 && value <= 100) setSamplesToRender(value);
    }, []);

  const handleVol: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const value = Number.parseFloat(event.target.value);
      if (value >= 0 && value <= 1) setVolatility(value);
    },
    [],
  );

  const handleBtc: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const value = Number.parseFloat(event.target.value);
      setBitcoin(value);
    },
    [],
  );

  const handleCostOfLiving: React.ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      const value = Number.parseFloat(event.target.value);
      if (value >= 0) setCostOfLiving(value);
    }, []);

  const handleInflation: React.ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      const value = Number.parseFloat(event.target.value);
      setInflation(value);
    }, []);

  const handleDistroDate: React.ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      const date = new Date(event.target.value);
      const timestamp = Math.floor(date.getTime());
      console.log({ now: Date.now(), timestamp, value: event.target.value });
      if (timestamp < Date.now()) setDistroDate(Date.now());
      else setDistroDate(timestamp);
    }, []);

  const handleModel: React.ChangeEventHandler<HTMLSelectElement> = useCallback(
    (event) => {
      setModel(event.target.value);
    },
    [],
  );

  const handleClampTop: React.ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      setClampTop(event.target.checked);
    }, []);

  const handleClampBottom: React.ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      setClampBottom(event.target.checked);
    }, []);

  const handleRenderWalk: React.ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      setRenderWalk(event.target.checked);
    }, []);

  const handleRenderDrawdown: React.ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      setRenderDrawdown(event.target.checked);
    }, []);

  const handleRenderModelMax: React.ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      setRenderModelMax(event.target.checked);
    }, []);

  const handleRenderModelMin: React.ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      setRenderModelMin(event.target.checked);
    }, []);

  const handleRenderExpenses: React.ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      setRenderExpenses(event.target.checked);
    }, []);

  const handleRenderDistro: React.ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      setRenderDistro(event.target.checked);
    }, []);

  const handleRenderQuantile: React.ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      setRenderQuantile(event.target.checked);
    }, []);

  const handleWalk: React.ChangeEventHandler<HTMLSelectElement> = useCallback(
    (event) => {
      const value = event.target.value;
      if (Object.keys(walks).includes(value)) setWalk(value);
    },
    [],
  );

  const handleEnterKey: React.KeyboardEventHandler<
    HTMLInputElement | HTMLSelectElement
  > = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (event.key === "Enter") {
        const target = event.target as HTMLInputElement | HTMLSelectElement;

        const elements = Array.from(
          document.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
            "input, select",
          ),
        );
        const currentIndex = elements.indexOf(target);
        const nextElement = elements[currentIndex + 1];
        if (typeof nextElement.focus === "function") {
          nextElement.focus();
          event.preventDefault();
        }
      }
    },
    [],
  );

  const epochLength = ` (~${epochCount * 4} years)`;
  const escapeVelocity =
    samples === undefined
      ? ""
      : `${(100 - (zero / samples) * 100).toFixed(2)}% chance of not exhausting bitcoin holdings with an average of ${average.toFixed(4)} Bitcoin left (median ${median.toFixed(4)}), if drawing down from a ${bitcoin} bitcoin balance starting ${new Date(distroDate).toDateString()} to meet $${costOfLiving.toLocaleString()} of yearly costs (in todays dollars), expecting ${inflation}% inflation per year.`;
  const volStep = walk === "Bubble" ? 0.005 : 0.001;
  const using = data.length * data[0]?.length * 2;
  const dataPointCount = `(Roughly ${using.toLocaleString()} data points using ${((using * 40) / (1024 * 1024)).toFixed(0)} MB of memory)`;

  return (
    <div className="container">
      <div className="header">{title}</div>
      <div className="section">
        <fieldset className="group">
          <legend>{fieldLabels.model}</legend>
          <div className="input-row">
            <select
              className="select-model"
              id="modelInput"
              onChange={handleModel}
              onKeyDown={handleEnterKey}
              value={model}
            >
              {models.map((item) => (
                <option key={item.modelType} value={item.modelType}>
                  {item.modelType}
                </option>
              ))}
            </select>
          </div>
          <div className="input-row">
            <label htmlFor="walkInput">{inputLabels.walk}</label>
            <select
              id="walkInput"
              onChange={handleWalk}
              onKeyDown={handleEnterKey}
              value={walk}
            >
              {Object.keys(walks).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="input-row start">
            <label htmlFor="clampTop">{inputLabels.clampTop}</label>
            <input
              autoComplete="off"
              checked={clampTop}
              id="clampTop"
              onChange={handleClampTop}
              onKeyDown={handleEnterKey}
              type="checkbox"
            />
            <label htmlFor="clampBottom">{inputLabels.clampBottom}</label>
            <input
              autoComplete="off"
              checked={clampBottom}
              id="clampBottom"
              onChange={handleClampBottom}
              onKeyDown={handleEnterKey}
              type="checkbox"
            />
          </div>
          <div className="input-row">
            <label htmlFor="volInput">{inputLabels.vol}</label>
            <input
              autoComplete="off"
              className="input-number"
              id="volInput"
              max="1"
              min="0"
              onChange={handleVol}
              onKeyDown={handleEnterKey}
              step={volStep}
              type="number"
              value={volatility}
            />
          </div>
          <div className="input-row">
            <label htmlFor="sampleInput">{inputLabels.samples}</label>
            <input
              autoComplete="off"
              className="input-number"
              id="sampleInput"
              max="10000"
              min="1000"
              onChange={handleSamples}
              onKeyDown={handleEnterKey}
              type="number"
              value={samples}
            />
          </div>
          <div className="input-row">
            <label htmlFor="numberInput">{inputLabels.epoch}</label>
            <input
              autoComplete="off"
              className="input-number"
              id="numberInput"
              max="100"
              min="1"
              onChange={handleEpoch}
              onKeyDown={handleEnterKey}
              type="number"
              value={epochCount}
            />
            {epochLength}
          </div>
          <div className="input-row">{dataPointCount}</div>
        </fieldset>
        <fieldset className="group">
          <legend>{fieldLabels.drawdown}</legend>
          <div className="input-row">
            <label htmlFor="totalBitcoin">{inputLabels.totalBitcoin}</label>
            <input
              autoComplete="off"
              className="input-number"
              id="totalBitcoin"
              min="0"
              onChange={handleBtc}
              onKeyDown={handleEnterKey}
              step="1"
              type="number"
              value={bitcoin}
            />
          </div>
          <div className="input-row">
            <label htmlFor="costOfLiving">{inputLabels.costOfLiving}</label>
            <input
              autoComplete="off"
              className="input-number"
              id="costOfLiving"
              min="0"
              onChange={handleCostOfLiving}
              onKeyDown={handleEnterKey}
              step="10000"
              type="number"
              value={costOfLiving}
            />
          </div>
          <div className="input-row">
            <label htmlFor="inflation">{inputLabels.inflation}</label>
            <input
              autoComplete="off"
              className="input-number"
              id="inflation"
              onChange={handleInflation}
              onKeyDown={handleEnterKey}
              step="1"
              type="number"
              value={inflation}
            />
          </div>
          <div className="input-row">
            <label htmlFor="distroDate">{inputLabels.distroDate}</label>
            <input
              autoComplete="off"
              id="distroDate"
              min={new Date().toISOString().split("T")[0]}
              onChange={handleDistroDate}
              onKeyDown={handleEnterKey}
              type="date"
              value={new Date(distroDate).toISOString().split("T")[0]}
            />
          </div>
        </fieldset>
        <fieldset className="group">
          <legend>{fieldLabels.graph}</legend>

          <fieldset className="wide group">
            <legend>{fieldLabels.render}</legend>
            <div className="input-row">
              <label htmlFor="renderWalk">{inputLabels.renderWalk}</label>
              <input
                autoComplete="off"
                checked={renderWalk}
                id="renderWalk"
                onChange={handleRenderWalk}
                onKeyDown={handleEnterKey}
                type="checkbox"
              />
            </div>
            <div className="input-row">
              <label htmlFor="renderDrawdown">
                {inputLabels.renderDrawdown}
              </label>
              <input
                autoComplete="off"
                checked={renderDrawdown}
                id="renderDrawdown"
                onChange={handleRenderDrawdown}
                onKeyDown={handleEnterKey}
                type="checkbox"
              />
            </div>
            <div className="input-row">
              <label htmlFor="renderExpenses">
                {inputLabels.renderExpenses}
              </label>
              <input
                autoComplete="off"
                checked={renderExpenses}
                id="renderExpenses"
                onChange={handleRenderExpenses}
                onKeyDown={handleEnterKey}
                type="checkbox"
              />
            </div>
            <div className="input-row">
              <label htmlFor="renderModelMax">
                {inputLabels.renderModelMax}
              </label>
              <input
                autoComplete="off"
                checked={renderModelMax}
                id="renderModelMax"
                onChange={handleRenderModelMax}
                onKeyDown={handleEnterKey}
                type="checkbox"
              />
            </div>
            <div className="input-row">
              <label htmlFor="renderModelMin">
                {inputLabels.renderModelMin}
              </label>
              <input
                autoComplete="off"
                checked={renderModelMin}
                id="renderModelMin"
                onChange={handleRenderModelMin}
                onKeyDown={handleEnterKey}
                type="checkbox"
              />
            </div>
            <div className="input-row">
              <label htmlFor="renderDistro">{inputLabels.renderDistro}</label>
              <input
                autoComplete="off"
                checked={renderDistro}
                id="renderDistro"
                onChange={handleRenderDistro}
                onKeyDown={handleEnterKey}
                type="checkbox"
              />
            </div>
            <div className="input-row">
              <label htmlFor="renderQuantile">
                {inputLabels.renderQuantile}
              </label>
              <input
                autoComplete="off"
                checked={renderQuantile}
                id="renderQuantile"
                onChange={handleRenderQuantile}
                onKeyDown={handleEnterKey}
                type="checkbox"
              />
            </div>
          </fieldset>
          <div className="input-row">
            <label htmlFor="sampleRenderInput">
              {inputLabels.samplesToRender}
            </label>
            <input
              autoComplete="off"
              className="input-number"
              id="sampleRenderInput"
              max="100"
              onChange={handleSamplesToRender}
              onKeyDown={handleEnterKey}
              type="number"
              value={samplesToRender}
            />
          </div>
        </fieldset>
      </div>
      {escapeVelocity}
      <Line data={dataProperties} options={options} />
      <ForkUs />
    </div>
  );
};

export default StochasticGraph;
