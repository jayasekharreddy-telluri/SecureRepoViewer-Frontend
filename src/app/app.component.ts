import { Component } from '@angular/core';
import { MaterialModule } from './material.module';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    MaterialModule,
    RouterModule   // <-- Add this here
  ],
})
export class AppComponent {
  title = 'github-share-frontend';

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    window.addEventListener('offline', () => {
      this.toastr.warning('📡 You are offline. Please check your connection.');
    });
    window.addEventListener('online', () => {
      this.toastr.success('✅ You are back online!');
    });}
}
