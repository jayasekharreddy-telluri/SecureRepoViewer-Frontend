import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success.html',
  styleUrls: ['./success.css']
})
export class Success implements OnInit {
  userData: any = null;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const login = params['login'];
      const avatar_url = params['avatar'];
      const name = params['name'];

      if (login && avatar_url) {
        this.userData = {
          login: login,
          avatar_url: decodeURIComponent(avatar_url),
          name: name || login,
          html_url: `https://github.com/${login}`
        };
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  logout(): void {
    // 1. Open GitHub logout page in a new tab
    window.open('https://github.com/logout', '_blank');

    // 2. Clear user data from the app
    this.userData = null;

    // 3. Navigate to login page
    this.router.navigate(['/login']);
  }
}
