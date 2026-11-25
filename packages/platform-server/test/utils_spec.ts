/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, destroyPlatform, ErrorHandler, NgModule} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {
  BEFORE_APP_SERIALIZED,
  INITIAL_CONFIG,
  platformServer,
  provideServerRendering,
  renderApplication,
  renderModule,
  ServerModule,
} from '@angular/platform-server';
import {isHostAllowed, renderInternal} from '../src/utils';

@Component({
  selector: 'app',
  template: 'works!',
  standalone: false,
})
class MockComponent {}

@NgModule({
  declarations: [MockComponent],
  bootstrap: [MockComponent],
  imports: [ServerModule],
})
class MockNgModule {}

describe('isHostAllowed', () => {
  it('allows matching hostname when in allowedHosts list', () => {
    expect(isHostAllowed('test.com', new Set(['test.com', 'example.com']))).toBeTrue();
  });

  it('allows matching hostname when wildcard matches', () => {
    expect(isHostAllowed('sub.example.com', new Set(['test.com', '*.example.com']))).toBeTrue();
  });

  it('rejects hostname when not in allowedHosts list', () => {
    expect(isHostAllowed('evil.com', new Set(['test.com', '*.example.com']))).toBeFalse();
  });

  it('allows all hostnames when * is in allowedHosts list', () => {
    expect(isHostAllowed('anydomain.com', new Set(['*']))).toBeTrue();
  });

  it('rejects any hostname when allowedHosts is empty', () => {
    expect(isHostAllowed('localhost', new Set())).toBeFalse();
    expect(isHostAllowed('localhost', new Set(), '4206')).toBeFalse();
  });

  it('allows any port when allowedHosts entry omits a port', () => {
    expect(isHostAllowed('localhost', new Set(['localhost']), '4206')).toBeTrue();
    expect(isHostAllowed('sub.example.com', new Set(['*.example.com']), '8443')).toBeTrue();
    expect(isHostAllowed('[::1]', new Set(['[::1]']), '4200')).toBeTrue();
  });

  it('validates port when allowedHosts entry specifies an explicit port', () => {
    expect(isHostAllowed('localhost', new Set(['localhost:4206']), '4206')).toBeTrue();
    expect(isHostAllowed('localhost', new Set(['localhost:4206']), '19200')).toBeFalse();
    expect(isHostAllowed('localhost', new Set(['localhost:4206']))).toBeFalse();
    expect(isHostAllowed('localhost', new Set(['localhost:4206']), '')).toBeFalse();
  });

  it('validates port on wildcard hostname entries', () => {
    const allowed = new Set(['*.example.com:8443']);
    expect(isHostAllowed('api.example.com', allowed, '8443')).toBeTrue();
    expect(isHostAllowed('api.example.com', allowed, '9000')).toBeFalse();
    expect(isHostAllowed('example.com', allowed, '8443')).toBeFalse();
    expect(isHostAllowed('api.example.com', allowed)).toBeFalse();
    expect(isHostAllowed('api.example.com', allowed, '')).toBeFalse();
  });

  it('supports wildcard port and wildcard host combinations', () => {
    expect(isHostAllowed('localhost', new Set(['localhost:*']), '4206')).toBeTrue();
    expect(isHostAllowed('localhost', new Set(['localhost:*']), '19200')).toBeTrue();
    expect(isHostAllowed('localhost', new Set(['localhost:*']))).toBeTrue();
    expect(isHostAllowed('evil.com', new Set(['localhost:*']), '4206')).toBeFalse();

    expect(isHostAllowed('any.example', new Set(['*:8443']), '8443')).toBeTrue();
    expect(isHostAllowed('any.example', new Set(['*:8443']), '9000')).toBeFalse();
    expect(isHostAllowed('any.example', new Set(['*:8443']))).toBeFalse();
    expect(isHostAllowed('any.example', new Set(['*:8443']), '')).toBeFalse();

    expect(isHostAllowed('any.example', new Set(['*:*']), '8443')).toBeTrue();
    expect(isHostAllowed('any.example', new Set(['*:*']))).toBeTrue();

    expect(isHostAllowed('api.example.com', new Set(['*.example.com:*']), '8443')).toBeTrue();
    expect(isHostAllowed('api.example.com', new Set(['*.example.com:*']))).toBeTrue();
    expect(isHostAllowed('example.com', new Set(['*.example.com:*']), '8443')).toBeFalse();
  });

  it('handles bracketed and unbracketed IPv6 literals', () => {
    expect(isHostAllowed('[::1]', new Set(['[::1]:4200']), '4200')).toBeTrue();
    expect(isHostAllowed('[::1]', new Set(['[::1]:4200']), '9000')).toBeFalse();
    expect(isHostAllowed('[::1]', new Set(['[::1]:4200']))).toBeFalse();
    expect(isHostAllowed('[::1]', new Set(['[::1]:4200']), '')).toBeFalse();
    expect(isHostAllowed('[::1]', new Set(['[::1]']))).toBeTrue();
    expect(isHostAllowed('::1', new Set(['::1']))).toBeTrue();
    expect(isHostAllowed('::1', new Set(['::1']), '4200')).toBeTrue();
    expect(isHostAllowed('::1', new Set(['[::1]']))).toBeFalse();
  });

  it('rejects empty port suffixes', () => {
    expect(isHostAllowed('localhost', new Set(['localhost:']), '4206')).toBeFalse();
    expect(isHostAllowed('localhost', new Set(['localhost:']), '')).toBeFalse();
    expect(isHostAllowed('[::1]', new Set(['[::1]:']), '4200')).toBeFalse();
    expect(isHostAllowed('[::1]', new Set(['[::1]:']), '')).toBeFalse();
    expect(isHostAllowed('any.example', new Set(['*:']), '8443')).toBeFalse();
    expect(isHostAllowed('any.example', new Set(['*:']), '')).toBeFalse();
    expect(isHostAllowed('api.example.com', new Set(['*.example.com:']), '8443')).toBeFalse();
    expect(isHostAllowed('api.example.com', new Set(['*.example.com:']), '')).toBeFalse();
  });
});

