import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable()
export class EnsureHttpsInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // #docregion excerpt
    // HTTP 인스턴스을 복사하면서 'http://'를 'https://'로 변경합니다.
    const secureReq = req.clone({
      url: req.url.replace('http://', 'https://')
    });
    // 다음 핸들러에는 수정된 인스턴스를 전달합니다.
    return next.handle(secureReq);
    // #enddocregion excerpt
  }
}
