import Papa from 'papaparse';
import path from 'path';

let fs: typeof import('fs') | undefined;

if (typeof window === 'undefined') {
  fs = require('fs');
}

export interface PropertyData {
  property_type: string;
  address: string;
  postcode: string;
  district: string;
  price: number;
  date: string;
  sale_type: string;
  size_m2: number;
  price_per_m2: number;
  rooms: number;
  year_built: number;
}

export interface FormattedPropertyData extends PropertyData {
  formattedPrice: string;
  formattedPricePerM2: string;
}

interface ParseError {
  type: string;
  code: string;
  message: string;
  row?: number;
}

function cleanDistrict(district: string): string {
  return district.replace(/^\d{4}\s+/, '');
}

function parseAddress(fullAddress: string): { street: string; postcode: string; district: string } {
  const result = {
    street: fullAddress,
    postcode: '',
    district: ''
  };

  if (!fullAddress) return result;

  const postalMatch = fullAddress.match(/(.*?)\s(\d{4})\s+([^,]+)$/);

  if (postalMatch) {
    result.street = postalMatch[1].replace(/,\s*$/, '');
    result.postcode = postalMatch[2];
          result.district = cleanDistrict(postalMatch[3]);
    return result;
  }

  const parts = fullAddress.split(',').map(part => part.trim());
  
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1];
    const postalDistrictMatch = lastPart.match(/(\d{4})\s+([^,]+)/);
    
    if (postalDistrictMatch) {
      result.street = parts.slice(0, -1).join(', ');
      result.postcode = postalDistrictMatch[1];
      result.district = cleanDistrict(postalDistrictMatch[2]);
    }
  }

  return result;
}

export async function loadPropertyData(): Promise<PropertyData[]> {
  if (!fs) {
    console.error('File system (fs) is not available');
    return [];
  }

  try {
    const csvPath = path.join(process.cwd(), 'data', 'boliga_sales.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');

    const results = Papa.parse<Omit<PropertyData, 'postcode' | 'district'>>(csvData, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    if (results.errors.length > 0) {
      console.error('CSV parsing errors:', results.errors);
    }

    return results.data.splice(0, 1000).map(property => {
      const { street, postcode, district } = parseAddress(property.address || '');

      return {
        property_type: property.property_type || '',
        address: street,
        postcode: postcode,
        district: district,
        price: Number(property.price) || 0,
        date: property.date || '',
        sale_type: property.sale_type || '',
        size_m2: Number(property.size_m2) || 0,
        price_per_m2: Number(property.price_per_m2) || 0,
        rooms: Number(property.rooms) || 0,
        year_built: Number(property.year_built) || 0,
      };
    });
  } catch (error) {
    console.error('Error loading property data:', error);
    return [];
  }
}