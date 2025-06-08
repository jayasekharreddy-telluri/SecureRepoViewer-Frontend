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
      const shareId = params['shareId'];
      if (shareId) {
        this.shareId = shareId;
        this.toastr.info(`Share ID loaded: ${this.shareId}`, 'Info');
        this.loadViewerLinks();
      } else {
        this.toastr.warning('Share ID missing in URL query params!', 'Warning');
      }
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

    this.repoSearchService.searchRepos(this.repoSearch, this.shareId).subscribe({
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

loadViewerLinks(): void {
  this.viewerLinkService.getAllViewerLinks().subscribe({
    next: (links: ViewerLinkDTO[]) => {
      this.viewerLinks = links.map(link => ({
        ...link,
        expiresAtFormatted: this.safeFormatDate(link.expiresAt),
        url: `http://localhost:4200/access/${link.viewerId}`,
        status: this.isExpired(link) ? 'expired' : 'active',
      }));
    },
    error: () => {
      this.toastr.error('Failed to load viewer links.');
    }
  });
}




  extractRepoName(url: string): string {
  const parts = url.split('/');
  let repoName = parts[parts.length - 1];
  if (repoName.endsWith('.git')) {
    repoName = repoName.slice(0, -4); // remove last 4 chars ".git"
  }
  return repoName;
}

  editLink(): void {
    
    
  }

  deleteLink(): void {
    
  }
}
