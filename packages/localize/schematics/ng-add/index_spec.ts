/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';

import {localizePolyfill} from './index';


describe('ng-add schematic', () => {
  const countInstances = (str: string, substr: string) => str.split(substr).length - 1;
  const defaultOptions = {name: 'demo'};
  let host: UnitTestTree;
  let schematicRunner: SchematicTestRunner;
  // The real polyfills file is bigger than this, but for the test it shouldn't matter.
  const polyfillsContent =
      `/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js';`;
  const mainServerContent = `import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
if (environment.production) {
  enableProdMode();
}
export { AppServerModule } from './app/app.server.module';
export { renderModule, renderModuleFactory } from '@angular/platform-server';`;

  beforeEach(() => {
    host = new UnitTestTree(new HostTree());
    host.create('package.json', JSON.stringify({
      'devDependencies': {
        // The default (according to `ng-add` in its package.json) is for `@angular/localize` to be
        // saved to `devDependencies`.
        '@angular/localize': '~0.0.0-PLACEHOLDER',
      }
    }));
    host.create('src/polyfills.ts', polyfillsContent);
    host.create('src/another-polyfills.ts', polyfillsContent);
    host.create('src/unrelated-polyfills.ts', polyfillsContent);
    host.create('src/another-unrelated-polyfills.ts', polyfillsContent);
    host.create('src/main.server.ts', mainServerContent);
    host.create('src/another-main.server.ts', mainServerContent);
    host.create('src/unrelated-main.server.ts', mainServerContent);
    host.create('src/another-unrelated-main.server.ts', mainServerContent);
    host.create('angular.json', JSON.stringify({
      version: 1,
      projects: {
        'demo': {
          architect: {
            build: {
              builder: '@angular-devkit/build-angular:browser',
              options: {
                polyfills: 'src/polyfills.ts',
              },
              configurations: {
                production: {
                  polyfills: 'src/another-polyfills.ts',
                }
              }
            },
            'another-build': {
              builder: '@angular-devkit/build-angular:browser',
              options: {
                polyfills: 'src/polyfills.ts',
              },
              configurations: {
                production: {
                  polyfills: 'src/another-polyfills.ts',
                }
              }
            },
            server: {
              builder: '@angular-devkit/build-angular:server',
              options: {
                main: 'src/main.server.ts',
              },
              configurations: {
                production: {
                  main: 'src/another-main.server.ts',
                }
              }
            },
            'another-server': {
              builder: '@angular-devkit/build-angular:server',
              options: {
                main: 'src/main.server.ts',
              },
              configurations: {
                production: {
                  main: 'src/another-main.server.ts',
                }
              }
            },
            'not-browser-or-server': {
              builder: '@angular-devkit/build-angular:something-else',
              options: {
                polyfills: 'src/unrelated-polyfills.ts',
                main: 'src/unrelated-main.server.ts',
              },
              configurations: {
                production: {
                  polyfills: 'src/other-unrelated-polyfills.ts',
                  main: 'src/another-unrelated-main.server.ts',
                }
              }
            },
          },
        }
      },
      defaultProject: 'demo',
    }));
    schematicRunner =
        new SchematicTestRunner('@angular/localize', require.resolve('../collection.json'));
  });

  it('should add localize polyfill to polyfill files', async () => {
    host = await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
    expect(host.readContent('/src/polyfills.ts')).toContain(localizePolyfill);
    expect(host.readContent('/src/another-polyfills.ts')).toContain(localizePolyfill);
  });

  it('should add localize polyfill to server main files', async () => {
    host = await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
    expect(host.readContent('/src/main.server.ts')).toContain(localizePolyfill);
    expect(host.readContent('/src/another-main.server.ts')).toContain(localizePolyfill);
  });

  it('should add localize polyfill at the start of file', async () => {
    host = await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
    const content = host.readContent('/src/polyfills.ts');
    expect(content.indexOf(localizePolyfill)).toBeLessThan(content.indexOf(polyfillsContent));
  });

  it('should not add localize polyfill to files referenced in other targets files', async () => {
    host = await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
    expect(host.readContent('/src/unrelated-polyfills.ts')).not.toContain(localizePolyfill);
    expect(host.readContent('/src/another-unrelated-polyfills.ts')).not.toContain(localizePolyfill);
    expect(host.readContent('/src/unrelated-main.server.ts')).not.toContain(localizePolyfill);
    expect(host.readContent('/src/another-unrelated-main.server.ts'))
        .not.toContain(localizePolyfill);
  });

  it('should only add localize polyfill once if multiple builds reference it', async () => {
    host = await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
    const content = host.readContent('/src/polyfills.ts');
    expect(countInstances(content, localizePolyfill)).toBe(1);
  });

  it('should not add localize polyfill if it\'s already there', async () => {
    const polyfillVariation = localizePolyfill.replace(/'/g, '"');
    host.overwrite('/src/polyfills.ts', `${localizePolyfill}\n${polyfillsContent}`);
    host.overwrite('/src/another-polyfills.ts', `${polyfillVariation}\n${polyfillsContent}`);
    host = await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
    expect(countInstances(host.readContent('/src/polyfills.ts'), localizePolyfill)).toBe(1);
    expect(countInstances(host.readContent('/src/another-polyfills.ts'), localizePolyfill)).toBe(0);
  });

  it('should not break when there are no polyfills', async () => {
    host.overwrite('angular.json', JSON.stringify({
      version: 1,
      projects: {
        'demo': {
          architect: {},
        }
      },
      defaultProject: 'demo',
    }));
    await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
  });

  it('should add package to `devDependencies` by default', async () => {
    host = await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
    const packageJsonText = host.readContent('/package.json');
    const packageJsonObj = JSON.parse(packageJsonText) as
        {devDependencies: {[key: string]: string}, dependencies: {[key: string]: string}};
    expect(packageJsonObj.devDependencies?.['@angular/localize']).toBe('~0.0.0-PLACEHOLDER');
    expect(packageJsonObj.dependencies?.['@angular/localize']).toBeUndefined();
  });

  it('should add package to `dependencies` if `useAtRuntime` is `true`', async () => {
    host = await schematicRunner
               .runSchematicAsync('ng-add', {...defaultOptions, useAtRuntime: true}, host)
               .toPromise();
    const packageJsonText = host.readContent('/package.json');
    const packageJsonObj = JSON.parse(packageJsonText) as
        {devDependencies: {[key: string]: string}, dependencies: {[key: string]: string}};
    expect(packageJsonObj.dependencies?.['@angular/localize']).toBe('~0.0.0-PLACEHOLDER');
    expect(packageJsonObj.devDependencies?.['@angular/localize']).toBeUndefined();
  });
});