describe('allowedHosts validation in renderApplication', () => {
  const mockApplicationRef = {
    injector: {
      get: (token: any, defaultValue?: any) => defaultValue,
    },
    whenStable: () => Promise.resolve(),
    components: [],
  } as any;
  const bootstrap = (async () => mockApplicationRef) as any;

  beforeEach(() => {
    destroyPlatform();
  });

  afterEach(() => {
    destroyPlatform();
  });

  it('should reject URLs with wrong host', async () => {
    const relativeUrls = [
      'http://evil.com/deep/path',
      'http:/evil.com/deep/path',
      'ht\ttp://evil.com/deep/path',
    ];

    for (const url of relativeUrls) {
      await expectAsync(
        renderApplication(bootstrap, {
          document: '<app></app>',
          url,
          allowedHosts: ['test.com', 'localhost'],
        }),
      )
        .withContext(`URL: ${url}`)
        .toBeRejectedWithError(/Host .+ is not allowed/);
    }
  });

  it('should not throw a host validation error on bootstrap if host is allowed', async () => {
    try {
      await renderApplication(bootstrap, {
        document: '<app></app>',
        url: 'http://test.com/deep/path',
        allowedHosts: ['test.com', '*.example.com'],
      });
    } catch (error: any) {
      expect(error.message).not.toContain('is not allowed');
    }
  });

  it('should validate ports when allowedHosts includes port-qualified entries', async () => {
    const allowedCases: Array<{url: string; allowedHosts: string[]}> = [
      {url: 'http://localhost:4206/dashboard', allowedHosts: ['localhost:4206']},
      {url: 'https://example.com/dashboard', allowedHosts: ['example.com:443']},
      {url: 'https://example.com:443/dashboard', allowedHosts: ['example.com:443']},
      {url: 'http://example.com/dashboard', allowedHosts: ['example.com:80']},
      {url: 'http://example.com:80/dashboard', allowedHosts: ['example.com:80']},
      {url: 'https://api.example.com:8443/dashboard', allowedHosts: ['*.example.com:8443']},
      {url: 'http://[::1]:4200/dashboard', allowedHosts: ['[::1]:4200']},
      {url: 'https://Example.COM/dashboard', allowedHosts: ['example.com:443']},
      {url: 'https://example.com/dashboard', allowedHosts: ['Example.COM:443']},
      // Bare hostnames remain backwards-compatible and allow any port.
      {url: 'http://localhost:19200/dashboard', allowedHosts: ['localhost']},
    ];

    for (const {url, allowedHosts} of allowedCases) {
      destroyPlatform();
      await expectAsync(
        renderApplication(bootstrap, {
          document: '<app></app>',
          url,
          allowedHosts,
        }),
      )
        .withContext(`Expected allowed: ${url} with ${JSON.stringify(allowedHosts)}`)
        .toBeResolved();
    }

    const rejectedCases: Array<{url: string; allowedHosts: string[]}> = [
      {url: 'http://localhost:19200/dashboard', allowedHosts: ['localhost:4206']},
      {url: 'http://localhost/dashboard', allowedHosts: ['localhost:4206']},
      {url: 'http://example.com/dashboard', allowedHosts: ['example.com:443']},
      {url: 'https://example.com:8443/dashboard', allowedHosts: ['example.com:443']},
      {url: 'https://api.example.com:9000/dashboard', allowedHosts: ['*.example.com:8443']},
      {url: 'http://[::1]:9000/dashboard', allowedHosts: ['[::1]:4200']},
    ];

    for (const {url, allowedHosts} of rejectedCases) {
      destroyPlatform();
      await expectAsync(
        renderApplication(bootstrap, {
          document: '<app></app>',
          url,
          allowedHosts,
        }),
      )
        .withContext(`Expected rejected: ${url} with ${JSON.stringify(allowedHosts)}`)
        .toBeRejectedWithError(/Host .+ is not allowed/);
    }
  });

  it('should throw an error for malformed absolute URLs (SSRF bypass attempt)', async () => {
    const malformedUrls = [
      'http://evil.com:80:80/path',
      'https://evil.com:80:80/path',
      'http://[google.com]/path',
      'http://google.com:port/path',
      'http://google.com:80a/path',
      'ht\ttp://evil.com:80:80/path',
      'ht\ntp://evil.com:80:80/path',
    ];

    for (const url of malformedUrls) {
      await expectAsync(
        renderApplication(bootstrap, {
          document: '<app></app>',
          url,
          allowedHosts: ['test.com'],
        }),
      )
        .withContext(`URL: ${url}`)
        .toBeRejectedWithError(new RegExp(/Invalid URL:.+/));
    }
  });
});

