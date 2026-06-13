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
  passwordConfirm?: string;
  role: string;
  active: boolean;
}

interface PaymentMethod {
  paymentName: string;
  paymentType: string; // "0" = Credit-/Debitcard, "1" = Bank Account
  cardNumber: string;
}


// Types used by orders.ts
interface OrdersErrorResponse {
  success?: false;
  error: string;
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

// Types used by adminManageOrders.ts
interface AdminOrderErrorResponse {
  success?: false;
  error: string;
}


// Types used by adminManageUsers.ts
interface AdminUserOrdersErrorResponse {
  success?: false;
  error: string;
}

// Types used by orderDetails.ts
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

  total_price: number | string | null;
  initial_price?: number | string | null;

  voucher_code?: string | null;
  voucher_discount?: number | string | null;
  voucher_remaining_value?: number | string | null;
}

interface OrderDetailsItem {
  file_path: string;
  name: string;
  price: number | string;
  quantity: number | string;
}

interface OrderDetailsResponse {
  order: OrderDetailsOrder;
  items: OrderDetailsItem[];
}

interface OrderDetailsErrorResponse {
  error: string;
}

interface Html2PdfWorker {
  from(element: HTMLElement): Html2PdfWorker;
  save(filename?: string): void;
}

// Types used by paymentMethods.ts
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


// Types used by products.ts for jQuery UI drag and drop
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

// Types in cart.ts
interface Cart {
  id: number;
  file_path: string;
  name: string;
  price: number;
  quantity: number;
}

interface Window {
  addToCartViaDrag: (
    productId: number,
    onSuccess?: () => void,
    onError?: () => void,
  ) => void;
}