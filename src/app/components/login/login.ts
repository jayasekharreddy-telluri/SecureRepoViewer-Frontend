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
    // Call your Spring Boot backend to start OAuth flow
    window.location.href = 'http://localhost:8080/auth/github';
  }
}
