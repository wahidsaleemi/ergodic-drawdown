/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair */
/* eslint-disable unicorn/prefer-spread */
/* eslint-disable security/detect-object-injection */
import "./App.css";
import "chartjs-adapter-date-fns";

import { useQuery } from "@tanstack/react-query";
import hashSum from "hash-sum";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getCurrentPrice, getInterimWeeklyData } from "./api";
import Lightning1 from "./assets/lightning1.svg?react";
import marketData from "./bitcoin_weekly_prices_transformed_2.json";
import {
  isMobile,
  MS_PER_WEEK,
  MS_PER_YEAR,
  WEEKS_PER_YEAR,
} from "./constants";
import { bitcoinColor, fieldLabels, legal, pay, title } from "./content";
import useDebounce from "./debounce";
import ForkUs from "./fork-us";
import { generateColor, loadHalvings } from "./helpers";
import HowTo from "./how-to";
import BitcoinInput from "./input/bitcoin";
import ClampInput from "./input/clamp";
import CostOfLivingInput from "./input/cost-of-living";
import DrawdownDateInput from "./input/drawdown-date";
import EpochInput from "./input/epoch";
import InflationInput from "./input/inflation";
import ModelInput from "./input/model";
import RenderDrawdownNormalInput from "./input/render-drawdown-normal";
import RenderDrawdownQuantileInput from "./input/render-drawdown-quantile";
import RenderDrawdownWalksInput from "./input/render-drawdown-walks";
import RenderExpensesInput from "./input/render-expenses";
import RenderModelMaxInput from "./input/render-model-max";
import RenderModelMinInput from "./input/render-model-min";
import RenderPriceNormalInput from "./input/render-price-noraml";
import RenderPriceQuantileInput from "./input/render-price-quantile";
import RenderPriceWalkInput from "./input/render-price-walks";
import RenderSampleCount from "./input/render-sample-count";
import SampleInput from "./input/samples";
import VolInput from "./input/volatility";
import WalkInput from "./input/walk";
import { modelMap, models } from "./models";
import { type Data, type DatasetList } from "./types";
import drawdownNormalDistributionWorker from "./workers/drawdown-normal-worker";
import drawdownQuantileWorker from "./workers/drawdown-quantile-worker";
import halvingWorker from "./workers/halving-worker";
import priceNormalDistributionWorker from "./workers/price-normal-worker";
import priceQuantileWorker from "./workers/price-quantile-worker";
import simulationWorker from "./workers/simulation-worker";
import volumeWorker from "./workers/volume-worker";

const Chart = React.lazy(async () => import("./chart"));

const marketDataset = {
  borderColor: "rgb(246, 145, 50)",
  borderWidth: 0.5,
  data: marketData,
  label: `Bitcoin Historic Price`,
  pointRadius: 0,
  tension: 0,
};

const loadedHalvings = loadHalvings();

const defaultHalving = {
  currentBlock: 0,
  halvings: loadedHalvings,
};

const reward = 50 / 2 ** Object.keys(loadedHalvings).length;

const DEBOUNCE = 200;

