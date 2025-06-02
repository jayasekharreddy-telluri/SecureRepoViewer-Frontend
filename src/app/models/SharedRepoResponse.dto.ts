export interface SharedRepoResponse {
  repoOwner: string;
  avatarUrl: string;
  repos: Record<string, string>; // map of repo name to url
}