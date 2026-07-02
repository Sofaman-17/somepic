// ─────────────────────────────────────────────
// ROLES
// ─────────────────────────────────────────────
export type UserRole = 'admin' | 'editor'

// ─────────────────────────────────────────────
// USER / PROFILE
// ─────────────────────────────────────────────
export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
}

// ─────────────────────────────────────────────
// BOOKS (Vinted – physical products)
// ─────────────────────────────────────────────
export type BookStatus = 'disponible' | 'vendido' | 'reservado' | 'archivado'
export type BookCondition = 'nuevo' | 'muy_bueno' | 'bueno' | 'aceptable'

export interface Book {
  id: string
  title: string
  author: string | null
  isbn: string | null
  condition: BookCondition
  status: BookStatus
  purchase_price: number | null
  sale_price: number | null
  platform: 'vinted' | 'wallapop' | 'otro'
  listing_url: string | null
  cover_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ─────────────────────────────────────────────
// DIGITAL PRODUCTS (Gumroad)
// ─────────────────────────────────────────────
export type DigitalProductStatus = 'borrador' | 'publicado' | 'archivado'
export type DigitalProductType = 'ebook' | 'plantilla' | 'curso' | 'pack' | 'otro'

export interface DigitalProduct {
  id: string
  title: string
  description: string | null
  type: DigitalProductType
  status: DigitalProductStatus
  price: number
  gumroad_url: string | null
  cover_url: string | null
  file_url: string | null
  sales_count: number
  revenue_total: number
  created_at: string
  updated_at: string
}

// ─────────────────────────────────────────────
// CONTENT (AI-generated – TikTok / Reels / Shorts)
// ─────────────────────────────────────────────
export type ContentStatus = 'idea' | 'en_produccion' | 'grabado' | 'editado' | 'publicado' | 'archivado'
export type ContentPlatform = 'tiktok' | 'instagram' | 'youtube' | 'todos'

export interface ContentPiece {
  id: string
  title: string
  script: string | null
  hook: string | null
  platform: ContentPlatform
  status: ContentStatus
  ai_generated: boolean
  publish_date: string | null
  video_url: string | null
  thumbnail_url: string | null
  views: number | null
  likes: number | null
  linked_product_id: string | null   // FK → digital_products
  notes: string | null
  created_at: string
  updated_at: string
}

// ─────────────────────────────────────────────
// SALES (unified across all channels)
// ─────────────────────────────────────────────
export type SaleChannel = 'vinted' | 'gumroad' | 'wallapop' | 'directo' | 'otro'
export type SaleStatus = 'completada' | 'pendiente' | 'reembolsada' | 'cancelada'

export interface Sale {
  id: string
  channel: SaleChannel
  status: SaleStatus
  amount: number
  fees: number | null
  net_amount: number | null
  product_type: 'book' | 'digital'
  book_id: string | null
  digital_product_id: string | null
  buyer_name: string | null
  notes: string | null
  sold_at: string
  created_at: string
}

// ─────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────
export interface DashboardStats {
  total_revenue: number
  total_sales: number
  books_available: number
  digital_products_published: number
  content_in_production: number
  revenue_this_month: number
  sales_this_month: number
}
