// #docplaster
import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHeaders, HttpRequest, HttpResponse,
  HttpInterceptor, HttpHandler
} from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { startWith, tap } from 'rxjs/operators';

import { RequestCache } from '../request-cache.service';
import { searchUrl } from '../package-search/package-search.service';


/**
 * If request is cachable (e.g., package search) and
 * response is in cache return the cached response as observable.
 * If has 'x-refresh' header that is true,
 * then also re-run the package search, using response from next(),
 * returning an observable that emits the cached response first.
 *
 * If not in cache or not cachable,
 * pass request through to next()
 */
// #docregion v1
@Injectable()
export class CachingInterceptor implements HttpInterceptor {
  constructor(private cache: RequestCache) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // 캐싱 대상이 아니면 그대로 진행합니다.
    if (!isCachable(req)) { return next.handle(req); }

    const cachedResponse = this.cache.get(req);
    // #enddocregion v1
    // #docregion intercept-refresh
    // 커스텀 헤더가 설정되면 업데이트 방식으로 동작합니다.
    if (req.headers.get('x-refresh')) {
      const results$ = sendRequest(req, next, this.cache);
      return cachedResponse ?
        results$.pipe( startWith(cachedResponse) ) :
        results$;
    }
    // 업데이트 방식을 사용하지 않고 기존 방식으로 동작합니다.
    // #docregion v1
    return cachedResponse ?
      of(cachedResponse) : sendRequest(req, next, this.cache);
    // #enddocregion intercept-refresh
  }
}
// #enddocregion v1


/** Is this request cachable? */
function isCachable(req: HttpRequest<any>) {
  // Only GET requests are cachable
  return req.method === 'GET' &&
    // Only npm package search is cachable in this app
    -1 < req.url.indexOf(searchUrl);
}

// #docregion send-request
/**
 * `next()` 함수를 실행해서 서버로 요청을 보냅니다.
 * 서버에서 받은 응답은 캐싱합니다.
 */
function sendRequest(
  req: HttpRequest<any>,
  next: HttpHandler,
  cache: RequestCache): Observable<HttpEvent<any>> {

  // npm 검색 API에는 헤더가 필요 없습니다.
  const noHeaderReq = req.clone({ headers: new HttpHeaders() });

  return next.handle(noHeaderReq).pipe(
    tap(event => {
      // 서버의 응답은 HttpResponse 타입이 아닐 수도 있습니다.
      if (event instanceof HttpResponse) {
        cache.put(req, event); // 캐시를 업데이트합니다.
      }
    })
  );
}
// #enddocregion send-request

