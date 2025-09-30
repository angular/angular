/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {readFileSync, readdirSync} from 'fs';

describe('Zone.js npm_package', () => {
  process.chdir('../npm_package');
  describe('misc root files', () => {
    describe('README.md', () => {
      it('should have a README.md file with basic info', () => {
        expect(readFileSync('README.md', 'utf-8')).toContain(`Zone`);
      });
    });
  });

  describe('primary entry-point', () => {
    const packageJson = readFileSync('package.json', 'utf-8');

    it('should have a package.json file', () => {
      expect(packageJson).toContain('"name": "zone.js"');
    });

    it('should contain correct version number with the PLACEHOLDER string replaced', () => {
      expect(packageJson).toMatch(/\"version\": "\d+\.\d+\.\d+(?!-PLACEHOLDER)"/);
    });

    it('should contain module resolution mappings', () => {
      expect(packageJson).toContain('"main": "./bundles/zone.umd.js"');
    });

    it('should contain typings', () => {
      expect(packageJson).toContain('"typings": "./zone.d.ts"');
    });
  });

  describe('check npm_package root folder', () => {
    describe('typescript support', () => {
      it('should include types', () => {
        // Root `zone.d.ts` file imports globals and extensions.
        const zoneDTsFile = readFileSync('zone.d.ts', 'utf-8');
        expect(zoneDTsFile).toContain('lib/zone');
        expect(zoneDTsFile).toContain('lib/zone.api.extensions');
        expect(zoneDTsFile).toContain('lib/zone.configurations.api');

        // Defines globals.
        const libZoneDTsFile = readFileSync('lib/zone.d.ts', 'utf-8');
        expect(libZoneDTsFile).toContain('declare global {');
        expect(libZoneDTsFile).toContain('const Zone');

        // Defines extensions.
        expect(readFileSync('lib/zone.api.extensions.d.ts', 'utf-8')).toContain(
          'interface EventTarget',
        );
        expect(readFileSync('lib/zone.configurations.api.d.ts', 'utf-8')).toContain(
          'ZoneGlobalConfigurations',
        );
      });
    });

    describe('rxjs patch', () => {
      it('should not contain rxjs source', () => {
        expect(readFileSync('bundles/zone-patch-rxjs.umd.js', 'utf-8')).not.toContain(
          '_enable_super_gross_mode_that_will_cause_bad_things',
        );
        expect(readFileSync('fesm2015/zone-patch-rxjs.js', 'utf-8')).not.toContain(
          '_enable_super_gross_mode_that_will_cause_bad_things',
        );
      });
    });

    describe('es5', () => {
      it('zone.js(es5) should not contain es6 spread code', () => {
        expect(readFileSync('bundles/zone.umd.js', 'utf-8')).not.toContain('let value of values');
      });

      it('zone.js(es5) should not contain source map comment', () => {
        expect(readFileSync('bundles/zone.umd.js', 'utf-8')).not.toContain('sourceMappingURL');
      });

      it('zone.js(es5) should contain use strict', () => {
        expect(readFileSync('bundles/zone.umd.js', 'utf-8')).toMatch(/^\s*'use strict';/);
      });
    });

    describe('es2015', () => {
      it('zone.js(es2015) should contain es6 code', () => {
        expect(readFileSync('fesm2015/zone.js', 'utf-8')).toContain('let value of values');
      });
      it('zone.js(es2015) should not contain source map comment', () => {
        expect(readFileSync('fesm2015/zone.js', 'utf-8')).not.toContain('sourceMappingURL');
      });
      it('zone.js(es2015) should contain use strict', () => {
        expect(readFileSync('fesm2015/zone.js', 'utf-8')).toMatch(/^\s*'use strict';/);
      });

      it('zone-patch-rxjs.js should have rxjs external', () => {
        expect(readFileSync('fesm2015/zone-patch-rxjs.js', 'utf-8')).toContain(` from "rxjs"`);
        expect(readFileSync('fesm2015/zone-patch-rxjs.js', 'utf-8')).toContain(
          `Zone2.__load_patch("rxjs",`,
        );
      });
    });

    describe('bundles file list', () => {
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

      it('should contain all files in bundles', () => {
        const list = readdirSync('./bundles').sort();
        expect(list.length).toBe(expected.length);
        for (let i = 0; i < list.length; i++) {
          if (expected[i].indexOf('.min.js') !== -1) {
            expect(list[i]).toEqual(expected[i].replace('.min.js', '.umd.min.js'));
          } else {
            expect(list[i]).toEqual(expected[i].replace('.js', '.umd.js'));
          }
        }
      });

      it('should contain all files in fesm2015', () => {
        const list = readdirSync('./fesm2015').sort();
        expect(list.length).toBe(expected.length);
        for (let i = 0; i < list.length; i++) {
          expect(list[i]).toEqual(expected[i]);
        }
      });
    });
  });
});
