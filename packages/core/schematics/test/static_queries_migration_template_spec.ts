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

describe('static-queries migration with template strategy', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;
  let warnOutput: string[];
  let errorOutput: string[];

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
    errorOutput = [];
    runner.logger.subscribe(logEntry => {
      if (logEntry.level === 'warn') {
        warnOutput.push(logEntry.message);
      } else if (logEntry.level === 'error') {
        errorOutput.push(logEntry.message);
      }
    });

    previousWorkingDir = shx.pwd();
    tmpDirPath = getSystemPath(host.root);

    // Switch into the temporary directory path. This allows us to run
    // the schematic against our custom unit test tree.
    shx.cd(tmpDirPath);

    writeFakeAngular();
  });

  afterEach(() => {
    shx.cd(previousWorkingDir);
    shx.rm('-r', tmpDirPath);
  });

  function writeFakeAngular() {
    writeFile('/node_modules/@angular/core/index.d.ts', ``);
  }

  function writeFakeLibrary(selectorName = 'my-lib-selector') {
    writeFile('/node_modules/my-lib/index.d.ts', `export * from './public-api';`);
    writeFile('/node_modules/my-lib/public-api.d.ts', `export declare class MyLibComponent {}`);
    writeFile('/node_modules/my-lib/index.metadata.json', JSON.stringify({
      __symbolic: 'module',
      version: 4,
      metadata: {
        MyLibComponent: {
          __symbolic: 'class',
          decorators: [{
            __symbolic: 'call',
            expression: {
              __symbolic: 'reference',
              module: '@angular/core',
              name: 'Component',
              line: 0,
              character: 0
            },
            arguments: [{
              selector: selectorName,
              template: `<span>My Lib Component</span>`,
            }]
          }],
          members: {}
        },
      },
      origins: {
        MyLibComponent: './public-api',
      },
      importAs: 'my-lib',
    }));
  }

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v8-static-queries', {}, tree).toPromise();
  }

  describe('ViewChild', () => {
    it('should detect queries selecting elements through template reference', async () => {
      writeFile('/index.ts', `
        import {Component, NgModule, ViewChild} from '@angular/core';

        @Component({template: \`
          <ng-template>
            <button #myButton>My Button</button>
          </ng-template>
          <div>
            <button #myStaticButton>Button outside ng-template</button>
          </div>
        \`})
        export class MyComp {
          private @ViewChild('myButton') query: any;
          private @ViewChild('myStaticButton') query2: any;
        }

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@ViewChild('myButton', { static: false }) query: any;`);
      expect(tree.readContent('/index.ts'))
          .toContain(`@ViewChild('myStaticButton', { static: true }) query2: any;`);
    });

    it('should detect queries selecting ng-template as static', async () => {
      writeFile('/index.ts', `
        import {Component, NgModule, ViewChild} from '@angular/core';

        @Component({template: \`
          <ng-template #myTmpl>
            My template
          </ng-template>
        \`})
        export class MyComp {
          private @ViewChild('myTmpl') query: any;
        }

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@ViewChild('myTmpl', { static: true }) query: any;`);
    });

    it('should detect queries selecting ng-template as static (BOM)', async () => {
      writeFile('/index.ts', `\uFEFF
        import {Component, NgModule, ViewChild} from '@angular/core';

        @Component({template: \`
          <ng-template #myTmpl>
            My template
          </ng-template>
        \`})
        export class MyComp {
          private @ViewChild('myTmpl') query: any;
        }

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@ViewChild('myTmpl', { static: true }) query: any;`);
    });

    it('should detect queries selecting component view providers through string token',
       async () => {
         writeFile('/index.ts', `
        import {Component, Directive, NgModule, ViewChild} from '@angular/core';

        @Directive({
          selector: '[myDirective]',
          providers: [
            {provide: 'my-token', useValue: 'test'}
          ]
        })
        export class MyDirective {}

        @Directive({
          selector: '[myDirective2]',
          providers: [
            {provide: 'my-token-2', useValue: 'test'}
          ]
        })
        export class MyDirective2 {}

        @Component({templateUrl: './my-tmpl.html'})
        export class MyComp {
          private @ViewChild('my-token') query: any;
          private @ViewChild('my-token-2') query2: any;
        }

        @NgModule({declarations: [MyComp, MyDirective, MyDirective2]})
        export class MyModule {}
      `);

         writeFile(`/my-tmpl.html`, `
        <span myDirective></span>
        <ng-template>
          <span myDirective2></span>
        </ng-template>
      `);

         await runMigration();

         expect(tree.readContent('/index.ts'))
             .toContain(`@ViewChild('my-token', { static: true }) query: any;`);
         expect(tree.readContent('/index.ts'))
             .toContain(`@ViewChild('my-token-2', { static: false }) query2: any;`);
       });

    it('should detect queries selecting component view providers using class token', async () => {
      writeFile('/index.ts', `
        import {Component, Directive, NgModule, ViewChild} from '@angular/core';

        export class MyService {}
        export class MyService2 {}

        @Directive({
          selector: '[myDirective]',
          providers: [MyService]
        })
        export class MyDirective {}

        @Directive({
          selector: '[myDirective2]',
          providers: [MyService2]
        })
        export class MyDirective2 {}

        @Component({templateUrl: './my-tmpl.html'})
        export class MyComp {
          private @ViewChild(MyService) query: any;
          private @ViewChild(MyService2) query2: any;
        }

        @NgModule({declarations: [MyComp, MyDirective, MyDirective2]})
        export class MyModule {}
      `);

      writeFile(`/my-tmpl.html`, `
        <span myDirective></span>
        <ng-template>
          <span myDirective2></span>
        </ng-template>
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@ViewChild(MyService, { static: true }) query: any;`);
      expect(tree.readContent('/index.ts'))
          .toContain(`@ViewChild(MyService2, { static: false }) query2: any;`);
    });

    it('should detect queries selecting component', async () => {
      writeFile('/index.ts', `
        import {Component, NgModule, ViewChild} from '@angular/core';
        import {HomeComponent, HomeComponent2} from './home-comp';

        @Component({
          template: \`
            <home-comp></home-comp>
            <ng-template>
              <home-comp2></home-comp2>
            </ng-template>
          \`
        })
        export class MyComp {
          private @ViewChild(HomeComponent) query: any;
          private @ViewChild(HomeComponent2) query2: any;
        }

        @NgModule({declarations: [MyComp, HomeComponent, HomeComponent2]})
        export class MyModule {}
      `);

      writeFile(`/home-comp.ts`, `
        import {Component} from '@angular/core';

        @Component({
          selector: 'home-comp',
          template: '<span>Home</span>'
        })
        export class HomeComponent {}

        @Component({
          selector: 'home-comp2',
          template: '<span>Home 2</span>'
        })
        export class HomeComponent2 {}
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@ViewChild(HomeComponent, { static: true }) query: any;`);
      expect(tree.readContent('/index.ts'))
          .toContain(`@ViewChild(HomeComponent2, { static: false }) query2: any;`);
    });

    it('should detect queries selecting third-party component', async () => {
      writeFakeLibrary();
      writeFile('/index.ts', `
        import {Component, NgModule, ViewChild} from '@angular/core';
        import {MyLibComponent} from 'my-lib';

        @Component({templateUrl: './my-tmpl.html'})
        export class MyComp {
          private @ViewChild(MyLibComponent) query: any;
        }

        @NgModule({declarations: [MyComp, MyLibComponent]})
        export class MyModule {}
      `);

      writeFile('/my-tmpl.html', `
        <my-lib-selector>My projected content</my-lib-selector>
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@ViewChild(MyLibComponent, { static: true }) query: any;`);
    });

    it('should detect queries selecting third-party component with multiple selectors',
       async () => {
         writeFakeLibrary('a-selector, test-selector');
         writeFile('/index.ts', `
        import {Component, NgModule, ViewChild} from '@angular/core';
        import {MyLibComponent} from 'my-lib';

        @Component({templateUrl: './my-tmpl.html'})
        export class MyComp {
          private @ViewChild(MyLibComponent) query: any;
        }

        @NgModule({declarations: [MyComp, MyLibComponent]})
        export class MyModule {}
      `);

         writeFile('/my-tmpl.html', `
        <a-selector>Match 1</a-selector>
        <ng-template>
          <test-selector>Match 2</test-selector>
        </ng-template>
      `);

         await runMigration();

         expect(tree.readContent('/index.ts'))
             .toContain(`@ViewChild(MyLibComponent, { static: false }) query: any;`);
       });

    it('should detect queries within structural directive', async () => {
      writeFile('/index.ts', `
        import {Component, Directive, NgModule, ViewChild} from '@angular/core';

        @Directive({selector: '[ngIf]'})
        export class FakeNgIf {}

        @Component({templateUrl: 'my-tmpl.html'})
        export class MyComp {
          private @ViewChild('myRef') query: any;
          private @ViewChild('myRef2') query2: any;
        }

        @NgModule({declarations: [MyComp, FakeNgIf]})
        export class MyModule {}
      `);

      writeFile(`/my-tmpl.html`, `
        <span ngIf #myRef>No asterisk</span>
        <span *ngIf #myRef2>With asterisk</span>
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@ViewChild('myRef', { static: true }) query: any;`);
      expect(tree.readContent('/index.ts'))
          .toContain(`@ViewChild('myRef2', { static: false }) query2: any;`);
    });

    it('should detect inherited queries', async () => {
      writeFile('/index.ts', `
        import {Component, NgModule, ViewChild} from '@angular/core';

        export class BaseClass {
          @ViewChild('myRef') query: any;
        }

        @Component({templateUrl: 'my-tmpl.html'})
        export class MyComp extends BaseClass {}

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

      writeFile(`/my-tmpl.html`, `
          <span #myRef>My Ref</span>
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@ViewChild('myRef', { static: true }) query: any;`);
    });

    it('should detect queries declared on setter', async () => {
      writeFile('/index.ts', `
        import {Component, NgModule, ViewChild} from '@angular/core';

        @Component({templateUrl: 'my-tmpl.html'})
        export class MyComp {
          @ViewChild('myRef')
          set query(result: any) { /* noop */}
        }

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

      writeFile(`/my-tmpl.html`, `
        <span #myRef>My Ref</span>
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toMatch(/@ViewChild\('myRef', { static: true }\)\s+set query/);
    });

    it('should detect queries declared on getter', async () => {
      writeFile('/index.ts', `
        import {Component, NgModule, ViewChild} from '@angular/core';

        @Component({templateUrl: 'my-tmpl.html'})
        export class MyComp {
          @ViewChild('myRef')
          get query() { return null; }
          set query(result: any) { /* noop */}
        }

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

      writeFile(`/my-tmpl.html`, `
        <span #myRef>My Ref</span>
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toMatch(/@ViewChild\('myRef', { static: true }\)\s+get query/);
    });

    it('should add a todo if a query is not declared in any component', async () => {
      writeFile('/index.ts', `
        import {Component, NgModule, ViewChild, SomeToken} from '@angular/core';

        export class NotAComponent {
          @ViewChild('myRef', {read: SomeToken}) query: any;
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(
              `@ViewChild('myRef', /* TODO: add static flag */ { read: SomeToken }) query: any;`);
      expect(warnOutput.length).toBe(1);
      expect(warnOutput[0])
          .toMatch(
              /^⮑ {3}index.ts@5:11:.+could not be determined.+not declared in any component/);
    });

    it('should add a todo if a query is used multiple times with different timing', async () => {
      writeFile('/index.ts', `
        import {Component, NgModule, ViewChild} from '@angular/core';

        export class BaseClass {
          @ViewChild('myRef') query: any;
        }

        @Component({template: '<ng-template><p #myRef></p></ng-template>'})
        export class FirstComp extends BaseClass {}

        @Component({template: '<span #myRef></span>'})
        export class SecondComp extends BaseClass {}

        @NgModule({declarations: [FirstComp, SecondComp]})
        export class MyModule {}
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@ViewChild('myRef', /* TODO: add static flag */ {}) query: any;`);
      expect(warnOutput.length).toBe(1);
      expect(warnOutput[0])
          .toMatch(
              /^⮑ {3}index.ts@5:11: Multiple components use the query with different timings./);
    });

    it('should be able to migrate an application with type checking failure which ' +
           'does not affect analysis',
       async () => {
         // Fakes the `@angular/package` by creating a `ViewChild` decorator
         // function that requires developers to specify the "static" flag.
         writeFile('/node_modules/@angular/core/index.d.ts', `
           export interface ViewChildDecorator {
             (selector: Type<any> | Function | string, opts: {
               static: boolean;
               read?: any;
             }): any;
           }

           export declare const ViewChild: ViewChildDecorator;
         `);

         writeFile('/index.ts', `
           import {NgModule, Component, ViewChild} from '@angular/core';

           @Component({
             template: '<ng-template><p #myRef></p></ng-template>'
           })
           export class MyComp {
             @ViewChild('myRef') query: any;
           }
         `);

         writeFile('/my-module.ts', `
           import {NgModule} from '@angular/core';
           import {MyComp} from './index';

           @NgModule({declarations: [MyComp]})
           export class MyModule {}
         `);

         await runMigration();

         expect(errorOutput.length).toBe(0);
         expect(tree.readContent('/index.ts'))
             .toContain(`@ViewChild('myRef', { static: false }) query: any;`);
       });

    it('should be able to migrate applications with template type checking failure ' +
           'which does not affect analysis',
       async () => {
         writeFile('/index.ts', `
           import {NgModule, Component, ViewChild} from '@angular/core';

           @Component({
             template: '<p #myRef>{{myVar.hello()}}</p>'
           })
           export class MyComp {
             // This causes a type checking exception as the template
             // tries to call a function called "hello()" on this variable.
             myVar: boolean = false;

             @ViewChild('myRef') query: any;
           }
         `);

         writeFile('/my-module.ts', `
           import {NgModule} from '@angular/core';
           import {MyComp} from './index';

           @NgModule({declarations: [MyComp]})
           export class MyModule {}
         `);

         await runMigration();

         expect(errorOutput.length).toBe(0);
         expect(tree.readContent('/index.ts'))
             .toContain(`@ViewChild('myRef', { static: true }) query: any;`);
       });

    it('should notify user if project has syntax errors which can affect analysis', async () => {
      writeFile('/index.ts', `
        import {Component, ViewChild} from '@angular/core';

        @Component({
          template: '<p #myRef></p>'
        })
        export class MyComp {
          @ViewChild('myRef') query: any;
        }
      `);

      writeFile('/file-with-syntax-error.ts', `
        export classX ClassWithSyntaxError {
          // ...
        }
      `);

      writeFile('/my-module.ts', `
        import {NgModule} from '@angular/core';
        import {MyComp} from './index';

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

      await runMigration();

      expect(errorOutput.length).toBe(1);
      expect(errorOutput[0]).toMatch(/file-with-syntax-error\.ts\(2,9\): error TS1128.*/);
      expect(tree.readContent('/index.ts'))
          .toContain(`@ViewChild('myRef', { static: true }) query: any;`);
    });

    it('should gracefully exit migration if queries could not be analyzed', async () => {
      writeFile('/index.ts', `
        import {Component, ViewChild} from '@angular/core';

        @Component({template: '<ng-template><p #myRef></p></ng-template>'})
        export class MyComp {
          @ViewChild('myRef') query: any;
        }

        // **NOTE**: Analysis will fail as there is no "NgModule" that declares the component.
      `);

      // We don't expect an error to be thrown as this could interrupt other
      // migrations which are scheduled with "ng update" in the CLI.
      await runMigration();

      expect(errorOutput.length).toBe(1);
      expect(errorOutput[0]).toMatch(/Cannot determine the module for class MyComp/);
    });

    it('should gracefully exit migration if AOT compiler throws exception', async () => {
      writeFile('/my-component.ts', `
        import {Component, ViewChild} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @ViewChild('test') query: any;
        }
      `);
      writeFile('/app-module.ts', `
        import {NgModule} from '@angular/core';
        import {MyComp} from './components';

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

      writeFile('/components.ts', `export * from './my-component';`);
      writeFile('/index.ts', `export * from './app-module';`);

      // Enable flat-module bundling in order to simulate a common AOT compiler
      // failure that can happen in CLI projects that use flat-module bundling
      // e.g. with ng-packagr. https://github.com/angular/angular/issues/20931
      writeFile('/tsconfig.json', JSON.stringify({
        compilerOptions: {
          experimentalDecorators: true,
          lib: ['es2015'],
        },
        angularCompilerOptions: {
          flatModuleId: 'flat-module',
          flatModuleOutFile: 'flat-module-bundle.js',
        },
        files: ['index.ts']
      }));

      await runMigration();

      expect(errorOutput.length).toBe(1);
      expect(errorOutput[0]).toMatch(/^TypeError: Cannot read property 'module' of undefined/);
    });

    it('should add a todo for content queries which are not detectable', async () => {
      writeFile('/index.ts', `
        import {Component, NgModule, ContentChild} from '@angular/core';

        @Component({template: '<p #myRef></p>'})
        export class MyComp {
          @ContentChild('myRef') query: any;
        }

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@ContentChild('myRef', /* TODO: add static flag */ {}) query: any;`);
      expect(warnOutput.length).toBe(1);
      expect(warnOutput[0])
          .toMatch(/^⮑ {3}index.ts@6:11: Content queries cannot be migrated automatically\./);
    });

    it('should add a todo if query options cannot be migrated inline', async () => {
      writeFile('/index.ts', `
        import {Component, NgModule, ViewChild} from '@angular/core';

        const myOptionsVar = {};

        @Component({template: '<p #myRef></p>'})
        export class MyComp {
          @ViewChild('myRef', myOptionsVar) query: any;
        }

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@ViewChild('myRef', /* TODO: add static flag */ myOptionsVar) query: any;`);
      expect(warnOutput.length).toBe(1);
      expect(warnOutput[0])
          .toMatch(/^⮑ {3}index.ts@8:11: Cannot update query to set explicit timing./);
      expect(warnOutput[0]).toMatch(/Please manually set the query timing to.*static: true/);
    });

    it('should not normalize stylesheets which are referenced in component', async () => {
      writeFile('sub_dir/index.ts', `
        import {Component, NgModule, ContentChild} from '@angular/core';

        @Component({
          template: '<p #myRef></p>',
          styleUrls: ['./my-comp.scss']
        })
        export class MyComp {}

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

      // In order to check that the stylesheet is not normalized, we add an "@import" statement
      // that would be extracted by the "DirectiveNormalizer" and fail because the URL resolver
      // is not able to resolve the "../shared" relative import to the SCSS file extension.
      writeFile('/sub_dir/my-comp.scss', `@import '../shared'`);
      writeFile('/shared.scss', `shared {}`);

      spyOn(console, 'error').and.callThrough();

      await runMigration();

      expect(console.error).toHaveBeenCalledTimes(0);
    });

    it('should always use the test migration strategy for test tsconfig files', async () => {
      writeFile('/src/tsconfig.spec.json', JSON.stringify({
        compilerOptions: {
          experimentalDecorators: true,
          lib: ['es2015'],
        },
        files: [
          'test.ts',
        ],
      }));

      writeFile('/src/test.ts', `
        import {ViewChild} from '@angular/core';
        import {AppComponent} from './app.component';

        @Component({template: '<span #test>Test</span>'})
        class MyTestComponent {
          @ViewChild('test') query: any;
        }
      `);

      writeFile('/src/app.component.ts', `
        import {Component, ViewChild} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class AppComponent {
          @ViewChild('test') query: any;
        }
      `);

      writeFile('/src/app.module.ts', `
        import {NgModule} from '@angular/core';
        import {AppComponent} from './app.component';

        @NgModule({declarations: [AppComponent]})
        export class MyModule {}
      `);

      await runMigration();

      expect(errorOutput.length).toBe(0);
      expect(tree.readContent('/src/test.ts'))
          .toContain(`@ViewChild('test', /* TODO: add static flag */ {}) query: any;`);
      expect(tree.readContent('/src/app.component.ts'))
          .toContain(`@ViewChild('test', { static: true }) query: any;`);
    });

    it('should not fall back to test strategy if selected strategy fails', async () => {
      writeFile('/src/tsconfig.spec.json', JSON.stringify({
        compilerOptions: {
          experimentalDecorators: true,
          lib: ['es2015'],
        },
        files: [
          'test.ts',
        ],
      }));

      writeFile('/src/test.ts', `import * as mod from './app.module';`);
      writeFile('/src/app.component.ts', `
        import {Component, ViewChild} from '@angular/core';

        @Component({template: '<span #test>Test</span>'})
        export class AppComponent {
          @ViewChild('test') query: any;
        }
      `);

      writeFile('/src/app.module.ts', `
        import {NgModule} from '@angular/core';
        import {AppComponent} from './app.component';

        @NgModule({declarations: [AppComponent, ThisCausesAnError]})
        export class MyModule {}
      `);

      await runMigration();

      expect(errorOutput.length).toBe(1);
      expect(errorOutput[0]).toMatch(/Unexpected value 'undefined'/);
      expect(tree.readContent('/src/app.component.ts')).toContain(`@ViewChild('test') query: any;`);
    });
  });
});
