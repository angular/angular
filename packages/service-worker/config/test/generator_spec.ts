/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Generator, processNavigationUrls} from '../src/generator';
import {AssetGroup} from '../src/in';
import {HashTrackingMockFilesystem, MockFilesystem} from '../testing/mock';

describe('Generator', () => {
  beforeEach(() => spyOn(Date, 'now').and.returnValue(1234567890123));

  it('generates a correct config', async () => {
    const fs = new MockFilesystem({
      '/index.html': 'This is a test',
      '/main.css': 'This is a CSS file',
      '/main.js': 'This is a JS file',
      '/main.ts': 'This is a TS file',
      '/test.txt': 'Another test',
      '/foo/test.html': 'Another test',
      '/ignored/x.html': 'should be ignored',
    });
    const gen = new Generator(fs, '/test');
    const config = await gen.process({
      appData: {
        test: true,
      },
      index: '/index.html',
      assetGroups: [{
        name: 'test',
        resources: {
          files: [
            '/**/*.html',
            '/**/*.?s',
            '!/ignored/**',
            '/**/*.txt',
          ],
          urls: [
            '/absolute/**',
            '/some/url?with+escaped+chars',
            'relative/*.txt',
          ],
        },
      }],
      dataGroups: [{
        name: 'other',
        urls: [
          '/api/**',
          'relapi/**',
          'https://example.com/**/*?with+escaped+chars',
        ],
        cacheConfig: {
          maxSize: 100,
          maxAge: '3d',
          timeout: '1m',
        },
      }],
      navigationUrls: [
        '/included/absolute/**',
        '!/excluded/absolute/**',
        '/included/some/url/with+escaped+chars',
        '!excluded/relative/*.txt',
        '!/api/?*',
        'http://example.com/included',
        '!http://example.com/excluded',
      ],
    });

    expect(config).toEqual({
      configVersion: 1,
      timestamp: 1234567890123,
      appData: {
        test: true,
      },
      index: '/test/index.html',
      assetGroups: [{
        name: 'test',
        installMode: 'prefetch',
        updateMode: 'prefetch',
        urls: [
          '/test/foo/test.html',
          '/test/index.html',
          '/test/main.js',
          '/test/main.ts',
          '/test/test.txt',
        ],
        patterns: [
          '\\/absolute\\/.*',
          '\\/some\\/url\\?with\\+escaped\\+chars',
          '\\/test\\/relative\\/[^/]*\\.txt',
        ],
        cacheQueryOptions: {ignoreVary: true}
      }],
      dataGroups: [{
        name: 'other',
        patterns: [
          '\\/api\\/.*',
          '\\/test\\/relapi\\/.*',
          'https:\\/\\/example\\.com\\/(?:.+\\/)?[^/]*\\?with\\+escaped\\+chars',
        ],
        strategy: 'performance',
        maxSize: 100,
        maxAge: 259200000,
        timeoutMs: 60000,
        version: 1,
        cacheOpaqueResponses: undefined,
        cacheQueryOptions: {ignoreVary: true}
      }],
      navigationUrls: [
        {positive: true, regex: '^\\/included\\/absolute\\/.*$'},
        {positive: false, regex: '^\\/excluded\\/absolute\\/.*$'},
        {positive: true, regex: '^\\/included\\/some\\/url\\/with\\+escaped\\+chars$'},
        {positive: false, regex: '^\\/test\\/excluded\\/relative\\/[^/]*\\.txt$'},
        {positive: false, regex: '^\\/api\\/[^/][^/]*$'},
        {positive: true, regex: '^http:\\/\\/example\\.com\\/included$'},
        {positive: false, regex: '^http:\\/\\/example\\.com\\/excluded$'},
      ],
      navigationRequestStrategy: 'performance',
      hashTable: {
        '/test/foo/test.html': '18f6f8eb7b1c23d2bb61bff028b83d867a9e4643',
        '/test/index.html': 'a54d88e06612d820bc3be72877c74f257b561b19',
        '/test/main.js': '41347a66676cdc0516934c76d9d13010df420f2c',
        '/test/main.ts': '7d333e31f0bfc4f8152732bb211a93629484c035',
        '/test/test.txt': '18f6f8eb7b1c23d2bb61bff028b83d867a9e4643',
      },
    });
  });

  it('assigns files to the first matching asset-group (unaffected by file-system access delays)',
     async () => {
       const fs = new MockFilesystem({
         '/index.html': 'This is a test',
         '/foo/script-1.js': 'This is script 1',
         '/foo/script-2.js': 'This is script 2',
         '/bar/script-3.js': 'This is script 3',
         '/bar/script-4.js': 'This is script 4',
         '/qux/script-5.js': 'This is script 5',
       });

       // Simulate fluctuating file-system access delays.
       const allFiles = await fs.list('/');
       spyOn(fs, 'list')
           .and.returnValues(
               new Promise(resolve => setTimeout(resolve, 2000, allFiles.slice())),
               new Promise(resolve => setTimeout(resolve, 3000, allFiles.slice())),
               new Promise(resolve => setTimeout(resolve, 1000, allFiles.slice())),
           );

       const gen = new Generator(fs, '');
       const config = await gen.process({
         index: '/index.html',
         assetGroups: [
           {
             name: 'group-foo',
             resources: {files: ['/foo/**/*.js']},
           },
           {
             name: 'group-bar',
             resources: {files: ['/bar/**/*.js']},
           },
           {
             name: 'group-fallback',
             resources: {files: ['/**/*.js']},
           },
         ],
       });

       expect(config).toEqual({
         configVersion: 1,
         timestamp: 1234567890123,
         appData: undefined,
         index: '/index.html',
         assetGroups: [
           {
             name: 'group-foo',
             installMode: 'prefetch',
             updateMode: 'prefetch',
             cacheQueryOptions: {ignoreVary: true},
             urls: [
               '/foo/script-1.js',
               '/foo/script-2.js',
             ],
             patterns: [],
           },
           {
             name: 'group-bar',
             installMode: 'prefetch',
             updateMode: 'prefetch',
             cacheQueryOptions: {ignoreVary: true},
             urls: [
               '/bar/script-3.js',
               '/bar/script-4.js',
             ],
             patterns: [],
           },
           {
             name: 'group-fallback',
             installMode: 'prefetch',
             updateMode: 'prefetch',
             cacheQueryOptions: {ignoreVary: true},
             urls: [
               '/qux/script-5.js',
             ],
             patterns: [],
           },
         ],
         dataGroups: [],
         hashTable: {
           '/bar/script-3.js': 'bc0a9b488b5707757c491ddac66f56304310b6b1',
           '/bar/script-4.js': 'b7782e97a285f1f6e62feca842384babaa209040',
           '/foo/script-1.js': '3cf257d7ef7e991898f8506fd408cab4f0c2de91',
           '/foo/script-2.js': '9de2ba54065bb9d610bce51beec62e35bea870a7',
           '/qux/script-5.js': '3dceafdc0a1b429718e45fbf8e3005dd767892de'
         },
         navigationUrls: [
           {positive: true, regex: '^\\/.*$'},
           {positive: false, regex: '^\\/(?:.+\\/)?[^/]*\\.[^/]*$'},
           {positive: false, regex: '^\\/(?:.+\\/)?[^/]*__[^/]*$'},
           {positive: false, regex: '^\\/(?:.+\\/)?[^/]*__[^/]*\\/.*$'},
         ],
         navigationRequestStrategy: 'performance',
       });
     });

  it('uses default `navigationUrls` if not provided', async () => {
    const fs = new MockFilesystem({
      '/index.html': 'This is a test',
    });
    const gen = new Generator(fs, '/test');
    const config = await gen.process({
      index: '/index.html',
    });

    expect(config).toEqual({
      configVersion: 1,
      timestamp: 1234567890123,
      appData: undefined,
      index: '/test/index.html',
      assetGroups: [],
      dataGroups: [],
      navigationUrls: [
        {positive: true, regex: '^\\/.*$'},
        {positive: false, regex: '^\\/(?:.+\\/)?[^/]*\\.[^/]*$'},
        {positive: false, regex: '^\\/(?:.+\\/)?[^/]*__[^/]*$'},
        {positive: false, regex: '^\\/(?:.+\\/)?[^/]*__[^/]*\\/.*$'},
      ],
      navigationRequestStrategy: 'performance',
      hashTable: {},
    });
  });

  it('throws if the obsolete `versionedFiles` is used', async () => {
    const fs = new MockFilesystem({
      '/index.html': 'This is a test',
      '/main.js': 'This is a JS file',
    });
    const gen = new Generator(fs, '/test');

    try {
      await gen.process({
        index: '/index.html',
        assetGroups: [{
          name: 'test',
          resources: {
            files: [
              '/*.html',
            ],
            versionedFiles: [
              '/*.js',
            ],
          } as AssetGroup['resources'] &
              {versionedFiles: string[]},
        }],
      });
      throw new Error('Processing should have failed due to \'versionedFiles\'.');
    } catch (err) {
      expect(err).toEqual(new Error(
          'Asset-group \'test\' in \'ngsw-config.json\' uses the \'versionedFiles\' option, ' +
          'which is no longer supported. Use \'files\' instead.'));
    }
  });

  it('generates a correct config with `cacheOpaqueResponses`', async () => {
    const fs = new MockFilesystem({
      '/index.html': 'This is a test',
    });
    const gen = new Generator(fs, '/');
    const config = await gen.process({
      index: '/index.html',
      dataGroups: [
        {
          name: 'freshness-undefined',
          urls: ['/api/1/**'],
          cacheConfig: {
            maxAge: '3d',
            maxSize: 100,
            strategy: 'freshness',
          },
        },
        {
          name: 'freshness-false',
          urls: ['/api/2/**'],
          cacheConfig: {
            cacheOpaqueResponses: false,
            maxAge: '3d',
            maxSize: 100,
            strategy: 'freshness',
          },
        },
        {
          name: 'freshness-true',
          urls: ['/api/3/**'],
          cacheConfig: {
            cacheOpaqueResponses: true,
            maxAge: '3d',
            maxSize: 100,
            strategy: 'freshness',
          },
        },
        {
          name: 'performance-undefined',
          urls: ['/api/4/**'],
          cacheConfig: {
            maxAge: '3d',
            maxSize: 100,
            strategy: 'performance',
          },
        },
        {
          name: 'performance-false',
          urls: ['/api/5/**'],
          cacheConfig: {
            cacheOpaqueResponses: false,
            maxAge: '3d',
            maxSize: 100,
            strategy: 'performance',
          },
        },
        {
          name: 'performance-true',
          urls: ['/api/6/**'],
          cacheConfig: {
            cacheOpaqueResponses: true,
            maxAge: '3d',
            maxSize: 100,
            strategy: 'performance',
          },
        },
      ],
    });

    expect(config).toEqual({
      configVersion: 1,
      appData: undefined,
      timestamp: 1234567890123,
      index: '/index.html',
      assetGroups: [],
      dataGroups: [
        {
          name: 'freshness-undefined',
          patterns: [
            '\\/api\\/1\\/.*',
          ],
          strategy: 'freshness',
          maxSize: 100,
          maxAge: 259200000,
          timeoutMs: undefined,
          version: 1,
          cacheOpaqueResponses: undefined,
          cacheQueryOptions: {ignoreVary: true},
        },
        {
          name: 'freshness-false',
          patterns: [
            '\\/api\\/2\\/.*',
          ],
          strategy: 'freshness',
          maxSize: 100,
          maxAge: 259200000,
          timeoutMs: undefined,
          version: 1,
          cacheOpaqueResponses: false,
          cacheQueryOptions: {ignoreVary: true},
        },
        {
          name: 'freshness-true',
          patterns: [
            '\\/api\\/3\\/.*',
          ],
          strategy: 'freshness',
          maxSize: 100,
          maxAge: 259200000,
          timeoutMs: undefined,
          version: 1,
          cacheOpaqueResponses: true,
          cacheQueryOptions: {ignoreVary: true},
        },
        {
          name: 'performance-undefined',
          patterns: [
            '\\/api\\/4\\/.*',
          ],
          strategy: 'performance',
          maxSize: 100,
          maxAge: 259200000,
          timeoutMs: undefined,
          version: 1,
          cacheOpaqueResponses: undefined,
          cacheQueryOptions: {ignoreVary: true},
        },
        {
          name: 'performance-false',
          patterns: [
            '\\/api\\/5\\/.*',
          ],
          strategy: 'performance',
          maxSize: 100,
          maxAge: 259200000,
          timeoutMs: undefined,
          version: 1,
          cacheOpaqueResponses: false,
          cacheQueryOptions: {ignoreVary: true},
        },
        {
          name: 'performance-true',
          patterns: [
            '\\/api\\/6\\/.*',
          ],
          strategy: 'performance',
          maxSize: 100,
          maxAge: 259200000,
          timeoutMs: undefined,
          version: 1,
          cacheOpaqueResponses: true,
          cacheQueryOptions: {ignoreVary: true},
        },
      ],
      navigationUrls: [
        {positive: true, regex: '^\\/.*$'},
        {positive: false, regex: '^\\/(?:.+\\/)?[^/]*\\.[^/]*$'},
        {positive: false, regex: '^\\/(?:.+\\/)?[^/]*__[^/]*$'},
        {positive: false, regex: '^\\/(?:.+\\/)?[^/]*__[^/]*\\/.*$'},
      ],
      navigationRequestStrategy: 'performance',
      hashTable: {},
    });
  });

  it('generates a correct config with `cacheQueryOptions`', async () => {
    const fs = new MockFilesystem({
      '/index.html': 'This is a test',
      '/main.js': 'This is a JS file',
    });
    const gen = new Generator(fs, '/');
    const config = await gen.process({
      index: '/index.html',
      assetGroups: [{
        name: 'test',
        resources: {
          files: [
            '/**/*.html',
            '/**/*.?s',
          ]
        },
        cacheQueryOptions: {ignoreSearch: true},
      }],
      dataGroups: [{
        name: 'other',
        urls: ['/api/**'],
        cacheConfig: {
          maxAge: '3d',
          maxSize: 100,
          strategy: 'performance',
          timeout: '1m',
        },
        cacheQueryOptions: {ignoreSearch: false},
      }]
    });

    expect(config).toEqual({
      configVersion: 1,
      appData: undefined,
      timestamp: 1234567890123,
      index: '/index.html',
      assetGroups: [{
        name: 'test',
        installMode: 'prefetch',
        updateMode: 'prefetch',
        urls: [
          '/index.html',
          '/main.js',
        ],
        patterns: [],
        cacheQueryOptions: {ignoreSearch: true, ignoreVary: true}
      }],
      dataGroups: [{
        name: 'other',
        patterns: [
          '\\/api\\/.*',
        ],
        strategy: 'performance',
        maxSize: 100,
        maxAge: 259200000,
        timeoutMs: 60000,
        version: 1,
        cacheOpaqueResponses: undefined,
        cacheQueryOptions: {ignoreSearch: false, ignoreVary: true}
      }],
      navigationUrls: [
        {positive: true, regex: '^\\/.*$'},
        {positive: false, regex: '^\\/(?:.+\\/)?[^/]*\\.[^/]*$'},
        {positive: false, regex: '^\\/(?:.+\\/)?[^/]*__[^/]*$'},
        {positive: false, regex: '^\\/(?:.+\\/)?[^/]*__[^/]*\\/.*$'},
      ],
      navigationRequestStrategy: 'performance',
      hashTable: {
        '/index.html': 'a54d88e06612d820bc3be72877c74f257b561b19',
        '/main.js': '41347a66676cdc0516934c76d9d13010df420f2c',
      },
    });
  });

  it('doesn\'t exceed concurrency limit', async () => {
    const fileCount = 600;
    const files = [...Array(fileCount).keys()].reduce((acc: Record<string, string>, _, i) => {
      acc[`/test${i}.js`] = `This is a test ${i}`;
      return acc;
    }, {'/index.html': 'This is a test'});
    const fs = new HashTrackingMockFilesystem(files);
    const gen = new Generator(fs, '/');
    const config = await gen.process({
      index: '/index.html',
      assetGroups: [{
        name: 'test',
        resources: {files: ['/*.js']},
      }],
    });
    expect(fs.maxConcurrentHashings).toBeLessThanOrEqual(500);
    expect(fs.maxConcurrentHashings).toBeGreaterThan(1);
    expect(Object.keys((config as any).hashTable).length).toBe(fileCount);
  });

  describe('processNavigationUrls()', () => {
    const customNavigationUrls = [
      'https://host/positive/external/**',
      '!https://host/negative/external/**',
      '/positive/absolute/**',
      '!/negative/absolute/**',
      'positive/relative/**',
      '!negative/relative/**',
    ];

    it('uses the default `navigationUrls` if not provided', () => {
      expect(processNavigationUrls('/')).toEqual([
        {positive: true, regex: '^\\/.*$'},
        {positive: false, regex: '^\\/(?:.+\\/)?[^/]*\\.[^/]*$'},
        {positive: false, regex: '^\\/(?:.+\\/)?[^/]*__[^/]*$'},
        {positive: false, regex: '^\\/(?:.+\\/)?[^/]*__[^/]*\\/.*$'},
      ]);
    });

    it('prepends `baseHref` to relative URL patterns only', () => {
      expect(processNavigationUrls('/base/href/', customNavigationUrls)).toEqual([
        {positive: true, regex: '^https:\\/\\/host\\/positive\\/external\\/.*$'},
        {positive: false, regex: '^https:\\/\\/host\\/negative\\/external\\/.*$'},
        {positive: true, regex: '^\\/positive\\/absolute\\/.*$'},
        {positive: false, regex: '^\\/negative\\/absolute\\/.*$'},
        {positive: true, regex: '^\\/base\\/href\\/positive\\/relative\\/.*$'},
        {positive: false, regex: '^\\/base\\/href\\/negative\\/relative\\/.*$'},
      ]);
    });

    it('strips a leading single `.` from a relative `baseHref`', () => {
      expect(processNavigationUrls('./relative/base/href/', customNavigationUrls)).toEqual([
        {positive: true, regex: '^https:\\/\\/host\\/positive\\/external\\/.*$'},
        {positive: false, regex: '^https:\\/\\/host\\/negative\\/external\\/.*$'},
        {positive: true, regex: '^\\/positive\\/absolute\\/.*$'},
        {positive: false, regex: '^\\/negative\\/absolute\\/.*$'},
        {positive: true, regex: '^\\/relative\\/base\\/href\\/positive\\/relative\\/.*$'},
        {positive: false, regex: '^\\/relative\\/base\\/href\\/negative\\/relative\\/.*$'},
      ]);

      // We can't correctly handle double dots in `baseHref`, so leave them as literal matches.
      expect(processNavigationUrls('../double/dots/', customNavigationUrls)).toEqual([
        {positive: true, regex: '^https:\\/\\/host\\/positive\\/external\\/.*$'},
        {positive: false, regex: '^https:\\/\\/host\\/negative\\/external\\/.*$'},
        {positive: true, regex: '^\\/positive\\/absolute\\/.*$'},
        {positive: false, regex: '^\\/negative\\/absolute\\/.*$'},
        {positive: true, regex: '^\\.\\.\\/double\\/dots\\/positive\\/relative\\/.*$'},
        {positive: false, regex: '^\\.\\.\\/double\\/dots\\/negative\\/relative\\/.*$'},
      ]);
    });
  });
});
