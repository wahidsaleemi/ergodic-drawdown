import {
  BLOCKS_PER_WEEK,
  BLOCKS_PER_YEAR,
  HALVING_INTERVAL,
  MS_PER_DAY,
  MS_PER_WEEK,
  MS_PER_YEAR,
  WEEKS_PER_YEAR,
} from "./constants";
import { type PriceModel } from "./types";

const memoize = (
  function_: (argument: number) => number,
): ((argument: number) => number) => {
  const cache: Record<string, number> = {};
  return (argument: number): number => {
    if (!(argument in cache)) {
      cache[argument] = function_(argument);
    }
    return cache[argument];
  };
};

const getRewardForHalving = memoize((halvingIndex: number): number => {
  return 50 / 2 ** halvingIndex;
});

const calculateTotalStock = memoize((blockNumber: number): number => {
  let stock = 0;
  const halvingCount = Math.floor(blockNumber / HALVING_INTERVAL);
  for (let index = 0; index < halvingCount; index++)
    stock += HALVING_INTERVAL * getRewardForHalving(index);
  const remainingBlocks = blockNumber % HALVING_INTERVAL;
  stock += remainingBlocks * getRewardForHalving(halvingCount);

  return stock;
});

const calculateOneYearFlow = memoize((blockNumber: number): number => {
  const startBlock = Math.max(0, blockNumber - BLOCKS_PER_YEAR);
  return calculateTotalStock(blockNumber) - calculateTotalStock(startBlock);
});

const stockToFlowModel: PriceModel = {
  maxPrice: ({ currentBitcoinBlock, week }): number => {
    const blockToFind = currentBitcoinBlock + week * BLOCKS_PER_WEEK;
    const stock = calculateTotalStock(blockToFind);
    const flow = calculateOneYearFlow(blockToFind);
    const stockToFlow = stock / flow;
    const basePrice = Math.exp(-1.02) * stockToFlow ** 3.08;
    const confidence = (65 / 100) * basePrice;

    return basePrice + confidence;
  },
  minPrice: ({ currentBitcoinBlock, week }): number => {
    const blockToFind = currentBitcoinBlock + week * BLOCKS_PER_WEEK;
    const stock = calculateTotalStock(blockToFind);
    const flow = calculateOneYearFlow(blockToFind);
    const stockToFlow = stock / flow;
    const basePrice = Math.exp(-1.02) * stockToFlow ** 3.08;
    const confidence = (65 / 100) * basePrice;

    return basePrice - confidence;
  },
  modelType: "Stock-To-Flow (exponential)" as const,
};

const stockToFlowModelNew: PriceModel = {
  maxPrice: ({ currentBitcoinBlock, week }): number => {
    const blockToFind = currentBitcoinBlock + week * BLOCKS_PER_WEEK;
    const stock = calculateTotalStock(blockToFind);
    const flow = calculateOneYearFlow(blockToFind);
    const stockToFlow = stock / flow;
    const basePrice = 0.25 * stockToFlow ** 3;
    const confidence = (68 / 100) * basePrice;

    return basePrice + confidence;
  },
  minPrice: ({ currentBitcoinBlock, week }): number => {
    const blockToFind = currentBitcoinBlock + week * BLOCKS_PER_WEEK;
    const stock = calculateTotalStock(blockToFind);
    const flow = calculateOneYearFlow(blockToFind);
    const stockToFlow = stock / flow;
    const basePrice = 0.25 * stockToFlow ** 3;
    const confidence = (68 / 100) * basePrice;

    return basePrice - confidence;
  },
  modelType: "Stock-To-Flow (2024 refit, exponential)" as const,
};

const basicGrowthModel: PriceModel = {
  maxPrice: ({ week }): number => {
    return 200_000 + week * week * 2;
  },
  minPrice: ({ week }): number => {
    return 40_000 + week * week;
  },
  modelType: "Quadratic (polynomial)" as const,
};

