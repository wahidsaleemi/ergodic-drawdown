// eslint-disable-next-line spaced-comment, @typescript-eslint/triple-slash-reference
/// <reference types="vite-plugin-svgr/client" />

// eslint-disable-next-line functional/no-mixed-types

interface MinMaxOptions {
  currentBitcoinBlock: number;
  currentBitcoinPrice: number;
  week: number;
}

// eslint-disable-next-line functional/no-mixed-types
export interface PriceModel {
  maxPrice: (options: MinMaxOptions) => number;
  minPrice: (options: MinMaxOptions) => number;
  modelType: string;
}

export interface BlockData {
  height: number;
  time: number;
}

export type HalvingData = Record<string, number>;

export interface HalvingWorker {
  currentBlock: number;
  halvings: HalvingData;
}

export interface Dataset {
  backgroundColor?: string;
  borderColor?: string;
  borderDash?: number[];
  borderWidth?: number;
  data: Array<{
    x: number;
    y: number;
  }>;
  fill?: boolean | string;
  label: string;
  pointRadius: number;
  tension: number;
  yAxisID?: string;
}

export type DatasetList = Dataset[];

export type Data = Array<Array<{ x: number; y: number }>>;
export interface SimulationWorker {
  clampBottom: boolean;
  clampTop: boolean;
  currentBlock: number;
  currentPrice: number;
  epochCount: number;
  halvings: Record<number, number>;
  model: string;
  samples: number;
  volatility: number;
  walk: string;
}

export interface VolumeWorker {
  bitcoin: number;
  costOfLiving: number;
  data: Data;
  drawdownDate: number;
  inflation: number;
}

export interface VolumeReturn {
  average: number | undefined;
  median: number;
  volumeDataset: DatasetList;
  zero: number;
}
// eslint-disable-next-line functional/functional-parameters
export interface BitcoinDataPoint {
  close: number;
  conversionSymbol: string;
  conversionType: string;
  high: number;
  low: number;
  open: number;
  time: number;
  volumefrom: number;
  volumeto: number;
}
