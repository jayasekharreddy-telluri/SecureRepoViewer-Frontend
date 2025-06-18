// login.ts
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  loginWithGitHub() {
  window.location.href = 'https://github-share-backend-1.onrender.com/api/auth/github';
}

}
