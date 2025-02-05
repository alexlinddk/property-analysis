'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Search, FilterX } from 'lucide-react';
import { PropertyData } from '@/utils/loadData';

interface PropertyFiltersProps {
  data: PropertyData[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

export interface FilterState {
  search: string;
  postcode: string;
  propertyTypes: string[];
  priceRange: [number, number];
  roomRange: [number, number];
  sizeRange: [number, number];
  yearBuiltRange: [number, number];
  districts: string[];
  dateRange: string;
}

const PropertyFilters = ({
  data,
  filters,
  onFilterChange,
  onReset,
}: PropertyFiltersProps) => {
  const [showAllDistricts, setShowAllDistricts] = useState(false);
  const priceRange = React.useMemo(() => {
    const prices = data.map((p) => p.price).filter((p) => p);
    return [Math.min(...prices), Math.max(...prices)];
  }, [data]);

  const roomRange = React.useMemo(() => {
    const rooms = data.map((p) => p.rooms).filter((r) => r);
    return [Math.min(...rooms), Math.max(...rooms)];
  }, [data]);

  const districts = React.useMemo(() => {
    return [...new Set(data.map((p) => p.district))].filter(Boolean).sort();
  }, [data]);

  const propertyTypes = React.useMemo(() => {
    return [...new Set(data.map((p) => p.property_type))]
      .filter(Boolean)
      .sort();
  }, [data]);

  const handlePriceRangeChange = (value: number[]) => {
    onFilterChange({
      ...filters,
      priceRange: [value[1], value[0]] as [number, number],
    });
  };

  const handlePropertyTypeChange = (type: string) => {
    const updatedTypes = filters.propertyTypes.includes(type)
      ? filters.propertyTypes.filter((t) => t !== type)
      : [...filters.propertyTypes, type];
    onFilterChange({
      ...filters,
      propertyTypes: updatedTypes,
    });
  };

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>Property Filters</CardTitle>
        <Button variant='outline' size='sm' onClick={onReset}>
          <FilterX className='mr-2 h-4 w-4' />
          Reset Filters
        </Button>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Search */}
          <div className='space-y-2'>
            <Label>Search</Label>
            <div className='relative'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
              <Input
                className='pl-10'
                placeholder='Address, district...'
                value={filters.search}
                onChange={(e) =>
                  onFilterChange({ ...filters, search: e.target.value })
                }
              />
            </div>
          </div>

          {/* Postcode */}
          <div className='space-y-2'>
            <Label>Postcode</Label>
            <Input
              placeholder='Enter postcode'
              value={filters.postcode}
              onChange={(e) =>
                onFilterChange({ ...filters, postcode: e.target.value })
              }
            />
          </div>

          {/* Date Range */}
          {/* <div className='space-y-2'>
            <Label>Time Period</Label>
            <Select
              value={filters.dateRange}
              onValueChange={(value) =>
                onFilterChange({ ...filters, dateRange: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select time period' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='3'>Last 3 months</SelectItem>
                <SelectItem value='6'>Last 6 months</SelectItem>
                <SelectItem value='12'>Last 12 months</SelectItem>
                <SelectItem value='24'>Last 24 months</SelectItem>
                <SelectItem value='all'>All time</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          {/* Price Range */}
          {/* <div className='space-y-4 col-span-full'>
            <Label>Price Range (DKK)</Label>
            <div className='px-3'>
              <Slider
                min={0}
                max={100000000}
                step={100000}
                value={[filters.priceRange[0], filters.priceRange[1]]}
                onValueChange={handlePriceRangeChange}
                className='my-6'
              />
              <div className='flex justify-between text-sm text-muted-foreground'>
                <span>
                  {new Intl.NumberFormat('da-DK', {
                    style: 'currency',
                    currency: 'DKK',
                    maximumFractionDigits: 0,
                  }).format(filters.priceRange[0])}
                </span>
                <span>
                  {new Intl.NumberFormat('da-DK', {
                    style: 'currency',
                    currency: 'DKK',
                    maximumFractionDigits: 0,
                  }).format(filters.priceRange[1])}
                </span>
              </div>
            </div>
          </div> */}

          {/* Property Types */}
          <div className='space-y-2 col-span-full'>
            <Label>Property Types</Label>
            <div className='flex flex-wrap gap-2'>
              {propertyTypes.map((type) => (
                <Button
                  key={type}
                  variant={
                    filters.propertyTypes.includes(type) ? 'default' : 'outline'
                  }
                  size='sm'
                  onClick={() => handlePropertyTypeChange(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Districts */}
          <div className='space-y-2 col-span-full'>
            <Label>Districts</Label>
            <div className='flex flex-wrap gap-2'>
              {districts.slice(0, 10).map((district) => (
                <Button
                  key={district}
                  variant={
                    filters.districts.includes(district) ? 'default' : 'outline'
                  }
                  size='sm'
                  onClick={() => {
                    const updatedDistricts = filters.districts.includes(
                      district
                    )
                      ? filters.districts.filter((d) => d !== district)
                      : [...filters.districts, district];
                    onFilterChange({
                      ...filters,
                      districts: updatedDistricts,
                    });
                  }}
                >
                  {district}
                </Button>
              ))}
              {districts.length > 10 && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setShowAllDistricts(!showAllDistricts)}
                >
                  {showAllDistricts
                    ? 'Show less'
                    : `+${districts.length - 10} more`}
                </Button>
              )}
            </div>
            {showAllDistricts && (
              <div className='flex flex-wrap gap-2 mt-2'>
                {districts.slice(10).map((district) => (
                  <Button
                    key={district}
                    variant={
                      filters.districts.includes(district)
                        ? 'default'
                        : 'outline'
                    }
                    size='sm'
                    onClick={() => {
                      const updatedDistricts = filters.districts.includes(
                        district
                      )
                        ? filters.districts.filter((d) => d !== district)
                        : [...filters.districts, district];
                      onFilterChange({
                        ...filters,
                        districts: updatedDistricts,
                      });
                    }}
                  >
                    {district}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyFilters;
