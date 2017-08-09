/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {makeTempDir} from '@angular/tsc-wrapped/test/test_support';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {mainSync} from '../src/main';

function getNgRootDir() {
  const moduleFilename = module.filename.replace(/\\/g, '/');
  const distIndex = moduleFilename.indexOf('/dist/all');
  return moduleFilename.substr(0, distIndex);
}

describe('ngc transformer command-line', () => {
  let basePath: string;
  let outDir: string;
  let write: (fileName: string, content: string) => void;
  let errorSpy: jasmine.Spy&((s: string) => void);

  function writeConfig(tsconfig: string = '{"extends": "./tsconfig-base.json"}') {
    write('tsconfig.json', tsconfig);
  }

  beforeEach(() => {
    errorSpy = jasmine.createSpy('consoleError');
    basePath = makeTempDir();
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
        "types": [],
        "outDir": "built",
        "declaration": true,
        "module": "es2015",
        "moduleResolution": "node",
        "lib": ["es6", "dom"]
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

  it('should compile without errors', () => {
    writeConfig();
    write('test.ts', 'export const A = 1;');

    const exitCode = mainSync(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);
  });

  it('should not print the stack trace if user input file does not exist', () => {
    writeConfig(`{
      "extends": "./tsconfig-base.json",
      "files": ["test.ts"]
    }`);

    const exitCode = mainSync(['-p', basePath], errorSpy);
    expect(errorSpy).toHaveBeenCalledWith(
        `error TS6053: File '` + path.join(basePath, 'test.ts') + `' not found.` +
        '\n');
    expect(exitCode).toEqual(1);
  });

  it('should not print the stack trace if user input file is malformed', () => {
    writeConfig();
    write('test.ts', 'foo;');

    const exitCode = mainSync(['-p', basePath], errorSpy);
    expect(errorSpy).toHaveBeenCalledWith(
        `test.ts(1,1): error TS2304: Cannot find name 'foo'.` +
        '\n');
    expect(exitCode).toEqual(1);
  });

  it('should not print the stack trace if cannot find the imported module', () => {
    writeConfig();
    write('test.ts', `import {MyClass} from './not-exist-deps';`);

    const exitCode = mainSync(['-p', basePath], errorSpy);
    expect(errorSpy).toHaveBeenCalledWith(
        `test.ts(1,23): error TS2307: Cannot find module './not-exist-deps'.` +
        '\n');
    expect(exitCode).toEqual(1);
  });

  it('should not print the stack trace if cannot import', () => {
    writeConfig();
    write('empty-deps.ts', 'export const A = 1;');
    write('test.ts', `import {MyClass} from './empty-deps';`);

    const exitCode = mainSync(['-p', basePath], errorSpy);
    expect(errorSpy).toHaveBeenCalledWith(
        `test.ts(1,9): error TS2305: Module '"` + path.join(basePath, 'empty-deps') +
        `"' has no exported member 'MyClass'.` +
        '\n');
    expect(exitCode).toEqual(1);
  });

  it('should not print the stack trace if type mismatches', () => {
    writeConfig();
    write('empty-deps.ts', 'export const A = "abc";');
    write('test.ts', `
      import {A} from './empty-deps';
      A();
    `);

    const exitCode = mainSync(['-p', basePath], errorSpy);
    expect(errorSpy).toHaveBeenCalledWith(
        'test.ts(3,7): error TS2349: Cannot invoke an expression whose type lacks a call signature. ' +
        'Type \'String\' has no compatible call signatures.\n');
    expect(exitCode).toEqual(1);
  });

  it('should print the stack trace on compiler internal errors', () => {
    write('test.ts', 'export const A = 1;');

    const exitCode = mainSync(['-p', 'not-exist'], errorSpy);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.calls.mostRecent().args[0]).toContain('no such file or directory');
    expect(errorSpy.calls.mostRecent().args[0]).toContain('at Error (native)');
    expect(exitCode).toEqual(1);
  });

  describe('compile ngfactory files', () => {
    it('should report errors for ngfactory files that are not referenced by root files', () => {
      writeConfig(`{
          "extends": "./tsconfig-base.json",
          "files": ["mymodule.ts"]
        }`);
      write('mymodule.ts', `
        import {NgModule, Component} from '@angular/core';

        @Component({template: '{{unknownProp}}'})
        export class MyComp {}

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

      const exitCode = mainSync(['-p', basePath], errorSpy);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.calls.mostRecent().args[0])
          .toContain('Error at ng://' + path.join(basePath, 'mymodule.ts.MyComp.html'));
      expect(errorSpy.calls.mostRecent().args[0])
          .toContain(`Property 'unknownProp' does not exist on type 'MyComp'`);

      expect(exitCode).toEqual(1);
    });

    it('should report errors as coming from the html file, not the factory', () => {
      writeConfig(`{
          "extends": "./tsconfig-base.json",
          "files": ["mymodule.ts"]
        }`);
      write('my.component.ts', `
        import {Component} from '@angular/core';
        @Component({templateUrl: './my.component.html'})
        export class MyComp {}
      `);
      write('my.component.html', `<h1>
        {{unknownProp}}
       </h1>`);
      write('mymodule.ts', `
        import {NgModule} from '@angular/core';
        import {MyComp} from './my.component';

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

      const exitCode = mainSync(['-p', basePath], errorSpy);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.calls.mostRecent().args[0])
          .toContain('Error at ng://' + path.join(basePath, 'my.component.html(1,5):'));
      expect(errorSpy.calls.mostRecent().args[0])
          .toContain(`Property 'unknownProp' does not exist on type 'MyComp'`);

      expect(exitCode).toEqual(1);
    });

    it('should compile ngfactory files that are not referenced by root files', () => {
      writeConfig(`{
          "extends": "./tsconfig-base.json",
          "files": ["mymodule.ts"]
        }`);
      write('mymodule.ts', `
        import {CommonModule} from '@angular/common';
        import {NgModule} from '@angular/core';

        @NgModule({
          imports: [CommonModule]
        })
        export class MyModule {}
      `);

      const exitCode = mainSync(['-p', basePath], errorSpy);
      expect(exitCode).toEqual(0);

      expect(fs.existsSync(path.resolve(outDir, 'mymodule.ngfactory.js'))).toBe(true);
      expect(fs.existsSync(path.resolve(
                 outDir, 'node_modules', '@angular', 'core', 'src',
                 'application_module.ngfactory.js')))
          .toBe(true);
    });

    it('should compile with an explicit tsconfig reference', () => {
      writeConfig(`{
          "extends": "./tsconfig-base.json",
          "files": ["mymodule.ts"]
        }`);
      write('mymodule.ts', `
        import {CommonModule} from '@angular/common';
        import {NgModule} from '@angular/core';

        @NgModule({
          imports: [CommonModule]
        })
        export class MyModule {}
      `);

      const exitCode = mainSync(['-p', path.join(basePath, 'tsconfig.json')], errorSpy);
      expect(exitCode).toEqual(0);
      expect(fs.existsSync(path.resolve(outDir, 'mymodule.ngfactory.js'))).toBe(true);
      expect(fs.existsSync(path.resolve(
                 outDir, 'node_modules', '@angular', 'core', 'src',
                 'application_module.ngfactory.js')))
          .toBe(true);
    });

    describe('closure', () => {
      it('should not generate closure specific code by default', () => {
        writeConfig(`{
          "extends": "./tsconfig-base.json",
          "files": ["mymodule.ts"]
        }`);
        write('mymodule.ts', `
        import {NgModule, Component} from '@angular/core';

        @Component({template: ''})
        export class MyComp {}

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

        const exitCode = mainSync(['-p', basePath], errorSpy);
        expect(exitCode).toEqual(0);

        const mymodulejs = path.resolve(outDir, 'mymodule.js');
        const mymoduleSource = fs.readFileSync(mymodulejs, 'utf8');
        expect(mymoduleSource).not.toContain('@fileoverview added by tsickle');
        expect(mymoduleSource).toContain('MyComp.decorators = [');
      });

      it('should add closure annotations', () => {
        writeConfig(`{
          "extends": "./tsconfig-base.json",
          "angularCompilerOptions": {
            "annotateForClosureCompiler": true
          },
          "files": ["mymodule.ts"]
        }`);
        write('mymodule.ts', `
        import {NgModule, Component} from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          fn(p: any) {}
        }

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

        const exitCode = mainSync(['-p', basePath], errorSpy);
        expect(exitCode).toEqual(0);

        const mymodulejs = path.resolve(outDir, 'mymodule.js');
        const mymoduleSource = fs.readFileSync(mymodulejs, 'utf8');
        expect(mymoduleSource).toContain('@fileoverview added by tsickle');
        expect(mymoduleSource).toContain('@param {?} p');
      });

      it('should add metadata as decorators', () => {
        writeConfig(`{
          "extends": "./tsconfig-base.json",
          "angularCompilerOptions": {
            "annotationsAs": "decorators"
          },
          "files": ["mymodule.ts"]
        }`);
        write('mymodule.ts', `
        import {NgModule, Component} from '@angular/core';

        @Component({template: ''})
        export class MyComp {
          fn(p: any) {}
        }

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

        const exitCode = mainSync(['-p', basePath], errorSpy);
        expect(exitCode).toEqual(0);

        const mymodulejs = path.resolve(outDir, 'mymodule.js');
        const mymoduleSource = fs.readFileSync(mymodulejs, 'utf8');
        expect(mymoduleSource).toContain('MyComp = __decorate([');
      });
    });

    describe('expression lowering', () => {
      beforeEach(() => {
        writeConfig(`{
            "extends": "./tsconfig-base.json",
            "files": ["mymodule.ts"]
          }`);
      });

      function compile(): number {
        errorSpy.calls.reset();
        const result = mainSync(['-p', path.join(basePath, 'tsconfig.json')], errorSpy);
        expect(errorSpy).not.toHaveBeenCalled();
        return result;
      }

      it('should be able to lower a lambda expression in a provider', () => {
        write('mymodule.ts', `
          import {CommonModule} from '@angular/common';
          import {NgModule} from '@angular/core';

          class Foo {}

          @NgModule({
            imports: [CommonModule],
            providers: [{provide: 'someToken', useFactory: () => new Foo()}]
          })
          export class MyModule {}
        `);
        expect(compile()).toEqual(0);

        const mymodulejs = path.resolve(outDir, 'mymodule.js');
        const mymoduleSource = fs.readFileSync(mymodulejs, 'utf8');
        expect(mymoduleSource).toContain('var ɵ0 = function () { return new Foo(); }');
        expect(mymoduleSource).toContain('export { ɵ0');

        const mymodulefactory = path.resolve(outDir, 'mymodule.ngfactory.js');
        const mymodulefactorySource = fs.readFileSync(mymodulefactory, 'utf8');
        expect(mymodulefactorySource).toContain('"someToken", i1.ɵ0');
      });

      it('should be able to lower a function expression in a provider', () => {
        write('mymodule.ts', `
          import {CommonModule} from '@angular/common';
          import {NgModule} from '@angular/core';

          class Foo {}

          @NgModule({
            imports: [CommonModule],
            providers: [{provide: 'someToken', useFactory: function() {return new Foo();}}]
          })
          export class MyModule {}
        `);
        expect(compile()).toEqual(0);

        const mymodulejs = path.resolve(outDir, 'mymodule.js');
        const mymoduleSource = fs.readFileSync(mymodulejs, 'utf8');
        expect(mymoduleSource).toContain('var ɵ0 = function () { return new Foo(); }');
        expect(mymoduleSource).toContain('export { ɵ0');

        const mymodulefactory = path.resolve(outDir, 'mymodule.ngfactory.js');
        const mymodulefactorySource = fs.readFileSync(mymodulefactory, 'utf8');
        expect(mymodulefactorySource).toContain('"someToken", i1.ɵ0');
      });

      it('should able to lower multiple expressions', () => {
        write('mymodule.ts', `
          import {CommonModule} from '@angular/common';
          import {NgModule} from '@angular/core';

          class Foo {}

          @NgModule({
            imports: [CommonModule],
            providers: [
              {provide: 'someToken', useFactory: () => new Foo()},
              {provide: 'someToken', useFactory: () => new Foo()},
              {provide: 'someToken', useFactory: () => new Foo()},
              {provide: 'someToken', useFactory: () => new Foo()}
            ]
          })
          export class MyModule {}
        `);
        expect(compile()).toEqual(0);
        const mymodulejs = path.resolve(outDir, 'mymodule.js');
        const mymoduleSource = fs.readFileSync(mymodulejs, 'utf8');
        expect(mymoduleSource).toContain('ɵ0 = function () { return new Foo(); }');
        expect(mymoduleSource).toContain('ɵ1 = function () { return new Foo(); }');
        expect(mymoduleSource).toContain('ɵ2 = function () { return new Foo(); }');
        expect(mymoduleSource).toContain('ɵ3 = function () { return new Foo(); }');
        expect(mymoduleSource).toContain('export { ɵ0, ɵ1, ɵ2, ɵ3');
      });

      it('should be able to lower an indirect expression', () => {
        write('mymodule.ts', `
          import {CommonModule} from '@angular/common';
          import {NgModule} from '@angular/core';

          class Foo {}

          const factory = () => new Foo();

          @NgModule({
            imports: [CommonModule],
            providers: [{provide: 'someToken', useFactory: factory}]
          })
          export class MyModule {}
        `);
        expect(compile()).toEqual(0, 'Compile failed');

        const mymodulejs = path.resolve(outDir, 'mymodule.js');
        const mymoduleSource = fs.readFileSync(mymodulejs, 'utf8');
        expect(mymoduleSource).toContain('var ɵ0 = function () { return new Foo(); }');
        expect(mymoduleSource).toContain('export { ɵ0');
      });

      it('should not lower a lambda that is already exported', () => {
        write('mymodule.ts', `
          import {CommonModule} from '@angular/common';
          import {NgModule} from '@angular/core';

          export class Foo {}

          export const factory = () => new Foo();

          @NgModule({
            imports: [CommonModule],
            providers: [{provide: 'someToken', useFactory: factory}]
          })
          export class MyModule {}
        `);
        expect(compile()).toEqual(0);

        const mymodulejs = path.resolve(outDir, 'mymodule.js');
        const mymoduleSource = fs.readFileSync(mymodulejs, 'utf8');
        expect(mymoduleSource).not.toContain('ɵ0');
      });
    });

    const shouldExist = (fileName: string) => {
      if (!fs.existsSync(path.resolve(outDir, fileName))) {
        throw new Error(`Expected ${fileName} to be emitted (outDir: ${outDir})`);
      }
    };
    const shouldNotExist = (fileName: string) => {
      if (fs.existsSync(path.resolve(outDir, fileName))) {
        throw new Error(`Did not expect ${fileName} to be emitted (outDir: ${outDir})`);
      }
    };

    it('should be able to generate a flat module library', () => {
      writeConfig(`
        {
          "angularCompilerOptions": {
            "genDir": "ng",
            "flatModuleId": "flat_module",
            "flatModuleOutFile": "index.js",
            "skipTemplateCodegen": true
          },

          "compilerOptions": {
            "target": "es5",
            "experimentalDecorators": true,
            "noImplicitAny": true,
            "moduleResolution": "node",
            "rootDir": "",
            "declaration": true,
            "lib": ["es6", "dom"],
            "baseUrl": ".",
            "outDir": "built",
            "typeRoots": ["node_modules/@types"]
        },

        "files": ["public-api.ts"]
        }
      `);
      write('public-api.ts', `
        export * from './src/flat.component';
        export * from './src/flat.module';`);
      write('src/flat.component.html', '<div>flat module component</div>');
      write('src/flat.component.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'flat-comp',
          templateUrl: 'flat.component.html',
        })
        export class FlatComponent {
        }`);
      write('src/flat.module.ts', `
        import {NgModule} from '@angular/core';

        import {FlatComponent} from './flat.component';

        @NgModule({
          declarations: [
            FlatComponent,
          ],
          exports: [
            FlatComponent,
          ]
        })
        export class FlatModule {
        }`);

      const exitCode = mainSync(['-p', path.join(basePath, 'tsconfig.json')], errorSpy);
      expect(exitCode).toEqual(0);
      shouldExist('index.js');
      shouldExist('index.metadata.json');
    });

    describe('with a third-party library', () => {
      const writeGenConfig = (skipCodegen: boolean) => {
        writeConfig(`{
          "angularCompilerOptions": {
            "skipTemplateCodegen": ${skipCodegen},
            "enableSummariesForJit": true
          },
          "compilerOptions": {
            "target": "es5",
            "experimentalDecorators": true,
            "noImplicitAny": true,
            "moduleResolution": "node",
            "rootDir": "",
            "declaration": true,
            "lib": ["es6", "dom"],
            "baseUrl": ".",
            "outDir": "built",
            "typeRoots": ["node_modules/@types"]
          }
        }`);
      };
      beforeEach(() => {
        write('comp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'third-party-comp',
            template: '<div>3rdP-component</div>',
          })
          export class ThirdPartyComponent {
          }`);
        write('directive.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[thirdParty]',
            host: {'[title]': 'thirdParty'},
          })
          export class ThirdPartyDirective {
            @Input() thirdParty: string;
          }`);
        write('module.ts', `
          import {NgModule} from '@angular/core';

          import {ThirdPartyComponent} from './comp';
          import {ThirdPartyDirective} from './directive';
          import {AnotherThirdPartyModule} from './other_module';

          @NgModule({
            declarations: [
              ThirdPartyComponent,
              ThirdPartyDirective,
            ],
            exports: [
              AnotherThirdPartyModule,
              ThirdPartyComponent,
              ThirdPartyDirective,
            ],
            imports: [AnotherThirdPartyModule]
          })
          export class ThirdpartyModule {
          }`);
        write('other_comp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'another-third-party-comp',
            template: \`<div i18n>other-3rdP-component
          multi-lines</div>\`,
          })
          export class AnotherThirdpartyComponent {
          }`);
        write('other_module.ts', `
          import {NgModule} from '@angular/core';
          import {AnotherThirdpartyComponent} from './other_comp';

          @NgModule({
            declarations: [AnotherThirdpartyComponent],
            exports: [AnotherThirdpartyComponent],
          })
          export class AnotherThirdPartyModule {
          }`);
      });
      const modules = ['comp', 'directive', 'module', 'other_comp', 'other_module'];
      it('should honor skip code generation', () => {
        // First ensure that we skip code generation when requested;.
        writeGenConfig(/* skipCodegen */ true);
        const exitCode = mainSync(['-p', path.join(basePath, 'tsconfig.json')], errorSpy);
        expect(exitCode).toEqual(0);
        modules.forEach(moduleName => {
          shouldExist(moduleName + '.js');
          shouldExist(moduleName + '.d.ts');
          shouldExist(moduleName + '.metadata.json');
          shouldNotExist(moduleName + '.ngfactory.js');
          shouldNotExist(moduleName + '.ngfactory.d.ts');
          shouldNotExist(moduleName + '.ngsummary.js');
          shouldNotExist(moduleName + '.ngsummary.d.ts');
          shouldNotExist(moduleName + '.ngsummary.json');
        });
      });
      it('should produce factories', () => {
        // First ensure that we skip code generation when requested;.
        writeGenConfig(/* skipCodegen */ false);
        const exitCode = mainSync(['-p', path.join(basePath, 'tsconfig.json')], errorSpy);
        expect(exitCode).toEqual(0);
        modules.forEach(moduleName => {
          shouldExist(moduleName + '.js');
          shouldExist(moduleName + '.d.ts');
          shouldExist(moduleName + '.metadata.json');
          if (!/(directive)|(pipe)/.test(moduleName)) {
            shouldExist(moduleName + '.ngfactory.js');
            shouldExist(moduleName + '.ngfactory.d.ts');
          }
          shouldExist(moduleName + '.ngsummary.js');
          shouldExist(moduleName + '.ngsummary.d.ts');
          shouldExist(moduleName + '.ngsummary.json');
          shouldNotExist(moduleName + '.ngfactory.metadata.json');
          shouldNotExist(moduleName + '.ngsummary.metadata.json');
        });
      });
    });

    describe('with tree example', () => {
      beforeEach(() => {
        writeConfig();
        write('index_aot.ts', `
          import {enableProdMode} from '@angular/core';
          import {platformBrowser} from '@angular/platform-browser';

          import {AppModuleNgFactory} from './tree.ngfactory';

          enableProdMode();
          platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);`);
        write('tree.ts', `
          import {Component, NgModule} from '@angular/core';
          import {CommonModule} from '@angular/common';

          @Component({
            selector: 'tree',
            inputs: ['data'],
            template:
                \`<span [style.backgroundColor]="bgColor"> {{data.value}} </span><tree *ngIf='data.right != null' [data]='data.right'></tree><tree *ngIf='data.left != null' [data]='data.left'></tree>\`
          })
          export class TreeComponent {
            data: any;
            bgColor = 0;
          }

          @NgModule({imports: [CommonModule], bootstrap: [TreeComponent], declarations: [TreeComponent]})
          export class AppModule {}
        `);
      });

      it('should compile without error', () => {
        expect(mainSync(['-p', path.join(basePath, 'tsconfig.json')], errorSpy)).toBe(0);
      });
    });

    describe('with summary libraries', () => {
      // TODO{chuckj}: Emitting using summaries only works if outDir is set to '.'
      const shouldExist = (fileName: string) => {
        if (!fs.existsSync(path.resolve(basePath, fileName))) {
          throw new Error(`Expected ${fileName} to be emitted (basePath: ${basePath})`);
        }
      };
      const shouldNotExist = (fileName: string) => {
        if (fs.existsSync(path.resolve(basePath, fileName))) {
          throw new Error(`Did not expect ${fileName} to be emitted (basePath: ${basePath})`);
        }
      };
      beforeEach(() => {
        const writeConfig = (dir: string) => {
          write(path.join(dir, 'tsconfig.json'), `
          {
            "angularCompilerOptions": {
              "generateCodeForLibraries": true,
              "enableSummariesForJit": true
            },
            "compilerOptions": {
              "target": "es5",
              "experimentalDecorators": true,
              "noImplicitAny": true,
              "moduleResolution": "node",
              "rootDir": "",
              "declaration": true,
              "lib": ["es6", "dom"],
              "baseUrl": ".",
              "paths": { "lib1/*": ["../lib1/*"], "lib2/*": ["../lib2/*"] },
              "typeRoots": []
            }
          }`);
        };

        // Lib 1
        writeConfig('lib1');
        write('lib1/module.ts', `
          import {NgModule} from '@angular/core';

          export function someFactory(): any { return null; }

          @NgModule({
            providers: [{provide: 'foo', useFactory: someFactory}]
          })
          export class Module {}
        `);

        // Lib 2
        writeConfig('lib2');
        write('lib2/module.ts', `
          export {Module} from 'lib1/module';
        `);

        // Application
        writeConfig('app');
        write('app/main.ts', `
          import {NgModule, Inject} from '@angular/core';
          import {Module} from 'lib2/module';

          @NgModule({
            imports: [Module]
          })
          export class AppModule {
            constructor(@Inject('foo') public foo: any) {}
          }
        `);
      });

      it('should be able to compile library 1', () => {
        expect(mainSync(['-p', path.join(basePath, 'lib1')], errorSpy)).toBe(0);
        shouldExist('lib1/module.js');
        shouldExist('lib1/module.ngsummary.json');
        shouldExist('lib1/module.ngsummary.js');
        shouldExist('lib1/module.ngsummary.d.ts');
        shouldExist('lib1/module.ngfactory.js');
        shouldExist('lib1/module.ngfactory.d.ts');
      });

      it('should be able to compile library 2', () => {
        expect(mainSync(['-p', path.join(basePath, 'lib1')], errorSpy)).toBe(0);
        expect(mainSync(['-p', path.join(basePath, 'lib2')], errorSpy)).toBe(0);
        shouldExist('lib2/module.js');
        shouldExist('lib2/module.ngsummary.json');
        shouldExist('lib2/module.ngsummary.js');
        shouldExist('lib2/module.ngsummary.d.ts');
        shouldExist('lib2/module.ngfactory.js');
        shouldExist('lib2/module.ngfactory.d.ts');
      });

      describe('building an application', () => {
        beforeEach(() => {
          expect(mainSync(['-p', path.join(basePath, 'lib1')], errorSpy)).toBe(0);
          expect(mainSync(['-p', path.join(basePath, 'lib2')], errorSpy)).toBe(0);
        });

        it('should build without error', () => {
          expect(mainSync(['-p', path.join(basePath, 'app')], errorSpy)).toBe(0);
          shouldExist('app/main.js');
        });
      });
    });
  });
});
