export interface ViewerLinkRequest {
  shareId: string;
  repoUrl: string;
  maxViews: number;
  expiresInMinutes: number;
}
