import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FileNode } from '../file-node/file-node';
import { MonacoViewer } from '../monaco-viewer/monaco-viewer';

@Component({
  selector: 'app-access',
  standalone: true,
  imports: [CommonModule, FileNode, MonacoViewer],
  templateUrl: './access.html',
  styleUrls: ['./access.css']
})
export class Access implements OnInit {
  viewerId: string = '';
  fileTree: any[] = [];
  selectedFilePath: string = '';
  selectedFileContent: string = '';
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.viewerId = this.route.snapshot.paramMap.get('viewerId') || '';
    if (!this.viewerId) {
      this.error = 'Invalid viewer ID in URL.';
      return;
    }
    this.fetchFileTree();
  }

  fetchFileTree() {
    this.http.get<any[]>(`http://localhost:8080/api/repo/viewer-file-tree?viewerId=${this.viewerId}`)
      .subscribe({
        next: (data) => {
          this.fileTree = data;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load file tree.';
          this.loading = false;
        }
      });
  }

  onFileSelected(path: string) {
    this.selectedFilePath = path;
    this.fetchFileContent(path);
  }

 fetchFileContent(path: string) {
  console.log('Fetching content for:', path); // Debug
  this.http.get(`http://localhost:8080/api/repo/file-content`, {
    params: { viewerId: this.viewerId, path: path },
    responseType: 'text'
  }).subscribe({
    next: (data) => {
      console.log('Fetched content:', data); // Debug
      this.selectedFileContent = data;
    },
    error: () => {
      this.selectedFileContent = 'Failed to load file content.';
    }
  });
}

}
