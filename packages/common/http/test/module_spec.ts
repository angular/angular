/**
 * @license
 * Copyright Google Inc. All Rights Reserved.JsonpCallbackContext
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'rxjs/add/operator/map';

import {Injector} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Observable} from 'rxjs/Observable';

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
    return delegate.handle(req).map(event => {
      if (event instanceof HttpResponse) {
        const existing = event.headers.get('Intercepted');
        const next = !!existing ? existing + ',' + this.value : this.value;
        return event.clone({headers: event.headers.set('Intercepted', next)});
      }
      return event;
    });
  }
}

class InterceptorA extends TestInterceptor {
  constructor() { super('A'); }
}

class InterceptorB extends TestInterceptor {
  constructor() { super('B'); }
}

export function main() {
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
    it('initializes HttpClient properly', (done: DoneFn) => {
      injector.get(HttpClient).get('/test', {responseType: 'text'}).subscribe(value => {
        expect(value).toBe('ok!');
        done();
      });
      injector.get(HttpTestingController).expectOne('/test').flush('ok!');
    });
    it('intercepts outbound responses in the order in which interceptors were bound',
       (done: DoneFn) => {
         injector.get(HttpClient)
             .get('/test', {observe: 'response', responseType: 'text'})
             .subscribe(value => done());
         const req = injector.get(HttpTestingController).expectOne('/test') as TestRequest;
         expect(req.request.headers.get('Intercepted')).toEqual('A,B');
         req.flush('ok!');
       });
    it('intercepts inbound responses in the right (reverse binding) order', (done: DoneFn) => {
      injector.get(HttpClient)
          .get('/test', {observe: 'response', responseType: 'text'})
          .subscribe(value => {
            expect(value.headers.get('Intercepted')).toEqual('B,A');
            done();
          });
      injector.get(HttpTestingController).expectOne('/test').flush('ok!');
    });
  });
}
