import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RepoDto } from '../../models/repo.dto';
import { RepoSearchService } from '../../services/repo-search';
import { Share } from '../share/share';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './success.html',
  styleUrls: ['./success.css']
})
export class Success implements OnInit {
  shareId: string = '';
  userLogin: string = '';
  avatarUrl: string = '';
  searchTerm: string = '';
  filteredRepos: RepoDto[] = [];
  selectedRepo: RepoDto | null = null;
  isLoading: boolean = false;
  repos: RepoDto[] = [];

  constructor(
    private route: ActivatedRoute,
    private successSer: RepoSearchService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const shareId = params['shareId'];
      if (shareId) {
        this.shareId = shareId;
        this.fetchUserData(shareId);
      }
    });
  }

  fetchUserData(shareId: string): void {
    this.successSer.getSharedRepo(shareId).subscribe({
      next: data => {
        if (!data.repoOwner || !data.avatarUrl || !data.repos) return;

        this.userLogin = data.repoOwner;
        this.avatarUrl = data.avatarUrl;
        this.repos = Object.entries(data.repos).map(([name, url]) => ({
          name,
          url: url as string
        }));
      },
      error: err => {
        console.error('❌ API call failed:', err);
      }
    });
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value.trim();
    this.searchTerm = query;
    this.selectedRepo = null;

    if (!query) {
      this.filteredRepos = [];
      return;
    }

    this.isLoading = true;

    this.successSer.searchRepos(query, this.shareId).subscribe({
      next: results => {
        this.filteredRepos = results;
        this.isLoading = false;
      },
      error: err => {
        console.error('Search error:', err);
        this.filteredRepos = [];
        this.isLoading = false;
      }
    });
  }

  selectRepo(repo: RepoDto): void {
    this.selectedRepo = repo;
    this.filteredRepos = [];
    this.searchTerm = repo.name;
  }

  copyToClipboard(url: string): void {
    navigator.clipboard.writeText(url).then(() => {
      alert('URL copied to clipboard!');
    }).catch(err => {
      console.error('Copy failed:', err);
      alert('Failed to copy URL.');
    });
  }

  resetSelection(): void {
    this.selectedRepo = null;
    this.searchTerm = '';
    this.filteredRepos = [];
  }
}
