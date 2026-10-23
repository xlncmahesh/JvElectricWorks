// ── Types shared across the entire JV Electric Works application ──────────────

export interface Category {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  info_path: string;
  buy_path: string;
  accent: 'blue' | 'cyan' | 'amber';
  display_order: number;
  is_published: boolean;
  created_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  buy_path: string;
  info_path: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
}

export type PurchasingMode = 'unit' | 'length';
export type FulfilmentMode = 'delivery' | 'pickup' | 'consultation';

export interface Product {
  id: string;
  category_id: string;
  subcategory_id: string | null;
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  image_url: string | null;
  price: number;
  price_unit: string;          // e.g. "per metre", "per piece"
  purchasing_mode: PurchasingMode;
  min_quantity: number;
  quantity_increment: number;
  max_quantity: number | null;
  attributes: Record<string, string | number | boolean>;
  fulfilment_mode: FulfilmentMode;
  is_published: boolean;
  display_order: number;
  stock_quantity: number | null;     // null = untracked/unlimited, 0 = out of stock
  low_stock_threshold: number | null;
  created_at: string;
  // joined
  category?: Category;
  subcategory?: Subcategory;
}

// ── Stock helpers ────────────────────────────────────────────────────────────

export function isOutOfStock(product: Product): boolean {
  return product.stock_quantity !== null && product.stock_quantity <= 0;
}

export function isLowStock(product: Product): boolean {
  return (
    product.stock_quantity !== null &&
    product.stock_quantity > 0 &&
    product.low_stock_threshold !== null &&
    product.stock_quantity <= product.low_stock_threshold
  );
}

export function stockLabel(product: Product): string | null {
  if (product.stock_quantity === null) return null;
  if (product.stock_quantity <= 0) return 'Out of stock';
  if (isLowStock(product)) return `Only ${product.stock_quantity} left`;
  return 'In stock';
}

// ── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;     // in product's own unit (metres for cables, pieces for others)
  line_total: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
}

// ── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'cancelled'
  | 'processing'
  | 'to_be_delivered'
  | 'to_be_picked_up'
  | 'completed';

export interface OrderItemInput {
  product_id: string;
  product_name: string;
  product_slug: string | null;
  unit_price: number;
  price_unit: string;
  purchasing_mode: PurchasingMode;
  quantity: number;
  line_total: number;
  image_url: string | null;
}

export interface OrderInput {
  full_name: string;
  phone: string;
  email: string;
  fulfilment_mode: FulfilmentMode;
  delivery_address: string;
  notes: string;
  items: OrderItemInput[];
}

export interface OrderResult {
  id: string;
  reference: string;
  status: OrderStatus;
  created_at: string;
}

// ── Service Requests ────────────────────────────────────────────────────────

export type ServiceRequestStatus =
  | 'pending'
  | 'reviewing'
  | 'accepted'
  | 'declined'
  | 'scheduled'
  | 'completed'
  | 'cancelled';

export interface ServiceRequestType {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

export interface RepairRequestInput {
  full_name: string;
  phone: string;
  email: string;
  device_type: string;
  device_brand: string;
  device_model: string;
  problem_description: string;
  images: File[];
}

export interface SolarRequestInput {
  full_name: string;
  phone: string;
  email: string;
  install_address: string;
  install_locality: string;
  install_postal_code: string;
  property_type: string;
  estimated_consumption: string;
  notes: string;
}

export interface ServiceRequestResult {
  id: string;
  reference: string;
  status: ServiceRequestStatus;
  created_at: string;
}

// ── Full Order (for order history / detail views) ───────────────────────────

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_slug: string | null;
  unit_price: number;
  price_unit: string;
  purchasing_mode: PurchasingMode;
  quantity: number;
  line_total: number;
  image_url: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  reference: string;
  status: OrderStatus;
  full_name: string;
  phone: string;
  email: string | null;
  fulfilment_mode: FulfilmentMode;
  delivery_address: string | null;
  notes: string | null;
  subtotal: number;
  user_id: string;
  created_at: string;
  // joined
  order_items?: OrderItem[];
}

// ── Conversations & Messages ─────────────────────────────────────────────────

export type ThreadType = 'order' | 'service_request' | 'ticket';
export type MessageSender = 'customer' | 'business';

export interface Conversation {
  id: string;
  thread_type: ThreadType;
  thread_id: string;
  user_id: string;
  created_at: string;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  conversation_id: string;
  storage_path: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
  signed_url?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: MessageSender;
  body: string;
  created_at: string;
  attachments?: MessageAttachment[];
}

// ── Support Tickets ──────────────────────────────────────────────────────────

export type TicketStatus = 'open' | 'awaiting_response' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  reference: string;
  user_id: string;
  subject: string;
  category: string;
  description: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketInput {
  subject: string;
  category: string;
  description: string;
}

export const TICKET_CATEGORIES = [
  { value: 'general', label: 'General Enquiry' },
  { value: 'product', label: 'Product Question' },
  { value: 'order', label: 'Order Problem' },
  { value: 'service', label: 'Service Request Issue' },
  { value: 'billing', label: 'Billing / Payment' },
  { value: 'other', label: 'Other' },
] as const;

// ── Full Service Request (for tracking views) ────────────────────────────────

export interface ServiceRequestDetail {
  id: string;
  type_id: string;
  reference: string;
  status: ServiceRequestStatus;
  full_name: string;
  phone: string | null;
  email: string | null;
  device_type: string | null;
  device_brand: string | null;
  device_model: string | null;
  problem_description: string | null;
  install_address: string | null;
  install_locality: string | null;
  install_postal_code: string | null;
  property_type: string | null;
  estimated_consumption: string | null;
  notes: string | null;
  user_id: string;
  created_at: string;
  // joined
  type?: ServiceRequestType;
  images?: ServiceRequestImage[];
}

export interface ServiceRequestImage {
  id: string;
  service_request_id: string;
  storage_path: string;
  public_url: string | null;
  content_type: string | null;
  size_bytes: number | null;
  is_mandatory: boolean;
  created_at: string;
}

// ── Status label helpers ─────────────────────────────────────────────────────

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending Confirmation',
  cancelled: 'Cancelled',
  processing: 'Processing',
  to_be_delivered: 'To Be Delivered',
  to_be_picked_up: 'Ready for Pickup',
  completed: 'Completed',
};

export const SERVICE_REQUEST_STATUS_LABELS: Record<ServiceRequestStatus, string> = {
  pending: 'Pending Review',
  reviewing: 'Under Review',
  accepted: 'Accepted',
  declined: 'Declined',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  awaiting_response: 'Awaiting Response',
  resolved: 'Resolved',
  closed: 'Closed',
};

// ── UI helpers ──────────────────────────────────────────────────────────────

export type AccentColor = 'blue' | 'solar' | 'teal';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
