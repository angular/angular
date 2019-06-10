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
    runner = new SchematicTestRunner('test', require.resolve('./test-migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/tsconfig.json', JSON.stringify({
      compilerOptions: {
        experimentalDecorators: true,
        lib: ['es2015'],
      }
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
    await runner.runSchematicAsync('migration-missing-injectable', {}, tree).toPromise();
  }

  it('should migrate type provider in NgModule', async() => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
    
      export class MyService {}
          
      @NgModule({providers: [MyService]})
      export class MyModule {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(0);
    expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class MyService/);
    expect(tree.readContent('/index.ts')).toMatch(/{ NgModule, Injectable } from '@angular\/core/);
  });

  it('should migrate object literal provider in NgModule', async() => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
    
      export class MyService {}
          
      @NgModule({providers: [{provide: MyService}]})
      export class MyModule {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(0);
    expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class MyService/);
    expect(tree.readContent('/index.ts')).toMatch(/{ NgModule, Injectable } from '@angular\/core/);
  });

  it('should not migrate object literal provider with "useValue" in NgModule', async() => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
    
      export class MyService {}
          
      @NgModule({providers: [{provide: MyService, useValue: null }]})
      export class MyModule {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(0);
    expect(tree.readContent('/index.ts')).not.toContain('@Injectable');
  });

  it('should not migrate object literal provider with "useFactory" in NgModule', async() => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
    
      export class MyService {}
          
      @NgModule({providers: [{provide: MyService, useFactory: () => null }]})
      export class MyModule {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(0);
    expect(tree.readContent('/index.ts')).not.toContain('@Injectable');
  });

  it('should migrate object literal provider with "useExisting" in NgModule', async() => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
    
      export class MyService {}
      export class MyToken {}
          
      @NgModule({providers: [{provide: MyToken, useExisting: MyService}]})
      export class MyModule {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(0);
    expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class MyService/);
    expect(tree.readContent('/index.ts')).toMatch(/MyService {}\s+export class MyToken/);
    expect(tree.readContent('/index.ts')).toMatch(/{ NgModule, Injectable } from '@angular\/core/);
  });

  it('should migrate object literal provider with "useClass" in NgModule', async() => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
    
      export class MyService {}
      export class MyToken {}
          
      @NgModule({providers: [{provide: MyToken, useClass: MyService}]})
      export class MyModule {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(0);
    expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class MyService/);
    expect(tree.readContent('/index.ts')).toMatch(/MyService {}\s+export class MyToken/);
    expect(tree.readContent('/index.ts')).toMatch(/{ NgModule, Injectable } from '@angular\/core/);
  });

  it('should not migrate provider which is already decorated with @Injectable', async() => {
    writeFile('/index.ts', `
      import {Injectable, NgModule} from '@angular/core';
    
      @Injectable()
      export class MyService {}
          
      @NgModule({providers: [MyService]})
      export class MyModule {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(0);
    expect(tree.readContent('/index.ts'))
        .toMatch(/@angular\/core';\s+@Injectable\(\)\s+export class MyService/);
  });

  it('should not migrate provider which is already decorated with @Directive', async() => {
    writeFile('/index.ts', `
      import {Directive, NgModule} from '@angular/core';
    
      @Directive()
      export class MyService {}
          
      @NgModule({providers: [MyService]})
      export class MyModule {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(0);
    expect(tree.readContent('/index.ts')).not.toContain('@Injectable');
  });

  it('should not migrate provider which is already decorated with @Component', async() => {
    writeFile('/index.ts', `
      import {Component, NgModule} from '@angular/core';
    
      @Component()
      export class MyService {}
          
      @NgModule({providers: [MyService]})
      export class MyModule {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(0);
    expect(tree.readContent('/index.ts')).not.toContain('@Injectable');
  });

  it('should not migrate provider which is already decorated with @Pipe', async() => {
    writeFile('/index.ts', `
      import {Pipe, NgModule} from '@angular/core';
    
      @Pipe()
      export class MyService {}
          
      @NgModule({providers: [MyService]})
      export class MyModule {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(0);
    expect(tree.readContent('/index.ts')).not.toContain('@Injectable');
  });

  it('should migrate multiple providers in same NgModule', async() => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
    
      export class ServiceA {}
      export class ServiceB {}
          
      @NgModule({providers: [ServiceA, ServiceB]})
      export class MyModule {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(0);
    expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceA/);
    expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceB/);
    expect(tree.readContent('/index.ts')).toMatch(/{ NgModule, Injectable } from '@angular\/core/);
  });

  it('should migrate multiple mixed providers in same NgModule', async() => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
    
      export class ServiceA {}
      export class ServiceB {}
      export class ServiceC {}
          
      @NgModule({
        providers: [
          ServiceA,
          {provide: ServiceB},
          {provide: SomeToken, useClass: ServiceC},
        ]})
      export class MyModule {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(0);
    expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceA/);
    expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceB/);
    expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceC/);
    expect(tree.readContent('/index.ts')).toMatch(/{ NgModule, Injectable } from '@angular\/core/);
  });


  it('should migrate multiple nested providers in same NgModule', async() => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
    
      export class ServiceA {}
      export class ServiceB {}
      export class ServiceC {}
          
      @NgModule({
        providers: [
          ServiceA,
          [
            {provide: ServiceB},
            ServiceC,
          ],
        ]})
      export class MyModule {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(0);
    expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceA/);
    expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceB/);
    expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceC/);
    expect(tree.readContent('/index.ts')).toMatch(/{ NgModule, Injectable } from '@angular\/core/);
  });

  it('should migrate providers referenced through identifier', async() => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
    
      export class ServiceA {}
      export class ServiceB {}
      
      const PROVIDERS = [ServiceA, ServiceB];
          
      @NgModule({
        providers: PROVIDERS,
      })
      export class MyModule {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(0);
    expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceA/);
    expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceB/);
    expect(tree.readContent('/index.ts')).toMatch(/{ NgModule, Injectable } from '@angular\/core/);
  });

  it('should migrate providers created through static analyzable function call', async() => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
    
      export class ServiceA {}
      export class ServiceB {}
      
      export function createProviders(x: any) {
        return [ServiceA, x]
      }
          
      @NgModule({
        providers: createProviders(ServiceB),
      })
      export class MyModule {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(0);
    expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceA/);
    expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceB/);
    expect(tree.readContent('/index.ts')).toMatch(/{ NgModule, Injectable } from '@angular\/core/);
  });

  it('should migrate providers which are computed through spread operator', async() => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
    
      export class ServiceA {}
      export class ServiceB {}
      
      const otherServices = [ServiceB];
          
      @NgModule({
        providers: [ServiceA, ...otherServices],
      })
      export class MyModule {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(0);
    expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceA/);
    expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\s+export class ServiceB/);
    expect(tree.readContent('/index.ts')).toMatch(/{ NgModule, Injectable } from '@angular\/core/);
  });

  it('should migrate provider once if referenced in multiple NgModule definitions', async() => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
    
      export class ServiceA {}
                
      @NgModule({providers: [ServiceA]})
      export class MyModule {}
    `);

    writeFile('/second.ts', `
      import {NgModule} from '@angular/core';
      import {ServiceA} from './index';
      
      export class ServiceB {}
      
      @NgModule({providers: [ServiceA, ServiceB]})
      export class SecondModule {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(0);
    expect(tree.readContent('/index.ts'))
        .toMatch(/@angular\/core';\s+@Injectable\(\)\s+export class ServiceA/);
    expect(tree.readContent('/index.ts')).toMatch(/{ NgModule, Injectable } from '@angular\/core/);
    expect(tree.readContent('/second.ts')).toMatch(/@Injectable\(\)\s+export class ServiceB/);
    expect(tree.readContent('/second.ts')).toMatch(/{ NgModule, Injectable } from '@angular\/core/);
  });

  it('should create new import for @Injectable when migrating provider', async() => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
      import {MyService, MySecondService} from './service';
                    
      @NgModule({providers: [MyService, MySecondService]})
      export class MyModule {}
    `);

    writeFile('/service.ts', `export class MyService {}
    
      export class MySecondService {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(0);
    expect(tree.readContent('/service.ts')).toMatch(/@Injectable\(\)\s+export class MyService/);
    expect(tree.readContent('/service.ts'))
        .toMatch(/@Injectable\(\)\s+export class MySecondService/);
    expect(tree.readContent('/service.ts')).toMatch(/import { Injectable } from "@angular\/core";/);
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
      import {NgModule} from '@angular/core';
      import {MyService} from './index';
    
      @NgModule({providers: [MyService]})
      export class MyModule {}
    `);

       await runMigration();

       expect(warnOutput.length).toBe(0);
       expect(tree.readContent('/index.ts'))
           .toMatch(/@core.Injectable\(\)\s+export class MyService/);
     });

  it('should warn if a referenced provider could not be resolved', async() => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
      
      @NgModule({providers: [NotPresent]})
      export class MyModule {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(1);
    expect(warnOutput[0]).toMatch(/\s+index\.ts@4:30: Provider is not statically analyzable./);
  });

  it('should warn if the module providers could not be resolved', async() => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
      
      @NgModule({providers: NOT_ANALYZABLE)
      export class MyModule {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(1);
    expect(warnOutput[0])
        .toMatch(/\s+index\.ts@4:29: Providers of module.*not statically analyzable./);
  });

  it('should not throw if an empty @NgModule is analyzed', async() => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
              
      @NgModule()
      export class MyModule {}
    `);

    try {
      await runMigration();
    } catch (e) {
      fail(e);
    }

    expect(warnOutput.length).toBe(0);
  });

  it('should create new import for injectable after full end of last import statement', async() => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
      import {MyService} from './service';
             
      @NgModule({providers: [MyService]})
      export class MyModule {}
    `);

    writeFile('/service.ts', `
      import * as a from 'a';
      import * as a from 'b'; // some comment
    
      export class MyService {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(0);
    expect(tree.readContent('/service.ts')).toMatch(/@Injectable\(\)\s+export class MyService/);
    expect(tree.readContent('/service.ts'))
        .toMatch(/'b'; \/\/ some comment\s+import { Injectable } from "@angular\/core";/);
  });

  it('should create new import at source file start with trailing new-line', async() => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
      import {MyService} from './service';
             
      @NgModule({providers: [MyService]})
      export class MyModule {}
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
      import {NgModule} from '@angular/core';
      import {MyService} from './service';
             
      @NgModule({providers: [MyService]})
      export class MyModule {}
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
    expect(tree.readContent('/service.ts'))
        .toMatch(/import { Inject, Injectable } from '@angular\/core';/);
  });

});
