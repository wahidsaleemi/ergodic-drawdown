/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair */
/* eslint-disable unicorn/prefer-spread */
/* eslint-disable security/detect-object-injection */
import "./App.css";
import "chartjs-adapter-date-fns";

import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useMemo, useState } from "react";

import { getInterimWeeklyData } from "./api";
import marketData from "./bitcoin_weekly_prices_transformed_2.json";
import Chart from "./chart";
import { fieldLabels } from "./content";
import useDebounce from "./debounce";
import { loadHalvings } from "./helpers";
import ClampInput from "./input/clamp";
import EpochInput from "./input/epoch";
import ModelInput from "./input/model";
import SampleInput from "./input/samples";
import VolInput from "./input/volatility";
import WalkInput from "./input/walk";
import { models } from "./models";
import { type DatasetList } from "./types";
import halvingWorker from "./workers/halving-worker";

const marketDataset = {
  borderColor: "rgb(246, 145, 50)",
  borderWidth: 0.5,
  data: marketData,
  label: `Bitcoin Historic Price`,
  pointRadius: 0,
  tension: 0,
};

const defaultHalving = {
  currentBlock: 0,
  halvings: loadHalvings(),
};

const StochasticGraph = (): React.ReactNode => {
  console.time("one render");
  // Panel 1
  const [model, setModel] = useState<string>(models[2].modelType);
  const debouncedModel = useDebounce<string>(model, 300);
  const [walk, setWalk] = useState<string>("Bubble");
  const debouncedWalk = useDebounce<string>(walk, 300);
  const [clampTop, setClampTop] = useState<boolean>(false);
  const debouncedClampTop = useDebounce<boolean>(clampTop, 300);
  const [clampBottom, setClampBottom] = useState<boolean>(false);
  const debouncedClampBottom = useDebounce<boolean>(clampBottom, 300);
  const [volatility, setVolatility] = useState<number>(0.1);
  const debouncedVolatility = useDebounce<number>(volatility, 300);
  const [samples, setSamples] = useState<number | undefined>(1000);
  const debouncedSamples = useDebounce<number | undefined>(samples, 300);
  const [epochCount, setEpochCount] = useState<number>(10);
  const debouncedEpoch = useDebounce<number>(epochCount, 300);

  const { data: interim = [] } = useQuery({
    queryFn: getInterimWeeklyData,
    queryKey: ["interim"],
  });

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

  const { data: { currentBlock, halvings } = defaultHalving } = useQuery({
    placeholderData: defaultHalving,
    queryFn: halvingWorker,
    queryKey: ["halving"],
    staleTime: Infinity,
  });

  const dataProperties = useMemo(
    () =>
      ({
        datasets: [marketDataset, interimDataset],
      }) satisfies { datasets: DatasetList },
    [interimDataset],
  );

  const fullLoading = useCallback(() => {
    // setLoadingData(true);
    // setLoading(true);
  }, []);

  console.timeEnd("one render");
  return (
    <div className="container">
      <div className="section">
        <fieldset className="group">
          <legend>{fieldLabels.model}</legend>
          <ModelInput
            model={model}
            setLoading={fullLoading}
            setModel={setModel}
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
        </fieldset>
      </div>
      <Chart
        dataProperties={dataProperties}
        halvings={halvings}
        lifecycleRender="lastLoaded"
      />
    </div>
  );
};

export default StochasticGraph;
