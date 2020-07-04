/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getSystemPath, normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import * as shx from 'shelljs';

describe('Missing injectable migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;
  let warnOutput: string[];

  beforeEach(() => {
    runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/tsconfig.json', JSON.stringify({
      compilerOptions: {
        experimentalDecorators: true,
        lib: ['es2015'],
      },
    }));
    writeFile('/angular.json', JSON.stringify({
      projects: {t: {architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));

    warnOutput = [];
    runner.logger.subscribe(logEntry => {
      if (logEntry.level === 'warn') {
        warnOutput.push(logEntry.message);
      }
    });

    previousWorkingDir = shx.pwd();
    tmpDirPath = getSystemPath(host.root);

    // Switch into the temporary directory path. This allows us to run
    // the schematic against our custom unit test tree.
    shx.cd(tmpDirPath);

    writeFile('/node_modules/@angular/core/index.d.ts', `
      export declare function forwardRef(fn: Function);
    `);
  });

  afterEach(() => {
    shx.cd(previousWorkingDir);
    shx.rm('-r', tmpDirPath);
  });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v10-missing-injectable', {}, tree).toPromise();
  }

  describe('NgModule', () => createTests('NgModule', 'providers'));
  describe('Directive', () => createTests('Directive', 'providers'));

  describe('Component', () => {
    createTests('Component', 'providers');
    createTests('Component', 'viewProviders');

    it('should migrate all providers defined in "viewProviders" and "providers" in the ' +
           'same component',
       async () => {
         writeFile('/index.ts', `
          import {Component} from '@angular/core';

          export class MyService {}
          export class MySecondService {}

          @Component({
            providers: [MyService],
            viewProviders: [MySecondService],
          })
          export class TestClass {}
        `);

         await runMigration();

         expect(warnOutput.length).toBe(0);
         expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class MyService/);
         expect(tree.readContent('/index.ts'))
             .toMatch(/@Injectable\(\)\s+export class MySecondService/);
         expect(tree.readContent('/index.ts'))
             .toContain(`{ Component, Injectable } from '@angular/core`);
       });
  });

  function createTests(
      type: 'NgModule'|'Directive'|'Component', propName: 'providers'|'viewProviders') {
    it(`should migrate type provider in ${type}`, async () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';

        export class MyService {}

        @${type}({${propName}: [MyService]})
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class MyService/);
      expect(tree.readContent('/index.ts'))
          .toContain(`{ ${type}, Injectable } from '@angular/core`);
    });

    it(`should migrate object literal provider in ${type} to explicit value provider`, async () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';

        export class MyService {}

        @${type}({${propName}: [{provide: MyService}]})
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).toMatch(/@angular\/core';\s+export class MyService/);
      expect(tree.readContent('/index.ts'))
          .toContain(`${propName}: [{ provide: MyService, useValue: undefined }]`);
      expect(tree.readContent('/index.ts')).toContain(`{${type}} from '@angular/core`);
    });

    it(`should migrate object literal provider with forwardRef in ${type}`, async () => {
      writeFile('/index.ts', `
        import {${type}, forwardRef} from '@angular/core';

        @${type}({${propName}: [forwardRef(() => MyService)]})
        export class TestClass {}

        export class MyService {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class MyService/);
      expect(tree.readContent('/index.ts'))
          .toContain(`{ ${type}, forwardRef, Injectable } from '@angular/core`);
    });

    it(`should not migrate object literal provider with "useValue" in ${type}`, async () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';

        export class MyService {}

        @${type}({${propName}: [{provide: MyService, useValue: null }]})
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).not.toContain('@Injectable');
    });

    it(`should not migrate provider with "useClass" and "deps" in ${type}`, async () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';

        export class MyService {}

        @${type}({${propName}: [{provide: MyService, deps: []}]})
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).not.toContain('@Injectable');
    });

    it(`should not migrate object literal provider with "useFactory" in ${type}`, async () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';

        export class MyService {}

        @${type}({${propName}: [{provide: MyService, useFactory: () => null }]})
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).not.toContain('@Injectable');
    });

    it(`should not migrate object literal provider with "useExisting" in ${type}`, async () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';

        export class MyService {}
        export class MyToken {}

        @${type}({${propName}: [
          {provide: MyService: useValue: null},
          {provide: MyToken, useExisting: MyService},
        ]})
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).not.toContain('@Injectable');
    });

    it(`should migrate object literal provider with "useClass" in ${type}`, async () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';

        export class MyService {}
        export class MyToken {}

        @${type}({${propName}: [{provide: MyToken, useClass: MyService}]})
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class MyService/);
      expect(tree.readContent('/index.ts')).toMatch(/MyService {}\s+export class MyToken/);
      expect(tree.readContent('/index.ts'))
          .toContain(`{ ${type}, Injectable } from '@angular/core`);
    });

    it(`should not migrate references for providers with "useExisting" in ${type}, but migrate ` +
           `existing token if declared in other ${type}`,
       async () => {
         writeFile('/index.ts', `
        import {${type}} from '@angular/core';

        export class MyService {}
        export class MyToken {}

        @${type}({
          ${propName}: [
            {provide: MyToken, useExisting: MyService},
          ],
        })
        export class TestClass {}
      `);

         writeFile('/other.ts', `
        import {${type} from '@angular/core';
        import {MyService} from './index';

        export @${type}({
          ${propName}: [{provide: MyService, useClass: MyService}],
        })
        export class OtherClass {}
      `);

         await runMigration();

         expect(warnOutput.length).toBe(0);
         expect(tree.readContent('/index.ts'))
             .toMatch(/@angular\/core';\s+@Injectable\(\)\s+export class MyService/);
         expect(tree.readContent('/index.ts')).toMatch(/MyService {}\s+export class MyToken/);
       });

    it('should not migrate provider which is already decorated with @Injectable', async () => {
      writeFile('/index.ts', `
        import {Injectable, ${type}} from '@angular/core';

        @Injectable()
        export class MyService {}

        @${type}({${propName}: [MyService]})
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts'))
          .toMatch(/@angular\/core';\s+@Injectable\(\)\s+export class MyService/);
    });

    it('should not migrate provider which is already decorated with @Directive', async () => {
      writeFile('/index.ts', `
        import {Directive, ${type}} from '@angular/core';

        @Directive()
        export class MyService {}

        @${type}({${propName}: [MyService]})
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).not.toContain('@Injectable');
    });

    it('should not migrate provider which is already decorated with @Component', async () => {
      writeFile('/index.ts', `
        import {Component, ${type}} from '@angular/core';

        @Component()
        export class MyService {}

        @${type}({${propName}: [MyService]})
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).not.toContain('@Injectable');
    });

    it('should not migrate provider which is already decorated with @Pipe', async () => {
      writeFile('/index.ts', `
        import {Pipe, ${type}} from '@angular/core';

        @Pipe()
        export class MyService {}

        @${type}({${propName}: [MyService]})
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).not.toContain('@Injectable');
    });

    it('should not migrate provider which is already decorated with @NgModule', async () => {
      const importedSymbols = type !== 'NgModule' ? ['NgModule', type] : ['NgModule'];
      writeFile('/index.ts', `
        import {${importedSymbols.join(', ')}} from '@angular/core';

        @NgModule()
        export class MyOtherModule {}

        @${type}({${propName}: [MyOtherModule]})
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).not.toContain('@Injectable');
    });

    it(`should migrate multiple providers in same ${type}`, async () => {
      writeFile('/index.ts', `
      import {${type}} from '@angular/core';

      export class ServiceA {}
      export class ServiceB {}

      @${type}({${propName}: [ServiceA, ServiceB]})
      export class TestClass {}
    `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceA/);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceB/);
      expect(tree.readContent('/index.ts'))
          .toContain(`{ ${type}, Injectable } from '@angular/core`);
    });

    it(`should migrate multiple mixed providers in same ${type}`, async () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';

        export class ServiceA {}
        export class ServiceB {}
        export class ServiceC {}

        @${type}({
          ${propName}: [
            ServiceA,
            {provide: ServiceB},
            {provide: SomeToken, useClass: ServiceC},
          ]})
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceA/);
      expect(tree.readContent('/index.ts')).toMatch(/ServiceA {}\s+export class ServiceB/);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceC/);
      expect(tree.readContent('/index.ts'))
          .toContain(`{ ${type}, Injectable } from '@angular/core`);
      expect(tree.readContent('/index.ts'))
          .toContain(`{ provide: ServiceB, useValue: undefined },`);
    });

    it(`should migrate multiple nested providers in same ${type}`, async () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';

        export class ServiceA {}
        export class ServiceB {}
        export class ServiceC {}
        export class ServiceD {}

        @${type}({
          ${propName}: [
            ServiceA,
            [
              {provide: ServiceB, useClass: ServiceB},
              ServiceC,
              {provide: ServiceD},
            ],
          ]})
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceA/);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceB/);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceC/);
      expect(tree.readContent('/index.ts')).toMatch(/ServiceC {}\s+export class ServiceD/);
      expect(tree.readContent('/index.ts'))
          .toContain(`{ ${type}, Injectable } from '@angular/core`);
      expect(tree.readContent('/index.ts'))
          .toContain(`{ provide: ServiceD, useValue: undefined },`);
    });

    it('should migrate providers referenced through identifier', async () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';

        export class ServiceA {}
        export class ServiceB {}
        export class ServiceC {}

        const PROVIDERS = [
          ServiceA,
          ServiceB,
          // trailing comma is by intention to check if do not create
          // an invalid object literal.
          {provide: ServiceC, },
        ];

        @${type}({
          ${propName}: PROVIDERS,
        })
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceA/);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceB/);
      expect(tree.readContent('/index.ts')).toMatch(/ServiceB {}\s+export class ServiceC/);
      expect(tree.readContent('/index.ts'))
          .toContain(`{ ${type}, Injectable } from '@angular/core`);
      expect(tree.readContent('/index.ts'))
          .toContain(`{ provide: ServiceC, useValue: undefined },`);
    });

    it('should migrate providers created through static analyzable function call', async () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';

        export class ServiceA {}
        export class ServiceB {}
        export class ServiceC {}

        export function createProviders(x: any, b: any) {
          return [ServiceA, x, b]
        }

        @${type}({
          ${propName}: createProviders(ServiceB, {provide: ServiceC}),
        })
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceA/);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceB/);
      expect(tree.readContent('/index.ts')).toMatch(/ServiceB {}\s+export class ServiceC/);
      expect(tree.readContent('/index.ts'))
          .toContain(`{ ${type}, Injectable } from '@angular/core`);
      expect(tree.readContent('/index.ts'))
          .toContain(`ServiceB, { provide: ServiceC, useValue: undefined }),`);
    });

    it('should migrate providers which are computed through spread operator', async () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';

        export class ServiceA {}
        export class ServiceB {}
        export class ServiceC {}

        const otherServices = [ServiceB, {provide: ServiceC}];

        @${type}({
          ${propName}: [ServiceA, ...otherServices],
        })
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceA/);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceB/);
      expect(tree.readContent('/index.ts')).toMatch(/ServiceB {}\s+export class ServiceC/);
      expect(tree.readContent('/index.ts'))
          .toContain(`{ ${type}, Injectable } from '@angular/core`);
      expect(tree.readContent('/index.ts'))
          .toContain(`ServiceB, { provide: ServiceC, useValue: undefined }];`);
    });

    it(`should migrate provider once if referenced in multiple ${type} definitions`, async () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';

        export class ServiceA {}

        @${type}({${propName}: [ServiceA]})
        export class TestClassA {}
      `);

      writeFile('/second.ts', `
        import {${type}} from '@angular/core';
        import {ServiceA} from './index';

        export class ServiceB {}

        @${type}({${propName}: [ServiceA, ServiceB]})
        export class TestClassB {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts'))
          .toMatch(/@angular\/core';\s+@Injectable\(\)\s+export class ServiceA/);
      expect(tree.readContent('/index.ts'))
          .toContain(`{ ${type}, Injectable } from '@angular/core`);
      expect(tree.readContent('/second.ts')).toMatch(/@Injectable\(\)\s+export class ServiceB/);
      expect(tree.readContent('/second.ts'))
          .toContain(`{ ${type}, Injectable } from '@angular/core`);
    });

    it(`should only migrate empty object provider literal once if referenced multiple times ` +
           `in ${type} definitions`,
       async () => {
         writeFile('/provider.ts', `
        export class MyService {}

        export const PROVIDER = {provide: MyService};
      `);

         writeFile('/index.ts', `
        import {${type}} from '@angular/core';
        import {PROVIDER} from './provider';

        @${type}({${propName}: [PROVIDER]})
        export class TestClassA {}
      `);

         writeFile('/second.ts', `
        import {${type}} from '@angular/core';
        import {PROVIDER} from './provider';

        export class ServiceB {}

        @${type}({${propName}: [PROVIDER, ServiceB]})
        export class TestClassB {}
      `);

         await runMigration();

         expect(warnOutput.length).toBe(0);
         expect(tree.readContent('/provider.ts')).toMatch(/^\s+export class MyService {}/);
         expect(tree.readContent('/provider.ts'))
             .toContain(`const PROVIDER = { provide: MyService, useValue: undefined };`);
       });

    it('should create new import for @Injectable when migrating provider', async () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';
        import {MyService, MySecondService} from './service';

        @${type}({${propName}: [MyService, MySecondService]})
        export class TestClass {}
      `);

      writeFile('/service.ts', `export class MyService {}

        export class MySecondService {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/service.ts')).toMatch(/@Injectable\(\)\s+export class MyService/);
      expect(tree.readContent('/service.ts'))
          .toMatch(/@Injectable\(\)\s+export class MySecondService/);
      expect(tree.readContent('/service.ts'))
          .toMatch(/import { Injectable } from "@angular\/core";/);
    });

    it('should re-use existing namespace import for importing @Injectable when migrating provider',
       async () => {
         writeFile('/index.ts', `
          import * as core from '@angular/core';

          export class MyService {
            constructor() {
              console.log(core.isDevMode());
            }
          }
        `);

         writeFile('/app.module.ts', `
          import {${type}} from '@angular/core';
          import {MyService} from './index';

          @${type}({${propName}: [MyService]})
          export class TestClass {}
        `);

         await runMigration();

         expect(warnOutput.length).toBe(0);
         expect(tree.readContent('/index.ts'))
             .toMatch(/@core.Injectable\(\)\s+export class MyService/);
       });

    it('should warn if a referenced individual provider could not be resolved', async () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';

        @${type}({${propName}: [NotPresent]})
        export class TestClass {}
      `);

      await runMigration();

      const providerSourceTextColumn = 15 + type.length + propName.length;
      expect(warnOutput.length).toBe(1);
      expect(warnOutput[0]).toMatch(/\s+index\.ts@4:.+Provider is not statically analyzable./);
      expect(warnOutput[0]).toContain(`4:${providerSourceTextColumn}:`);
    });

    it(`should warn if ${propName} value could not be resolved`, async () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';

        @${type}({${propName}: NOT_ANALYZABLE)
        export class TestClass {}
      `);

      await runMigration();

      const propValueSourceTextColumn = 14 + type.length + propName.length;
      expect(warnOutput.length).toBe(1);
      expect(warnOutput[0]).toMatch(/\s+index\.ts@4:.+Providers.*not statically analyzable./);
      expect(warnOutput[0]).toContain(`4:${propValueSourceTextColumn}:`);
    });

    it(`should not throw if an empty @${type} is analyzed`, async () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';

        @${type}()
        export class MyModule {}
      `);

      try {
        await runMigration();
      } catch (e) {
        fail(e);
      }

      expect(warnOutput.length).toBe(0);
    });

    it('should create new import for injectable after full end of last import statement',
       async () => {
         writeFile('/index.ts', `
          import {${type}} from '@angular/core';
          import {MyService} from './service';

          @${type}({${propName}: [MyService]})
          export class TestClass {}
        `);

         writeFile('/service.ts', `
          import * as a from 'a';
          import * as a from 'b'; // some comment

          export class MyService {}
        `);

         await runMigration();

         expect(warnOutput.length).toBe(0);
         expect(tree.readContent('/service.ts'))
             .toMatch(/@Injectable\(\)\s+export class MyService/);
         expect(tree.readContent('/service.ts'))
             .toMatch(/'b'; \/\/ some comment\s+import { Injectable } from "@angular\/core";/);
       });

    it('should create new import at source file start with trailing new-line', async () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';
        import {MyService} from './service';

        @${type}({${propName}: [MyService]})
        export class TestClass {}
      `);

      writeFile('/service.ts', `/* @license */
        export class MyService {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/service.ts'))
          .toMatch(
              /^import { Injectable } from "@angular\/core";\s+\/\* @license \*\/\s+@Injectable\(\)\s+export class MyService/);
    });

    it('should remove @Inject decorator for providers which are migrated', async () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';
        import {MyService} from './service';

        @${type}({${propName}: [MyService]})
        export class TestClass {}
      `);

      writeFile('/service.ts', `
        import {Inject} from '@angular/core';

        @Inject()
        export class MyService {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/service.ts'))
          .toMatch(/core';\s+@Injectable\(\)\s+export class MyService/);
      // "inject" import will be preserved. We don't want to bother with detecting
      // if the import is unused or not. We leave this up to the developers.
      expect(tree.readContent('/service.ts'))
          .toMatch(/import { Inject, Injectable } from '@angular\/core';/);
    });

    it('should not migrate provider classes in library type definitions', async () => {
      writeFile('/node_modules/my-lib/index.d.ts', `
        export declare class MyService {}
      `);

      writeFile('/index.ts', `
        import {MyService} from 'my-lib';
        import {Pipe, ${type}} from '@angular/core';

        @${type}({${propName}: [MyService]})
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/node_modules/my-lib/index.d.ts')).not.toContain('@Injectable');
    });
  }
});
