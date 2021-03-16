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
import {dedent} from './helpers';

describe('Undecorated classes with DI migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;
  let warnOutput: string[];
  let errorOutput: string[];
  let infoOutput: string[];

  beforeEach(() => {
    runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFakeAngular();
    writeFile('/tsconfig.json', JSON.stringify({
      compilerOptions: {
        lib: ['es2015'],
      },
    }));
    writeFile('/angular.json', JSON.stringify({
      projects: {t: {architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));

    warnOutput = [];
    errorOutput = [];
    infoOutput = [];
    runner.logger.subscribe(logEntry => {
      if (logEntry.level === 'warn') {
        warnOutput.push(logEntry.message);
      } else if (logEntry.level === 'error') {
        errorOutput.push(logEntry.message);
      } else if (logEntry.level === 'info') {
        infoOutput.push(logEntry.message);
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

  function runMigration() {
    return runner.runSchematicAsync('migration-v9-undecorated-classes-with-di', {}, tree)
        .toPromise();
  }

  function writeFakeAngular() {
    writeFile('/node_modules/@angular/core/index.d.ts', `
      export declare class PipeTransform {}
      export declare class NgZone {}
      export declare enum ViewEncapsulation {
        None = 2
      }
    `);
  }

  it('should print a failure message base class is declared through type definition', async () => {
    writeFile('/node_modules/my-lib/package.json', JSON.stringify({
      version: '0.0.0',
      main: './index.js',
      typings: './index.d.ts',
    }));
    writeFile('/node_modules/my-lib/index.d.ts', `
      import {NgZone} from '@angular/core';

      export declare class SuperBaseClass {
        constructor(zone: NgZone);
      }
    `);

    writeFile('/index.ts', `
      import {Component, NgModule} from '@angular/core';
      import {SuperBaseClass} from 'my-lib';

      export class BaseClass extends SuperBaseClass {}

      @Component({template: ''})
      export class MyComponent extends BaseClass {}

      @NgModule({declarations: [MyComponent]})
      export class MyModule {}
    `);

    await runMigration();

    expect(errorOutput.length).toBe(0);
    expect(warnOutput.length).toBe(1);
    expect(warnOutput[0]).toMatch(/Class needs to declare an explicit constructor./);
    expect(infoOutput.join(' '))
        .toContain(
            'Could not migrate all undecorated classes that use ' +
            'dependency injection. Please manually fix the following failures');
  });

  it('should add @Directive() decorator to extended base class', async () => {
    writeFile('/index.ts', `
      import {Component, NgModule, NgZone} from '@angular/core';

      export class BaseClass {
        constructor(zone: NgZone) {}
      }

      export class BaseClass2 {
        constructor(zone: NgZone) {}
      }

      @Component({template: ''})
      export class MyComponent extends BaseClass {}

      @Component({template: ''})
      export class MyComponent2 extends BaseClass2 {}

      @NgModule({declarations: [MyComponent, MyComponent2]})
      export class AppModule {}
    `);

    await runMigration();

    expect(tree.readContent('/index.ts')).toMatch(/@Directive\(\)\nexport class BaseClass {/);
    expect(tree.readContent('/index.ts')).toMatch(/@Directive\(\)\nexport class BaseClass2 {/);
  });

  it('not decorated base class multiple times if extended multiple times', async () => {
    writeFile('/index.ts', dedent`
      import {Component, NgModule, NgZone} from '@angular/core';

      export class BaseClass {
        constructor(zone: NgZone) {}
      }

      @Component({template: ''})
      export class MyComponent extends BaseClass {}

      @Component({template: ''})
      export class MyComponent2 extends BaseClass {}

      @NgModule({declarations: [MyComponent, MyComponent2]})
      export class AppModule {}
    `);

    await runMigration();

    expect(tree.readContent('/index.ts')).toContain(dedent`

      @Directive()
      export class BaseClass {
        constructor(zone: NgZone) {}
      }`);
  });

  it('should add @Injectable() decorator to extended base class', async () => {
    writeFile('/index.ts', `
      import {Injectable, NgModule, NgZone} from '@angular/core';

      export class BaseClass {
        constructor(zone: NgZone) {}
      }

      @Injectable({template: ''})
      export class MyService extends BaseClass {}

      @NgModule({providers: [MyService]})
      export class AppModule {}
    `);

    await runMigration();

    expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\nexport class BaseClass {/);
  });

  it('should not decorate base class for decorated pipe', async () => {
    writeFile('/index.ts', dedent`
      import {Component, NgModule, Pipe, PipeTransform} from '@angular/core';

      @Pipe({name: 'test'})
      export class MyPipe extends PipeTransform {}

      @NgModule({declarations: [MyPipe]})
      export class AppModule {}
    `);

    await runMigration();

    expect(errorOutput.length).toBe(0);
    expect(warnOutput.length).toBe(0);

    expect(tree.readContent('/index.ts')).toContain(dedent`
      @Pipe({name: 'test'})
      export class MyPipe extends PipeTransform {}`);
  });

  it('should not decorate base class if no constructor is inherited', async () => {
    writeFile('/index.ts', dedent`
      import {Component, NgModule, Directive} from '@angular/core';

      export class BaseClassWithoutCtor {
        someUnrelatedProp = true;
      }

      @Directive({selector: 'my-dir'})
      export class MyDirective extends BaseClassWithoutCtor {}

      @Pipe()
      export class MyPipe extends BaseClassWithoutCtor {}

      @NgModule({declarations: [MyDirective, MyPipe]})
      export class AppModule {}
    `);

    await runMigration();

    expect(tree.readContent('/index.ts')).toContain(dedent`

      export class BaseClassWithoutCtor {
        someUnrelatedProp = true;
      }

      @Directive({selector: 'my-dir'})
      export class MyDirective extends BaseClassWithoutCtor {}

      @Pipe()
      export class MyPipe extends BaseClassWithoutCtor {}`);
  });

  it('should not decorate base class if directive/component/provider defines a constructor',
     async () => {
       writeFile('/index.ts', dedent`
      import {Component, Injectable, NgModule, NgZone} from '@angular/core';

      export class BaseClass {
        constructor(zone: NgZone) {}
      }

      export class BaseClass {
        constructor(zone: NgZone) {}
      }

      @Component({template: ''})
      export class MyComponent extends BaseClass {
        constructor(zone: NgZone) {
          super(zone);
        }
      }

      @Injectable()
      export class MyService extends BaseClass {
        constructor(zone: NgZone) {
          super(zone);
        }
      }

      @NgModule({declarations: [MyComponent], providers: [MyService]})
      export class AppModule {}
    `);

       await runMigration();

       expect(tree.readContent('/index.ts')).toContain(dedent`

      export class BaseClass {
        constructor(zone: NgZone) {}
      }`);
     });

  it('should not decorate base class if it already has decorator', async () => {
    writeFile('/index.ts', dedent`
      import {Component, Directive, NgModule, NgZone} from '@angular/core';

      @Directive({selector: 'base-class'})
      export class BaseClass {
        constructor(zone: NgZone) {}
      }

      @Component({template: ''})
      export class MyComponent extends BaseClass {}

      @NgModule({declarations: [MyComponent]})
      export class AppModule {}

      @NgModule({declarations: [BaseClass]})
      export class LibModule {}
    `);

    await runMigration();

    expect(tree.readContent('/index.ts')).toContain(dedent`

      @Directive({selector: 'base-class'})
      export class BaseClass {`);
  });

  it('should add a comment if the base class is declared through type definition', async () => {
    writeFile('/node_modules/my-lib/package.json', JSON.stringify({
      version: '0.0.0',
      main: './index.js',
      typings: './index.d.ts',
    }));
    writeFile('/node_modules/my-lib/index.d.ts', `
      import {NgZone} from '@angular/core';

      export declare class SuperBaseClass {
        constructor(zone: NgZone);
      }
    `);

    writeFile('/index.ts', dedent`
      import {Component, Injectable, NgModule} from '@angular/core';
      import {SuperBaseClass} from 'my-lib';

      export class BaseClass extends SuperBaseClass {}

      export class BaseClass2 extends SuperBaseClass {}

      export class PassThroughClass extends BaseClass {}

      // should cause "BaseClass" to get a todo comment.
      @Component({template: ''})
      export class MyComponent extends PassThroughClass {}

      // should cause "BaseClass2" to get a todo comment.
      @Injectable()
      export class MyService extends BaseClass2 {}

      // should cause "BaseClass" to get a todo comment.
      @Component({template: ''})
      export class MyComponent2 extends BaseClass {}

      // should get a todo comment because there are no base classes
      // in between.
      @Component({template: ''})
      export class MyComponent3 extends SuperBaseClass {}

      @NgModule({declarations: [MyComponent, MyComponent2, MyComponent3], providers: [MyService]})
      export class MyModule {}
    `);

    await runMigration();

    expect(tree.readContent('/index.ts')).toContain(dedent`
      @Directive()
      export class BaseClass extends SuperBaseClass {
        // TODO: add explicit constructor
      }`);

    expect(tree.readContent('/index.ts')).toContain(dedent`
      @Injectable()
      export class BaseClass2 extends SuperBaseClass {
        // TODO: add explicit constructor
      }`);

    expect(tree.readContent('/index.ts')).toContain(dedent`
      @Directive()
      export class PassThroughClass extends BaseClass {}`);

    expect(tree.readContent('/index.ts')).toContain(dedent`
      @Component({template: ''})
      export class MyComponent extends PassThroughClass {}`);

    expect(tree.readContent('/index.ts')).toContain(dedent`
      @Component({template: ''})
      export class MyComponent3 extends SuperBaseClass {
        // TODO: add explicit constructor
      }`);

    expect(tree.readContent('/index.ts')).toContain(dedent`
      @Injectable()
      export class MyService extends BaseClass2 {}`);
  });

  it('should not add a comment if the base class is declared through type definition but is' +
         'decorated',
     async () => {
       writeFakeLibrary();
       writeFile('/index.ts', dedent`
        import {Component, NgModule} from '@angular/core';
        import {BaseComponent} from 'my-lib';

        @Component({template: ''})
        export class MyComponent extends BaseComponent {}

        @NgModule({declarations: [MyComponent]})
        export class MyModule {}
      `);

       await runMigration();

       expect(tree.readContent('/index.ts')).toContain(dedent`
        @Component({template: ''})
        export class MyComponent extends BaseComponent {}`);
     });

  it('should not decorate base class in typings if it misses an explicit constructor', async () => {
    writeFakeLibrary();
    writeFile('/index.ts', dedent`
        import {Component, NgModule} from '@angular/core';
        import {BaseDirective} from 'my-lib';

        @Component({template: ''})
        export class MyComponent extends BaseDirective {}

        @NgModule({declarations: [MyComponent]})
        export class MyModule {}
      `);

    await runMigration();

    expect(tree.readContent('/index.ts')).toContain(dedent`
        @Component({template: ''})
        export class MyComponent extends BaseDirective {}`);
    expect(tree.readContent('/node_modules/my-lib/public-api.d.ts')).not.toContain('@Directive');
  });

  it('should detect decorated classes by respecting summary files', async () => {
    writeSummaryOnlyThirdPartyLibrary();

    writeFile('/index.ts', dedent`
        import {Component, NgModule} from '@angular/core';
        import {BaseComponent} from 'my-lib';

        @Component({template: ''})
        export class MyComponent extends BaseComponent {}

        @NgModule({declarations: [MyComponent]})
        export class MyModule {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(0);
    expect(errorOutput.length).toBe(0);
    expect(tree.readContent('/index.ts')).toContain(dedent`
        @Component({template: ''})
        export class MyComponent extends BaseComponent {}`);
  });

  it('should decorate all undecorated directives of inheritance chain', async () => {
    writeFile('/index.ts', `
      import {Component, NgModule, NgZone} from '@angular/core';

      export class SuperBaseClass {
        constructor(zone: NgZone) {}
      }

      export class BaseClass extends SuperBaseClass {}

      @Component({template: ''})
      export class MyComponent extends BaseClass {}

      @NgModule({declarations: [MyComponent]})
      export class MyModule {}
    `);

    await runMigration();

    expect(tree.readContent('/index.ts')).toMatch(/@Directive\(\)\nexport class SuperBaseClass {/);
    expect(tree.readContent('/index.ts'))
        .toMatch(/}\s+@Directive\(\)\nexport class BaseClass extends SuperBaseClass {/);
  });

  it('should decorate all undecorated providers of inheritance chain', async () => {
    writeFile('/index.ts', `
      import {Injectable, NgModule, NgZone} from '@angular/core';

      export class SuperBaseClass {
        constructor(zone: NgZone) {}
      }

      export class BaseClass extends SuperBaseClass {}

      @Injectable()
      export class MyService extends BaseClass {}

      @NgModule({providers: [MyService]})
      export class MyModule {}
    `);

    await runMigration();

    expect(tree.readContent('/index.ts')).toMatch(/@Injectable\(\)\nexport class SuperBaseClass {/);
    expect(tree.readContent('/index.ts'))
        .toMatch(/}\s+@Injectable\(\)\nexport class BaseClass extends SuperBaseClass {/);
  });

  it('should properly update import if @Directive can be accessed through existing namespace import',
     async () => {
       writeFile('/index.ts', `
         import {Component, NgModule, NgZone} from '@angular/core';
         import {BaseClass} from './base';

         @Component({template: ''})
         export class A extends BaseClass {}

         @NgModule({declarations: [A]})
         export class MyModule {}
       `);

       writeFile('/base.ts', `
         import * as core from '@angular/core';

         export class BaseClass {
           constructor(zone: core.NgZone) {}
         }
       `);

       await runMigration();

       expect(tree.readContent('/base.ts')).toMatch(/@core.Directive\(\)\nexport class BaseClass/);
     });

  it('should properly update existing import with aliased specifier if identifier is already used',
     async () => {
       writeFile('/index.ts', `
         import {Component, NgModule, NgZone} from '@angular/core';
         import {Directive} from './third_party_directive';

         export class BaseClass {
           constructor(zone: NgZone) {}
         }

         @Component({template: ''})
         export class MyComponent extends BaseClass {}

         @NgModule({declarations: [MyComponent]})
         export class AppModule {}
       `);

       await runMigration();

       expect(tree.readContent(`/index.ts`))
           .toContain(`{ Component, NgModule, NgZone, Directive as Directive_1 }`);
       expect(tree.readContent('/index.ts')).toMatch(/@Directive_1\(\)\nexport class BaseClass/);
     });

  it('should properly create new import with aliased specifier if identifier is already used',
     async () => {
       writeFile('/index.ts', `
         import {Component, NgModule, NgZone} from '@angular/core';
         import {BaseClass} from './base';

         @Component({template: ''})
         export class A extends BaseClass {}

         @NgModule({declarations: [A]})
         export class MyModule {}
       `);

       writeFile('/base.ts', `
         import {Directive} from './external';

         export class MyService {}

         export class BaseClass {
           constructor(zone: MyService) {}
         }
       `);

       await runMigration();

       expect(tree.readContent('/base.ts')).toMatch(/@Directive_1\(\)\nexport class BaseClass/);
       expect(tree.readContent(`/base.ts`))
           .toContain(`{ Directive as Directive_1 } from "@angular/core";`);
     });

  it('should use existing aliased import of @Directive instead of creating new import',
     async () => {
       writeFile('/index.ts', `
      import {Component, NgModule} from '@angular/core';
      import {BaseClass} from './base';

      @Component({template: ''})
      export class A extends BaseClass {}

      @NgModule({declarations: [A]})
      export class MyModule {}
    `);

       writeFile('/base.ts', `
      import {Directive as AliasedDir, NgZone} from '@angular/core';

      export class BaseClass {
        constructor(zone: NgZone) {}
      }
    `);

       await runMigration();

       expect(tree.readContent('/base.ts')).toMatch(/@AliasedDir\(\)\nexport class BaseClass {/);
     });

  describe('decorator copying', async () => {
    it('should be able to copy the "templateUrl" field', async () => {
      writeFile('/index.ts', dedent`
        import {NgModule} from '@angular/core';
        import {BaseClass} from './lib/base';

        export class MyDir extends BaseClass {}

        @NgModule({declarations: [MyDir]})
        export class MyModule {}
      `);

      writeFile('/lib/base.ts', dedent`
        import {Directive, NgModule} from '@angular/core';

        @Directive({
          selector: 'my-dir',
          templateUrl: './my-dir.html',
        })
        export class BaseClass {}

        @NgModule({declarations: [BaseClass]})
        export class LibModule {}
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`import { NgModule, Directive } from '@angular/core';`);
      expect(tree.readContent('/index.ts')).toContain(dedent`
        @Directive({
            selector: 'my-dir',
            templateUrl: './my-dir.html'
        })
        export class MyDir extends BaseClass {}`);
    });

    it('should be able to copy the "styleUrls" field', async () => {
      writeFile('/index.ts', dedent`
        import {NgModule} from '@angular/core';
        import {BaseClass} from './lib/base';

        export class MyDir extends BaseClass {}

        @NgModule({declarations: [MyDir]})
        export class MyModule {}
      `);

      writeFile('/lib/base.ts', dedent`
        import {Directive, NgModule} from '@angular/core';

        /** my comment */
        @Directive({
          selector: 'my-dir',
          styleUrls: ['./my-dir.css'],
        })
        export class BaseClass {}

        @NgModule({declarations: [BaseClass]})
        export class LibModule {}
      `);

      await runMigration();

      expect(tree.readContent('/index.ts')).toContain(dedent`
        import {BaseClass} from './lib/base';

        @Directive({
            selector: 'my-dir',
            styleUrls: ['./my-dir.css']
        })
        export class MyDir extends BaseClass {}`);
    });

    it('should be able to copy @Pipe decorator', async () => {
      writeFile('/index.ts', dedent`
        import {NgModule} from '@angular/core';
        import {BasePipe} from './lib/base';

        export class MyPipe extends BasePipe {}

        @NgModule({declarations: [MyPipe]})
        export class MyModule {}
      `);

      writeFile('/lib/base.ts', dedent`
        import {Pipe, NgModule} from '@angular/core';

        @Pipe({name: 'my-pipe-name'})
        export class BasePipe {}

        @NgModule({declarations: [BasePipe]})
        export class LibModule {}
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`import { NgModule, Pipe } from '@angular/core';`);
      expect(tree.readContent('/index.ts')).toContain(dedent`
        @Pipe({ name: 'my-pipe-name' })
        export class MyPipe extends BasePipe {}`);
    });

    it('should be able to copy decorator in same source file', async () => {
      writeFile(
          '/node_modules/@angular/cdk/table/index.d.ts',
          `export declare const CDK_TABLE_TEMPLATE = '';`);
      writeFile('/index.ts', dedent`
        import {NgModule, Component} from '@angular/core';
        import {CDK_TABLE_TEMPLATE} from '@angular/cdk/table';

        const A = 'hello';

        @Component({
          selector: 'my-dir',
          template: CDK_TABLE_TEMPLATE,
          styles: [A],
        })
        export class BaseClass {}

        export class MyDir extends BaseClass {}

        @NgModule({declarations: [BaseClass]})
        export class LibModule {}

        @NgModule({declarations: [MyDir]})
        export class MyModule {}
      `);

      await runMigration();

      expect(tree.readContent('/index.ts')).toContain(dedent`
        @Component({
            selector: 'my-dir',
            template: CDK_TABLE_TEMPLATE,
            styles: [A],
        })
        export class MyDir extends BaseClass {}`);
    });

    it('should be able to create new imports for copied identifier references', async () => {
      writeFile('/index.ts', dedent`
        import {NgModule} from '@angular/core';
        import {BaseClass} from './lib/base';

        export class MyDir extends BaseClass {}

        @NgModule({declarations: [[MyDir]]})
        export class MyModule {}
      `);

      writeFile(
          '/node_modules/@angular/cdk/table/index.d.ts',
          `export declare const CDK_TABLE_TEMPLATE = '';`);
      writeFile('/styles.ts', `export const STYLE_THROUGH_VAR = 'external';`);
      writeFile('/lib/base.ts', dedent`
        import {Component, NgModule} from '@angular/core';
        import {CDK_TABLE_TEMPLATE as tableTmpl} from '@angular/cdk/table';
        import {STYLE_THROUGH_VAR} from '../styles';

        export const LOCAL_STYLE = 'local_style';

        @Component({
          selector: 'my-dir',
          template: tableTmpl,
          styles: [STYLE_THROUGH_VAR, LOCAL_STYLE]
        })
        export class BaseClass {}

        @NgModule({declarations: [BaseClass]})
        export class LibModule {}
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`import { CDK_TABLE_TEMPLATE } from "@angular/cdk/table";`);
      expect(tree.readContent('/index.ts'))
          .toContain(`import { STYLE_THROUGH_VAR } from "./styles";`);
      expect(tree.readContent('/index.ts'))
          .toContain(`import { BaseClass, LOCAL_STYLE } from './lib/base';`);
      expect(tree.readContent('/index.ts')).toContain(dedent`
        @Component({
            selector: 'my-dir',
            template: CDK_TABLE_TEMPLATE,
            styles: [STYLE_THROUGH_VAR, LOCAL_STYLE]
        })
        export class MyDir extends BaseClass {}`);
    });

    it('should copy decorator once if directive is referenced multiple times', async () => {
      writeFile('/index.ts', dedent`
        import {NgModule} from '@angular/core';
        import {BaseClass} from './lib/base';

        export class MyComp extends BaseClass {}

        @NgModule({entryComponents: [MyComp]})
        export class MyModule {}
      `);

      writeFile('/second-module.ts', dedent`
        import {NgModule, Directive} from '@angular/core';
        import {MyComp} from './index';

        @Directive({selector: 'other-dir'})
        export class OtherDir {}

        @NgModule({declarations: [OtherDir, [MyComp]], entryComponents: [MyComp]})
        export class MySecondModule {}
      `);

      writeFile('/lib/base.ts', dedent`
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'my-dir',
          template: '',
        })
        export class BaseClass {}

        @NgModule({declarations: [BaseClass]})
        export class LibModule {}
      `);

      await runMigration();

      expect(tree.readContent('/index.ts')).toContain(dedent`
        import {BaseClass} from './lib/base';

        @Component({
            selector: 'my-dir',
            template: ''
        })
        export class MyComp extends BaseClass {}`);
    });

    it('should create aliased imports to avoid collisions for referenced identifiers', async () => {
      writeFile('/index.ts', dedent`
        import {NgModule} from '@angular/core';
        import {BaseClass} from './lib/base';

        // this will conflict if "MY_TEMPLATE" from the base class is imported. The
        // import to that export from base class should be aliased to avoid the collision.
        const MY_TEMPLATE = '';

        export class MyComp extends BaseClass {}

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

      writeFile('/lib/base.ts', dedent`
        import {Component, NgModule} from '@angular/core';

        export const MY_TEMPLATE = '';

        @Component({
          selector: 'my-dir',
          template: MY_TEMPLATE,
        })
        export class BaseClass {}

        @NgModule({declarations: [BaseClass]})
        export class LibModule {}
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`import { BaseClass, MY_TEMPLATE as MY_TEMPLATE_1 } from './lib/base';`);
      expect(tree.readContent('/index.ts')).toContain(dedent`
        @Component({
            selector: 'my-dir',
            template: MY_TEMPLATE_1
        })
        export class MyComp extends BaseClass {}`);
    });

    it('should add comment for metadata fields which cannot be copied', async () => {
      writeFile('/index.ts', dedent`
        import {NgModule} from '@angular/core';
        import {BaseClass} from './lib/base';

        export class MyComp extends BaseClass {}

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

      writeFile('/lib/base.ts', dedent`
        import {Component, NgModule, Document} from '@angular/core';

        // this variable cannot be imported automatically.
        const someProviders = [{provide: Document, useValue: null}]

        @Component({
          selector: 'my-dir',
          template: '',
          providers: [...someProviders],
        })
        export class BaseClass {}

        @NgModule({declarations: [BaseClass]})
        export class LibModule {}
      `);

      await runMigration();

      expect(tree.readContent('/index.ts')).toContain(dedent`
        @Component({
            selector: 'my-dir',
            template: '',
            // The following fields were copied from the base class,
            // but could not be updated automatically to work in the
            // new file location. Please add any required imports for
            // the properties below:
            providers: [...someProviders]
        })
        export class MyComp extends BaseClass {}`);
    });

    it('should add comment for metadata fields which are added through spread operator',
       async () => {
         writeFile('/index.ts', dedent`
        import {NgModule} from '@angular/core';
        import {BaseClass} from './lib/base';

        export class MyComp extends BaseClass {}

        @NgModule({declarations: [[MyComp]]})
        export class MyModule {}
      `);

         writeFile('/lib/base.ts', dedent`
        import {Component, NgModule} from '@angular/core';

        export const metadataThroughVar = {
          styleUrls: ['./test.css'],
        }

        @Component({
          selector: 'my-dir',
          template: '',
          ...metadataThroughVar,
        })
        export class BaseClass {}

        @NgModule({declarations: [BaseClass]})
        export class LibModule {}
      `);

         await runMigration();

         expect(tree.readContent('/index.ts')).toContain(dedent`
        @Component({
            selector: 'my-dir',
            template: '',
            // The following fields were copied from the base class,
            // but could not be updated automatically to work in the
            // new file location. Please add any required imports for
            // the properties below:
            ...metadataThroughVar
        })
        export class MyComp extends BaseClass {}`);
       });

    it('should be able to copy fields specified through shorthand assignment', async () => {
      writeFile('/hello.css', '');
      writeFile('/my-tmpl.html', '');
      writeFile('/index.ts', dedent`
        import {NgModule} from '@angular/core';
        import {BaseClass} from './lib/base';

        export class MyComp extends BaseClass {}

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

      writeFile('/lib/hello.css', '');
      writeFile('/lib/my-tmpl.html', '');
      writeFile('/lib/base.ts', dedent`
        import {Component, NgModule} from '@angular/core';

        export const host = {};
        export const templateUrl = './my-tmpl.html';
        const styleUrls = ["hello.css"];

        @Component({
          selector: 'my-dir',
          templateUrl,
          styleUrls,
          host,
        })
        export class BaseClass {}

        @NgModule({declarations: [BaseClass]})
        export class LibModule {}
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`import { BaseClass, templateUrl, host } from './lib/base';`);
      expect(tree.readContent('/index.ts')).toContain(dedent`
        @Component({
            selector: 'my-dir',
            templateUrl,
            host,
            // The following fields were copied from the base class,
            // but could not be updated automatically to work in the
            // new file location. Please add any required imports for
            // the properties below:
            styleUrls
        })
        export class MyComp extends BaseClass {}`);
    });

    it('should serialize metadata from base class without source code', async () => {
      writeFakeLibrary();

      writeFile('/index.ts', dedent`
        import {NgModule} from '@angular/core';
        import {BaseComponent, BasePipe} from 'my-lib';

        export class PassThrough extends BaseComponent {}

        @NgModule({declarations: [PassThrough]})
        export class MyPassThroughMod {}

        export class MyComp extends PassThrough {}

        export class MyPipe extends BasePipe {}

        @NgModule({declarations: [MyComp, MyPipe]})
        export class MyModule {}
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(
              `import { NgModule, ChangeDetectionStrategy, ViewEncapsulation, NG_VALIDATORS, Component, Pipe } from '@angular/core';`);
      expect(tree.readContent('/index.ts')).toContain(dedent`
        @Component({
            changeDetection: ChangeDetectionStrategy.Default,
            selector: "comp-selector",
            template: "<span>My Lib Component</span>",
            encapsulation: ViewEncapsulation.None,
            providers: [{
                    provide: NG_VALIDATORS,
                    useExisting: BaseComponent,
                    multi: true
                }],
            host: {
                "[class.is-enabled]": "isEnabled === true"
            }
        })
        export class PassThrough extends BaseComponent {}`);
      expect(tree.readContent('/index.ts')).toContain(dedent`
        @Component({
            changeDetection: ChangeDetectionStrategy.Default,
            selector: "comp-selector",
            template: "<span>My Lib Component</span>",
            encapsulation: ViewEncapsulation.None,
            providers: [{
                    provide: NG_VALIDATORS,
                    useExisting: BaseComponent,
                    multi: true
                }],
            host: {
                "[class.is-enabled]": "isEnabled === true"
            }
        })
        export class MyComp extends PassThrough {}`);
      expect(tree.readContent('/index.ts')).toContain(dedent`
        @Pipe({
            pure: true,
            name: "external-pipe-name"
        })
        export class MyPipe extends BasePipe {}`);
    });

    it('should serialize metadata with external references from class without source code', async () => {
      writeFakeLibrary({useImportedTemplate: true});
      writeFile(
          '/node_modules/@angular/cdk/table/index.d.ts',
          `export declare const CDK_TABLE_TEMPLATE = 'Template of CDK Table.';`);
      writeFile('/index.ts', dedent`
        import {NgModule} from '@angular/core';
        import {BaseComponent} from 'my-lib';

        export class MyComp extends BaseComponent {}

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(
              `import { NgModule, ChangeDetectionStrategy, ViewEncapsulation, NG_VALIDATORS, Component } from '@angular/core';`);
      expect(tree.readContent('/index.ts')).toContain(dedent`
        @Component({
            changeDetection: ChangeDetectionStrategy.Default,
            selector: "comp-selector",
            template: "Template of CDK Table.",
            encapsulation: ViewEncapsulation.None,
            providers: [{
                    provide: NG_VALIDATORS,
                    useExisting: BaseComponent,
                    multi: true
                }],
            host: {
                "[class.is-enabled]": "isEnabled === true"
            }
        })
        export class MyComp extends BaseComponent {}`);
    });

    it('should not throw if metadata from base class without source code is not serializable',
       async () => {
         writeFakeLibrary({insertInvalidReference: true});

         writeFile('/index.ts', dedent`
        import {NgModule} from '@angular/core';
        import {BaseComponent} from 'my-lib';

        export class MyComp extends BaseComponent {}

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

         await runMigration();

         expect(errorOutput.length).toBe(1);
         expect(errorOutput[0]).toMatch(/Could not resolve non-existent/);
       });

    it('should not create imports for identifiers resolving to target source file', async () => {
      writeFile('/index.ts', dedent`
        import {NgModule} from '@angular/core';
        import {BaseClass} from './lib/base';

        export const SHARED_TEMPLATE_URL = '';
        export const LOCAL_NAME = '';

        export class MyDir extends BaseClass {}

        @NgModule({declarations: [MyDir]})
        export class MyModule {}

        export {LOCAL_NAME as PUBLIC_NAME};
      `);

      writeFile('/lib/base.ts', dedent`
        import {Directive, NgModule} from '@angular/core';
        import {SHARED_TEMPLATE_URL, PUBLIC_NAME} from '..';

        @Directive({
          selector: 'my-dir',
          template: SHARED_TEMPLATE_URL,
          styleUrls: [PUBLIC_NAME]
        })
        export class BaseClass {}

        @NgModule({declarations: [BaseClass]})
        export class LibModule {}
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`import { NgModule, Directive } from '@angular/core';`);
      expect(tree.readContent('/index.ts')).toContain(dedent`
        @Directive({
            selector: 'my-dir',
            template: SHARED_TEMPLATE_URL,
            styleUrls: [LOCAL_NAME]
        })
        export class MyDir extends BaseClass {}`);
    });
  });

  function writeFakeLibrary(options?: {
    insertInvalidReference?: boolean,
    useImportedTemplate?: boolean,
  }) {
    writeFile('/node_modules/my-lib/package.json', JSON.stringify({
      name: 'my-lib',
      version: '0.0.0',
      main: './index.js',
      typings: './index.d.ts',
    }));
    writeFile('/node_modules/my-lib/index.d.ts', `export * from './public-api';`);
    writeFile('/node_modules/my-lib/public-api.d.ts', `
      import {NgZone} from '@angular/core';

      export const testValidators: any;
      export declare class BasePipe {}
      export declare class BaseDirective {}
      export declare class BaseComponent {
        constructor(zone: NgZone);
      }
    `);
    writeFile('/node_modules/my-lib/index.metadata.json', JSON.stringify({
      __symbolic: 'module',
      version: 4,
      metadata: {
        MyLibModule: {
          __symbolic: 'class',
          decorators: [{
            __symbolic: 'call',
            expression: {
              __symbolic: 'reference',
              module: '@angular/core',
              name: 'NgModule',
            },
            arguments: [{
              declarations: [
                {__symbolic: 'reference', name: 'BaseComponent'},
                {__symbolic: 'reference', name: 'BasePipe'}
              ]
            }],
          }],
        },
        BasePipe: {
          __symbolic: 'class',
          decorators: [{
            __symbolic: 'call',
            expression: {__symbolic: 'reference', module: '@angular/core', name: 'Pipe'},
            arguments: [{name: 'external-pipe-name'}],
          }]
        },
        testValidators: {
          'provide':
              {'__symbolic': 'reference', 'module': '@angular/core', 'name': 'NG_VALIDATORS'},
          'useExisting': {'__symbolic': 'reference', 'name': 'BaseComponent'},
          'multi': true
        },
        BaseComponent: {
          __symbolic: 'class',
          decorators: [{
            __symbolic: 'call',
            expression: {
              __symbolic: 'reference',
              module: '@angular/core',
              name: 'Component',
            },
            arguments: [{
              selector: 'comp-selector',
              template: options && options.useImportedTemplate ? {
                __symbolic: 'reference',
                module: '@angular/cdk/table',
                name: 'CDK_TABLE_TEMPLATE',
              } :
                                                                 `<span>My Lib Component</span>`,
              encapsulation: {
                __symbolic: 'select',
                expression: {
                  __symbolic: 'reference',
                  module: options && options.insertInvalidReference ? 'non-existent' :
                                                                      '@angular/core',
                  name: options && options.insertInvalidReference ? 'NonExistent' :
                                                                    'ViewEncapsulation',
                },
                member: 'None'
              },
              providers: [{__symbolic: 'reference', name: 'testValidators'}],
              host: {
                '[class.is-enabled]': 'isEnabled === true',
              }
            }]
          }],
          members: {}
        },
      },
      origins: {
        BaseComponent: './public-api',
      },
      importAs: 'my-lib',
    }));
  }

  function writeSummaryOnlyThirdPartyLibrary() {
    writeFile('/tsconfig.json', JSON.stringify({
      compilerOptions: {
        lib: ['es2015'],
      },
      angularCompilerOptions: {
        generateCodeForLibraries: false,
        allowEmptyCodegenFiles: true,
        enableSummariesForJit: true,
      }
    }));

    writeFile('/node_modules/my-lib/package.json', JSON.stringify({
      name: 'my-lib',
      version: '0.0.0',
      main: './index.js',
      typings: './index.d.ts',
    }));
    writeFile('/node_modules/my-lib/index.d.ts', `export * from './public-api';`);
    writeFile('/node_modules/my-lib/public-api.d.ts', `
      import {NgZone} from '@angular/core';

      export declare class BaseComponent {
        constructor(zone: NgZone);
      }
    `);

    writeFile('/node_modules/my-lib/index.ngsummary.json', JSON.stringify({
      'moduleName': null,
      'summaries': [
        {'symbol': {'__symbol': 0, 'members': []}, 'metadata': {'__symbol': 1, 'members': []}},
      ],
      'symbols': [
        {'__symbol': 0, 'name': 'BaseComponent', 'filePath': './index'},
        {'__symbol': 1, 'name': 'BaseComponent', 'filePath': './public-api'},
      ]
    }));

    writeFile('/node_modules/my-lib/public-api.ngsummary.json', JSON.stringify({
      'moduleName': null,
      'summaries': [{
        'symbol': {'__symbol': 0, 'members': []},
        'metadata': {'__symbolic': 'class', 'members': {}},
        'type': {
          'summaryKind': 1,
          'type': {
            'reference': {'__symbol': 0, 'members': []},
            'diDeps': [{
              'isAttribute': false,
              'isHost': false,
              'isSelf': false,
              'isSkipSelf': false,
              'isOptional': false,
              'token': {'identifier': {'reference': {'__symbol': 4, 'members': []}}}
            }],
            'lifecycleHooks': []
          },
          'isComponent': false,
          'selector': 'button[cdkStepperNext]',
          'exportAs': null,
          'inputs': {'type': 'type'},
          'outputs': {},
          'hostListeners': {'click': '_handleClick()'},
          'hostProperties': {'type': 'type'},
          'hostAttributes': {},
          'providers': [],
          'viewProviders': [],
          'queries': [],
          'guards': {},
          'viewQueries': [],
          'entryComponents': [],
          'changeDetection': null,
          'template': null,
          'componentViewType': null,
          'rendererType': null,
          'componentFactory': null
        }
      }],
      'symbols': [{'__symbol': 0, 'name': 'BaseComponent', 'filePath': './public-api'}]
    }));
  }

  it('should not run for test tsconfig files', async () => {
    writeFile('/src/tsconfig.spec.json', JSON.stringify({
      compilerOptions: {
        lib: ['es2015'],
      },
      files: ['./index.spec.ts']
    }));

    writeFile('/src/index.spec.ts', `
      // This imports "AppComponent" but *not* the actual module. Therefore
      // the module is not part of the TypeScript project and NGC would error
      // since the component is not part of any NgModule. This is way we can't
      // create the Angular compiler program for test tsconfig files.
      import {AppComponent} from './app.component';
    `);

    writeFile('/src/app.component.ts', `
      import {Component} from '@angular/core';

      @Component({template: ''})
      export class AppComponent {}
    `);

    writeFile('/src/app.module.ts', `
      import {NgModule} from '@angular/core';
      import {AppComponent} from './app.component';

      @NgModule({declarations: [AppComponent]})
      export class AppModule {}
    `);

    await runMigration();

    // If the test project would run as part of the migration, there would be
    // error messages because test projects are not guaranteed to always contain
    // all source files. In this test it misses the "AppModule" which means that
    // NGC would fail because the app component is not part of any module.
    expect(warnOutput.length).toBe(0);
    expect(errorOutput.length).toBe(0);
  });

  describe('diagnostics', async () => {
    it('should gracefully exit migration if project fails with structural diagnostic', async () => {
      writeFile('/index.ts', `
        import {Component, NgModule} from '@angular/core';

        @Component({template: ''})
        export class TestComp {}

        @NgModule({declarations: [/* TestComp not added */]})
        export class MyModule {}
    `);

      await runMigration();

      expect(warnOutput.length).toBe(1);
      expect(warnOutput[0])
          .toMatch(
              /ensure there are no AOT compilation errors and rerun the migration. The following project failed: tsconfig\.json/);
      expect(errorOutput.length).toBe(1);
      expect(errorOutput[0]).toMatch(/Cannot determine the module for class TestComp/);
      expect(infoOutput.join(' '))
          .toContain(
              'Some project targets could not be analyzed due to ' +
              'TypeScript program failures');
    });

    it('should gracefully exit migration if project fails with syntactical diagnostic',
       async () => {
         writeFile('/index.ts', `
        import {Component, NgModule} /* missing "from" */ '@angular/core';
      `);

         await runMigration();

         expect(warnOutput.length).toBe(1);
         expect(warnOutput[0])
             .toMatch(/project "tsconfig.json" has syntactical errors which could cause/);
         expect(errorOutput.length).toBe(1);
         expect(errorOutput[0]).toMatch(/error TS1005: 'from' expected/);
         expect(infoOutput.join(' '))
             .toContain(
                 'Some project targets could not be analyzed due to ' +
                 'TypeScript program failures');
       });

    // Regression test for: https://github.com/angular/angular/issues/34985.
    it('should be able to migrate libraries with multiple source files and flat-module ' +
           'options set',
       async () => {
         writeFile('/tsconfig.json', JSON.stringify({
           compilerOptions: {
             lib: ['es2015'],
           },
           angularCompilerOptions:
               {flatModuleId: 'AUTOGENERATED', flatModuleOutFile: 'AUTOGENERATED'}
         }));

         // This file doesn't do anything, but it's necessary in order to hit the code path for
         // the assertion. As of TS 4.2 it needs to have _some_ kind of content, otherwise the
         // compiler will throw an error.
         writeFile('/second.ts', `export const foo = 1;`);
         writeFile('/test.ts', `
        import {Injectable, NgModule, NgZone} from '@angular/core';

        export class BaseClass {
          constructor(zone: NgZone) {}
        }

        @Injectable({template: ''})
        export class MyService extends BaseClass {}

        @NgModule({providers: [MyService]})
        export class AppModule {}
      `);

         await runMigration();

         expect(errorOutput.length).toBe(0);
         expect(warnOutput.length).toBe(0);
         expect(tree.readContent('/test.ts')).toMatch(/@Injectable\(\)\nexport class BaseClass {/);
       });

    it('should not throw if resources could not be read', async () => {
      writeFile('/index.ts', `
        import {Component, NgModule} from '@angular/core';

        @Component({
          templateUrl: './my-template.pug',
          styleUrls: ["./test.scss", "./some-special-file.custom"],
        })
        export class TestComp {}

        @NgModule({declarations: [TestComp]})
        export class MyModule {}
      `);

      writeFile('/test.scss', `@import '~theme.scss';`);

      await runMigration();

      expect(warnOutput.length).toBe(0);
      expect(errorOutput.length).toBe(0);
    });

    it('should not throw if tsconfig references non-existent source file', async () => {
      writeFile('/tsconfig.json', JSON.stringify({
        compilerOptions: {
          lib: ['es2015'],
        },
        files: [
          './non-existent.ts',
        ]
      }));

      let failed = false;
      try {
        await runMigration();
      } catch (e) {
        failed = true;
      }

      expect(failed).toBe(false, 'Expected the migration not to fail.');
      expect(warnOutput.length).toBe(1);
      expect(errorOutput.length).toBe(1);
      expect(warnOutput[0])
          .toContain(
              'TypeScript project "tsconfig.json" has configuration errors. This could cause an ' +
              'incomplete migration. Please fix the following failures and rerun the migration:');
      expect(errorOutput[0]).toMatch(/non-existent\.ts' not found/);
    });
  });
});
