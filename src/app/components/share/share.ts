import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { RepoDto } from '../../models/repo.dto';
import { RepoSearchService } from '../../services/repo-search';
import { ViewerLinkService } from '../../services/viewer-link';
import { ViewerLinkDTO } from '../../models/viewer-link/viewer-link-dto';
import { ViewerLinkRequest } from '../../models/viewer-link/viewer-link-request';
import { ViewerLinkViewResponse } from '../../models/viewer-link/viewer-link-view-response';
import { ErrorDTO } from '../../models/viewer-link/error-dto';
import { SuccessDTO } from '../../models/viewer-link/success-dto';
import Swal from 'sweetalert2';
import { ViewerLinkUpdateRequest } from '../../models/viewer-link/viewer-link-update-request';

@Component({
  selector: 'app-share',
  standalone: true,
  templateUrl: './share.html',
  styleUrls: ['./share.css'],
  imports: [CommonModule, FormsModule],
})
export class Share {
  repoSearch: string = '';
  repoName: string = '';
  expiresIn: number | null = null;
  maxViews: number | null = null;
  viewerLinks: ViewerLinkDTO[] = [];
  shareId: string = '';

  suggestions: RepoDto[] = [];
  selectedRepo: RepoDto | null = null;

  // Flag to prevent premature validation on blur when clicking suggestion
  private suggestionClicked: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private repoSearchService: RepoSearchService,
    private viewerLinkService: ViewerLinkService
  ) {}

  ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    const shareIdFromUrl = params['shareId'];

    if (shareIdFromUrl) {
      // If URL has new shareId -> overwrite localStorage
      localStorage.setItem('shareId', shareIdFromUrl);
      this.shareId = shareIdFromUrl;
      this.toastr.info(`Share ID loaded from URL: ${this.shareId}`, 'Info');
    } else {
      // Else try getting from localStorage
      const storedShareId = localStorage.getItem('shareId');
      if (storedShareId) {
        this.shareId = storedShareId;
        this.toastr.info(`Share ID loaded from local storage: ${this.shareId}`, 'Info');
      } else {
        this.toastr.warning('Share ID missing! Please login again.', 'Warning');
        return; // 🚫 Stop further action
      }
    }

    // ✅ Now safe to load viewer links
    this.loadViewerLinks();
  });
}

  

  safeFormatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
  }

  isExpired(link: { expiresAt: string }): boolean {
    return new Date(link.expiresAt) < new Date();
  }

  onSearchChange(): void {
    if (this.repoSearch.trim().length < 2) {
      this.suggestions = [];
      return;
    }

    this.repoSearchService.searchRepos(this.repoSearch).subscribe({
      next: (repos) => this.suggestions = repos,
      error: () => {
        this.suggestions = [];
        this.toastr.error('Error fetching repo suggestions.');
      },
    });
  }

  // Called when user clicks on a suggestion
  selectRepo(repo: RepoDto): void {
    this.suggestionClicked = true;
    this.selectedRepo = repo;
    this.repoSearch = repo.name;
    this.repoName = repo.url;
    this.suggestions = [];

    // Reset flag after short delay so blur can validate if needed
    setTimeout(() => this.suggestionClicked = false, 100);
  }

  // Prevent pasting into input, force user to select from suggestions
  blockPaste(event: ClipboardEvent): void {
    event.preventDefault();
    this.toastr.warning('Paste not allowed. Please select from suggestions.');
  }

  // Validate input on blur — only if user didn't just click a suggestion
  validateSelection(): void {
    if (this.suggestionClicked) {
      return; // Skip validation because user is selecting a suggestion
    }
    if (!this.selectedRepo || this.repoSearch !== this.selectedRepo.name) {
      this.repoSearch = '';
      this.repoName = '';
      this.selectedRepo = null;
      this.toastr.warning('Invalid selection. Choose from the list only.');
    }
  }

  createViewerLink(form: NgForm): void {
  if (!form.valid || !this.selectedRepo || this.maxViews === null || this.expiresIn === null) {
    this.toastr.error('Fill all fields and select a repo from suggestions.', 'Validation Error');
    return;
  }

  if (this.repoSearch !== this.selectedRepo.name) {
    this.toastr.error('Please select a repository from the suggestions list.', 'Validation Error');
    return;
  }

  const payload: ViewerLinkRequest = {
    repoUrl: this.repoName,
    shareId: this.shareId,
    maxViews: this.maxViews,
    expiresInMinutes: this.expiresIn
  };

  this.viewerLinkService.createViewerLink(payload).subscribe({
    next: (response: SuccessDTO | ErrorDTO) => {
      if ('message' in response) {
        // Success case
        this.toastr.success(response.message, 'Success');
        form.resetForm();
        this.repoSearch = '';
        this.repoName = '';
        this.expiresIn = null;
        this.maxViews = null;
        this.selectedRepo = null;

        // Reload viewer links from backend to sync UI
        this.loadViewerLinks();
      } else if ('error' in response) {
        this.toastr.error(response.error, 'Error');
      } else {
        this.toastr.error('Unexpected response from server', 'Error');
      }
    },
    error: (err) => {
      this.toastr.error(err.error?.error || 'Failed to create viewer link.', 'Error');
    }
  });
}

selectedStatus: 'all' | 'active' | 'expired' = 'all';
//viewerLinks: ViewerLinkDTO[] = [];
filteredLinks: ViewerLinkDTO[] = [];  // This is what UI should use for display
totalPages: number = 0;
currentPage = 0;
pageSize = 5;

