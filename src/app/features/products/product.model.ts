export interface ProductAddon {
  addon: string | any;
  required: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string | any;
  tags: string[] | any[];
  isAvailable: boolean;
  addons?: ProductAddon[]; // Add this line
  createdBy: string | any;
  restaurant: string | any;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateDto {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string;
  tags?: string[];
  addons?: { addon: string; required: boolean }[]; // Add this line
  isAvailable?: boolean;
}

export interface ProductUpdateDto {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  addons?: { addon: string; required: boolean }[]; // Add this line
  isAvailable?: boolean;
}
  
  export interface Tag {
    _id: string;
    name: string;
    createdBy: string | any;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface TagCreateDto {
    name: string;
  }
  
  export interface TagUpdateDto {
    name: string;
  }