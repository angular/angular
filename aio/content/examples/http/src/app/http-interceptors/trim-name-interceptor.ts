import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable()
export class TrimNameInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const body = req.body;
    if (!body || !body.name ) {
      return next.handle(req);
    }
    // #docregion excerpt
    // HTTP 바디를 복사하면서 name 필드의 공백을 제거합니다.
    const newBody = { ...body, name: body.name.trim() };
    // HTTP 요청 객체의 인스턴스를 복제하면서 새로운 바디를 적용합니다.
    const newReq = req.clone({ body: newBody });
    // 수정한 HTTP 요청을 다음 핸들러에 전달합니다.
    return next.handle(newReq);
    // #enddocregion excerpt
  }
}