loadViewerLinks(): void {
  this.viewerLinkService.getViewerLinksPaginated(this.currentPage, this.pageSize).subscribe({
    next: (paginatedData) => {
      this.viewerLinks = paginatedData.content.map(link => ({
  ...link,
  viewerId: link.viewerUrl.split('/').pop() || '',
  expiresAtFormatted: this.safeFormatDate(link.expiresAt),
  viewerUrl: link.viewerUrl,
  status: link.status || (this.isExpired(link) ? 'expired' : 'active'),
}));
      
      this.totalPages = paginatedData.totalPages;

      // Apply filter after loading
      this.applyFilter();
    },
    error: () => {
      this.toastr.error('Failed to load viewer links.');
    }
  });
}

setStatusFilter(status: 'all' | 'active' | 'expired'): void {
  this.selectedStatus = status;
  this.applyFilter();
}

applyFilter(): void {
  if (this.selectedStatus === 'all') {
    this.filteredLinks = [...this.viewerLinks];
  } else {
    this.filteredLinks = this.viewerLinks.filter(link => link.status === this.selectedStatus);
  }
}


goToPreviousPage() {
  if (this.currentPage > 0) {
    this.currentPage--;
    this.loadViewerLinks();  // re-fetch links for the new page
  }
}

goToNextPage() {
  if (this.currentPage + 1 < this.totalPages) {
    this.currentPage++;
    this.loadViewerLinks();  // re-fetch links for the new page
  }
}




  extractRepoName(url: string): string {
  const parts = url.split('/');
  let repoName = parts[parts.length - 1];
  if (repoName.endsWith('.git')) {
    repoName = repoName.slice(0, -4); // remove last 4 chars ".git"
  }
  return repoName;
}



deleteLink(viewerId: string): void {
  Swal.fire({
    title: 'Are you sure?',
    text: 'This will permanently delete the link.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      this.viewerLinkService.deleteViewerLink(viewerId).subscribe({
        next: (response) => {
          if ('message' in response) {
            this.toastr.success(response.message, 'Deleted');
            this.loadViewerLinks();
          } else if ('error' in response) {
            this.toastr.error(response.error, 'Error');
          }
        },
        error: () => this.toastr.error('Failed to delete viewer link.', 'Error')
      });
    }
  });
}


editLink(link: ViewerLinkDTO) {
  if (link.viewsLeft <= 0) {
    this.toastr.warning("Cannot edit viewer link because views left is zero");
    return; // Prevent edit dialog from opening
  }

  // Existing expiration check
  const expiresAtDate = new Date(link.expiresAt);
  const now = new Date();

  if (expiresAtDate <= now) {
    this.toastr.warning("Cannot edit expired viewer link");
    return;
  }

  Swal.fire({
    title: 'Edit Viewer Link',
    html: `
      <input type="number" id="maxViews" class="swal2-input" min="1" placeholder="Max Views" value="${link.maxViews}">
      <input type="number" id="expiresInMinutes" class="swal2-input" min="1" placeholder="Expires In Minutes (optional)">
    `,
    confirmButtonText: 'Update',
    showCancelButton: true,
    focusConfirm: false,
    preConfirm: () => {
      const popup = Swal.getPopup();
      const maxViewsInput = popup?.querySelector<HTMLInputElement>('#maxViews');
      const expiresInput = popup?.querySelector<HTMLInputElement>('#expiresInMinutes');

      if (!maxViewsInput) {
        Swal.showValidationMessage('Max Views input not found');
        return;
      }

      const maxViewsStr = maxViewsInput.value?.trim();
      const expiresStr = expiresInput?.value?.trim();

      if (!maxViewsStr) {
        Swal.showValidationMessage('Max Views is required');
        return;
      }

      const maxViews = Number(maxViewsStr);
      if (isNaN(maxViews) || maxViews <= 0) {
        Swal.showValidationMessage('Max Views must be a positive number');
        return;
      }

      let expiresInMinutes: number | null = null;
      if (expiresStr) {
        expiresInMinutes = Number(expiresStr);
        if (isNaN(expiresInMinutes) || expiresInMinutes <= 0) {
          Swal.showValidationMessage('Expires In Minutes must be a positive number or left blank');
          return;
        }
      }

      return { maxViews, expiresInMinutes };
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      const payload: ViewerLinkUpdateRequest = {
        maxViews: result.value.maxViews
      };

      if (result.value.expiresInMinutes != null) {
        payload.expiresInMinutes = result.value.expiresInMinutes;
      }

      this.viewerLinkService.updateViewerLink(link.viewerId, payload).subscribe({
        next: () => {
          this.toastr.success("Viewer link updated successfully");
          this.loadViewerLinks();
        },
        error: () => {
          this.toastr.error("Failed to update viewer link");
        }
      });
    }
  });
}
onViewerLinkClick(link: ViewerLinkDTO) {
  this.viewerLinkService.getViewerStatus(link.viewerId).subscribe({
    next: (response) => {
      if ('viewsLeft' in response) {
        link.viewsLeft = response.viewsLeft;
      }

      // 👇 Convert to full URL (important!)
      const fullUrl = `${window.location.origin}/access/${link.viewerId}`;
      window.open(fullUrl, '_blank');
    },
    error: () => {
      this.toastr.error('Failed to update view count or link expired');
    }
  });
}



}
