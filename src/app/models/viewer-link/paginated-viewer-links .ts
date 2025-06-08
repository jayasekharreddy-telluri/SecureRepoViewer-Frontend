import { ViewerLinkDTO } from "./viewer-link-dto";

export interface PaginatedViewerLinks {
  content: ViewerLinkDTO[];  // The list of items on the current page
  page: number;              // Current page number (usually zero-based)
  size: number;              // Number of items per page
  totalPages: number;        // Total number of pages available
  totalElements: number;     // Total number of items across all pages
}
