/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair */
/* eslint-disable security/detect-object-injection */
/* eslint-disable unicorn/prefer-spread */
import hashSum from "hash-sum";

import { WEEKS_PER_EPOCH } from "../constants";
import {
  applyModel,
  normalizePrice,
  timeout,
  weeksSinceLastHalving,
} from "../helpers";
import { modelMap } from "../models";
import { type Full, type Part, type PriceData } from "../types";
import { walks } from "../walks";

const signalState = { aborted: false };

const SUSPEND_CONTROL = 50;

let previousSimPath = "";
let previousAdjustPath = "";
let data: PriceData = [];

const simulationWorker = async (
  simPath: string,
  adjustPath: string,
  {
    clampBottom,
    clampTop,
    minMaxMultiple,
    model,
    now,
    variable,
    volatility,
    walk,
  }: Full,
  { currentBlock, currentPrice, epochCount, halvings, samples }: Part,
  signal: AbortSignal,
): Promise<[string, PriceData]> => {
  const id = hashSum(Math.random());
  signalState.aborted = false;

  // eslint-disable-next-line functional/functional-parameters
  const AbortAction = (): void => {
    signal.removeEventListener("abort", AbortAction);
    console.warn("Aborted", id);
    signalState.aborted = true;
  };

  signal.addEventListener("abort", AbortAction);

  const mapped = modelMap[model];
  const walking = walks[walk];
  const lastHalving = weeksSinceLastHalving(halvings);

  if (previousSimPath === previousAdjustPath || simPath !== previousSimPath) {
    previousSimPath = simPath;
    console.time("simulation" + id);
    const graphs: PriceData = [];
    const startingPrice = normalizePrice({
      currentBlock,
      currentPrice,
      minMaxMultiple,
      model: mapped,
      now,
      priceToNormalize: currentPrice,
      variable,
    });
    for (let index = 0; index < samples; index++) {
      let innerGraph: number[] = [];
      if (index % SUSPEND_CONTROL === 0) await timeout();
      for (let innerIndex = 0; innerIndex < epochCount; innerIndex++) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (signalState.aborted) {
          console.timeEnd("simulation" + id);
          return [id, []];
        } else {
          // console.log("loop sim", now);
        }
        const options = {
          clampBottom,
          clampTop,
          start: innerGraph.at(-1) ?? startingPrice,
          startDay: innerGraph.length === 0 ? lastHalving : 0,
          volatility,
        };
        const stuff = walking(options);
        innerGraph = innerGraph.concat(stuff);
      }
      graphs.push(
        applyModel({
          currentBlock,
          currentPrice,
          minMaxMultiple,
          model: mapped,
          normalizedPrices: innerGraph,
          now,
          variable,
        }),
      );
    }
    console.timeEnd("simulation" + id);
    data = graphs;
    signal.removeEventListener("abort", AbortAction);
    return [id, graphs];
    // eslint-disable-next-line unicorn/no-negated-condition
  } else if (previousAdjustPath !== adjustPath) {
    console.time("adjustment");
    previousAdjustPath = adjustPath;
    if (samples === data.length) {
      const GTcurrant = data[0].length / WEEKS_PER_EPOCH >= epochCount;
      const LTnext = data[0].length / WEEKS_PER_EPOCH < epochCount;
      if (GTcurrant && LTnext) {
        console.timeEnd("adjustment");
        signal.removeEventListener("abort", AbortAction);
        return [id, data];
      } else if (GTcurrant && !LTnext) {
        const last = -(data[0].length - epochCount * WEEKS_PER_EPOCH);
        const newData = data.map((sample) => sample.slice(0, last));
        console.timeEnd("adjustment");
        signal.removeEventListener("abort", AbortAction);
        data = newData;
        return [id, newData];
      } else if (!GTcurrant && LTnext) {
        const newData: PriceData = [];
        let count = 0;
        for (const sample of data) {
          if (count++ % SUSPEND_CONTROL === 0) await timeout();
          const previousSample = sample.at(-1);
          const normalizedPrice = normalizePrice({
            currentBlock,
            currentPrice,
            minMaxMultiple,
            model: mapped,
            now,
            priceToNormalize: previousSample ?? currentPrice,
            variable,
            week: sample.length,
          });
          let newEpoch = walking({
            clampBottom,
            clampTop,
            start: normalizedPrice,
            startDay: sample.length === 0 ? lastHalving : 1,
            volatility,
          });
          while (
            Math.ceil((sample.length + newEpoch.length) / WEEKS_PER_EPOCH) <
            epochCount
          ) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (signalState.aborted) {
              console.timeEnd("adjustment");
              return [id, []];
            } else {
              // console.log("adjustment loop 1");
            }
            const newWalk = walking({
              clampBottom,
              clampTop,
              start: newEpoch.at(-1) ?? 0,
              startDay: 0,
              volatility,
            });
            newEpoch = newEpoch.concat(newWalk);
          }
          const modelApplied = applyModel({
            currentBlock,
            currentPrice,
            minMaxMultiple,
            model: mapped,
            normalizedPrices: newEpoch,
            now,
            startIndex: sample.length,
            variable,
          });

          const newSample = new Float64Array(
            sample.length + modelApplied.length,
          );
          newSample.set(sample);
          newSample.set(modelApplied, sample.length);
          newData.push(newSample);
        }
        console.timeEnd("adjustment");
        signal.removeEventListener("abort", AbortAction);
        data = newData;
        return [id, newData];
      }
    } else if (samples > data.length) {
      const additionalData: PriceData = [];
      const startingPrice = normalizePrice({
        currentBlock,
        currentPrice,
        minMaxMultiple,
        model: mapped,
        now,
        priceToNormalize: currentPrice,
        variable,
      });

      for (let index = data.length; index < samples; index++) {
        if (index % SUSPEND_CONTROL === 0) await timeout();
        let innerGraph: number[] = [];
        for (let innerIndex = 0; innerIndex < epochCount; innerIndex++) {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (signalState.aborted) {
            console.timeEnd("adjustment");
            return [id, []];
          } else {
            // console.log("adjustment loop 2");
          }
          const stuff = walking({
            clampBottom,
            clampTop,
            start: innerGraph.at(-1) ?? startingPrice,
            startDay: innerGraph.length === 0 ? lastHalving : 0,
            volatility,
          });
          innerGraph = innerGraph.concat(stuff);
        }
        additionalData.push(
          applyModel({
            currentBlock,
            currentPrice,
            minMaxMultiple,
            model: mapped,
            normalizedPrices: innerGraph,
            now,
            variable,
          }),
        );
      }
      const finalData = data.concat(additionalData);
      data = finalData;
      signal.removeEventListener("abort", AbortAction);
      console.timeEnd("adjustment");
      return [id, finalData];
    } else if (samples < data.length) {
      const finalData = data.slice(0, samples);
      data = finalData;
      signal.removeEventListener("abort", AbortAction);
      console.timeEnd("adjustment");
      return [id, finalData];
    }
  }
  console.error("you should never get this...");
  return [id, []];
};

export default simulationWorker;
