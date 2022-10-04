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
  const defaultOptions = {project: 'demo'};
  let host: UnitTestTree;
  let schematicRunner: SchematicTestRunner;
  const polyfillsContent = '';
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
      },
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
          root: '',
          architect: {
            build: {
              builder: '@angular-devkit/build-angular:browser',
              options: {
                polyfills: 'src/polyfills.ts',
              },
              configurations: {
                production: {
                  polyfills: 'src/another-polyfills.ts',
                },
              },
            },
            test: {
              builder: '@angular-devkit/build-angular:karma',
              options: {
                polyfills: ['src/polyfills.ts'],
              },
              configurations: {
                production: {
                  polyfills: ['src/another-polyfills.ts'],
                },
                dev: {
                  polyfills: [localizePolyfill],
                },
              },
            },
            'another-test': {
              builder: '@angular-devkit/build-angular:karma',
              options: {},
            },
            server: {
              builder: '@angular-devkit/build-angular:server',
              options: {
                main: 'src/main.server.ts',
              },
              configurations: {
                production: {
                  main: 'src/another-main.server.ts',
                },
              },
            },
            'another-server': {
              builder: '@angular-devkit/build-angular:server',
              options: {
                main: 'src/main.server.ts',
              },
              configurations: {
                production: {
                  main: 'src/another-main.server.ts',
                },
              },
            },
            'not-browser-or-server': {
              builder: '@angular-devkit/build-angular:something-else',
              options: {
                polyfills: 'src/unrelated-polyfills.ts',
                main: 'src/unrelated-main.server.ts',
              },
              configurations: {
                production: {
                  polyfills: ['src/other-unrelated-polyfills.ts'],
                  main: 'src/another-unrelated-main.server.ts',
                },
              },
            },
          },
        },
      },
    }));
    schematicRunner =
        new SchematicTestRunner('@angular/localize', require.resolve('../collection.json'));
  });

  it(`should add localize polyfill to polyfill option when it's a string`, async () => {
    host = await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
    const demoProjectBuild =
        (host.readJson('angular.json') as any)['projects']['demo']['architect']['build'];
    expect(demoProjectBuild['options']['polyfills']).toEqual([
      'src/polyfills.ts',
      localizePolyfill,
    ]);
    expect(demoProjectBuild['configurations']['production']['polyfills']).toEqual([
      'src/another-polyfills.ts',
      localizePolyfill,
    ]);
  });

  it(`should add localize polyfill to polyfill option when it's a array`, async () => {
    host = await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
    const demoProjectAnotherTest =
        (host.readJson('angular.json') as any)['projects']['demo']['architect']['test'];
    expect(demoProjectAnotherTest['options']['polyfills']).toEqual([
      'src/polyfills.ts',
      localizePolyfill,
    ]);
    expect(demoProjectAnotherTest['configurations']['production']['polyfills']).toEqual([
      'src/another-polyfills.ts',
      localizePolyfill,
    ]);
  });

  it(`should not add localize polyfill to polyfill option when it's already set`, async () => {
    host = await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
    const demoProjectAnotherTest =
        (host.readJson('angular.json') as any)['projects']['demo']['architect']['test'];
    expect(demoProjectAnotherTest['configurations']['dev']['polyfills']).toEqual([
      localizePolyfill,
    ]);
  });
  it(`should add localize polyfill when polyfills options is not set`, async () => {
    host = await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
    const demoProjectAnotherTest =
        (host.readJson('angular.json') as any)['projects']['demo']['architect']['another-test'];
    expect(demoProjectAnotherTest['options']['polyfills']).toEqual([
      localizePolyfill,
    ]);
  });

  it('should add localize polyfill to server main files', async () => {
    host = await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
    expect(host.readContent('/src/main.server.ts')).toContain(localizePolyfill);
    expect(host.readContent('/src/another-main.server.ts')).toContain(localizePolyfill);
  });

  it('should not add localize polyfill to files referenced in other targets files', async () => {
    host = await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
    expect(host.readContent('/src/unrelated-polyfills.ts')).not.toContain(localizePolyfill);
    expect(host.readContent('/src/another-unrelated-polyfills.ts')).not.toContain(localizePolyfill);
    expect(host.readContent('/src/unrelated-main.server.ts')).not.toContain(localizePolyfill);
    expect(host.readContent('/src/another-unrelated-main.server.ts'))
        .not.toContain(localizePolyfill);

    const demoProjectBuild =
        (host.readJson('angular.json') as
         any)['projects']['demo']['architect']['not-browser-or-server'];
    expect(demoProjectBuild['options']['polyfills']).toBe('src/unrelated-polyfills.ts');
    expect(demoProjectBuild['configurations']['production']['polyfills']).toEqual([
      'src/other-unrelated-polyfills.ts',
    ]);
  });

  it('should not break when there are no polyfills', async () => {
    host.overwrite('angular.json', JSON.stringify({
      version: 1,
      projects: {
        'demo': {
          root: '',
          architect: {},
        },
      },
      defaultProject: 'demo',
    }));
    await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
  });

  it('should add package to `devDependencies` by default', async () => {
    host = await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
    const packageJsonText = host.readContent('/package.json');
    const packageJsonObj = JSON.parse(packageJsonText) as {
      devDependencies: {[key: string]: string};
      dependencies: {[key: string]: string};
    };
    expect(packageJsonObj.devDependencies?.['@angular/localize']).toBe('~0.0.0-PLACEHOLDER');
    expect(packageJsonObj.dependencies?.['@angular/localize']).toBeUndefined();
  });

  it('should add package to `dependencies` if `useAtRuntime` is `true`', async () => {
    host = await schematicRunner
               .runSchematicAsync('ng-add', {...defaultOptions, useAtRuntime: true}, host)
               .toPromise();
    const packageJsonText = host.readContent('/package.json');
    const packageJsonObj = JSON.parse(packageJsonText) as {
      devDependencies: {[key: string]: string};
      dependencies: {[key: string]: string};
    };
    expect(packageJsonObj.dependencies?.['@angular/localize']).toBe('~0.0.0-PLACEHOLDER');
    expect(packageJsonObj.devDependencies?.['@angular/localize']).toBeUndefined();
  });
});
