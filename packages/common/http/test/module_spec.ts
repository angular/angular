/**
 * @license
 * Copyright Google LLC All Rights Reserved.sonpCallbackContext
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpHandler} from '../src/backend';
import {HttpClient} from '../src/client';
import {HttpContext, HttpContextToken} from '../src/context';
import {HTTP_INTERCEPTORS, HttpInterceptor} from '../src/interceptor';
import {HttpRequest} from '../src/request';
import {HttpEvent, HttpResponse} from '../src/response';
import {HttpTestingController} from '../testing/src/api';
import {HttpClientTestingModule} from '../testing/src/module';
import {TestRequest} from '../testing/src/request';
import {Injectable, Injector} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {from, isObservable, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

function toObservable<T>(result: Observable<T> | Promise<T>): Observable<T> {
  if (isObservable(result)) {
    return result;
  }
  return from(result);
}

const IS_INTERCEPTOR_C_ENABLED = new HttpContextToken<boolean | undefined>(() => undefined);

class TestInterceptor implements HttpInterceptor {
  constructor(private value: string) {}

  intercept(req: HttpRequest<any>, delegate: HttpHandler): Observable<HttpEvent<any>> | Promise<HttpEvent<any>> {
    const existing = req.headers.get('Intercepted');
    const next = !!existing ? existing + ',' + this.value : this.value;
    req = req.clone({setHeaders: {'Intercepted': next}});
    return toObservable(delegate.handle(req)).pipe(
      map((event) => {
        if (event instanceof HttpResponse) {
          const existing = event.headers.get('Intercepted');
          const next = !!existing ? existing + ',' + this.value : this.value;
          return event.clone({headers: event.headers.set('Intercepted', next)});
        }
        return event;
      }),
    );
  }
}

class InterceptorA extends TestInterceptor {
  constructor() {
    super('A');
  }
}

class InterceptorB extends TestInterceptor {
  constructor() {
    super('B');
  }
}

class InterceptorC extends TestInterceptor {
  constructor() {
    super('C');
  }

  override intercept(req: HttpRequest<any>, delegate: HttpHandler): Observable<HttpEvent<any>> | Promise<HttpEvent<any>> {
    if (req.context.get(IS_INTERCEPTOR_C_ENABLED) === true) {
      return super.intercept(req, delegate);
    }
    return delegate.handle(req);
  }
}

@Injectable()
class ReentrantInterceptor implements HttpInterceptor {
  constructor(private client: HttpClient) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> | Promise<HttpEvent<any>> {
    return next.handle(req);
  }
}

describe('HttpClientModule', () => {
  let injector: Injector;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {provide: HTTP_INTERCEPTORS, useClass: InterceptorA, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: InterceptorB, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: InterceptorC, multi: true},
      ],
    });
    injector = TestBed.inject(Injector);
  });
  it('initializes HttpClient properly', (done) => {
    injector
      .get(HttpClient)
      .get('/test', {responseType: 'text'})
      .subscribe((value: string) => {
        expect(value).toBe('ok!');
        done();
      });
    injector.get(HttpTestingController).expectOne('/test').flush('ok!');
  });
  it('intercepts outbound responses in the order in which interceptors were bound', (done) => {
    injector
      .get(HttpClient)
      .get('/test', {observe: 'response', responseType: 'text'})
      .subscribe(() => done());
    const req = injector.get(HttpTestingController).expectOne('/test') as TestRequest;
    expect(req.request.headers.get('Intercepted')).toEqual('A,B');
    req.flush('ok!');
  });
  it('intercepts outbound responses in the order in which interceptors were bound and include specifically enabled interceptor', (done) => {
    injector
      .get(HttpClient)
      .get('/test', {
        observe: 'response',
        responseType: 'text',
        context: new HttpContext().set(IS_INTERCEPTOR_C_ENABLED, true),
      })
      .subscribe((value) => done());
    const req = injector.get(HttpTestingController).expectOne('/test') as TestRequest;
    expect(req.request.headers.get('Intercepted')).toEqual('A,B,C');
    req.flush('ok!');
  });
  it('intercepts inbound responses in the right (reverse binding) order', (done) => {
    injector
      .get(HttpClient)
      .get('/test', {observe: 'response', responseType: 'text'})
      .subscribe((value: HttpResponse<string>) => {
        expect(value.headers.get('Intercepted')).toEqual('B,A');
        done();
      });
    injector.get(HttpTestingController).expectOne('/test').flush('ok!');
  });
  it('allows interceptors to inject HttpClient', (done) => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{provide: HTTP_INTERCEPTORS, useClass: ReentrantInterceptor, multi: true}],
    });
    injector = TestBed.inject(Injector);
    injector
      .get(HttpClient)
      .get('/test')
      .subscribe(() => {
        done();
      });
    injector.get(HttpTestingController).expectOne('/test').flush('ok!');
  });
});
