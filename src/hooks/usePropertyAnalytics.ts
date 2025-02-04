import { useMemo } from 'react';
import { FormattedPropertyData, PropertyData } from '@/utils/loadData';

export function useFilteredData(data: PropertyData[], filters: any) {
  return useMemo(() => {
    if (!data.length) return [];

    return data.filter(property => {
      const monthsAgo = parseInt(filters.dateRange) || 12;
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - monthsAgo);
      const propertyDate = new Date(property.date);

      const matchesDate = filters.dateRange === 'all' || propertyDate >= cutoffDate;
      const matchesSearch = !filters.search ||
        property.address.toLowerCase().includes(filters.search.toLowerCase()) ||
        property.district.toLowerCase().includes(filters.search.toLowerCase());
      const matchesPostcode = !filters.postcode ||
        property.postcode.includes(filters.postcode);
      const matchesType = filters.propertyTypes.length === 0 ||
        filters.propertyTypes.includes(property.property_type);
      const matchesPrice = property.price >= filters.priceRange[0] &&
        property.price <= filters.priceRange[1];
      const matchesDistrict = filters.districts.length === 0 ||
        filters.districts.includes(property.district);

      return matchesSearch && matchesPostcode && matchesType &&
        matchesPrice && matchesDate && matchesDistrict;
    }).map(property => ({
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
      }).format(property.price_per_m2)
    })) as FormattedPropertyData[];
  }, [data, filters]);
}

export function usePropertyMetrics(data: PropertyData[]) {
  return useMemo(() => {
    const totalProperties = data.length;
    if (totalProperties === 0) return {
      totalProperties: 0,
      avgPrice: 0,
      avgSize: 0,
      avgPricePerM2: 0,
      monthlyVolume: 0
    };

    const avgPrice = data.reduce((sum, p) => sum + p.price, 0) / totalProperties;
    const avgSize = data.reduce((sum, p) => sum + p.size_m2, 0) / totalProperties;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyVolume = data.filter(p => new Date(p.date) >= thirtyDaysAgo).length;

    return {
      totalProperties,
      avgPrice,
      avgSize,
      avgPricePerM2: avgPrice / avgSize,
      monthlyVolume
    };
  }, [data]);
}

export function usePriceDistribution(data: PropertyData[]) {
  return useMemo(() => {
    const interval = 500000;
    return data.sort((a, b) => a.price - b.price).reduce((acc, property) => {
      const range = `${new Intl.NumberFormat('da-DK', {
        style: 'currency',
        currency: 'DKK',
        maximumFractionDigits: 0
      }).format(Math.floor(property.price / interval) * interval)} - ${new Intl.NumberFormat('da-DK', {
        style: 'currency',
        currency: 'DKK',
        maximumFractionDigits: 0
      }).format((Math.floor(property.price / interval) + 1) * interval)}`;
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [data]);
}

export function usePropertyTypeDistribution(data: PropertyData[]) {
  return useMemo(() => {
    return data.reduce((acc, property) => {
      acc[property.property_type] = (acc[property.property_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [data]);
}

export function useDistrictPrices(data: PropertyData[]) {
  return useMemo(() => {
    const districtPrices = data.reduce((acc, property) => {
      if (!acc[property.district]) {
        acc[property.district] = { total: 0, count: 0 };
      }
      acc[property.district].total += property.price;
      acc[property.district].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number; }>);

    return Object.entries(districtPrices)
      .map(([district, data]) => ({
        district,
        avgPrice: data.total / data.count
      }))
      .sort((a, b) => b.avgPrice - a.avgPrice);
  }, [data]);
}

export function useDistrictSales(data: PropertyData[]) {
  return useMemo(() => {
    const districtSales = data.reduce((acc, property) => {
      if (!acc[property.district]) {
        acc[property.district] = 0;
      }
      acc[property.district] += 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(districtSales)
      .map(([district, sales]) => ({
        district,
        sales
      }))
      .sort((a, b) => b.sales - a.sales);
  }, [data]);
}