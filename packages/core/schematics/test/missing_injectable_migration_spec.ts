/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
  });

  afterEach(() => {
    shx.cd(previousWorkingDir);
    shx.rm('-r', tmpDirPath);
  });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  async function runMigration() {
    await runner.runSchematicAsync('migration-v9-missing-injectable', {}, tree).toPromise();
  }

  describe('NgModule', () => createTests('NgModule', 'providers'));
  describe('Directive', () => createTests('Directive', 'providers'));

  describe('Component', () => {
    createTests('Component', 'providers');
    createTests('Component', 'viewProviders');

    it('should migrate all providers defined in "viewProviders" and "providers" in the ' +
           'same component',
       async() => {
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
      type: 'NgModule' | 'Directive' | 'Component', propName: 'providers' | 'viewProviders') {
    it(`should migrate type provider in ${type}`, async() => {
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

    it(`should migrate object literal provider in ${type}`, async() => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';
      
        export class MyService {}
            
        @${type}({${propName}: [{provide: MyService}]})
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class MyService/);
      expect(tree.readContent('/index.ts'))
          .toContain(`{ ${type}, Injectable } from '@angular/core`);
    });

    it(`should not migrate object literal provider with "useValue" in ${type}`, async() => {
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

    it(`should not migrate object literal provider with "useFactory" in ${type}`, async() => {
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

    it(`should migrate object literal provider with "useExisting" in ${type}`, async() => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';
      
        export class MyService {}
        export class MyToken {}
            
        @${type}({${propName}: [{provide: MyToken, useExisting: MyService}]})
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class MyService/);
      expect(tree.readContent('/index.ts')).toMatch(/MyService {}\s+export class MyToken/);
      expect(tree.readContent('/index.ts'))
          .toContain(`{ ${type}, Injectable } from '@angular/core`);
    });

    it(`should migrate object literal provider with "useClass" in ${type}`, async() => {
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

    it('should not migrate provider which is already decorated with @Injectable', async() => {
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

    it('should not migrate provider which is already decorated with @Directive', async() => {
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

    it('should not migrate provider which is already decorated with @Component', async() => {
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

    it('should not migrate provider which is already decorated with @Pipe', async() => {
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

    it(`should migrate multiple providers in same ${type}`, async() => {
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

    it(`should migrate multiple mixed providers in same ${type}`, async() => {
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
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceB/);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceC/);
      expect(tree.readContent('/index.ts'))
          .toContain(`{ ${type}, Injectable } from '@angular/core`);
    });


    it(`should migrate multiple nested providers in same ${type}`, async() => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';
      
        export class ServiceA {}
        export class ServiceB {}
        export class ServiceC {}
            
        @${type}({
          ${propName}: [
            ServiceA,
            [
              {provide: ServiceB},
              ServiceC,
            ],
          ]})
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceA/);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceB/);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceC/);
      expect(tree.readContent('/index.ts'))
          .toContain(`{ ${type}, Injectable } from '@angular/core`);
    });

    it('should migrate providers referenced through identifier', async() => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';
      
        export class ServiceA {}
        export class ServiceB {}
        
        const PROVIDERS = [ServiceA, ServiceB];
            
        @${type}({
          ${propName}: PROVIDERS,
        })
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceA/);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceB/);
      expect(tree.readContent('/index.ts'))
          .toContain(`{ ${type}, Injectable } from '@angular/core`);
    });

    it('should migrate providers created through static analyzable function call', async() => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';
      
        export class ServiceA {}
        export class ServiceB {}
        
        export function createProviders(x: any) {
          return [ServiceA, x]
        }
            
        @${type}({
          ${propName}: createProviders(ServiceB),
        })
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceA/);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceB/);
      expect(tree.readContent('/index.ts'))
          .toContain(`{ ${type}, Injectable } from '@angular/core`);
    });

    it('should migrate providers which are computed through spread operator', async() => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';
      
        export class ServiceA {}
        export class ServiceB {}
        
        const otherServices = [ServiceB];
            
        @${type}({
          ${propName}: [ServiceA, ...otherServices],
        })
        export class TestClass {}
      `);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceA/);
      expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceB/);
      expect(tree.readContent('/index.ts'))
          .toContain(`{ ${type}, Injectable } from '@angular/core`);
    });

    it(`should migrate provider once if referenced in multiple ${type} definitions`, async() => {
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

    it('should create new import for @Injectable when migrating provider', async() => {
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
       async() => {
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

    it('should warn if a referenced individual provider could not be resolved', async() => {
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

    it(`should warn if ${propName} value could not be resolved`, async() => {
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

    it(`should not throw if an empty @${type} is analyzed`, async() => {
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
       async() => {
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

    it('should create new import at source file start with trailing new-line', async() => {
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

    it('should remove @Inject decorator for providers which are migrated', async() => {
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
  }
});
