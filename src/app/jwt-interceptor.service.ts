import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { CognitoService } from './cognito.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  readonly doNotInterceptDomains = [];

  constructor(private cognitoService: CognitoService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
 
    for (const domain of this.doNotInterceptDomains) {
      if (request.url.includes(domain)) {
        return next.handle(request);
      }
    }

    const accessToken = this.cognitoService.getAccessToken();

    if (accessToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }

    return next.handle(request);
  }
}
