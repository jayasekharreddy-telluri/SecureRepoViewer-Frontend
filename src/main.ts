import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app/app.component';
import { Share } from './app/components/share/share';
import { Access } from './app/components/access/access';
import { Success } from './app/components/success/success';
import { Error } from './app/components/error/error';
import { Login } from './app/components/login/login';
import { ViewerLinks} from './app/components/viewerlinks/viewerlinks';

const routes: Routes = [
  { path: '', component: Login },
  { path: 'login', component: Login },
  { path: 'share', component: Share },
  { path: 'access', component: Access },
  { path: 'success', component: Success },
  { path: 'error', component: Error },
  { path: 'viewerlinks', component: ViewerLinks} ];

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      ToastrModule.forRoot({
        positionClass: 'toast-bottom-right',
        timeOut: 3000,
        progressBar: true,
        closeButton: true
      }),
      HttpClientModule
    ),
    provideAnimations(),
    provideRouter(routes)
  ]
}).catch(err => console.error(err));
