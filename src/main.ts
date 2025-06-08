import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { Share } from './app/components/share/share';
import { Access } from './app/components/access/access';
import { Success } from './app/components/success/success';
import { Error } from './app/components/error/error';
import { Login } from './app/components/login/login';

const routes: Routes = [
  { path: '', component: Login },
  { path: 'login', component: Login },
  { path: 'share', component: Share },
  { path: 'access', component: Access },
  { path: 'success', component: Success },
  { path: 'error', component: Error }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(HttpClientModule) // <-- provide HttpClientModule globally
  ]
}).catch(err => console.error(err));
