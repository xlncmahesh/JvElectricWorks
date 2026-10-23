import { supabase } from '@/lib/supabase';
import type {
  Category, Subcategory, Product,
  OrderInput, OrderResult, Order,
  RepairRequestInput, SolarRequestInput, ServiceRequestResult,
  ServiceRequestType, ServiceRequestDetail,
  Message, MessageAttachment, ThreadType,
  SupportTicket, SupportTicketInput,
} from '@/types';

// ── Categories ───────────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_published', true)
    .order('display_order');
  if (error) throw new Error(error.message);
  return (data ?? []) as Category[];
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Category | null;
}

// ── Subcategories ────────────────────────────────────────────────────────────

export async function fetchSubcategories(categoryId?: string): Promise<Subcategory[]> {
  let q = supabase.from('subcategories').select('*').eq('is_published', true).order('display_order');
  if (categoryId) q = q.eq('category_id', categoryId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Subcategory[];
}

export async function fetchSubcategoriesByCategorySlug(slug: string): Promise<Subcategory[]> {
  const { data: cat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (!cat) return [];
  return fetchSubcategories(cat.id);
}

// ── Products ─────────────────────────────────────────────────────────────────

export interface ProductFilters {
  category_slug?: string;
  subcategory_slug?: string;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'newest';
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  // If filtering by category slug, resolve to category_id first — Supabase
  // doesn't support filtering on joined columns directly.
  let categoryId: string | undefined;
  let subcategoryId: string | undefined;

  if (filters.category_slug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id, slug')
      .eq('slug', filters.category_slug)
      .eq('is_published', true)
      .maybeSingle();
    if (!cat) return [];
    categoryId = cat.id;
  }

  if (filters.subcategory_slug && categoryId) {
    const { data: sub } = await supabase
      .from('subcategories')
      .select('id, slug')
      .eq('category_id', categoryId)
      .eq('slug', filters.subcategory_slug)
      .eq('is_published', true)
      .maybeSingle();
    if (!sub) return [];
    subcategoryId = sub.id;
  }

  let q = supabase
    .from('products')
    .select('*, category:categories(*), subcategory:subcategories(*)')
    .eq('is_published', true);

  if (categoryId) q = q.eq('category_id', categoryId);
  if (subcategoryId) q = q.eq('subcategory_id', subcategoryId);
  if (filters.search) {
    q = q.ilike('name', `%${filters.search}%`);
  }

  switch (filters.sort) {
    case 'price_asc':  q = q.order('price', { ascending: true }); break;
    case 'price_desc': q = q.order('price', { ascending: false }); break;
    case 'name_asc':   q = q.order('name', { ascending: true }); break;
    case 'newest':
    default:           q = q.order('created_at', { ascending: false }); break;
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}

export async function fetchProductBySlug(categorySlug: string, productSlug: string): Promise<Product | null> {
  // Resolve category ID from slug
  const { data: cat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .eq('is_published', true)
    .maybeSingle();
  if (!cat) return null;

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), subcategory:subcategories(*)')
    .eq('slug', productSlug)
    .eq('category_id', cat.id)
    .eq('is_published', true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Product | null;
}

// ── Orders ───────────────────────────────────────────────────────────────────

function generateReference(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

export async function submitOrder(input: OrderInput): Promise<OrderResult> {
  const reference = generateReference('ORD');
  const subtotal = input.items.reduce((s, it) => s + it.line_total, 0);

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      reference,
      status: 'pending',
      full_name: input.full_name,
      phone: input.phone,
      email: input.email || null,
      fulfilment_mode: input.fulfilment_mode,
      delivery_address: input.delivery_address || null,
      notes: input.notes || null,
      subtotal,
    })
    .select('id, reference, status, created_at')
    .single();

  if (orderErr || !order) throw new Error(orderErr?.message ?? 'Failed to create order');

  const itemRows = input.items.map(it => ({
    order_id: order.id,
    product_id: it.product_id,
    product_name: it.product_name,
    product_slug: it.product_slug,
    unit_price: it.unit_price,
    price_unit: it.price_unit,
    purchasing_mode: it.purchasing_mode,
    quantity: it.quantity,
    line_total: it.line_total,
    image_url: it.image_url,
  }));

  const { error: itemsErr } = await supabase.from('order_items').insert(itemRows);
  if (itemsErr) throw new Error(itemsErr.message);

  return order as OrderResult;
}

// ── Service Requests ─────────────────────────────────────────────────────────

export async function fetchServiceRequestTypes(): Promise<ServiceRequestType[]> {
  const { data, error } = await supabase
    .from('service_request_types')
    .select('*')
    .eq('is_active', true)
    .order('display_order');
  if (error) throw new Error(error.message);
  return (data ?? []) as ServiceRequestType[];
}

export async function submitRepairRequest(
  input: RepairRequestInput,
  typeId: string,
): Promise<ServiceRequestResult> {
  const reference = generateReference('REP');

  const { data: sr, error: srErr } = await supabase
    .from('service_requests')
    .insert({
      type_id: typeId,
      reference,
      status: 'pending',
      full_name: input.full_name,
      phone: input.phone || null,
      email: input.email || null,
      device_type: input.device_type,
      device_brand: input.device_brand,
      device_model: input.device_model,
      problem_description: input.problem_description,
    })
    .select('id, reference, status, created_at')
    .single();

  if (srErr || !sr) throw new Error(srErr?.message ?? 'Failed to submit repair request');

  // Upload images to storage and record metadata
  for (let i = 0; i < input.images.length; i++) {
    const file = input.images[i];
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${sr.id}/${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from('repair-images')
      .upload(path, file, { contentType: file.type });
    if (uploadErr) throw new Error(uploadErr.message);

    const { data: urlData } = supabase.storage
      .from('repair-images')
      .getPublicUrl(path);

    await supabase.from('service_request_images').insert({
      service_request_id: sr.id,
      storage_path: path,
      public_url: urlData.publicUrl,
      content_type: file.type,
      size_bytes: file.size,
      is_mandatory: i === 0,
    });
  }

  return sr as ServiceRequestResult;
}

export async function submitSolarRequest(
  input: SolarRequestInput,
  typeId: string,
): Promise<ServiceRequestResult> {
  const reference = generateReference('SOL');

  const { data: sr, error: srErr } = await supabase
    .from('service_requests')
    .insert({
      type_id: typeId,
      reference,
      status: 'pending',
      full_name: input.full_name,
      phone: input.phone || null,
      email: input.email || null,
      install_address: input.install_address,
      install_locality: input.install_locality,
      install_postal_code: input.install_postal_code,
      property_type: input.property_type,
      estimated_consumption: input.estimated_consumption || null,
      notes: input.notes || null,
    })
    .select('id, reference, status, created_at')
    .single();

  if (srErr || !sr) throw new Error(srErr?.message ?? 'Failed to submit solar request');
  return sr as ServiceRequestResult;
}

// ── Order History ────────────────────────────────────────────────────────────

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Order[];
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Order | null;
}

// ── Service Request Tracking ─────────────────────────────────────────────────

export async function fetchServiceRequests(): Promise<ServiceRequestDetail[]> {
  const { data, error } = await supabase
    .from('service_requests')
    .select('*, type:service_request_types(*), images:service_request_images(*)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ServiceRequestDetail[];
}

export async function fetchServiceRequestById(id: string): Promise<ServiceRequestDetail | null> {
  const { data, error } = await supabase
    .from('service_requests')
    .select('*, type:service_request_types(*), images:service_request_images(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as ServiceRequestDetail | null;
}

// ── Saved customer contact ────────────────────────────────────────────────────

export async function fetchSavedContact(): Promise<{ email: string | null; phone: string | null }> {
  const [ordersResult, requestsResult] = await Promise.all([
    supabase.from('orders').select('email, phone, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('service_requests').select('email, phone, created_at').order('created_at', { ascending: false }).limit(5),
  ]);
  if (ordersResult.error) throw new Error(ordersResult.error.message);
  if (requestsResult.error) throw new Error(requestsResult.error.message);
  const rows = [...(ordersResult.data ?? []), ...(requestsResult.data ?? [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const email = rows.find(item => item.email)?.email ?? null;
  const phone = rows.find(item => item.phone)?.phone ?? null;
  return { email, phone };
}

// ── Conversations & Messages ─────────────────────────────────────────────────

export async function getOrCreateConversation(
  threadType: ThreadType,
  threadId: string,
): Promise<string> {
  const { data, error } = await supabase.rpc('get_or_create_conversation', {
    p_thread_type: threadType,
    p_thread_id: threadId,
  });
  if (error) throw new Error(error.message);
  return data as string;
}

async function withSignedAttachmentUrls(messages: Message[]): Promise<Message[]> {
  return Promise.all(messages.map(async message => {
    const attachments = await Promise.all((message.attachments ?? []).map(async attachment => {
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .createSignedUrl(attachment.storage_path, 60 * 60);
      if (error) throw new Error(error.message);
      return { ...attachment, signed_url: data.signedUrl };
    }));
    return { ...message, attachments };
  }));
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*, attachments:message_attachments(*)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return withSignedAttachmentUrls((data ?? []) as Message[]);
}

const MESSAGE_FILE_MAX_BYTES = 10 * 1024 * 1024;
const MESSAGE_FILE_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/heic',
  'application/pdf', 'text/plain',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export async function sendMessage(
  conversationId: string,
  body: string,
  files: File[] = [],
): Promise<Message> {
  for (const file of files) {
    if (!MESSAGE_FILE_TYPES.has(file.type) || file.size > MESSAGE_FILE_MAX_BYTES) {
      throw new Error('One or more files are not supported or exceed 10 MB.');
    }
  }

  const messageBody = body.trim() || (files.length > 0 ? 'Attachment' : '');
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender: 'customer', body: messageBody })
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Authentication is required to attach files.');

  const attachments: MessageAttachment[] = [];
  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
    const path = `${userData.user.id}/${conversationId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from('message-attachments')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) throw new Error(uploadError.message);

    const { data: attachment, error: attachmentError } = await supabase
      .from('message_attachments')
      .insert({
        message_id: data.id,
        conversation_id: conversationId,
        storage_path: path,
        file_name: file.name,
        content_type: file.type,
        size_bytes: file.size,
      })
      .select('*')
      .single();
    if (attachmentError) throw new Error(attachmentError.message);
    const { data: signed, error: signedError } = await supabase.storage
      .from('message-attachments')
      .createSignedUrl(path, 60 * 60);
    if (signedError) throw new Error(signedError.message);
    attachments.push({ ...(attachment as MessageAttachment), signed_url: signed.signedUrl });
  }

  return { ...(data as Message), attachments };
}

// ── Support Tickets ──────────────────────────────────────────────────────────

export async function createSupportTicket(
  input: SupportTicketInput,
): Promise<SupportTicket> {
  const reference = generateReference('TKT');
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      reference,
      subject: input.subject,
      category: input.category,
      description: input.description,
      status: 'open',
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as SupportTicket;
}

export async function fetchSupportTickets(): Promise<SupportTicket[]> {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as SupportTicket[];
}

export async function fetchSupportTicketById(id: string): Promise<SupportTicket | null> {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as SupportTicket | null;
}

// ── Repair Image Upload ──────────────────────────────────────────────────────

export async function uploadRepairImage(
  requestId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${requestId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: uploadErr } = await supabase.storage
    .from('repair-images')
    .upload(path, file, { contentType: file.type });
  if (uploadErr) throw new Error(uploadErr.message);

  const { data: urlData } = supabase.storage
    .from('repair-images')
    .getPublicUrl(path);

  const { error: dbErr } = await supabase.from('service_request_images').insert({
    service_request_id: requestId,
    storage_path: path,
    public_url: urlData.publicUrl,
    content_type: file.type,
    size_bytes: file.size,
    is_mandatory: false,
  });
  if (dbErr) throw new Error(dbErr.message);

  return urlData.publicUrl;
}
