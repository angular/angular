/**
 * @license
 * Copyright Google Inc. All Rights Reserved.JsonpCallbackContext
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpBackend} from '@angular/common/http';
import {HttpInterceptingHandler} from '@angular/common/http/src/module';
import {Injectable, InjectionToken, Injector} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {HttpHandler} from '../src/backend';
import {HttpClient} from '../src/client';
import {HTTP_INTERCEPTORS, HttpInterceptor} from '../src/interceptor';
import {HttpRequest} from '../src/request';
import {HttpEvent, HttpResponse} from '../src/response';
import {HttpTestingController} from '../testing/src/api';
import {HttpClientTestingModule} from '../testing/src/module';
import {TestRequest} from '../testing/src/request';

class TestInterceptor implements HttpInterceptor {
  constructor(private value: string) {}

  intercept(req: HttpRequest<any>, delegate: HttpHandler): Observable<HttpEvent<any>> {
    const existing = req.headers.get('Intercepted');
    const next = !!existing ? existing + ',' + this.value : this.value;
    req = req.clone({setHeaders: {'Intercepted': next}});
    return delegate.handle(req).pipe(map(event => {
      if (event instanceof HttpResponse) {
        const existing = event.headers.get('Intercepted');
        const next = !!existing ? existing + ',' + this.value : this.value;
        return event.clone({headers: event.headers.set('Intercepted', next)});
      }
      return event;
    }));
  }
}

class InterceptorA extends TestInterceptor {
  constructor() { super('A'); }
}

class InterceptorB extends TestInterceptor {
  constructor() { super('B'); }
}

@Injectable()
class ReentrantInterceptor implements HttpInterceptor {
  constructor(private client: HttpClient) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req);
  }
}

@Injectable()
export class HttpClient1 extends HttpClient {
  constructor(backend: HttpBackend, private injector: Injector) {
    super(new HttpInterceptingHandler(backend, injector, HTTP_INTERCEPTORS_1));
  }
}

@Injectable()
class ReentrantHttpClient1Interceptor implements HttpInterceptor {
  constructor(private client: HttpClient1) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req);
  }
}

export const HTTP_INTERCEPTORS_1 = new InjectionToken<HttpInterceptor[]>('HTTP_INTERCEPTORS_1');

{
  describe('HttpClientModule', () => {
    let injector: Injector;
    beforeEach(() => {
      injector = TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          {provide: HTTP_INTERCEPTORS, useClass: InterceptorA, multi: true},
          {provide: HTTP_INTERCEPTORS, useClass: InterceptorB, multi: true},
        ],
      });
    });
    it('initializes HttpClient properly', done => {
      injector.get(HttpClient).get('/test', {responseType: 'text'}).subscribe(value => {
        expect(value).toBe('ok!');
        done();
      });
      injector.get(HttpTestingController).expectOne('/test').flush('ok!');
    });
    it('intercepts outbound responses in the order in which interceptors were bound', done => {
      injector.get(HttpClient)
          .get('/test', {observe: 'response', responseType: 'text'})
          .subscribe(value => done());
      const req = injector.get(HttpTestingController).expectOne('/test') as TestRequest;
      expect(req.request.headers.get('Intercepted')).toEqual('A,B');
      req.flush('ok!');
    });
    it('intercepts inbound responses in the right (reverse binding) order', done => {
      injector.get(HttpClient)
          .get('/test', {observe: 'response', responseType: 'text'})
          .subscribe(value => {
            expect(value.headers.get('Intercepted')).toEqual('B,A');
            done();
          });
      injector.get(HttpTestingController).expectOne('/test').flush('ok!');
    });
    it('allows interceptors to inject HttpClient', done => {
      TestBed.resetTestingModule();
      injector = TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          {provide: HTTP_INTERCEPTORS, useClass: ReentrantInterceptor, multi: true},
        ],
      });
      injector.get(HttpClient).get('/test').subscribe(() => { done(); });
      injector.get(HttpTestingController).expectOne('/test').flush('ok!');
    });


  });


  describe('HttpClientModule', () => {
    let injector: Injector;
    beforeEach(() => {
      injector = TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          HttpClient1,
          {provide: HTTP_INTERCEPTORS, useClass: InterceptorA, multi: true},
          {provide: HTTP_INTERCEPTORS, useClass: InterceptorB, multi: true},
          {provide: HTTP_INTERCEPTORS_1, useClass: InterceptorA, multi: true},
        ],
      });
    });
    it('initializes custom HttpClient properly', done => {
      injector.get(HttpClient1).get('/test', {responseType: 'text'}).subscribe(value => {
        expect(value).toBe('ok!');
        done();
      });
      injector.get(HttpTestingController).expectOne('/test').flush('ok!');
    });
    it('intercepts outbound responses in the order in which interceptors were bound', done => {
      injector.get(HttpClient1)
          .get('/test', {observe: 'response', responseType: 'text'})
          .subscribe(value => done());
      const req = injector.get(HttpTestingController).expectOne('/test') as TestRequest;
      expect(req.request.headers.get('Intercepted')).toEqual('A');
      req.flush('ok!');
    });
    it('allows interceptors to inject custom HttpClient', done => {
      TestBed.resetTestingModule();
      injector = TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          HttpClient1,
          ReentrantHttpClient1Interceptor,
          {provide: HTTP_INTERCEPTORS_1, useClass: ReentrantHttpClient1Interceptor, multi: true},
        ],
      });
      injector.get(HttpClient1).get('/test').subscribe(() => { done(); });
      injector.get(HttpTestingController).expectOne('/test').flush('ok!');
    });


  });
}
