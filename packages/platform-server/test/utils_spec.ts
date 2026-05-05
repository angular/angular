/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {destroyPlatform} from '@angular/core';
import {renderApplication, renderModule} from '@angular/platform-server';
import {isHostAllowed} from '../src/utils';

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
  const bootstrap = (async () => {}) as any;

  beforeEach(() => {
    destroyPlatform();
  });

  afterEach(() => {
    destroyPlatform();
  });

  it('should throw an error on bootstrap if host is not allowed', async () => {
    await expectAsync(
      renderApplication(bootstrap, {
        document: '<app></app>',
        url: 'http://evil.com/deep/path',
        allowedHosts: ['test.com', '*.example.com'],
      }),
    ).toBeRejectedWithError(/Host http:\/\/evil.com\/deep\/path is not allowed/);
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
      renderModule(MockModule, {
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
});