describe('allowedHosts validation in renderModule', () => {
  class MockModule {}

  beforeEach(() => {
    destroyPlatform();
  });

  afterEach(() => {
    destroyPlatform();
  });

  it('should throw an error if host is not allowed', async () => {
    await expectAsync(
      renderModule(MockNgModule, {
        document: '<app></app>',
        url: 'http://evil.com/deep/path',
        allowedHosts: ['test.com', '*.example.com'],
      }),
    ).toBeRejectedWithError(/Host http:\/\/evil.com\/deep\/path is not allowed/);
  });

  it('should not throw a host validation error if host is allowed', async () => {
    try {
      await renderModule(MockModule, {
        document: '<app></app>',
        url: 'http://test.com/deep/path',
        allowedHosts: ['test.com', '*.example.com'],
      });
    } catch (error: any) {
      expect(error.message).not.toContain('is not allowed');
    }
  });

  it('should validate ports when allowedHosts includes port-qualified entries', async () => {
    await expectAsync(
      renderModule(MockNgModule, {
        document: '<app></app>',
        url: 'http://localhost:4206/deep/path',
        allowedHosts: ['localhost:4206'],
      }),
    ).toBeResolved();

    destroyPlatform();

    await expectAsync(
      renderModule(MockNgModule, {
        document: '<app></app>',
        url: 'http://localhost:19200/deep/path',
        allowedHosts: ['localhost:4206'],
      }),
    ).toBeRejectedWithError(/Host http:\/\/localhost:19200\/deep\/path is not allowed/);
  });

  it('should throw an error for malformed absolute URLs (SSRF bypass attempt)', async () => {
    const malformedUrls = [
      'http://evil.com:80:80/path',
      'https://evil.com:80:80/path',
      'http://[google.com]/path',
      'http://google.com:port/path',
      'http://google.com:80a/path',
      'ht\ttp://evil.com:80:80/path',
      'ht\ntp://evil.com:80:80/path',
    ];

    for (const url of malformedUrls) {
      await expectAsync(
        renderModule(MockNgModule, {
          document: '<app></app>',
          url,
          allowedHosts: ['test.com'],
        }),
      )
        .withContext(`URL: ${url}`)
        .toBeRejectedWithError(new RegExp(/Invalid URL:.+/));
    }
  });
});

