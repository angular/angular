// #docplaster
// #docregion
import {HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Inject, Injectable, Optional} from '@angular/core';

// #enddocregion
// NOTE:
//
// This interceptor is not needed in this example app, because the app uses
// `@nguniversal/express-engine`, which takes care of converting URLs to absolute automatically.
// Such an interceptor would only be needed if the app did not use an `@nguniversal/*-engine`
// package.
//
// The interceptor will have no effect here, because
// `SOME_TOKEN_UNDER_WHICH_THE_FULL_URL_IS_PROVIDED` is not provided and thus `fullUrl` will be
// `null`.

// #docregion
@Injectable()
export class AbsoluteUrlInterceptor implements HttpInterceptor {
  constructor(
      @Inject('SOME_TOKEN_UNDER_WHICH_THE_FULL_URL_IS_PROVIDED') @Optional()
      private fullUrl: URL | null) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (this.fullUrl !== null) {
      req = req.clone({
        url: `${this.fullUrl.protocol}//${this.fullUrl.host}/${req.url.replace(/^\//, '')}`,
      });
    }
    return next.handle(req);
  }
}
// #enddocregion
