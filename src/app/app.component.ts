import { Component } from '@angular/core';
import { MaterialModule } from './material.module';
import { RouterModule } from '@angular/router';

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
}
