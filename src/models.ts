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
  default: 0,
  maxPrice: ({ currentBlock, week }): number => {
    const blockToFind = currentBlock + week * BLOCKS_PER_WEEK;
    const stock = calculateTotalStock(blockToFind);
    const flow = calculateOneYearFlow(blockToFind);
    const stockToFlow = stock / flow;
    const basePrice = Math.exp(-1.02) * stockToFlow ** 3.08;
    const confidence = (65 / 100) * basePrice;

    return basePrice + confidence;
  },
  minPrice: ({ currentBlock, week }): number => {
    const blockToFind = currentBlock + week * BLOCKS_PER_WEEK;
    const stock = calculateTotalStock(blockToFind);
    const flow = calculateOneYearFlow(blockToFind);
    const stockToFlow = stock / flow;
    const basePrice = Math.exp(-1.02) * stockToFlow ** 3.08;
    const confidence = (65 / 100) * basePrice;

    return basePrice - confidence;
  },
  modelType: "Stock-To-Flow (exponential)" as const,
  varInput: "",
};

const stockToFlowModelNew: PriceModel = {
  default: 0,
  maxPrice: ({ currentBlock, week }): number => {
    const blockToFind = currentBlock + week * BLOCKS_PER_WEEK;
    const stock = calculateTotalStock(blockToFind);
    const flow = calculateOneYearFlow(blockToFind);
    const stockToFlow = stock / flow;
    const basePrice = 0.25 * stockToFlow ** 3;
    const confidence = (68 / 100) * basePrice;

    return basePrice + confidence;
  },
  minPrice: ({ currentBlock, week }): number => {
    const blockToFind = currentBlock + week * BLOCKS_PER_WEEK;
    const stock = calculateTotalStock(blockToFind);
    const flow = calculateOneYearFlow(blockToFind);
    const stockToFlow = stock / flow;
    const basePrice = 0.25 * stockToFlow ** 3;
    const confidence = (68 / 100) * basePrice;

    return basePrice - confidence;
  },
  modelType: "Stock-To-Flow 2024 refit (exponential)" as const,
  varInput: "",
};

const basicGrowthModel: PriceModel = {
  default: 2,
  maxPrice: ({ currentPrice, variable, week }): number => {
    return currentPrice * 3 + 2 * variable * week ** 2;
  },
  minPrice: ({ currentPrice, variable, week }): number => {
    return currentPrice / 3 + variable * week ** 2;
  },
  modelType: "Quadratic (polynomial)" as const,
  varInput: "coefficient",
};

const basePriceModel = (currentDate: Date): number => {
  const coefficientA = 18;
  const coefficientB = -495;
  const lnMilliseconds = Math.log(currentDate.getTime());
  return Math.exp(coefficientA * lnMilliseconds + coefficientB);
};

const rainbowChartModel: PriceModel = {
  default: 0,
  maxPrice: ({ week }): number => {
    const currentDate = new Date(Date.now() + week * MS_PER_WEEK);
    return basePriceModel(currentDate);
  },

  minPrice: ({ week }): number => {
    const currentDate = new Date(Date.now() + week * MS_PER_WEEK);
    return basePriceModel(currentDate) * 0.1;
  },
  modelType: "Rainbow Chart (logarithmic)",
  varInput: "",
};

const powerLaw = (unixTimeMs: number, offsetYears = 0): number => {
  const scaleFactor = 10 ** -17.3;
  const unixStartTime = 1_230_940_800_000 - offsetYears * MS_PER_YEAR;
  const daysSinceStart = (unixTimeMs - unixStartTime) / MS_PER_DAY;
  return scaleFactor * daysSinceStart ** 5.83;
};

const powerLawModel: PriceModel = {
  default: 0,
  maxPrice: ({ week }): number => {
    const currentDate = new Date(Date.now() + week * MS_PER_WEEK);
    return powerLaw(currentDate.getTime(), 6);
  },

  minPrice: ({ week }): number => {
    const currentDate = new Date(Date.now() + week * MS_PER_WEEK);
    return powerLaw(currentDate.getTime());
  },

  modelType: "Power Law Regression Median (logarithmic)",
  varInput: "",
};

const log10PriceModel = (
  unixTimeMs: number,
  coefficient: number,
  exponent: number,
): number => {
  const unixStartTime = 1_230_940_800_000;
  const daysSinceStart = (unixTimeMs - unixStartTime) / MS_PER_DAY;
  return 10 ** (coefficient + exponent * Math.log10(daysSinceStart));
};

const log10PriceModelConfig: PriceModel = {
  default: 0,
  maxPrice: ({ week }): number => {
    const currentDate = new Date(Date.now() + week * MS_PER_WEEK);
    const min = log10PriceModel(currentDate.getTime(), -17.928_912, 5.977_458);
    const max = log10PriceModel(currentDate.getTime(), -12.363_33, 4.699_254);
    return max < min ? min : max;
  },

  minPrice: ({ week }): number => {
    const currentDate = new Date(Date.now() + week * MS_PER_WEEK);
    return log10PriceModel(currentDate.getTime(), -17.928_912, 5.977_458);
  },

  modelType: "Power Law Support Line (logarithmic)",
  varInput: "",
};

// Helper function to calculate CAGR-based price
const calculateCAGRPrice = (
  startPrice: number,
  timeInMs: number,
  variable: number,
): number => {
  const years = timeInMs / MS_PER_YEAR;
  return startPrice * (1 + variable / 100) ** years;
};

// Define the CAGR Model
const cagrModel: PriceModel = {
  default: 50,
  maxPrice: ({ currentPrice, variable, week }): number => {
    const startPrice = currentPrice * 3;
    const targetDate = new Date(Date.now() + week * MS_PER_WEEK);
    return calculateCAGRPrice(
      startPrice,
      targetDate.getTime() - Date.now(),
      variable,
    );
  },

  minPrice: ({ currentPrice, variable, week }): number => {
    const startPrice = currentPrice / 3;
    const targetDate = new Date(Date.now() + week * MS_PER_WEEK);
    return calculateCAGRPrice(
      startPrice,
      targetDate.getTime() - Date.now(),
      variable,
    );
  },

  modelType: "CAGR (geometric)",
  varInput: "R (%)",
};

// Helper function to calculate linear price
const calculateLinearPrice = (
  weeks: number,
  current: number,
  variable: number,
): number => {
  return current + variable * weeks;
};

// Define the Linear Model
const linearModel: PriceModel = {
  default: Math.floor(4747 / WEEKS_PER_YEAR),
  maxPrice: ({ currentPrice, variable, week }): number => {
    return calculateLinearPrice(week, currentPrice, variable) * 3;
  },

  minPrice: ({ currentPrice, variable, week }): number => {
    return calculateLinearPrice(week, currentPrice, variable) / 3;
  },

  modelType: `Arithmetic (Linear)`,
  varInput: "slope",
};

export const models = [
  linearModel,
  basicGrowthModel,
  powerLawModel,
  log10PriceModelConfig,
  rainbowChartModel,
  cagrModel,
  stockToFlowModelNew,
  stockToFlowModel,
];

export const modelMap = {
  [basicGrowthModel.modelType]: basicGrowthModel,
  [cagrModel.modelType]: cagrModel,
  [linearModel.modelType]: linearModel,
  [log10PriceModelConfig.modelType]: log10PriceModelConfig,
  [powerLawModel.modelType]: powerLawModel,
  [rainbowChartModel.modelType]: rainbowChartModel,
  [stockToFlowModel.modelType]: stockToFlowModel,
  [stockToFlowModelNew.modelType]: stockToFlowModelNew,
} as const;
