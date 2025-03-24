export interface SubAddon {
    _id?: string;
    name: string;
    price: number;
  }
  
  export interface Addon {
    _id: string;
    name: string;
    isMultiSelect: boolean;
    subAddons: SubAddon[];
    createdBy: string | any;
    restaurant: string | any;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface AddonCreateDto {
    name: string;
    isMultiSelect?: boolean;
    subAddons?: SubAddon[];
  }
  
  export interface AddonUpdateDto {
    name?: string;
    isMultiSelect?: boolean;
    subAddons?: SubAddon[];
  }