const StochasticGraph = (): React.ReactNode => {
  console.time("one render");

  // State
  const [priceData, setPriceData] = useState<Data>([]);
  const [priceQuantile, setPriceQuantile] = useState<DatasetList>([]);
  const [priceNormal, setPriceNormal] = useState<DatasetList>([]);
  const [volumeData, setVolumeData] = useState<Data>([]);
  const [volumeQuantile, setVolumeQuantile] = useState<DatasetList>([]);
  const [volumeNormal, setVolumeNormal] = useState<DatasetList>([]);
  const [zero, setZero] = useState<number>(0);
  const [average, setAverage] = useState<number | undefined>();
  const [median, setMedian] = useState<number | undefined>();
  const [loadingPriceData, setLoadingPriceData] = useState<boolean>(true);
  const [loadingVolumeData, setLoadingVolumeData] = useState<boolean>(true);

  // Panel 1
  const [model, setModel] = useState<string>(models[2].modelType);
  const debouncedModel = useDebounce<string>(model, DEBOUNCE);
  const [variable, setVariable] = useState<number>(0);
  const debouncedVariable = useDebounce<number>(variable, DEBOUNCE);
  const [walk, setWalk] = useState<string>("Bubble");
  const debouncedWalk = useDebounce<string>(walk, DEBOUNCE);
  const [clampTop, setClampTop] = useState<boolean>(false);
  const debouncedClampTop = useDebounce<boolean>(clampTop, DEBOUNCE);
  const [clampBottom, setClampBottom] = useState<boolean>(false);
  const debouncedClampBottom = useDebounce<boolean>(clampBottom, DEBOUNCE);
  const [volatility, setVolatility] = useState<number>(0.1);
  const debouncedVolatility = useDebounce<number>(volatility, DEBOUNCE);
  const [samples, setSamples] = useState<number>(1000);
  const debouncedSamples = useDebounce<number>(samples, DEBOUNCE);
  const [epochCount, setEpochCount] = useState<number>(10);
  const debouncedEpoch = useDebounce<number>(epochCount, DEBOUNCE);

  // Panel 2
  const [bitcoin, setBitcoin] = useState<number>(reward);
  const debouncedBitcoin = useDebounce<number>(bitcoin, DEBOUNCE);
  const [costOfLiving, setCostOfLiving] = useState<number>(100_000);
  const debouncedCostOfLiving = useDebounce<number>(costOfLiving, DEBOUNCE);
  const [inflation, setInflation] = useState<number>(8);
  const debouncedInflation = useDebounce<number>(inflation, DEBOUNCE);
  const [drawdownDate, setDrawdownDate] = useState(
    Date.now() + 8 * MS_PER_YEAR,
  );
  const debouncedDrawdownDate = useDebounce<number>(drawdownDate, DEBOUNCE);

  // Panel 3
  const [renderPriceWalks, setRenderPriceWalks] = useState<boolean>(false);
  const debouncedRenderWalk = useDebounce<boolean>(renderPriceWalks, DEBOUNCE);
  const [renderPriceQuantile, setRenderPriceQuantile] = useState<boolean>(true);
  const debouncedRenderPriceQuantile = useDebounce<boolean>(
    renderPriceQuantile,
    DEBOUNCE,
  );
  const [renderPriceNormal, setRenderPriceNormal] = useState<boolean>(false);
  const debouncedRenderPriceNormal = useDebounce<boolean>(
    renderPriceNormal,
    DEBOUNCE,
  );
  const [renderDrawdown, setRenderDrawdown] = useState<boolean>(false);
  const debouncedRenderDrawdown = useDebounce<boolean>(
    renderDrawdown,
    DEBOUNCE,
  );
  const [renderExpenses, setRenderExpenses] = useState<boolean>(true);
  const debouncedRenderExpenses = useDebounce<boolean>(
    renderExpenses,
    DEBOUNCE,
  );
  const [renderModelMax, setRenderModelMax] = useState<boolean>(true);
  const debouncedRenderModelMax = useDebounce<boolean>(
    renderModelMax,
    DEBOUNCE,
  );
  const [renderModelMin, setRenderModelMin] = useState<boolean>(true);
  const debouncedRenderModelMin = useDebounce<boolean>(
    renderModelMin,
    DEBOUNCE,
  );
  const [renderNormal, setRenderNormal] = useState<boolean>(false);
  const debouncedRenderNormal = useDebounce<boolean>(renderNormal, DEBOUNCE);
  const [renderQuantile, setRenderQuantile] = useState<boolean>(true);
  const debouncedRenderQuantile = useDebounce<boolean>(
    renderQuantile,
    DEBOUNCE,
  );
  const [samplesToRender, setSamplesToRender] = useState<number | undefined>(
    isMobile() ? 1 : 10,
  );
  const debouncedSamplesToRender = useDebounce<number | undefined>(
    samplesToRender,
    DEBOUNCE,
  );

  const { data: interim = [] } = useQuery({
    queryFn: getInterimWeeklyData,
    queryKey: ["interim"],
  });

  const interimDataset = useMemo(
    () => ({
      borderColor: bitcoinColor,
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

  const { data: { currentBlock, halvings } = defaultHalving } = useQuery({
    placeholderData: defaultHalving,
    queryFn: halvingWorker,
    queryKey: ["halving"],
    staleTime: Infinity,
  });

  const { data: currentPrice = 0 } = useQuery({
    placeholderData: 0,
    queryFn: async () => {
      const newPrice = await getCurrentPrice();
      return newPrice.close;
    },
    queryKey: ["currentPrice"],
    staleTime: Infinity,
  });

  // *******
  // BTC PRICE
  // *******

  useEffect(() => {
    if (currentPrice === 0 || currentBlock === 0) return;
    const abortController = new AbortController();
    const { signal } = abortController;
    const simPath = hashSum({
      debouncedClampBottom,
      debouncedClampTop,
      debouncedModel,
      debouncedVariable,
      debouncedVolatility,
      debouncedWalk,
    });
    const adjustPath = hashSum({
      currentBlock,
      currentPrice,
      debouncedEpoch,
      debouncedSamples,
      halvings,
    });
    simulationWorker(
      simPath,
      adjustPath,
      {
        clampBottom: debouncedClampBottom,
        clampTop: debouncedClampTop,
        currentBlock,
        currentPrice,
        epochCount: debouncedEpoch,
        halvings,
        model: debouncedModel,
        samples: debouncedSamples,
        variable: debouncedVariable,
        volatility: debouncedVolatility,
        walk: debouncedWalk,
      },
      signal,
    )
      .then(([id, newData]) => {
        if (signal.aborted || newData.length === 0) {
          console.log("Aborted not setting price state....", id);
        } else {
          console.log("Setting price state....", id);
          setPriceData(newData);
          if (!debouncedRenderPriceNormal) setPriceNormal([]);
          if (!debouncedRenderPriceQuantile) setPriceQuantile([]);
          if (!debouncedRenderQuantile) setVolumeQuantile([]);
          if (!debouncedRenderNormal) setVolumeNormal([]);
          setLoadingPriceData(false);
        }
        return "success";
      })
      .catch(console.error);
    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentBlock,
    currentPrice,
    debouncedClampBottom,
    debouncedClampTop,
    debouncedEpoch,
    debouncedModel,
    debouncedSamples,
    debouncedVariable,
    debouncedVolatility,
    debouncedWalk,
    halvings,
  ]);

  const priceWalkDatasets: DatasetList = useMemo(
    () =>
      debouncedSamplesToRender === undefined
        ? []
        : priceData.slice(0, debouncedSamplesToRender).map((graph, index) => ({
            borderColor: generateColor(index),
            borderWidth: 0.5,
            data: graph,
            label: `Potential Bitcoin Price (${index})`,
            pointRadius: 0,
            tension: 0,
          })),
    [priceData, debouncedSamplesToRender],
  );

  useEffect(() => {
    if (priceData.length === 0 || !debouncedRenderPriceQuantile) return;
    const abortController = new AbortController();
    const { signal } = abortController;

    priceQuantileWorker(priceData, signal)
      .then(([id, newData]) => {
        if (signal.aborted || newData === undefined) {
          console.log("Aborted price quantile not setting state....", id);
        } else {
          console.log("Setting price quantile state....", id);
          setPriceQuantile(newData);
        }
        return "success";
      })
      .catch(console.error);
    return () => {
      abortController.abort();
    };
  }, [priceData, debouncedRenderPriceQuantile]);

  useEffect(() => {
    if (priceData.length === 0 || !debouncedRenderPriceNormal) return;
    const abortController = new AbortController();
    const { signal } = abortController;

    priceNormalDistributionWorker(priceData, signal)
      .then(([id, newData]) => {
        if (signal.aborted || newData === undefined) {
          console.log("Aborted price normal not setting state....", id);
        } else {
          console.log("Setting price normal state....", id);
          setPriceNormal(newData);
        }
        return "success";
      })
      .catch(console.error);
    return () => {
      abortController.abort();
    };
  }, [priceData, debouncedRenderPriceNormal]);

  const minModelDataset = useMemo(() => {
    if (!debouncedRenderModelMin) return [];
    return [
      {
        borderColor: "green",
        borderWidth: 0.5,
        data: (priceData[0] ?? []).map((item, index) => ({
          x: item.x,
          y: modelMap[debouncedModel].minPrice({
            currentBlock,
            currentPrice,
            variable: debouncedVariable,
            week: index,
          }),
        })),
        label: `Model Min Value`,
        pointRadius: 0,
        tension: 0,
      },
    ] satisfies DatasetList;
  }, [
    currentBlock,
    currentPrice,
    debouncedModel,
    debouncedRenderModelMin,
    debouncedVariable,
    priceData,
  ]);

  const maxModelDataset = useMemo(() => {
    if (!debouncedRenderModelMax) return [];
    return [
      {
        borderColor: "red",
        borderWidth: 0.5,
        data: (priceData[0] ?? []).map((item, index) => ({
          x: item.x,
          y: modelMap[debouncedModel].maxPrice({
            currentBlock,
            currentPrice,
            variable: debouncedVariable,
            week: index,
          }),
        })),
        label: `Model Max Value`,
        pointRadius: 0,
        tension: 0,
      },
    ] satisfies DatasetList;
  }, [
    currentBlock,
    currentPrice,
    debouncedModel,
    debouncedRenderModelMax,
    debouncedVariable,
    priceData,
  ]);

  // *******
  // BTC VOLUME
  // *******

  useEffect(() => {
    if (priceData.length === 0) return;
    const abortController = new AbortController();
    const { signal } = abortController;

    volumeWorker(
      {
        bitcoin: debouncedBitcoin,
        costOfLiving: debouncedCostOfLiving,
        data: priceData,
        drawdownDate: debouncedDrawdownDate,
        inflation: debouncedInflation,
      },
      signal,
    )
      .then(([id, newData]) => {
        if (signal.aborted || newData === undefined) {
          console.log("Aborted volume not setting state....", id);
        } else {
          console.log("Setting volume state....", id);
          setVolumeData(newData.volumeDataset);
          setZero(newData.zero);
          setAverage(newData.average);
          setMedian(newData.median);
          if (!debouncedRenderQuantile) setVolumeQuantile([]);
          if (!debouncedRenderNormal) setVolumeNormal([]);
          setLoadingVolumeData(false);
        }
        return "success";
      })
      .catch(console.error);
    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedBitcoin,
    debouncedCostOfLiving,
    debouncedDrawdownDate,
    debouncedInflation,
    priceData,
  ]);

  const drawdownWalkDatasets: DatasetList = useMemo(
    () =>
      debouncedSamplesToRender === undefined
        ? []
        : volumeData.slice(0, debouncedSamplesToRender).map((graph, index) => ({
            borderColor: generateColor(index),
            borderWidth: 1,
            data: graph,
            label: `BTC Amount (${index})`,
            pointRadius: 0,
            tension: 0,
            yAxisID: "y1",
          })),
    [debouncedSamplesToRender, volumeData],
  );

  useEffect(() => {
    if (volumeData.length === 0 || !debouncedRenderNormal) return;
    const abortController = new AbortController();
    const { signal } = abortController;

    drawdownNormalDistributionWorker(volumeData, signal)
      .then(([id, newData]) => {
        if (signal.aborted || newData === undefined) {
          console.log("Aborted volume normal not setting state....", id);
        } else {
          console.log("Setting volume normal state....", id);
          setVolumeNormal(newData);
        }
        return "success";
      })
      .catch(console.error);
    return () => {
      abortController.abort();
    };
  }, [volumeData, debouncedRenderNormal]);

  useEffect(() => {
    if (volumeData.length === 0 || !debouncedRenderQuantile) return;
    const abortController = new AbortController();
    const { signal } = abortController;

    drawdownQuantileWorker(volumeData, signal)
      .then(([id, newData]) => {
        if (signal.aborted || newData === undefined) {
          console.log("Aborted quantile not setting state....", id);
        } else {
          console.log("Setting quantile state....", id);
          setVolumeQuantile(newData);
        }
        return "success";
      })
      .catch(console.error);
    return () => {
      abortController.abort();
    };
  }, [volumeData, debouncedRenderQuantile]);

  const costOfLivingDataset = useMemo(() => {
    if (priceData.length === 0) return [];
    const now = Date.now();
    const weeklyInflationRate =
      (1 + debouncedInflation / 100) ** (1 / WEEKS_PER_YEAR) - 1;
    let weeklyCostOfLiving = debouncedCostOfLiving / WEEKS_PER_YEAR;
    const dataPoints = (priceData[0] ?? []).map((_, index) => {
      if (index !== 0) weeklyCostOfLiving *= 1 + weeklyInflationRate;
      const x = now + index * MS_PER_WEEK;
      const y = weeklyCostOfLiving * WEEKS_PER_YEAR;
      return { x, y };
    });

    return [
      {
        borderColor: "magenta",
        borderDash: [5, 5],
        borderWidth: 1,
        data: dataPoints,
        label: `Weekly Adjusted Cost of Living Annualized`,
        pointRadius: 0,
        tension: 0,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCostOfLiving, debouncedInflation, (priceData[0] ?? []).length]);

  const dataProperties = useMemo(
    () =>
      ({
        datasets: [
          marketDataset,
          interimDataset,
          ...(debouncedRenderWalk ? priceWalkDatasets : []),
          ...(debouncedRenderPriceQuantile ? priceQuantile : []),
          ...(debouncedRenderModelMin ? minModelDataset : []),
          ...(debouncedRenderModelMax ? maxModelDataset : []),
          ...(debouncedRenderDrawdown ? drawdownWalkDatasets : []),
          ...(debouncedRenderQuantile ? volumeQuantile : []),
          ...(debouncedRenderNormal ? volumeNormal : []),
          ...(debouncedRenderExpenses ? costOfLivingDataset : []),
          ...(debouncedRenderPriceNormal ? priceNormal : []),
        ],
      }) satisfies { datasets: DatasetList },
    [
      interimDataset,
      debouncedRenderWalk,
      priceWalkDatasets,
      debouncedRenderPriceQuantile,
      priceQuantile,
      debouncedRenderModelMin,
      minModelDataset,
      debouncedRenderModelMax,
      maxModelDataset,
      debouncedRenderDrawdown,
      drawdownWalkDatasets,
      debouncedRenderQuantile,
      volumeQuantile,
      debouncedRenderNormal,
      volumeNormal,
      debouncedRenderExpenses,
      costOfLivingDataset,
      debouncedRenderPriceNormal,
      priceNormal,
    ],
  );

  const using = priceData.length * priceData[0]?.length;
  const memoryUsageMB = (using * 3 * 40) / (1024 * 1024);

  let memoryUsageClass = "";
  if (memoryUsageMB > 1024) {
    memoryUsageClass = "memory-high";
  } else if (memoryUsageMB > 512) {
    memoryUsageClass = "memory-medium";
  }

  const beginning = `(Roughly ${using.toLocaleString()} data points @`;
  const mid = `${memoryUsageMB.toFixed(0)} MB`;
  const end = `)`;

  const dataPointCount = loadingPriceData ? (
    <div className="loader" />
  ) : (
    <>
      <span>{beginning}</span>
      <span className={memoryUsageClass}>{mid}</span>
      <span>{end}</span>
    </>
  );

  const expirationDate = priceWalkDatasets[0]?.data.at(-1);
  const expired =
    expirationDate === undefined
      ? ""
      : `by ${new Date(expirationDate.x).toDateString()}`;

  const escapeVelocity = useMemo(
    () =>
      loadingVolumeData ? (
        <div className="loader" />
      ) : (
        `${(100 - (zero / debouncedSamples) * 100).toFixed(2)}% chance of not exhausting bitcoin holdings ${expired}
        with an average of ${Number.isNaN(average) || average === undefined ? bitcoin : average.toFixed(4)} Bitcoin left (median ${Number.isNaN(median) || median === undefined ? bitcoin : median.toFixed(4)}),
        if drawing down weekly from a ${debouncedBitcoin} bitcoin balance,
        starting ${new Date(debouncedDrawdownDate).toDateString()},
        to meet $${debouncedCostOfLiving.toLocaleString()} of yearly costs (in todays dollars),
        expecting ${debouncedInflation}% inflation per year,
        assuming ${debouncedModel} modeling and a ${debouncedWalk} walk strategy.`
      ),
    [
      loadingVolumeData,
      zero,
      debouncedSamples,
      expired,
      average,
      bitcoin,
      median,
      debouncedBitcoin,
      debouncedDrawdownDate,
      debouncedCostOfLiving,
      debouncedInflation,
      debouncedModel,
      debouncedWalk,
    ],
  );

  const fullLoading = useCallback(() => {
    setLoadingPriceData(true);
    setLoadingVolumeData(true);
  }, []);

  const semiLoading = useCallback(() => {
    setLoadingVolumeData(true);
  }, []);

  console.timeEnd("one render");
  return (
    <div className="container">
      <div className="header">{title}</div>
      <HowTo />
      <div className="section">
        <fieldset className="group">
          <legend>{fieldLabels.model}</legend>
          <ModelInput
            model={model}
            setLoading={fullLoading}
            setModel={setModel}
            setVariable={setVariable}
            variable={variable}
          />
          <WalkInput setLoading={fullLoading} setWalk={setWalk} walk={walk} />
          <ClampInput
            clampBottom={clampBottom}
            clampTop={clampTop}
            setClampBottom={setClampBottom}
            setClampTop={setClampTop}
            setLoading={fullLoading}
          />
          <VolInput
            setLoading={fullLoading}
            setVolatility={setVolatility}
            volatility={volatility}
            walk={walk}
          />
          <SampleInput
            samples={samples}
            setLoading={fullLoading}
            setSamples={setSamples}
          />
          <EpochInput
            epochCount={epochCount}
            setEpochCount={setEpochCount}
            setLoading={fullLoading}
          />
          <div className="input-row stats">{dataPointCount}</div>
        </fieldset>
        <fieldset className="group">
          <legend>{fieldLabels.drawdown}</legend>
          <BitcoinInput
            bitcoin={bitcoin}
            setBitcoin={setBitcoin}
            setLoading={semiLoading}
          />
          <CostOfLivingInput
            costOfLiving={costOfLiving}
            setCostOfLiving={setCostOfLiving}
            setLoading={semiLoading}
          />
          <InflationInput
            inflation={inflation}
            setInflation={setInflation}
            setLoading={semiLoading}
          />
          <DrawdownDateInput
            drawdownDate={drawdownDate}
            now={priceWalkDatasets[0]?.data[0]?.x}
            setDrawdownDate={setDrawdownDate}
            setLoading={semiLoading}
          />
        </fieldset>
        <fieldset className="group">
          <legend>{fieldLabels.graph}</legend>

          <fieldset className="wide start">
            <legend>{fieldLabels.price}</legend>
            <RenderPriceWalkInput
              renderPriceWalks={renderPriceWalks}
              setRenderPriceWalks={setRenderPriceWalks}
            />
            <RenderPriceNormalInput
              renderPriceNormal={renderPriceNormal}
              setRenderPriceNormal={setRenderPriceNormal}
            />
            <RenderPriceQuantileInput
              renderPriceQuantile={renderPriceQuantile}
              setRenderPriceQuantile={setRenderPriceQuantile}
            />
          </fieldset>
          <fieldset className="wide start">
            <legend>{fieldLabels.drawdown}</legend>
            <RenderDrawdownWalksInput
              renderDrawdown={renderDrawdown}
              setRenderDrawdown={setRenderDrawdown}
            />
            <RenderDrawdownNormalInput
              renderNormal={renderNormal}
              setRenderNormal={setRenderNormal}
            />
            <RenderDrawdownQuantileInput
              renderQuantile={renderQuantile}
              setRenderQuantile={setRenderQuantile}
            />
          </fieldset>
          <div className="short start">
            <RenderSampleCount
              disabled={!(renderPriceWalks || renderDrawdown)}
              samplesToRender={samplesToRender}
              setSamplesToRender={setSamplesToRender}
            />
            <RenderExpensesInput
              renderExpenses={renderExpenses}
              setRenderExpenses={setRenderExpenses}
            />
            <RenderModelMaxInput
              renderModelMax={renderModelMax}
              setRenderModelMax={setRenderModelMax}
            />
            <RenderModelMinInput
              renderModelMin={renderModelMin}
              setRenderModelMin={setRenderModelMin}
            />
          </div>
        </fieldset>
      </div>
      <div className="center-text">{escapeVelocity}</div>
      <Suspense fallback={<div className="loader" />}>
        <Chart dataProperties={dataProperties} halvings={halvings} />
      </Suspense>
      <div className="pay-me">
        <Lightning1 />
        <a href="lightning:gildedpleb@getalby.com">{pay}</a>
      </div>
      <ForkUs />
      <div className="legal">{legal}</div>
    </div>
  );
};

export default StochasticGraph;
