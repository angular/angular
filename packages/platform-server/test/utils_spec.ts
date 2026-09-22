/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {PlatformLocation} from '@angular/common';
import {Component, destroyPlatform, inject, NgModule} from '@angular/core';
import {renderApplication, renderModule, ServerModule} from '@angular/platform-server';
import domino from '../third_party/domino/bundled-domino';
import {isHostAllowed} from '../src/utils';

@Component({
  selector: 'app',
  template: 'works! {{ platformLocation.pathname }} ({{ platformLocation.hostname }})',
  standalone: false,
})
class MockComponent {
  protected readonly platformLocation = inject(PlatformLocation);
}

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

  it('should render when host is allowed', async () => {
    const html = await renderModule(MockNgModule, {
      document: '<app></app>',
      url: 'http://test.com/deep/path',
      allowedHosts: ['test.com', '*.example.com'],
    });

    expect(html).toContain('works! /deep/path (test.com)');
  });

  it('should render when all hosts are explicitly allowed', async () => {
    const html = await renderModule(MockNgModule, {
      document: '<app></app>',
      url: 'http://arbitrary.example/deep/path',
      allowedHosts: ['*'],
    });

    expect(html).toContain('works! /deep/path (arbitrary.example)');
  });

  it('should inherit a supplied document origin for relative request URLs', async () => {
    const document = domino.createWindow('<app></app>', 'http://internal.example/').document;
    const html = await renderModule(MockNgModule, {
      document,
      url: '/deep/path',
      allowedHosts: ['app.example.com'],
    });

    expect(html).toContain('works! /deep/path (internal.example)');
  });

  it('should reject a scheme URL whose effective document host is not allowed', async () => {
    const document = domino.createWindow('<app></app>', 'http://internal.example/').document;

    await expectAsync(
      renderModule(MockNgModule, {
        document,
        url: 'http:app.example.com/deep/path',
        allowedHosts: ['app.example.com'],
      }),
    ).toBeRejectedWithError(/NG05706/);
  });

  it('should render a scheme URL when its parsed and effective hosts are allowed', async () => {
    const document = domino.createWindow('<app></app>', 'http://internal.example/').document;
    const html = await renderModule(MockNgModule, {
      document,
      url: 'http:internal.example/deep/path',
      allowedHosts: ['internal.example'],
    });

    expect(html).toContain('works! /internal.example/deep/path (internal.example)');
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
