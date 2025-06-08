export interface ViewerLinkViewResponse {
  viewerUrl: string;
  repoName: string;       // <-- new field added
  expiresAt: string;
  maxViews: number;
}
