// utils/dataProcessor.ts
import { PropertyData } from './loadData';

export interface ProcessedPropertyData extends PropertyData {
  formattedPrice: string;
  formattedPricePerM2: string;
  priceRange: string;
}

export interface PreCalculatedStats {
  priceRanges: { range: string; count: number }[];
  propertyTypes: { type: string; count: number }[];
  averagePrices: { district: string; avgPrice: number }[];
  totalProperties: number;
  avgPrice: number;
  avgSize: number;
  avgPricePerM2: number;
  monthlyVolume: number;
}

export const preprocessData = (data: PropertyData[]): {
  processedData: ProcessedPropertyData[];
  stats: PreCalculatedStats;
} => {
  // Process and format data
  const processedData = data.map(property => ({
    ...property,
    formattedPrice: new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      maximumFractionDigits: 0
    }).format(property.price),
    formattedPricePerM2: new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      maximumFractionDigits: 0
    }).format(property.price_per_m2),
    priceRange: getPriceRange(property.price)
  }));

  // Pre-calculate statistics
  const stats = calculateStats(processedData);

  return { processedData, stats };
};

const getPriceRange = (price: number): string => {
  const ranges = [500000, 1000000, 1500000, 2000000, 2500000, 300000, 3500000, 4000000];
  const range = ranges.find(r => price <= r);
  return range ? `Up to ${range/1000000}M` : 'Above 10M';
};

const calculateStats = (data: ProcessedPropertyData[]): PreCalculatedStats => {
  // Calculate price ranges
  const priceRanges = Object.entries(
    data.reduce((acc, property) => {
      const range = property.priceRange;
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([range, count]) => ({ range, count }));

  // Calculate property types
  const propertyTypes = Object.entries(
    data.reduce((acc, property) => {
      acc[property.property_type] = (acc[property.property_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, count]) => ({ type, count }));

  // Calculate average prices by district
  const districtPrices = data.reduce((acc, property) => {
    if (!acc[property.district]) {
      acc[property.district] = { total: 0, count: 0 };
    }
    acc[property.district].total += property.price;
    acc[property.district].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number; }>);

  const averagePrices = Object.entries(districtPrices)
    .map(([district, data]) => ({
      district,
      avgPrice: data.total / data.count
    }))
    .sort((a, b) => b.avgPrice - a.avgPrice);

  // Calculate overall statistics
  const totalProperties = data.length;
  const avgPrice = data.reduce((sum, p) => sum + p.price, 0) / totalProperties;
  const avgSize = data.reduce((sum, p) => sum + p.size_m2, 0) / totalProperties;
  const avgPricePerM2 = avgPrice / avgSize;

  // Calculate monthly volume (assuming data is sorted by date)
  const lastMonthProperties = data.filter(
    p => new Date(p.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  return {
    priceRanges,
    propertyTypes,
    averagePrices,
    totalProperties,
    avgPrice,
    avgSize,
    avgPricePerM2,
    monthlyVolume: lastMonthProperties
  };
};