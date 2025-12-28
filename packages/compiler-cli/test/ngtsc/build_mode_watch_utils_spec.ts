/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  computeModifiedTsFilesForResourceChange,
  isWatchedResourceFile,
} from '../../src/build_mode_watch_utils';

describe('build mode watch utils', () => {
  it('detects watched resource extensions', () => {
    expect(isWatchedResourceFile('/a/b/c.html')).toBeTrue();
    expect(isWatchedResourceFile('/a/b/c.scss')).toBeTrue();
    expect(isWatchedResourceFile('/a/b/c.xlf')).toBeTrue();
    expect(isWatchedResourceFile('/a/b/c.json')).toBeFalse();
    expect(isWatchedResourceFile('/a/b/c.ts')).toBeFalse();
  });

  it('watches json when enabled via env flag', () => {
    const prev = process.env['NGC_BUILD_MODE_WATCH_JSON'];
    process.env['NGC_BUILD_MODE_WATCH_JSON'] = '1';
    try {
      expect(isWatchedResourceFile('/a/b/c.json')).toBeTrue();
    } finally {
      process.env['NGC_BUILD_MODE_WATCH_JSON'] = prev;
    }
  });

  it('touches owning TS files when resource is owned', () => {
    const owners = new Map<string, ReadonlySet<string>>([
      ['/proj/src/cmp.html', new Set(['/proj/src/cmp.ts'])],
    ]);

    const result = computeModifiedTsFilesForResourceChange(
      '/proj/src/cmp.html',
      '/proj/tsconfig.json',
      owners,
      {inputFiles: ['/proj/src/cmp.ts']},
    );

    expect(result).toEqual({tsFiles: ['/proj/src/cmp.ts'], recordAsResource: true});
  });

  it('falls back to primary input when resource is unowned but within project dir', () => {
    const owners = new Map<string, ReadonlySet<string>>();

    const result = computeModifiedTsFilesForResourceChange(
      '/proj/i18n/messages.xlf',
      '/proj/tsconfig.json',
      owners,
      {inputFiles: ['/proj/src/index.ts', '/proj/src/other.ts']},
    );

    expect(result).toEqual({tsFiles: ['/proj/src/index.ts'], recordAsResource: false});
  });

  it('ignores unowned resources outside the project dir', () => {
    const owners = new Map<string, ReadonlySet<string>>();

    const result = computeModifiedTsFilesForResourceChange(
      '/other/messages.xlf',
      '/proj/tsconfig.json',
      owners,
      {inputFiles: ['/proj/src/index.ts']},
    );

    expect(result).toBeNull();
  });
});
