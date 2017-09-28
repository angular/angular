/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Generator} from '../src/generator';
import {MockFilesystem} from '../testing/mock';

export function main() {
  describe('Generator', () => {
    it('generates a correct config', (done: DoneFn) => {
      const fs = new MockFilesystem({
        '/index.html': 'This is a test',
        '/foo/test.html': 'Another test',
        '/ignored/x.html': 'should be ignored',
      });
      const gen = new Generator(fs, '/test');
      const res = gen.process({
        index: '/index.html',
        appData: {
          test: true,
        },
        assetGroups: [{
          name: 'test',
          resources: {
            files: [
              '/**/*.html', '!/ignored/**',
              //                '/*.html',
            ],
            versionedFiles: [],
            urls: [
              '/absolute/**',
              'relative/*.txt',
            ]
          }
        }],
        dataGroups: [{
          name: 'other',
          urls: [
            '/api/**',
            'relapi/**',
          ],
          cacheConfig: {
            maxSize: 100,
            maxAge: '3d',
            timeout: '1m',
          }
        }]
      });
      res.then(config => {
           expect(config).toEqual({
             'configVersion': 1,
             'index': '/test/index.html',
             'appData': {
               'test': true,
             },
             'assetGroups': [{
               'name': 'test',
               'installMode': 'prefetch',
               'updateMode': 'prefetch',
               'urls': ['/test/index.html', '/test/foo/test.html'],
               'patterns': ['\\/absolute\\/.*', '\\/test\\/relative\\/[^\\/]+\\.txt']
             }],
             'dataGroups': [{
               'name': 'other',
               'patterns': ['\\/api\\/.*', '\\/test\\/relapi\\/.*'],
               'strategy': 'performance',
               'maxSize': 100,
               'maxAge': 259200000,
               'timeoutMs': 60000,
               'version': 1,
             }],
             'hashTable': {
               '/test/index.html': 'a54d88e06612d820bc3be72877c74f257b561b19',
               '/test/foo/test.html': '18f6f8eb7b1c23d2bb61bff028b83d867a9e4643'
             }
           });
           done();
         })
          .catch(err => done.fail(err));
    });
  });
}
