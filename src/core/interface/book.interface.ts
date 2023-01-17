export interface IBook {
  isbn: string;

  title: string;

  price: number;

  author?: string;

  editorial?: string;

  category?: string;

  image: string;

  isAvailable?: boolean;

  linkProduct: string;

  shop: string;
}
