/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isNode} from '@angular/private/testing';
import {ApplicationRef, Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  HttpEventType,
  provideHttpClient,
  httpResource,
  HttpContext,
  HttpContextToken,
} from '../index';
import {HttpTestingController, provideHttpClientTesting} from '../testing';

describe('httpResource', () => {
  beforeEach(() => {
    globalThis['ngServerMode'] = isNode;
  });

  afterEach(() => {
    globalThis['ngServerMode'] = undefined;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient(), provideHttpClientTesting()]});
  });

  it('should throw if used outside injection context', () => {
    expect(() => httpResource(() => '/data')).toThrowMatching((thrown) =>
      thrown.message.includes('httpResource() can only be used within an injection context'),
    );
  });

  it('should send a basic request', async () => {
    const backend = TestBed.inject(HttpTestingController);
    const res = httpResource(() => '/data', {injector: TestBed.inject(Injector)});
    TestBed.tick();
    const req = backend.expectOne('/data');
    req.flush([]);
    await TestBed.inject(ApplicationRef).whenStable();
    expect(res.value()).toEqual([]);
  });

  it('should be reactive in its request URL', async () => {
    const id = signal(0);
    const backend = TestBed.inject(HttpTestingController);
    const res = httpResource(() => `/data/${id()}`, {injector: TestBed.inject(Injector)});
    TestBed.tick();
    const req1 = backend.expectOne('/data/0');
    req1.flush(0);
    await TestBed.inject(ApplicationRef).whenStable();
    expect(res.value()).toEqual(0);

    id.set(1);
    TestBed.tick();
    const req2 = backend.expectOne('/data/1');
    req2.flush(1);
    await TestBed.inject(ApplicationRef).whenStable();
    expect(res.value()).toEqual(1);
  });

  it('should not make backend requests if the request is undefined', async () => {
    const id = signal(0);
    const backend = TestBed.inject(HttpTestingController);
    const res = httpResource(() => (id() !== 1 ? `/data/${id()}` : undefined), {
      injector: TestBed.inject(Injector),
    });
    TestBed.tick();
    backend.expectOne('/data/0').flush(0);
    await TestBed.inject(ApplicationRef).whenStable();
    expect(res.value()).toEqual(0);

    id.set(1);
    TestBed.tick();

    // Verify no requests have been made.
    backend.verify({ignoreCancelled: false});
    await TestBed.inject(ApplicationRef).whenStable();
    backend.verify({ignoreCancelled: false});

    id.set(2);
    TestBed.tick();
    backend.expectOne('/data/2').flush(2);
    await TestBed.inject(ApplicationRef).whenStable();
    expect(res.value()).toBe(2);
  });

  it('should support the suite of HttpRequest APIs', async () => {
    const backend = TestBed.inject(HttpTestingController);
    const res = httpResource(
      () => ({
        url: '/data',
        method: 'POST',
        body: {message: 'Hello, backend!'},
        headers: {
          'X-Special': 'true',
        },
        params: {
          'fast': 'yes',
        },
        withCredentials: true,
      }),
      {injector: TestBed.inject(Injector)},
    );
    TestBed.tick();
    const req = backend.expectOne('/data?fast=yes');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({message: 'Hello, backend!'});
    expect(req.request.headers.get('X-Special')).toBe('true');
    expect(req.request.withCredentials).toBe(true);

    req.flush([]);

    await TestBed.inject(ApplicationRef).whenStable();
    expect(res.value()).toEqual([]);
  });

  it('should return response headers & status when resolved', async () => {
    const backend = TestBed.inject(HttpTestingController);
    const res = httpResource(() => '/data', {injector: TestBed.inject(Injector)});
    TestBed.tick();
    const req = backend.expectOne('/data');
    req.flush([], {
      headers: {
        'X-Special': '123',
      },
    });
    await TestBed.inject(ApplicationRef).whenStable();
    expect(res.value()).toEqual([]);
    expect(res.headers()?.get('X-Special')).toBe('123');
    expect(res.statusCode()).toBe(200);
  });

  it('should return response headers & status when request errored', async () => {
    const backend = TestBed.inject(HttpTestingController);
    const res = httpResource(() => '/data', {injector: TestBed.inject(Injector)});
    TestBed.tick();
    const req = backend.expectOne('/data');
    req.flush([], {
      headers: {
        'X-Special': '123',
      },
      status: 429,
      statusText: 'Too many requests',
    });
    await TestBed.inject(ApplicationRef).whenStable();
    expect((res.error() as any).error).toEqual([]);
    expect(res.headers()?.get('X-Special')).toBe('123');
    expect(res.statusCode()).toBe(429);
  });

  it('should support progress events', async () => {
    const backend = TestBed.inject(HttpTestingController);
    const res = httpResource(
      () => ({
        url: '/data',
        reportProgress: true,
      }),
      {injector: TestBed.inject(Injector)},
    );
    TestBed.tick();
    const req = backend.expectOne('/data');
    req.event({
      type: HttpEventType.DownloadProgress,
      loaded: 100,
      total: 200,
    });

    expect(res.progress()).toEqual({
      type: HttpEventType.DownloadProgress,
      loaded: 100,
      total: 200,
    });

    req.flush([]);

    await TestBed.inject(ApplicationRef).whenStable();
    expect(res.value()).toEqual([]);
  });

  it('should pass all request parameters', () => {
    const backend = TestBed.inject(HttpTestingController);

    const CTX_TOKEN = new HttpContextToken(() => 'value');
    const res = httpResource(
      () => ({
        url: '/data',
        params: {
          'fast': 'yes',
        },
        responseType: 'text', // This one is not overwritten (and no excess property check from ts)
        headers: {
          'X-Tag': 'alpha,beta',
        },
        reportProgress: true,
        context: new HttpContext().set(CTX_TOKEN, 'bar'),
        withCredentials: true,
        transferCache: {includeHeaders: ['Y-Tag']},
      }),
      {
        injector: TestBed.inject(Injector),
      },
    );
    TestBed.tick();

    const req = TestBed.inject(HttpTestingController).expectOne('/data?fast=yes');
    expect(req.request.headers.get('X-Tag')).toEqual('alpha,beta');
    expect(req.request.responseType).toEqual('json');
    expect(req.request.withCredentials).toEqual(true);
    expect(req.request.context.get(CTX_TOKEN)).toEqual('bar');
    expect(req.request.reportProgress).toEqual(true);
    expect(req.request.transferCache).toEqual({includeHeaders: ['Y-Tag']});
  });

  it('should allow mapping data to an arbitrary type', async () => {
    const backend = TestBed.inject(HttpTestingController);
    const res = httpResource(
      () => ({
        url: '/data',
        reportProgress: true,
      }),
      {
        injector: TestBed.inject(Injector),
        parse: (value) => JSON.stringify(value),
      },
    );
    TestBed.tick();
    const req = backend.expectOne('/data');
    req.flush([1, 2, 3]);

    await TestBed.inject(ApplicationRef).whenStable();
    expect(res.value()).toEqual('[1,2,3]');
  });

  it('should allow defining an equality function', async () => {
    const backend = TestBed.inject(HttpTestingController);
    const res = httpResource<number>(() => '/data', {
      injector: TestBed.inject(Injector),
      equal: (_a, _b) => true,
    });
    TestBed.tick();
    const req = backend.expectOne('/data');
    req.flush(1);

    await TestBed.inject(ApplicationRef).whenStable();
    expect(res.value()).toEqual(1);

    res.value.set(5);
    expect(res.value()).toBe(1); // equality blocked writes
  });

  it('should support text responses', async () => {
    const backend = TestBed.inject(HttpTestingController);
    const res = httpResource.text(
      () => ({
        url: '/data',
        reportProgress: true,
      }),
      {injector: TestBed.inject(Injector)},
    );
    TestBed.tick();
    const req = backend.expectOne('/data');
    req.flush('[1,2,3]');

    await TestBed.inject(ApplicationRef).whenStable();
    expect(res.value()).toEqual('[1,2,3]');
  });

  it('should support ArrayBuffer responses', async () => {
    const backend = TestBed.inject(HttpTestingController);
    const res = httpResource.arrayBuffer(
      () => ({
        url: '/data',
        reportProgress: true,
      }),
      {injector: TestBed.inject(Injector)},
    );
    TestBed.tick();
    const req = backend.expectOne('/data');
    const buffer = new ArrayBuffer();
    req.flush(buffer);

    await TestBed.inject(ApplicationRef).whenStable();
    expect(res.value()).toBe(buffer);
  });
});
