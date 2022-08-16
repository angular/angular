/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HTTP_INTERCEPTORS, HttpClient, HttpEvent, HttpHandlerFn, HttpInterceptor, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {createEnvironmentInjector, EnvironmentInjector, inject, InjectionToken, Provider} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Observable} from 'rxjs';

import {HttpHandler} from '../public_api';
import {provideHttpInterceptors} from '../src/providers';
import {HttpTestingController} from '../testing';
import {HttpClientTestingModule} from '../testing/src/module';

describe('http interceptor functions', () => {
  it('should intercept requests', () => {
    let seen = false;
    function testInterceptor(
        req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
      seen = true;
      return next(req);
    }

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideHttpInterceptors([testInterceptor]),
      ]
    });
    const {ctrl, client} = getHttpInTest();

    client.get('/test', {responseType: 'text'}).subscribe();
    ctrl.expectOne('/test').flush('');
    expect(seen).toBeTrue();

    ctrl.verify();
  });

  it('should intercept in the same order as provided in one array', () => {
    const log: number[] = [];

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideHttpInterceptors([makeLoggingInterceptor(log, 0), makeLoggingInterceptor(log, 1)]),
      ]
    });
    const {ctrl, client} = getHttpInTest();

    client.get('/test', {responseType: 'text'}).subscribe();
    ctrl.expectOne('/test').flush('');
    expect(log).toEqual([0, 1]);

    ctrl.verify();
  });

  it('should intercept in the same order as provided in multiple arrays', () => {
    const log: number[] = [];

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideHttpInterceptors([makeLoggingInterceptor(log, 0)]),
        provideHttpInterceptors([makeLoggingInterceptor(log, 1), makeLoggingInterceptor(log, 2)]),
        provideHttpInterceptors([makeLoggingInterceptor(log, 3)]),
      ]
    });
    const {ctrl, client} = getHttpInTest();

    client.get('/test', {responseType: 'text'}).subscribe();
    ctrl.expectOne('/test').flush('');
    expect(log).toEqual([0, 1, 2, 3]);

    ctrl.verify();
  });

  it('should allow adding additional interceptors in a child injector', () => {
    const log: number[] = [];

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideHttpInterceptors([makeLoggingInterceptor(log, 0)]),
      ]
    });
    const {ctrl, client} = getHttpInTest();

    client.get('/test', {responseType: 'text'}).subscribe();
    ctrl.expectOne('/test').flush('');
    expect(log).toEqual([0]);
    log.length = 0;

    addInterceptorsInNewInjector([makeLoggingInterceptor(log, 1)]);

    client.get('/test', {responseType: 'text'}).subscribe();
    ctrl.expectOne('/test').flush('');
    expect(log).toEqual([0, 1]);

    ctrl.verify();
  });

  it('interceptors are deduped according to identity', () => {
    const log: number[] = [];
    const interceptor = makeLoggingInterceptor(log, 0);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideHttpInterceptors([interceptor]),
        provideHttpInterceptors([interceptor]),
      ],
    });
    const {ctrl, client} = getHttpInTest();

    client.get('/test', {responseType: 'text'}).subscribe();
    ctrl.expectOne('/test').flush('');

    // Should only log `0` once.
    expect(log).toEqual([0]);
    log.length = 0;

    const extraInterceptor = makeLoggingInterceptor(log, 1);
    addInterceptorsInNewInjector([extraInterceptor, extraInterceptor]);
    addInterceptorsInNewInjector([extraInterceptor, makeLoggingInterceptor(log, 2)]);


    client.get('/test', {responseType: 'text'}).subscribe();
    ctrl.expectOne('/test').flush('');

    // Should only log `0` and `1` once, despite registering the interceptors many times.
    expect(log).toEqual([0, 1, 2]);
    log.length = 0;

    ctrl.verify();
  });

  it('late registration of interceptors does not break or repeat legacy ones', () => {
    const log: number[] = [];
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useValue: new LegacyLoggingInterceptor(log, 0),
          multi: true,
        },
        {
          provide: HTTP_INTERCEPTORS,
          useValue: new LegacyLoggingInterceptor(log, 1),
          multi: true,
        },
      ],
    });
    const {ctrl, client} = getHttpInTest();

    // Make an initial request and validate that it triggered the interceptors.
    client.get('/test', {responseType: 'text'}).subscribe();
    ctrl.expectOne('/test').flush('');
    expect(log).toEqual([0, 1]);
    log.length = 0;

    // Add a new interceptor.
    addInterceptorsInNewInjector([makeLoggingInterceptor(log, 2)]);

    // Validate that the next request hits all of the interceptors, and in particular that it didn't
    // duplicate the ones provided via `HTTP_INTERCEPTORS` (0 and 1).
    client.get('/test', {responseType: 'text'}).subscribe();
    ctrl.expectOne('/test').flush('');
    expect(log).toEqual([0, 1, 2]);

    ctrl.verify();
  });

  it('can use inject() in an interceptor', () => {
    const TOKEN = new InjectionToken('TOKEN', {providedIn: 'root', factory: () => 'from root'});
    const testInterceptor: HttpInterceptorFn = (req, next) => {
      expect(inject(TOKEN)).toEqual('from root');
      return next(req);
    };


    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideHttpInterceptors([testInterceptor]),
      ],
    });
    const {ctrl, client} = getHttpInTest();

    client.get('/test', {responseType: 'text'}).subscribe();
    ctrl.expectOne('/test').flush('');

    ctrl.verify();
  });

  it('inject() in an interceptor has the right context', () => {
    const TOKEN = new InjectionToken('TOKEN', {providedIn: 'root', factory: () => 'from root'});

    function makeTestInterceptor(expected: string): HttpInterceptorFn {
      return (req, next) => {
        expect(inject(TOKEN)).toEqual(expected);
        return next(req);
      };
    }

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideHttpInterceptors([makeTestInterceptor('from root')]),
      ],
    });
    const {ctrl, client} = getHttpInTest();

    addInterceptorsInNewInjector(
        [makeTestInterceptor('from child a')], [{provide: TOKEN, useValue: 'from child a'}]);
    addInterceptorsInNewInjector(
        [makeTestInterceptor('from child b')], [{provide: TOKEN, useValue: 'from child b'}]);

    client.get('/test', {responseType: 'text'}).subscribe();
    ctrl.expectOne('/test').flush('');

    ctrl.verify();
  });
});

function makeLoggingInterceptor(log: number[], value: number) {
  return (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    log.push(value);
    return next(req);
  };
}

class LegacyLoggingInterceptor implements HttpInterceptor {
  constructor(private log: number[], private value: number) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.log.push(this.value);
    return next.handle(req);
  }
}

function getHttpInTest(): {ctrl: HttpTestingController, client: HttpClient} {
  return {
    ctrl: TestBed.inject(HttpTestingController),
    client: TestBed.inject(HttpClient),
  };
}
function addInterceptorsInNewInjector(
    interceptors: HttpInterceptorFn[], otherProviders: Provider[] = []): void {
  // Simply instantiating the injector side-effectfully adds new interceptor functions.
  createEnvironmentInjector(
      [provideHttpInterceptors(interceptors), ...otherProviders],
      TestBed.inject(EnvironmentInjector));
}
