/**
 * Global frontend type declarations
 * Contains shared data models and external library declarations.
 */

/* Bootstrap */

interface BootstrapModal {
  show(): void;
  hide(): void;
}

interface BootstrapModalConstructor {
  new (element: Element): BootstrapModal;
  getInstance(element: Element): BootstrapModal | null;
}

interface Bootstrap {
  Modal: BootstrapModalConstructor;
}

declare const bootstrap: Bootstrap;

/* html2pdf */
interface Html2PdfWorker {
  from(element: HTMLElement): Html2PdfWorker;
  save(filename?: string): void;
}

declare function html2pdf(): Html2PdfWorker;

/* API Response types */

interface ApiErrorResponse {
  code: number;
  error: string;
}

/* Authentication */

interface LoginStatusResponse {
  loggedIn: boolean;
  role?: "admin" | "customer" | "guest" | string;
  username?: string;
  userId: number | null;
  cartCount: number;
  error?: string;
}

/* Product and cart models */

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

/* User and payment models */

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
  passwordConfirm?: string;
  role: string;
  active: boolean;
}

interface PaymentMethod {
  paymentName: string;
  paymentType: string; // "0" = Credit/Debit Card, "1" = Bank Account
  cardNumber: string;
}

interface SavedPaymentMethod {
  id: number;
  label: string;
  card_number: string;
  is_bank_account: number | string;
}

interface PaymentMethodsResponse {
  paymentMethods: SavedPaymentMethod[];
}

interface PaymentActionResponse {
  success: boolean;
  error?: string;
}

/* Order models */

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

/* Admin order models */

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


/* Order details page models */

interface OrderDetailsOrder {
  id: number;
  date: string;
  invoice_number: string;

  first_name: string;
  last_name: string;
  address: string;
  zip: string;
  city: string;
  email: string;

  total_price: number;
  initial_price?: number;

  voucher_code?: string | null;
  voucher_discount?: number | null;
  voucher_remaining_value?: number | null;
}

interface OrderDetailsItem {
  file_path: string;
  name: string;
  price: string;
  quantity: string;
}

interface OrderDetailsResponse {
  order: OrderDetailsOrder;
  items: OrderDetailsItem[];
}

/* Voucher model */

interface Voucher {
  code: string;
  value: number;
  remainingValue: number;
  expiryDate: string;
  status: "active" | "redeemed" | "expired";
  userId: number | null;
}

/* jQuery UI drag and drop */

interface IteaDraggableOptions {
  handle?: string;
  helper?: (this: HTMLElement) => JQuery<HTMLElement>;
  cursorAt?: {
    top: number;
    left: number;
  };
  revert?: string;
  zIndex?: number;
  start?: () => void;
  stop?: () => void;
}

interface IteaDroppableUi {
  draggable: JQuery<HTMLElement>;
}

interface IteaDroppableOptions {
  accept?: string;
  tolerance?: string;
  hoverClass?: string;
  drop?: (event: JQuery.Event, ui: IteaDroppableUi) => void;
}

interface JQuery {
  draggable(options: IteaDraggableOptions): JQuery;
  droppable(options: IteaDroppableOptions): JQuery;
}

/* Global window extensions */

interface Window {
  addToCartViaDrag: (
    productId: number,
    onSuccess?: () => void,
    onError?: () => void,
  ) => void;
}