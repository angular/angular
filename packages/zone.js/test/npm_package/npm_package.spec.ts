/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import path from 'path';
import shx from 'shelljs';

function checkInSubFolder(subFolder: string, testFn: Function) {
  shx.cd(subFolder);
  testFn();
  shx.cd('../');
}

describe('Zone.js npm_package', () => {
  beforeEach(() => {
    shx.cd(path.dirname(path.resolve('../npm_package/package.json')));
  });
  describe('misc root files', () => {
    describe('README.md', () => {
      it('should have a README.md file with basic info', () => {
        expect(shx.cat('README.md')).toContain(`Zone`);
      });
    });
  });

  describe('primary entry-point', () => {
    const packageJson = 'package.json';

    it('should have a package.json file', () => {
      expect(shx.grep('"name":', packageJson)).toContain(`zone.js`);
    });

    it('should contain correct version number with the PLACEHOLDER string replaced', () => {
      expect(shx.grep('"version":', packageJson)).toMatch(/\d+\.\d+\.\d+(?!-PLACEHOLDER)/);
    });

    it('should contain module resolution mappings', () => {
      expect(shx.grep('"main":', packageJson)).toContain(`zone.umd.js`);
    });

    it('should contain typings', () => {
      expect(shx.grep('"typings":', packageJson)).toContain(`./zone.d.ts`);
    });
  });

  describe('check npm_package root folder', () => {
    describe('typescript support', () => {
      it('should include types', () => {
        // Root `zone.d.ts` file imports globals and extensions.
        expect(shx.cat('zone.d.ts')).toContain('lib/zone');
        expect(shx.cat('zone.d.ts')).toContain('lib/zone.api.extensions');
        expect(shx.cat('zone.d.ts')).toContain('lib/zone.configurations.api');

        // Defines globals.
        expect(shx.cat('lib/zone.d.ts')).toContain('declare global {');
        expect(shx.cat('lib/zone.d.ts')).toContain('const Zone');

        // Defines extensions.
        expect(shx.cat('lib/zone.api.extensions.d.ts')).toContain('interface EventTarget');
        expect(shx.cat('lib/zone.configurations.api.d.ts')).toContain('ZoneGlobalConfigurations');
      });
    });

    describe('rxjs patch', () => {
      it('should not contain rxjs source', () => {
        checkInSubFolder('./bundles', () => {
          expect(shx.cat('zone-patch-rxjs.umd.js')).not.toContain(
            '_enable_super_gross_mode_that_will_cause_bad_things',
          );
        });
        checkInSubFolder('./fesm2015', () => {
          expect(shx.cat('zone-patch-rxjs.js')).not.toContain(
            '_enable_super_gross_mode_that_will_cause_bad_things',
          );
        });
      });
    });

    describe('es5', () => {
      it('zone.js(es5) should not contain es6 spread code', () => {
        checkInSubFolder('./bundles', () => {
          expect(shx.cat('zone.umd.js')).not.toContain('let value of values');
        });
      });

      it('zone.js(es5) should not contain source map comment', () => {
        checkInSubFolder('./bundles', () => {
          expect(shx.cat('zone.umd.js')).not.toContain('sourceMappingURL');
        });
      });

      it('zone.js(es5) should contain use strict', () => {
        checkInSubFolder('./bundles', () => {
          expect(shx.cat('zone.umd.js')).toMatch(/^\s*'use strict';/);
        });
      });
    });

    describe('es2015', () => {
      it('zone.js(es2015) should contain es6 code', () => {
        checkInSubFolder('./fesm2015', () => {
          expect(shx.cat('zone.js')).toContain('let value of values');
        });
      });
      it('zone.js(es2015) should not contain source map comment', () => {
        checkInSubFolder('./fesm2015', () => {
          expect(shx.cat('zone.js')).not.toContain('sourceMappingURL');
        });
      });
      it('zone.js(es2015) should contain use strict', () => {
        checkInSubFolder('./fesm2015', () => {
          expect(shx.cat('zone.js')).toMatch(/^\s*'use strict';/);
        });
      });

      it('zone-patch-rxjs.js should have rxjs external', () => {
        checkInSubFolder('./fesm2015', () => {
          expect(shx.cat('zone-patch-rxjs.js')).toContain(` from 'rxjs'`);
          expect(shx.cat('zone-patch-rxjs.js')).toContain(`Zone.__load_patch('rxjs',`);
        });
      });
    });

    describe('bundles file list', () => {
      it('should contain all files', () => {
        const expected = [
          'async-test.js',
          'async-test.min.js',
          'fake-async-test.js',
          'fake-async-test.min.js',
          'jasmine-patch.js',
          'jasmine-patch.min.js',
          'long-stack-trace-zone.js',
          'long-stack-trace-zone.min.js',
          'mocha-patch.js',
          'mocha-patch.min.js',
          'proxy.js',
          'proxy.min.js',
          'sync-test.js',
          'sync-test.min.js',
          'task-tracking.js',
          'task-tracking.min.js',
          'webapis-media-query.js',
          'webapis-media-query.min.js',
          'webapis-notification.js',
          'webapis-notification.min.js',
          'webapis-rtc-peer-connection.js',
          'webapis-rtc-peer-connection.min.js',
          'webapis-shadydom.js',
          'webapis-shadydom.min.js',
          'wtf.js',
          'wtf.min.js',
          'zone-bluebird.js',
          'zone-bluebird.min.js',
          'zone-error.js',
          'zone-error.min.js',
          'zone-legacy.js',
          'zone-legacy.min.js',
          'zone-mix.js',
          'zone-mix.min.js',
          'zone-node.js',
          'zone-node.min.js',
          'zone-patch-canvas.js',
          'zone-patch-canvas.min.js',
          'zone-patch-cordova.js',
          'zone-patch-cordova.min.js',
          'zone-patch-electron.js',
          'zone-patch-electron.min.js',
          'zone-patch-fetch.js',
          'zone-patch-fetch.min.js',
          'zone-patch-jsonp.js',
          'zone-patch-jsonp.min.js',
          'zone-patch-message-port.js',
          'zone-patch-message-port.min.js',
          'zone-patch-promise-test.js',
          'zone-patch-promise-test.min.js',
          'zone-patch-resize-observer.js',
          'zone-patch-resize-observer.min.js',
          'zone-patch-rxjs-fake-async.js',
          'zone-patch-rxjs-fake-async.min.js',
          'zone-patch-rxjs.js',
          'zone-patch-rxjs.min.js',
          'zone-patch-socket-io.js',
          'zone-patch-socket-io.min.js',
          'zone-patch-user-media.js',
          'zone-patch-user-media.min.js',
          'zone-testing.js',
          'zone-testing.min.js',
          'zone.js',
          'zone.min.js',
        ].sort();
        checkInSubFolder('./bundles', () => {
          const list = shx.ls('./').stdout.split('\n').sort().slice(1);
          expect(list.length).toBe(expected.length);
          for (let i = 0; i < list.length; i++) {
            if (expected[i].indexOf('.min.js') !== -1) {
              expect(list[i]).toEqual(expected[i].replace('.min.js', '.umd.min.js'));
            } else {
              expect(list[i]).toEqual(expected[i].replace('.js', '.umd.js'));
            }
          }
        });
        checkInSubFolder('./fesm2015', () => {
          const list = shx.ls('./').stdout.split('\n').sort().slice(1);
          expect(list.length).toBe(expected.length);
          for (let i = 0; i < list.length; i++) {
            expect(list[i]).toEqual(expected[i]);
          }
        });
      });
    });
  });
});
