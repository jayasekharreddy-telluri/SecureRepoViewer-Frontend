import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ViewerLinkRequest } from '../models/viewer-link/viewer-link-request';
import { ViewerLinkViewResponse } from '../models/viewer-link/viewer-link-view-response';
import { ViewerLinkUpdateRequest } from '../models/viewer-link/viewer-link-update-request';
import { ErrorDTO } from '../models/viewer-link/error-dto';
import { SuccessDTO } from '../models/viewer-link/success-dto';
import { ViewerLinkAccessDTO } from '../models/viewer-link/viewer-link-access-dto';
import { ViewerLinkContentResponse } from '../models/viewer-link/viewer-link-content-response';
import { ViewerLinkDTO } from '../models/viewer-link/viewer-link-dto';


@Injectable({
  providedIn: 'root'
})
export class ViewerLinkService {
  private baseUrl = 'http://localhost:8080/api/viewer-links';

  constructor(private http: HttpClient) {}

  // Create a new viewer link
  createViewerLink(payload: ViewerLinkRequest): Observable<SuccessDTO | ErrorDTO> {
    
    return this.http.post<SuccessDTO | ErrorDTO>(`${this.baseUrl}/create`, payload);
  }

  // Update an existing viewer link
  updateViewerLink(viewerId: string, payload: ViewerLinkUpdateRequest): Observable<SuccessDTO | ErrorDTO> {
    return this.http.put<SuccessDTO | ErrorDTO>(`${this.baseUrl}/${viewerId}`, payload);
  }

  // Delete a viewer link (mark as deleted)
  deleteViewerLink(viewerId: string): Observable<SuccessDTO | ErrorDTO> {
    return this.http.delete<SuccessDTO | ErrorDTO>(`${this.baseUrl}/${viewerId}`);
  }

  // Get viewer status (repo URL and views left)
  getViewerStatus(viewerId: string): Observable<ViewerLinkAccessDTO | ErrorDTO> {
    return this.http.get<ViewerLinkAccessDTO | ErrorDTO>(`${this.baseUrl}/viewer/${viewerId}`);
  }

  // Get repository content for viewer
  getViewerContent(viewerId: string): Observable<ViewerLinkContentResponse | ErrorDTO> {
    return this.http.get<ViewerLinkContentResponse | ErrorDTO>(`${this.baseUrl}/content/${viewerId}`);
  }

  // Get all viewer links
  getAllViewerLinks(): Observable<ViewerLinkDTO[]> {
    return this.http.get<ViewerLinkDTO[]>(`${this.baseUrl}`);
  }
}
