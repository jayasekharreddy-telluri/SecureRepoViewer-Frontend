import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ViewerLinkRequest } from '../models/viewer-link/viewer-link-request';
import { ViewerLinkViewResponse } from '../models/viewer-link/viewer-link-view-response';
import { ViewerLinkUpdateRequest } from '../models/viewer-link/viewer-link-update-request';
import { ErrorDTO } from '../models/viewer-link/error-dto';
import { SuccessDTO } from '../models/viewer-link/success-dto';
import { ViewerLinkDTO } from '../models/viewer-link/viewer-link-dto';
import { PaginatedViewerLinks } from '../models/viewer-link/paginated-viewer-links ';

@Injectable({
  providedIn: 'root'
})
export class ViewerLinkService {
  private baseUrl = 'http://localhost:8080/api/viewer-links';

  constructor(private http: HttpClient) {}

  // Create a new viewer link
  createViewerLink(payload: ViewerLinkRequest): Observable<SuccessDTO | ErrorDTO> {
    const shareId = localStorage.getItem('shareId');
    if (!shareId) {
      throw new Error('No shareId found in localStorage.');
    }

    const enrichedPayload = {
      ...payload,
      shareId: shareId
    };

    return this.http.post<SuccessDTO | ErrorDTO>(`${this.baseUrl}/create`, enrichedPayload);
  }

  // Update an existing viewer link
  updateViewerLink(viewerId: string, payload: ViewerLinkUpdateRequest): Observable<SuccessDTO | ErrorDTO> {
    return this.http.put<SuccessDTO | ErrorDTO>(`${this.baseUrl}/${viewerId}`, payload);
  }

  // Delete a viewer link (mark as deleted)
  deleteViewerLink(viewerId: string): Observable<SuccessDTO | ErrorDTO> {
    return this.http.delete<SuccessDTO | ErrorDTO>(`${this.baseUrl}/${viewerId}`);
  }

  // Get all viewer links (paginated)
  getViewerLinksPaginated(page: number, size: number): Observable<PaginatedViewerLinks> {

    const shareId = localStorage.getItem('shareId') || '';
    const headers = { 'X-Share-Id': shareId };

  return this.http.get<PaginatedViewerLinks>(
    `${this.baseUrl}?page=${page}&size=${size}`,
    { headers }
  );
  }
}
