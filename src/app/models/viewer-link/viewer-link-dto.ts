export interface ViewerLinkDTO {
  viewerId: string;           // <-- REQUIRED
  viewerUrl: string;          // <-- REQUIRED
  repoUrl: string;            // <-- REQUIRED
  viewsLeft: number;
  maxViews: number;
  expiresAt: string;
  status: string;
  expiresAtFormatted?: string; // Optional - used only for UI formatting

  url?: string;               // <-- Add this line
}
