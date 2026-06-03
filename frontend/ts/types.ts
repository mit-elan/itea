declare const bootstrap: any;

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
  password?: string;
  role: string;
  active: boolean;
}

interface PaymentMethod {
  paymentName: string;
  paymentType: string; // "0" = Credit-/Debitcard, "1" = Bank Account
  cardNumber: string;
}

interface OrderSummary {
  id: number;
  date: string;
  total_price: number;
  invoice_number: string;
}

interface OrderDetails {
  id: number;
  user_id: number;
  payment_method_id?: number;
  voucher_id?: number;
  date: string;
  total_price: number;
  invoice_number: string;
  first_name: string;
  last_name: string;
  address: string;
  zip: string;
  city: string;
  email: string;
  username: string;
}

interface OrderItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  file_path: string;
  quantity: number;
  unit_price: number;
}

interface Voucher {
  code: string;
  value: number;
  remainingValue: number;
  expiryDate: string;
  status: "active" | "redeemed" | "expired";
  userId: number | null;
}

interface AdminOrderOverview {
  id: number;
  user_id: number;
  date: string;
  subtotal: number;
  voucher: number;
  total_price: number;
  invoice_number: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
}
