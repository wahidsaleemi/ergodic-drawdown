import { fetchBlockByHeight, getCurrentBlockHeight } from "../api";
import { calculateHalvings, loadHalvings, saveHalvings } from "../helpers";
import { type HalvingData, type HalvingWorker } from "../types";

// eslint-disable-next-line functional/functional-parameters
const halvingWorker = async (): Promise<HalvingWorker> => {
  console.time("halving");
  const currentBlockHeight = await getCurrentBlockHeight();
  const neededHalvings = calculateHalvings(currentBlockHeight);
  const storedHalvings = loadHalvings();
  const halvingsToFetch = neededHalvings.filter(
    (height) => !(height.toString() in storedHalvings),
  );
  if (halvingsToFetch.length === 0) {
    console.timeEnd("halving");
    return {
      currentBlock: currentBlockHeight,
      halvings: storedHalvings,
    };
  }
  const fetchPromises = halvingsToFetch.map(async (height) => ({
    [height.toString()]: await fetchBlockByHeight(height),
  }));
  const fetchedDataArrays = await Promise.all(fetchPromises);
  const fetchedHalvings: HalvingData = {};
  for (const dataObject of fetchedDataArrays) {
    const key = Object.keys(dataObject)[0];
    // eslint-disable-next-line security/detect-object-injection
    fetchedHalvings[key] = dataObject[key];
  }
  const knownHalvings = { ...storedHalvings, ...fetchedHalvings };
  saveHalvings(knownHalvings);
  console.timeEnd("halving");

  return { currentBlock: currentBlockHeight, halvings: knownHalvings };
};

export default halvingWorker;
