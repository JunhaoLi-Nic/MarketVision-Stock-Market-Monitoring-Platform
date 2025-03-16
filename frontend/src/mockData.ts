export interface MarketPrice {
  price: number;
  change: number;
  change_percent: number;
}

export interface MarketPrices {
  [key: string]: MarketPrice;
}

// Mock market prices data
export const mockMarketPrices: MarketPrices = {
  'Bonds': { price: 3.5, change: 0.05, change_percent: 1.45 },
  'US Treasury Yields': { price: 3.95, change: 0.02, change_percent: 0.51 },
  'US 10-Year Yield': { price: 4.25, change: -0.03, change_percent: -0.70 },
  'Federal Funds Rate': { price: 5.25, change: 0, change_percent: 0 },
  'USD Index': { price: 105.25, change: -0.35, change_percent: -0.33 },
  'Gold': { price: 2380.50, change: 15.75, change_percent: 0.67 },
  'Crude Oil': { price: 78.35, change: 1.25, change_percent: 1.62 },
  'Commodities': { price: 23.45, change: 0.15, change_percent: 0.64 },
  'Copper Prices': { price: 4.52, change: 0.08, change_percent: 1.80 },
  'VIX (Volatility Index)': { price: 14.25, change: -0.75, change_percent: -5.00 },
  'S&P 500': { price: 5250.75, change: 12.25, change_percent: 0.23 },
  'Growth Stocks': { price: 345.20, change: 2.15, change_percent: 0.63 },
  'Value Stocks': { price: 178.45, change: 0.95, change_percent: 0.54 },
  'US Multinational Companies': { price: 215.30, change: -1.25, change_percent: -0.58 },
  'AUD/USD': { price: 0.6725, change: 0.0015, change_percent: 0.22 },
  'NZD/AUD': { price: 0.9325, change: -0.0025, change_percent: -0.27 },
  'CAD': { price: 0.7425, change: 0.0035, change_percent: 0.47 },
  'NOK (Norwegian Krone)': { price: 0.0925, change: 0.0005, change_percent: 0.54 },
  'CHF (Swiss Franc)': { price: 1.1225, change: -0.0045, change_percent: -0.40 },
  'Emerging Market Currencies': { price: 18.75, change: -0.25, change_percent: -1.32 },
  'TIPS (Treasury Inflation-Protected Securities)': { price: 112.25, change: 0.45, change_percent: 0.40 },
  'Real Estate': { price: 98.35, change: -0.65, change_percent: -0.66 },
  'Stocks': { price: 5250.75, change: 12.25, change_percent: 0.23 },
  'USD/JPY': { price: 154.75, change: 0.85, change_percent: 0.55 },
  'Inflation': { price: 3.25, change: -0.05, change_percent: -1.52 },
  'Currency Pair': { price: 1.0825, change: 0.0035, change_percent: 0.32 },
  'Currency Strength': { price: 105.25, change: -0.35, change_percent: -0.33 },
  'Risk Sentiment': { price: 65.75, change: 1.25, change_percent: 1.94 }
}; 