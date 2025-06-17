// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Routes } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app/app.component';
import { Share } from './app/components/share/share';
import { Access } from './app/components/access/access';
import { Login } from './app/components/login/login';

import { ErrorInterceptor } from './app/interceptors/error.interceptor';


const routes: Routes = [
  { path: '', component: Login },
  { path: 'login', component: Login },
  { path: 'share', component: Share },
  { path: 'access', component: Access },
  { path: 'access/:viewerId', component: Access }
];

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      HttpClientModule,
      ToastrModule.forRoot({
        positionClass: 'toast-bottom-right',
        timeOut: 3000,
        progressBar: true,
        closeButton: true
      })
    ),
    provideAnimations(),
    provideRouter(routes),

    // Interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ]
}).catch(err => console.error(err));
