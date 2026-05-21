export enum PropertyType {
  HOUSE = 'HOUSE',
  APARTMENT = 'APARTMENT',
  CONDO = 'CONDO',
  OFFICE = 'OFFICE',
  LAND = 'LAND',
  OTHER = 'OTHER',
}

export enum ListingType {
  SALE = 'SALE',
  RENT = 'RENT',
}

export interface Listing {
  id: number;
  title: string;
  description?: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  propertyType: PropertyType;
  listingType: ListingType;
  images?: string[];
  realtor: {
    id: number;
    username: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
  };
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
