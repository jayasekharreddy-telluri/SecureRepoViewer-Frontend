import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RepoViewerService {
  private baseUrl = 'https://github-share-backend-1.onrender.com/api/repo';

  constructor(private http: HttpClient) {}

  getFileTree(viewerId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/viewer-file-tree`, {
      params: { viewerId }
    });
  }

  getFileContent(viewerId: string, path: string): Observable<string> {
    return this.http.get(`${this.baseUrl}/file-content`, {
      params: { viewerId, path },
      responseType: 'text'
    });
  }
}
