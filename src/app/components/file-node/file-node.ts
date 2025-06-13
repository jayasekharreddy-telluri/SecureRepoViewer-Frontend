import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-node',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-node.html',
  styleUrls: ['./file-node.css']
})
export class FileNode {
  @Input() node: any;
  @Output() fileSelected = new EventEmitter<string>();

  expanded = false;

  toggle() {
    if (this.node.directory) {
      this.expanded = !this.expanded;
    } else {
      this.fileSelected.emit(this.node.path);
    }
  }
}
