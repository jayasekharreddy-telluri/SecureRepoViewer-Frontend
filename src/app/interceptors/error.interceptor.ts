import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private toastr: ToastrService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let userMessage = 'Unexpected error occurred.';

        if (error.status === 0) {
          userMessage = '🚫 No internet connection. Please check your network.';
        } else if (error.status === 503) {
          userMessage = '⚠️ Service unavailable. Try again later.';
        } else if (error.status === 500) {
          userMessage = '💥 Server error. Please contact support.';
        } else if (error.status === 404) {
          userMessage = '🔍 Resource not found.';
        } else if (error.status === 400) {
          userMessage = error.error?.error || 'Bad request.';
        }

        this.toastr.error(userMessage, 'Error');
        return throwError(() => error);
      })
    );
  }
}
