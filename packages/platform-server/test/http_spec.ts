/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  HttpClient,
  HttpHeaders,
  provideHttpClient,
  withInterceptors,
  withNoXsrfProtection,
} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {
  Component,
  createEnvironmentInjector,
  destroyPlatform,
  EnvironmentInjector,
  EnvironmentProviders,
  inject,
  NgModule,
  PendingTasks,
  Provider,
  REQUEST,
  signal,
} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {
  INITIAL_CONFIG,
  platformServer,
  provideServerRendering,
  renderApplication,
  renderModule,
  ServerModule,
} from '@angular/platform-server';

import {isSsrRequest, SSR_REQUEST_HEADER} from '../src/http';

describe('server HTTP SSR request header', () => {
  beforeEach(() => {
    destroyPlatform();
  });

  afterEach(() => {
    destroyPlatform();
  });

  describe('isSsrRequest', () => {
    it('returns true when the SSR request header is present', () => {
      expect(
        isSsrRequest(
          new Request('http://example.test/api', {headers: {[SSR_REQUEST_HEADER]: '1'}}),
        ),
      ).toBeTrue();
      expect(
        isSsrRequest(new Request('http://example.test/api', {headers: {[SSR_REQUEST_HEADER]: ''}})),
      ).toBeTrue();
    });

    it('returns false when the SSR request header is absent', () => {
      expect(isSsrRequest(new Request('http://example.test/api'))).toBeFalse();
    });

    it('returns false for objects without a Headers-like has method', () => {
      expect(isSsrRequest({} as Request)).toBeFalse();
      expect(isSsrRequest(null as unknown as Request)).toBeFalse();
    });
  });

  describe('outbound request tagging', () => {
    async function bootstrapTestApp(
      config: {document?: string; url?: string},
      extraProviders: Array<Provider | EnvironmentProviders> = [],
    ) {
      @Component({
        selector: 'app-root',
        template: '',
      })
      class App {}

      const platformRef = platformServer([
        {
          provide: INITIAL_CONFIG,
          useValue: {
            document: config.document ?? '<app-root></app-root>',
            url: config.url,
          },
        },
      ]);

      const appRef = await bootstrapApplication(
        App,
        {
          providers: [
            provideServerRendering(),
            provideHttpClient(),
            provideHttpClientTesting(),
            ...extraProviders,
          ],
        },
        {platformRef},
      );

      return {
        http: appRef.injector.get(HttpClient),
        mock: appRef.injector.get(HttpTestingController),
      };
    }

    it('adds the header to relative URLs targeting the server host', async () => {
      const {http, mock} = await bootstrapTestApp({url: 'http://example.test:4000/page'});

      http.get('/api/config').subscribe();
      const req = mock.expectOne('http://example.test:4000/api/config');
      expect(req.request.headers.get(SSR_REQUEST_HEADER)).toBe('1');
      req.flush({});
      mock.verify();
    });

    it('adds the header to absolute URLs targeting the same host and port', async () => {
      const {http, mock} = await bootstrapTestApp({url: 'http://example.test:4000/page'});

      http.get('http://example.test:4000/api/config').subscribe();
      const req = mock.expectOne('http://example.test:4000/api/config');
      expect(req.request.headers.get(SSR_REQUEST_HEADER)).toBe('1');
      req.flush({});
      mock.verify();
    });

    it('matches default HTTP and HTTPS ports across schemes behind TLS-terminating proxies', async () => {
      const {http, mock} = await bootstrapTestApp({url: 'http://example.test/page'});

      http.get('https://example.test/api/config').subscribe();
      const req = mock.expectOne('https://example.test/api/config');
      expect(req.request.headers.get(SSR_REQUEST_HEADER)).toBe('1');
      req.flush({});
      mock.verify();
    });

    it('matches explicit port 443 on HTTP against default HTTPS port', async () => {
      const {http, mock} = await bootstrapTestApp({url: 'http://example.test:443/page'});

      http.get('https://example.test/api/config').subscribe();
      const req = mock.expectOne('https://example.test/api/config');
      expect(req.request.headers.get(SSR_REQUEST_HEADER)).toBe('1');
      req.flush({});
      mock.verify();
    });

    it('matches IPv6 hosts, uppercase hostnames, and trailing FQDN dots', async () => {
      const ipv6 = await bootstrapTestApp({url: 'http://[::1]:4000/page'});
      ipv6.http.get('http://[0:0:0:0:0:0:0:1]:4000/api').subscribe();
      const ipv6Req = ipv6.mock.expectOne('http://[0:0:0:0:0:0:0:1]:4000/api');
      expect(ipv6Req.request.headers.get(SSR_REQUEST_HEADER)).toBe('1');
      ipv6Req.flush({});
      ipv6.mock.verify();

      destroyPlatform();

      const fqdn = await bootstrapTestApp({url: 'http://EXAMPLE.TEST.:4000/page'});
      fqdn.http.get('http://example.test:4000/api').subscribe();
      const fqdnReq = fqdn.mock.expectOne('http://example.test:4000/api');
      expect(fqdnReq.request.headers.get(SSR_REQUEST_HEADER)).toBe('1');
      fqdnReq.flush({});
      fqdn.mock.verify();
    });

    it('does not add the header to different ports on the same hostname', async () => {
      const {http, mock} = await bootstrapTestApp({url: 'http://localhost:4200/page'});

      http.get('http://localhost:3000/api/config').subscribe();
      const req = mock.expectOne('http://localhost:3000/api/config');
      expect(req.request.headers.has(SSR_REQUEST_HEADER)).toBeFalse();
      req.flush({});
      mock.verify();
    });

    it('does not add the header to external hosts or cross-origin protocol-relative URLs', async () => {
      const {http, mock} = await bootstrapTestApp({url: 'http://example.test:4000/page'});

      http.get('https://api.other.test/config').subscribe();
      const externalReq = mock.expectOne('https://api.other.test/config');
      expect(externalReq.request.headers.has(SSR_REQUEST_HEADER)).toBeFalse();
      externalReq.flush({});

      http.get('//cdn.other.test/config').subscribe();
      const protoRelReq = mock.expectOne('http://cdn.other.test/config');
      expect(protoRelReq.request.headers.has(SSR_REQUEST_HEADER)).toBeFalse();
      protoRelReq.flush({});

      mock.verify();
    });

    it('does not add the header when an absolute <base href> resolves a relative URL to another host', async () => {
      const {http, mock} = await bootstrapTestApp({
        document:
          '<html><head><base href="https://cdn.example.test/app/"></head><body><app-root></app-root></body></html>',
        url: 'http://example.test:4000/page',
      });

      http.get('api/config').subscribe();
      const req = mock.expectOne('https://cdn.example.test/app/api/config');
      expect(req.request.headers.has(SSR_REQUEST_HEADER)).toBeFalse();
      req.flush({});
      mock.verify();
    });

    it('does not add the header for non-HTTP schemes, missing INITIAL_CONFIG.url, or unparseable URLs', async () => {
      const withUrl = await bootstrapTestApp({url: 'http://example.test:4000/page'});

      withUrl.http.get('ftp://example.test:4000/file').subscribe();
      const ftpReq = withUrl.mock.expectOne('ftp://example.test:4000/file');
      expect(ftpReq.request.headers.has(SSR_REQUEST_HEADER)).toBeFalse();
      ftpReq.flush({});

      withUrl.http.get('http://[invalid').subscribe();
      const malformedReq = withUrl.mock.expectOne('http://[invalid');
      expect(malformedReq.request.headers.has(SSR_REQUEST_HEADER)).toBeFalse();
      malformedReq.flush({});
      withUrl.mock.verify();

      destroyPlatform();

      const withoutUrl = await bootstrapTestApp({});
      withoutUrl.http.get('/api/config').subscribe();
      const noUrlReq = withoutUrl.mock.expectOne('/api/config');
      expect(noUrlReq.request.headers.has(SSR_REQUEST_HEADER)).toBeFalse();
      noUrlReq.flush({});
      withoutUrl.mock.verify();
    });

    it('runs after user interceptors so URL rewrites are respected', async () => {
      const {http, mock} = await bootstrapTestApp({url: 'http://example.test:4000/page'}, [
        provideHttpClient(
          withInterceptors([
            (req, next) => {
              if (req.url === '/external-via-interceptor') {
                return next(req.clone({url: 'https://api.other.test/data'}));
              }
              if (req.url === 'https://placeholder.test/data') {
                return next(req.clone({url: 'http://example.test:4000/internal'}));
              }
              return next(req);
            },
          ]),
        ),
        provideHttpClientTesting(),
      ]);

      http.get('/external-via-interceptor').subscribe();
      const extReq = mock.expectOne('https://api.other.test/data');
      expect(extReq.request.headers.has(SSR_REQUEST_HEADER)).toBeFalse();
      extReq.flush({});

      http.get('https://placeholder.test/data').subscribe();
      const intReq = mock.expectOne('http://example.test:4000/internal');
      expect(intReq.request.headers.get(SSR_REQUEST_HEADER)).toBe('1');
      intReq.flush({});

      mock.verify();
    });

    it('preserves existing request headers and does not overwrite an existing SSR header value', async () => {
      const {http, mock} = await bootstrapTestApp({url: 'http://example.test:4000/page'});

      http
        .get('/api/config', {
          headers: new HttpHeaders({
            'x-custom': 'abc',
            [SSR_REQUEST_HEADER]: 'existing',
          }),
        })
        .subscribe();

      const req = mock.expectOne('http://example.test:4000/api/config');
      expect(req.request.headers.get('x-custom')).toBe('abc');
      expect(req.request.headers.get(SSR_REQUEST_HEADER)).toBe('existing');
      req.flush({});
      mock.verify();
    });

    it('does not throw in a parentless EnvironmentInjector without PlatformLocation', () => {
      const injector = createEnvironmentInjector(
        [
          provideServerRendering(),
          provideHttpClient(withNoXsrfProtection()),
          provideHttpClientTesting(),
          {provide: PendingTasks, useValue: {add: () => () => {}}},
        ],
        null as unknown as EnvironmentInjector,
      );
      try {
        const http = injector.get(HttpClient);
        const mock = injector.get(HttpTestingController);

        http.get('https://example.test/api').subscribe({
          error: (err) => fail(err),
        });
        const req = mock.expectOne('https://example.test/api');
        expect(req.request.headers.has(SSR_REQUEST_HEADER)).toBeFalse();
        req.flush({});
        mock.verify();
      } finally {
        injector.destroy();
      }
    });

    it('also tags requests for NgModule apps using ServerModule', async () => {
      @Component({
        selector: 'app-root',
        template: '',
        standalone: false,
      })
      class LegacyApp {}

      @NgModule({
        declarations: [LegacyApp],
        bootstrap: [LegacyApp],
        imports: [ServerModule],
        providers: [provideHttpClient(), provideHttpClientTesting()],
      })
      class LegacyServerModule {}

      const platformRef = platformServer([
        {
          provide: INITIAL_CONFIG,
          useValue: {document: '<app-root></app-root>', url: 'http://example.test:4000/page'},
        },
      ]);

      const moduleRef = await platformRef.bootstrapModule(LegacyServerModule);
      const http = moduleRef.injector.get(HttpClient);
      const mock = moduleRef.injector.get(HttpTestingController);

      http.get('/api/config').subscribe();
      const req = mock.expectOne('http://example.test:4000/api/config');
      expect(req.request.headers.get(SSR_REQUEST_HEADER)).toBe('1');
      req.flush({});
      mock.verify();
    });
  });

  describe('inbound recursive request rejection in renderApplication and renderModule', () => {
    it('rejects renderApplication before bootstrapping when REQUEST carries the SSR header', async () => {
      const bootstrapSpy = jasmine.createSpy('bootstrap');

      await expectAsync(
        renderApplication(bootstrapSpy, {
          document: '<app-root></app-root>',
          url: 'http://example.test:4000/api',
          allowedHosts: ['example.test'],
          platformProviders: [
            {
              provide: REQUEST,
              useValue: new Request('http://example.test:4000/api', {
                headers: {[SSR_REQUEST_HEADER]: '1'},
              }),
            },
          ],
        }),
      ).toBeRejectedWithError(/NG05707/);

      expect(bootstrapSpy).not.toHaveBeenCalled();
    });

    it('rejects renderModule before bootstrapping when REQUEST carries the SSR header', async () => {
      @Component({
        selector: 'app-root',
        template: 'ok',
        standalone: false,
      })
      class LegacyApp {}

      @NgModule({
        declarations: [LegacyApp],
        bootstrap: [LegacyApp],
        imports: [ServerModule],
      })
      class LegacyModule {}

      await expectAsync(
        renderModule(LegacyModule, {
          document: '<app-root></app-root>',
          url: 'http://example.test:4000/api',
          allowedHosts: ['example.test'],
          extraProviders: [
            {
              provide: REQUEST,
              useValue: new Request('http://example.test:4000/api', {
                headers: {[SSR_REQUEST_HEADER]: ''},
              }),
            },
          ],
        }),
      ).toBeRejectedWithError(/NG05707/);
    });

    it('breaks a self-referencing HttpClient loop during renderApplication', async () => {
      @Component({
        selector: 'app-root',
        template: '{{ status() }}',
      })
      class SelfRequestingApp {
        protected readonly status = signal('loading');

        constructor() {
          inject(HttpClient)
            .get('/api/config', {responseType: 'text'})
            .subscribe({
              next: (val) => this.status.set(val),
              error: () => this.status.set('failed'),
            });
        }
      }

      const render = (request: Request) =>
        renderApplication(
          (context) =>
            bootstrapApplication(
              SelfRequestingApp,
              {providers: [provideServerRendering(), provideHttpClient()]},
              context,
            ),
          {
            document: '<app-root></app-root>',
            url: request.url,
            allowedHosts: ['example.test'],
            platformProviders: [{provide: REQUEST, useValue: request}],
          },
        );

      let fetchCalls = 0;
      spyOn(globalThis, 'fetch').and.callFake(async (input, init) => {
        if (++fetchCalls > 5) {
          return new Response('loop', {status: 508});
        }
        try {
          const html = await render(new Request(input, init));
          return new Response(html, {status: 200});
        } catch {
          return new Response('blocked', {status: 400});
        }
      });

      const html = await render(new Request('http://example.test:4000/page'));
      expect(html).toContain('failed');
      expect(fetchCalls).toBe(1);
    });
  });
});
