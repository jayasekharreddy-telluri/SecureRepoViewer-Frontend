import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ViewerLink {
  id: string;
  name?: string;
  url: string;
  views: number;
  maxViews: number;
  expires: string;
}

@Component({
  selector: 'app-viewer-links',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './viewerlinks.html',
  styleUrls: ['./viewerlinks.css']
})
export class ViewerLinks implements OnInit {
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
}
