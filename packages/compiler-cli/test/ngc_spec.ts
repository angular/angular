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

import {main, readCommandLineAndConfiguration, watchMode} from '../src/main';

import {isInBazel, makeTempDir, setup} from './test_support';

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

  function writeConfig(tsconfig: string = '{"extends": "./tsconfig-base.json"}') {
    write('tsconfig.json', tsconfig);
  }

  beforeEach(() => {
    errorSpy = jasmine.createSpy('consoleError').and.callFake(console.error);
    if (isInBazel) {
      const support = setup();
      basePath = support.basePath;
      outDir = path.join(basePath, 'built');
      process.chdir(basePath);
      write = (fileName: string, content: string) => { support.write(fileName, content); };
    } else {
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
      outDir = path.resolve(basePath, 'built');
      const ngRootDir = getNgRootDir();
      const nodeModulesPath = path.resolve(basePath, 'node_modules');
      fs.mkdirSync(nodeModulesPath);
      fs.symlinkSync(
          path.resolve(ngRootDir, 'dist', 'all', '@angular'),
          path.resolve(nodeModulesPath, '@angular'));
      fs.symlinkSync(
          path.resolve(ngRootDir, 'node_modules', 'rxjs'), path.resolve(nodeModulesPath, 'rxjs'));
    }
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
  });

  it('should compile without errors', () => {
    writeConfig();
    write('test.ts', 'export const A = 1;');

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);
  });

  describe('errors', () => {

    beforeEach(() => { errorSpy.and.stub(); });

    it('should not print the stack trace if user input file does not exist', () => {
      writeConfig(`{
        "extends": "./tsconfig-base.json",
        "files": ["test.ts"]
      }`);

      const exitCode = main(['-p', basePath], errorSpy);
      expect(errorSpy).toHaveBeenCalledWith(
          `error TS6053: File '` + path.join(basePath, 'test.ts') + `' not found.` +
          '\n');
      expect(exitCode).toEqual(1);
    });

    it('should not print the stack trace if user input file is malformed', () => {
      writeConfig();
      write('test.ts', 'foo;');

      const exitCode = main(['-p', basePath], errorSpy);
      expect(errorSpy).toHaveBeenCalledWith(
          `test.ts(1,1): error TS2304: Cannot find name 'foo'.` +
          '\n');
      expect(exitCode).toEqual(1);
    });

    it('should not print the stack trace if cannot find the imported module', () => {
      writeConfig();
      write('test.ts', `import {MyClass} from './not-exist-deps';`);

      const exitCode = main(['-p', basePath], errorSpy);
      expect(errorSpy).toHaveBeenCalledWith(
          `test.ts(1,23): error TS2307: Cannot find module './not-exist-deps'.` +
          '\n');
      expect(exitCode).toEqual(1);
    });

    it('should not print the stack trace if cannot import', () => {
      writeConfig();
      write('empty-deps.ts', 'export const A = 1;');
      write('test.ts', `import {MyClass} from './empty-deps';`);

      const exitCode = main(['-p', basePath], errorSpy);
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

      const exitCode = main(['-p', basePath], errorSpy);
      expect(errorSpy).toHaveBeenCalledWith(
          'test.ts(3,9): error TS2349: Cannot invoke an expression whose type lacks a call signature. ' +
          'Type \'String\' has no compatible call signatures.\n');
      expect(exitCode).toEqual(1);
    });

    it('should print the stack trace on compiler internal errors', () => {
      write('test.ts', 'export const A = 1;');

      const exitCode = main(['-p', 'not-exist'], errorSpy);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.calls.mostRecent().args[0]).toContain('no such file or directory');
      expect(errorSpy.calls.mostRecent().args[0]).toMatch(/at Object\.(fs\.)?lstatSync/);
      expect(exitCode).toEqual(2);
    });

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

      const exitCode = main(['-p', basePath], errorSpy);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.calls.mostRecent().args[0]).toContain('mymodule.ts.MyComp.html');
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

      const exitCode = main(['-p', basePath], errorSpy);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.calls.mostRecent().args[0]).toContain('my.component.html(1,5):');
      expect(errorSpy.calls.mostRecent().args[0])
          .toContain(`Property 'unknownProp' does not exist on type 'MyComp'`);

      expect(exitCode).toEqual(1);
    });
  });

  describe('compile ngfactory files', () => {

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

      const exitCode = main(['-p', basePath], errorSpy);
      expect(exitCode).toEqual(0);

      expect(fs.existsSync(path.resolve(outDir, 'mymodule.ngfactory.js'))).toBe(true);

      if (isInBazel()) {
        // In bazel we use the packaged version so the factory is at the root and we
        // get the flattened factory.
        expect(fs.existsSync(
                   path.resolve(outDir, 'node_modules', '@angular', 'core', 'core.ngfactory.js')))
            .toBe(true);
      } else {
        expect(fs.existsSync(path.resolve(
                   outDir, 'node_modules', '@angular', 'core', 'src',
                   'application_module.ngfactory.js')))
            .toBe(true);
      }
    });

    describe('comments', () => {
      function compileAndRead(contents: string) {
        writeConfig(`{
          "extends": "./tsconfig-base.json",
          "files": ["mymodule.ts"],
          "angularCompilerOptions": {"allowEmptyCodegenFiles": true}
        }`);
        write('mymodule.ts', contents);

        const exitCode = main(['-p', basePath], errorSpy);
        expect(exitCode).toEqual(0);

        const modPath = path.resolve(outDir, 'mymodule.ngfactory.js');
        expect(fs.existsSync(modPath)).toBe(true);
        return fs.readFileSync(modPath, {encoding: 'UTF-8'});
      }

      it('should be added', () => {
        const contents = compileAndRead(`
        import {CommonModule} from '@angular/common';
        import {NgModule} from '@angular/core';

        @NgModule({
          imports: [CommonModule]
        })
        export class MyModule {}
      `);
        expect(contents).toContain('@fileoverview');
        expect(contents).toContain('generated by the Angular template compiler');
        expect(contents).toContain('@suppress {suspiciousCode');
      });

      it('should be merged with existing fileoverview comments', () => {
        const contents = compileAndRead(`/** Hello world. */

        import {CommonModule} from '@angular/common';
        import {NgModule} from '@angular/core';

        @NgModule({
          imports: [CommonModule]
        })
        export class MyModule {}
      `);
        expect(contents).toContain('Hello world.');
      });

      it('should only pick file comments', () => {
        const contents = compileAndRead(`
          /** Comment on class. */
          class MyClass {

          }
        `);
        expect(contents).toContain('@fileoverview');
        expect(contents).not.toContain('Comment on class.');
      });

      it('should not be merged with @license comments', () => {
        const contents = compileAndRead(`/** @license Some license. */

        import {CommonModule} from '@angular/common';
        import {NgModule} from '@angular/core';

        @NgModule({
          imports: [CommonModule]
        })
        export class MyModule {}
      `);
        expect(contents).toContain('@fileoverview');
        expect(contents).not.toContain('@license');
      });

      it('should be included in empty files', () => {
        const contents = compileAndRead(`/** My comment. */

        import {Inject, Injectable, Optional} from '@angular/core';

        @Injectable()
        export class NotAnAngularComponent {}
      `);
        expect(contents).toContain('My comment');
      });
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

      const exitCode = main(['-p', path.join(basePath, 'tsconfig.json')], errorSpy);
      expect(exitCode).toEqual(0);
      expect(fs.existsSync(path.resolve(outDir, 'mymodule.ngfactory.js'))).toBe(true);
      if (isInBazel()) {
        // In bazel we use the packaged version so the factory is at the root and we
        // get the flattened factory.
        expect(fs.existsSync(
                   path.resolve(outDir, 'node_modules', '@angular', 'core', 'core.ngfactory.js')))
            .toBe(true);
      } else {
        expect(fs.existsSync(path.resolve(
                   outDir, 'node_modules', '@angular', 'core', 'src',
                   'application_module.ngfactory.js')))
            .toBe(true);
      }
    });

    describe(`emit generated files depending on the source file`, () => {
      const modules = ['comp', 'directive', 'module'];
      beforeEach(() => {
        write('src/comp.ts', `
              import {Component, ViewEncapsulation} from '@angular/core';

              @Component({
                selector: 'comp-a',
                template: 'A',
                styleUrls: ['plain.css'],
                encapsulation: ViewEncapsulation.None
              })
              export class CompA {
              }

              @Component({
                selector: 'comp-b',
                template: 'B',
                styleUrls: ['emulated.css']
              })
              export class CompB {
              }`);
        write('src/plain.css', 'div {}');
        write('src/emulated.css', 'div {}');
        write('src/directive.ts', `
              import {Directive, Input} from '@angular/core';

              @Directive({
                selector: '[someDir]',
                host: {'[title]': 'someProp'},
              })
              export class SomeDirective {
                @Input() someProp: string;
              }`);
        write('src/module.ts', `
              import {NgModule} from '@angular/core';

              import {CompA, CompB} from './comp';
              import {SomeDirective} from './directive';

              @NgModule({
                declarations: [
                  CompA, CompB,
                  SomeDirective,
                ],
                exports: [
                  CompA, CompB,
                  SomeDirective,
                ],
              })
              export class SomeModule {
              }`);
      });

      function expectJsDtsMetadataJsonToExist() {
        modules.forEach(moduleName => {
          shouldExist(moduleName + '.js');
          shouldExist(moduleName + '.d.ts');
          shouldExist(moduleName + '.metadata.json');
        });
      }

      function expectAllGeneratedFilesToExist(enableSummariesForJit = true) {
        modules.forEach(moduleName => {
          if (/module|comp/.test(moduleName)) {
            shouldExist(moduleName + '.ngfactory.js');
            shouldExist(moduleName + '.ngfactory.d.ts');
          } else {
            shouldNotExist(moduleName + '.ngfactory.js');
            shouldNotExist(moduleName + '.ngfactory.d.ts');
          }
          if (enableSummariesForJit) {
            shouldExist(moduleName + '.ngsummary.js');
            shouldExist(moduleName + '.ngsummary.d.ts');
          } else {
            shouldNotExist(moduleName + '.ngsummary.js');
            shouldNotExist(moduleName + '.ngsummary.d.ts');
          }
          shouldExist(moduleName + '.ngsummary.json');
          shouldNotExist(moduleName + '.ngfactory.metadata.json');
          shouldNotExist(moduleName + '.ngsummary.metadata.json');
        });
        shouldExist('plain.css.ngstyle.js');
        shouldExist('plain.css.ngstyle.d.ts');
        shouldExist('emulated.css.shim.ngstyle.js');
        shouldExist('emulated.css.shim.ngstyle.d.ts');
      }

      it('should emit generated files from sources with summariesForJit', () => {
        writeConfig(`{
            "extends": "./tsconfig-base.json",
            "angularCompilerOptions": {
              "enableSummariesForJit": true
            },
            "include": ["src/**/*.ts"]
          }`);
        const exitCode = main(['-p', path.join(basePath, 'tsconfig.json')], errorSpy);
        expect(exitCode).toEqual(0);
        outDir = path.resolve(basePath, 'built', 'src');
        expectJsDtsMetadataJsonToExist();
        expectAllGeneratedFilesToExist(true);
      });

      it('should not emit generated files from sources without summariesForJit', () => {
        writeConfig(`{
            "extends": "./tsconfig-base.json",
            "angularCompilerOptions": {
              "enableSummariesForJit": false
            },
            "include": ["src/**/*.ts"]
          }`);
        const exitCode = main(['-p', path.join(basePath, 'tsconfig.json')], errorSpy);
        expect(exitCode).toEqual(0);
        outDir = path.resolve(basePath, 'built', 'src');
        expectJsDtsMetadataJsonToExist();
        expectAllGeneratedFilesToExist(false);
      });

      it('should emit generated files from libraries', () => {
        // first only generate .d.ts / .js / .metadata.json files
        writeConfig(`{
            "extends": "./tsconfig-base.json",
            "angularCompilerOptions": {
              "skipTemplateCodegen": true
            },
            "compilerOptions": {
              "outDir": "lib"
            },
            "include": ["src/**/*.ts"]
          }`);
        let exitCode = main(['-p', path.join(basePath, 'tsconfig.json')], errorSpy);
        expect(exitCode).toEqual(0);
        outDir = path.resolve(basePath, 'lib', 'src');
        modules.forEach(moduleName => {
          shouldExist(moduleName + '.js');
          shouldExist(moduleName + '.d.ts');
          shouldExist(moduleName + '.metadata.json');
          shouldNotExist(moduleName + '.ngfactory.js');
          shouldNotExist(moduleName + '.ngfactory.d.ts');
          shouldNotExist(moduleName + '.ngsummary.js');
          shouldNotExist(moduleName + '.ngsummary.d.ts');
          shouldNotExist(moduleName + '.ngsummary.json');
          shouldNotExist(moduleName + '.ngfactory.metadata.json');
          shouldNotExist(moduleName + '.ngsummary.metadata.json');
        });
        shouldNotExist('src/plain.css.ngstyle.js');
        shouldNotExist('src/plain.css.ngstyle.d.ts');
        shouldNotExist('src/emulated.css.shim.ngstyle.js');
        shouldNotExist('src/emulated.css.shim.ngstyle.d.ts');
        // Then compile again, using the previous .metadata.json as input.
        writeConfig(`{
            "extends": "./tsconfig-base.json",
            "angularCompilerOptions": {
              "skipTemplateCodegen": false,
              "enableSummariesForJit": true
            },
            "compilerOptions": {
              "outDir": "built"
            },
            "include": ["lib/**/*.d.ts"]
          }`);
        write('lib/src/plain.css', 'div {}');
        write('lib/src/emulated.css', 'div {}');
        exitCode = main(['-p', path.join(basePath, 'tsconfig.json')], errorSpy);
        expect(exitCode).toEqual(0);
        outDir = path.resolve(basePath, 'built', 'lib', 'src');
        expectAllGeneratedFilesToExist();
      });
    });

    describe('closure', () => {
      it('should not run tsickle by default', () => {
        writeConfig(`{
          "extends": "./tsconfig-base.json",
          "files": ["mymodule.ts"],
        }`);
        write('mymodule.ts', `
        import {NgModule, Component} from '@angular/core';

        @Component({template: ''})
        export class MyComp {}

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

        const exitCode = main(['-p', basePath], errorSpy);
        expect(exitCode).toEqual(0);

        const mymodulejs = path.resolve(outDir, 'mymodule.js');
        const mymoduleSource = fs.readFileSync(mymodulejs, 'utf8');
        expect(mymoduleSource).not.toContain('@fileoverview added by tsickle');
        expect(mymoduleSource).toContain('MyComp = __decorate');
        expect(mymoduleSource).not.toContain('MyComp.decorators = [');
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

        const exitCode = main(['-p', basePath], errorSpy);
        expect(exitCode).toEqual(0);

        const mymodulejs = path.resolve(outDir, 'mymodule.js');
        const mymoduleSource = fs.readFileSync(mymodulejs, 'utf8');
        expect(mymoduleSource).toContain('@fileoverview added by tsickle');
        expect(mymoduleSource).toContain('@param {?} p');
      });

      it('should add metadata as decorators', () => {
        writeConfig(`{
          "extends": "./tsconfig-base.json",
          "compilerOptions": {
            "emitDecoratorMetadata": true
          },
          "angularCompilerOptions": {
            "annotationsAs": "decorators"
          },
          "files": ["mymodule.ts"]
        }`);
        write('aclass.ts', `export class AClass {}`);
        write('mymodule.ts', `
          import {NgModule} from '@angular/core';
          import {AClass} from './aclass';

          @NgModule({declarations: []})
          export class MyModule {
            constructor(importedClass: AClass) {}
          }
        `);

        const exitCode = main(['-p', basePath], errorSpy);
        expect(exitCode).toEqual(0);

        const mymodulejs = path.resolve(outDir, 'mymodule.js');
        const mymoduleSource = fs.readFileSync(mymodulejs, 'utf8');
        expect(mymoduleSource).toContain('MyModule = __decorate([');
        expect(mymoduleSource).toContain(`import { AClass } from './aclass';`);
        expect(mymoduleSource).toContain(`__metadata("design:paramtypes", [AClass])`);
      });

      it('should add metadata as static fields', () => {
        // Note: Don't specify emitDecoratorMetadata here on purpose,
        // as regression test for https://github.com/angular/angular/issues/19916.
        writeConfig(`{
          "extends": "./tsconfig-base.json",
          "compilerOptions": {
            "emitDecoratorMetadata": false
          },
          "angularCompilerOptions": {
            "annotationsAs": "static fields"
          },
          "files": ["mymodule.ts"]
        }`);
        write('aclass.ts', `export class AClass {}`);
        write('mymodule.ts', `
          import {NgModule} from '@angular/core';
          import {AClass} from './aclass';

          @NgModule({declarations: []})
          export class MyModule {
            constructor(importedClass: AClass) {}
          }
        `);

        const exitCode = main(['-p', basePath], errorSpy);
        expect(exitCode).toEqual(0);

        const mymodulejs = path.resolve(outDir, 'mymodule.js');
        const mymoduleSource = fs.readFileSync(mymodulejs, 'utf8');
        expect(mymoduleSource).not.toContain('__decorate');
        expect(mymoduleSource).toContain('args: [{ declarations: [] },] }');
        expect(mymoduleSource).not.toContain(`__metadata`);
        expect(mymoduleSource).toContain(`import { AClass } from './aclass';`);
        expect(mymoduleSource).toContain(`{ type: AClass }`);
      });
    });

    it('should not rewrite imports when annotating with closure', () => {
      writeConfig(`{
        "extends": "./tsconfig-base.json",
        "compilerOptions": {
          "paths": {
            "submodule": ["./src/submodule/public_api.ts"]
          }
        },
        "angularCompilerOptions": {
          "annotateForClosureCompiler": true
        },
        "files": ["mymodule.ts"]
      }`);
      write('src/test.txt', ' ');
      write('src/submodule/public_api.ts', `
        export const A = 1;
      `);
      write('mymodule.ts', `
        import {NgModule, Component} from '@angular/core';
        import {A} from 'submodule';

        @Component({template: ''})
        export class MyComp {
          fn(p: any) { return A; }
        }

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
    `);

      const exitCode = main(['-p', basePath], errorSpy);
      expect(exitCode).toEqual(0);
      const mymodulejs = path.resolve(outDir, 'mymodule.js');
      const mymoduleSource = fs.readFileSync(mymodulejs, 'utf8');
      expect(mymoduleSource).toContain(`import { A } from 'submodule'`);
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
        const result = main(['-p', path.join(basePath, 'tsconfig.json')], errorSpy);
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
        expect(mymoduleSource).toContain('var factory = function () { return new Foo(); }');
        expect(mymoduleSource).toContain('var ɵ0 = factory;');
        expect(mymoduleSource).toContain('export { ɵ0 };');
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

      it('should lower an NgModule id', () => {
        write('mymodule.ts', `
          import {NgModule} from '@angular/core';

          @NgModule({
            id: (() => 'test')(),
          })
          export class MyModule {}
        `);
        expect(compile()).toEqual(0);

        const mymodulejs = path.resolve(outDir, 'mymodule.js');
        const mymoduleSource = fs.readFileSync(mymodulejs, 'utf8');
        expect(mymoduleSource).toContain('id: ɵ0');
        expect(mymoduleSource).toMatch(/ɵ0 = .*'test'/);
      });

      it('should lower loadChildren', () => {
        write('mymodule.ts', `
          import {Component, NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';
          
          export function foo(): string {
            console.log('side-effect');
            return 'test';
          }

          @Component({
            selector: 'route',
            template: 'route',
          })
          export class Route {}

          @NgModule({
            declarations: [Route],
            imports: [
              RouterModule.forRoot([
                {path: '', pathMatch: 'full', component: Route, loadChildren: foo()}
              ]),
            ]
          })
          export class MyModule {}
        `);
        expect(compile()).toEqual(0);

        const mymodulejs = path.resolve(outDir, 'mymodule.js');
        const mymoduleSource = fs.readFileSync(mymodulejs, 'utf8');
        expect(mymoduleSource).toContain('loadChildren: ɵ0');
        expect(mymoduleSource).toMatch(/ɵ0 = .*foo\(\)/);
      });

      it('should be able to lower supported expressions', () => {
        writeConfig(`{
          "extends": "./tsconfig-base.json",
          "files": ["module.ts"]
        }`);
        write('module.ts', `
          import {NgModule, InjectionToken} from '@angular/core';
          import {AppComponent} from './app';

          export interface Info {
            route: string;
            data: string;
          }

          export const T1 = new InjectionToken<string>('t1');
          export const T2 = new InjectionToken<string>('t2');
          export const T3 = new InjectionToken<number>('t3');
          export const T4 = new InjectionToken<Info[]>('t4');

          enum SomeEnum {
            OK,
            Cancel
          }

          function calculateString() {
            return 'someValue';
          }

          const routeLikeData = [{
             route: '/home',
             data: calculateString()
          }];

          @NgModule({
            declarations: [AppComponent],
            providers: [
              { provide: T1, useValue: calculateString() },
              { provide: T2, useFactory: () => 'someValue' },
              { provide: T3, useValue: SomeEnum.OK },
              { provide: T4, useValue: routeLikeData }
            ]
          })
          export class MyModule {}
        `);
        write('app.ts', `
          import {Component, Inject} from '@angular/core';
          import * as m from './module';

          @Component({
            selector: 'my-app',
            template: ''
          })
          export class AppComponent {
            constructor(
              @Inject(m.T1) private t1: string,
              @Inject(m.T2) private t2: string,
              @Inject(m.T3) private t3: number,
              @Inject(m.T4) private t4: m.Info[],
            ) {}
          }
        `);

        expect(main(['-p', basePath], errorSpy)).toBe(0);
        shouldExist('module.js');
      });

      it('should allow to use lowering with export *', () => {
        write('mymodule.ts', `
          import {NgModule} from '@angular/core';

          export * from './util';

          // Note: the lambda will be lowered into an exported expression
          @NgModule({providers: [{provide: 'aToken', useValue: () => 2}]})
          export class MyModule {}
        `);
        write('util.ts', `
          // Note: The lambda will be lowered into an exported expression
          const x = () => 2;

          export const y = x;
        `);

        expect(compile()).toEqual(0);

        const mymoduleSource = fs.readFileSync(path.resolve(outDir, 'mymodule.js'), 'utf8');
        expect(mymoduleSource).toContain('ɵ0');

        const utilSource = fs.readFileSync(path.resolve(outDir, 'util.js'), 'utf8');
        expect(utilSource).toContain('ɵ0');

        const mymoduleNgFactoryJs =
            fs.readFileSync(path.resolve(outDir, 'mymodule.ngfactory.js'), 'utf8');
        // check that the generated code refers to ɵ0 from mymodule, and not from util!
        expect(mymoduleNgFactoryJs).toContain(`import * as i1 from "./mymodule"`);
        expect(mymoduleNgFactoryJs).toContain(`"aToken", i1.ɵ0`);
      });
    });

    function writeFlatModule(outFile: string) {
      writeConfig(`
      {
        "extends": "./tsconfig-base.json",
        "angularCompilerOptions": {
          "flatModuleId": "flat_module",
          "flatModuleOutFile": "${outFile}",
          "skipTemplateCodegen": true,
          "enableResourceInlining": true
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
          ],
        })
        export class FlatModule {
        }`);
    }

    it('should be able to generate a flat module library', () => {
      writeFlatModule('index.js');

      const exitCode = main(['-p', path.join(basePath, 'tsconfig.json')], errorSpy);
      expect(exitCode).toEqual(0);
      shouldExist('index.js');
      shouldExist('index.metadata.json');
    });

    it('should downlevel templates in flat module metadata', () => {
      writeFlatModule('index.js');

      const exitCode = main(['-p', path.join(basePath, 'tsconfig.json')], errorSpy);
      expect(exitCode).toEqual(0);
      shouldExist('index.js');
      shouldExist('index.metadata.json');

      const metadataPath = path.resolve(outDir, 'index.metadata.json');
      const metadataSource = fs.readFileSync(metadataPath, 'utf8');
      expect(metadataSource).not.toContain('templateUrl');
      expect(metadataSource).toContain('<div>flat module component</div>');
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
        expect(main(['-p', path.join(basePath, 'tsconfig.json')], errorSpy)).toBe(0);
      });
    });

    it('should be able to compile multiple libraries with summaries', () => {
      // Note: we need to emit the generated code for the libraries
      // into the node_modules, as that is the only way that we
      // currently support when using summaries.
      // TODO(tbosch): add support for `paths` to our CompilerHost.fileNameToModuleName
      // and then use `paths` here instead of writing to node_modules.

      // Angular
      write('tsconfig-ng.json', `{
          "extends": "./tsconfig-base.json",
          "angularCompilerOptions": {
            "generateCodeForLibraries": true,
            "enableSummariesForJit": true
          },
          "compilerOptions": {
            "outDir": "."
          },
          "include": ["node_modules/@angular/core/**/*"],
          "exclude": [
            "node_modules/@angular/core/test/**",
            "node_modules/@angular/core/testing/**"
          ]
        }`);

      // Lib 1
      write('lib1/tsconfig-lib1.json', `{
          "extends": "../tsconfig-base.json",
          "angularCompilerOptions": {
            "generateCodeForLibraries": false,
            "enableSummariesForJit": true
          },
          "compilerOptions": {
            "rootDir": ".",
            "outDir": "../node_modules/lib1_built"
          }
        }`);
      write('lib1/module.ts', `
          import {NgModule} from '@angular/core';

          export function someFactory(): any { return null; }

          @NgModule({
            providers: [{provide: 'foo', useFactory: someFactory}]
          })
          export class Module {}
        `);
      write('lib1/class1.ts', `export class Class1 {}`);

      // Lib 2
      write('lib2/tsconfig-lib2.json', `{
          "extends": "../tsconfig-base.json",
          "angularCompilerOptions": {
            "generateCodeForLibraries": false,
            "enableSummariesForJit": true
          },
          "compilerOptions": {
            "rootDir": ".",
            "outDir": "../node_modules/lib2_built"
          }
        }`);
      write('lib2/module.ts', `
          export {Module} from 'lib1_built/module';
        `);
      write('lib2/class2.ts', `
        import {Class1} from 'lib1_built/class1';

        export class Class2 {
          constructor(class1: Class1) {}
        }
      `);

      // Application
      write('app/tsconfig-app.json', `{
          "extends": "../tsconfig-base.json",
          "angularCompilerOptions": {
            "generateCodeForLibraries": false,
            "enableSummariesForJit": true
          },
          "compilerOptions": {
            "rootDir": ".",
            "outDir": "../built/app"
          }
        }`);
      write('app/main.ts', `
          import {NgModule, Inject} from '@angular/core';
          import {Module} from 'lib2_built/module';

          @NgModule({
            imports: [Module]
          })
          export class AppModule {
            constructor(@Inject('foo') public foo: any) {}
          }
        `);

      if (!isInBazel()) {
        // This is not necessary in bazel as it uses the npm_package
        expect(main(['-p', path.join(basePath, 'tsconfig-ng.json')], errorSpy)).toBe(0);
      }
      expect(main(['-p', path.join(basePath, 'lib1', 'tsconfig-lib1.json')], errorSpy)).toBe(0);
      expect(main(['-p', path.join(basePath, 'lib2', 'tsconfig-lib2.json')], errorSpy)).toBe(0);
      expect(main(['-p', path.join(basePath, 'app', 'tsconfig-app.json')], errorSpy)).toBe(0);

      // library 1
      // make `shouldExist` / `shouldNotExist` relative to `node_modules`
      outDir = path.resolve(basePath, 'node_modules');
      shouldExist('lib1_built/module.js');
      shouldExist('lib1_built/module.ngsummary.json');
      shouldExist('lib1_built/module.ngsummary.js');
      shouldExist('lib1_built/module.ngsummary.d.ts');
      shouldExist('lib1_built/module.ngfactory.js');
      shouldExist('lib1_built/module.ngfactory.d.ts');

      // library 2
      // make `shouldExist` / `shouldNotExist` relative to `node_modules`
      outDir = path.resolve(basePath, 'node_modules');
      shouldExist('lib2_built/module.js');
      shouldExist('lib2_built/module.ngsummary.json');
      shouldExist('lib2_built/module.ngsummary.js');
      shouldExist('lib2_built/module.ngsummary.d.ts');
      shouldExist('lib2_built/module.ngfactory.js');
      shouldExist('lib2_built/module.ngfactory.d.ts');

      shouldExist('lib2_built/class2.ngsummary.json');
      shouldNotExist('lib2_built/class2.ngsummary.js');
      shouldNotExist('lib2_built/class2.ngsummary.d.ts');
      shouldExist('lib2_built/class2.ngfactory.js');
      shouldExist('lib2_built/class2.ngfactory.d.ts');

      // app
      // make `shouldExist` / `shouldNotExist` relative to `built`
      outDir = path.resolve(basePath, 'built');
      shouldExist('app/main.js');
    });

    if (!isInBazel()) {
      // This is an unnecessary test bazel as it always uses flat modules
      it('should be able to compile libraries with summaries and flat modules', () => {
        writeFiles();
        compile();

        // libraries
        // make `shouldExist` / `shouldNotExist` relative to `node_modules`
        outDir = path.resolve(basePath, 'node_modules');
        shouldExist('flat_module/index.ngfactory.js');
        shouldExist('flat_module/index.ngsummary.json');

        // app
        // make `shouldExist` / `shouldNotExist` relative to `built`
        outDir = path.resolve(basePath, 'built');
        shouldExist('app/main.ngfactory.js');

        const factory = fs.readFileSync(path.resolve(outDir, 'app/main.ngfactory.js')).toString();
        // reference to the module itself
        expect(factory).toMatch(/from "flat_module"/);
        // no reference to a deep file
        expect(factory).not.toMatch(/from "flat_module\//);

        function writeFiles() {
          createFlatModuleInNodeModules();

          // Angular + flat module
          write('tsconfig-lib.json', `{
            "extends": "./tsconfig-base.json",
            "angularCompilerOptions": {
              "generateCodeForLibraries": true
            },
            "compilerOptions": {
              "outDir": "."
            },
            "include": ["node_modules/@angular/core/**/*", "node_modules/flat_module/**/*"],
            "exclude": [
              "node_modules/@angular/core/test/**",
              "node_modules/@angular/core/testing/**"
            ]
          }`);

          // Application
          write('app/tsconfig-app.json', `{
            "extends": "../tsconfig-base.json",
            "angularCompilerOptions": {
              "generateCodeForLibraries": false
            },
            "compilerOptions": {
              "rootDir": ".",
              "outDir": "../built/app"
            }
          }`);
          write('app/main.ts', `
            import {NgModule} from '@angular/core';
            import {FlatModule} from 'flat_module';

            @NgModule({
              imports: [FlatModule]
            })
            export class AppModule {}
          `);
        }

        function createFlatModuleInNodeModules() {
          // compile the flat module
          writeFlatModule('index.js');
          expect(main(['-p', basePath], errorSpy)).toBe(0);

          // move the flat module output into node_modules
          const flatModuleNodeModulesPath = path.resolve(basePath, 'node_modules', 'flat_module');
          fs.renameSync(outDir, flatModuleNodeModulesPath);
          fs.renameSync(
              path.resolve(basePath, 'src/flat.component.html'),
              path.resolve(flatModuleNodeModulesPath, 'src/flat.component.html'));
          // and remove the sources.
          fs.renameSync(path.resolve(basePath, 'src'), path.resolve(basePath, 'flat_module_src'));
          fs.unlinkSync(path.resolve(basePath, 'public-api.ts'));

          // add a flatModuleIndexRedirect
          write('node_modules/flat_module/redirect.metadata.json', `{
            "__symbolic": "module",
            "version": 3,
            "metadata": {},
            "exports": [
              {
                "from": "./index"
              }
            ],
            "flatModuleIndexRedirect": true,
            "importAs": "flat_module"
          }`);
          write('node_modules/flat_module/redirect.d.ts', `export * from './index';`);
          // add a package.json to use the redirect
          write('node_modules/flat_module/package.json', `{"typings": "./redirect.d.ts"}`);
        }

        function compile() {
          expect(main(['-p', path.join(basePath, 'tsconfig-lib.json')], errorSpy)).toBe(0);
          expect(main(['-p', path.join(basePath, 'app', 'tsconfig-app.json')], errorSpy)).toBe(0);
        }
      });
    }

    describe('enableResourceInlining', () => {
      it('should inline templateUrl and styleUrl in JS and metadata', () => {
        writeConfig(`{
          "extends": "./tsconfig-base.json",
          "files": ["mymodule.ts"],
          "angularCompilerOptions": {
            "enableResourceInlining": true
          }
        }`);
        write('my.component.ts', `
        import {Component} from '@angular/core';
        @Component({
          templateUrl: './my.component.html',
          styleUrls: ['./my.component.css'],
        })
        export class MyComp {}
      `);
        write('my.component.html', `<h1>Some template content</h1>`);
        write('my.component.css', `h1 {color: blue}`);
        write('mymodule.ts', `
        import {NgModule} from '@angular/core';
        import {MyComp} from './my.component';

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
      `);

        const exitCode = main(['-p', basePath]);
        expect(exitCode).toEqual(0);
        outDir = path.resolve(basePath, 'built');
        const outputJs = fs.readFileSync(path.join(outDir, 'my.component.js'), {encoding: 'utf-8'});
        expect(outputJs).not.toContain('templateUrl');
        expect(outputJs).not.toContain('styleUrls');
        expect(outputJs).toContain('Some template content');
        expect(outputJs).toContain('color: blue');

        const outputMetadata =
            fs.readFileSync(path.join(outDir, 'my.component.metadata.json'), {encoding: 'utf-8'});
        expect(outputMetadata).not.toContain('templateUrl');
        expect(outputMetadata).not.toContain('styleUrls');
        expect(outputMetadata).toContain('Some template content');
        expect(outputMetadata).toContain('color: blue');
      });
    });
  });


  describe('expression lowering', () => {
    const shouldExist = (fileName: string) => {
      if (!fs.existsSync(path.resolve(basePath, fileName))) {
        throw new Error(`Expected ${fileName} to be emitted (basePath: ${basePath})`);
      }
    };

    it('should be able to lower supported expressions', () => {
      writeConfig(`{
        "extends": "./tsconfig-base.json",
        "files": ["module.ts"]
      }`);
      write('module.ts', `
        import {NgModule, InjectionToken} from '@angular/core';
        import {AppComponent} from './app';

        export interface Info {
          route: string;
          data: string;
        }

        export const T1 = new InjectionToken<string>('t1');
        export const T2 = new InjectionToken<string>('t2');
        export const T3 = new InjectionToken<number>('t3');
        export const T4 = new InjectionToken<Info[]>('t4');

        enum SomeEnum {
          OK,
          Cancel
        }

        function calculateString() {
          return 'someValue';
        }

        const routeLikeData = [{
           route: '/home',
           data: calculateString()
        }];

        @NgModule({
          declarations: [AppComponent],
          providers: [
            { provide: T1, useValue: calculateString() },
            { provide: T2, useFactory: () => 'someValue' },
            { provide: T3, useValue: SomeEnum.OK },
            { provide: T4, useValue: routeLikeData }
          ]
        })
        export class MyModule {}
      `);
      write('app.ts', `
        import {Component, Inject} from '@angular/core';
        import * as m from './module';

        @Component({
          selector: 'my-app',
          template: ''
        })
        export class AppComponent {
          constructor(
            @Inject(m.T1) private t1: string,
            @Inject(m.T2) private t2: string,
            @Inject(m.T3) private t3: number,
            @Inject(m.T4) private t4: m.Info[],
          ) {}
        }
      `);

      expect(main(['-p', basePath], s => {})).toBe(0);
      shouldExist('built/module.js');
    });
  });

  describe('watch mode', () => {
    let timer: (() => void)|undefined = undefined;
    let results: ((message: string) => void)|undefined = undefined;
    let originalTimeout: number;

    function trigger() {
      const delay = 1000;
      setTimeout(() => {
        const t = timer;
        timer = undefined;
        if (!t) {
          fail('Unexpected state. Timer was not set.');
        } else {
          t();
        }
      }, delay);
    }

    function whenResults(): Promise<string> {
      return new Promise(resolve => {
        results = message => {
          resolve(message);
          results = undefined;
        };
      });
    }

    function errorSpy(message: string): void {
      if (results) results(message);
    }

    beforeEach(() => {
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
      const timerToken = 100;
      spyOn(ts.sys, 'setTimeout').and.callFake((callback: () => void) => {
        timer = callback;
        return timerToken;
      });
      spyOn(ts.sys, 'clearTimeout').and.callFake((token: number) => {
        if (token == timerToken) {
          timer = undefined;
        }
      });

      write('greet.html', `<p class="greeting"> Hello {{name}}!</p>`);
      write('greet.css', `p.greeting { color: #eee }`);
      write('greet.ts', `
        import {Component, Input} from '@angular/core';

        @Component({
          selector: 'greet',
          templateUrl: 'greet.html',
          styleUrls: ['greet.css']
        })
        export class Greet {
          @Input()
          name: string;
        }
      `);

      write('app.ts', `
        import {Component} from '@angular/core'

        @Component({
          selector: 'my-app',
          template: \`
            <div>
              <greet [name]='name'></greet>
            </div>
          \`,
        })
        export class App {
          name:string;
          constructor() {
            this.name = \`Angular!\`
          }
        }`);

      write('module.ts', `
        import {NgModule} from '@angular/core';
        import {Greet} from './greet';
        import {App} from './app';

        @NgModule({
          declarations: [Greet, App]
        })
        export class MyModule {}
      `);
    });

    afterEach(() => { jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout; });

    function writeAppConfig(location: string) {
      writeConfig(`{
            "extends": "./tsconfig-base.json",
            "compilerOptions": {
              "outDir": "${location}"
            }
          }`);
    }

    function expectRecompile(cb: () => void) {
      return (done: DoneFn) => {
        writeAppConfig('dist');
        const config = readCommandLineAndConfiguration(['-p', basePath]);
        const compile = watchMode(config.project, config.options, errorSpy);

        return new Promise(resolve => {
          compile.ready(() => {
            cb();

            // Allow the watch callbacks to occur and trigger the timer.
            trigger();

            // Expect the file to trigger a result.
            whenResults().then(message => {
              expect(message).toMatch(/File change detected/);
              compile.close();
              done();
              resolve();
            });
          });
        });
      };
    }

    it('should recompile when config file changes', expectRecompile(() => writeAppConfig('dist2')));

    it('should recompile when a ts file changes', expectRecompile(() => {
         write('greet.ts', `
          import {Component, Input} from '@angular/core';

          @Component({
            selector: 'greet',
            templateUrl: 'greet.html',
            styleUrls: ['greet.css'],
          })
          export class Greet {
            @Input()
            name: string;
            age: number;
          }
        `);
       }));

    it('should recompile when the html file changes',
       expectRecompile(() => { write('greet.html', '<p> Hello {{name}} again!</p>'); }));

    it('should recompile when the css file changes',
       expectRecompile(() => { write('greet.css', `p.greeting { color: blue }`); }));
  });

  describe('regressions', () => {
    //#20479
    it('should not generate an invalid metadata file', () => {
      write('src/tsconfig.json', `{
        "extends": "../tsconfig-base.json",
        "files": ["lib.ts"],
        "angularCompilerOptions": {
          "skipTemplateCodegen": true
        }
      }`);
      write('src/lib.ts', `
        export namespace A{
          export class C1 {
          }
          export interface I1{
          }
        }`);
      expect(main(['-p', path.join(basePath, 'src/tsconfig.json')])).toBe(0);
      shouldNotExist('src/lib.metadata.json');
    });

    //#19544
    it('should recognize @NgModule() directive with a redundant @Injectable()', () => {
      write('src/tsconfig.json', `{
        "extends": "../tsconfig-base.json",
        "compilerOptions": {
          "outDir": "../dist",
          "rootDir": ".",
          "rootDirs": [
            ".",
            "../dist"
          ]
        },
        "files": ["test-module.ts"]
      }`);
      write('src/test.component.ts', `
        import {Component} from '@angular/core';

        @Component({
          template: '<p>hello</p>',
        })
        export class TestComponent {}
      `);
      write('src/test-module.ts', `
        import {Injectable, NgModule} from '@angular/core';
        import {TestComponent} from './test.component';

        @NgModule({declarations: [TestComponent]})
        @Injectable()
        export class TestModule {}
      `);
      const messages: string[] = [];
      const exitCode =
          main(['-p', path.join(basePath, 'src/tsconfig.json')], message => messages.push(message));
      expect(exitCode).toBe(0, 'Compile failed unexpectedly.\n  ' + messages.join('\n  '));
    });

    // #19765
    it('should not report an error when the resolved .css file is in outside rootDir', () => {
      write('src/tsconfig.json', `{
        "extends": "../tsconfig-base.json",
        "compilerOptions": {
          "outDir": "../dist",
          "rootDir": ".",
          "rootDirs": [
            ".",
            "../dist"
          ]
        },
        "files": ["test-module.ts"]
      }`);
      write('src/lib/test.component.ts', `
        import {Component} from '@angular/core';

        @Component({
          template: '<p>hello</p>',
          styleUrls: ['./test.component.css']
        })
        export class TestComponent {}
      `);
      write('dist/dummy.txt', '');  // Force dist to be created
      write('dist/lib/test.component.css', `
        p { color: blue }
      `);
      write('src/test-module.ts', `
        import {NgModule} from '@angular/core';
        import {TestComponent} from './lib/test.component';

        @NgModule({declarations: [TestComponent]})
        export class TestModule {}
      `);
      const messages: string[] = [];
      const exitCode =
          main(['-p', path.join(basePath, 'src/tsconfig.json')], message => messages.push(message));
      expect(exitCode).toBe(0, 'Compile failed unexpectedly.\n  ' + messages.join('\n  '));
    });

    it('should emit all structural errors', () => {
      write('src/tsconfig.json', `{
        "extends": "../tsconfig-base.json",
        "files": ["test-module.ts"]
      }`);
      write('src/lib/indirect2.ts', `
        declare var f: any;
        export const t2 = f\`<p>hello</p>\`;
      `);
      write('src/lib/indirect1.ts', `
        import {t2} from './indirect2';
        export const t1 = t2 + ' ';
      `);
      write('src/lib/test.component.ts', `
        import {Component} from '@angular/core';
        import {t1} from './indirect1';

        @Component({
          template: t1
        })
        export class TestComponent {}
      `);
      write('src/test-module.ts', `
        import {NgModule} from '@angular/core';
        import {TestComponent} from './lib/test.component';

        @NgModule({declarations: [TestComponent]})
        export class TestModule {}
      `);
      const messages: string[] = [];
      const exitCode =
          main(['-p', path.join(basePath, 'src/tsconfig.json')], message => messages.push(message));
      expect(exitCode).toBe(1, 'Compile was expected to fail');
      expect(messages[0]).toContain('Tagged template expressions are not supported in metadata');
    });

    // Regression: #20076
    it('should report template error messages', () => {
      write('src/tsconfig.json', `{
        "extends": "../tsconfig-base.json",
        "files": ["test-module.ts"]
      }`);
      write('src/lib/test.component.ts', `
        import {Component} from '@angular/core';

        @Component({
          template: '{{thing.?stuff}}'
        })
        export class TestComponent {
          thing: string;
        }
      `);
      write('src/test-module.ts', `
        import {NgModule} from '@angular/core';
        import {TestComponent} from './lib/test.component';

        @NgModule({declarations: [TestComponent]})
        export class TestModule {}
      `);
      const messages: string[] = [];
      const exitCode =
          main(['-p', path.join(basePath, 'src/tsconfig.json')], message => messages.push(message));
      expect(exitCode).toBe(1, 'Compile was expected to fail');
      expect(messages[0]).toContain('Parser Error: Unexpected token');
    });

    // Regression test for #19979
    it('should not stack overflow on a recursive module export', () => {
      write('src/tsconfig.json', `{
        "extends": "../tsconfig-base.json",
        "files": ["test-module.ts"]
      }`);

      write('src/test-module.ts', `
        import {Component, NgModule} from '@angular/core';

        @Component({
          template: 'Hello'
        })
        export class MyFaultyComponent {}

        @NgModule({
          exports: [MyFaultyModule],
          declarations: [MyFaultyComponent],
          providers: [],
        })
        export class MyFaultyModule { }
      `);
      const messages: string[] = [];
      expect(
          main(['-p', path.join(basePath, 'src/tsconfig.json')], message => messages.push(message)))
          .toBe(1, 'Compile was expected to fail');
      expect(messages[0]).toContain(`module 'MyFaultyModule' is exported recursively`);
    });

    // Regression test for #19979
    it('should not stack overflow on a recursive module import', () => {
      write('src/tsconfig.json', `{
        "extends": "../tsconfig-base.json",
        "files": ["test-module.ts"]
      }`);

      write('src/test-module.ts', `
        import {Component, NgModule, forwardRef} from '@angular/core';

        @Component({
          template: 'Hello'
        })
        export class MyFaultyComponent {}

        @NgModule({
          imports: [forwardRef(() => MyFaultyModule)]
        })
        export class MyFaultyImport {}

        @NgModule({
          imports: [MyFaultyImport],
          declarations: [MyFaultyComponent]
        })
        export class MyFaultyModule { }
      `);
      const messages: string[] = [];
      expect(
          main(['-p', path.join(basePath, 'src/tsconfig.json')], message => messages.push(message)))
          .toBe(1, 'Compile was expected to fail');
      expect(messages[0]).toContain(`is imported recursively by the module 'MyFaultyImport`);
    });

    // Regression test for #21273
    it('should not report errors for unknown property annotations', () => {
      write('src/tsconfig.json', `{
        "extends": "../tsconfig-base.json",
        "files": ["test-module.ts"]
      }`);

      write('src/test-decorator.ts', `
        export function Convert(p: any): any {
          // Make sur this doesn't look like a macro function
          var r = p;
          return r;
        }
      `);
      write('src/test-module.ts', `
        import {Component, Input, NgModule} from '@angular/core';
        import {Convert} from './test-decorator';

        @Component({template: '{{name}}'})
        export class TestComponent {
          @Input() @Convert(convert) name: string;
        }

        function convert(n: any) { return n; }

        @NgModule({declarations: [TestComponent]})
        export class TestModule {}
      `);
      const messages: string[] = [];
      expect(
          main(['-p', path.join(basePath, 'src/tsconfig.json')], message => messages.push(message)))
          .toBe(0, `Compile failed:\n ${messages.join('\n    ')}`);
    });

    it('should allow using 2 classes with the same name in declarations with noEmitOnError=true',
       () => {
         write('src/tsconfig.json', `{
        "extends": "../tsconfig-base.json",
        "compilerOptions": {
          "noEmitOnError": true
        },
        "files": ["test-module.ts"]
      }`);
         function writeComp(fileName: string) {
           write(fileName, `
        import {Component} from '@angular/core';

        @Component({selector: 'comp', template: ''})
        export class TestComponent {}
      `);
         }
         writeComp('src/comp1.ts');
         writeComp('src/comp2.ts');
         write('src/test-module.ts', `
        import {NgModule} from '@angular/core';
        import {TestComponent as Comp1} from './comp1';
        import {TestComponent as Comp2} from './comp2';

        @NgModule({
          declarations: [Comp1, Comp2],
        })
        export class MyModule {}
      `);
         expect(main(['-p', path.join(basePath, 'src/tsconfig.json')])).toBe(0);
       });

    it('should not type check a .js files from node_modules with allowJs', () => {
      write('src/tsconfig.json', `{
        "extends": "../tsconfig-base.json",
        "compilerOptions": {
          "noEmitOnError": true,
          "allowJs": true,
          "declaration": false
        },
        "files": ["test-module.ts"]
      }`);
      write('src/test-module.ts', `
        import {Component, NgModule} from '@angular/core';
        import 'my-library';

        @Component({
          template: 'hello'
        })
        export class HelloCmp {}

        @NgModule({
          declarations: [HelloCmp],
        })
        export class MyModule {}
      `);
      write('src/node_modules/t.txt', ``);
      write('src/node_modules/my-library/index.js', `
        export someVar = 1;
        export someOtherVar = undefined + 1;
      `);
      expect(main(['-p', path.join(basePath, 'src/tsconfig.json')])).toBe(0);
    });
  });

  describe('formatted messages', () => {
    it('should emit a formatted error message for a structural error', () => {
      write('src/tsconfig.json', `{
        "extends": "../tsconfig-base.json",
        "files": ["test-module.ts"]
      }`);
      write('src/lib/indirect2.ts', `
        declare var f: any;

        export const t2 = f\`<p>hello</p>\`;
      `);
      write('src/lib/indirect1.ts', `
        import {t2} from './indirect2';
        export const t1 = t2 + ' ';
      `);
      write('src/lib/test.component.ts', `
        import {Component} from '@angular/core';
        import {t1} from './indirect1';

        @Component({
          template: t1,
          styleUrls: ['./test.component.css']
        })
        export class TestComponent {}
      `);
      write('src/test-module.ts', `
        import {NgModule} from '@angular/core';
        import {TestComponent} from './lib/test.component';

        @NgModule({declarations: [TestComponent]})
        export class TestModule {}
      `);
      const messages: string[] = [];
      const exitCode =
          main(['-p', path.join(basePath, 'src/tsconfig.json')], message => messages.push(message));
      expect(exitCode).toBe(1, 'Compile was expected to fail');
      expect(messages[0])
          .toEqual(`lib/test.component.ts(6,21): Error during template compile of 'TestComponent'
  Tagged template expressions are not supported in metadata in 't1'
    't1' references 't2' at lib/indirect1.ts(3,27)
      't2' contains the error at lib/indirect2.ts(4,27).
`);
    });
  });

  describe('ivy', () => {
    function emittedFile(name: string): string {
      const outputName = path.resolve(outDir, name);
      expect(fs.existsSync(outputName)).toBe(true);
      return fs.readFileSync(outputName, {encoding: 'UTF-8'});
    }

    it('should emit the hello world example', () => {
      write('tsconfig.json', `{
        "extends": "./tsconfig-base.json",
        "files": ["hello-world.ts"],
        "angularCompilerOptions": {
          "enableIvy": true
        }
      }`);

      write('hello-world.ts', `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'hello-world',
          template: 'Hello, world!'
        })
        export class HelloWorldComponent {

        }

        @NgModule({
          declarations: [HelloWorldComponent]
        })
        export class HelloWorldModule {}
      `);
      const exitCode = main(['-p', path.join(basePath, 'tsconfig.json')]);
      expect(exitCode).toBe(0, 'Compile failed');
      expect(emittedFile('hello-world.js')).toContain('ngComponentDef');
      expect(emittedFile('hello-world.js')).toContain('HelloWorldComponent_Factory');
    });

    it('should emit an injection of a string token', () => {
      write('tsconfig.json', `{
        "extends": "./tsconfig-base.json",
        "files": ["hello-world.ts"],
        "angularCompilerOptions": {
          "enableIvy": true
        }
      }`);

      write('hello-world.ts', `
        import {Component, Inject, NgModule} from '@angular/core';

        @Component({
          selector: 'hello-world',
          template: 'Hello, world!'
        })
        export class HelloWorldComponent {
          constructor (@Inject('test') private test: string) {}
        }

        @NgModule({
          declarations: [HelloWorldComponent],
          providers: [
            {provide: 'test', useValue: 'test'}
          ]
        })
        export class HelloWorldModule {}
      `);
      const errors: string[] = [];
      const exitCode = main(['-p', path.join(basePath, 'tsconfig.json')], msg => errors.push(msg));
      expect(exitCode).toBe(0, `Compile failed:\n${errors.join('\n  ')}`);
      expect(emittedFile('hello-world.js')).toContain('ngComponentDef');
    });

    it('should emit an example that uses the E() instruction', () => {
      write('tsconfig.json', `{
        "extends": "./tsconfig-base.json",
        "files": ["hello-world.ts"],
        "angularCompilerOptions": {
          "enableIvy": true
        }
      }`);

      write('hello-world.ts', `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'hello-world',
          template: '<h1><div style="text-align:center"> Hello, {{name}}! </div></h1> '
        })
        export class HelloWorldComponent {
          name = 'World';
        }

        @NgModule({declarations: [HelloWorldComponent]})
        export class HelloWorldModule {}
      `);
      const errors: string[] = [];
      const exitCode = main(['-p', path.join(basePath, 'tsconfig.json')], msg => errors.push(msg));
      expect(exitCode).toBe(0, `Compile failed:\n${errors.join('\n  ')}`);
      expect(emittedFile('hello-world.js')).toContain('ngComponentDef');
    });
  });

  describe('tree shakeable services', () => {

    function compileService(source: string): string {
      write('service.ts', source);

      const exitCode = main(['-p', path.join(basePath, 'tsconfig.json')], errorSpy);
      expect(exitCode).toEqual(0);

      const servicePath = path.resolve(outDir, 'service.js');
      return fs.readFileSync(servicePath, 'utf8');
    }

    beforeEach(() => {
      writeConfig(`{
        "extends": "./tsconfig-base.json",
        "files": ["service.ts"]
      }`);
      write('module.ts', `
        import {NgModule} from '@angular/core';

        @NgModule({})
        export class Module {}
      `);
    });

    describe(`doesn't break existing injectables`, () => {
      it('on simple services', () => {
        const source = compileService(`
        import {Injectable, NgModule} from '@angular/core';

        @Injectable()
        export class Service {
          constructor(public param: string) {}
        }

        @NgModule({
          providers: [{provide: Service, useValue: new Service('test')}],
        })
        export class ServiceModule {}
        `);
        expect(source).not.toMatch(/ngInjectableDef/);
      });
      it('on a service with a base class service', () => {
        const source = compileService(`
        import {Injectable, NgModule} from '@angular/core';

        @Injectable()
        export class Dep {}

        export class Base {
          constructor(private dep: Dep) {}
        }
        @Injectable()
        export class Service extends Base {}

        @NgModule({
          providers: [Service],
        })
        export class ServiceModule {}
        `);
        expect(source).not.toMatch(/ngInjectableDef/);
      });
    });

    it('compiles a basic InjectableDef', () => {
      const source = compileService(`
        import {Injectable} from '@angular/core';
        import {Module} from './module';

        @Injectable({
          providedIn: Module,
        })
        export class Service {}
      `);
      expect(source).toMatch(/ngInjectableDef = .+\.defineInjectable\(/);
      expect(source).toMatch(/ngInjectableDef.*token: Service/);
      expect(source).toMatch(/ngInjectableDef.*providedIn: .+\.Module/);
    });

    it('ngInjectableDef in es5 mode is annotated @nocollapse when closure options are enabled',
       () => {
         writeConfig(`{
        "extends": "./tsconfig-base.json",
        "angularCompilerOptions": {
          "annotateForClosureCompiler": true
        },
        "files": ["service.ts"]
      }`);
         const source = compileService(`
        import {Injectable} from '@angular/core';
        import {Module} from './module';

        @Injectable({
          providedIn: Module,
        })
        export class Service {}
      `);
         expect(source).toMatch(/\/\*\* @nocollapse \*\/ Service\.ngInjectableDef =/);
       });

    it('compiles a useValue InjectableDef', () => {
      const source = compileService(`
        import {Injectable} from '@angular/core';
        import {Module} from './module';

        export const CONST_SERVICE: Service = null;

        @Injectable({
          providedIn: Module,
          useValue: CONST_SERVICE
        })
        export class Service {}
      `);
      expect(source).toMatch(/ngInjectableDef.*return CONST_SERVICE/);
    });

    it('compiles a useExisting InjectableDef', () => {
      const source = compileService(`
        import {Injectable} from '@angular/core';
        import {Module} from './module';

        @Injectable()
        export class Existing {}

        @Injectable({
          providedIn: Module,
          useExisting: Existing,
        })
        export class Service {}
      `);
      expect(source).toMatch(/ngInjectableDef.*return ..\.inject\(Existing\)/);
    });

    it('compiles a useFactory InjectableDef with optional dep', () => {
      const source = compileService(`
        import {Injectable, Optional} from '@angular/core';
        import {Module} from './module';

        @Injectable()
        export class Existing {}

        @Injectable({
          providedIn: Module,
          useFactory: (existing: Existing|null) => new Service(existing),
          deps: [[new Optional(), Existing]],
        })
        export class Service {
          constructor(e: Existing|null) {}
        }
      `);
      expect(source).toMatch(/ngInjectableDef.*return ..\(..\.inject\(Existing, 8\)/);
    });

    it('compiles a useFactory InjectableDef with skip-self dep', () => {
      const source = compileService(`
        import {Injectable, SkipSelf} from '@angular/core';
        import {Module} from './module';

        @Injectable()
        export class Existing {}

        @Injectable({
          providedIn: Module,
          useFactory: (existing: Existing) => new Service(existing),
          deps: [[new SkipSelf(), Existing]],
        })
        export class Service {
          constructor(e: Existing) {}
        }
      `);
      expect(source).toMatch(/ngInjectableDef.*return ..\(..\.inject\(Existing, 4\)/);
    });

    it('compiles a service that depends on a token', () => {
      const source = compileService(`
        import {Inject, Injectable, InjectionToken} from '@angular/core';
        import {Module} from './module';

        export const TOKEN = new InjectionToken('desc', {providedIn: Module, factory: () => true});

        @Injectable({
          providedIn: Module,
        })
        export class Service {
          constructor(@Inject(TOKEN) value: boolean) {}
        }
      `);
      expect(source).toMatch(/ngInjectableDef = .+\.defineInjectable\(/);
      expect(source).toMatch(/ngInjectableDef.*token: Service/);
      expect(source).toMatch(/ngInjectableDef.*providedIn: .+\.Module/);
    });

    it('generates exports.* references when outputting commonjs', () => {
      writeConfig(`{
        "extends": "./tsconfig-base.json",
        "compilerOptions": {
          "module": "commonjs"
        },
        "files": ["service.ts"]
      }`);
      const source = compileService(`
        import {Inject, Injectable, InjectionToken} from '@angular/core';
        import {Module} from './module';

        export const TOKEN = new InjectionToken<string>('test token', {
          providedIn: 'root',
          factory: () => 'this is a test',
        });

        @Injectable({providedIn: 'root'})
        export class Service {
          constructor(@Inject(TOKEN) token: any) {}
        }
      `);
      expect(source).toMatch(/new Service\(i0\.inject\(exports\.TOKEN\)\);/);
    });
  });

  describe('ngInjectorDef', () => {
    it('is applied with lowered metadata', () => {
      writeConfig(`{
        "extends": "./tsconfig-base.json",
        "files": ["module.ts"],
        "angularCompilerOptions": {
          "enableIvy": true,
          "skipTemplateCodegen": true
        }
      }`);
      write('module.ts', `
        import {Injectable, NgModule} from '@angular/core';

        @Injectable()
        export class ServiceA {}

        @Injectable()
        export class ServiceB {}

        @NgModule()
        export class Exported {}

        @NgModule({
          providers: [ServiceA]
        })
        export class Imported {
          static forRoot() {
           console.log('not statically analyzable');
            return {
              ngModule: Imported,
              providers: [] as any,
            };
          }
        }

        @NgModule({
          providers: [ServiceA, ServiceB],
          imports: [Imported.forRoot()],
          exports: [Exported],
        })
        export class Module {}
      `);

      const exitCode = main(['-p', path.join(basePath, 'tsconfig.json')], errorSpy);
      expect(exitCode).toEqual(0);

      const modulePath = path.resolve(outDir, 'module.js');
      const moduleSource = fs.readFileSync(modulePath, 'utf8');
      expect(moduleSource)
          .toContain('var ɵ1 = [ServiceA, ServiceB], ɵ2 = [Imported.forRoot()], ɵ3 = [Exported];');
      expect(moduleSource)
          .toContain(
              'Imported.ngInjectorDef = i0.defineInjector({ factory: function Imported_Factory() { return new Imported(); }, providers: ɵ0, imports: [] });');
      expect(moduleSource)
          .toContain(
              'Module.ngInjectorDef = i0.defineInjector({ factory: function Module_Factory() { return new Module(); }, providers: ɵ1, imports: [ɵ2, ɵ3] });');
    });

    it('rewrites Injector to INJECTOR in Ivy factory functions ', () => {
      writeConfig(`{
        "extends": "./tsconfig-base.json",
        "files": ["service.ts"],
        "angularCompilerOptions": {
          "enableIvy": true
        }
      }`);

      write('service.ts', `
        import {Injectable, Injector} from '@angular/core';

        @Injectable()
        export class Service {
          constructor(private injector: Injector) {}
        }
      `);

      const exitCode = main(['-p', path.join(basePath, 'tsconfig.json')], errorSpy);
      expect(exitCode).toEqual(0);

      const modulePath = path.resolve(outDir, 'service.js');
      const moduleSource = fs.readFileSync(modulePath, 'utf8');
      expect(moduleSource).not.toMatch(/inject\(i0\.Injector/);
      expect(moduleSource).toMatch(/inject\(i0\.INJECTOR/);
    });
  });

  it('libraries should not break strictMetadataEmit', () => {
    // first only generate .d.ts / .js / .metadata.json files
    writeConfig(`{
        "extends": "./tsconfig-base.json",
        "angularCompilerOptions": {
          "skipTemplateCodegen": true,
          "strictMetadataEmit": true,
          "fullTemplateTypeCheck": true
        },
        "compilerOptions": {
          "outDir": "lib"
        },
        "files": ["main.ts", "test.d.ts"]
      }`);
    write('main.ts', `
        import {Test} from './test';
        export const bar = Test.bar;
    `);
    write('test.d.ts', `
        declare export class Test {
          static bar: string;
        }
    `);
    let exitCode = main(['-p', path.join(basePath, 'tsconfig.json')], errorSpy);
    expect(exitCode).toEqual(0);
  });
});
