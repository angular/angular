/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Generator} from '../src/generator';
import {MockFilesystem} from '../testing/mock';

{
  describe('Generator', () => {
    it('generates a correct config', done => {
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
      const res = gen.process({
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
            ],
            versionedFiles: [
              '/**/*.txt',
            ],
            urls: [
              '/absolute/**',
              '/some/url?with+escaped+chars',
              'relative/*.txt',
            ]
          }
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
          }
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
      res.then(config => {
           expect(config).toEqual({
             configVersion: 1,
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
               ]
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
             hashTable: {
               '/test/foo/test.html': '18f6f8eb7b1c23d2bb61bff028b83d867a9e4643',
               '/test/index.html': 'a54d88e06612d820bc3be72877c74f257b561b19',
               '/test/main.js': '41347a66676cdc0516934c76d9d13010df420f2c',
               '/test/main.ts': '7d333e31f0bfc4f8152732bb211a93629484c035',
               '/test/test.txt': '18f6f8eb7b1c23d2bb61bff028b83d867a9e4643'
             }
           });
           done();
         })
          .catch(err => done.fail(err));
    });

    it('uses default `navigationUrls` if not provided', done => {
      const fs = new MockFilesystem({
        '/index.html': 'This is a test',
      });
      const gen = new Generator(fs, '/test');
      const res = gen.process({
        index: '/index.html',
      });
      res.then(config => {
           expect(config).toEqual({
             configVersion: 1,
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
             hashTable: {}
           });
           done();
         })
          .catch(err => done.fail(err));
    });
  });
}
