// eslint-disable-next-line functional/no-mixed-types

interface MinMaxOptions {
  currentBitcoinBlock?: number;
  currentBitcoinPrice?: number;
  week?: number;
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

export interface Dataset {
  backgroundColor?: string;
  borderColor?: string;
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
