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
import { BranchDTO } from '../../models/branch.dto';

@Component({
  selector: 'app-share',
  standalone: true,
  templateUrl: './share.html',
  styleUrls: ['./share.css'],
  imports: [CommonModule, FormsModule],
})
export class Share {
  repoSearch = '';
  repoName = '';
  selectedBranch = '';
  branchSearchTerm = '';
  branchSuggestions: BranchDTO[] = [];
  filteredBranches: BranchDTO[] = [];

  expiresIn: number | null = null;
  maxViews: number | null = null;
  viewerLinks: ViewerLinkDTO[] = [];
  shareId = '';

  suggestions: RepoDto[] = [];
  selectedRepo: RepoDto | null = null;
  private suggestionClicked = false;

  selectedStatus: 'all' | 'active' | 'expired' = 'all';
  filteredLinks: ViewerLinkDTO[] = [];
  totalPages = 0;
  currentPage = 0;
  pageSize = 5;

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
        localStorage.setItem('shareId', shareIdFromUrl);
        this.shareId = shareIdFromUrl;
        this.toastr.info(`Share ID loaded from URL: ${this.shareId}`);
      } else {
        const storedShareId = localStorage.getItem('shareId');
        if (storedShareId) {
          this.shareId = storedShareId;
          this.toastr.info(`Share ID loaded from storage: ${this.shareId}`);
        } else {
          this.toastr.warning('Share ID missing. Please login again.');
          return;
        }
      }
      this.loadViewerLinks();
    });
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
        this.toastr.error('Failed to fetch repository suggestions.');
      }
    });
  }

  selectRepo(repo: RepoDto): void {
    this.suggestionClicked = true;
    this.selectedRepo = repo;
    this.repoSearch = repo.name;
    this.repoName = repo.name;
    this.suggestions = [];
    this.branchSearchTerm = '';
    this.selectedBranch = '';
    this.branchSuggestions = [];
    this.filteredBranches = [];

    this.repoSearchService.getBranchesByRepo(this.shareId, this.repoName).subscribe({
      next: (branches) => {
        this.branchSuggestions = branches;
      },
      error: () => this.toastr.error('Failed to fetch branches.')
    });

    setTimeout(() => this.suggestionClicked = false, 100);
  }

  validateSelection(): void {
    if (this.suggestionClicked) return;
    if (!this.selectedRepo || this.repoSearch !== this.selectedRepo.name) {
      this.repoSearch = '';
      this.repoName = '';
      this.selectedRepo = null;
      this.toastr.warning('Please select a valid repository from the list.');
    }
  }



branchSelected = false;
showNoBranchesMessage = false;

onBranchSearchChange(): void {
  this.branchSelected = false;
  const term = this.branchSearchTerm.trim().toLowerCase();

  this.filteredBranches = this.branchSuggestions.filter(branch =>
    branch.name.toLowerCase().includes(term)
  );

  this.showNoBranchesMessage = term.length > 0 && this.filteredBranches.length === 0;
}

selectBranch(branch: BranchDTO): void {
  this.branchSearchTerm = branch.name;
  this.selectedBranch = branch.name;
  this.filteredBranches = [];
  this.branchSelected = true;
  this.showNoBranchesMessage = false; // ✅ hide "no results"
}


  blockPaste(event: ClipboardEvent): void {
    event.preventDefault();
    this.toastr.warning('Paste not allowed. Please select from suggestions.');
  }

  createViewerLink(form: NgForm): void {
    if (!form.valid || !this.selectedRepo || !this.selectedBranch || this.maxViews == null || this.expiresIn == null) {
      this.toastr.error('Please fill all fields and select a valid repository and branch.');
      return;
    }

    const payload: ViewerLinkRequest = {
      repoUrl: this.repoName,
      shareId: this.shareId,
      maxViews: this.maxViews,
      expiresInMinutes: this.expiresIn,
      branchName: this.selectedBranch
    };

    this.viewerLinkService.createViewerLink(payload).subscribe({
      next: (res: SuccessDTO | ErrorDTO) => {
        if ('message' in res) {
          this.toastr.success(res.message, 'Success');
          form.resetForm();
          this.repoSearch = '';
          this.repoName = '';
          this.selectedRepo = null;
          this.selectedBranch = '';
          this.branchSearchTerm = '';
          this.expiresIn = null;
          this.maxViews = null;
          this.branchSuggestions = [];
          this.filteredBranches = [];
          this.loadViewerLinks();
        } else if ('error' in res) {
          this.toastr.error(res.error, 'Error');
        }
      },
      error: () => this.toastr.error('Failed to create viewer link.')
    });
  }

  loadViewerLinks(): void {
    this.viewerLinkService.getViewerLinksPaginated(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.viewerLinks = res.content.map(link => ({
          ...link,
          viewerId: link.viewerUrl.split('/').pop() || '',
          expiresAtFormatted: this.safeFormatDate(link.expiresAt),
          status: link.status || (this.isExpired(link) ? 'expired' : 'active'),
        }));
        this.totalPages = res.totalPages;
        this.applyFilter();
      },
      error: () => this.toastr.error('Failed to load viewer links.')
    });
  }

  safeFormatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
  }

  isExpired(link: { expiresAt: string }): boolean {
    return new Date(link.expiresAt) < new Date();
  }

  setStatusFilter(status: 'all' | 'active' | 'expired'): void {
    this.selectedStatus = status;
    this.applyFilter();
  }

  applyFilter(): void {
    this.filteredLinks = this.selectedStatus === 'all'
      ? [...this.viewerLinks]
      : this.viewerLinks.filter(link => link.status === this.selectedStatus);
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadViewerLinks();
    }
  }

  goToNextPage(): void {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.loadViewerLinks();
    }
  }

  extractRepoName(url: string): string {
    const parts = url.split('/');
    let repo = parts[parts.length - 1];
    return repo.endsWith('.git') ? repo.slice(0, -4) : repo;
  }

  deleteLink(viewerId: string): void {
    Swal.fire({
      title: 'Delete Viewer Link?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then(result => {
      if (result.isConfirmed) {
        this.viewerLinkService.deleteViewerLink(viewerId).subscribe({
          next: (res) => {
            if ('message' in res) {
              this.toastr.success(res.message, 'Deleted');
              this.loadViewerLinks();
            } else if ('error' in res) {
              this.toastr.error(res.error, 'Error');
            }
          },
          error: () => this.toastr.error('Failed to delete viewer link.')
        });
      }
    });
  }

editLink(link: ViewerLinkDTO) {
    if (link.viewsLeft <= 0) {
      this.toastr.warning("Cannot edit viewer link because views left is zero");
      return;
    }

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

        const maxViewsStr = maxViewsInput?.value.trim();
        const expiresStr = expiresInput?.value.trim();

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

}
