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

describe('undecorated base class migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  beforeEach(() => {
    runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/tsconfig.json', JSON.stringify({
      compilerOptions: {
        lib: ['es2015'],
      }
    }));
    writeFile('/angular.json', JSON.stringify({
      projects: {t: {architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));

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

  function runMigration() { runner.runSchematic('migration-v8-undecorated-base-class', {}, tree); }

  it('should add base class to NgModule definition in the same file', () => {
    writeFile('/index.ts', `
      import {Component, NgModule, NgZone} from '@angular/core';
      
      export class BaseClass {
        constructor(zone: NgZone) {}
      }
      
      @Component({})
      export class MyComponent extends BaseClass {}
    
      @NgModule({declarations: [MyComponent]})
      export class MyModule {}
    `);

    runMigration();

    expect(tree.readContent(`/index.ts`)).toContain(`{ Component, NgModule, NgZone, Directive }`);
    expect(tree.readContent('/index.ts'))
        .toContain(`@NgModule({declarations: [MyComponent, BaseClass]})`);
  });

  it('should add @Directive() decorator to extended base class', () => {
    writeFile('/index.ts', `
      import {Component, NgModule, NgZone} from '@angular/core';
      
      export class BaseClass {
        constructor(zone: NgZone) {}
      }
      
      export class BaseClass2 {
        constructor(zone: NgZone) {}
      }
      
      @Component({})
      export class MyComponent extends BaseClass {}
    
      @Component({})
      export class MyComponent2 extends BaseClass2 {}
    
      @NgModule({declarations: [MyComponent, MyComponent2]})
      export class MyModule {}
    `);

    runMigration();

    expect(tree.readContent('/index.ts'))
        .toMatch(/@Directive\({ selector: "_base_class_1" }\)\nexport class BaseClass {/);
    expect(tree.readContent('/index.ts'))
        .toMatch(/@Directive\({ selector: "_base_class_2" }\)\nexport class BaseClass2 {/);
  });

  it('should not decorate base class if directive/component defines a constructor', () => {
    writeFile('/index.ts', `
      import {Component, NgModule, NgZone} from '@angular/core';
      
      export class BaseClass {
        constructor(zone: NgZone) {}
      }
      
      @Component({})
      export class MyComponent extends BaseClass {
        constructor(zone: NgZone) {
          super(zone);
        }
      }
    
      @NgModule({declarations: [MyComponent]})
      export class MyModule {}
    `);

    runMigration();

    expect(tree.readContent('/index.ts')).toContain(`@NgModule({declarations: [MyComponent]})`);
    expect(tree.readContent('/index.ts')).not.toContain(`@Directive`);
  });

  it('should only decorate first class of inheritance chain', () => {
    writeFile('/index.ts', `
      import {Component, NgModule, NgZone} from '@angular/core';
      
      export class SuperBaseClass {
        constructor(zone: NgZone) {}
      }
      
      export class BaseClass extends SuperBaseClass {}
      
      @Component({})
      export class MyComponent extends BaseClass {}
    
      @NgModule({declarations: [MyComponent]})
      export class MyModule {}
    `);

    runMigration();

    expect(tree.readContent('/index.ts'))
        .toMatch(/@Directive\({ selector: "_base_class_1" }\)\nexport class SuperBaseClass {/);
    expect(tree.readContent('/index.ts'))
        .toMatch(/}\s+export class BaseClass extends SuperBaseClass {/);
  });

  it('should properly update import if @Directive can be accessed through existing namespace import',
     () => {
       writeFile('/index.ts', `
      import {Component, NgModule, NgZone} from '@angular/core';
      import {BaseClass} from './base';
      
      @Component({})
      export class A extends BaseClass {}
    
      @NgModule({declarations: [A]})
      export class MyModule {}
    `);

       writeFile('/base.ts', `
      import * as core from '@angular/core';
      
      export class BaseClass {
        constructor(zone: NgZone) {}
      }
    `);

       runMigration();

       expect(tree.readContent('/base.ts'))
           .toMatch(/@core.Directive\(.+\)\nexport class BaseClass/);
       expect(tree.readContent('/index.ts')).toContain(`@NgModule({declarations: [A, BaseClass]})`);
     });

  it('should properly create import to unnamed base class', () => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
      import {A} from './comp';

      @NgModule({declarations: [A]})
      export class MyModule {}
    `);

    writeFile('/comp.ts', `
      import {Component} from '@angular/core';
      import baseClass from './base';
      
      @Component({})
      export class A extends baseClass {}
    `);

    writeFile('/base.ts', `        
      export default class {
        constructor(zone: NgZone) {}
      }
    `);

    runMigration();

    expect(tree.readContent('/base.ts')).toMatch(/@Directive\(.+\)\nexport default class/);
    expect(tree.readContent('/index.ts')).toContain('import defaultExport from "./base";');
    expect(tree.readContent('/index.ts'))
        .toContain(`@NgModule({declarations: [A, defaultExport]})`);
  });

  it('should properly create import to class that is exported with alias', () => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
      import {A} from './comp';

      @NgModule({declarations: [A]})
      export class MyModule {}
    `);

    writeFile('/comp.ts', `
      import {Component} from '@angular/core';
      import {BaseClass} from './base';
      
      @Component({})
      export class A extends BaseClass {}
    `);

    writeFile('/base.ts', `        
      class InternalBaseClass {
        constructor(zone: NgZone) {}
      }
      
      export {InternalBaseClass as BaseClass} 
    `);

    runMigration();

    expect(tree.readContent('/base.ts')).toMatch(/@Directive\(.+\)\nclass InternalBaseClass/);
    expect(tree.readContent('/index.ts')).toContain('import { BaseClass } from "./base";');
    expect(tree.readContent('/index.ts')).toContain(`@NgModule({declarations: [A, BaseClass]})`);
  });

  it('should print a warning for base classes which are not exported', () => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
      import {A} from './comp';

      @NgModule({declarations: [A]})
      export class MyModule {}
    `);

    writeFile('/comp.ts', `
      import {Component} from '@angular/core';
      
      // not exported
      class BaseClass {
        constructor(zone: NgZone) {}
      }
      
      @Component({})
      export class A extends BaseClass {}
    `);

    const warnOutput: string[] = [];
    runner.logger.subscribe(e => e.level === 'warn' && warnOutput.push(e.message));

    runMigration();

    expect(warnOutput.length).toBe(1);
    expect(warnOutput[0])
        .toContain(
            'comp.ts@5:7: Base class is not exported and cannot be added to NgModule (index.ts#MyModule)');
    expect(tree.readContent('/comp.ts')).toMatch(/@Directive\(.+\)\nclass BaseClass/);
    expect(tree.readContent('/index.ts')).toContain(`@NgModule({declarations: [A]})`);
  });

  it('should properly update existing import with aliased specifier if identifier is already used',
     () => {
       writeFile('/index.ts', `
      import {Component, NgModule, NgZone} from '@angular/core';
      import {Directive} from './third_party_directive';
      
      export class BaseClass {
        constructor(zone: NgZone) {}
      }
      
      @Component({})
      export class MyComponent extends BaseClass {}
    
      @NgModule({declarations: [MyComponent]})
      export class MyModule {}
    `);

       runMigration();

       expect(tree.readContent(`/index.ts`))
           .toContain(`{ Component, NgModule, NgZone, Directive as Directive_1 }`);
       expect(tree.readContent('/index.ts'))
           .toContain(`@NgModule({declarations: [MyComponent, BaseClass]})`);
       expect(tree.readContent('/index.ts')).toMatch(/@Directive_1\(.+\)\nexport class BaseClass/);
     });

  it('should properly create new import with aliased specifier if identifier is already used',
     () => {
       writeFile('/index.ts', `
      import {Component, NgModule, NgZone} from '@angular/core';
      import {BaseClass} from './base';
      
      @Component({})
      export class A extends BaseClass {}
    
      @NgModule({declarations: [A]})
      export class MyModule {}
    `);

       writeFile('/base.ts', `
      import {Directive} from './external';
    
      export class BaseClass {
        constructor(zone: NgZone) {}
      }
    `);

       runMigration();

       expect(tree.readContent('/base.ts')).toMatch(/@Directive_1\(.+\)\nexport class BaseClass/);
       expect(tree.readContent(`/base.ts`))
           .toContain(`{ Directive as Directive_1 } from "@angular/core";`);
       expect(tree.readContent('/index.ts')).toContain(`@NgModule({declarations: [A, BaseClass]})`);
     });

  it('should use existing aliased import of @Directive instead of creating new import', () => {
    writeFile('/index.ts', `
      import {Component, NgModule} from '@angular/core';
      import {BaseClass} from './base';
      
      @Component({})
      export class A extends BaseClass {}
     
      @NgModule({declarations: [A]})
      export class MyModule {}
    `);

    writeFile('/base.ts', `
      import {Directive as AliasedDir} from '@angular/core';
   
      export class BaseClass {
        constructor(zone: NgZone) {}
      }
    `);

    runMigration();

    expect(tree.readContent('/base.ts')).toMatch(/@AliasedDir\(.+\)\nexport class BaseClass {/);
    expect(tree.readContent('/index.ts')).toContain(`@NgModule({declarations: [A, BaseClass]})`);
  });

  it('should cast abstract base classes to Type<any> when added to NgModule declarations', () => {
    writeFile('/index.ts', `
      import {Component, NgModule} from '@angular/core';
      import {BaseClass} from './base';
      
      @Component({})
      export class A extends BaseClass {}
     
      @NgModule({declarations: [A]})
      export class MyModule {}
    `);

    writeFile('/base.ts', `
      export abstract class BaseClass {
        constructor(zone: NgZone) {}
      }
    `);

    runMigration();

    expect(tree.readContent('/base.ts'))
        .toMatch(/@Directive\(.+\)\nexport abstract class BaseClass {/);
    expect(tree.readContent('/index.ts'))
        .toContain(`{ Component, NgModule, Type } from '@angular/core';`);
    expect(tree.readContent('/index.ts'))
        .toContain(`@NgModule({declarations: [A, (BaseClass as Type<any>)]})`);
  });

  it('should not decorate base class if already decorated with @Component', () => {
    writeFile('/index.ts', `
      import {Component, NgModule} from '@angular/core';
      import {BaseClass} from './base';
      
      @Component({})
      export class A extends BaseClass {}
      
      @NgModule({declarations: [A]})
      export class MyModule {}
    `);

    const baseFileContent = `
      import {Component} from '@angular/core';
      
      @Component({
        selector: 'my-sel'
        template: 'hello',
      })
      export class BaseClass {
        constructor(zone: NgZone) {}
      }
    `;

    writeFile('/base.ts', baseFileContent);

    runMigration();

    expect(tree.readContent('/base.ts')).toBe(baseFileContent);
    expect(tree.readContent('/index.ts')).toContain(`@NgModule({declarations: [A]})`);
  });


  it('should not decorate base class if already decorated with @Directive', () => {
    writeFile('/index.ts', `
      import {Component, NgModule} from '@angular/core';
      import {BaseClass} from './base';
      
      @Component({})
      export class A extends BaseClass {}
      
      @NgModule({declarations: [A]})
      export class MyModule {}
    `);

    const baseFileContent = `
      import {Directive} from '@angular/core';
      
      @Directive({selector: 'my-sel'})
      export class BaseClass {
        constructor(zone: NgZone) {}
      }
    `;

    writeFile('/base.ts', baseFileContent);

    runMigration();

    expect(tree.readContent('/base.ts')).toBe(baseFileContent);
    expect(tree.readContent('/index.ts')).toContain(`@NgModule({declarations: [A]})`);
  });

  it('should not decorate base class multiple times if base class is inherited multiple times', () => {
    writeFile('/index.ts', `
      import {Component, NgModule} from '@angular/core';
      import {BaseClass} from './base';
      
      @Component({})
      export class A extends BaseClass {}
      
      @Component({})
      export class B extends BaseClass {}
     
      @NgModule({declarations: [A, B]})
      export class MyModule {}
    `);

    writeFile('/base.ts', `
      export class BaseClass {
        constructor(zone: NgZone) {}
      }
    `);

    runMigration();

    expect(tree.readContent('/base.ts'))
        .toMatch(
            /^\s+import { Directive } from "@angular\/core";\s+@Directive\(.+\)\nexport class BaseClass {/);
    expect(tree.readContent('/index.ts')).toContain(`{Component, NgModule} from '@angular/core';`);
    expect(tree.readContent('/index.ts')).toContain(`@NgModule({declarations: [A, B, BaseClass]})`);
  });
});
