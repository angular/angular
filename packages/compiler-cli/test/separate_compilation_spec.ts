/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {expectEmit} from '../../compiler/test/render3/mock_compile';
import {main, readCommandLineAndConfiguration, watchMode} from '../src/main';

import {getNgRootDir, makeTempDir} from './test_support';


// See compiler/design/from separate_compilation.md
describe('separate compilation ', () => {
  describe('ivy library metadata', () => {
    beforeEach(() => {
      writeConfig({
        extends: './tsconfig-base.json',
        include: ['files/*.ts'],
        angularCompilerOptions: {
          enableIvy: true,
          generateRenderer2Factories: false,
          renderer2BackPatching: false,
          generateCodeForLibraries: false
        }
      });
    });

    it('should transform @Component', () => {
      write('files/app.component.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-comp',
          template: 'Hello!'
        })
        export class AppComponent {}`);
      write('files/app.module.ts', `
        import {NgModule} from '@angular/core';
        import {AppComponent} from './app.component';

        @NgModule({declarations: [AppComponent]})
        export class AppModule {}
      `);

      ngc();

      const app_component = `
        $r3$.ɵdefineComponent({
          type: AppComponent,
          tag: "app-comp",
          factory: function AppComponent_Factory() { return new AppComponent(); },
          template: function AppComponent_Template(ctx, cm) {
            if (cm) {
              $r3$.ɵT(0, "Hello!");
            }
          }
        }
      `;
      const app_component_metadata = `
        "AppComponent": {
          "__symbolic":"class",
          "statics": {
            "ngComponentDef": {},
            "ngSelector":"app-comp"
          }
        }`;

      expectWritten('files/app.component.js', app_component, 'Invalid component definition');
      expectWritten(
          'files/app.component.metadata.json', app_component_metadata,
          'Invalid component metadata');

    });

    it('should transform @Directive', () => {
      write('files/some-directive.ts', `
        import {Directive} from '@angular/core';

        @Directive({selector: '[some-directive]'})
        export class SomeDirective {}`);
      write('files/module.ts', `
        import {NgModule} from '@angular/core';
        import {SomeDirective} from './some-directive';

        @NgModule({declarations: [SomeDirective]})
        export class Module {}
      `);

      ngc();

      const some_directive_metadata = `
        "SomeDirective": {
          "__symbolic":"class",
          "statics": {
            "ngDirectiveDef": {},
            "ngSelector":"[some-directive]"
          }
        }`;
      expectWritten(
          'files/some-directive.metadata.json', some_directive_metadata,
          'Invalid directive metadata');
    });

    it('should transform @Pipe', () => {
      write('files/some-pipe.ts', `
        import {Pipe} from '@angular/core';

        @Pipe({name: 'somePipe', pure: false})
        export class SomePipe {}`);
      write('files/module.ts', `
        import {NgModule} from '@angular/core';
        import {SomePipe} from './some-pipe';

        @NgModule({declarations: [SomePipe]})
        export class Module {}
      `);

      ngc();

      const some_pipe_metadata = `
        "SomePipe": {
          "__symbolic":"class",
          "statics": {
            "ngPipeDef": {},
            "ngSelector":"somePipe"
          }
        }`;
      expectWritten('files/some-pipe.metadata.json', some_pipe_metadata, 'Invalid pipe metadata');
    });

    // TODO: Pending merge with ngInjectorDef code
    xit('should transform @NgModule', () => {
      write('files/some-component.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'some-component',
          template: 'Hello!'
        })
        export class SomeComponent {}`);
      write('files/some-directive.ts', `
        import {Directive} from '@angular/core';

        @Directive({selector: '[some-directive]'})
        export class SomeDirective {}`);
      write('files/some-pipe.ts', `
        import {Pipe} from '@angular/core';

        @Pipe({name: 'somePipe', pure: false})
        export class SomePipe {}`);
      write('files/some-other-directive.ts', `
        import {Directive} from '@angular/core';

        @Directive({selector: '[some-other-directive]'})
        export class SomeOtherDirective {}
      `);
      write('files/some-other-module.ts', `
        import {NgModule} from '@angular/core';
        import {SomeOtherDirective} from './some-other-directive';

        @NgModule({declarations: [SomeOtherDirective], exports: [SomeOtherDirective]})
        export class OtherModule {}
      `);
      write('files/module.ts', `
        import {NgModule} from '@angular/core';
        import {SomeComponent} from './some-component';
        import {SomeDirective} from './some-directive';
        import {SomePipe} from './some-pipe';
        import {OtherModule} from './some-other-module';

        const ITEMS = [SomeComponent, SomeDirective, SomePipe];
        @NgModule({
          imports: [OtherModule],
          declarations: ITEMS, exports: ITEMS
        })
        export class Module {}
      `);

      ngc();

      const module_metadata = `
        "Module": {
          "__symbolic":"class",
          "statics": {
            "ngInjectorDef": {},
            "ngModuleScope": {
              {
                "type": {
                  "__symbolic":"reference",
                  "module":"./some-component",
                  "name":"SomeComponent"
                },
                "selector": "some-component"
              }, {
                "type": {
                  "__symbolic":"reference",
                  "module":"./some-directive",
                  "name":"SomeDirective",
                },
                "selector": "[some-directive]",
                "isDirective": true
              }, {
                "type": {
                  "__symbolic":"reference",
                  "module":"./some-pipe",
                  "name":"SomePipe",
                },
                "isPipe": true
              }, {
                "type": {
                  "__symbolic":"reference",
                  "module":./some-other-module",
                  "name":"OtherModule",
                },
                "isModule": true
              }
            }
          }
        }`;
      expectWritten('files/module.metadata.json', module_metadata, 'Invalid pipe metadata');
    });
  });

  describe('ivy package metadata', () => {
    beforeEach(() => {
      writeConfig({
        extends: './tsconfig-base.json',
        files: ['public-api.ts'],
        angularCompilerOptions: {
          enableIvy: true,
          generateRenderer2Factories: false,
          renderer2BackPatching: false,
          generateCodeForLibraries: false,
          fullTemplateTypeCheck: true,
          flatModuleOutFile: 'index.js',
          flatModuleId: 'some-module'
        }
      });
    });

    it('should produce the correct flat module metadata', () => {
      write('files/some-component.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'some-component',
          template: 'Hello!'
        })
        export class SomeComponent {}`);
      write('files/some-directive.ts', `
        import {Directive} from '@angular/core';

        @Directive({selector: '[some-directive]'})
        export class SomeDirective {}`);
      write('files/some-pipe.ts', `
        import {Pipe} from '@angular/core';

        @Pipe({name: 'somePipe', pure: false})
        export class SomePipe {}`);
      write('files/some-other-directive.ts', `
        import {Directive} from '@angular/core';

        @Directive({selector: '[some-other-directive]'})
        export class SomeOtherDirective {}
      `);
      write('files/some-other-module.ts', `
        import {NgModule} from '@angular/core';
        import {SomeOtherDirective} from './some-other-directive';

        @NgModule({declarations: [SomeOtherDirective], exports: [SomeOtherDirective]})
        export class OtherModule {}
      `);
      write('files/module.ts', `
        import {NgModule} from '@angular/core';
        import {SomeComponent} from './some-component';
        import {SomeDirective} from './some-directive';
        import {SomePipe} from './some-pipe';
        import {OtherModule} from './some-other-module';

        const ITEMS = [SomeComponent, SomeDirective, SomePipe];
        
        @NgModule({
          imports: [OtherModule],
          declarations: ITEMS, exports: ITEMS
        })
        export class Module {}
      `);
      write('public-api.ts', `
        export * from './files/module';
        export * from './files/some-component';
        export * from './files/some-directive';
        export * from './files/some-pipe';
        export * from './files/some-other-module';
        export * from './files/some-other-directive';
      `);

      ngc();

      const module_metadata = `FILL THIS IN`;

      expectWritten('index.metadata.json', module_metadata, 'Invalid pipe metadata');
    });
  });

  describe('separate compiles', () => {

    it('should compile ivy application using a Renderer2 library and an Ivy library', () => {

      // Library using Renderer2
      writeConfig('library1/tsconfig.json', {
        extends: '../tsconfig-base.json',
        files: ['public-api.ts'],
        angularCompilerOptions:
            {skipTemplateCodegen: true, flatModuleOutFile: 'index.js', flatModuleId: 'library1'}
      });

      write('library1/component.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'lib1-comp',
          template: 'Hello from lib1!'
        })
        export class Lib1Component { }
      `);

      write('library1/directive.ts', `
        import {Directive} from '@angular/core';

        @Directive({selector: '[lib1-dir]'})
        export class Lib1Directive { }
      `);

      write('library1/pipe.ts', `
        import {Pipe} from '@angular/core';

        @Pipe({name: 'lib1Pipe'})
        export class Lib1Pipe { }
      `);

      write('library1/module.ts', `
        import {NgModule} from '@angular/core';

        import {Lib1Component} from './component';
        import {Lib1Directive} from './directive';
        import {Lib1Pipe} from './pipe';
        
        @NgModule({
          declarations: [Lib1Component, Lib1Directive, Lib1Pipe],
          exports: [Lib1Component, Lib1Directive, Lib1Pipe]
        })
        export class Lib1Module {}
      `);

      write('library1/public-api.ts', `
        export * from './module';
        export * from './component';
        export * from './directive';
        export * from './pipe';
      `);

      ngc('library1');

      // Library using ivy
      writeConfig('library2/tsconfig.json', {
        extends: '../tsconfig-base.json',
        files: ['index.ts'],
        angularCompilerOptions: {
          enableIvy: true,
          generateRenderer2Factories: true,
          renderer2BackPatching: true,
          generateCodeForLibraries: true
        }
      });

      write('library2/component.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'lib2-comp',
          template: 'Hello from lib2!'
        })
        export class Lib2Component { }
      `);

      write('library2/directive.ts', `
        import {Directive} from '@angular/core';

        @Directive({selector: '[lib2-dir]'})
        export class Lib2Directive { }
      `);

      write('library2/pipe.ts', `
        import {Pipe} from '@angular/core';

        @Pipe({name: 'lib1Pipe'})
        export class Lib2Pipe { }
      `);

      write('library2/module.ts', `
        import {NgModule} from '@angular/core';

        import {Lib2Component} from './component';
        import {Lib2Directive} from './directive';
        import {Lib2Pipe} from './pipe';
        
        @NgModule({
          declarations: [Lib2Component, Lib2Directive, Lib2Pipe],
          exports: [Lib2Component, Lib2Directive, Lib2Pipe]
        })
        export class Lib2Module {}
      `);

      write('library2/index.ts', `
        export * from './module';
        export * from './component';
        export * from './directive';
        export * from './pipe';
      `);

      ngc('library2');

      // Application that imports both and generates ivy plus back-patching
      writeConfig('app/tsconfig.json', {
        extends: '../tsconfig-base.json',
        files: ['module.ts'],
        compilerOptions: {paths: {'library1': ['built/library1'], 'library2': ['built/library2']}},
        angularCompilerOptions: {
          enableIvy: true,
          generateRenderer2Factories: true,
          renderer2BackPatching: true,
          generateCodeForLibraries: true
        }
      });

      write('app/component.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-comp',
          template: 'Hello from the app <lib1-comp lib2-dir></lib1-comp> <lib2-comp lib1-dir></lib2-comp> {{value | lib1Pipe | lib2Pipe}}'
        })
        export class AppComponent { 
          value = 'piped!'
        }
      `);

      write('app/module.ts', `
        import {NgModule} from '@angular/core';

        import {Lib1Module} from 'library1';
        import {Lib2Module} from 'library2';
        import {AppComponent} from './component';

        @NgModule({
          imports: [Lib1Module, Lib2Module],
          declarations: [AppComponent]
        })
        export class AppModule {}
      `);

      ngc('app');

      const app_component = `
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: AppComponent,
          tag: 'app-comp',
          factory: function AppComponent_Factory() { return new AppComponent(); },
          template: function AppComponent_Template(ctx: $AppComponent$, cm: $boolean$) {
            …
          }
        }
      `;

      const lib2_component = `
        static ngComponentDef = $r3$.ɵdefineComponent({
          type: Lib2Component,
          tag: 'lib2-comp',
          factory: function Lib2Component_Factory() { return new Lib2Component(); },
          template: function Lib2Component_Template(ctx: $Lib2Component$, cm: $boolean$) {
            …
          }
        }
      `;

      const lib1_component = `
        $r3$.ɵdefineComponent({
          type: Lib1Component,
          tag: 'lib1-comp',
          factory: function Lib1Component_Factory() { return new Lib1Component(); },
          template: function Lib1Component_Template(ctx: $Lib1Component$, cm: $boolean$) {
            …
          }
        }  
      `;

      expectWritten('app/component.js', app_component, 'Invalid application component');
      expectWritten('lib2/component.js', lib2_component, 'Invalid library 2 component');
      expectWritten(
          'app/angular.back-patch.js', lib1_component, 'Back-patch for library 1 missing');
    });
  });

  let basePath: string;
  let outDir: string;
  let write: (fileName: string, content: string) => void;
  let errorSpy: jasmine.Spy&((s: string) => void);
  let errors: string[] = [];

  function shouldExist(fileName: string) {
    if (!fs.existsSync(path.resolve(outDir, fileName))) {
      throw new Error(`Expected ${fileName} to be emitted (outDir: ${outDir})`);
    }
  }

  function shouldNotExist(fileName: string) {
    if (fs.existsSync(path.resolve(outDir, fileName))) {
      throw new Error(`Did not expect ${fileName} to be emitted (outDir: ${outDir})`);
    }
  }

  function writeConfig(fileName: string, config: any): void;
  function writeConfig(config: any): void;
  function writeConfig(
      configOrFile: any = {extends: './tsconfig-base.json'}, configIfSpecified?: any): void {
    const fileName = typeof configOrFile === 'string' ? configOrFile : 'tsconfig.json';
    const config = configIfSpecified || configOrFile;
    write(fileName, JSON.stringify(config, null, ' '));
  }

  function expectWritten(fileName: string, expected: string, description: string) {
    shouldExist(fileName);
    const filePath = path.resolve(outDir, fileName);
    const content = fs.readFileSync(filePath, 'utf8');
    expectEmit(content, expected, description);
  }

  function ngc(projectFile?: string) {
    const project = projectFile ? path.resolve(basePath, projectFile) : basePath;
    const exitCode = main(['-p', project], errorSpy);
    expect(exitCode).toBe(0, `Unexpected failure:\n${errors.join('\n  ')}`);
  }

  beforeEach(() => {
    errorSpy = jasmine.createSpy('consoleError').and.callFake((msg: string) => errors.push(msg));
    basePath = makeTempDir();
    process.chdir(basePath);
    write = (fileName: string, content: string) => {
      const dir = path.dirname(fileName);
      if (dir != '.') {
        const newDir = path.join(basePath, dir);
        if (!fs.existsSync(newDir)) fs.mkdirSync(newDir);
      }
      fs.writeFileSync(path.join(basePath, fileName), content, {encoding: 'utf-8'});
    };
    write('tsconfig-base.json', `{
      "compilerOptions": {
        "experimentalDecorators": true,
        "skipLibCheck": true,
        "noImplicitAny": true,
        "types": [],
        "outDir": "built",
        "rootDir": ".",
        "baseUrl": ".",
        "declaration": true,
        "target": "es5",
        "module": "es2015",
        "moduleResolution": "node",
        "lib": ["es6", "dom"],
        "typeRoots": ["node_modules/@types"]
      }
    }`);
    outDir = path.resolve(basePath, 'built');
    const ngRootDir = getNgRootDir();
    const nodeModulesPath = path.resolve(basePath, 'node_modules');
    fs.mkdirSync(nodeModulesPath);
    fs.symlinkSync(
        path.resolve(ngRootDir, 'dist', 'all', '@angular'),
        path.resolve(nodeModulesPath, '@angular'));
    fs.symlinkSync(
        path.resolve(ngRootDir, 'node_modules', 'rxjs'), path.resolve(nodeModulesPath, 'rxjs'));
  });
});
