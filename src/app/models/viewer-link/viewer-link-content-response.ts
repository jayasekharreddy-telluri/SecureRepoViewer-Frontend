export interface ViewerLinkContentResponse {
  repoUrl: string;
  expiresAt: string;
  viewsLeft: number;
  content: any; // Or define a custom type if you know the structure of the GitHub repo content
}
