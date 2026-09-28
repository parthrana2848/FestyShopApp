// ============================================================
// Section Types — mapped from GET /api/sections?page=1&limit=10
// Response shape is defined in api-guide.http (List Sections)
// ============================================================

/** Supported section layout types from the API */
export type SectionType = 'banner' | 'grid' | 'horizontal_list';

/** Publication status — only "published" sections are rendered */
export type SectionStatus = 'published' | 'draft' | 'archived';

/** Data source mode — "static" means items[] is used; "dynamic" means backend controls items */
export type DataSourceType = 'static' | 'dynamic';

/**
 * CTA (Call-To-Action) shape on each item.
 * type can be "category", "product", "screen", "url", etc.
 * value is the ID or path to navigate to.
 */
export interface SectionCTA {
  type: string;
  value: string;
}

/** A single item inside a section (card, banner slide, grid tile, etc.) */
export interface SectionItem {
  _id?: string;
  image: string;
  title?: string;
  subtitle?: string;
  cta: SectionCTA;
}

/** Controls where the items data comes from */
export interface SectionDataSource {
  type: DataSourceType;
  /** Optional API endpoint reference for dynamic sections */
  endpoint?: string;

}

export type LayoutConfig = {
  columns?: number;          // grid
  itemSpacing?: number;
  scrollDirection?: "horizontal" | "vertical";
  aspectRatio?: number;      // banner
  height?: number;           // banner
  autoScroll?: boolean;      // banner
  visibleItems?: number;     // horizontal list
  threshold?: number;        // your use-case

  //Title Style Config
  title?: {
    fontSize?: number;
    fontWeight?: "400" | "500" | "600" | "700" | "800";
    color?: string;
    align?: "left" | "center" | "right";
    marginBottom?: number;
    marginHorizontal?: number;
    textTransform?: "none" | "uppercase" | "capitalize";

    backgroundColor?: string;
    padding?: number;
    borderRadius?: number;
    letterSpacing?: number;
  };

};

/**
 * Main Section model — maps directly to each object in data[] from the API response.
 * Fields match the JSON documented in api-guide.http.
 */
export interface Section {
  _id: string;
  type: SectionType;
  layoutConfig?: LayoutConfig;
  title: string;
  status: SectionStatus;
  isActive: boolean;
  /** Lower value = shown first in the list */
  displayOrder: number;
  /** Higher value = shown first when displayOrder ties */
  priority: number;
  dataSource: SectionDataSource;
  /** Only present when type = "grid" */
  columns?: number;
  /** Items array — used when dataSource.type = "static" */
  items: SectionItem[];
  festival?: string;
  createdAt: string;
  updatedAt: string;
}

/** Meta object inside the paginated list response */
export interface SectionsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Full API response shape for GET /api/sections?page=1&limit=10 */
export interface SectionsResponse {
  data: Section[];
  meta: SectionsMeta;
}
