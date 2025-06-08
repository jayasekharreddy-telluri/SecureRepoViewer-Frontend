import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RepoDto} from '../models/repo.dto';
import { SharedRepoResponse } from '../models/SharedRepoResponse.dto';


@Injectable({
  providedIn: 'root'
})
export class RepoSearchService  {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getSharedRepo(shareId: string): Observable<SharedRepoResponse> {
    return this.http.get<SharedRepoResponse>(`${this.baseUrl}/shared-repo/${shareId}`);
  }

  searchRepos(query: string, shareId: string): Observable<RepoDto[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('shareId', shareId);

    return this.http.get<RepoDto[]>(`${this.baseUrl}/shared-repo-links/search`, { params });
  }
}
