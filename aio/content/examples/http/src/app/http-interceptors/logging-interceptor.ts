import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler,
  HttpRequest, HttpResponse
} from '@angular/common/http';

// #docregion excerpt
import { finalize, tap } from 'rxjs/operators';
import { MessageService } from '../message.service';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  constructor(private messenger: MessageService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const started = Date.now();
    let ok: string;

    // 서버에서 받은 응답 옵저버블을 체이닝합니다.
    return next.handle(req)
      .pipe(
        tap(
          // 서버에서 응답을 받으면 성공한 것으로 판단합니다.
          event => ok = event instanceof HttpResponse ? 'succeeded' : '',
          // 요청이 실패한 경우를 처리합니다. error 객체는 HttpErrorResponse 타입입니다.
          error => ok = 'failed'
        ),
        // HTTP 요청이 성공한 경우와 실패한 경우 모두 응답 시간을 로그로 출력합니다.
        finalize(() => {
          const elapsed = Date.now() - started;
          const msg = `${req.method} "${req.urlWithParams}"
             ${ok} in ${elapsed} ms.`;
          this.messenger.add(msg);
        })
      );
  }
}
// #enddocregion excerpt
