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

describe('Undecorated classes with decorated fields migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;
  let warnings: string[];

  beforeEach(() => {
    runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/tsconfig.json', JSON.stringify({compilerOptions: {lib: ['es2015']}}));
    writeFile('/angular.json', JSON.stringify({
      projects: {t: {architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));

    warnings = [];
    runner.logger.subscribe(entry => {
      if (entry.level === 'warn') {
        warnings.push(entry.message);
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

  it(`should add an import for Directive if there isn't one already`, async () => {
    writeFile('/index.ts', `
      import { Input } from '@angular/core';

      export class Base {
        @Input() isActive: boolean;
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`import { Input, Directive } from '@angular/core';`);
  });

  it('should not change the imports if there is an import for Directive already', async () => {
    writeFile('/index.ts', `
      import { Directive, Input } from '@angular/core';

      export class Base {
        @Input() isActive: boolean;
      }

      @Directive()
      export class Child extends Base {
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`import { Directive, Input } from '@angular/core';`);
  });

  it('should not generate conflicting imports there is a different `Directive` symbol',
     async () => {
       writeFile('/index.ts', `
      import { HostBinding } from '@angular/core';
      
      export class Directive {
        // Simulates a scenario where a library defines a class named "Directive".
        // We don't want to generate a conflicting import.
      }

      export class MyLibrarySharedBaseClass {
        @HostBinding('class.active') isActive: boolean;
      }
    `);

       await runMigration();
       const fileContent = tree.readContent('/index.ts');
       expect(fileContent)
           .toContain(`import { HostBinding, Directive as Directive_1 } from '@angular/core';`);
       expect(fileContent).toMatch(/@Directive_1\(\)\s+export class MyLibrarySharedBaseClass/);
     });

  it('should add @Directive to undecorated classes that have @Input', async () => {
    writeFile('/index.ts', `
      import { Input } from '@angular/core';

      export class Base {
        @Input() isActive: boolean;
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`@Directive()\nexport class Base {`);
  });

  it('should not change decorated classes', async () => {
    writeFile('/index.ts', `
      import { Input, Component, Output, EventEmitter } from '@angular/core';

      @Component({})
      export class Base {
        @Input() isActive: boolean;
      }

      export class Child extends Base {
        @Output() clicked = new EventEmitter<void>();
      }
    `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expect(content).toContain(
        `import { Input, Component, Output, EventEmitter, Directive } from '@angular/core';`);
    expect(content).toContain(`@Component({})\n      export class Base {`);
    expect(content).toContain(`@Directive()\nexport class Child extends Base {`);
  });

  it('should add @Directive to undecorated classes that have @Output', async () => {
    writeFile('/index.ts', `
      import { Output, EventEmitter } from '@angular/core';

      export class Base {
        @Output() clicked = new EventEmitter<void>();
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`@Directive()\nexport class Base {`);
  });

  it('should add @Directive to undecorated classes that have a host binding', async () => {
    writeFile('/index.ts', `
      import { HostBinding } from '@angular/core';

      export class Base {
        @HostBinding('attr.id')
        get id() {
          return 'id-' + Date.now();
        }
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`@Directive()\nexport class Base {`);
  });

  it('should add @Directive to undecorated classes that have a host listener', async () => {
    writeFile('/index.ts', `
      import { HostListener } from '@angular/core';

      export class Base {
        @HostListener('keydown')
        handleKeydown() {
          console.log('Key has been pressed');
        }
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`@Directive()\nexport class Base {`);
  });

  it('should add @Directive to undecorated classes that have a ViewChild query', async () => {
    writeFile('/index.ts', `
      import { ViewChild, ElementRef } from '@angular/core';

      export class Base {
        @ViewChild('button') button: ElementRef<HTMLElement>;
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`@Directive()\nexport class Base {`);
  });

  it('should add @Directive to undecorated classes that have a ViewChildren query', async () => {
    writeFile('/index.ts', `
      import { ViewChildren, ElementRef } from '@angular/core';

      export class Base {
        @ViewChildren('button') button: ElementRef<HTMLElement>;
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`@Directive()\nexport class Base {`);
  });

  it('should add @Directive to undecorated classes that have a ContentChild query', async () => {
    writeFile('/index.ts', `
      import { ContentChild, ElementRef } from '@angular/core';

      export class Base {
        @ContentChild('button') button: ElementRef<HTMLElement>;
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`@Directive()\nexport class Base {`);
  });

  it('should add @Directive to undecorated classes that have a ContentChildren query', async () => {
    writeFile('/index.ts', `
      import { ContentChildren, ElementRef } from '@angular/core';

      export class Base {
        @ContentChildren('button') button: ElementRef<HTMLElement>;
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`@Directive()\nexport class Base {`);
  });

  it('should migrate undecorated class that uses "ngOnChanges" lifecycle hook',
     () => assertLifecycleHookMigrated('ngOnChanges'));
  it('should migrate undecorated class that uses "ngOnInit" lifecycle hook',
     () => assertLifecycleHookMigrated('ngOnInit'));
  it('should migrate undecorated class that uses "ngDoCheck" lifecycle hook',
     () => assertLifecycleHookMigrated('ngDoCheck'));
  it('should migrate undecorated class that uses "ngAfterViewInit" lifecycle hook',
     () => assertLifecycleHookMigrated('ngAfterViewInit'));
  it('should migrate undecorated class that uses "ngAfterViewChecked" lifecycle hook',
     () => assertLifecycleHookMigrated('ngAfterViewChecked'));
  it('should migrate undecorated class that uses "ngAfterContentInit" lifecycle hook',
     () => assertLifecycleHookMigrated('ngAfterContentInit'));
  it('should migrate undecorated class that uses "ngAfterContentChecked" lifecycle hook',
     () => assertLifecycleHookMigrated('ngAfterContentChecked'));

  it(`should report an error and add a TODO for undecorated classes that only define ` +
         `the "ngOnDestroy" lifecycle hook`,
     async () => {
       writeFile('/index.ts', `
      import { Input } from '@angular/core';

      export class SomeClassWithAngularFeatures {
        ngOnDestroy() {
          // noop for testing
        }
      }
    `);

       await runMigration();

       expect(warnings.length).toBe(1);
       expect(warnings[0])
           .toMatch(
               'index.ts@4:7: Class uses Angular features but cannot be migrated automatically. ' +
               'Please add an appropriate Angular decorator.');
       expect(tree.readContent('/index.ts'))
           .toMatch(/TODO: Add Angular decorator\.\nexport class SomeClassWithAngularFeatures {/);
     });

  it('should add @Directive to undecorated derived classes of a migrated class', async () => {
    writeFile('/index.ts', `
      import { Input, Directive, NgModule } from '@angular/core';

      export class Base {
        @Input() isActive: boolean;
      }
      
      export class DerivedA extends Base {}
      export class DerivedB extends DerivedA {}
      export class DerivedC extends DerivedB {}
      
      @Directive({selector: 'my-comp'})
      export class MyComp extends DerivedC {}
      
      export class MyCompWrapped extends MyComp {}
      
      @NgModule({declarations: [MyComp, MyCompWrapped]})
      export class AppModule {} 
    `);

    await runMigration();
    const fileContent = tree.readContent('/index.ts');
    expect(fileContent).toContain(`import { Input, Directive, NgModule } from '@angular/core';`);
    expect(fileContent).toMatch(/@Directive\(\)\s+export class Base/);
    expect(fileContent).toMatch(/@Directive\(\)\s+export class DerivedA/);
    expect(fileContent).toMatch(/@Directive\(\)\s+export class DerivedB/);
    expect(fileContent).toMatch(/@Directive\(\)\s+export class DerivedC/);
    expect(fileContent).toMatch(/}\s+@Directive\(\{selector: 'my-comp'}\)\s+export class MyComp/);
    expect(fileContent).toMatch(/}\s+export class MyCompWrapped/);
  });

  it('should add @Directive to derived undecorated classes of abstract directives', async () => {
    writeFile('/index.ts', `
      import { Input, Directive, NgModule } from '@angular/core';

      @Directive()
      export class Base {
        // ...
      }
      
      export class DerivedA extends Base {}
      export class DerivedB extends DerivedA {}
      export class DerivedC extends DerivedB {}
      
      @Directive({selector: 'my-comp'})
      export class MyComp extends DerivedC {}
      
      export class MyCompWrapped extends MyComp {}
      
      @NgModule({declarations: [MyComp, MyCompWrapped]})
      export class AppModule {} 
    `);

    await runMigration();
    const fileContent = tree.readContent('/index.ts');
    expect(fileContent).toContain(`import { Input, Directive, NgModule } from '@angular/core';`);
    expect(fileContent).toMatch(/core';\s+@Directive\(\)\s+export class Base/);
    expect(fileContent).toMatch(/@Directive\(\)\s+export class DerivedA/);
    expect(fileContent).toMatch(/@Directive\(\)\s+export class DerivedB/);
    expect(fileContent).toMatch(/@Directive\(\)\s+export class DerivedC/);
    expect(fileContent).toMatch(/}\s+@Directive\(\{selector: 'my-comp'}\)\s+export class MyComp/);
    expect(fileContent).toMatch(/}\s+export class MyCompWrapped/);
  });

  it('should not throw if undecorated class extends from unresolved declaration', async () => {
    writeFile('/lib.d.ts', `
      // Fakes the ES5 error default lib types. Since we are in a virtual tree,
      // the default lib types from TypeScript are not available.
      interface ErrorConstructor {}
      declare var Error: ErrorConstructor;
    `);
    writeFile('/index.ts', `
      export class MyCustomErrorClass extends Error {}
    `);

    let error: any = null;
    try {
      await runMigration();
    } catch (e) {
      error = e;
    }

    expect(error).toBe(null);
  });

  async function assertLifecycleHookMigrated(lifecycleHookName: string) {
    writeFile('/index.ts', `
      import { Input } from '@angular/core';

      export class SomeClassWithAngularFeatures {
        ${lifecycleHookName}() {
          // noop for testing
        }
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`@Directive()\nexport class SomeClassWithAngularFeatures {`);
  }

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner
        .runSchematicAsync('migration-v10-undecorated-classes-with-decorated-fields', {}, tree)
        .toPromise();
  }
});