describe('platform destruction during SSR', () => {
  beforeEach(() => {
    destroyPlatform();
  });

  afterEach(() => {
    destroyPlatform();
  });

  it('should return empty string without invoking ErrorHandler when destroyed during async BEFORE_APP_SERIALIZED hook', async () => {
    let rejectHook!: (reason?: unknown) => void;
    const errorHandlerSpy = jasmine.createSpy('handleError');

    @Component({
      selector: 'app',
      template: 'hello',
    })
    class App {}

    const platformRef = platformServer([
      {provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}},
    ]);

    try {
      const appRef = await bootstrapApplication(
        App,
        {
          providers: [
            provideServerRendering(),
            {provide: ErrorHandler, useValue: {handleError: errorHandlerSpy}},
            {
              provide: BEFORE_APP_SERIALIZED,
              multi: true,
              useValue: () =>
                new Promise<void>((_, reject) => {
                  rejectHook = reject;
                }),
            },
          ],
        },
        {platformRef},
      );

      const renderPromise = renderInternal(platformRef, appRef);
      platformRef.destroy();
      rejectHook(new Error('late serialization hook error'));

      const html = await renderPromise;
      expect(html).toBe('');
      expect(errorHandlerSpy).not.toHaveBeenCalled();
    } finally {
      if (!platformRef.destroyed) {
        platformRef.destroy();
      }
    }
  });

  it('should return empty string when destroyed during a never-settling BEFORE_APP_SERIALIZED hook', async () => {
    @Component({
      selector: 'app',
      template: 'hello',
    })
    class App {}

    const platformRef = platformServer([
      {provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}},
    ]);

    try {
      const appRef = await bootstrapApplication(
        App,
        {
          providers: [
            provideServerRendering(),
            {
              provide: BEFORE_APP_SERIALIZED,
              multi: true,
              useValue: () => new Promise<void>(() => {}),
            },
          ],
        },
        {platformRef},
      );

      const renderPromise = renderInternal(platformRef, appRef);
      platformRef.destroy();

      expect(await renderPromise).toBe('');
    } finally {
      if (!platformRef.destroyed) {
        platformRef.destroy();
      }
    }
  });

  it('should reject renderApplication when platform destruction throws', async () => {
    @Component({
      selector: 'app',
      template: 'hello',
    })
    class App {}

    let shouldThrow = true;

    await expectAsync(
      renderApplication(
        (context) => {
          context.platformRef.onDestroy(() => {
            if (shouldThrow) {
              shouldThrow = false;
              throw new Error('destroy failure');
            }
          });
          return bootstrapApplication(App, {providers: [provideServerRendering()]}, context);
        },
        {document: '<app></app>'},
      ),
    ).toBeRejectedWithError('destroy failure');
  });
});
