// #docregion reading-context
import {retry} from 'rxjs';
// #enddocregion reading-context

// #docregion mutable-context
import {retry, tap} from 'rxjs';
// #enddocregion mutable-context

// #docregion context-token
export const ERROR_COUNT = new HttpContextToken(() => 0);
// #endocregion context-token

export class FakeService {
  constructor(private httpClient: HttpClient) {}
  // #docregion set-context
  this.http.get('/data/feed', {
    context: new HttpContext().set(RETRY_COUNT, 5),
  }).subscribe(results => {...});
  // #endocregion set-context
}

// #docregion reading-context
export class RetryInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const retryCount = req.context.get(RETRY_COUNT);

    // Use the RxJS retry() operator to retry the request a configurable number of times.
    return next.handle(req).pipe(retry(retryCount));
  }
}
// #enddocregion reading-context

// #docregion mutable-context
export const ERROR_COUNT = new HttpContextToken(() => 0);

export class RetryInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const retryCount = req.context.get(RETRY_COUNT);

    return next.handle(req).pipe(
      tap(null, () => {
        // An error has occurred, so increment this request's ERROR_COUNT.
        req.set(ERROR_COUNT, req.get(ERROR_COUNT) + 1);
      }),
      retry(retryCount)
    );
  }
}
// #enddocregion mutable-context
