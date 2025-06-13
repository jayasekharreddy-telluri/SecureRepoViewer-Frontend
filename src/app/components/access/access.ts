import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FileNode } from '../file-node/file-node';
import { MonacoViewer } from '../monaco-viewer/monaco-viewer';

interface OpenedFile {
  path: string;
  content: string;
  name: string;
}

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
  openedFiles: OpenedFile[] = [];
  activeFileIndex: number = -1;
  loading = true;
  error = '';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.viewerId = this.route.snapshot.paramMap.get('viewerId') || '';
    if (!this.viewerId) {
      this.error = 'Invalid viewer ID in URL.';
      return;
    }
    this.fetchFileTree();

    // Prevent right-click context menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());
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
    const name = path.split('/').pop() || path;
    const existingIndex = this.openedFiles.findIndex(file => file.path === path);

    if (existingIndex !== -1) {
      this.activeFileIndex = existingIndex;
    } else {
      this.http.get(`http://localhost:8080/api/repo/file-content`, {
        params: { viewerId: this.viewerId, path },
        responseType: 'text'
      }).subscribe({
        next: (data) => {
          const newFile: OpenedFile = { path, name, content: data };
          this.openedFiles.push(newFile);
          this.activeFileIndex = this.openedFiles.length - 1;
        },
        error: () => {
          const errorContent = 'Failed to load file content.';
          const newFile: OpenedFile = { path, name, content: errorContent };
          this.openedFiles.push(newFile);
          this.activeFileIndex = this.openedFiles.length - 1;
        }
      });
    }
  }

  closeTab(index: number) {
    this.openedFiles.splice(index, 1);
    if (this.activeFileIndex >= index) {
      this.activeFileIndex = Math.max(0, this.activeFileIndex - 1);
    }
    if (this.openedFiles.length === 0) {
      this.activeFileIndex = -1;
    }
  }

  activateTab(index: number) {
    this.activeFileIndex = index;
  }
}
