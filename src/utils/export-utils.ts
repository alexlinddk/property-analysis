import { PropertyData } from './loadData';
import Papa from 'papaparse';

export const exportToCSV = (data: PropertyData[], filename: string) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const calculateYoYChange = (current: number, previous: number): number => {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
};

export const getComparisonMetrics = (data: PropertyData[]) => {
  const now = new Date();
  const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
  
  const currentYearData = data.filter(p => new Date(p.date) > oneYearAgo);
  const previousYearData = data.filter(p => {
    const date = new Date(p.date);
    return date <= oneYearAgo && date > new Date(now.setFullYear(now.getFullYear() - 1));
  });

  const currentAvgPrice = currentYearData.length > 0
    ? currentYearData.reduce((sum, p) => sum + Number(p.price), 0) / currentYearData.length
    : 0;
  const previousAvgPrice = previousYearData.length > 0
    ? previousYearData.reduce((sum, p) => sum + Number(p.price), 0) / previousYearData.length
    : 0;

  const currentAvgPricePerM2 = currentYearData.length > 0
    ? currentYearData.reduce((sum, p) => sum + Number(p.price_per_m2), 0) / currentYearData.length
    : 0;
  const previousAvgPricePerM2 = previousYearData.length > 0
    ? previousYearData.reduce((sum, p) => sum + Number(p.price_per_m2), 0) / previousYearData.length
    : 0;

  return {
    priceChange: calculateYoYChange(currentAvgPrice, previousAvgPrice),
    pricePerM2Change: calculateYoYChange(currentAvgPricePerM2, previousAvgPricePerM2),
    volumeChange: calculateYoYChange(currentYearData.length, previousYearData.length)
  };
};