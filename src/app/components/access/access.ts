import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FileNode } from '../file-node/file-node';
import { MonacoViewer } from '../monaco-viewer/monaco-viewer';
import { OpenedFile } from '../../models/opened-file.model';
import { RepoViewerService } from '../../services/repo-viewer.service';
import { ToastrService } from 'ngx-toastr';

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

  contextMenuVisible = false;
  contextMenuX = 0;
  contextMenuY = 0;
  contextMenuIndex = -1;

  constructor(
    private route: ActivatedRoute,
    private viewerService: RepoViewerService,
     private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.viewerId = this.route.snapshot.paramMap.get('viewerId') || '';
    if (!this.viewerId) {
      this.error = 'Invalid viewer ID in URL.';
      return;
    }
    this.fetchFileTree();

    document.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  fetchFileTree() {
    this.viewerService.getFileTree(this.viewerId).subscribe({
      next: (data) => {
        this.fileTree = data;
        this.loading = false;
        this.toastr.success('File tree loaded successfully!', 'Success');
      },
      error: () => {
        this.error = 'Failed to load file tree.';
        console.error(this.error);
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
      this.viewerService.getFileContent(this.viewerId, path).subscribe({
        next: (data) => {
          const newFile: OpenedFile = { path, name, content: data };
          this.openedFiles.push(newFile);
          this.activeFileIndex = this.openedFiles.length - 1;
           this.toastr.success(`Opened file: ${name}`, 'Success');
        },
        error: (err) => {
         const backendMessage = err?.error || 'Unknown error occurred.';
    const newFile: OpenedFile = { path, name, content: backendMessage };
    this.openedFiles.push(newFile);
    this.activeFileIndex = this.openedFiles.length - 1;
    //this.toastr.error(backendMessage, `Failed to open file: ${name}`);
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
    this.contextMenuVisible = false;
  }

  activateTab(index: number) {
    this.activeFileIndex = index;
  }

  onTabRightClick(event: MouseEvent, index: number) {
    event.preventDefault();
    this.contextMenuIndex = index;
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.contextMenuVisible = true;
  }

  closeOtherTabs(index: number) {
    const current = this.openedFiles[index];
    this.openedFiles = [current];
    this.activeFileIndex = 0;
    this.contextMenuVisible = false;
  }

  closeTabsToRight(index: number) {
    this.openedFiles = this.openedFiles.slice(0, index + 1);
    if (this.activeFileIndex > index) {
      this.activeFileIndex = index;
    }
    this.contextMenuVisible = false;
  }

  closeTabsToLeft(index: number) {
    this.openedFiles = this.openedFiles.slice(index);
    this.activeFileIndex = this.activeFileIndex - index;
    this.contextMenuVisible = false;
  }

  closeAllTabs() {
    this.openedFiles = [];
    this.activeFileIndex = -1;
    this.contextMenuVisible = false;
  }

  @HostListener('document:click')
  hideContextMenu() {
    this.contextMenuVisible = false;
  }
}
