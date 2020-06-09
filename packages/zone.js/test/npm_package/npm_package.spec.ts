/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as path from 'path';
import * as shx from 'shelljs';

function checkInSubFolder(subFolder: string, testFn: Function) {
  shx.cd(subFolder);
  testFn();
  shx.cd('../');
}

describe('Zone.js npm_package', () => {
  beforeEach(
      () => {shx.cd(
          path.dirname(require.resolve('angular/packages/zone.js/npm_package/package.json')))});
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
  });

  describe('check npm_package root folder', () => {
    describe('typescript support', () => {
      it('should have an zone.js.d.ts file', () => {
        expect(shx.cat('zone.js.d.ts')).toContain('declare const');
      });

      it('should have an zone.api.extensions.ts file', () => {
        expect(shx.cat('zone.api.extensions.ts')).toContain('EventTarget');
      });

      it('should have an zone.configurations.api.ts file', () => {
        expect(shx.cat('zone.configurations.api.ts')).toContain('ZoneGlobalConfigurations');
      });
    });

    describe('closure', () => {
      it('should contain externs', () => {
        expect(shx.cat('zone_externs.js')).toContain('Externs for zone.js');
      });
    });

    describe('rxjs patch', () => {
      it('should not contain rxjs source', () => {
        checkInSubFolder('./bundles', () => {
          expect(shx.cat('zone-patch-rxjs.umd.js'))
              .not.toContain('_enable_super_gross_mode_that_will_cause_bad_things');
        });
        checkInSubFolder('./fesm2015', () => {
          expect(shx.cat('zone-patch-rxjs.js'))
              .not.toContain('_enable_super_gross_mode_that_will_cause_bad_things');
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
    });


    describe('plugins folder check', () => {
      it('should contain all plugin folders in ./plugins', () => {
        const expected = [
          'async-test',
          'async-test.min',
          'fake-async-test',
          'fake-async-test.min',
          'jasmine-patch',
          'jasmine-patch.min',
          'long-stack-trace-zone',
          'long-stack-trace-zone.min',
          'mocha-patch',
          'mocha-patch.min',
          'proxy',
          'proxy.min',
          'sync-test',
          'sync-test.min',
          'task-tracking',
          'task-tracking.min',
          'webapis-media-query',
          'webapis-media-query.min',
          'webapis-notification',
          'webapis-notification.min',
          'webapis-rtc-peer-connection',
          'webapis-rtc-peer-connection.min',
          'webapis-shadydom',
          'webapis-shadydom.min',
          'wtf',
          'wtf.min',
          'zone-bluebird',
          'zone-bluebird.min',
          'zone-error',
          'zone-error.min',
          'zone-legacy',
          'zone-legacy.min',
          'zone-patch-canvas',
          'zone-patch-canvas.min',
          'zone-patch-cordova',
          'zone-patch-cordova.min',
          'zone-patch-electron',
          'zone-patch-electron.min',
          'zone-patch-fetch',
          'zone-patch-fetch.min',
          'zone-patch-jsonp',
          'zone-patch-jsonp.min',
          'zone-patch-message-port',
          'zone-patch-message-port.min',
          'zone-patch-promise-test',
          'zone-patch-promise-test.min',
          'zone-patch-resize-observer',
          'zone-patch-resize-observer.min',
          'zone-patch-rxjs-fake-async',
          'zone-patch-rxjs-fake-async.min',
          'zone-patch-rxjs',
          'zone-patch-rxjs.min',
          'zone-patch-socket-io',
          'zone-patch-socket-io.min',
          'zone-patch-user-media',
          'zone-patch-user-media.min',
        ].sort();

        checkInSubFolder('./plugins', () => {
          const list = shx.ls('./').stdout.split('\n').sort().slice(1);
          expect(list.length).toBe(expected.length);
          for (let i = 0; i < list.length; i++) {
            expect(list[i]).toEqual(expected[i]);
            const packageJson = shx.cat(`${list[i]}/package.json`);
            const umdMinName = list[i].indexOf('.min') === -1 ?
                `${list[i]}.umd` :
                `${list[i].substring(0, list[i].indexOf('.min'))}.umd.min`;
            expect(packageJson).toContain(`"name": "zone.js/${list[i]}"`);
            expect(packageJson).toContain(`"main": "../../bundles/${umdMinName}.js"`);
            expect(packageJson).toContain(`"fesm2015": "../../fesm2015/${list[i]}.js"`);
            expect(packageJson).toContain(`"es2015": "../../fesm2015/${list[i]}.js"`);
            expect(packageJson).toContain(`"module": "../../fesm2015/${list[i]}.js"`);
          }
        });
      });
    });

    describe('dist file list', () => {
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
          'zone-testing-bundle.js',
          'zone-testing-bundle.min.js',
          'zone-testing-node-bundle.js',
          'zone-testing-node-bundle.min.js',
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

    describe('backward compatible check', () => {
      it('should contain all original folders in /dist', () => {
        const expected = [
          'async-test',
          'async-test.min',
          'fake-async-test',
          'fake-async-test.min',
          'jasmine-patch',
          'jasmine-patch.min',
          'long-stack-trace-zone',
          'long-stack-trace-zone.min',
          'mocha-patch',
          'mocha-patch.min',
          'proxy',
          'proxy.min',
          'sync-test',
          'sync-test.min',
          'task-tracking',
          'task-tracking.min',
          'webapis-media-query',
          'webapis-media-query.min',
          'webapis-notification',
          'webapis-notification.min',
          'webapis-rtc-peer-connection',
          'webapis-rtc-peer-connection.min',
          'webapis-shadydom',
          'webapis-shadydom.min',
          'wtf',
          'wtf.min',
          'zone-bluebird',
          'zone-bluebird.min',
          'zone-error',
          'zone-error.min',
          'zone-legacy',
          'zone-legacy.min',
          'zone-mix',
          'zone-mix.min',
          'zone-node',
          'zone-node.min',
          'zone-patch-canvas',
          'zone-patch-canvas.min',
          'zone-patch-cordova',
          'zone-patch-cordova.min',
          'zone-patch-electron',
          'zone-patch-electron.min',
          'zone-patch-fetch',
          'zone-patch-fetch.min',
          'zone-patch-jsonp',
          'zone-patch-jsonp.min',
          'zone-patch-message-port',
          'zone-patch-message-port.min',
          'zone-patch-promise-test',
          'zone-patch-promise-test.min',
          'zone-patch-resize-observer',
          'zone-patch-resize-observer.min',
          'zone-patch-rxjs-fake-async',
          'zone-patch-rxjs-fake-async.min',
          'zone-patch-rxjs',
          'zone-patch-rxjs.min',
          'zone-patch-socket-io',
          'zone-patch-socket-io.min',
          'zone-patch-user-media',
          'zone-patch-user-media.min',
          'zone-testing-bundle',
          'zone-testing-bundle.min',
          'zone-testing-node-bundle',
          'zone-testing-node-bundle.min',
          'zone-testing',
          'zone-testing.min',
          'zone',
          'zone.min',
          'zone_externs',
          'zone-evergreen',
          'zone-evergreen.min',
          'zone-evergreen-testing-bundle',
          'zone-evergreen-testing-bundle.min',
        ].sort();
        checkInSubFolder('./dist', () => {
          const list = shx.ls('./').stdout.split('\n').sort().slice(1);
          expect(list.length).toBe(expected.length);
          for (let i = 0; i < list.length; i++) {
            expect(list[i]).toEqual(expected[i]);
            const packageJson = shx.cat(`${list[i]}/package.json`);
            if (list[i].indexOf('_externs') !== -1) {
              expect(packageJson).toContain(`"name": "zone.js/${list[i]}"`);
              expect(packageJson).toContain(`"main": "../../${list[i]}.js"`);
              expect(packageJson).toContain(`"fesm2015": "../../${list[i]}.js"`);
              expect(packageJson).toContain(`"es2015": "../../${list[i]}.js"`);
              expect(packageJson).toContain(`"module": "../../${list[i]}.js"`);
              continue;
            }
            if (list[i].indexOf('evergreen') === -1) {
              const umdMinName = list[i].indexOf('.min') === -1 ?
                  `${list[i]}.umd` :
                  `${list[i].substring(0, list[i].indexOf('.min'))}.umd.min`;
              expect(packageJson).toContain(`"name": "zone.js/${list[i]}"`);
              expect(packageJson).toContain(`"main": "../../bundles/${umdMinName}.js"`);
              expect(packageJson).toContain(`"fesm2015": "../../fesm2015/${list[i]}.js"`);
              expect(packageJson).toContain(`"es2015": "../../fesm2015/${list[i]}.js"`);
              expect(packageJson).toContain(`"module": "../../fesm2015/${list[i]}.js"`);
            } else {
              const removeEvergreen = list[i].replace('-evergreen', '');
              expect(packageJson).toContain(`"name": "zone.js/${list[i]}"`);
              expect(packageJson).toContain(`"main": "../../fesm2015/${removeEvergreen}.js"`);
              expect(packageJson).toContain(`"fesm2015": "../../fesm2015/${removeEvergreen}.js"`);
              expect(packageJson).toContain(`"es2015": "../../fesm2015/${removeEvergreen}.js"`);
              expect(packageJson).toContain(`"module": "../../fesm2015/${removeEvergreen}.js"`);
            }
          }
        });
      });
    });
  });
});
