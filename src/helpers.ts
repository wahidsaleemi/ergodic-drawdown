import { type HalvingData, type PriceModel } from "./types";

// eslint-disable-next-line functional/functional-parameters
export const weeksSinceLastHalving = (
  dates: Record<number, number>,
): number => {
  const currentDate = new Date();
  let mostRecentHalvingDate = new Date(0);

  for (const [, timestamp] of Object.entries(dates)) {
    const halvingDate = new Date(timestamp * 1000);
    if (halvingDate <= currentDate && halvingDate > mostRecentHalvingDate) {
      mostRecentHalvingDate = halvingDate;
    }
  }

  const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  const timeDifference =
    currentDate.getTime() - mostRecentHalvingDate.getTime();
  return Math.floor(timeDifference / millisecondsPerWeek);
};
export const calculateHalvings = (currentHeight: number): number[] => {
  const halvingInterval = 210_000;
  const count = Math.floor(currentHeight / halvingInterval);
  return Array.from(
    { length: count },
    (_, index) => (index + 1) * halvingInterval,
  );
};

// eslint-disable-next-line functional/functional-parameters
export const loadHalvings = (): HalvingData => {
  const halvings = localStorage.getItem("halvings");
  return halvings === null ? {} : (JSON.parse(halvings) as HalvingData);
};

export const saveHalvings = (halvings: HalvingData): void => {
  localStorage.setItem("halvings", JSON.stringify(halvings));
};

export const getStartingPriceNormalized = (
  model: PriceModel,
  currentBitcoinPrice: number,
  week = 0,
  currentBitcoinBlock = 0,
): number => {
  const min = model.minPrice({
    currentBitcoinBlock,
    currentBitcoinPrice,
    week,
  });
  const max = model.maxPrice({
    currentBitcoinBlock,
    currentBitcoinPrice,
    week,
  });

  return (currentBitcoinPrice - min) / (max - min);
};

const oneWeek = 1000 * 60 * 60 * 24 * 7;

export const applyModel = (
  normalizedPrices: number[],
  model: PriceModel,
  startDate = Date.now(),
  startIndex = 0,
  currentBitcoinBlock = 0,
  currentBitcoinPrice = 50_000,
): Array<{ x: number; y: number }> =>
  normalizedPrices.map((price, index) => {
    const week = index + startIndex;
    const min = model.minPrice({
      currentBitcoinBlock,
      currentBitcoinPrice,
      week,
    });
    const max = model.maxPrice({
      currentBitcoinBlock,
      currentBitcoinPrice,
      week,
    });

    return {
      x: startDate + index * oneWeek,
      y: price >= 0 ? min + price * (max - min) : min * 10 ** price,
    };
  });

export const seededRandom = (seed: number): number => {
  let t = seed + 0x6d_2b_79_f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
};

export const generateColor = (index: number): string => {
  if (index === 0) return "rgb(246, 145, 50)";
  let temporary = index;
  // eslint-disable-next-line functional/functional-parameters
  const random = (): number => seededRandom((temporary += 0x6d_2b_79_f5));
  const red = Math.floor(random() * 256);
  const green = Math.floor(random() * 256);
  const blue = Math.floor(random() * 256);

  return `rgb(${red}, ${green}, ${blue})`;
};

export const quantile = (array: number[], percent: number): number => {
  if (array.length === 0) return 0;
  if (percent === 0) return array[0];
  if (percent === 1) return array.at(-1) ?? 0;
  const id = array.length * percent - 1;
  // eslint-disable-next-line security/detect-object-injection
  if (id === Math.floor(id)) return (array[id] + array[id + 1]) / 2;
  return array[Math.ceil(id)];
};

// eslint-disable-next-line functional/functional-parameters
export const timeout = async (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));
