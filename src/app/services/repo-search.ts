import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RepoDto } from '../models/repo.dto';
import { SharedRepoResponse } from '../models/SharedRepoResponse.dto';
import { BranchDTO } from '../models/branch.dto';

@Injectable({
  providedIn: 'root'
})
export class RepoSearchService {
  private baseUrl = 'https://github-share-backend-1.onrender.com/api';

  constructor(private http: HttpClient) {}

  // Automatically use shareId from localStorage
  getRepo(): Observable<SharedRepoResponse> {
    const shareId = localStorage.getItem('shareId');
    if (!shareId) {
      throw new Error('No shareId found in localStorage.');
    }

    return this.http.get<SharedRepoResponse>(`${this.baseUrl}/repo/${shareId}`);
  }

  searchRepos(query: string): Observable<RepoDto[]> {
    const shareId = localStorage.getItem('shareId');
    if (!shareId) {
      throw new Error('No shareId found in localStorage.');
    }

    const params = new HttpParams()
      .set('q', query)
      .set('shareId', shareId);

    return this.http.get<RepoDto[]>(`${this.baseUrl}/repo-search`, { params });
  }

   getBranchesByRepo(shareId: string, repo: string, search?: string): Observable<BranchDTO[]> {
  let url = `${this.baseUrl}/repo/${shareId}/branches?repo=${encodeURIComponent(repo)}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  return this.http.get<BranchDTO[]>(url);
}

}
