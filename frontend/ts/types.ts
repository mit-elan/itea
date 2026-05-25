interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  filePath?: string;
  rating?: number;
  creationDate?: Date;
}

interface Cart {
  id: number;
  file_path: string;
  name: string;
  price: number;
  quantity: number;
}

interface User {
  id: number;
  salutation: string;
  firstname: string;
  lastname: string;
  address: string;
  zip: string;
  city: string;
  email: string;
  username: string;
  password: string;
  role: string;
  active: boolean;
}

interface PaymentMethod {
  paymentName: string;
  paymentType: string; // "0" = Credit-/Debitcard, "1" = Bank Account
  cardNumber: string;
}
