export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  createdAt: number;
}

export interface UserData {
  email: string;
  lastLogin: number;
  uid: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Banner {
  id: string;
  imageUrl: string;
  link?: string;
}