const basePriceModel = (currentDate: Date): number => {
  const coefficientA = 18;
  const coefficientB = -495;
  const lnMilliseconds = Math.log(currentDate.getTime());
  return Math.exp(coefficientA * lnMilliseconds + coefficientB);
};

const rainbowChartModel: PriceModel = {
  maxPrice: ({ week }): number => {
    const currentDate = new Date(Date.now() + week * MS_PER_WEEK);
    return basePriceModel(currentDate);
  },

  minPrice: ({ week }): number => {
    const currentDate = new Date(Date.now() + week * MS_PER_WEEK);
    return basePriceModel(currentDate) * 0.1;
  },

  modelType: "Rainbow Chart (logarithmic)",
};

const powerLaw = (unixTimeMs: number, offsetYears = 0): number => {
  const scaleFactor = 10 ** -17.3;
  const unixStartTime = 1_230_940_800_000 - offsetYears * MS_PER_YEAR;
  const daysSinceStart = (unixTimeMs - unixStartTime) / MS_PER_DAY;
  return scaleFactor * daysSinceStart ** 5.83;
};

const powerLawModel: PriceModel = {
  maxPrice: ({ week }): number => {
    const currentDate = new Date(Date.now() + week * MS_PER_WEEK);
    return powerLaw(currentDate.getTime(), 6);
  },

  minPrice: ({ week }): number => {
    const currentDate = new Date(Date.now() + week * MS_PER_WEEK);
    return powerLaw(currentDate.getTime());
  },

  modelType: "Power Law (logarithmic)",
};

const CAGR = 0.5;

// Helper function to calculate CAGR-based price
const calculateCAGRPrice = (startPrice: number, timeInMs: number): number => {
  const years = timeInMs / MS_PER_YEAR;
  return startPrice * (1 + CAGR) ** years;
};

// Define the CAGR Model
const cagrModel: PriceModel = {
  maxPrice: ({ currentBitcoinPrice, week }): number => {
    const startPrice = currentBitcoinPrice * 1.5;
    const targetDate = new Date(
      Date.now() + week * MS_PER_WEEK + 2 * MS_PER_YEAR,
    );
    return calculateCAGRPrice(startPrice, targetDate.getTime() - Date.now());
  },

  minPrice: ({ currentBitcoinPrice, week }): number => {
    const startPrice = currentBitcoinPrice * 0.75;
    const targetDate = new Date(
      Date.now() + week * MS_PER_WEEK - 2 * MS_PER_YEAR,
    );
    return calculateCAGRPrice(startPrice, targetDate.getTime() - Date.now());
  },

  modelType: "CAGR (geometric, r=50%)",
};

// Constants for the model
const SLOPE = 4747 / WEEKS_PER_YEAR;

// Helper function to calculate linear price
const calculateLinearPrice = (weeks: number, current: number): number => {
  return current + SLOPE * weeks;
};

// Define the Linear Model
const linearModel: PriceModel = {
  maxPrice: ({ currentBitcoinPrice, week }): number => {
    return calculateLinearPrice(week, currentBitcoinPrice) * 1.628;
  },

  minPrice: ({ currentBitcoinPrice, week }): number => {
    // Assume min price is slightly lower than max price for simplification
    return calculateLinearPrice(week, currentBitcoinPrice) * 0.628;
  },

  modelType: `Arithmetic (Linear, slope=${SLOPE.toFixed(0)}/week)`,
};

export const models = [
  linearModel,
  basicGrowthModel,
  powerLawModel,
  rainbowChartModel,
  cagrModel,
  stockToFlowModelNew,
  stockToFlowModel,
];

export const modelMap = {
  [basicGrowthModel.modelType]: basicGrowthModel,
  [cagrModel.modelType]: cagrModel,
  [linearModel.modelType]: linearModel,
  [powerLawModel.modelType]: powerLawModel,
  [rainbowChartModel.modelType]: rainbowChartModel,
  [stockToFlowModel.modelType]: stockToFlowModel,
  [stockToFlowModelNew.modelType]: stockToFlowModelNew,
} as const;
