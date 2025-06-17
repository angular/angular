/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgtscProgram} from '../../src/ngtsc/program';
import {CompilerOptions} from '../../src/transformers/api';
import {createCompilerHost} from '../../src/transformers/compiler_host';
import {platform} from 'os';
import ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../src/ngtsc/diagnostics';
import {absoluteFrom} from '../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';
import {
  restoreTypeScriptVersionForTesting,
  setTypeScriptVersionForTesting,
} from '../../src/typescript_support';

import {NgtscTestEnvironment} from './env';

const trim = (input: string): string => input.replace(/\s+/g, ' ').trim();

const varRegExp = (name: string): RegExp => new RegExp(`const \\w+ = \\[\"${name}\"\\];`);

const viewQueryRegExp = (predicate: string, flags: number, ref?: string): RegExp => {
  const maybeRef = ref ? `, ${ref}` : ``;
  return new RegExp(`i0\\.ɵɵviewQuery\\(${predicate}, ${flags}${maybeRef}\\)`);
};

const contentQueryRegExp = (predicate: string, flags: number, ref?: string): RegExp => {
  const maybeRef = ref ? `, ${ref}` : ``;
  return new RegExp(`i0\\.ɵɵcontentQuery\\(dirIndex, ${predicate}, ${flags}${maybeRef}\\)`);
};

const setClassMetadataRegExp = (expectedType: string): RegExp =>
  new RegExp(`setClassMetadata(.*?${expectedType}.*?)`);

const testFiles = loadStandardTestFiles();

function getDiagnosticSourceCode(diag: ts.Diagnostic): string {
  return diag.file!.text.slice(diag.start!, diag.start! + diag.length!);
}

runInEachFileSystem((os: string) => {
  describe('ngtsc behavioral tests', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should accept relative file paths as command line argument', () => {
      env.addCommandLineArgs('--rootDir', './rootDir');
      env.write('rootDir/test.html', '<p>Hello World</p>');
      env.write(
        'rootDir/test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          templateUrl: 'test.html',
          standalone: false,
        })
        export class TestCmp {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('Hello World');
    });

    it('should compile Injectables without errors', () => {
      env.write(
        'test.ts',
        `
        import {Injectable} from '@angular/core';

        @Injectable()
        export class Dep {}

        @Injectable()
        export class Service {
          constructor(dep: Dep) {}
        }
    `,
      );
      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('Dep.ɵprov =');
      expect(jsContents).toContain('Service.ɵprov =');
      expect(jsContents).not.toContain('__decorate');
      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain('static ɵprov: i0.ɵɵInjectableDeclaration<Dep>;');
      expect(dtsContents).toContain('static ɵprov: i0.ɵɵInjectableDeclaration<Service>;');
      expect(dtsContents).toContain('static ɵfac: i0.ɵɵFactoryDeclaration<Dep, never>;');
      expect(dtsContents).toContain('static ɵfac: i0.ɵɵFactoryDeclaration<Service, never>;');
    });

    it('should compile Injectables with a generic service', () => {
      env.write(
        'test.ts',
        `
        import {Injectable} from '@angular/core';

        @Injectable()
        export class Store<T> {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('Store.ɵprov =');
      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain('static ɵfac: i0.ɵɵFactoryDeclaration<Store<any>, never>;');
      expect(dtsContents).toContain('static ɵprov: i0.ɵɵInjectableDeclaration<Store<any>>;');
    });

    it('should compile Injectables with providedIn without errors', () => {
      env.write(
        'test.ts',
        `
        import {Injectable} from '@angular/core';

        @Injectable()
        export class Dep {}

        @Injectable({ providedIn: 'root' })
        export class Service {
          constructor(dep: Dep) {}
        }
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('Dep.ɵprov =');
      expect(jsContents).toContain('Service.ɵprov =');
      expect(jsContents).toContain(
        'Service.ɵfac = function Service_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Service)(i0.ɵɵinject(Dep)); };',
      );
      expect(jsContents).toContain("providedIn: 'root' })");
      expect(jsContents).not.toContain('__decorate');
      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain('static ɵprov: i0.ɵɵInjectableDeclaration<Dep>;');
      expect(dtsContents).toContain('static ɵprov: i0.ɵɵInjectableDeclaration<Service>;');
      expect(dtsContents).toContain('static ɵfac: i0.ɵɵFactoryDeclaration<Dep, never>;');
      expect(dtsContents).toContain('static ɵfac: i0.ɵɵFactoryDeclaration<Service, never>;');
    });

    it('should compile Injectables with providedIn and factory without errors', () => {
      env.write(
        'test.ts',
        `
        import {Injectable} from '@angular/core';

        @Injectable({ providedIn: 'root', useFactory: () => new Service() })
        export class Service {
          constructor() {}
        }
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('Service.ɵprov =');
      expect(jsContents).toContain('factory: () => (() => new Service())()');
      expect(jsContents).toContain(
        'Service_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Service)(); }',
      );
      expect(jsContents).toContain(", providedIn: 'root' });");
      expect(jsContents).not.toContain('__decorate');
      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain('static ɵprov: i0.ɵɵInjectableDeclaration<Service>;');
      expect(dtsContents).toContain('static ɵfac: i0.ɵɵFactoryDeclaration<Service, never>;');
    });

    it('should compile Injectables with providedIn and factory with deps without errors', () => {
      env.write(
        'test.ts',
        `
        import {Injectable} from '@angular/core';

        @Injectable()
        export class Dep {}

        @Injectable({ providedIn: 'root', useFactory: (dep: Dep) => new Service(dep), deps: [Dep] })
        export class Service {
          constructor(dep: Dep) {}
        }
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('Service.ɵprov =');
      expect(jsContents).toContain(
        'factory: function Service_Factory(__ngFactoryType__) { let __ngConditionalFactory__ = null; if (__ngFactoryType__) {',
      );
      expect(jsContents).toContain('return new (__ngFactoryType__ || Service)(i0.ɵɵinject(Dep));');
      expect(jsContents).toContain(
        '__ngConditionalFactory__ = ((dep) => new Service(dep))(i0.ɵɵinject(Dep));',
      );
      expect(jsContents).toContain("return __ngConditionalFactory__; }, providedIn: 'root' });");
      expect(jsContents).not.toContain('__decorate');
      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain('static ɵprov: i0.ɵɵInjectableDeclaration<Service>;');
      expect(dtsContents).toContain('static ɵfac: i0.ɵɵFactoryDeclaration<Service, never>;');
    });

    it('should compile Injectables with providedIn and factory with deps with array literal tokens', () => {
      env.write(
        'test.ts',
        `
        import {Injectable, Optional, Self} from '@angular/core';

        @Injectable()
        export class Dep {}

        @Injectable({
          providedIn: 'root',
          useFactory: (dep: Dep) => new Service(dep),
          deps: [[new Optional(), new Self(), Dep]],
        })
        export class Service {
          constructor(dep: Dep) {}
        }
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('Service.ɵprov =');
      expect(jsContents).toContain(
        'factory: function Service_Factory(__ngFactoryType__) { let __ngConditionalFactory__ = null; if (__ngFactoryType__) {',
      );
      expect(jsContents).toContain('return new (__ngFactoryType__ || Service)(i0.ɵɵinject(Dep));');
      expect(jsContents).toContain(
        '__ngConditionalFactory__ = ((dep) => new Service(dep))(i0.ɵɵinject(Dep, 10));',
      );
      expect(jsContents).toContain(`return __ngConditionalFactory__; }, providedIn: 'root' });`);
      expect(jsContents).not.toContain('__decorate');
      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain('static ɵprov: i0.ɵɵInjectableDeclaration<Service>;');
      expect(dtsContents).toContain('static ɵfac: i0.ɵɵFactoryDeclaration<Service, never>;');
    });

    it('should compile Injectables with providedIn using forwardRef without errors', () => {
      env.write(
        'test.ts',
        `
        import {Injectable, NgModule, forwardRef} from '@angular/core';

        @Injectable()
        export class Dep {}

        @Injectable({ providedIn: forwardRef(() => Mod) })
        export class Service {
          constructor(dep: Dep) {}
        }

        @NgModule()
        export class Mod {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('Dep.ɵprov =');
      expect(jsContents).toContain('Service.ɵprov =');
      expect(jsContents).toContain('Mod.ɵmod =');
      expect(jsContents).toContain(
        'Service.ɵfac = function Service_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Service)(i0.ɵɵinject(Dep)); };',
      );
      expect(jsContents).toContain('providedIn: i0.forwardRef(() => Mod) })');
      expect(jsContents).not.toContain('__decorate');
      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain('static ɵprov: i0.ɵɵInjectableDeclaration<Dep>;');
      expect(dtsContents).toContain('static ɵprov: i0.ɵɵInjectableDeclaration<Service>;');
      expect(dtsContents).toContain('static ɵfac: i0.ɵɵFactoryDeclaration<Dep, never>;');
      expect(dtsContents).toContain('static ɵfac: i0.ɵɵFactoryDeclaration<Service, never>;');
      expect(dtsContents).toContain('i0.ɵɵFactoryDeclaration<Mod, never>;');
    });

    it('should compile @Injectable with an @Optional dependency', () => {
      env.write(
        'test.ts',
        `
      import {Injectable, Optional as Opt} from '@angular/core';

      @Injectable()
      class Dep {}

      @Injectable()
      class Service {
        constructor(@Opt() dep: Dep) {}
      }
    `,
      );
      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('inject(Dep, 8)');
    });

    it('should compile @Injectable with constructor overloads', () => {
      env.write(
        'test.ts',
        `
      import {Injectable, Optional} from '@angular/core';

      @Injectable()
      class Dep {}

      @Injectable()
      class OptionalDep {}

      @Injectable()
      class Service {
        constructor(dep: Dep);

        constructor(dep: Dep, @Optional() optionalDep?: OptionalDep) {}
      }
    `,
      );
      env.driveMain();
      const jsContents = env.getContents('test.js');

      expect(jsContents).toContain(
        `Service.ɵfac = function Service_Factory(__ngFactoryType__) { ` +
          `return new (__ngFactoryType__ || Service)(i0.ɵɵinject(Dep), i0.ɵɵinject(OptionalDep, 8)); };`,
      );
    });

    it('should compile Directives without errors', () => {
      env.write(
        'test.ts',
        `
        import {Directive} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: false,
        })
        export class TestDir {}
      `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('TestDir.ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective');
      expect(jsContents).toContain('TestDir.ɵfac = function');
      expect(jsContents).not.toContain('__decorate');

      const dtsContents = env.getContents('test.d.ts');
      const expectedDirectiveDeclaration =
        'static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, "[dir]", never, {}, {}, never, never, false, never>';
      expect(dtsContents).toContain(expectedDirectiveDeclaration);
      expect(dtsContents).toContain('static ɵfac: i0.ɵɵFactoryDeclaration<TestDir, never>');
    });

    it('should compile abstract Directives without errors', () => {
      env.write(
        'test.ts',
        `
        import {Directive} from '@angular/core';

        @Directive()
        export class TestDir {}
      `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('TestDir.ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective');
      expect(jsContents).toContain('TestDir.ɵfac = function');
      expect(jsContents).not.toContain('__decorate');

      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain(
        'static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, never, never, {}, {}, never, never, true, never>',
      );
      expect(dtsContents).toContain('static ɵfac: i0.ɵɵFactoryDeclaration<TestDir, never>');
    });

    it('should compile Components (inline template) without errors', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: 'this is a test',
          standalone: false,
        })
        export class TestCmp {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('TestCmp.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent');
      expect(jsContents).toContain('TestCmp.ɵfac = function');
      expect(jsContents).not.toContain('__decorate');

      const dtsContents = env.getContents('test.d.ts');
      const expectedComponentDeclaration =
        'static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, never, never, false, never>';
      expect(dtsContents).toContain(expectedComponentDeclaration);
      expect(dtsContents).toContain('static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never>');
    });

    it('should compile Components (dynamic inline template) without errors', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: 'this is ' + 'a test',
          standalone: false,
        })
        export class TestCmp {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('TestCmp.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent');
      expect(jsContents).toContain('TestCmp.ɵfac = function');
      expect(jsContents).not.toContain('__decorate');

      const dtsContents = env.getContents('test.d.ts');

      expect(dtsContents).toContain(
        'static ɵcmp: i0.ɵɵComponentDeclaration' +
          '<TestCmp, "test-cmp", never, {}, {}, never, never, false, never>',
      );
      expect(dtsContents).toContain('static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never>');
    });

    it('should compile Components (function call inline template) without errors', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        function getTemplate() {
          return 'this is a test';
        }
        @Component({
          selector: 'test-cmp',
          template: getTemplate(),
          standalone: false,
        })
        export class TestCmp {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('TestCmp.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent');
      expect(jsContents).toContain('TestCmp.ɵfac = function');
      expect(jsContents).not.toContain('__decorate');

      const dtsContents = env.getContents('test.d.ts');
      const expectedComponentDeclaration =
        'static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, never, never, false, never>';
      expect(dtsContents).toContain(expectedComponentDeclaration);
      expect(dtsContents).toContain('static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never>');
    });

    it('should compile Components (external template) without errors', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          templateUrl: './dir/test.html',
          standalone: false,
        })
        export class TestCmp {}
    `,
      );
      env.write('dir/test.html', '<p>Hello World</p>');

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('Hello World');
    });

    it('should not report that broken components in modules are not components', () => {
      env.write(
        'test.ts',
        `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'broken-cmp',
          template: '{{ broken = "true" }}', // assignment not legal in this context
          standalone: false,
        })
        export class BrokenCmp {}

        @NgModule({
          declarations: [BrokenCmp],
        })
        export class Module {
          broken = "false";
        }
      `,
      );

      const diags = env.driveDiagnostics();
      if (diags.some((diag) => diag.code === ngErrorCode(ErrorCode.NGMODULE_INVALID_DECLARATION))) {
        fail('Should not produce a diagnostic that BrokenCmp is not a component');
      }
    });

    it('should only list public declarations in NgModule .d.ts when requested', () => {
      env.tsconfig({
        onlyPublishPublicTypingsForNgModules: true,
      });
      env.write(
        'test.ts',
        `
            import {Directive, NgModule} from '@angular/core';

            @Directive({
              selector: 'internal',
              standalone: false,
            })
            export class InternalDir {}

            @Directive({
              selector: 'external',
              standalone: false,
            })
            export class ExternalDir {}

            @NgModule({
              declarations: [InternalDir, ExternalDir],
              exports: [ExternalDir],
            })
            export class Module {}
          `,
      );

      env.driveMain();
      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain(
        'static ɵmod: i0.ɵɵNgModuleDeclaration<Module, ' +
          '[typeof ExternalDir], never, [typeof ExternalDir]>',
      );
    });

    it('should not list imports in NgModule .d.ts when requested', () => {
      env.tsconfig({
        onlyPublishPublicTypingsForNgModules: true,
      });
      env.write(
        'test.ts',
        `
            import {Directive, NgModule} from '@angular/core';

            @Directive({
              selector: 'internal',
              standalone: false,
            })
            export class InternalDir {}

            @NgModule({
              declarations: [InternalDir],
              exports: [InternalDir],
            })
            export class DepModule {}

            @Directive({
              selector: 'external',
              standalone: false,
            })
            export class ExternalDir {}

            @NgModule({
              imports: [DepModule],
            })
            export class Module {}
          `,
      );

      env.driveMain();
      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain(
        'static ɵmod: i0.ɵɵNgModuleDeclaration<Module, ' + 'never, never, never>',
      );
    });

    it('should error when supportJitMode is false and forbidOrphanComponents is true', () => {
      env.tsconfig({
        supportJitMode: false,
        forbidOrphanComponents: true,
      });
      env.write('test.ts', '');

      const diagnostics = env.driveDiagnostics();

      expect(diagnostics).toEqual([
        jasmine.objectContaining({
          messageText: jasmine.stringMatching(
            /JIT mode support \("supportJitMode" option\) cannot be disabled when forbidOrphanComponents is set to true/,
          ),
        }),
      ]);
    });

    it('should run JIT transform for components marked as `jit: true`', () => {
      env.write(
        'test.ts',
        `
        import {Component, input} from '@angular/core';

        @Component({
          template: '<non-existent />',
          jit: true,
        })
        class MyTestComponent {
          name = input('John');
        }

        @Component({
          template: '',
        })
        class NonJitComponent {
          nonJitInput = input(true);
        }
      `,
      );

      env.driveMain();

      expect(trim(env.getContents('test.js'))).toContain(
        trim(`
        MyTestComponent.propDecorators = {
          name: [{ type: i0.Input, args: [{ isSignal: true, alias: "name", required: false, transform: undefined },] }]
        };
      `),
      );
      expect(env.getContents('test.js')).not.toContain('NonJitComponent.propDecorators');
    });

    it('should run JIT transform for `NgModule` marked as `jit: true`', () => {
      env.write(
        'test.ts',
        `
        import {NgModule, Injector} from '@angular/core';

        @NgModule({
          jit: true
        })
        class MyJitModule {
          constructor(dep: Injector) {}
        }

        @NgModule({})
        class NonJitModule {
          constructor(dep: Injector) {}
        }
      `,
      );

      env.driveMain();

      expect(trim(env.getContents('test.js'))).toContain(
        trim(`
        MyJitModule.ctorParameters = () => [
          { type: Injector }
        ];`),
      );
      expect(env.getContents('test.js')).not.toContain('NonJitModule.ctorParameters');
    });

    // This test triggers the Tsickle compiler which asserts that the file-paths
    // are valid for the real OS. When on non-Windows systems it doesn't like paths
    // that start with `C:`.
    if (os !== 'Windows' || platform() === 'win32') {
      describe('when closure annotations are requested', () => {
        it('should add @pureOrBreakMyCode to getInheritedFactory calls', () => {
          env.tsconfig({
            'annotateForClosureCompiler': true,
          });
          env.write(
            `test.ts`,
            `
            import {Directive} from '@angular/core';

            @Directive({
              selector: '[base]',
            })
            class Base {}

            @Directive({
              selector: '[test]',
            })
            class Dir extends Base {
            }
        `,
          );

          env.driveMain();

          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain('Dir.ɵfac = /** @pureOrBreakMyCode */ (() => {');
          expect(jsContents).toContain(
            '(ɵDir_BaseFactory || (ɵDir_BaseFactory = i0.ɵɵgetInheritedFactory(Dir)))(__ngFactoryType__ || Dir);',
          );
        });

        it('should add @nocollapse to static fields', () => {
          env.tsconfig({
            'annotateForClosureCompiler': true,
          });
          env.write(
            'test.ts',
            `
            import {Component} from '@angular/core';

            @Component({
              selector: 'test-cmp',
              templateUrl: './dir/test.html',
            })
            export class TestCmp {}
          `,
          );
          env.write('dir/test.html', '<p>Hello World</p>');

          env.driveMain();

          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain('/** @nocollapse */ TestCmp.ɵcmp');
        });

        it('should still perform schema checks in embedded views', () => {
          env.tsconfig({
            'fullTemplateTypeCheck': false,
            'annotateForClosureCompiler': true,
          });
          env.write(
            'test.ts',
            `
            import {Component, Directive, NgModule} from '@angular/core';

            @Component({
              selector: 'test-cmp',
              template: \`
                <ng-template>
                  <some-dir>Has a directive, should be okay</some-dir>
                  <not-a-cmp>Should trigger a schema error</not-a-cmp>
                </ng-template>
              \`,
              standalone: false,
            })
            export class TestCmp {}

            @Directive({
              selector: 'some-dir',
              standalone: false,
            })
            export class TestDir {}

            @NgModule({
              declarations: [TestCmp, TestDir],
            })
            export class TestModule {}
          `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(diags[0].code).toBe(ngErrorCode(ErrorCode.SCHEMA_INVALID_ELEMENT));
          expect(ts.flattenDiagnosticMessageText(diags[0].messageText, '\n')).toContain(
            'not-a-cmp',
          );
        });
        /**
         * The following set of tests verify that after Tsickle run we do not have cases
         * which trigger automatic semicolon insertion, which breaks the code. In order
         * to avoid the problem, we wrap all function expressions in certain fields
         * ("providers" and "viewProviders") in parentheses. More info on Tsickle
         * processing related to this case can be found here:
         * https://github.com/angular/tsickle/blob/d7974262571c8a17d684e5ba07680e1b1993afdd/src/jsdoc_transformer.ts#L1021
         */
        describe('wrap functions in certain fields in parentheses', () => {
          const providers = `
            [{
              provide: 'token-a',
              useFactory: (service: Service) => {
                return () => service.id;
              }
            }, {
              provide: 'token-b',
              useFactory: function(service: Service) {
                return function() {
                  return service.id;
                }
              }
            }]
          `;

          const service = `
              export class Service {
                id: string = 'service-id';
              }
            `;

          const verifyOutput = (jsContents: string) => {
            // verify that there is no pattern that triggers automatic semicolon
            // insertion by checking that there are no function return statements
            // not wrapped in parentheses
            expect(trim(jsContents)).not.toMatch(/return\s+function/);
            expect(trim(jsContents)).toContain(
              trim(`
              [{
                  provide: 'token-a',
                  useFactory: ((service) => {
                      return (() => service.id);
                  })
              }, {
                  provide: 'token-b',
                  useFactory: (function (service) {
                      return (function () { return service.id; });
                  })
              }]
            `),
            );
          };

          it('should wrap functions in "providers" list in NgModule', () => {
            env.tsconfig({
              'annotateForClosureCompiler': true,
            });
            env.write('service.ts', service);
            env.write(
              'test.ts',
              `
              import {NgModule} from '@angular/core';
              import {Service} from './service';

              @NgModule({
                providers: ${providers}
              })
              export class SomeModule {}
            `,
            );

            env.driveMain();
            verifyOutput(env.getContents('test.js'));
          });

          it('should wrap functions in "providers" list in Component', () => {
            env.tsconfig({
              'annotateForClosureCompiler': true,
            });
            env.write('service.ts', service);
            env.write(
              'test.ts',
              `
              import {Component} from '@angular/core';
              import {Service} from './service';

              @Component({
                template: '...',
                providers: ${providers}
              })
              export class SomeComponent {}
            `,
            );

            env.driveMain();
            verifyOutput(env.getContents('test.js'));
          });

          it('should wrap functions in "viewProviders" list in Component', () => {
            env.tsconfig({
              'annotateForClosureCompiler': true,
            });
            env.write('service.ts', service);
            env.write(
              'test.ts',
              `
              import {Component} from '@angular/core';
              import {Service} from './service';

              @Component({
                template: '...',
                viewProviders: ${providers}
              })
              export class SomeComponent {}
            `,
            );

            env.driveMain();
            verifyOutput(env.getContents('test.js'));
          });

          it('should wrap functions in "providers" list in Directive', () => {
            env.tsconfig({
              'annotateForClosureCompiler': true,
            });
            env.write('service.ts', service);
            env.write(
              'test.ts',
              `
              import {Directive} from '@angular/core';
              import {Service} from './service';

              @Directive({
                providers: ${providers}
              })
              export class SomeDirective {}
            `,
            );

            env.driveMain();
            verifyOutput(env.getContents('test.js'));
          });
        });
      });
    }

    it('should recognize aliased decorators', () => {
      env.write(
        'test.ts',
        `
      import {
        Component as AngularComponent,
        Directive as AngularDirective,
        Pipe as AngularPipe,
        Injectable as AngularInjectable,
        NgModule as AngularNgModule,
        Input as AngularInput,
        Output as AngularOutput
      } from '@angular/core';

      @AngularDirective()
      export class TestBase {
        @AngularInput() input: any;
        @AngularOutput() output: any;
      }

      @AngularComponent({
        selector: 'test-component',
        template: '...',
        standalone: false,
      })
      export class TestComponent {
        @AngularInput() input: any;
        @AngularOutput() output: any;
      }

      @AngularDirective({
        selector: 'test-directive',
        standalone: false,
      })
      export class TestDirective {}

      @AngularPipe({
        name: 'test-pipe',
        standalone: false,
      })
      export class TestPipe {}

      @AngularInjectable()
      export class TestInjectable {}

      @AngularNgModule({
        declarations: [
          TestComponent,
          TestDirective,
          TestPipe
        ],
        exports: [
          TestComponent,
          TestDirective,
          TestPipe
        ]
      })
      class MyModule {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('TestBase.ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective');
      expect(jsContents).toContain('TestComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent');
      expect(jsContents).toContain('TestDirective.ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective');
      expect(jsContents).toContain('TestPipe.ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe');
      expect(jsContents).toContain('TestInjectable.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable');
      expect(jsContents).toContain('MyModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule');
      expect(jsContents).toContain('MyModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector');
      expect(jsContents).toContain('inputs: { input: "input" }');
      expect(jsContents).toContain('outputs: { output: "output" }');
    });

    it('should pick a Pipe defined in `declarations` over imported Pipes', () => {
      env.tsconfig({});
      env.write(
        'test.ts',
        `
        import {Component, Pipe, NgModule} from '@angular/core';

        // ModuleA classes

        @Pipe({
          name: 'number',
          standalone: false,
        })
        class PipeA {
          transform() {}
        }

        @NgModule({
          declarations: [PipeA],
          exports: [PipeA]
        })
        class ModuleA {}

        // ModuleB classes

        @Pipe({
          name: 'number',
          standalone: false,
        })
        class PipeB {
          transform() {}
        }

        @Component({
          selector: 'app',
          template: '{{ count | number }}',
          standalone: false,
        })
        export class App {
          count = 0;
        }

        @NgModule({
          imports: [ModuleA],
          declarations: [PipeB, App],
        })
        class ModuleB {}
      `,
      );

      env.driveMain();

      const jsContents = trim(env.getContents('test.js'));
      expect(jsContents).toContain('dependencies: [PipeB]');
    });

    it('should respect imported module order when selecting Pipe (last imported Pipe is used)', () => {
      env.tsconfig({});
      env.write(
        'test.ts',
        `
            import {Component, Pipe, NgModule} from '@angular/core';

            // ModuleA classes

            @Pipe({
              name: 'number',
              standalone: false,
            })
            class PipeA {
              transform() {}
            }

            @NgModule({
              declarations: [PipeA],
              exports: [PipeA]
            })
            class ModuleA {}

            // ModuleB classes

            @Pipe({
              name: 'number',
              standalone: false,
            })
            class PipeB {
              transform() {}
            }

            @NgModule({
              declarations: [PipeB],
              exports: [PipeB]
            })
            class ModuleB {}

            // ModuleC classes

            @Component({
              selector: 'app',
              template: '{{ count | number }}',
              standalone: false,
            })
            export class App {
              count = 0;
            }

            @NgModule({
              imports: [ModuleA, ModuleB],
              declarations: [App],
            })
            class ModuleC {}
          `,
      );

      env.driveMain();

      const jsContents = trim(env.getContents('test.js'));
      expect(jsContents).toContain('dependencies: [PipeB]');
    });

    it('should add Directives and Components from `declarations` at the end of the list', () => {
      env.tsconfig({});
      env.write(
        'test.ts',
        `
        import {Component, Directive, NgModule} from '@angular/core';

        // ModuleA classes

        @Directive({
          selector: '[dir]',
          standalone: false,
        })
        class DirectiveA {}

        @Component({
          selector: 'comp',
          template: '...',
          standalone: false,
        })
        class ComponentA {}

        @NgModule({
          declarations: [DirectiveA, ComponentA],
          exports: [DirectiveA, ComponentA]
        })
        class ModuleA {}

        // ModuleB classes

        @Directive({
          selector: '[dir]',
          standalone: false,
        })
        class DirectiveB {}

        @Component({
          selector: 'comp',
          template: '...',
          standalone: false,
        })
        export class ComponentB {}

        @Component({
          selector: 'app',
          template: \`
            <div dir></div>
            <comp></comp>
          \`,
          standalone: false,
        })
        export class App {}

        @NgModule({
          imports: [ModuleA],
          declarations: [DirectiveB, ComponentB, App],
        })
        class ModuleB {}
      `,
      );

      env.driveMain();

      const jsContents = trim(env.getContents('test.js'));
      expect(jsContents).toContain(
        'dependencies: [DirectiveA, ComponentA, DirectiveB, ComponentB]',
      );
    });

    it(
      'should not throw, but issue a diagnostic when an `NgModule` from `d.ts` references ' +
        'non-existent classes',
      () => {
        env.tsconfig();
        env.write(
          'test.ts',
          `
          import {NgModule} from '@angular/core';
          import {MyModule} from './lib';

          @NgModule({
            imports: [MyModule],
          })
          export class Mod {}
        `,
        );
        env.write(
          'lib.d.ts',
          `
          import * as i0 from '@angular/core';
          import {InvalidRef} from 'other-lib';

          export declare class MyModule {
            static ɵmod: i0.ɵɵNgModuleDeclaration<Module, [], never, [typeof InvalidRef]>
          }
        `,
        );

        const diagnostics = env.driveDiagnostics();
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].messageText).toBe(
          'This import contains errors, which may affect components that depend on this NgModule.',
        );
      },
    );

    it('should respect imported module order while processing Directives and Components', () => {
      env.tsconfig({});
      env.write(
        'test.ts',
        `
        import {Component, Directive, NgModule} from '@angular/core';

        // ModuleA classes

        @Directive({
          selector: '[dir]',
          standalone: false,
        })
        class DirectiveA {}

        @Component({
          selector: 'comp',
          template: '...',
          standalone: false,
        })
        class ComponentA {}

        @NgModule({
          declarations: [DirectiveA, ComponentA],
          exports: [DirectiveA, ComponentA]
        })
        class ModuleA {}

        // ModuleB classes

        @Directive({
          selector: '[dir]',
          standalone: false,
        })
        class DirectiveB {}

        @Component({
          selector: 'comp',
          template: '...',
          standalone: false,
        })
        class ComponentB {}

        @NgModule({
          declarations: [DirectiveB, ComponentB],
          exports: [DirectiveB, ComponentB]
        })
        class ModuleB {}

        // ModuleC classes

        @Component({
          selector: 'app',
          template: \`
            <div dir></div>
            <comp></comp>
          \`,
          standalone: false,
        })
        export class App {}

        @NgModule({
          imports: [ModuleA, ModuleB],
          declarations: [App],
        })
        class ModuleC {}
      `,
      );

      env.driveMain();

      const jsContents = trim(env.getContents('test.js'));
      expect(jsContents).toContain(
        'dependencies: [DirectiveA, ComponentA, DirectiveB, ComponentB]',
      );
    });

    it('should compile Components with a templateUrl in a different rootDir', () => {
      env.tsconfig({}, ['./extraRootDir']);
      env.write('extraRootDir/test.html', '<p>Hello World</p>');
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          templateUrl: 'test.html',
          standalone: false,
        })
        export class TestCmp {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('Hello World');
    });

    it('should compile Components with an absolute templateUrl in a different rootDir', () => {
      env.tsconfig({}, ['./extraRootDir']);
      env.write('extraRootDir/test.html', '<p>Hello World</p>');
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          templateUrl: '/test.html',
          standalone: false,
        })
        export class TestCmp {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('Hello World');
    });

    it('should compile components with styleUrls', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          styleUrls: ['./dir/style.css'],
          template: '',
          standalone: false,
        })
        export class TestCmp {}
    `,
      );
      env.write('dir/style.css', ':host { background-color: blue; }');

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('background-color: blue');
    });

    it('should compile components with styleUrls with fallback to .css extension', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          styleUrls: ['./dir/style.scss'],
          template: '',
          standalone: false,
        })
        export class TestCmp {}
    `,
      );
      env.write('dir/style.css', ':host { background-color: blue; }');

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('background-color: blue');
    });

    it('should include generic type in directive definition', () => {
      env.write(
        'test.ts',
        `
        import {Directive, Input, NgModule} from '@angular/core';

        @Directive()
        export class TestBase {
          @Input() input: any;
        }
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain(
        'i0.ɵɵdefineDirective({ type: TestBase, inputs: { input: "input" } });',
      );

      const dtsContents = env.getContents('test.d.ts');
      const expectedDirectiveDeclaration = `static ɵdir: i0.ɵɵDirectiveDeclaration<TestBase, never, never, { "input": { "alias": "input"; "required": false; }; }, {}, never, never, true, never>;`;
      expect(dtsContents).toContain(expectedDirectiveDeclaration);
    });

    describe('undecorated classes using Angular features', () => {
      it('should error if @Input has been discovered', () =>
        assertErrorUndecoratedClassWithField('Input'));
      it('should error if @Output has been discovered', () =>
        assertErrorUndecoratedClassWithField('Output'));
      it('should error if @ViewChild has been discovered', () =>
        assertErrorUndecoratedClassWithField('ViewChild'));
      it('should error if @ViewChildren has been discovered', () =>
        assertErrorUndecoratedClassWithField('ViewChildren'));
      it('should error if @ContentChild has been discovered', () =>
        assertErrorUndecoratedClassWithField('ContentChildren'));
      it('should error if @HostBinding has been discovered', () =>
        assertErrorUndecoratedClassWithField('HostBinding'));
      it('should error if @HostListener has been discovered', () =>
        assertErrorUndecoratedClassWithField('HostListener'));

      it(`should error if ngOnChanges lifecycle hook has been discovered`, () =>
        assertErrorUndecoratedClassWithLifecycleHook('ngOnChanges'));
      it(`should error if ngOnInit lifecycle hook has been discovered`, () =>
        assertErrorUndecoratedClassWithLifecycleHook('ngOnInit'));
      it(`should error if ngOnDestroy lifecycle hook has been discovered`, () =>
        assertErrorUndecoratedClassWithLifecycleHook('ngOnDestroy'));
      it(`should error if ngDoCheck lifecycle hook has been discovered`, () =>
        assertErrorUndecoratedClassWithLifecycleHook('ngDoCheck'));
      it(`should error if ngAfterViewInit lifecycle hook has been discovered`, () =>
        assertErrorUndecoratedClassWithLifecycleHook('ngAfterViewInit'));
      it(`should error if ngAfterViewChecked lifecycle hook has been discovered`, () =>
        assertErrorUndecoratedClassWithLifecycleHook('ngAfterViewChecked'));
      it(`should error if ngAfterContentInit lifecycle hook has been discovered`, () =>
        assertErrorUndecoratedClassWithLifecycleHook('ngAfterContentInit'));
      it(`should error if ngAfterContentChecked lifecycle hook has been discovered`, () =>
        assertErrorUndecoratedClassWithLifecycleHook('ngAfterContentChecked'));

      function assertErrorUndecoratedClassWithField(fieldDecoratorName: string) {
        env.write(
          'test.ts',
          `
          import {Component, ${fieldDecoratorName}, NgModule} from '@angular/core';

          export class SomeBaseClass {
            // @ts-ignore — Because no arguments are specified.
            @${fieldDecoratorName}() someMember: any;
          }
        `,
        );

        const errors = env.driveDiagnostics();
        expect(errors.length).toBe(1);
        expect(trim(errors[0].messageText as string)).toContain(
          'Class is using Angular features but is not decorated. Please add an explicit ' +
            'Angular decorator.',
        );
      }

      function assertErrorUndecoratedClassWithLifecycleHook(lifecycleName: string) {
        env.write(
          'test.ts',
          `
            import {Component, NgModule} from '@angular/core';

            export class SomeBaseClass {
              ${lifecycleName}() {
                // empty
              }
            }
          `,
        );

        const errors = env.driveDiagnostics();
        expect(errors.length).toBe(1);
        expect(trim(errors[0].messageText as string)).toContain(
          'Class is using Angular features but is not decorated. Please add an explicit ' +
            'Angular decorator.',
        );
      }
    });

    it('should compile NgModules without errors', () => {
      env.write(
        'test.ts',
        `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: 'this is a test',
          standalone: false,
        })
        export class TestCmp {}

        @NgModule({
          declarations: [TestCmp],
          bootstrap: [TestCmp],
        })
        export class TestModule {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain(
        'i0.ɵɵdefineNgModule({ type: TestModule, bootstrap: [TestCmp] });',
      );
      expect(jsContents).toContain(
        'function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(TestModule, { declarations: [TestCmp] }); })();',
      );
      expect(jsContents).toContain(
        'TestModule.ɵfac = function TestModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TestModule)(); }',
      );
      expect(jsContents).toContain('i0.ɵɵdefineInjector({});');

      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain(
        'static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, never, never, false, never>',
      );
      expect(dtsContents).toContain(
        'static ɵmod: i0.ɵɵNgModuleDeclaration<TestModule, [typeof TestCmp], never, never>',
      );
      expect(dtsContents).not.toContain('__decorate');
    });

    it('should not emit a ɵɵsetNgModuleScope call when no scope metadata is present', () => {
      env.write(
        'test.ts',
        `
        import {NgModule} from '@angular/core';

        @NgModule({})
        export class TestModule {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('i0.ɵɵdefineNgModule({ type: TestModule });');
      expect(jsContents).not.toContain('ɵɵsetNgModuleScope(TestModule,');
    });

    it("should emit the id when the module's id is a string", () => {
      env.write(
        'test.ts',
        `
        import {NgModule} from '@angular/core';

        @NgModule({id: 'test'})
        export class TestModule {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain(`i0.ɵɵdefineNgModule({ type: TestModule, id: 'test' })`);
    });

    it('should warn when an NgModule id is defined as module.id, and not emit it', () => {
      env.write(
        'index.d.ts',
        `
         declare const module = {id: string};
       `,
      );
      env.write(
        'test.ts',
        `
         import {NgModule} from '@angular/core';

         @NgModule({id: module.id})
         export class TestModule {}
       `,
      );

      const diags = env.driveDiagnostics();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('i0.ɵɵdefineNgModule({ type: TestModule })');
      expect(jsContents).not.toContain('i0.ɵɵregisterNgModuleType');

      expect(diags.length).toEqual(1);
      expect(diags[0].category).toEqual(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toEqual(ngErrorCode(ErrorCode.WARN_NGMODULE_ID_UNNECESSARY));
      expect(getDiagnosticSourceCode(diags[0])).toEqual('module.id');
    });

    it('should emit a side-effectful registration call when an @NgModule has an id', () => {
      env.write(
        'test.ts',
        `
        import {NgModule} from '@angular/core';

        @NgModule({id: 'test'})
        export class TestModule {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain(`i0.ɵɵregisterNgModuleType(TestModule, 'test')`);
    });

    it('should filter out directives and pipes from module exports in the injector def', () => {
      env.write(
        'test.ts',
        `
      import {NgModule} from '@angular/core';
      import {RouterComp, RouterModule} from '@angular/router';
      import {Dir, OtherDir, MyPipe, Comp} from './decls';

      @NgModule({
        declarations: [OtherDir],
        exports: [OtherDir],
      })
      export class OtherModule {}

      const EXPORTS = [Dir, MyPipe, Comp, OtherModule, OtherDir, RouterModule, RouterComp];

      @NgModule({
        declarations: [Dir, MyPipe, Comp],
        imports: [OtherModule, RouterModule.forRoot()],
        exports: [EXPORTS],
      })
      export class TestModule {}
    `,
      );
      env.write(
        `decls.ts`,
        `
      import {Component, Directive, Pipe} from '@angular/core';

      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      export class Dir {}

      @Directive({
        selector: '[other]',
        standalone: false,
      })
      export class OtherDir {}

      @Pipe({
        name:'pipe',
        standalone: false,
      })
      export class MyPipe {}

      @Component({
        selector: 'test',
        template: '',
        standalone: false
      })
      export class Comp {}
    `,
      );
      env.write(
        'node_modules/@angular/router/index.d.ts',
        `
      import {ɵɵComponentDeclaration, ModuleWithProviders, ɵɵNgModuleDeclaration} from '@angular/core';

      export declare class RouterComp {
        static ɵcmp: ɵɵComponentDeclaration<RouterComp, "lib-cmp", never, {}, {}, never>
      }

      declare class RouterModule {
        static forRoot(): ModuleWithProviders<RouterModule>;
        static ɵmod: ɵɵNgModuleDeclaration<RouterModule, [typeof RouterComp], never, [typeof RouterComp]>;
      }
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain(
        'TestModule.ɵfac = function TestModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TestModule)(); }',
      );
      expect(jsContents).toContain(
        'i0.ɵɵdefineInjector({ imports: [OtherModule, RouterModule.forRoot(),' +
          ' OtherModule, RouterModule] });',
      );
    });

    it('should compile NgModules with services without errors', () => {
      env.write(
        'test.ts',
        `
        import {Component, NgModule} from '@angular/core';

        export class Token {}

        @NgModule({})
        export class OtherModule {}

        @Component({
          selector: 'test-cmp',
          template: 'this is a test',
          standalone: false,
        })
        export class TestCmp {}

        @NgModule({
          declarations: [TestCmp],
          providers: [{provide: Token, useValue: 'test'}],
          imports: [OtherModule],
        })
        export class TestModule {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain(
        'TestModule.ɵfac = function TestModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TestModule)(); }',
      );
      expect(jsContents).toContain('i0.ɵɵdefineNgModule({ type: TestModule });');
      expect(jsContents).toContain(
        `TestModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ ` +
          `providers: [{ provide: Token, useValue: 'test' }], ` +
          `imports: [OtherModule] });`,
      );

      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain(
        'static ɵmod: i0.ɵɵNgModuleDeclaration<TestModule, [typeof TestCmp], [typeof OtherModule], never>',
      );
      expect(dtsContents).toContain('static ɵinj: i0.ɵɵInjectorDeclaration');
    });

    it('should compile NgModules with factory providers without errors', () => {
      env.write(
        'test.ts',
        `
        import {Component, NgModule} from '@angular/core';

        export class Token {}

        @NgModule({})
        export class OtherModule {}

        @Component({
          selector: 'test-cmp',
          template: 'this is a test',
          standalone: false,
        })
        export class TestCmp {}

        @NgModule({
          declarations: [TestCmp],
          providers: [{provide: Token, useFactory: () => new Token()}],
          imports: [OtherModule],
        })
        export class TestModule {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain(
        'TestModule.ɵfac = function TestModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TestModule)(); }',
      );
      expect(jsContents).toContain('i0.ɵɵdefineNgModule({ type: TestModule });');
      expect(jsContents).toContain(
        `TestModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ ` +
          `providers: [{ provide: Token, useFactory: () => new Token() }], ` +
          `imports: [OtherModule] });`,
      );

      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain(
        'static ɵmod: i0.ɵɵNgModuleDeclaration<TestModule, [typeof TestCmp], [typeof OtherModule], never>',
      );
      expect(dtsContents).toContain('static ɵinj: i0.ɵɵInjectorDeclaration');
    });

    it('should compile NgModules with factory providers and deps without errors', () => {
      env.write(
        'test.ts',
        `
        import {Component, NgModule} from '@angular/core';

        export class Dep {}

        export class Token {
          constructor(dep: Dep) {}
        }

        @NgModule({})
        export class OtherModule {}

        @Component({
          selector: 'test-cmp',
          template: 'this is a test',
          standalone: false,
        })
        export class TestCmp {}

        @NgModule({
          declarations: [TestCmp],
          providers: [{provide: Token, useFactory: (dep: Dep) => new Token(dep), deps: [Dep]}],
          imports: [OtherModule],
        })
        export class TestModule {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain(
        'TestModule.ɵfac = function TestModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TestModule)(); }',
      );
      expect(jsContents).toContain('i0.ɵɵdefineNgModule({ type: TestModule });');
      expect(jsContents).toContain(
        `TestModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ ` +
          `providers: [{ provide: Token, useFactory: (dep) => new Token(dep), deps: [Dep] }], ` +
          `imports: [OtherModule] });`,
      );

      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain(
        'static ɵmod: i0.ɵɵNgModuleDeclaration<TestModule, [typeof TestCmp], [typeof OtherModule], never>',
      );
      expect(dtsContents).toContain('static ɵinj: i0.ɵɵInjectorDeclaration');
    });

    it('should compile NgModules with references to local components', () => {
      env.write(
        'test.ts',
        `
      import {NgModule} from '@angular/core';
      import {Foo} from './foo';

      @NgModule({
        declarations: [Foo],
      })
      export class FooModule {}
    `,
      );
      env.write(
        'foo.ts',
        `
      import {Component} from '@angular/core';
      @Component({
        selector: 'foo',
        template: '',
        standalone: false,
      })
      export class Foo {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const dtsContents = env.getContents('test.d.ts');

      expect(jsContents).toContain("import { Foo } from './foo';");
      expect(jsContents).not.toMatch(/as i[0-9] from ".\/foo"/);
      expect(dtsContents).toContain('as i1 from "./foo";');
    });

    it('should compile NgModules with references to absolute components', () => {
      env.write(
        'tsconfig.json',
        JSON.stringify({
          extends: './tsconfig-base.json',
          compilerOptions: {
            baseUrl: '.',
            paths: {
              '*': ['*', 'shared/*'],
            },
          },
        }),
      );
      env.write(
        'test.ts',
        `
      import {NgModule} from '@angular/core';
      import {Foo} from 'foo';

      @NgModule({
        declarations: [Foo],
      })
      export class FooModule {}
    `,
      );
      env.write(
        'shared/foo/index.ts',
        `
      import {Component} from '@angular/core';

      @Component({
        selector: 'foo',
        template: '',
        standalone: false,
      })
      export class Foo {
      }
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const dtsContents = env.getContents('test.d.ts');

      expect(jsContents).toContain("import { Foo } from 'foo';");
      expect(jsContents).not.toMatch(/as i[0-9] from "foo"/);
      expect(dtsContents).toContain('as i1 from "foo";');
    });

    it('should compile NgModules with references to forward declared bootstrap components', () => {
      env.write(
        'test.ts',
        `
      import {Component, forwardRef, NgModule} from '@angular/core';

      @NgModule({
        bootstrap: [forwardRef(() => Foo)],
      })
      export class FooModule {}

      @Component({
        selector: 'foo',
        template: 'foo',
        standalone: false,
      })
      export class Foo {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('bootstrap: () => [Foo]');
    });

    it('should compile NgModules with references to forward declared directives', () => {
      env.write(
        'test.ts',
        `
      import {Directive, forwardRef, NgModule} from '@angular/core';

      @NgModule({
        declarations: [forwardRef(() => Foo)],
      })
      export class FooModule {}

      @Directive({
        selector: 'foo',
        standalone: false,
      })
      export class Foo {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('declarations: () => [Foo]');
    });

    it('should compile NgModules with references to forward declared imports', () => {
      env.write(
        'test.ts',
        `
      import {forwardRef, NgModule} from '@angular/core';

      @NgModule({
        imports: [forwardRef(() => BarModule)],
      })
      export class FooModule {}

      @NgModule({})
      export class BarModule {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('imports: () => [BarModule]');
    });

    it('should compile NgModules with references to forward declared exports', () => {
      env.write(
        'test.ts',
        `
      import {forwardRef, NgModule} from '@angular/core';

      @NgModule({
        exports: [forwardRef(() => BarModule)],
      })
      export class FooModule {}

      @NgModule({})
      export class BarModule {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('exports: () => [BarModule]');
    });

    it('should use relative import for forward references that were resolved from a relative file', () => {
      env.write(
        'dir.ts',
        `
          import {Directive, forwardRef} from '@angular/core';

          export const useFoo = forwardRef(() => Foo);

          @Directive({
            selector: 'foo',
            standalone: false,
          })
          export class Foo {}
          `,
      );
      env.write(
        'test.ts',
        `
          import {NgModule} from '@angular/core';
          import {useFoo} from './dir';

          @NgModule({
            declarations: [useFoo],
          })
          export class FooModule {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('import * as i1 from "./dir";');
      expect(jsContents).toContain('declarations: [i1.Foo]');
    });

    it('should use absolute import for forward references that were resolved from an absolute file', () => {
      env.write(
        'dir.ts',
        `
          import {Directive, forwardRef} from '@angular/core';

          export const useFoo = forwardRef(() => Foo);

          @Directive({
            selector: 'foo',
            standalone: false,
          })
          export class Foo {}
          `,
      );
      env.write(
        'test.ts',
        `
          import {forwardRef, NgModule} from '@angular/core';
          import {useFoo} from 'dir';

          @NgModule({
            declarations: [useFoo],
          })
          export class FooModule {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('import * as i1 from "dir";');
      expect(jsContents).toContain('declarations: [i1.Foo]');
    });

    it('should compile Pipes without errors', () => {
      env.write(
        'test.ts',
        `
        import {Pipe} from '@angular/core';

        @Pipe({
          name: 'test-pipe',
          pure: false,
          standalone: false,
        })
        export class TestPipe {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const dtsContents = env.getContents('test.d.ts');

      expect(jsContents).toContain(
        'TestPipe.ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "test-pipe", type: TestPipe, pure: false, standalone: false })',
      );
      expect(jsContents).toContain(
        'TestPipe.ɵfac = function TestPipe_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TestPipe)(); }',
      );
      expect(dtsContents).toContain(
        'static ɵpipe: i0.ɵɵPipeDeclaration<TestPipe, "test-pipe", false>;',
      );
      expect(dtsContents).toContain('static ɵfac: i0.ɵɵFactoryDeclaration<TestPipe, never>;');
    });

    it('should compile pure Pipes without errors', () => {
      env.write(
        'test.ts',
        `
        import {Pipe} from '@angular/core';

        @Pipe({
          name: 'test-pipe',
          standalone: false,
        })
        export class TestPipe {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const dtsContents = env.getContents('test.d.ts');

      expect(jsContents).toContain(
        'TestPipe.ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "test-pipe", type: TestPipe, pure: true, standalone: false })',
      );
      expect(jsContents).toContain(
        'TestPipe.ɵfac = function TestPipe_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TestPipe)(); }',
      );
      expect(dtsContents).toContain(
        'static ɵpipe: i0.ɵɵPipeDeclaration<TestPipe, "test-pipe", false>;',
      );
      expect(dtsContents).toContain('static ɵfac: i0.ɵɵFactoryDeclaration<TestPipe, never>;');
    });

    it('should compile Pipes with dependencies', () => {
      env.write(
        'test.ts',
        `
        import {Pipe} from '@angular/core';

        export class Dep {}

        @Pipe({
          name: 'test-pipe',
          pure: false,
          standalone: false,
        })
        export class TestPipe {
          constructor(dep: Dep) {}
        }
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain(
        'return new (__ngFactoryType__ || TestPipe)(i0.ɵɵdirectiveInject(Dep, 16));',
      );
    });

    it('should compile Pipes with generic types', () => {
      env.write(
        'test.ts',
        `
        import {Pipe} from '@angular/core';

        @Pipe({
          name: 'test-pipe',
          standalone: false,
        })
        export class TestPipe<T> {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('TestPipe.ɵpipe =');
      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain(
        'static ɵpipe: i0.ɵɵPipeDeclaration<TestPipe<any>, "test-pipe", false>;',
      );
      expect(dtsContents).toContain('static ɵfac: i0.ɵɵFactoryDeclaration<TestPipe<any>, never>;');
    });

    it('should include @Pipes in @NgModule scopes', () => {
      env.write(
        'test.ts',
        `
        import {Component, NgModule, Pipe} from '@angular/core';

        @Pipe({
          name: 'test',
          standalone: false,
        })
        export class TestPipe {
          transform() {}
        }

        @Component({
          selector: 'test-cmp',
          template: '{{value | test}}',
          standalone: false,
        })
        export class TestCmp {
          value = '';
        }

        @NgModule({declarations: [TestPipe, TestCmp]})
        export class TestModule {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('dependencies: [TestPipe]');

      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain(
        'i0.ɵɵNgModuleDeclaration<TestModule, [typeof TestPipe, typeof TestCmp], never, never>',
      );
    });

    it('should report diagnostic on the exact element in the `imports` array', () => {
      // Note: the scenario here is slightly contrived, but we want to hit the code
      // path where TS doesn't report a type error before Angular which appears to be
      // common with the language service.
      env.write(
        'test.ts',
        `
          import {Component, Directive} from '@angular/core';

          @Directive({selector: '[hello]'})
          export class HelloDir {}

          const someVar = {} as any;

          @Component({
            template: '<div hello></div>',
            imports: [
              someVar,
              HelloDir,
            ]
          })
          export class TestCmp {}
        `,
      );

      const diags = env.driveDiagnostics();
      const message = diags.length
        ? ts.flattenDiagnosticMessageText(diags[0].messageText, '\n')
        : '';
      expect(diags.length).toBe(1);
      expect(getDiagnosticSourceCode(diags[0])).toBe('someVar');
      expect(message).toContain(
        `'imports' must be an array of components, directives, pipes, or NgModules.`,
      );
      expect(message).toContain(`Value is of type '{}'`);
    });

    describe('empty and missing selectors', () => {
      it('should use default selector for Components when no selector present', () => {
        env.write(
          'test.ts',
          `
        import {Component} from '@angular/core';

        @Component({
          template: '...',
          standalone: false,
        })
        export class TestCmp {}
      `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain('selectors: [["ng-component"]]');
      });

      it('should use default selector for Components with empty string selector', () => {
        env.write(
          'test.ts',
          `
        import {Component} from '@angular/core';

        @Component({
          selector: '',
          template: '...',
          standalone: false,
        })
        export class TestCmp {}
      `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain('selectors: [["ng-component"]]');
      });

      it('should allow directives with no selector that are not in NgModules', () => {
        env.write(
          'main.ts',
          `
          import {Directive} from '@angular/core';

          @Directive({})
          export class BaseDir {}

          @Directive({})
          export abstract class AbstractBaseDir {}

          @Directive()
          export abstract class EmptyDir {}

          @Directive({
            inputs: ['a', 'b'],
            standalone: false,
          })
          export class TestDirWithInputs {}
        `,
        );
        const errors = env.driveDiagnostics();
        expect(errors.length).toBe(0);
      });

      it('should be able to use abstract directive in other compilation units', () => {
        env.write(
          'tsconfig.json',
          JSON.stringify({
            extends: './tsconfig-base.json',
            compilerOptions: {rootDir: '.', outDir: '../node_modules/lib1_built'},
          }),
        );
        env.write(
          'index.ts',
          `
          import {Directive} from '@angular/core';

          @Directive()
          export class BaseClass {}
        `,
        );

        expect(env.driveDiagnostics().length).toBe(0);

        env.tsconfig();
        env.write(
          'index.ts',
          `
          import {NgModule, Directive} from '@angular/core';
          import {BaseClass} from 'lib1_built';

          @Directive({
            selector: 'my-dir',
            standalone: false,
          })
          export class MyDirective extends BaseClass {}

          @NgModule({declarations: [MyDirective]})
          export class AppModule {}
        `,
        );

        expect(env.driveDiagnostics().length).toBe(0);
      });

      it('should not allow directives with no selector that are in NgModules', () => {
        env.write(
          'main.ts',
          `
          import {Directive, NgModule} from '@angular/core';

          @Directive({
            standalone: false,
          })
          export class BaseDir {}

          @NgModule({
            declarations: [BaseDir],
          })
          export class MyModule {}
        `,
        );
        const errors = env.driveDiagnostics();
        expect(trim(errors[0].messageText as string)).toContain(
          'Directive BaseDir has no selector, please add it!',
        );
      });

      it('should throw if Directive selector is an empty string', () => {
        env.write(
          'test.ts',
          `
        import {Directive} from '@angular/core';

        @Directive({
          selector: '',
          standalone: false,
        })
        export class TestDir {}
      `,
        );

        const errors = env.driveDiagnostics();
        expect(trim(errors[0].messageText as string)).toContain(
          'Directive TestDir has no selector, please add it!',
        );
      });
    });

    describe('error handling', () => {
      function verifyThrownError(errorCode: ErrorCode, errorMessage: string) {
        const errors = env.driveDiagnostics();
        expect(errors.length).toBe(1);
        const {code, messageText} = errors[0];
        expect(code).toBe(ngErrorCode(errorCode));
        const text = ts.flattenDiagnosticMessageText(messageText, '\n');
        expect(trim(text)).toContain(errorMessage);
      }

      it('should throw if invalid arguments are provided in @NgModule', () => {
        env.tsconfig({});
        env.write(
          'test.ts',
          `
          import {NgModule} from '@angular/core';

          // @ts-ignore
          @NgModule('invalidNgModuleArgumentType')
          export class MyModule {}
        `,
        );
        verifyThrownError(
          ErrorCode.DECORATOR_ARG_NOT_LITERAL,
          '@NgModule argument must be an object literal',
        );
      });

      it('should throw if multiple query decorators are used on the same field', () => {
        env.tsconfig({});
        env.write(
          'test.ts',
          `
          import {Component, ContentChild} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '...'
          })
          export class TestCmp {
            @ContentChild('bar', {static: true})
            @ContentChild('foo')
            foo: any;
          }
        `,
        );
        verifyThrownError(
          ErrorCode.DECORATOR_COLLISION,
          'Cannot combine multiple query decorators.',
        );
      });

      ['ViewChild', 'ViewChildren', 'ContentChild', 'ContentChildren'].forEach((decorator) => {
        it(`should throw if @Input and @${decorator} decorators are applied to the same property`, () => {
          env.tsconfig({});
          env.write(
            'test.ts',
            `
              import {Component, ${decorator}, Input} from '@angular/core';

              @Component({
                selector: 'test-cmp',
                template: '<ng-content></ng-content>'
              })
              export class TestCmp {
                @Input() @${decorator}('foo') foo: any;
              }
            `,
          );
          verifyThrownError(
            ErrorCode.DECORATOR_COLLISION,
            'Cannot combine @Input decorators with query decorators',
          );
        });

        it(`should throw if invalid options are provided in ${decorator}`, () => {
          env.tsconfig({});
          env.write(
            'test.ts',
            `
            import {Component, ${decorator}, Input} from '@angular/core';

            @Component({
              selector: 'test-cmp',
              template: '...'
            })
            export class TestCmp {
              // @ts-ignore
              @${decorator}('foo', 'invalidOptionsArgumentType') foo: any;
            }
          `,
          );
          verifyThrownError(
            ErrorCode.DECORATOR_ARG_NOT_LITERAL,
            `@${decorator} options must be an object literal`,
          );
        });

        it(`should throw if @${decorator} is used on non property-type member`, () => {
          env.tsconfig({});
          env.write(
            'test.ts',
            `
            import {Component, ${decorator}} from '@angular/core';

            @Component({
              selector: 'test-cmp',
              template: '...'
            })
            export class TestCmp {
              @${decorator}('foo')
              private someFn() {}
            }
          `,
          );
          verifyThrownError(
            ErrorCode.DECORATOR_UNEXPECTED,
            'Query decorator must go on a property-type member',
          );
        });

        it(`should throw error if @${decorator} has too many arguments`, () => {
          env.tsconfig({});
          env.write(
            'test.ts',
            `
            import {Component, ${decorator}} from '@angular/core';

            @Component({
              selector: 'test-cmp',
              template: '...'
            })
            export class TestCmp {
              // @ts-ignore
              @${decorator}('foo', {}, 'invalid-extra-arg') foo: any;
            }
          `,
          );
          verifyThrownError(
            ErrorCode.DECORATOR_ARITY_WRONG,
            `@${decorator} has too many arguments`,
          );
        });

        it(`should throw error if @${decorator} predicate argument has wrong type`, () => {
          env.tsconfig({});
          env.write(
            'test.ts',
            `
            import {Component, ${decorator}} from '@angular/core';

            @Component({
              selector: 'test-cmp',
              template: '...'
            })
            export class TestCmp {
              // @ts-ignore
              @${decorator}({'invalid-predicate-type': true}) foo: any;
            }
          `,
          );
          verifyThrownError(
            ErrorCode.VALUE_HAS_WRONG_TYPE,
            `@${decorator} predicate cannot be interpreted`,
          );
        });

        it(`should throw error if one of @${decorator}'s predicate has wrong type`, () => {
          env.tsconfig({});
          env.write(
            'test.ts',
            `
            import {Component, ${decorator}} from '@angular/core';

            @Component({
              selector: 'test-cmp',
              template: '...'
            })
            export class TestCmp {
              // @ts-ignore
              @${decorator}(['predicate-a', {'invalid-predicate-type': true}]) foo: any;
            }
          `,
          );
          verifyThrownError(
            ErrorCode.VALUE_HAS_WRONG_TYPE,
            `Failed to resolve @${decorator} predicate at position 1 to a string`,
          );
        });
      });

      it(`should throw error if @Directive.inputs has wrong type`, () => {
        env.tsconfig({});
        env.write(
          'test.ts',
          `
          import {Directive} from '@angular/core';

          @Directive({
            selector: 'test-dir',
            // @ts-ignore
            inputs: 'invalid-field-type',
          })
          export class TestDir {}
        `,
        );
        verifyThrownError(
          ErrorCode.VALUE_HAS_WRONG_TYPE,
          `Failed to resolve @Directive.inputs to an array Value is of type 'string'.`,
        );
      });

      it('should throw if decorator input is declared on static member', () => {
        env.write(
          'test.ts',
          `
          import {Directive, Input} from '@angular/core';

          @Directive()
          export class TestDir {
            @Input() static someInput: string = '';
          }
        `,
        );
        const diagnostics = env.driveDiagnostics();
        expect(diagnostics).toEqual([
          jasmine.objectContaining({
            messageText: 'Input "someInput" is incorrectly declared as static member of "TestDir".',
          }),
        ]);
      });

      it(`should throw error if @Directive.outputs has wrong type`, () => {
        env.tsconfig({});
        env.write(
          'test.ts',
          `
          import {Directive} from '@angular/core';

          @Directive({
            selector: 'test-dir',
            // @ts-ignore
            outputs: 'invalid-field-type',
          })
          export class TestDir {}
        `,
        );
        verifyThrownError(
          ErrorCode.VALUE_HAS_WRONG_TYPE,
          `Failed to resolve @Directive.outputs to a string array`,
        );
      });

      ['ContentChild', 'ContentChildren'].forEach((decorator) => {
        it(`should throw if \`descendants\` field of @${decorator}'s options argument has wrong type`, () => {
          env.tsconfig({});
          env.write(
            'test.ts',
            `
              import {Component, ContentChild} from '@angular/core';

              @Component({
                selector: 'test-cmp',
                template: '...'
              })
              export class TestCmp {
                // @ts-ignore
                @ContentChild('foo', {descendants: 'invalid'}) foo: any;
              }
            `,
          );
          verifyThrownError(
            ErrorCode.VALUE_HAS_WRONG_TYPE,
            '@ContentChild options.descendants must be a boolean',
          );
        });
      });

      ['Input', 'Output'].forEach((decorator) => {
        it(`should throw error if @${decorator} decorator argument has unsupported type`, () => {
          env.tsconfig({});
          env.write(
            'test.ts',
            `
            import {Component, ${decorator}} from '@angular/core';

            @Component({
              selector: 'test-cmp',
              template: '...'
            })
            export class TestCmp {
              // @ts-ignore
              @${decorator}(['invalid-arg-type']) foo: any;
            }
          `,
          );
          verifyThrownError(
            ErrorCode.VALUE_HAS_WRONG_TYPE,
            `@${decorator} decorator argument must resolve to a string`,
          );
        });

        it(`should throw error if @${decorator} decorator has too many arguments`, () => {
          env.tsconfig({});
          env.write(
            'test.ts',
            `
            import {Component, ${decorator}} from '@angular/core';

            @Component({
              selector: 'test-cmp',
              template: '...'
            })
            export class TestCmp {
              // @ts-ignore
              @${decorator}('name', 'invalid-extra-arg') foo: any;
            }
          `,
          );
          verifyThrownError(
            ErrorCode.DECORATOR_ARITY_WRONG,
            `@${decorator} can have at most one argument, got 2 argument(s)`,
          );
        });
      });

      it('should throw error if @HostBinding decorator argument has unsupported type', () => {
        env.tsconfig({});
        env.write(
          'test.ts',
          `
          import {Component, HostBinding} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '...'
          })
          export class TestCmp {
            // @ts-ignore
            @HostBinding(['invalid-arg-type']) foo: any;
          }
        `,
        );
        verifyThrownError(
          ErrorCode.VALUE_HAS_WRONG_TYPE,
          `@HostBinding's argument must be a string`,
        );
      });

      it('should throw error if @HostBinding decorator has too many arguments', () => {
        env.tsconfig({});
        env.write(
          'test.ts',
          `
          import {Component, HostBinding} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '...'
          })
          export class TestCmp {
            // @ts-ignore
            @HostBinding('name', 'invalid-extra-arg') foo: any;
          }
        `,
        );
        verifyThrownError(
          ErrorCode.DECORATOR_ARITY_WRONG,
          '@HostBinding can have at most one argument',
        );
      });

      it('should throw error if @Directive.host field has wrong type', () => {
        env.tsconfig({});
        env.write(
          'test.ts',
          `
          import {Directive} from '@angular/core';

          @Directive({
            selector: 'test-dir',
            // @ts-ignore
            host: 'invalid-host-type'
          })
          export class TestDir {}
        `,
        );
        verifyThrownError(
          ErrorCode.VALUE_HAS_WRONG_TYPE,
          'Decorator host metadata must be an object',
        );
      });

      it('should throw error if @Directive.host field is an object with values that have wrong types', () => {
        env.tsconfig({});
        env.write(
          'test.ts',
          `
              import {Directive} from '@angular/core';

              @Directive({
                selector: 'test-dir',
                // @ts-ignore
                host: {'key': ['invalid-host-value']}
              })
              export class TestDir {}
            `,
        );
        verifyThrownError(
          ErrorCode.VALUE_HAS_WRONG_TYPE,
          'Decorator host metadata must be a string -> string object, but found unparseable value',
        );
      });

      it('should throw error if @Directive.queries field has wrong type', () => {
        env.tsconfig({});
        env.write(
          'test.ts',
          `
          import {Directive} from '@angular/core';

          @Directive({
            selector: 'test-dir',
            // @ts-ignore
            queries: 'invalid-queries-type'
          })
          export class TestDir {}
        `,
        );
        verifyThrownError(
          ErrorCode.VALUE_HAS_WRONG_TYPE,
          'Decorator queries metadata must be an object',
        );
      });

      it('should throw error if @Directive.queries object has incorrect values', () => {
        env.tsconfig({});
        env.write(
          'test.ts',
          `
          import {Directive} from '@angular/core';

          @Directive({
            selector: 'test-dir',
            queries: {
              myViewQuery: 'invalid-query-type'
            }
          })
          export class TestDir {}
        `,
        );
        verifyThrownError(
          ErrorCode.VALUE_HAS_WRONG_TYPE,
          'Decorator query metadata must be an instance of a query type',
        );
      });

      it('should throw error if @Directive.queries object has incorrect values (refs to other decorators)', () => {
        env.tsconfig({});
        env.write(
          'test.ts',
          `
              import {Directive, Input} from '@angular/core';

              @Directive({
                selector: 'test-dir',
                queries: {
                  myViewQuery: new Input()
                }
              })
              export class TestDir {}
            `,
        );
        verifyThrownError(
          ErrorCode.VALUE_HAS_WRONG_TYPE,
          'Decorator query metadata must be an instance of a query type',
        );
      });

      it('should throw error if @Injectable has incorrect argument', () => {
        env.tsconfig({});
        env.write(
          'test.ts',
          `
          import {Injectable} from '@angular/core';

          // @ts-ignore
          @Injectable('invalid')
          export class TestProvider {}
        `,
        );
        verifyThrownError(
          ErrorCode.DECORATOR_ARG_NOT_LITERAL,
          '@Injectable argument must be an object literal',
        );
      });

      it('should produce a diagnostic if the transform value is not a function', () => {
        env.write(
          '/test.ts',
          `
          import {Directive, Input} from '@angular/core';

          const NOT_A_FUNCTION: any = null!;

          @Directive({selector: '[dir]', standalone: true})
          export class Dir {
            @Input({transform: NOT_A_FUNCTION}) value!: number;
          }
        `,
        );

        verifyThrownError(ErrorCode.VALUE_HAS_WRONG_TYPE, `Input transform must be a function`);
      });

      it('should produce a diagnostic if the transform value in the inputs array is not a function', () => {
        env.write(
          '/test.ts',
          `
          import {Directive, Input} from '@angular/core';

          const NOT_A_FUNCTION: any = null!;

          @Directive({
            selector: '[dir]',
            standalone: true,
            inputs: [{
              name: 'value',
              transform: NOT_A_FUNCTION
            }]
          })
          export class Dir {
            value!: number;
          }
        `,
        );

        verifyThrownError(
          ErrorCode.VALUE_HAS_WRONG_TYPE,
          `Transform of value at position 0 of @Directive.inputs array must be a function Value is of type 'null'.`,
        );
      });

      it('should produce a diangostic if the transform function first parameter has no arguments', () => {
        env.tsconfig({noImplicitAny: false});
        env.write(
          '/test.ts',
          `
              import {Directive, Input} from '@angular/core';

              @Directive({selector: '[dir]', standalone: true})
              export class Dir {
                @Input({transform: (val) => 1}) value!: number;
              }
            `,
        );

        verifyThrownError(
          ErrorCode.VALUE_HAS_WRONG_TYPE,
          `Input transform function first parameter must have a type`,
        );
      });

      it('should produce a diangostic if the transform function is generic', () => {
        env.write(
          '/test.ts',
          `
          import {Directive, Input} from '@angular/core';

          @Directive({selector: '[dir]', standalone: true})
          export class Dir {
            @Input({transform: <T>(val: T) => 1}) value!: number;
          }
        `,
        );

        verifyThrownError(
          ErrorCode.VALUE_HAS_WRONG_TYPE,
          `Input transform function cannot be generic`,
        );
      });

      it('should produce a diangostic if there is a conflicting coercion member', () => {
        env.write(
          '/test.ts',
          `
          import {Directive, Input} from '@angular/core';

          @Directive({selector: '[dir]', standalone: true})
          export class Dir {
            @Input({transform: (val: string) => 1}) value!: number;

            static ngAcceptInputType_value: boolean;
          }
        `,
        );

        verifyThrownError(
          ErrorCode.CONFLICTING_INPUT_TRANSFORM,
          `Class cannot have both a transform function on Input value and a static member called ngAcceptInputType_value`,
        );
      });

      it('should produce a diangostic if the transform function type cannot be referenced from the source file', () => {
        env.write(
          '/util.ts',
          `
            interface InternalType {
              foo: boolean;
            }

            export function toNumber(val: InternalType) { return 1; }
          `,
        );

        env.write(
          '/test.ts',
          `
            import {Directive, Input} from '@angular/core';
            import {toNumber} from './util';

            @Directive({selector: '[dir]', standalone: true})
            export class Dir {
              @Input({transform: toNumber}) value!: number;
            }
          `,
        );

        verifyThrownError(
          ErrorCode.IMPORT_GENERATION_FAILURE,
          'Unable to import type InternalType.',
        );
      });

      it('should produce a diangostic if a sub-type of the transform function cannot be referenced from the source file', () => {
        env.write(
          '/util.ts',
          `
              interface InternalType {
                foo: boolean;
              }

              export function toNumber(val: {value: InternalType}) { return 1; }
            `,
        );

        env.write(
          '/test.ts',
          `
              import {Directive, Input} from '@angular/core';
              import {toNumber} from './util';

              @Directive({selector: '[dir]', standalone: true})
              export class Dir {
                @Input({transform: toNumber}) value!: number;
              }
            `,
        );

        verifyThrownError(
          ErrorCode.IMPORT_GENERATION_FAILURE,
          'Unable to import type InternalType.',
        );
      });

      it('should produce a diangostic if a generic parameter of the transform function cannot be referenced from the source file', () => {
        env.write(
          '/util.ts',
          `
              export interface GenericWrapper<T> {
                value: T;
              }

              interface InternalType {
                foo: boolean;
              }

              export function toNumber(val: GenericWrapper<InternalType>) { return 1; }
            `,
        );

        env.write(
          '/test.ts',
          `
              import {Directive, Input} from '@angular/core';
              import {toNumber} from './util';

              @Directive({selector: '[dir]', standalone: true})
              export class Dir {
                @Input({transform: toNumber}) value!: number;
              }
            `,
        );

        verifyThrownError(
          ErrorCode.IMPORT_GENERATION_FAILURE,
          'Unable to import type InternalType.',
        );
      });

      it('should produce a diangostic if transform type is not exported', () => {
        env.write(
          '/test.ts',
          `
          import {Directive, Input} from '@angular/core';

          interface InternalType {
            foo: boolean;
          }

          @Directive({selector: '[dir]', standalone: true})
          export class Dir {
            @Input({transform: (val: InternalType) => 1}) val!: number;
          }
        `,
        );

        verifyThrownError(
          ErrorCode.SYMBOL_NOT_EXPORTED,
          'Symbol must be exported in order to be used as the type of an Input transform function',
        );
      });

      it('should produce a diangostic if the transform value is not a function', () => {
        env.write(
          '/test.ts',
          `
          import {Directive, Input} from '@angular/core';

          function createTransform(outerValue: number) {
            return (innerValue: string) => outerValue;
          }

          @Directive({selector: '[dir]', standalone: true})
          export class Dir {
            @Input({transform: createTransform(1)}) value!: number;
          }
        `,
        );

        verifyThrownError(ErrorCode.VALUE_HAS_WRONG_TYPE, `Input transform must be a function`);
      });

      it('should produce a diangostic if the first parameter of a transform is a spread', () => {
        env.write(
          '/test.ts',
          `
          import {Directive, Input} from '@angular/core';

          function toNumber(...value: (string | boolean)[]) { return 1; }

          @Directive({standalone: true})
          export class Dir {
            @Input({transform: toNumber}) value!: number;
          }
        `,
        );

        verifyThrownError(
          ErrorCode.VALUE_HAS_WRONG_TYPE,
          `Input transform function first parameter cannot be a spread parameter`,
        );
      });

      it('should produce a diangostic if a transform function has multiple signatures', () => {
        env.write(
          '/test.ts',
          `
          import {Directive, Input} from '@angular/core';

          function toNumber(value: boolean): number;
          function toNumber(value: string): number;
          function toNumber(value: boolean | string) { return 1; }

          @Directive({standalone: true})
          export class Dir {
            @Input({transform: toNumber}) value!: number;
          }
        `,
        );

        verifyThrownError(
          ErrorCode.VALUE_HAS_WRONG_TYPE,
          `Input transform function cannot have multiple signatures`,
        );
      });
    });

    describe('multiple decorators on classes', () => {
      it('should compile @Injectable on Components, Directives, Pipes, and Modules', () => {
        env.write(
          'test.ts',
          `
        import {Component, Directive, Injectable, NgModule, Pipe} from '@angular/core';

        @Component({
          selector: 'test',
          template: 'test',
          standalone: false,
        })
        @Injectable()
        export class TestCmp {}

        @Directive({
          selector: 'test',
          standalone: false,
        })
        @Injectable()
        export class TestDir {}

        @Pipe({
          name: 'test',
          standalone: false,
        })
        @Injectable()
        export class TestPipe {}

        @NgModule({declarations: [TestCmp, TestDir, TestPipe]})
        @Injectable()
        export class TestNgModule {}
      `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');
        const dtsContents = env.getContents('test.d.ts');

        // Validate that each class has the primary definition.
        expect(jsContents).toContain('TestCmp.ɵcmp =');
        expect(jsContents).toContain('TestDir.ɵdir =');
        expect(jsContents).toContain('TestPipe.ɵpipe =');
        expect(jsContents).toContain('TestNgModule.ɵmod =');

        // Validate that each class also has an injectable definition.
        expect(jsContents).toContain('TestCmp.ɵprov =');
        expect(jsContents).toContain('TestDir.ɵprov =');
        expect(jsContents).toContain('TestPipe.ɵprov =');
        expect(jsContents).toContain('TestNgModule.ɵprov =');

        // Validate that each class's .d.ts declaration has the primary definition.
        expect(dtsContents).toContain('ComponentDeclaration<TestCmp');
        expect(dtsContents).toContain('DirectiveDeclaration<TestDir');
        expect(dtsContents).toContain('PipeDeclaration<TestPipe');
        expect(dtsContents).toContain('ɵɵNgModuleDeclaration<TestNgModule');

        // Validate that each class's .d.ts declaration also has an injectable
        // definition.
        expect(dtsContents).toContain('ɵɵInjectableDeclaration<TestCmp');
        expect(dtsContents).toContain('ɵɵInjectableDeclaration<TestDir');
        expect(dtsContents).toContain('ɵɵInjectableDeclaration<TestPipe');
        expect(dtsContents).toContain('ɵɵInjectableDeclaration<TestNgModule');
      });

      it('should not compile a component and a directive annotation on the same class', () => {
        env.write(
          'test.ts',
          `
        import {Component, Directive} from '@angular/core';

        @Component({
          selector: 'test',
          template: 'test',
          standalone: false,
        })
        @Directive({selector: 'test'})
        class ShouldNotCompile {}
      `,
        );

        const errors = env.driveDiagnostics();
        expect(errors.length).toBe(1);
        expect(errors[0].messageText).toContain('Two incompatible decorators on class');
      });

      it('should leave decorators present on jit: true directives', () => {
        env.write(
          'test.ts',
          `
        import {Directive, Inject} from '@angular/core';

        @Directive({
          selector: 'test',
          jit: true,
          standalone: false,
        })
        export class Test {
          constructor(@Inject('foo') foo: string) {}
        }
      `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain('Directive({');
        expect(jsContents).toContain(
          ` { type: String, decorators: [{ type: Inject, args: ['foo',] }] }`,
        );
      });
    });

    describe('compiling invalid @Injectables', () => {
      describe('with strictInjectionParameters = true', () => {
        it('should give a compile-time error if an invalid @Injectable is used with no arguments', () => {
          env.tsconfig({strictInjectionParameters: true});
          env.write(
            'test.ts',
            `
            import {Injectable} from '@angular/core';

            @Injectable()
            export class Test {
              constructor(private notInjectable: string) {}
            }
          `,
          );

          const errors = env.driveDiagnostics();
          expect(errors.length).toBe(1);
          expect(ts.flattenDiagnosticMessageText(errors[0].messageText, '\n')).toBe(
            `No suitable injection token for parameter 'notInjectable' of class 'Test'.\n` +
              `  Consider using the @Inject decorator to specify an injection token.`,
          );
          expect(errors[0].relatedInformation!.length).toBe(1);
          expect(errors[0].relatedInformation![0].messageText).toBe(
            'This type is not supported as injection token.',
          );
        });

        it('should give a compile-time error if an invalid @Injectable is used with an argument', () => {
          env.tsconfig({strictInjectionParameters: true});
          env.write(
            'test.ts',
            `
            import {Injectable} from '@angular/core';

            @Injectable({providedIn: 'root'})
            export class Test {
              constructor(private notInjectable: string) {}
            }
          `,
          );

          const errors = env.driveDiagnostics();
          expect(errors.length).toBe(1);
          expect(ts.flattenDiagnosticMessageText(errors[0].messageText, '\n')).toBe(
            `No suitable injection token for parameter 'notInjectable' of class 'Test'.\n` +
              `  Consider using the @Inject decorator to specify an injection token.`,
          );
          expect(errors[0].relatedInformation!.length).toBe(1);
          expect(errors[0].relatedInformation![0].messageText).toBe(
            'This type is not supported as injection token.',
          );
        });

        it('should report an error when using a symbol from a type-only import clause as injection token', () => {
          env.tsconfig({strictInjectionParameters: true});
          env.write(
            `types.ts`,
            `
              export class TypeOnly {}
            `,
          );
          env.write(
            `test.ts`,
            `
              import {Injectable} from '@angular/core';
              import type {TypeOnly} from './types';

              @Injectable()
              export class MyService {
                constructor(param: TypeOnly) {}
              }
            `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(ts.flattenDiagnosticMessageText(diags[0].messageText, '\n')).toBe(
            `No suitable injection token for parameter 'param' of class 'MyService'.\n` +
              `  Consider changing the type-only import to a regular import, ` +
              `or use the @Inject decorator to specify an injection token.`,
          );
          expect(diags[0].relatedInformation!.length).toBe(2);
          expect(diags[0].relatedInformation![0].messageText).toBe(
            'This type is imported using a type-only import, ' +
              'which prevents it from being usable as an injection token.',
          );
          expect(diags[0].relatedInformation![1].messageText).toBe(
            'The type-only import occurs here.',
          );
        });

        it('should report an error when using a symbol from a type-only import specifier as injection token', () => {
          env.tsconfig({strictInjectionParameters: true});
          env.write(
            `types.ts`,
            `
                export class TypeOnly {}
              `,
          );
          env.write(
            `test.ts`,
            `
                import {Injectable} from '@angular/core';
                import {type TypeOnly} from './types';

                @Injectable()
                export class MyService {
                  constructor(param: TypeOnly) {}
                }
              `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(ts.flattenDiagnosticMessageText(diags[0].messageText, '\n')).toBe(
            `No suitable injection token for parameter 'param' of class 'MyService'.\n` +
              `  Consider changing the type-only import to a regular import, ` +
              `or use the @Inject decorator to specify an injection token.`,
          );
          expect(diags[0].relatedInformation!.length).toBe(2);
          expect(diags[0].relatedInformation![0].messageText).toBe(
            'This type is imported using a type-only import, ' +
              'which prevents it from being usable as an injection token.',
          );
          expect(diags[0].relatedInformation![1].messageText).toBe(
            'The type-only import occurs here.',
          );
        });

        it('should report an error when using a primitive type as injection token', () => {
          env.tsconfig({strictInjectionParameters: true});
          env.write(
            `test.ts`,
            `
             import {Injectable} from '@angular/core';

             @Injectable()
             export class MyService {
               constructor(param: string) {}
             }
          `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(ts.flattenDiagnosticMessageText(diags[0].messageText, '\n')).toBe(
            `No suitable injection token for parameter 'param' of class 'MyService'.\n` +
              `  Consider using the @Inject decorator to specify an injection token.`,
          );
          expect(diags[0].relatedInformation!.length).toBe(1);
          expect(diags[0].relatedInformation![0].messageText).toBe(
            'This type is not supported as injection token.',
          );
        });

        it('should report an error when using a union type as injection token', () => {
          env.tsconfig({strictInjectionParameters: true});
          env.write(
            `test.ts`,
            `
             import {Injectable} from '@angular/core';

             export class ClassA {}
             export class ClassB {}

             @Injectable()
             export class MyService {
               constructor(param: ClassA|ClassB) {}
             }
          `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(ts.flattenDiagnosticMessageText(diags[0].messageText, '\n')).toBe(
            `No suitable injection token for parameter 'param' of class 'MyService'.\n` +
              `  Consider using the @Inject decorator to specify an injection token.`,
          );
          expect(diags[0].relatedInformation!.length).toBe(1);
          expect(diags[0].relatedInformation![0].messageText).toBe(
            'This type is not supported as injection token.',
          );
        });

        it('should report an error when using an interface as injection token', () => {
          env.tsconfig({strictInjectionParameters: true});
          env.write(
            `test.ts`,
            `
             import {Injectable} from '@angular/core';

             export interface Interface {}

             @Injectable()
             export class MyService {
               constructor(param: Interface) {}
             }
          `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(ts.flattenDiagnosticMessageText(diags[0].messageText, '\n')).toBe(
            `No suitable injection token for parameter 'param' of class 'MyService'.\n` +
              `  Consider using the @Inject decorator to specify an injection token.`,
          );
          expect(diags[0].relatedInformation!.length).toBe(2);
          expect(diags[0].relatedInformation![0].messageText).toBe(
            'This type does not have a value, so it cannot be used as injection token.',
          );
          expect(diags[0].relatedInformation![1].messageText).toBe('The type is declared here.');
        });

        it('should report an error when using a missing type as injection token', () => {
          // This test replicates the situation where a symbol does not have any
          // declarations at all, e.g. because it's imported from a missing module. This
          // would result in a semantic TypeScript diagnostic which we ignore in this
          // test to verify that ngtsc's analysis is able to operate in this situation.
          env.tsconfig({strictInjectionParameters: true});
          env.write(
            `test.ts`,
            `
             import {Injectable} from '@angular/core';
             // @ts-expect-error
             import {Interface} from 'missing';

             @Injectable()
             export class MyService {
               constructor(param: Interface) {}
             }
          `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(ts.flattenDiagnosticMessageText(diags[0].messageText, '\n')).toBe(
            `No suitable injection token for parameter 'param' of ` +
              `class 'MyService'.\n` +
              `  Consider using the @Inject decorator to specify an injection token.`,
          );
          expect(diags[0].relatedInformation!.length).toBe(1);
          expect(diags[0].relatedInformation![0].messageText).toBe(
            'This type does not have a value, so it cannot be used as injection token.',
          );
        });

        it('should report an error when no type is present', () => {
          env.tsconfig({strictInjectionParameters: true, noImplicitAny: false});
          env.write(
            `test.ts`,
            `
             import {Injectable} from '@angular/core';

             @Injectable()
             export class MyService {
               constructor(param) {}
             }
          `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(ts.flattenDiagnosticMessageText(diags[0].messageText, '\n')).toBe(
            `No suitable injection token for parameter 'param' of class 'MyService'.\n` +
              `  Consider adding a type to the parameter or ` +
              `use the @Inject decorator to specify an injection token.`,
          );
          expect(diags[0].relatedInformation).toBeUndefined();
        });

        it('should not give a compile-time error if an invalid @Injectable is used with useValue', () => {
          env.tsconfig({strictInjectionParameters: true});
          env.write(
            'test.ts',
            `
               import {Injectable} from '@angular/core';

               @Injectable({
                 providedIn: 'root',
                 useValue: '42',
               })
               export class Test {
                 constructor(private notInjectable: string) {}
               }
             `,
          );

          env.driveMain();
          const jsContents = env.getContents('test.js');
          expect(jsContents).toMatch(
            /function Test_Factory\(__ngFactoryType__\) { i0\.ɵɵinvalidFactory\(\)/m,
          );
        });

        it('should not give a compile-time error if an invalid @Injectable is used with useFactory', () => {
          env.tsconfig({strictInjectionParameters: true});
          env.write(
            'test.ts',
            `
               import {Injectable} from '@angular/core';

               @Injectable({
                 providedIn: 'root',
                 useFactory: () => '42',
               })
               export class Test {
                 constructor(private notInjectable: string) {}
               }
             `,
          );

          env.driveMain();
          const jsContents = env.getContents('test.js');
          expect(jsContents).toMatch(
            /function Test_Factory\(__ngFactoryType__\) { i0\.ɵɵinvalidFactory\(\)/m,
          );
        });

        it('should not give a compile-time error if an invalid @Injectable is used with useExisting', () => {
          env.tsconfig({strictInjectionParameters: true});
          env.write(
            'test.ts',
            `
               import {Injectable} from '@angular/core';

               export class MyService {}

               @Injectable({
                 providedIn: 'root',
                 useExisting: MyService,
               })
               export class Test {
                 constructor(private notInjectable: string) {}
               }
             `,
          );

          env.driveMain();
          const jsContents = env.getContents('test.js');
          expect(jsContents).toMatch(
            /function Test_Factory\(__ngFactoryType__\) { i0\.ɵɵinvalidFactory\(\)/m,
          );
        });

        it('should not give a compile-time error if an invalid @Injectable is used with useClass', () => {
          env.tsconfig({strictInjectionParameters: true});
          env.write(
            'test.ts',
            `
               import {Injectable} from '@angular/core';

               export class MyService {}

               @Injectable({
                 providedIn: 'root',
                 useClass: MyService,
               })
               export class Test {
                 constructor(private notInjectable: string) {}
               }
             `,
          );

          env.driveMain();
          const jsContents = env.getContents('test.js');
          expect(jsContents).toMatch(
            /function Test_Factory\(__ngFactoryType__\) { i0\.ɵɵinvalidFactory\(\)/m,
          );
        });

        it('should not give a compile-time error if an invalid @Injectable without providedIn is an abstract class', () => {
          env.tsconfig({strictInjectionParameters: true});
          env.write(
            'test.ts',
            `
               import {Injectable} from '@angular/core';

               @Injectable()
               export abstract class Test {
                 constructor(private notInjectable: string) {}
               }
             `,
          );

          env.driveMain();
          const jsContents = env.getContents('test.js');
          expect(jsContents).toMatch(
            /function Test_Factory\(__ngFactoryType__\) { i0\.ɵɵinvalidFactory\(\)/m,
          );
        });

        it('should not give a compile-time error if an invalid @Injectable with providedIn is an abstract class', () => {
          env.tsconfig({strictInjectionParameters: true});
          env.write(
            'test.ts',
            `
               import {Injectable} from '@angular/core';

               @Injectable({
                 providedIn: 'root',
               })
               export abstract class Test {
                 constructor(private notInjectable: string) {}
               }
             `,
          );

          env.driveMain();
          const jsContents = env.getContents('test.js');
          expect(jsContents).toMatch(
            /function Test_Factory\(__ngFactoryType__\) { i0\.ɵɵinvalidFactory\(\)/m,
          );
        });

        it('should give a compile-time error when a derived Directive inherits an invalid constructor', () => {
          env.tsconfig({strictInjectionParameters: true});
          env.write(
            'test.ts',
            `
               import {Directive} from '@angular/core';

               @Directive()
               export abstract class ParentDir {
                 constructor(private notInjectable: string) {}
               }

               @Directive()
               export abstract class AbstractMiddleDir extends ParentDir {}

               @Directive()
               export class ConcreteMiddleDir extends AbstractMiddleDir {}

               @Directive()
               export class ConcreteDirWithoutCtor extends ConcreteMiddleDir {}

               @Directive()
               export class ConcreteDirWithCtor extends ConcreteMiddleDir {
                 constructor() {
                   super('correct');
                 }
               }

               @Directive()
               export class ConcreteDerivedDirWithoutCtor extends ConcreteDirWithCtor {}
             `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(2);
          expect(diags[0].code).toBe(
            ngErrorCode(ErrorCode.INJECTABLE_INHERITS_INVALID_CONSTRUCTOR),
          );
          expect(diags[0].messageText).toEqual(
            `The directive ConcreteMiddleDir inherits its constructor from ParentDir, but the latter has ` +
              `a constructor parameter that is not compatible with dependency injection. Either add an explicit ` +
              `constructor to ConcreteMiddleDir or change ParentDir's constructor to use parameters that are ` +
              `valid for DI.`,
          );
          expect(getDiagnosticSourceCode(diags[0])).toBe('ConcreteMiddleDir');

          expect(diags[1].code).toBe(
            ngErrorCode(ErrorCode.INJECTABLE_INHERITS_INVALID_CONSTRUCTOR),
          );
          expect(diags[1].messageText).toEqual(
            `The directive ConcreteDirWithoutCtor inherits its constructor from ParentDir, but the latter ` +
              `has a constructor parameter that is not compatible with dependency injection. Either add an ` +
              `explicit constructor to ConcreteDirWithoutCtor or change ParentDir's constructor to use ` +
              `parameters that are valid for DI.`,
          );
          expect(getDiagnosticSourceCode(diags[1])).toBe('ConcreteDirWithoutCtor');
        });

        it('should give a compile-time error when a derived Injectable inherits an invalid constructor', () => {
          env.tsconfig({strictInjectionParameters: true});
          env.write(
            'test.ts',
            `
               import {Injectable} from '@angular/core';

               @Injectable()
               export abstract class ParentService {
                 constructor(private notInjectable: string) {}
               }

               @Injectable()
               export abstract class AbstractMiddleService extends ParentService {}

               @Injectable()
               export class ConcreteMiddleService extends AbstractMiddleService {}

               @Injectable()
               export class ConcreteServiceWithoutCtor extends ConcreteMiddleService {}

               @Injectable()
               export class ConcreteServiceWithCtor extends ConcreteMiddleService {
                 constructor() {
                   super('correct');
                 }
               }

               @Injectable()
               export class ConcreteDerivedServiceWithoutCtor extends ConcreteServiceWithCtor {}

               @Injectable({ providedIn: 'root' })
               export class ProvidedInRootService extends ParentService {}

               @Injectable({ providedIn: 'root', useFactory: () => null })
               export class UseFactoryService extends ParentService {}

               @Injectable({ providedIn: 'root', useValue: null })
               export class UseValueService extends ParentService {}

               @Injectable({ providedIn: 'root', useClass: ConcreteServiceWithCtor })
               export class UseClassService extends ParentService {}

               @Injectable({ providedIn: 'root', useExisting: ConcreteServiceWithCtor })
               export class UseExistingService extends ParentService {}
             `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(3);
          expect(diags[0].code).toBe(
            ngErrorCode(ErrorCode.INJECTABLE_INHERITS_INVALID_CONSTRUCTOR),
          );
          expect(diags[0].messageText).toEqual(
            `The injectable ConcreteMiddleService inherits its constructor from ParentService, but the ` +
              `latter has a constructor parameter that is not compatible with dependency injection. Either add ` +
              `an explicit constructor to ConcreteMiddleService or change ParentService's constructor to use ` +
              `parameters that are valid for DI.`,
          );
          expect(getDiagnosticSourceCode(diags[0])).toBe('ConcreteMiddleService');

          expect(diags[1].code).toBe(
            ngErrorCode(ErrorCode.INJECTABLE_INHERITS_INVALID_CONSTRUCTOR),
          );
          expect(diags[1].messageText).toEqual(
            `The injectable ConcreteServiceWithoutCtor inherits its constructor from ParentService, but the ` +
              `latter has a constructor parameter that is not compatible with dependency injection. Either add ` +
              `an explicit constructor to ConcreteServiceWithoutCtor or change ParentService's constructor to ` +
              `use parameters that are valid for DI.`,
          );
          expect(getDiagnosticSourceCode(diags[1])).toBe('ConcreteServiceWithoutCtor');

          expect(diags[2].code).toBe(
            ngErrorCode(ErrorCode.INJECTABLE_INHERITS_INVALID_CONSTRUCTOR),
          );
          expect(diags[2].messageText).toEqual(
            `The injectable ProvidedInRootService inherits its constructor from ParentService, but the ` +
              `latter has a constructor parameter that is not compatible with dependency injection. Either add ` +
              `an explicit constructor to ProvidedInRootService or change ParentService's constructor to use ` +
              `parameters that are valid for DI.`,
          );
          expect(getDiagnosticSourceCode(diags[2])).toBe('ProvidedInRootService');
        });

        it('should give a compile-time error when a derived Directive inherits from a non-decorated class', () => {
          env.tsconfig({strictInjectionParameters: true});
          env.write(
            'test.ts',
            `
               import {Directive} from '@angular/core';

               export abstract class ParentClass {
                 constructor(private notInjectable: string) {}
               }

               @Directive()
               export abstract class AbstractMiddleDir extends ParentClass {}

               @Directive()
               export class ConcreteMiddleDir extends AbstractMiddleDir {}

               @Directive()
               export class ConcreteDirWithoutCtor extends ConcreteMiddleDir {}

               @Directive()
               export class ConcreteDirWithCtor extends ConcreteMiddleDir {
                 constructor() {
                   super('correct');
                 }
               }

               @Directive()
               export class ConcreteDerivedDirWithoutCtor extends ConcreteDirWithCtor {}
             `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(3);
          expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DIRECTIVE_INHERITS_UNDECORATED_CTOR));
          expect(diags[0].messageText).toEqual(
            `The directive AbstractMiddleDir inherits its constructor from ParentClass, but the latter ` +
              `does not have an Angular decorator of its own. Dependency injection will not be able to resolve ` +
              `the parameters of ParentClass's constructor. Either add a @Directive decorator to ParentClass, ` +
              `or add an explicit constructor to AbstractMiddleDir.`,
          );
          expect(getDiagnosticSourceCode(diags[0])).toBe('AbstractMiddleDir');

          expect(diags[1].code).toBe(ngErrorCode(ErrorCode.DIRECTIVE_INHERITS_UNDECORATED_CTOR));
          expect(diags[1].messageText).toEqual(
            `The directive ConcreteMiddleDir inherits its constructor from ParentClass, but the latter ` +
              `does not have an Angular decorator of its own. Dependency injection will not be able to resolve ` +
              `the parameters of ParentClass's constructor. Either add a @Directive decorator to ParentClass, or ` +
              `add an explicit constructor to ConcreteMiddleDir.`,
          );
          expect(getDiagnosticSourceCode(diags[1])).toBe('ConcreteMiddleDir');

          expect(diags[2].code).toBe(ngErrorCode(ErrorCode.DIRECTIVE_INHERITS_UNDECORATED_CTOR));
          expect(diags[2].messageText).toEqual(
            `The directive ConcreteDirWithoutCtor inherits its constructor from ParentClass, but the latter ` +
              `does not have an Angular decorator of its own. Dependency injection will not be able to resolve ` +
              `the parameters of ParentClass's constructor. Either add a @Directive decorator to ParentClass, ` +
              `or add an explicit constructor to ConcreteDirWithoutCtor.`,
          );
          expect(getDiagnosticSourceCode(diags[2])).toBe('ConcreteDirWithoutCtor');
        });

        // https://github.com/angular/angular/issues/48152
        it('should not give a compile-time error when a class inherits from foreign compilation unit', () => {
          env.tsconfig({strictInjectionParameters: true});
          env.write(
            'node_modules/external/index.d.ts',
            `
               import * as i0 from '@angular/core';

               export abstract class ExternalClass {
                 static ɵprov: i0.ɵɵInjectableDeclaration<ExternalClass>;
                 static ɵfac: i0.ɵɵFactoryDeclaration<ExternalClass, never>

                 constructor(invalid: string) {}
               }
          `,
          );
          env.write(
            'test.ts',
            `
               import {Directive} from '@angular/core';
               import {ExternalClass} from 'external';

               @Directive()
               export abstract class AbstractMiddleDir extends ExternalClass {}

               @Directive()
               export class ConcreteMiddleDir extends AbstractMiddleDir {}

               @Directive()
               export class ConcreteDirWithoutCtor extends ConcreteMiddleDir {}
             `,
          );

          env.driveMain();
        });
      });

      describe('with strictInjectionParameters = false', () => {
        it('should compile an @Injectable on a class with a non-injectable constructor', () => {
          env.tsconfig({strictInjectionParameters: false});
          env.write(
            'test.ts',
            `
            import {Injectable} from '@angular/core';

            @Injectable()
            export class Test {
              constructor(private notInjectable: string) {}
            }
          `,
          );

          env.driveMain();
          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain(
            'Test.ɵfac = function Test_Factory(__ngFactoryType__) { i0.ɵɵinvalidFactory()',
          );
        });

        it('should compile an @Injectable provided in the root on a class with a non-injectable constructor', () => {
          env.tsconfig({strictInjectionParameters: false});
          env.write(
            'test.ts',
            `
              import {Injectable} from '@angular/core';
              @Injectable({providedIn: 'root'})
              export class Test {
                constructor(private notInjectable: string) {}
              }
            `,
          );

          env.driveMain();
          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain(
            'Test.ɵfac = function Test_Factory(__ngFactoryType__) { i0.ɵɵinvalidFactory()',
          );
        });

        it('should compile when a derived Directive inherits an invalid constructor', () => {
          env.tsconfig({strictInjectionParameters: false});
          env.write(
            'test.ts',
            `
               import {Directive} from '@angular/core';

               @Directive()
               export abstract class ParentDir {
                 constructor(private notInjectable: string) {}
               }

               @Directive()
               export abstract class AbstractMiddleDir extends ParentDir {}

               @Directive()
               export class ConcreteMiddleDir extends AbstractMiddleDir {}

               @Directive()
               export class ConcreteDirWithoutCtor extends ConcreteMiddleDir {}

               @Directive()
               export class ConcreteDirWithCtor extends ConcreteMiddleDir {
                 constructor() {
                   super('correct');
                 }
               }

               @Directive()
               export class ConcreteDerivedDirWithoutCtor extends ConcreteDirWithCtor {}
             `,
          );

          env.driveMain();
        });

        it('should compile when a derived Injectable inherits an invalid constructor', () => {
          env.tsconfig({strictInjectionParameters: false});
          env.write(
            'test.ts',
            `
               import {Injectable} from '@angular/core';

               @Injectable()
               export abstract class ParentService {
                 constructor(private notInjectable: string) {}
               }

               @Injectable()
               export abstract class AbstractMiddleService extends ParentService {}

               @Injectable()
               export class ConcreteMiddleService extends AbstractMiddleService {}

               @Injectable()
               export class ConcreteServiceWithoutCtor extends ConcreteMiddleService {}

               @Injectable()
               export class ConcreteServiceWithCtor extends ConcreteMiddleService {
                 constructor() {
                   super('correct');
                 }
               }

               @Injectable()
               export class ConcreteDerivedServiceWithoutCtor extends ConcreteServiceWithCtor {}

               @Injectable({ providedIn: 'root' })
               export class ProvidedInRootService extends ParentService {}

               @Injectable({ providedIn: 'root', useFactory: () => null })
               export class UseFactoryService extends ParentService {}

               @Injectable({ providedIn: 'root', useValue: null })
               export class UseValueService extends ParentService {}

               @Injectable({ providedIn: 'root', useClass: ConcreteServiceWithCtor })
               export class UseClassService extends ParentService {}

               @Injectable({ providedIn: 'root', useExisting: ConcreteServiceWithCtor })
               export class UseExistingService extends ParentService {}
             `,
          );

          env.driveMain();
        });

        it('should give a compile-time error when a derived Directive inherits from a non-decorated class', () => {
          // Errors for undecorated base classes should always be reported, even under
          // `strictInjectionParameters`.
          env.tsconfig({strictInjectionParameters: false});
          env.write(
            'test.ts',
            `
               import {Directive} from '@angular/core';

               export abstract class ParentClass {
                 constructor(private notInjectable: string) {}
               }

               @Directive()
               export abstract class AbstractMiddleDir extends ParentClass {}

               @Directive()
               export class ConcreteMiddleDir extends AbstractMiddleDir {}

               @Directive()
               export class ConcreteDirWithoutCtor extends ConcreteMiddleDir {}

               @Directive()
               export class ConcreteDirWithCtor extends ConcreteMiddleDir {
                 constructor() {
                   super('correct');
                 }
               }

               @Directive()
               export class ConcreteDerivedDirWithoutCtor extends ConcreteDirWithCtor {}
             `,
          );

          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(3);
          expect(diags[0].code).toBe(ngErrorCode(ErrorCode.DIRECTIVE_INHERITS_UNDECORATED_CTOR));
          expect(diags[0].messageText).toEqual(
            `The directive AbstractMiddleDir inherits its constructor from ParentClass, but the latter ` +
              `does not have an Angular decorator of its own. Dependency injection will not be able to resolve ` +
              `the parameters of ParentClass's constructor. Either add a @Directive decorator to ParentClass, ` +
              `or add an explicit constructor to AbstractMiddleDir.`,
          );
          expect(getDiagnosticSourceCode(diags[0])).toBe('AbstractMiddleDir');

          expect(diags[1].code).toBe(ngErrorCode(ErrorCode.DIRECTIVE_INHERITS_UNDECORATED_CTOR));
          expect(diags[1].messageText).toEqual(
            `The directive ConcreteMiddleDir inherits its constructor from ParentClass, but the latter ` +
              `does not have an Angular decorator of its own. Dependency injection will not be able to resolve ` +
              `the parameters of ParentClass's constructor. Either add a @Directive decorator to ParentClass, ` +
              `or add an explicit constructor to ConcreteMiddleDir.`,
          );
          expect(getDiagnosticSourceCode(diags[1])).toBe('ConcreteMiddleDir');

          expect(diags[2].code).toBe(ngErrorCode(ErrorCode.DIRECTIVE_INHERITS_UNDECORATED_CTOR));
          expect(diags[2].messageText).toEqual(
            `The directive ConcreteDirWithoutCtor inherits its constructor from ParentClass, but the latter ` +
              `does not have an Angular decorator of its own. Dependency injection will not be able to resolve ` +
              `the parameters of ParentClass's constructor. Either add a @Directive decorator to ParentClass, ` +
              `or add an explicit constructor to ConcreteDirWithoutCtor.`,
          );
          expect(getDiagnosticSourceCode(diags[2])).toBe('ConcreteDirWithoutCtor');
        });
      });
    });

    describe('compiling invalid @Directives', () => {
      describe('directives with a selector', () => {
        it('should give a compile-time error if an invalid constructor is used', () => {
          env.tsconfig({strictInjectionParameters: true});
          env.write(
            'test.ts',
            `
            import {Directive} from '@angular/core';

            @Directive({selector: 'app-test'})
            export class Test {
              constructor(private notInjectable: string) {}
            }
          `,
          );

          const errors = env.driveDiagnostics();
          expect(errors.length).toBe(1);
          expect(ts.flattenDiagnosticMessageText(errors[0].messageText, '\n')).toContain(
            'No suitable injection token for parameter',
          );
        });
      });

      describe('abstract directives', () => {
        it('should generate a factory function that throws', () => {
          env.tsconfig({strictInjectionParameters: false});
          env.write(
            'test.ts',
            `
          import {Directive} from '@angular/core';

          @Directive()
          export class Test {
            constructor(private notInjectable: string) {}
          }
        `,
          );

          env.driveMain();
          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain(
            'Test.ɵfac = function Test_Factory(__ngFactoryType__) { i0.ɵɵinvalidFactory()',
          );
        });
      });

      it('should generate a factory function that throws, even under strictInjectionParameters', () => {
        env.tsconfig({strictInjectionParameters: true});
        env.write(
          'test.ts',
          `
        import {Directive} from '@angular/core';

        @Directive()
        export class Test {
          constructor(private notInjectable: string) {}
        }
      `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain(
          'Test.ɵfac = function Test_Factory(__ngFactoryType__) { i0.ɵɵinvalidFactory()',
        );
      });
    });

    describe('templateUrl and styleUrls processing', () => {
      const testsForResource = (resource: string) => [
        // [component location, resource location, resource reference]

        // component and resource are in the same folder
        [`a/app.ts`, `a/${resource}`, `./${resource}`], //
        [`a/app.ts`, `a/${resource}`, resource], //
        [`a/app.ts`, `a/${resource}`, `/a/${resource}`],

        // resource is one level up
        [`a/app.ts`, resource, `../${resource}`], //
        [`a/app.ts`, resource, `/${resource}`],

        // component and resource are in different folders
        [`a/app.ts`, `b/${resource}`, `../b/${resource}`], //
        [`a/app.ts`, `b/${resource}`, `/b/${resource}`],

        // resource is in subfolder of component directory
        [`a/app.ts`, `a/b/c/${resource}`, `./b/c/${resource}`], //
        [`a/app.ts`, `a/b/c/${resource}`, `b/c/${resource}`], //
        [`a/app.ts`, `a/b/c/${resource}`, `/a/b/c/${resource}`],
      ];

      testsForResource('style.css').forEach((test) => {
        const [compLoc, styleLoc, styleRef] = test;
        it(`should handle ${styleRef}`, () => {
          env.write(styleLoc, ':host { background-color: blue; }');
          env.write(
            compLoc,
            `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            styleUrls: ['${styleRef}'],
            template: '...',
          })
          export class TestCmp {}
        `,
          );

          env.driveMain();

          const jsContents = env.getContents(compLoc.replace('.ts', '.js'));
          expect(jsContents).toContain('background-color: blue');
        });
      });

      testsForResource('template.html').forEach((test) => {
        const [compLoc, templateLoc, templateRef] = test;
        it(`should handle ${templateRef}`, () => {
          env.write(templateLoc, 'Template Content');
          env.write(
            compLoc,
            `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            templateUrl: '${templateRef}'
          })
          export class TestCmp {}
        `,
          );

          env.driveMain();

          const jsContents = env.getContents(compLoc.replace('.ts', '.js'));
          expect(jsContents).toContain('Template Content');
        });
      });
    });

    describe('former View Engine AST transform bugs', () => {
      it('should compile array literals behind conditionals', () => {
        env.write(
          'test.ts',
          `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test',
          template: '{{value ? "yes" : [no]}}',
        })
        class TestCmp {
          value = true;
          no = 'no';
        }
      `,
        );

        env.driveMain();
        expect(env.getContents('test.js')).toContain('i0.ɵɵpureFunction1');
      });

      it('should compile array literals inside function arguments', () => {
        env.write(
          'test.ts',
          `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test',
          template: '{{fn([test])}}',
        })
        class TestCmp {
          fn(arg: any): string {
            return 'test';
          }

          test = 'test';
        }
      `,
        );

        env.driveMain();
        expect(env.getContents('test.js')).toContain('i0.ɵɵpureFunction1');
      });
    });

    describe('unwrapping ModuleWithProviders functions', () => {
      it('should use a local ModuleWithProviders-annotated return type if a function is not statically analyzable', () => {
        env.write(
          `module.ts`,
          `
            import {NgModule, ModuleWithProviders} from '@angular/core';

            export function notStaticallyAnalyzable(): ModuleWithProviders<SomeModule> {
              console.log('this interferes with static analysis');
              return {
                ngModule: SomeModule,
                providers: [],
              };
            }

            @NgModule()
            export class SomeModule {}
          `,
        );

        env.write(
          'test.ts',
          `
            import {NgModule} from '@angular/core';
            import {notStaticallyAnalyzable} from './module';

            @NgModule({
              imports: [notStaticallyAnalyzable()]
            })
            export class TestModule {}
          `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain('imports: [notStaticallyAnalyzable()]');

        const dtsContents = env.getContents('test.d.ts');
        expect(dtsContents).toContain(`import * as i1 from "./module";`);
        expect(dtsContents).toContain(
          'i0.ɵɵNgModuleDeclaration<TestModule, never, [typeof i1.SomeModule], never>',
        );
      });

      it("should extract the generic type and include it in the module's declaration", () => {
        env.write(
          `test.ts`,
          `
        import {NgModule} from '@angular/core';
        import {RouterModule} from 'router';

        @NgModule({imports: [RouterModule.forRoot()]})
        export class TestModule {}
    `,
        );

        env.write(
          'node_modules/router/index.d.ts',
          `
        import {ModuleWithProviders, ɵɵNgModuleDeclaration} from '@angular/core';

        declare class RouterModule {
          static forRoot(): ModuleWithProviders<RouterModule>;
          static ɵmod: ɵɵNgModuleDeclaration<RouterModule, never, never, never>;
        }
    `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain('imports: [RouterModule.forRoot()]');

        const dtsContents = env.getContents('test.d.ts');
        expect(dtsContents).toContain(`import * as i1 from "router";`);
        expect(dtsContents).toContain(
          'i0.ɵɵNgModuleDeclaration<TestModule, never, [typeof i1.RouterModule], never>',
        );
      });

      it('should throw if ModuleWithProviders is missing its generic type argument', () => {
        env.write(
          `test.ts`,
          `
          import {NgModule} from '@angular/core';
          import {RouterModule} from 'router';

          @NgModule({imports: [RouterModule.forRoot()]})
          export class TestModule {}
        `,
        );

        env.write(
          'node_modules/router/index.d.ts',
          `
          import {ModuleWithProviders, ɵɵNgModuleDeclaration} from '@angular/core';

          declare class RouterModule {
            static forRoot(): ModuleWithProviders;
            static ɵmod: ɵɵNgModuleDeclaration<RouterModule, never, never, never>;
          }
        `,
        );
        const errors = env.driveDiagnostics();
        expect(trim(errors[0].messageText as string)).toContain(
          `RouterModule.forRoot returns a ModuleWithProviders type without a generic type argument. ` +
            `Please add a generic type argument to the ModuleWithProviders type. If this ` +
            `occurrence is in library code you don't control, please contact the library authors.`,
        );
      });

      it('should extract the generic type if it is provided as qualified type name', () => {
        env.write(
          `test.ts`,
          `
        import {NgModule} from '@angular/core';
        import {RouterModule} from 'router';

        @NgModule({imports: [RouterModule.forRoot()]})
        export class TestModule {}
    `,
        );

        env.write(
          'node_modules/router/index.d.ts',
          `
        import {ModuleWithProviders} from '@angular/core';
        import * as internal from './internal';
        export {InternalRouterModule} from './internal';

        declare export class RouterModule {
          static forRoot(): ModuleWithProviders<internal.InternalRouterModule>;
        }

    `,
        );

        env.write(
          'node_modules/router/internal.d.ts',
          `
        import {ɵɵNgModuleDeclaration} from '@angular/core';
        export declare class InternalRouterModule {
          static ɵmod: ɵɵNgModuleDeclaration<InternalRouterModule, never, never, never>;
        }
    `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain('imports: [RouterModule.forRoot()]');

        const dtsContents = env.getContents('test.d.ts');
        expect(dtsContents).toContain(`import * as i1 from "router";`);
        expect(dtsContents).toContain(
          'i0.ɵɵNgModuleDeclaration<TestModule, never, [typeof i1.InternalRouterModule], never>',
        );
      });

      it('should extract the generic type if it is provided as qualified type name from another package', () => {
        env.write(
          `test.ts`,
          `
            import {NgModule} from '@angular/core';
            import {RouterModule} from 'router';

            @NgModule({imports: [RouterModule.forRoot()]})
            export class TestModule {}`,
        );

        env.write(
          'node_modules/router/index.d.ts',
          `
            import {ModuleWithProviders} from '@angular/core';
            import * as router2 from 'router2';

            declare export class RouterModule {
              static forRoot(): ModuleWithProviders<router2.Router2Module>;
            }`,
        );

        env.write(
          'node_modules/router2/index.d.ts',
          `
            import {ɵɵNgModuleDeclaration} from '@angular/core';
            export declare class Router2Module {
              static ɵmod: ɵɵNgModuleDeclaration<Router2Module, never, never, never>;
            }`,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain('imports: [RouterModule.forRoot()]');

        const dtsContents = env.getContents('test.d.ts');
        expect(dtsContents).toContain(`import * as i1 from "router2";`);
        expect(dtsContents).toContain(
          'i0.ɵɵNgModuleDeclaration<TestModule, never, [typeof i1.Router2Module], never>',
        );
      });

      it('should not reference a constant with a ModuleWithProviders value in module def imports', () => {
        env.write(
          'dep.d.ts',
          `
          import {ModuleWithProviders, ɵɵNgModuleDeclaration as ɵɵNgModuleDeclaration} from '@angular/core';

          export declare class DepModule {
            static forRoot(arg1: any, arg2: any): ModuleWithProviders<DepModule>;
            static ɵmod: ɵɵNgModuleDeclaration<DepModule, never, never, never>;
          }
        `,
        );
        env.write(
          'test.ts',
          `
          import {NgModule, ModuleWithProviders} from '@angular/core';
          import {DepModule} from './dep';

          @NgModule({})
          export class Base {}

          const mwp = DepModule.forRoot(1,2);

          @NgModule({
            imports: [mwp],
          })
          export class Module {}
        `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain('imports: [i1.DepModule]');
      });
    });

    it('should unwrap a ModuleWithProviders-like function if a matching literal type is provided for it', () => {
      env.write(
        `test.ts`,
        `
      import {NgModule} from '@angular/core';
      import {RouterModule} from 'router';

      @NgModule({imports: [RouterModule.forRoot()]})
      export class TestModule {}
  `,
      );

      env.write(
        'node_modules/router/index.d.ts',
        `
      import {ModuleWithProviders, ɵɵNgModuleDeclaration} from '@angular/core';

      export interface MyType extends ModuleWithProviders {}

      declare class RouterModule {
        static forRoot(): (MyType)&{ngModule: typeof RouterModule};
        static ɵmod: ɵɵNgModuleDeclaration<RouterModule, never, never, never>;
      }
  `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('imports: [RouterModule.forRoot()]');

      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain(`import * as i1 from "router";`);
      expect(dtsContents).toContain(
        'i0.ɵɵNgModuleDeclaration<TestModule, never, [typeof i1.RouterModule], never>',
      );
    });

    it('should unwrap a namespace imported ModuleWithProviders function if a generic type is provided for it', () => {
      env.write(
        `test.ts`,
        `
        import {NgModule} from '@angular/core';
        import {RouterModule} from 'router';

        @NgModule({imports: [RouterModule.forRoot()]})
        export class TestModule {}
    `,
      );

      env.write(
        'node_modules/router/index.d.ts',
        `
        import * as core from '@angular/core';
        import {RouterModule} from 'router';

        declare class RouterModule {
          static forRoot(): core.ModuleWithProviders<RouterModule>;
          static ɵmod: ɵɵNgModuleDeclaration<RouterModule, never, never, never>;
        }
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('imports: [RouterModule.forRoot()]');

      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain(`import * as i1 from "router";`);
      expect(dtsContents).toContain(
        'i0.ɵɵNgModuleDeclaration<TestModule, never, [typeof i1.RouterModule], never>',
      );
    });

    it('should inject special types according to the metadata', () => {
      env.write(
        `test.ts`,
        `
        import {
          Attribute,
          ChangeDetectorRef,
          Component,
          ElementRef,
          Injector,
          Renderer2,
          TemplateRef,
          ViewContainerRef,
        } from '@angular/core';

        @Component({
          selector: 'test',
          template: 'Test',
        })
        class FooCmp {
          constructor(
            @Attribute("test") attr: string,
            cdr: ChangeDetectorRef,
            er: ElementRef,
            i: Injector,
            r2: Renderer2,
            tr: TemplateRef<unknown>,
            vcr: ViewContainerRef,
          ) {}
        }
    `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain(
        `FooCmp.ɵfac = function FooCmp_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FooCmp)(i0.ɵɵinjectAttribute("test"), i0.ɵɵdirectiveInject(i0.ChangeDetectorRef), i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(i0.Injector), i0.ɵɵdirectiveInject(i0.Renderer2), i0.ɵɵdirectiveInject(i0.TemplateRef), i0.ɵɵdirectiveInject(i0.ViewContainerRef)); }`,
      );
    });

    it('should include constructor dependency metadata for directives/components/pipes', () => {
      env.write(
        `test.ts`,
        `
        import {Attribute, Component, Directive, Pipe, Self, SkipSelf, Host, Optional} from '@angular/core';

        export class MyService {}
        export function dynamic() {return ''};

        @Directive()
        export class WithDecorators {
          constructor(
            @Self() withSelf: MyService,
            @SkipSelf() withSkipSelf: MyService,
            @Host() withHost: MyService,
            @Optional() withOptional: MyService,
            @Attribute("attr") withAttribute: string,
            @Attribute(dynamic()) withAttributeDynamic: string,
            @Optional() @SkipSelf() @Host() withMany: MyService,
            noDecorators: MyService) {}
        }

        @Directive()
        export class NoCtor {}

        @Directive()
        export class EmptyCtor {
          constructor() {}
        }

        @Directive()
        export class WithoutDecorators {
          constructor(noDecorators: MyService) {}
        }

        @Component({ template: 'test' })
        export class MyCmp {
          constructor(@Host() withHost: MyService) {}
        }

        @Pipe({ name: 'test' })
        export class MyPipe {
          constructor(@Host() withHost: MyService) {}
        }
    `,
      );

      env.driveMain();
      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain(
        'static ɵfac: i0.ɵɵFactoryDeclaration<WithDecorators, [' +
          '{ self: true; }, { skipSelf: true; }, { host: true; }, ' +
          '{ optional: true; }, { attribute: "attr"; }, { attribute: unknown; }, ' +
          '{ optional: true; host: true; skipSelf: true; }, null]>',
      );
      expect(dtsContents).toContain(`static ɵfac: i0.ɵɵFactoryDeclaration<NoCtor, never>`);
      expect(dtsContents).toContain(`static ɵfac: i0.ɵɵFactoryDeclaration<EmptyCtor, never>`);
      expect(dtsContents).toContain(
        `static ɵfac: i0.ɵɵFactoryDeclaration<WithoutDecorators, never>`,
      );
      expect(dtsContents).toContain(
        `static ɵfac: i0.ɵɵFactoryDeclaration<MyCmp, [{ host: true; }]>`,
      );
      expect(dtsContents).toContain(
        `static ɵfac: i0.ɵɵFactoryDeclaration<MyPipe, [{ host: true; }]>`,
      );
    });

    it('should include constructor dependency metadata for @Injectable', () => {
      env.write(
        `test.ts`,
        `
        import {Injectable, Self, Host} from '@angular/core';

        export class MyService {}

        @Injectable()
        export class Inj {
          constructor(@Self() service: MyService) {}
        }

        @Injectable({ useExisting: MyService, providedIn: 'root' })
        export class InjUseExisting {
          constructor(@Self() service: MyService) {}
        }

        @Injectable({ useClass: MyService, providedIn: 'root' })
        export class InjUseClass {
          constructor(@Self() service: MyService) {}
        }

        @Injectable({ useClass: MyService, deps: [[new Host(), MyService]], providedIn: 'root' })
        export class InjUseClassWithDeps {
          constructor(@Self() service: MyService) {}
        }

        @Injectable({ useFactory: () => new MyService(), providedIn: 'root' })
        export class InjUseFactory {
          constructor(@Self() service: MyService) {}
        }

        @Injectable({ useFactory: (service: MyService) => service, deps: [[new Host(), MyService]], providedIn: 'root'})
        export class InjUseFactoryWithDeps {
          constructor(@Self() service: MyService) {}
        }

        @Injectable({ useValue: new MyService(), providedIn: 'root' })
        export class InjUseValue {
          constructor(@Self() service: MyService) {}
        }
    `,
      );

      env.driveMain();
      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain(`static ɵfac: i0.ɵɵFactoryDeclaration<Inj, [{ self: true; }]>`);
      expect(dtsContents).toContain(
        `static ɵfac: i0.ɵɵFactoryDeclaration<InjUseExisting, [{ self: true; }]>`,
      );
      expect(dtsContents).toContain(
        `static ɵfac: i0.ɵɵFactoryDeclaration<InjUseClass, [{ self: true; }]>`,
      );
      expect(dtsContents).toContain(
        `static ɵfac: i0.ɵɵFactoryDeclaration<InjUseClassWithDeps, [{ self: true; }]>`,
      );
      expect(dtsContents).toContain(
        `static ɵfac: i0.ɵɵFactoryDeclaration<InjUseFactory, [{ self: true; }]>`,
      );
      expect(dtsContents).toContain(
        `static ɵfac: i0.ɵɵFactoryDeclaration<InjUseFactoryWithDeps, [{ self: true; }]>`,
      );
      expect(dtsContents).toContain(
        `static ɵfac: i0.ɵɵFactoryDeclaration<InjUseValue, [{ self: true; }]>`,
      );
    });

    it('should include ng-content selectors in the metadata', () => {
      env.write(
        `test.ts`,
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<ng-content></ng-content> <ng-content select=".foo"></ng-content>',
          standalone: false,
        })
        export class TestCmp {
        }
    `,
      );

      env.driveMain();
      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain(
        'static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "test", never, {}, {}, never, ["*", ".foo"], false, never>',
      );
    });

    it('should generate queries for components', () => {
      env.write(
        `test.ts`,
        `
        import {Component, ContentChild, ContentChildren, TemplateRef, ViewChild} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div #foo></div>',
          queries: {
            'mview': new ViewChild('test1'),
            'mcontent': new ContentChild('test2'),
          }
        })
        class FooCmp {
          @ContentChild('bar', {read: TemplateRef}) child: any;
          @ContentChildren(TemplateRef) children: any;
          get aview(): any { return null; }
          @ViewChild('accessor') set aview(value: any) {}
        }
    `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toMatch(varRegExp('bar'));
      expect(jsContents).toMatch(varRegExp('test1'));
      expect(jsContents).toMatch(varRegExp('test2'));
      expect(jsContents).toMatch(varRegExp('accessor'));
      // match `i0.ɵɵcontentQuery(dirIndex, _c1, 5, TemplateRef)`
      expect(jsContents).toMatch(contentQueryRegExp('\\w+', 5, 'TemplateRef'));
      // match `i0.ɵɵviewQuery(_c2, 5, null)`
      expect(jsContents).toMatch(viewQueryRegExp('\\w+', 5));
    });

    it('should generate queries for directives', () => {
      env.write(
        `test.ts`,
        `
        import {Directive, ContentChild, ContentChildren, TemplateRef, ViewChild} from '@angular/core';
        import * as core from '@angular/core';

        @Directive({
          selector: '[test]',
          queries: {
            'mview': new ViewChild('test1'),
            'mcontent': new core.ContentChild('test2'),
          }
        })
        class FooCmp {
          @ContentChild('bar', {read: TemplateRef}) child: any;
          @ContentChildren(TemplateRef) children: any;
          get aview(): any { return null; }
          @ViewChild('accessor') set aview(value: any) {}
        }
    `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toMatch(varRegExp('bar'));
      expect(jsContents).toMatch(varRegExp('test1'));
      expect(jsContents).toMatch(varRegExp('test2'));
      expect(jsContents).toMatch(varRegExp('accessor'));
      // match `i0.ɵɵcontentQuery(dirIndex, _c1, 5, TemplateRef)`
      expect(jsContents).toMatch(contentQueryRegExp('\\w+', 5, 'TemplateRef'));

      // match `i0.ɵɵviewQuery(_c2, 5)`
      // Note that while ViewQuery doesn't necessarily make sense on a directive,
      // because it doesn't have a view, we still need to handle it because a component
      // could extend the directive.
      expect(jsContents).toMatch(viewQueryRegExp('\\w+', 5));
    });

    it('should handle queries that use forwardRef', () => {
      env.write(
        `test.ts`,
        `
        import {Component, ContentChild, TemplateRef, ViewContainerRef, forwardRef} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div #foo></div>',
        })
        class FooCmp {
          @ContentChild(forwardRef(() => TemplateRef)) child: any;

          @ContentChild(forwardRef(function() { return ViewContainerRef; })) child2: any;

          @ContentChild((forwardRef((function() { return 'parens'; }) as any))) childInParens: any;
        }
    `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      // match `i0.ɵɵcontentQuery(dirIndex, TemplateRef, 5, null)`
      expect(jsContents).toMatch(contentQueryRegExp('TemplateRef', 5));
      // match `i0.ɵɵcontentQuery(dirIndex, ViewContainerRef, 5, null)`
      expect(jsContents).toMatch(contentQueryRegExp('ViewContainerRef', 5));
      // match `i0.ɵɵcontentQuery(dirIndex, _c0, 5, null)`
      expect(jsContents).toContain('_c0 = ["parens"];');
      expect(jsContents).toMatch(contentQueryRegExp('_c0', 5));
    });

    it('should handle queries that use an InjectionToken', () => {
      env.write(
        `test.ts`,
        `
        import {Component, ContentChild, InjectionToken, ViewChild} from '@angular/core';

        const TOKEN = new InjectionToken('token');

        @Component({
          selector: 'test',
          template: '<div></div>',
        })
        class FooCmp {
          @ViewChild(TOKEN) viewChild: any;
          @ContentChild(TOKEN) contentChild: any;
        }
      `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      // match `i0.ɵɵviewQuery(TOKEN, 5, null)`
      expect(jsContents).toMatch(viewQueryRegExp('TOKEN', 5));
      // match `i0.ɵɵcontentQuery(dirIndex, TOKEN, 5, null)`
      expect(jsContents).toMatch(contentQueryRegExp('TOKEN', 5));
    });

    it('should compile expressions that write keys', () => {
      env.write(
        `test.ts`,
        `
        import {Component, ContentChild, TemplateRef, ViewContainerRef, forwardRef} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div (click)="test[key] = $event">',
        })
        class TestCmp {
          test: any;
          key: string;
        }
    `,
      );

      env.driveMain();
      expect(env.getContents('test.js')).toContain('test[key] = $event');
    });

    it('should generate host listeners for components', () => {
      env.write(
        `test.ts`,
        `
        import {Component, HostListener} from '@angular/core';

        @Component({
          selector: 'test',
          template: 'Test'
        })
        class FooCmp {
          @HostListener('click')
          onClick(event: any): void {}

          @HostListener('document:click', ['$event.target'])
          onDocumentClick(eventTarget: HTMLElement): void {}

          @HostListener('window:scroll')
          onWindowScroll(event: any): void {}
        }
    `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      const hostBindingsFn = `
      hostBindings: function FooCmp_HostBindings(rf, ctx) {
        if (rf & 1) {
          i0.ɵɵlistener("click", function FooCmp_click_HostBindingHandler() { return ctx.onClick(); })("click", function FooCmp_click_HostBindingHandler($event) { return ctx.onDocumentClick($event.target); }, i0.ɵɵresolveDocument)("scroll", function FooCmp_scroll_HostBindingHandler() { return ctx.onWindowScroll(); }, i0.ɵɵresolveWindow);
        }
      }
    `;
      expect(trim(jsContents)).toContain(trim(hostBindingsFn));
    });

    it('should throw in case unknown global target is provided', () => {
      env.write(
        `test.ts`,
        `
        import {Component, HostListener} from '@angular/core';

        @Component({
          selector: 'test',
          template: 'Test'
        })
        class FooCmp {
          @HostListener('UnknownTarget:click')
          onClick(event: any): void {}
        }
    `,
      );
      const errors = env.driveDiagnostics();
      expect(trim(errors[0].messageText as string)).toContain(
        `Unexpected global target 'UnknownTarget' defined for 'click' event. Supported list of global targets: window,document,body.`,
      );
    });

    it('should provide error location for invalid host properties', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test',
          template: '...',
          host: {
            '(click)': 'act() | pipe',
          }
        })
        class FooCmp {}
      `,
      );

      const errors = env.driveDiagnostics();
      expect(getDiagnosticSourceCode(errors[0])).toBe(`'act() | pipe'`);
      expect(errors[0].messageText).toContain('/test.ts@7:17');
    });

    it('should throw in case pipes are used in host listeners', () => {
      env.write(
        `test.ts`,
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test',
          template: '...',
          host: {
            '(click)': 'doSmth() | myPipe'
          }
        })
        class FooCmp {}
      `,
      );
      const errors = env.driveDiagnostics();
      expect(trim(errors[0].messageText as string)).toContain(
        'Cannot have a pipe in an action expression',
      );
    });

    it('should throw in case pipes are used in host bindings (defined as `value | pipe`)', () => {
      env.write(
        `test.ts`,
        `
            import {Component} from '@angular/core';

            @Component({
              selector: 'test',
              template: '...',
              host: {
                '[id]': 'id | myPipe'
              }
            })
            class FooCmp {}
         `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(trim(diags[0].messageText as string)).toContain(
        'Host binding expression cannot contain pipes',
      );
      expect(getDiagnosticSourceCode(diags[0])).toBe(`'id | myPipe'`);
    });

    it('should generate host bindings for directives', () => {
      env.write(
        `test.ts`,
        `
        import {Component, HostBinding, HostListener, TemplateRef} from '@angular/core';

        @Component({
          selector: 'test',
          template: 'Test',
          host: {
            '[attr.hello]': 'foo',
            '(click)': 'onClick($event)',
            '(body:click)': 'onBodyClick($event)',
            '[prop]': 'bar',
          },
        })
        class FooCmp {
          onClick(event: any): void {}

          @HostBinding('class.someclass')
          get someClass(): boolean { return false; }

          @HostListener('change', ['arg1', 'arg2', 'arg3'])
          onChange(event: any, arg: any): void {}
        }
    `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      const hostBindingsFn = `
      hostVars: 4,
      hostBindings: function FooCmp_HostBindings(rf, ctx) {
        if (rf & 1) {
          i0.ɵɵlistener("click", function FooCmp_click_HostBindingHandler($event) { return ctx.onClick($event); })("click", function FooCmp_click_HostBindingHandler($event) { return ctx.onBodyClick($event); }, i0.ɵɵresolveBody)("change", function FooCmp_change_HostBindingHandler() { return ctx.onChange(ctx.arg1, ctx.arg2, ctx.arg3); });
        }
        if (rf & 2) {
          i0.ɵɵdomProperty("prop", ctx.bar);
          i0.ɵɵattribute("hello", ctx.foo);
          i0.ɵɵclassProp("someclass", ctx.someClass);
        }
      }
    `;
      expect(trim(jsContents)).toContain(trim(hostBindingsFn));
    });

    // https://github.com/angular/angular/issues/46936
    it('should support bindings with Object builtin names', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div [valueOf]="123"></div>',
        })
        export class TestCmp {}
    `,
      );

      const errors = env.driveDiagnostics();
      expect(errors.length).toBe(1);
      expect(errors[0].messageText).toContain(
        `Can't bind to 'valueOf' since it isn't a known property of 'div'.`,
      );
    });

    it('should handle $any used inside a listener', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div (click)="$any(123)"></div>',
        })
        export class TestCmp {}
    `,
      );

      env.driveMain();
      expect(env.getContents('test.js')).toContain(
        `ɵɵdomListener("click", function TestCmp_Template_div_click_0_listener() { return 123; });`,
      );
    });

    it('should accept dynamic host attribute bindings', () => {
      env.write(
        'other.d.ts',
        `
      export declare const foo: any;
    `,
      );
      env.write(
        'test.ts',
        `
      import {Component} from '@angular/core';
      import {foo} from './other';

      const test = foo.bar();

      @Component({
        selector: 'test',
        template: '',
        host: {
          'test': test,
        },
      })
      export class TestCmp {}
    `,
      );
      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('hostAttrs: ["test", test]');
    });

    it('should accept enum values as host bindings', () => {
      env.write(
        `test.ts`,
        `
        import {Component, HostBinding, HostListener, TemplateRef} from '@angular/core';

        enum HostBindings {
          Hello = 'foo'
        }

        @Component({
          selector: 'test',
          template: 'Test',
          host: {
            '[attr.hello]': HostBindings.Hello,
          },
        })
        class FooCmp {
          foo = 'test';
        }
    `,
      );

      env.driveMain();
      expect(env.getContents('test.js')).toContain('i0.ɵɵattribute("hello", ctx.foo)');
    });

    it('should generate host listeners for directives within hostBindings section', () => {
      env.write(
        `test.ts`,
        `
        import {Directive, HostListener} from '@angular/core';

        @Directive({
          selector: '[test]',
        })
        class Dir {
          @HostListener('change', ['$event', 'arg'])
          onChange(event: any, arg: any): void {}
        }
    `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      const hostBindingsFn = `
      hostBindings: function Dir_HostBindings(rf, ctx) {
        if (rf & 1) {
          i0.ɵɵlistener("change", function Dir_change_HostBindingHandler($event) { return ctx.onChange($event, ctx.arg); });
        }
      }
    `;
      expect(trim(jsContents)).toContain(trim(hostBindingsFn));
    });

    it('should use proper default value for preserveWhitespaces config param', () => {
      env.tsconfig(); // default is `false`
      env.write(
        `test.ts`,
        `
      import {Component} from '@angular/core';
       @Component({
        selector: 'test',
        preserveWhitespaces: false,
        template: \`
          <div>
            Template with whitespaces
          </div>
        \`
      })
      class FooCmp {}
    `,
      );
      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('text(1, " Template with whitespaces ");');
    });

    it('should take preserveWhitespaces config option into account', () => {
      env.tsconfig({preserveWhitespaces: true});
      env.write(
        `test.ts`,
        `
      import {Component} from '@angular/core';
       @Component({
        selector: 'test',
        template: \`
          <div>
            Template with whitespaces
          </div>
        \`
      })
      class FooCmp {}
    `,
      );
      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain(
        'text(2, "\\n            Template with whitespaces\\n          ");',
      );
    });

    it("@Component's preserveWhitespaces should override the one defined in config", () => {
      env.tsconfig({preserveWhitespaces: true});
      env.write(
        `test.ts`,
        `
      import {Component} from '@angular/core';
       @Component({
        selector: 'test',
        preserveWhitespaces: false,
        template: \`
          <div>
            Template with whitespaces
          </div>
        \`
      })
      class FooCmp {}
    `,
      );
      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('text(1, " Template with whitespaces ");');
    });

    it('should use proper default value for i18nUseExternalIds config param', () => {
      env.tsconfig(); // default is `true`
      env.write(
        `test.ts`,
        `
      import {Component} from '@angular/core';
       @Component({
        selector: 'test',
        template: '<div i18n>Some text</div>'
      })
      class FooCmp {}
    `,
      );
      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('MSG_EXTERNAL_8321000940098097247$$TEST_TS_0');
    });

    it('should take i18nUseExternalIds config option into account', () => {
      env.tsconfig({i18nUseExternalIds: false});
      env.write(
        `test.ts`,
        `
      import {Component} from '@angular/core';
       @Component({
        selector: 'test',
        template: '<div i18n>Some text</div>'
      })
      class FooCmp {}
    `,
      );
      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).not.toContain('MSG_EXTERNAL_');
    });

    it('should render legacy ids when `enableI18nLegacyMessageIdFormat` is not false', () => {
      env.tsconfig({});
      env.write(
        `test.ts`,
        `
        import {Component} from '@angular/core';
        @Component({
          selector: 'test',
          template: '<div i18n>Some text</div>'
        })
        class FooCmp {}`,
      );
      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain(
        '`:\u241F5dbba0a3da8dff890e20cf76eb075d58900fbcd3\u241F8321000940098097247:Some text`',
      );
    });

    it('should render custom id and legacy ids if `enableI18nLegacyMessageIdFormat` is not false', () => {
      env.tsconfig({i18nFormatIn: 'xlf'});
      env.write(
        `test.ts`,
        `
        import {Component} from '@angular/core';
        @Component({
          selector: 'test',
          template: '<div i18n="@@custom">Some text</div>'
        })
        class FooCmp {}`,
      );
      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain(
        ':@@custom\u241F5dbba0a3da8dff890e20cf76eb075d58900fbcd3\u241F8321000940098097247:Some text',
      );
    });

    it('should not render legacy ids when `enableI18nLegacyMessageIdFormat` is set to false', () => {
      env.tsconfig({enableI18nLegacyMessageIdFormat: false, i18nInFormat: 'xmb'});
      env.write(
        `test.ts`,
        `
     import {Component} from '@angular/core';
     @Component({
       selector: 'test',
       template: '<div i18n>Some text</div>'
     })
     class FooCmp {}`,
      );
      env.driveMain();
      const jsContents = env.getContents('test.js');
      // Note that the colon would only be there if there is an id attached to the
      // string.
      expect(jsContents).not.toContain(':Some text');
    });

    it('should also render legacy ids for ICUs when normal messages are using legacy ids', () => {
      env.tsconfig({i18nInFormat: 'xliff'});
      env.write(
        `test.ts`,
        `
     import {Component} from '@angular/core';
     @Component({
       selector: 'test',
       template: '<div i18n="@@custom">Some text {age, plural, 10 {ten} other {other}}</div>'
     })
     class FooCmp {
       age = 1;
     }`,
      );
      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain(
        ':\u241F720ba589d043a0497ac721ff972f41db0c919efb\u241F3221232817843005870:{VAR_PLURAL, plural, 10 {ten} other {other}}',
      );
      expect(jsContents).toContain(
        ':@@custom\u241Fdcb6170595f5d548a3d00937e87d11858f51ad04\u241F7419139165339437596:Some text',
      );
    });

    it("@Component's `interpolation` should override default interpolation config", () => {
      env.write(
        `test.ts`,
        `
      import {Component} from '@angular/core';
      @Component({
        selector: 'cmp-with-custom-interpolation-a',
        template: \`<div>{%text%}</div>\`,
        interpolation: ['{%', '%}']
      })
      class ComponentWithCustomInterpolationA {
        text = 'Custom Interpolation A';
      }
    `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('ɵɵtextInterpolate(ctx.text)');
    });

    it('should handle `encapsulation` field', () => {
      env.write(
        `test.ts`,
        `
      import {Component, ViewEncapsulation} from '@angular/core';
      @Component({
        selector: 'comp-a',
        template: '...',
        encapsulation: ViewEncapsulation.None
      })
      class CompA {}
    `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('encapsulation: 2');
    });

    it('should throw if `encapsulation` contains invalid value', () => {
      env.write(
        'test.ts',
        `
      import {Component} from '@angular/core';
      @Component({
        selector: 'comp-a',
        template: '...',
        // @ts-ignore
        encapsulation: 'invalid-value'
      })
      class CompA {}
    `,
      );
      const errors = env.driveDiagnostics();
      expect(errors.length).toBe(1);
      const messageText = ts.flattenDiagnosticMessageText(errors[0].messageText, '\n');
      expect(messageText).toContain(
        'encapsulation must be a member of ViewEncapsulation enum from @angular/core',
      );
      expect(messageText).toContain("Value is of type 'string'.");
    });

    it('should handle `changeDetection` field', () => {
      env.write(
        `test.ts`,
        `
      import {Component, ChangeDetectionStrategy} from '@angular/core';
      @Component({
        selector: 'comp-a',
        template: '...',
        changeDetection: ChangeDetectionStrategy.OnPush
      })
      class CompA {}
    `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('changeDetection: 0');
    });

    it('should throw if `changeDetection` contains invalid value', () => {
      env.write(
        'test.ts',
        `
      import {Component} from '@angular/core';
      @Component({
        selector: 'comp-a',
        template: '...',
        // @ts-ignore
        changeDetection: 'invalid-value'
      })
      class CompA {}
    `,
      );
      const errors = env.driveDiagnostics();
      expect(errors.length).toBe(1);
      const messageText = ts.flattenDiagnosticMessageText(errors[0].messageText, '\n');
      expect(messageText).toContain(
        'changeDetection must be a member of ChangeDetectionStrategy enum from @angular/core',
      );
      expect(messageText).toContain("Value is of type 'string'.");
    });

    it('should ignore empty bindings', () => {
      env.write(
        `test.ts`,
        `
      import {Component} from '@angular/core';
       @Component({
        selector: 'test',
        template: '<div [class]></div>'
      })
      class FooCmp {}
    `,
      );
      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).not.toContain('i0.ɵɵproperty');
    });

    it('should correctly recognize local symbols', () => {
      env.write(
        'module.ts',
        `
        import {NgModule} from '@angular/core';
        import {Dir, Comp} from './test';

        @NgModule({
          declarations: [Dir, Comp],
          exports: [Dir, Comp],
        })
        class Module {}
    `,
      );
      env.write(
        `test.ts`,
        `
        import {Component, Directive} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: false,
        })
        export class Dir {}

        @Component({
          selector: 'test',
          template: '<div dir>Test</div>',
          standalone: false,
        })
        export class Comp {}
    `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).not.toMatch(/import \* as i[0-9] from ['"].\/test['"]/);
    });

    it('should generate exportAs declarations', () => {
      env.write(
        'test.ts',
        `
        import {Component, Directive} from '@angular/core';

        @Directive({
          selector: '[test]',
          exportAs: 'foo',
          standalone: false,
        })
        class Dir {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain(`exportAs: ["foo"]`);
    });

    it('should generate multiple exportAs declarations', () => {
      env.write(
        'test.ts',
        `
        import {Component, Directive} from '@angular/core';

        @Directive({
          selector: '[test]',
          exportAs: 'foo, bar',
          standalone: false,
        })
        class Dir {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain(`exportAs: ["foo", "bar"]`);
    });

    it('should compile a banana-in-a-box inside of a template', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          template: '<div *tmpl [(bananaInABox)]="prop"></div>',
          selector: 'test',
          standalone: false,
        })
        class TestCmp {}
    `,
      );

      env.driveMain();
    });

    it('generates inherited factory definitions', () => {
      env.write(
        `test.ts`,
        `
        import {Injectable} from '@angular/core';

        class Dep {}

        @Injectable()
        class Base {
          constructor(dep: Dep) {}
        }

        @Injectable()
        class Child extends Base {}

        @Injectable()
        class GrandChild extends Child {
          constructor() {
            super(null!);
          }
        }
    `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');

      expect(jsContents).toContain(
        'function Base_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Base)(i0.ɵɵinject(Dep)); }',
      );
      expect(jsContents).toContain(
        '(() => { let ɵChild_BaseFactory; return function Child_Factory(__ngFactoryType__) { return (ɵChild_BaseFactory || (ɵChild_BaseFactory = i0.ɵɵgetInheritedFactory(Child)))(__ngFactoryType__ || Child); }; })();',
      );
      expect(jsContents).toContain(
        'function GrandChild_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || GrandChild)(); }',
      );
    });

    it('generates base factories for directives', () => {
      env.write(
        `test.ts`,
        `
        import {Directive} from '@angular/core';

        @Directive({
          selector: '[base]',
        })
        class Base {}

        @Directive({
          selector: '[test]',
        })
        class Dir extends Base {
        }
    `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain(
        '/*@__PURE__*/ (() => { let ɵDir_BaseFactory; return function Dir_Factory(__ngFactoryType__) { return (ɵDir_BaseFactory || (ɵDir_BaseFactory = i0.ɵɵgetInheritedFactory(Dir)))(__ngFactoryType__ || Dir); }; })();',
      );
    });

    it('should wrap "directives" in component metadata in a closure when forward references are present', () => {
      env.write(
        'test.ts',
        `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'cmp-a',
          template: '<cmp-b></cmp-b>',
          standalone: false,
        })
        class CmpA {}

        @Component({
          selector: 'cmp-b',
          template: 'This is B',
          standalone: false,
        })
        class CmpB {}

        @NgModule({
          declarations: [CmpA, CmpB],
        })
        class Module {}
    `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('dependencies: () => [CmpB]');
    });

    it('should wrap setClassMetadata in an iife with ngDevMode guard', () => {
      env.write(
        'test.ts',
        `
        import {Injectable} from '@angular/core';

        @Injectable({providedIn: 'root'})
        export class Service {}
      `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js').replace(/\s+/g, ' ');
      expect(jsContents).toContain(
        `(() => { (typeof ngDevMode === "undefined" || ngDevMode) && ` +
          `i0.ɵsetClassMetadata(Service, [{ type: Injectable, args: [{ providedIn: 'root' }] }], null, null); })();`,
      );
    });

    it('should not include `schemas` in component and module defs', () => {
      env.write(
        'test.ts',
        `
        import {Component, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
        @Component({
          selector: 'comp',
          template: '<custom-el></custom-el>',
          standalone: false,
        })
        class MyComp {}
        @NgModule({
          declarations: [MyComp],
          schemas: [NO_ERRORS_SCHEMA],
        })
        class MyModule {}
      `,
      );

      env.driveMain();
      const jsContents = trim(env.getContents('test.js'));
      expect(jsContents).toContain(
        trim(`
        MyComp.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
          type: MyComp,
          selectors: [["comp"]],
          standalone: false,
          decls: 1,
          vars: 0,
          template: function MyComp_Template(rf, ctx) {
            if (rf & 1) {
              i0.ɵɵelement(0, "custom-el");
            }
          },
          encapsulation: 2
        });
      `),
      );
      expect(jsContents).toContain(
        trim('MyModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });'),
      );
    });

    it('should emit setNgModuleScope calls for NgModules by default', () => {
      env.write(
        'test.ts',
        `
      import {Component, Directive, Injectable, NgModule, Pipe} from '@angular/core';

      @Component({selector: 'cmp', template: 'I am a component!', standalone: false}) class TestComponent {}
      @Directive({selector: 'dir', standalone: false}) class TestDirective {}
      @Injectable() class TestInjectable {}
      @NgModule({declarations: [TestComponent, TestDirective]}) class TestNgModule {}
      @Pipe({name: 'pipe', standalone: false}) class TestPipe {}
    `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('\u0275setNgModuleScope(TestNgModule, ');
    });

    it('should emit setNgModuleScope calls for NgModules when supportJitMode is true', () => {
      env.tsconfig({
        'supportJitMode': true,
      });
      env.write(
        'test.ts',
        `
      import {Component, Directive, Injectable, NgModule, Pipe} from '@angular/core';

      @Component({selector: 'cmp', template: 'I am a component!', standalone: false}) class TestComponent {}
      @Directive({selector: 'dir', standalone: false}) class TestDirective {}
      @Injectable() class TestInjectable {}
      @NgModule({declarations: [TestComponent, TestDirective]}) class TestNgModule {}
      @Pipe({name: 'pipe', standalone: false}) class TestPipe {}
    `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('\u0275setNgModuleScope(TestNgModule, ');
    });

    it('should not emit setNgModuleScope calls for NgModules when supportJitMode is false', () => {
      env.tsconfig({
        'supportJitMode': false,
      });
      env.write(
        'test.ts',
        `
      import {Component, Directive, Injectable, NgModule, Pipe} from '@angular/core';

      @Component({selector: 'cmp', template: 'I am a component!', standalone: false}) class TestComponent {}
      @Directive({selector: 'dir', standalone: false}) class TestDirective {}
      @Injectable() class TestInjectable {}
      @NgModule({declarations: [TestComponent, TestDirective]}) class TestNgModule {}
      @Pipe({name: 'pipe', standalone: false}) class TestPipe {}
    `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).not.toContain('\u0275setNgModuleScope(');
    });

    it('should emit setClassMetadata calls for all types by default', () => {
      env.write(
        'test.ts',
        `
      import {Component, Directive, Injectable, NgModule, Pipe} from '@angular/core';

      @Component({selector: 'cmp', template: 'I am a component!', standalone: false}) class TestComponent {}
      @Directive({selector: 'dir', standalone: false}) class TestDirective {}
      @Injectable() class TestInjectable {}
      @NgModule({declarations: [TestComponent, TestDirective]}) class TestNgModule {}
      @Pipe({name: 'pipe', standalone: false}) class TestPipe {}
    `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('\u0275setClassMetadata(TestComponent, ');
      expect(jsContents).toContain('\u0275setClassMetadata(TestDirective, ');
      expect(jsContents).toContain('\u0275setClassMetadata(TestInjectable, ');
      expect(jsContents).toContain('\u0275setClassMetadata(TestNgModule, ');
      expect(jsContents).toContain('\u0275setClassMetadata(TestPipe, ');
    });

    it('should emit setClassMetadata calls for all types when supportTestBed is true', () => {
      env.tsconfig({
        'supportTestBed': true,
      });
      env.write(
        'test.ts',
        `
      import {Component, Directive, Injectable, NgModule, Pipe} from '@angular/core';

      @Component({selector: 'cmp', template: 'I am a component!', standalone: false}) class TestComponent {}
      @Directive({selector: 'dir', standalone: false}) class TestDirective {}
      @Injectable() class TestInjectable {}
      @NgModule({declarations: [TestComponent, TestDirective]}) class TestNgModule {}
      @Pipe({name: 'pipe', standalone: false}) class TestPipe {}
    `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('\u0275setClassMetadata(TestComponent, ');
      expect(jsContents).toContain('\u0275setClassMetadata(TestDirective, ');
      expect(jsContents).toContain('\u0275setClassMetadata(TestInjectable, ');
      expect(jsContents).toContain('\u0275setClassMetadata(TestNgModule, ');
      expect(jsContents).toContain('\u0275setClassMetadata(TestPipe, ');
    });

    it('should not emit setClassMetadata calls for all types when supportTestBed is false', () => {
      env.tsconfig({
        'supportTestBed': false,
      });
      env.write(
        'test.ts',
        `
      import {Component, Directive, Injectable, NgModule, Pipe} from '@angular/core';

      @Component({selector: 'cmp', template: 'I am a component!', standalone: false}) class TestComponent {}
      @Directive({selector: 'dir', standalone: false}) class TestDirective {}
      @Injectable() class TestInjectable {}
      @NgModule({declarations: [TestComponent, TestDirective]}) class TestNgModule {}
      @Pipe({name: 'pipe', standalone: false}) class TestPipe {}
    `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).not.toContain('\u0275setClassMetadata(');
    });

    it('should use imported types in setClassMetadata if they can be represented as values', () => {
      env.write(
        `types.ts`,
        `
      export class MyTypeA {}
      export class MyTypeB {}
    `,
      );
      env.write(
        `test.ts`,
        `
      import {Component, Inject, Injectable} from '@angular/core';
      import {MyTypeA, MyTypeB} from './types';

      @Injectable({providedIn: 'root'})
      export class SomeService {
        constructor(arg: MyTypeA) {}
      }

      @Component({
        selector: 'some-comp',
        template: '...',
      })
      export class SomeComp {
        constructor(@Inject('arg-token') arg: MyTypeB) {}
      }
    `,
      );

      env.driveMain();
      const jsContents = trim(env.getContents('test.js'));
      expect(jsContents).toContain(`import * as i1 from "./types";`);
      expect(jsContents).toMatch(setClassMetadataRegExp('type: i1\\.MyTypeA'));
      expect(jsContents).toMatch(setClassMetadataRegExp('type: i1\\.MyTypeB'));
    });

    it('should use imported types in setClassMetadata if they can be represented as values and imported as `* as foo`', () => {
      env.write(
        `types.ts`,
        `
         export class MyTypeA {}
         export class MyTypeB {}
       `,
      );
      env.write(
        `test.ts`,
        `
         import {Component, Inject, Injectable} from '@angular/core';
         import * as types from './types';

         @Injectable({providedIn: 'root'})
         export class SomeService {
           constructor(arg: types.MyTypeA) {}
         }

         @Component({
           selector: 'some-comp',
           template: '...',
         })
         export class SomeComp {
           constructor(@Inject('arg-token') arg: types.MyTypeB) {}
         }
      `,
      );

      env.driveMain();
      const jsContents = trim(env.getContents('test.js'));
      expect(jsContents).toContain(`import * as i1 from "./types";`);
      expect(jsContents).toMatch(setClassMetadataRegExp('type: i1.MyTypeA'));
      expect(jsContents).toMatch(setClassMetadataRegExp('type: i1.MyTypeB'));
    });

    it('should use default-imported types if they can be represented as values', () => {
      env.write(
        `types.ts`,
        `
            export default class Default {}
            export class Other {}
          `,
      );
      env.write(
        `test.ts`,
        `
            import {Component} from '@angular/core';
            import {Other} from './types';
            import Default from './types';

            @Component({selector: 'test', template: 'test'})
            export class SomeCmp {
              constructor(arg: Default, other: Other) {}
            }
         `,
      );

      env.driveMain();
      const jsContents = trim(env.getContents('test.js'));
      expect(jsContents).toContain(`import Default from './types';`);
      expect(jsContents).toContain(`import * as i1 from "./types";`);
      expect(jsContents).toContain('i0.ɵɵdirectiveInject(Default)');
      expect(jsContents).toContain('i0.ɵɵdirectiveInject(i1.Other)');
      expect(jsContents).toMatch(setClassMetadataRegExp('type: Default'));
      expect(jsContents).toMatch(setClassMetadataRegExp('type: i1.Other'));
    });

    it('should not throw when using an SVG-specific `title` tag', () => {
      env.write(
        'test.ts',
        `
        import {Component, NgModule} from '@angular/core';
        @Component({
          template: \`
            <svg>
              <rect>
                <svg:title>I'm a title tag</svg:title>
              </rect>
            </svg>
          \`,
          standalone: false,
        })
        export class SvgCmp {}
        @NgModule({
          declarations: [SvgCmp],
        })
        export class SvgModule {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    describe('namespace support', () => {
      it('should generate correct imports for type references to namespaced symbols using a namespace import', () => {
        env.write(
          `/node_modules/ns/index.d.ts`,
          `
              export declare class Zero {}
              export declare namespace one {
                export declare class One {}
              }
              export declare namespace one.two {
                export declare class Two {}
              }
           `,
        );
        env.write(
          `test.ts`,
          `
              import {Inject, Injectable, InjectionToken} from '@angular/core';
              import * as ns from 'ns';

              @Injectable()
              export class MyService {
                constructor(
                  zero: ns.Zero,
                  one: ns.one.One,
                  two: ns.one.two.Two,
                ) {}
              }
           `,
        );

        env.driveMain();
        const jsContents = trim(env.getContents('test.js'));
        expect(jsContents).toContain(`import * as i1 from "ns";`);
        expect(jsContents).toContain('i0.ɵɵinject(i1.Zero)');
        expect(jsContents).toContain('i0.ɵɵinject(i1.one.One)');
        expect(jsContents).toContain('i0.ɵɵinject(i1.one.two.Two)');
        expect(jsContents).toMatch(setClassMetadataRegExp('type: i1.Zero'));
        expect(jsContents).toMatch(setClassMetadataRegExp('type: i1.one.One'));
        expect(jsContents).toMatch(setClassMetadataRegExp('type: i1.one.two.Two'));
      });

      it('should generate correct imports for type references to namespaced symbols using named imports', () => {
        env.write(
          `/node_modules/ns/index.d.ts`,
          `
              export namespace ns {
                export declare class Zero {}
                export declare namespace one {
                  export declare class One {}
                }
                export declare namespace one.two {
                  export declare class Two {}
                }
              }
           `,
        );
        env.write(
          `test.ts`,
          `
              import {Inject, Injectable, InjectionToken} from '@angular/core';
              import {ns} from 'ns';
              import {ns as alias} from 'ns';

              @Injectable()
              export class MyService {
                constructor(
                  zero: ns.Zero,
                  one: ns.one.One,
                  two: ns.one.two.Two,
                  aliasedZero: alias.Zero,
                  aliasedOne: alias.one.One,
                  aliasedTwo: alias.one.two.Two,
                ) {}
              }
           `,
        );

        env.driveMain();
        const jsContents = trim(env.getContents('test.js'));
        expect(jsContents).toContain(`import * as i1 from "ns";`);
        expect(jsContents).toContain(
          'i0.ɵɵinject(i1.ns.Zero), ' +
            'i0.ɵɵinject(i1.ns.one.One), ' +
            'i0.ɵɵinject(i1.ns.one.two.Two), ' +
            'i0.ɵɵinject(i1.ns.Zero), ' +
            'i0.ɵɵinject(i1.ns.one.One), ' +
            'i0.ɵɵinject(i1.ns.one.two.Two)',
        );
        expect(jsContents).toMatch(setClassMetadataRegExp('type: i1.ns.Zero'));
        expect(jsContents).toMatch(setClassMetadataRegExp('type: i1.ns.one.One'));
        expect(jsContents).toMatch(setClassMetadataRegExp('type: i1.ns.one.two.Two'));
      });

      it('should not error for a namespace import as parameter type when @Inject is used', () => {
        env.tsconfig({'strictInjectionParameters': true});
        env.write(
          `/node_modules/foo/index.d.ts`,
          `
          export = Foo;
          declare class Foo {}
          declare namespace Foo {}
        `,
        );
        env.write(
          `test.ts`,
          `
          import {Inject, Injectable, InjectionToken} from '@angular/core';
          import * as Foo from 'foo';

          export const TOKEN = new InjectionToken<Foo>('Foo');

          @Injectable()
          export class MyService {
            constructor(@Inject(TOKEN) foo: Foo) {}
          }
       `,
        );

        env.driveMain();
        const jsContents = trim(env.getContents('test.js'));
        expect(jsContents).toContain('i0.ɵɵinject(TOKEN)');
        expect(jsContents).toMatch(setClassMetadataRegExp('type: undefined'));
      });

      it('should error for a namespace import as parameter type used for DI', () => {
        env.tsconfig({'strictInjectionParameters': true});
        env.write(
          `/node_modules/foo/index.d.ts`,
          `
          export = Foo;
          declare class Foo {}
          declare namespace Foo {}
        `,
        );
        env.write(
          `test.ts`,
          `
          import {Injectable} from '@angular/core';
          import * as Foo from 'foo';

          @Injectable()
          export class MyService {
            constructor(foo: Foo) {}
          }
       `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(ts.flattenDiagnosticMessageText(diags[0].messageText, '\n')).toBe(
          `No suitable injection token for parameter 'foo' of class 'MyService'.\n` +
            `  Consider using the @Inject decorator to specify an injection token.`,
        );
        expect(diags[0].relatedInformation!.length).toBe(2);
        expect(diags[0].relatedInformation![0].messageText).toBe(
          'This type corresponds with a namespace, which cannot be used as injection token.',
        );
        expect(diags[0].relatedInformation![1].messageText).toBe(
          'The namespace import occurs here.',
        );
      });
    });

    it("should use `undefined` in setClassMetadata if types can't be represented as values", () => {
      env.write(
        `types.ts`,
        `
      export type MyType = Map<any, any>;
    `,
      );
      env.write(
        `test.ts`,
        `
      import {Component, Inject, Injectable} from '@angular/core';
      import {MyType} from './types';

      @Component({
        selector: 'some-comp',
        template: '...',
      })
      export class SomeComp {
        constructor(@Inject('arg-token') arg: MyType) {}
      }
    `,
      );

      env.driveMain();
      const jsContents = trim(env.getContents('test.js'));
      expect(jsContents).not.toContain(`import { MyType } from './types';`);
      // Note: `type: undefined` below, since MyType can't be represented as a value
      expect(jsContents).toMatch(setClassMetadataRegExp('type: undefined'));
    });

    it('should use `undefined` in setClassMetadata for const enums', () => {
      env.write(
        `keycodes.ts`,
        `
        export const enum KeyCodes {A, B};
      `,
      );
      env.write(
        `test.ts`,
        `
        import {Component, Inject} from '@angular/core';
        import {KeyCodes} from './keycodes';

        @Component({
          selector: 'some-comp',
          template: '...',
        })
        export class SomeComp {
          constructor(@Inject('arg-token') arg: KeyCodes) {}
        }
      `,
      );

      env.driveMain();
      const jsContents = trim(env.getContents('test.js'));
      expect(jsContents).not.toContain(`import { KeyCodes } from './keycodes';`);
      // Note: `type: undefined` below, since KeyCodes can't be represented as a value
      expect(jsContents).toMatch(setClassMetadataRegExp('type: undefined'));
    });

    it('should preserve the types of non-const enums in setClassMetadata', () => {
      env.write(
        `keycodes.ts`,
        `
        export enum KeyCodes {A, B};
      `,
      );
      env.write(
        `test.ts`,
        `
        import {Component, Inject} from '@angular/core';
        import {KeyCodes} from './keycodes';

        @Component({
          selector: 'some-comp',
          template: '...',
        })
        export class SomeComp {
          constructor(@Inject('arg-token') arg: KeyCodes) {}
        }
      `,
      );

      env.driveMain();
      const jsContents = trim(env.getContents('test.js'));
      expect(jsContents).toContain(`import * as i1 from "./keycodes";`);
      expect(jsContents).toMatch(setClassMetadataRegExp('type: i1.KeyCodes'));
    });

    it('should use `undefined` in setClassMetadata if types originate from type-only imports', () => {
      env.write(
        `types.ts`,
        `
           export default class {}
           export class TypeOnlyOne {}
           export class TypeOnlyTwo {}
         `,
      );
      env.write(
        `test.ts`,
        `
           import {Component, Inject, Injectable} from '@angular/core';
           import type DefaultImport from './types';
           import type {TypeOnlyOne} from './types';
           import {type TypeOnlyTwo} from './types';
           import type * as types from './types';

           @Component({
             selector: 'some-comp',
             template: '...',
           })
           export class SomeComp {
             constructor(
               @Inject('token') namedImport: TypeOnlyOne,
               @Inject('token') defaultImport: DefaultImport,
               @Inject('token') namespacedImport: types.TypeOnlyOne,
               @Inject('token') typeOnlySpecifier: TypeOnlyTwo,
             ) {}
           }
        `,
      );

      env.driveMain();
      const jsContents = trim(env.getContents('test.js'));
      // Module specifier for type-only import should not be emitted
      expect(jsContents).not.toContain('./types');
      // Default type-only import should not be emitted
      expect(jsContents).not.toContain('DefaultImport');
      // Named type-only import should not be emitted
      expect(jsContents).not.toContain('TypeOnlyOne');
      // Symbols from type-only specifiers should not be emitted
      expect(jsContents).not.toContain('TypeOnlyTwo');
      // The parameter type in class metadata should be undefined
      expect(jsContents).toMatch(setClassMetadataRegExp('type: undefined'));
    });

    it('should not throw in case whitespaces and HTML comments are present inside <ng-content>', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp-a',
            template: \`
              <ng-content>
                <!-- Some comments -->
              </ng-content>
            \`,
          })
          class CmpA {}
       `,
      );
      const errors = env.driveDiagnostics();
      expect(errors.length).toBe(0);
    });

    it('should compile a template using multiple directives with the same selector', () => {
      env.write(
        'test.ts',
        `
      import {Component, Directive, NgModule} from '@angular/core';

      @Directive({
        selector: '[test]',
        standalone: false,
      })
      class DirA {}

      @Directive({
        selector: '[test]',
        standalone: false,
      })
      class DirB {}

      @Component({
        template: '<div test></div>',
        standalone: false,
      })
      class Cmp {}

      @NgModule({
        declarations: [Cmp, DirA, DirB],
      })
      class Module {}
  `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toMatch(/dependencies: \[DirA,\s+DirB\]/);
    });

    describe('cycle detection', () => {
      it('should detect a simple cycle and use remote component scoping', () => {
        env.write(
          'test.ts',
          `
        import {Component, NgModule} from '@angular/core';
        import {NormalComponent} from './cyclic';

        @Component({
          selector: 'cyclic-component',
          template: 'Importing this causes a cycle',
          standalone: false,
        })
        export class CyclicComponent {}

        @NgModule({
          declarations: [NormalComponent, CyclicComponent],
        })
        export class Module {}
      `,
        );

        env.write(
          'cyclic.ts',
          `
        import {Component} from '@angular/core';

        @Component({
          selector: 'normal-component',
          template: '<cyclic-component></cyclic-component>',
          standalone: false,
        })
        export class NormalComponent {}
      `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).toMatch(
          /i\d\.ɵɵsetComponentScope\(NormalComponent,\s+\[CyclicComponent\],\s+\[\]\)/,
        );
        expect(jsContents).not.toContain('/*__PURE__*/ i0.ɵɵsetComponentScope');
      });

      it('should detect a cycle added entirely during compilation', () => {
        env.write(
          'test.ts',
          `
        import {NgModule} from '@angular/core';
        import {ACmp} from './a';
        import {BCmp} from './b';

        @NgModule({declarations: [ACmp, BCmp]})
        export class Module {}
      `,
        );
        env.write(
          'a.ts',
          `
        import {Component} from '@angular/core';

        @Component({
          selector: 'a-cmp',
          template: '<b-cmp></b-cmp>',
          standalone: false,
        })
        export class ACmp {}
      `,
        );
        env.write(
          'b.ts',
          `
        import {Component} from '@angular/core';

        @Component({
          selector: 'b-cmp',
          template: '<a-cmp></a-cmp>',
          standalone: false,
        })
        export class BCmp {}
      `,
        );
        env.driveMain();
        const aJsContents = env.getContents('a.js');
        const bJsContents = env.getContents('b.js');
        expect(aJsContents).toMatch(/import \* as i\d? from ".\/b"/);
        expect(bJsContents).not.toMatch(/import \* as i\d? from ".\/a"/);
      });

      it("should not detect a potential cycle if it doesn't actually happen", () => {
        env.write(
          'test.ts',
          `
        import {NgModule} from '@angular/core';
        import {ACmp} from './a';
        import {BCmp} from './b';

        @NgModule({declarations: [ACmp, BCmp]})
        export class Module {}
      `,
        );
        env.write(
          'a.ts',
          `
        import {Component} from '@angular/core';

        @Component({
          selector: 'a-cmp',
          template: '<b-cmp></b-cmp>',
          standalone: false,
        })
        export class ACmp {}
      `,
        );
        env.write(
          'b.ts',
          `
        import {Component} from '@angular/core';

        @Component({
          selector: 'b-cmp',
          template: 'does not use a-cmp',
          standalone: false,
        })
        export class BCmp {}
      `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).not.toContain('setComponentScope');
      });

      it('should not consider type-only import clauses during cycle detection', () => {
        env.write(
          'test.ts',
          `
        import {NgModule} from '@angular/core';
        import {ACmp} from './a';
        import {BCmp} from './b';

        @NgModule({declarations: [ACmp, BCmp]})
        export class Module {}
      `,
        );
        env.write(
          'a.ts',
          `
        import {Component} from '@angular/core';

        @Component({
          selector: 'a-cmp',
          template: '<b-cmp></b-cmp>',
          standalone: false,
        })
        export class ACmp {}
      `,
        );
        env.write(
          'b.ts',
          `
        import {Component} from '@angular/core';
        import type {ACmp} from './a';

        @Component({
          selector: 'b-cmp',
          template: 'does not use a-cmp',
          standalone: false,
        })
        export class BCmp {
          a: ACmp;
        }
      `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).not.toContain('setComponentScope');
      });

      it('should not consider import clauses where all the specifiers are type-only during cycle detection', () => {
        env.write(
          'test.ts',
          `
              import {NgModule} from '@angular/core';
              import {SharedOne, SharedTwo} from './shared';
              import {CyclicCmp} from './cyclic';

              @NgModule({declarations: [SharedOne, SharedTwo, CyclicCmp]})
              export class Module {}
            `,
        );
        env.write(
          'shared.ts',
          `
              import {Component} from '@angular/core';

              @Component({
                selector: 'shared-one-cmp',
                template: '<cyclic-cmp></cyclic-cmp>',
                standalone: false,
              })
              export class SharedOne {}

              @Component({
                selector: 'shared-two-cmp',
                template: '<cyclic-cmp></cyclic-cmp>',
                standalone: false,
              })
              export class SharedTwo {}
            `,
        );
        env.write(
          'cyclic.ts',
          `
              import {Component} from '@angular/core';
              import {type SharedOne, type SharedTwo} from './shared';

              @Component({
                selector: 'cyclic-cmp',
                template: 'does not use shared components',
                standalone: false,
              })
              export class CyclicCmp {
                one: SharedOne;
                two: SharedTwo;
              }
            `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).not.toContain('setComponentScope');
      });

      it('should only pass components actually used to setComponentScope', () => {
        env.write(
          'test.ts',
          `
          import {Component, NgModule} from '@angular/core';
          import {NormalComponent} from './cyclic';
          import {OtherComponent} from './other';

          @Component({
            selector: 'cyclic-component',
            template: 'Importing this causes a cycle',
            standalone: false,
          })
          export class CyclicComponent {}

          @NgModule({
            declarations: [NormalComponent, CyclicComponent, OtherComponent],
          })
          export class Module {}
        `,
        );

        env.write(
          'cyclic.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'normal-component',
            template: '<cyclic-component></cyclic-component>',
            standalone: false,
          })
          export class NormalComponent {}
        `,
        );

        env.write(
          'other.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'other-component',
            template: 'An unused other component',
            standalone: false,
          })
          export class OtherComponent {}
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).not.toMatch(/i\d\.ɵɵsetComponentScope\([^)]*OtherComponent[^)]*\)/);
      });

      it('should detect a simple cycle and fatally error if doing partial-compilation', () => {
        env.tsconfig({
          compilationMode: 'partial',
        });

        env.write(
          'test.ts',
          `
        import {Component, NgModule} from '@angular/core';
        import {NormalComponent} from './cyclic';

        @Component({
          selector: 'cyclic-component',
          template: 'Importing this causes a cycle',
          standalone: false,
        })
        export class CyclicComponent {}

        @NgModule({
          declarations: [NormalComponent, CyclicComponent],
        })
        export class Module {}
      `,
        );

        env.write(
          'cyclic.ts',
          `
        import {Component} from '@angular/core';

        @Component({
          selector: 'normal-component',
          template: '<cyclic-component></cyclic-component>',
          standalone: false,
        })
        export class NormalComponent {}
      `,
        );

        const diagnostics = env.driveDiagnostics();
        expect(diagnostics.length).toEqual(1);
        const error = diagnostics[0];
        expect(error.code).toBe(ngErrorCode(ErrorCode.IMPORT_CYCLE_DETECTED));
        expect(error.messageText).toEqual(
          'One or more import cycles would need to be created to compile this component, ' +
            'which is not supported by the current compiler configuration.',
        );
        const _abs = absoluteFrom;
        expect(error.relatedInformation?.map((diag) => diag.messageText)).toEqual([
          `The component 'CyclicComponent' is used in the template ` +
            `but importing it would create a cycle: ` +
            `${_abs('/cyclic.ts')} -> ${_abs('/test.ts')} -> ${_abs('/cyclic.ts')}`,
        ]);
      });
    });

    describe('local refs', () => {
      it('should not generate an error when a local ref is unresolved (outside of template type-checking)', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: '<div #ref="unknownTarget"></div>',
          })
          export class TestCmp {}
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toEqual(`No directive found with exportAs 'unknownTarget'.`);
      });
    });

    describe('multiple local refs', () => {
      const getComponentScript = (template: string): string => `
      import {Component, Directive, NgModule} from '@angular/core';

      @Component({
        selector: 'my-cmp',
        template: \`${template}\`,
        standalone: false,
      })
      class Cmp {}

      @NgModule({declarations: [Cmp]})
      class Module {}
    `;

      const cases = [
        `
        <div #ref></div>
        <div #ref></div>
      `,
        `
        <ng-container>
          <div #ref></div>
        </ng-container>
        <div #ref></div>
      `,
        `
        <ng-template>
          <div #ref></div>
        </ng-template>
        <div #ref></div>
      `,
        `
        <div *ngIf="visible" #ref></div>
        <div #ref></div>
      `,
        `
        <div *ngFor="let item of items" #ref></div>
        <div #ref></div>
      `,
      ];

      cases.forEach((template) => {
        it('should not throw', () => {
          env.write('test.ts', getComponentScript(template));
          const errors = env.driveDiagnostics();
          expect(errors.length).toBe(0);
        });
      });
    });

    it('should wrap "inputs" and "outputs" keys if they contain unsafe characters', () => {
      env.write(
        `test.ts`,
        `
      import {Directive, Input} from '@angular/core';

      @Directive({
        selector: '[somedir]',
        inputs: ['track-type', 'track-name', 'inputTrackName', 'src.xl'],
        outputs: ['output-track-type', 'output-track-name', 'outputTrackName', 'output.event']
      })
      export class SomeDir {
        @Input('track-type') trackType: string;
        @Input('track-name') trackName: string;
      }
    `,
      );

      env.driveMain();
      const jsContents = env.getContents('test.js');
      const inputsAndOutputs = `
      inputs: {
        "track-type": "track-type",
        "track-name": "track-name",
        inputTrackName: "inputTrackName",
        "src.xl": "src.xl",
        trackType: [0, "track-type", "trackType"],
        trackName: [0, "track-name", "trackName"]
      },
      outputs: {
        "output-track-type": "output-track-type",
        "output-track-name": "output-track-name",
        outputTrackName: "outputTrackName",
        "output.event": "output.event"
      }
    `;
      expect(trim(jsContents)).toContain(trim(inputsAndOutputs));
    });

    it('should generate the correct declaration for class members decorated with @Input', () => {
      env.write(
        'test.ts',
        `
        import {Directive, Input} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: false,
        })
        export class TestDir {
          @Input() noArgs: any;
          @Input('aliasedStringArg') stringArg: any;
          @Input({required: true}) requiredNoAlias: any;
          @Input({alias: 'aliasedRequiredWithAlias', required: true}) requiredWithAlias: any;
        }
      `,
      );

      env.driveMain();

      const dtsContents = env.getContents('test.d.ts');

      expect(dtsContents).toContain(
        'static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, "[dir]", never, ' +
          '{ "noArgs": { "alias": "noArgs"; "required": false; }; "stringArg": ' +
          '{ "alias": "aliasedStringArg"; "required": false; }; "requiredNoAlias": ' +
          '{ "alias": "requiredNoAlias"; "required": true; }; "requiredWithAlias": ' +
          '{ "alias": "aliasedRequiredWithAlias"; "required": true; }; }, {}, never, never, false, never>;',
      );
    });

    it('should generate the correct declaration for directives using the `inputs` array', () => {
      env.write(
        'test.ts',
        `
        import {Directive, Input} from '@angular/core';

        @Directive({
          selector: '[dir]',
          inputs: [
            'plain',
            'withAlias: aliasedWithAlias',
            {name: 'plainLiteral'},
            {name: 'aliasedLiteral', alias: 'alisedLiteralAlias'},
            {name: 'requiredLiteral', required: true},
            {name: 'requiredAlisedLiteral', alias: 'requiredAlisedLiteralAlias', required: true}
          ],
          standalone: false,
        })
        export class TestDir {
          plainLiteral: any;
          aliasedLiteral: any;
          requiredLiteral: any;
          requiredAlisedLiteral: any;
        }
      `,
      );

      env.driveMain();

      const dtsContents = env.getContents('test.d.ts');

      expect(dtsContents).toContain(
        'static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, "[dir]", never, ' +
          '{ "plain": { "alias": "plain"; "required": false; }; ' +
          '"withAlias": { "alias": "aliasedWithAlias"; "required": false; }; ' +
          '"plainLiteral": { "alias": "plainLiteral"; "required": false; }; ' +
          '"aliasedLiteral": { "alias": "alisedLiteralAlias"; "required": false; }; ' +
          '"requiredLiteral": { "alias": "requiredLiteral"; "required": true; }; ' +
          '"requiredAlisedLiteral": { "alias": "requiredAlisedLiteralAlias"; "required": true; }; }, {}, never, never, false, never>;',
      );
    });

    describe('NgModule invalid import/export errors', () => {
      function verifyThrownError(errorCode: ErrorCode, errorMessage: string) {
        const errors = env.driveDiagnostics();
        expect(errors.length).toBe(1);
        let {code, messageText} = errors[0];
        if (errors[0].relatedInformation !== undefined) {
          messageText += errors[0].relatedInformation.map((info) => info.messageText).join('\n');
        }
        expect(code).toBe(ngErrorCode(errorCode));
        expect(trim(messageText as string)).toContain(errorMessage);
      }

      it('should provide a hint when importing an invalid NgModule from node_modules', () => {
        env.write(
          'node_modules/external/index.d.ts',
          `
          export declare class NotAModule {}
        `,
        );
        env.write(
          'test.ts',
          `
          import {NgModule} from '@angular/core';
          import {NotAModule} from 'external';

          @NgModule({
            imports: [NotAModule],
          })
          export class Module {}
        `,
        );

        verifyThrownError(
          ErrorCode.NGMODULE_INVALID_IMPORT,
          'This likely means that the library (external) which declares NotAModule is not ' +
            'compatible with Angular Ivy.',
        );
      });

      it('should provide a hint when importing an invalid NgModule from a local library', () => {
        env.write(
          'libs/external/index.d.ts',
          `
          export declare class NotAModule {}
        `,
        );

        env.write(
          'test.ts',
          `
          import {NgModule} from '@angular/core';
          import {NotAModule} from './libs/external';

          @NgModule({
            imports: [NotAModule],
          })
          export class Module {}
        `,
        );

        verifyThrownError(
          ErrorCode.NGMODULE_INVALID_IMPORT,
          'This likely means that the dependency which declares NotAModule is not ' +
            'compatible with Angular Ivy.',
        );
      });

      it('should provide a hint when importing an invalid NgModule in the current program', () => {
        env.write(
          'invalid.ts',
          `
          export class NotAModule {}
        `,
        );

        env.write(
          'test.ts',
          `
          import {NgModule} from '@angular/core';
          import {NotAModule} from './invalid';

          @NgModule({
            imports: [NotAModule],
          })
          export class Module {}
        `,
        );

        verifyThrownError(
          ErrorCode.NGMODULE_INVALID_IMPORT,
          'Is it missing an @NgModule annotation?',
        );
      });

      it('should report if an NgModule imports itself', () => {
        env.write(
          'test.ts',
          `
          import {NgModule} from '@angular/core';

          @NgModule({imports: [MyModule]})
          export class MyModule {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe('NgModule "import" field contains a cycle');
      });

      it('should report if an NgModule exports itself', () => {
        env.write(
          'test.ts',
          `
          import {NgModule} from '@angular/core';

          @NgModule({exports: [MyModule]})
          export class MyModule {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe('NgModule "export" field contains a cycle');
      });

      it('should report if an NgModule imports itself transitively', () => {
        env.write(
          'dep-2.ts',
          `
          import {NgModule} from '@angular/core';
          import {MyModule} from './test';

          @NgModule({imports: [MyModule]})
          export class DepModule2 {}
        `,
        );

        env.write(
          'dep.ts',
          `
          import {NgModule} from '@angular/core';
          import {DepModule2} from './dep-2';

          @NgModule({imports: [DepModule2]})
          export class DepModule {}
        `,
        );

        env.write(
          'test.ts',
          `
          import {NgModule} from '@angular/core';
          import {DepModule} from './dep';

          @NgModule({imports: [DepModule]})
          export class MyModule {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(3);
        expect(diags[0].messageText).toBe(
          'This import contains errors, which may affect components that depend on this NgModule.',
        );
        expect(diags[1].messageText).toBe('NgModule "import" field contains a cycle');
        expect(diags[2].messageText).toBe(
          'This import contains errors, which may affect components that depend on this NgModule.',
        );
      });

      it('should report if an NgModule imports itself via a forwardRef', () => {
        env.write(
          'test.ts',
          `
          import {NgModule, forwardRef} from '@angular/core';

          @NgModule({imports: [forwardRef(() => MyModule)]})
          export class DepModule {}

          @NgModule({imports: [DepModule]})
          export class MyModule {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText).toBe(
          'This import contains errors, which may affect components that depend on this NgModule.',
        );
        expect(diags[1].messageText).toBe('NgModule "import" field contains a cycle');
      });

      it('should report if an NgModule imports itself via a forwardRef', () => {
        env.write(
          'test.ts',
          `
          import {NgModule, forwardRef} from '@angular/core';

          @NgModule({imports: [forwardRef(() => ModB)]})
          class ModA {}

          @NgModule({imports: [forwardRef(() => ModC)]})
          class ModB {}

          @NgModule({imports: [ModB]})
          class ModC {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(3);
        expect(diags[0].messageText).toBe(
          'This import contains errors, which may affect components that depend on this NgModule.',
        );
        expect(diags[1].messageText).toBe(
          'This import contains errors, which may affect components that depend on this NgModule.',
        );
        expect(diags[2].messageText).toBe('NgModule "import" field contains a cycle');
      });
    });

    describe('when processing external directives', () => {
      it('should not emit multiple references to the same directive', () => {
        env.write(
          'node_modules/external/index.d.ts',
          `
        import {ɵɵDirectiveDeclaration, ɵɵNgModuleDeclaration} from '@angular/core';

        export declare class ExternalDir {
          static ɵdir: ɵɵDirectiveDeclaration<ExternalDir, '[test]', never, never, never, never>;
        }

        export declare class ExternalModule {
          static ɵmod: ɵɵNgModuleDeclaration<ExternalModule, [typeof ExternalDir], never, [typeof ExternalDir]>;
        }
      `,
        );
        env.write(
          'test.ts',
          `
        import {Component, Directive, NgModule} from '@angular/core';
        import {ExternalModule} from 'external';

        @Component({
          template: '<div test></div>',
          standalone: false,
        })
        class Cmp {}

        @NgModule({
          declarations: [Cmp],
          // Multiple imports of the same module used to result in duplicate directive references
          // in the output.
          imports: [ExternalModule, ExternalModule],
        })
        class Module {}
      `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).toMatch(/dependencies: \[i1\.ExternalDir\]/);
      });

      it('should import directives by their external name', () => {
        env.write(
          'node_modules/external/index.d.ts',
          `
        import {ɵɵDirectiveDeclaration, ɵɵNgModuleDeclaration} from '@angular/core';
        import {InternalDir} from './internal';

        export {InternalDir as ExternalDir} from './internal';

        export declare class ExternalModule {
          static ɵmod: ɵɵNgModuleDeclaration<ExternalModule, [typeof InternalDir], never, [typeof InternalDir]>;
        }
      `,
        );
        env.write(
          'node_modules/external/internal.d.ts',
          `

        export declare class InternalDir {
          static ɵdir: ɵɵDirectiveDeclaration<InternalDir, '[test]', never, never, never, never>;
        }
      `,
        );
        env.write(
          'test.ts',
          `
        import {Component, Directive, NgModule} from '@angular/core';
        import {ExternalModule} from 'external';

        @Component({
          template: '<div test></div>',
          standalone: false,
        })
        class Cmp {}

        @NgModule({
          declarations: [Cmp],
          imports: [ExternalModule],
        })
        class Module {}
      `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).toMatch(/dependencies: \[i1\.ExternalDir\]/);
      });
    });

    // Run checks that are present in preanalysis phase in both sync and async mode, to
    // make sure the error messages are consistently thrown from `analyzeSync` and
    // `analyzeAsync` functions.
    ['sync', 'async'].forEach((mode) => {
      describe(`preanalysis phase checks [${mode}]`, () => {
        let driveDiagnostics: () => Promise<ReadonlyArray<ts.Diagnostic>>;
        beforeEach(() => {
          if (mode === 'async') {
            env.enablePreloading();
            driveDiagnostics = () => env.driveDiagnosticsAsync();
          } else {
            driveDiagnostics = () => Promise.resolve(env.driveDiagnostics());
          }
        });

        it('should throw if @Component is missing a template', async () => {
          env.write(
            'test.ts',
            `
            import {Component} from '@angular/core';

            @Component({
              selector: 'test',
            })
            export class TestCmp {}
          `,
          );

          const diags = await driveDiagnostics();
          expect(diags[0].messageText).toBe('component is missing a template');
          expect(diags[0].file!.fileName).toBe(absoluteFrom('/test.ts'));
        });

        it('should throw if `styleUrls` is defined incorrectly in @Component', async () => {
          env.write(
            'test.ts',
            `
            import {Component} from '@angular/core';

            @Component({
              selector: 'test',
              template: '...',
              // @ts-ignore
              styleUrls: '...'
            })
            export class TestCmp {}
          `,
          );

          const diags = await driveDiagnostics();
          expect(diags.length).toBe(1);
          const messageText = ts.flattenDiagnosticMessageText(diags[0].messageText, '\n');
          expect(messageText).toContain('styleUrls must be an array of strings');
          expect(messageText).toContain("Value is of type 'string'.");
          expect(diags[0].file!.fileName).toBe(absoluteFrom('/test.ts'));
        });
      });
    });

    describe('flat module indices', () => {
      it('should generate a basic flat module index', () => {
        env.tsconfig({
          'flatModuleOutFile': 'flat.js',
        });
        env.write('test.ts', 'export const TEST = "this is a test";');

        env.driveMain();
        const jsContents = env.getContents('flat.js');
        expect(jsContents).toContain("export * from './test';");
      });

      it('should determine the flat module entry-point within multiple root files', () => {
        env.tsconfig({
          'flatModuleOutFile': 'flat.js',
        });
        env.write('ignored.ts', 'export const TEST = "this is ignored";');
        env.write('index.ts', 'export const ENTRY = "this is the entry";');

        env.driveMain();
        const jsContents = env.getContents('flat.js');
        expect(jsContents).toContain(
          "export * from './index';",
          'Should detect the "index.ts" file as flat module entry-point.',
        );
      });

      it('should generate a flat module with an id', () => {
        env.tsconfig({
          'flatModuleOutFile': 'flat.js',
          'flatModuleId': '@mymodule',
        });
        env.write('test.ts', 'export const TEST = "this is a test";');

        env.driveMain();
        const dtsContents = env.getContents('flat.d.ts');
        expect(dtsContents).toContain('/// <amd-module name="@mymodule" />');
      });

      it('should generate a proper flat module index file when nested', () => {
        env.tsconfig({
          'flatModuleOutFile': './public-api/index.js',
        });

        env.write('test.ts', `export const SOME_EXPORT = 'some-export'`);
        env.driveMain();

        expect(env.getContents('./public-api/index.js')).toContain(`export * from '../test';`);
      });

      it('should not throw if "flatModuleOutFile" is set to null', () => {
        env.tsconfig({
          'flatModuleOutFile': null,
        });

        env.write('test.ts', `export const SOME_EXPORT = 'some-export'`);
        // The "driveMain" method automatically ensures that there is no
        // exception and that the build succeeded.
        env.driveMain();
      });

      it(
        'should not throw or produce flat module index if "flatModuleOutFile" is set to ' +
          'empty string',
        () => {
          env.tsconfig({
            'flatModuleOutFile': '',
          });

          env.write('test.ts', `export const SOME_EXPORT = 'some-export'`);
          // The "driveMain" method automatically ensures that there is no
          // exception and that the build succeeded.
          env.driveMain();
          // Previously ngtsc incorrectly tried generating a flat module index
          // file if the "flatModuleOutFile" was set to an empty string. ngtsc
          // just wrote the bundle file with an empty filename (just extension).
          env.assertDoesNotExist('.js');
          env.assertDoesNotExist('.d.ts');
        },
      );

      it('should report an error when a flat module index is requested but no entrypoint can be determined', () => {
        env.tsconfig({'flatModuleOutFile': 'flat.js'});
        env.write('test.ts', 'export class Foo {}');
        env.write('test2.ts', 'export class Bar {}');

        const errors = env.driveDiagnostics();
        expect(errors.length).toBe(1);
        expect(errors[0].messageText).toBe(
          'Angular compiler option "flatModuleOutFile" requires one and only one .ts file in the "files" field.',
        );
      });

      it('should report an error when a visible directive is not exported', () => {
        env.tsconfig({'flatModuleOutFile': 'flat.js'});
        env.write(
          'test.ts',
          `
        import {Directive, NgModule} from '@angular/core';

        // The directive is not exported.
        @Directive({
          selector: 'test',
          standalone: false,
        })
        class Dir {}

        // The module is, which makes the directive visible.
        @NgModule({declarations: [Dir], exports: [Dir]})
        export class Module {}
      `,
        );

        const errors = env.driveDiagnostics();
        expect(errors.length).toBe(1);
        expect(errors[0].messageText).toBe(
          'Unsupported private class Dir. This class is visible ' +
            'to consumers via Module -> Dir, but is not exported from the top-level library ' +
            'entrypoint.',
        );

        // Verify that the error is for the correct class.
        const error = errors[0] as ts.Diagnostic;
        const id = expectTokenAtPosition(error.file!, error.start!, ts.isIdentifier);
        expect(id.text).toBe('Dir');
        expect(ts.isClassDeclaration(id.parent)).toBe(true);
      });

      it('should report an error when a visible host directive is not exported', () => {
        env.tsconfig({'flatModuleOutFile': 'flat.js'});
        env.write(
          'test.ts',
          `
        import {Directive, NgModule} from '@angular/core';

        @Directive({
          standalone: true,
        })
        class HostDir {}

        // The directive is not exported.
        @Directive({selector: 'test', hostDirectives: [HostDir]})
        export class Dir {}
      `,
        );

        const errors = env.driveDiagnostics();
        expect(errors.length).toBe(1);
        expect(errors[0].code).toBe(ngErrorCode(ErrorCode.SYMBOL_NOT_EXPORTED));
      });

      it('should report an error when a deeply visible directive is not exported', () => {
        env.tsconfig({'flatModuleOutFile': 'flat.js'});
        env.write(
          'test.ts',
          `
        import {Directive, NgModule} from '@angular/core';

        // The directive is not exported.
        @Directive({
          selector: 'test',
          standalone: false,
        })
        class Dir {}

        // Neither is the module which declares it - meaning the directive is not visible here.
        @NgModule({declarations: [Dir], exports: [Dir]})
        class DirModule {}

        // The module is, which makes the directive visible.
        @NgModule({exports: [DirModule]})
        export class Module {}
      `,
        );

        const errors = env.driveDiagnostics();
        expect(errors.length).toBe(2);
        expect(errors[0].messageText).toBe(
          'Unsupported private class DirModule. This class is ' +
            'visible to consumers via Module -> DirModule, but is not exported from the top-level ' +
            'library entrypoint.',
        );
        expect(errors[1].messageText).toBe(
          'Unsupported private class Dir. This class is visible ' +
            'to consumers via Module -> DirModule -> Dir, but is not exported from the top-level ' +
            'library entrypoint.',
        );
      });

      it('should report an error when a deeply visible module is not exported', () => {
        env.tsconfig({'flatModuleOutFile': 'flat.js'});
        env.write(
          'test.ts',
          `
        import {Directive, NgModule} from '@angular/core';

        // The directive is exported.
        @Directive({
          selector: 'test',
          standalone: false,
        })
        export class Dir {}

        // The module which declares it is not.
        @NgModule({declarations: [Dir], exports: [Dir]})
        class DirModule {}

        // The module is, which makes the module and directive visible.
        @NgModule({exports: [DirModule]})
        export class Module {}
      `,
        );

        const errors = env.driveDiagnostics();
        expect(errors.length).toBe(1);
        expect(errors[0].messageText).toBe(
          'Unsupported private class DirModule. This class is ' +
            'visible to consumers via Module -> DirModule, but is not exported from the top-level ' +
            'library entrypoint.',
        );
      });

      it('should not report an error when a non-exported module is imported by a visible one', () => {
        env.tsconfig({'flatModuleOutFile': 'flat.js'});
        env.write(
          'test.ts',
          `
        import {Directive, NgModule} from '@angular/core';

        // The directive is not exported.
        @Directive({
          selector: 'test',
          standalone: false,
        })
        class Dir {}

        // Neither is the module which declares it.
        @NgModule({declarations: [Dir], exports: [Dir]})
        class DirModule {}

        // This module is, but it doesn't re-export the module, so it doesn't make the module and
        // directive visible.
        @NgModule({imports: [DirModule]})
        export class Module {}
      `,
        );

        const errors = env.driveDiagnostics();
        expect(errors.length).toBe(0);
      });

      it('should not report an error when re-exporting an external symbol', () => {
        env.tsconfig({'flatModuleOutFile': 'flat.js'});
        env.write(
          'test.ts',
          `
        import {Directive, NgModule} from '@angular/core';
        import {ExternalModule} from 'external';

        // This module makes ExternalModule and ExternalDir visible.
        @NgModule({exports: [ExternalModule]})
        export class Module {}
      `,
        );
        env.write(
          'node_modules/external/index.d.ts',
          `
        import {ɵɵDirectiveDeclaration, ɵɵNgModuleDeclaration} from '@angular/core';

        export declare class ExternalDir {
          static ɵdir: ɵɵDirectiveDeclaration<ExternalDir, '[test]', never, never, never, never>;
        }

        export declare class ExternalModule {
          static ɵmod: ɵɵNgModuleDeclaration<ExternalModule, [typeof ExternalDir], never, [typeof ExternalDir]>;
        }
      `,
        );

        const errors = env.driveDiagnostics();
        expect(errors.length).toBe(0);
      });
    });

    describe('aliasing re-exports', () => {
      beforeEach(() => {
        env.tsconfig({
          'generateDeepReexports': true,
        });
      });

      it('should re-export a directive from a different file under a private symbol name', () => {
        env.write(
          'dir.ts',
          `
          import {Directive} from '@angular/core';

          @Directive({
            selector: 'dir',
            standalone: false,
          })
          export class Dir {}
        `,
        );
        env.write(
          'module.ts',
          `
          import {Directive, NgModule} from '@angular/core';
          import {Dir} from './dir';

          @Directive({
            selector: '[inline]',
            standalone: false,
          })
          export class InlineDir {}

          @NgModule({
            declarations: [Dir, InlineDir],
            exports: [Dir, InlineDir],
          })
          export class Module {}
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('module.js');
        const dtsContents = env.getContents('module.d.ts');

        expect(jsContents).toContain('export { Dir as ɵngExportɵModuleɵDir } from "./dir";');
        expect(jsContents).not.toContain('ɵngExportɵModuleɵInlineDir');
        expect(dtsContents).toContain('export { Dir as ɵngExportɵModuleɵDir } from "./dir";');
        expect(dtsContents).not.toContain('ɵngExportɵModuleɵInlineDir');
      });

      it('should re-export a directive from an exported NgModule under a private symbol name', () => {
        env.write(
          'dir.ts',
          `
          import {Directive, NgModule} from '@angular/core';

          @Directive({
            selector: 'dir',
            standalone: false,
          })
          export class Dir {}

          @NgModule({
            declarations: [Dir],
            exports: [Dir],
          })
          export class DirModule {}
        `,
        );
        env.write(
          'module.ts',
          `
          import {NgModule} from '@angular/core';
          import {DirModule} from './dir';

          @NgModule({
            exports: [DirModule],
          })
          export class Module {}
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('module.js');
        const dtsContents = env.getContents('module.d.ts');

        expect(jsContents).toContain('export { Dir as ɵngExportɵModuleɵDir } from "./dir";');
        expect(dtsContents).toContain('export { Dir as ɵngExportɵModuleɵDir } from "./dir";');
      });

      it("should not re-export a directive that's not exported from the NgModule", () => {
        env.write(
          'dir.ts',
          `
             import {Directive} from '@angular/core';

             @Directive({
               selector: 'dir',
               standalone: false,
             })
             export class Dir {}
           `,
        );
        env.write(
          'module.ts',
          `
             import {NgModule} from '@angular/core';
             import {Dir} from './dir';

             @NgModule({
               declarations: [Dir],
               exports: [],
             })
             export class Module {}
           `,
        );

        env.driveMain();
        const jsContents = env.getContents('module.js');
        const dtsContents = env.getContents('module.d.ts');

        expect(jsContents).not.toContain('ɵngExportɵModuleɵDir');
        expect(dtsContents).not.toContain('ɵngExportɵModuleɵDir');
      });

      it("should not re-export a directive that's already exported", () => {
        env.write(
          'dir.ts',
          `
          import {Directive} from '@angular/core';

          @Directive({
            selector: 'dir',
            standalone: false,
          })
          export class Dir {}
        `,
        );
        env.write(
          'module.ts',
          `
          import {NgModule} from '@angular/core';
          import {Dir} from './dir';

          @NgModule({
            declarations: [Dir],
            exports: [Dir],
          })
          export class Module {}

          export {Dir};
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('module.js');
        const dtsContents = env.getContents('module.d.ts');

        expect(jsContents).not.toContain('ɵngExportɵModuleɵDir');
        expect(dtsContents).not.toContain('ɵngExportɵModuleɵDir');
      });

      it('should not re-export a directive from an exported, external NgModule', () => {
        env.write(
          `node_modules/external/index.d.ts`,
          `
          import {ɵɵDirectiveDeclaration, ɵɵNgModuleDeclaration} from '@angular/core';

          export declare class ExternalDir {
            static ɵdir: ɵɵDirectiveDeclaration<ExternalDir, '[test]', never, never, never, never>;
          }

          export declare class ExternalModule {
            static ɵmod: ɵɵNgModuleDeclaration<ExternalModule, [typeof ExternalDir], never, [typeof ExternalDir]>;
          }
          `,
        );
        env.write(
          'module.ts',
          `
          import {NgModule} from '@angular/core';
          import {ExternalModule} from 'external';

          @NgModule({
            exports: [ExternalModule],
          })
          export class Module {}
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('module.js');

        expect(jsContents).not.toContain('ɵngExportɵExternalModuleɵExternalDir');
      });

      it('should error when two directives with the same declared name are exported from the same NgModule', () => {
        env.write(
          'dir.ts',
          `
          import {Directive} from '@angular/core';

          @Directive({
            selector: 'dir',
            standalone: false,
          })
          export class Dir {}
        `,
        );
        env.write(
          'dir2.ts',
          `
          import {Directive} from '@angular/core';

          @Directive({
            selector: 'dir',
            standalone: false,
          })
          export class Dir {}
        `,
        );
        env.write(
          'module.ts',
          `
          import {NgModule} from '@angular/core';
          import {Dir} from './dir';
          import {Dir as Dir2} from './dir2';

          @NgModule({
            declarations: [Dir, Dir2],
            exports: [Dir, Dir2],
          })
          export class Module {}
        `,
        );

        const diag = env.driveDiagnostics();
        expect(diag.length).toBe(1);
        expect(diag[0]!.code).toEqual(ngErrorCode(ErrorCode.NGMODULE_REEXPORT_NAME_COLLISION));
      });

      it('should not error when two directives with the same declared name are exported from the same NgModule, but one is exported from the file directly', () => {
        env.write(
          'dir.ts',
          `
             import {Directive} from '@angular/core';

             @Directive({
               selector: 'dir',
               standalone: false,
             })
             export class Dir {}
           `,
        );
        env.write(
          'dir2.ts',
          `
             import {Directive} from '@angular/core';

             @Directive({
               selector: 'dir',
               standalone: false,
             })
             export class Dir {}
           `,
        );
        env.write(
          'module.ts',
          `
             import {NgModule} from '@angular/core';
             import {Dir} from './dir';
             import {Dir as Dir2} from './dir2';

             @NgModule({
               declarations: [Dir, Dir2],
               exports: [Dir, Dir2],
             })
             export class Module {}

             export {Dir} from './dir2';
           `,
        );

        env.driveMain();
        const jsContents = env.getContents('module.js');
        expect(jsContents).toContain('export { Dir as ɵngExportɵModuleɵDir } from "./dir";');
      });

      it('should choose a re-exported symbol if one is present', () => {
        env.write(
          `node_modules/external/dir.d.ts`,
          `
          import {ɵɵDirectiveDeclaration} from '@angular/core';

          export declare class ExternalDir {
            static ɵdir: ɵɵDirectiveDeclaration<ExternalDir, '[test]', never, never, never, never>;
          }
          `,
        );
        env.write(
          'node_modules/external/module.d.ts',
          `
          import {ɵɵNgModuleDeclaration} from '@angular/core';
          import {ExternalDir} from './dir';

          export declare class ExternalModule {
            static ɵmod: ɵɵNgModuleDeclaration<ExternalModule, [typeof ExternalDir], never, [typeof ExternalDir]>;
          }

          export {ExternalDir as ɵngExportɵExternalModuleɵExternalDir};
        `,
        );
        env.write(
          'test.ts',
          `
          import {Component, Directive, NgModule} from '@angular/core';
          import {ExternalModule} from 'external/module';

          @Component({
            selector: 'test-cmp',
            template: '<div test></div>',
            standalone: false,
          })
          class Cmp {}

          @NgModule({
            declarations: [Cmp],
            imports: [ExternalModule],
          })
          class Module {}
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain('import * as i1 from "external/module";');
        expect(jsContents).toContain('dependencies: [i1.ɵngExportɵExternalModuleɵExternalDir]');
      });

      it('should not generate re-exports when disabled', () => {
        // Return to the default configuration, which has re-exports disabled.
        env.tsconfig();

        env.write(
          'dir.ts',
          `
          import {Directive} from '@angular/core';

          @Directive({
            selector: 'dir',
            standalone: false,
          })
          export class Dir {}
        `,
        );
        env.write(
          'module.ts',
          `
          import {NgModule} from '@angular/core';
          import {Dir} from './dir';

          @NgModule({
            declarations: [Dir],
            exports: [Dir],
          })
          export class Module {}
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('module.js');
        const dtsContents = env.getContents('module.d.ts');

        expect(jsContents).not.toContain('ɵngExportɵModuleɵDir');
        expect(dtsContents).not.toContain('ɵngExportɵModuleɵDir');
      });
    });

    it('should execute custom transformers', () => {
      let beforeCount = 0;
      let afterCount = 0;

      env.write(
        'test.ts',
        `
      import {NgModule} from '@angular/core';

      @NgModule({})
      class Module {}
    `,
      );

      env.driveMain({
        beforeTs: [
          () => (sourceFile: ts.SourceFile) => {
            beforeCount++;
            return sourceFile;
          },
        ],
        afterTs: [
          () => (sourceFile: ts.SourceFile) => {
            afterCount++;
            return sourceFile;
          },
        ],
      });

      expect(beforeCount).toBe(1);
      expect(afterCount).toBe(1);
    });

    describe('sanitization', () => {
      it('should generate sanitizers for unsafe attributes in hostBindings fn in Directives', () => {
        env.write(
          `test.ts`,
          `
        import {Component, Directive, HostBinding, NgModule, Input} from '@angular/core';

        @Directive({
          selector: '[unsafeAttrs]',
          standalone: false,
        })
        class UnsafeAttrsDirective {
          @HostBinding('attr.href')
          attrHref: string;

          @HostBinding('attr.src')
          attrSrc: string;

          @HostBinding('attr.action')
          attrAction: string;

          @HostBinding('attr.profile')
          attrProfile: string;

          @HostBinding('attr.innerHTML')
          attrInnerHTML: string;

          @HostBinding('attr.title')
          attrSafeTitle: string;

          @Input() unsafeAttrs: any;
        }

        @Component({
          selector: 'foo',
          template: '<a [unsafeAttrs]="ctxProp">Link Title</a>',
          standalone: false,
        })
        class FooCmp {
          ctxProp = '';
        }

        @NgModule({declarations: [FooCmp, UnsafeAttrsDirective]})
        export class Module {}
      `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');
        const hostBindingsFn = `
        hostVars: 6,
        hostBindings: function UnsafeAttrsDirective_HostBindings(rf, ctx) {
          if (rf & 2) {
            i0.ɵɵattribute("href", ctx.attrHref, i0.ɵɵsanitizeUrlOrResourceUrl)("src", ctx.attrSrc, i0.ɵɵsanitizeUrlOrResourceUrl)("action", ctx.attrAction, i0.ɵɵsanitizeUrl)("profile", ctx.attrProfile, i0.ɵɵsanitizeResourceUrl)("innerHTML", ctx.attrInnerHTML, i0.ɵɵsanitizeHtml)("title", ctx.attrSafeTitle);
          }
        }
      `;
        expect(trim(jsContents)).toContain(trim(hostBindingsFn));
      });

      it('should generate sanitizers for unsafe properties in hostBindings fn in Directives', () => {
        env.write(
          `test.ts`,
          `
        import {Component, Directive, HostBinding, Input, NgModule} from '@angular/core';

        @Directive({
          selector: '[unsafeProps]',
          standalone: false,
        })
        class UnsafePropsDirective {
          @HostBinding('href')
          propHref: string;

          @HostBinding('src')
          propSrc: string;

          @HostBinding('action')
          propAction: string;

          @HostBinding('profile')
          propProfile: string;

          @HostBinding('innerHTML')
          propInnerHTML: string;

          @HostBinding('title')
          propSafeTitle: string;

          @Input() unsafeProps: any;
        }

        @Component({
          selector: 'foo',
          template: '<a [unsafeProps]="ctxProp">Link Title</a>',
          standalone: false,
        })
        class FooCmp {
          ctxProp = '';
        }

        @NgModule({declarations: [FooCmp, UnsafePropsDirective]})
        class MyModule {}
      `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');
        const hostBindingsFn = `
        hostVars: 6,
        hostBindings: function UnsafePropsDirective_HostBindings(rf, ctx) {
          if (rf & 2) {
            i0.ɵɵdomProperty("href", ctx.propHref, i0.ɵɵsanitizeUrlOrResourceUrl)("src", ctx.propSrc, i0.ɵɵsanitizeUrlOrResourceUrl)("action", ctx.propAction, i0.ɵɵsanitizeUrl)("profile", ctx.propProfile, i0.ɵɵsanitizeResourceUrl)("innerHTML", ctx.propInnerHTML, i0.ɵɵsanitizeHtml)("title", ctx.propSafeTitle);
          }
        }
      `;
        expect(trim(jsContents)).toContain(trim(hostBindingsFn));
      });

      it('should not generate sanitizers for URL properties in hostBindings fn in Component', () => {
        env.write(
          `test.ts`,
          `
        import {Component} from '@angular/core';

        @Component({
          selector: 'foo',
          template: '<a href="example.com">Link Title</a>',
          host: {
            '[src]': 'srcProp',
            '[href]': 'hrefProp',
            '[title]': 'titleProp',
            '[attr.src]': 'srcAttr',
            '[attr.href]': 'hrefAttr',
            '[attr.title]': 'titleAttr',
          }
        })
        class FooCmp {}
      `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');
        const hostBindingsFn = `
        hostVars: 6,
        hostBindings: function FooCmp_HostBindings(rf, ctx) {
          if (rf & 2) {
            i0.ɵɵdomProperty("src", ctx.srcProp)("href", ctx.hrefProp)("title", ctx.titleProp);
            i0.ɵɵattribute("src", ctx.srcAttr)("href", ctx.hrefAttr)("title", ctx.titleAttr);
          }
        }
      `;
        expect(trim(jsContents)).toContain(trim(hostBindingsFn));
      });
    });

    describe('NgModule export aliasing', () => {
      it('should use an alias to import a directive from a deep dependency when _useHostForImportAndAliasGeneration is set', () => {
        env.tsconfig({'_useHostForImportAndAliasGeneration': true});

        // 'alpha' declares the directive which will ultimately be imported.
        env.write(
          'alpha.d.ts',
          `
        import {ɵɵDirectiveDeclaration, ɵɵNgModuleDeclaration} from '@angular/core';

        export declare class ExternalDir {
          static ɵdir: ɵɵDirectiveDeclaration<ExternalDir, '[test]', never, never, never, never>;
        }

        export declare class AlphaModule {
          static ɵmod: ɵɵNgModuleDeclaration<AlphaModule, [typeof ExternalDir], never, [typeof ExternalDir]>;
        }
      `,
        );

        // 'beta' re-exports AlphaModule from alpha.
        env.write(
          'beta.d.ts',
          `
        import {ɵɵNgModuleDeclaration} from '@angular/core';
        import {AlphaModule} from './alpha';

        export declare class BetaModule {
          static ɵmod: ɵɵNgModuleDeclaration<AlphaModule, never, never, [typeof AlphaModule]>;
        }
      `,
        );

        // The application imports BetaModule from beta, gaining visibility of
        // ExternalDir from alpha.
        env.write(
          'test.ts',
          `
        import {Component, NgModule} from '@angular/core';
        import {BetaModule} from './beta';

        @Component({
          selector: 'cmp',
          template: '<div test></div>',
          standalone: false,
        })
        export class Cmp {}

        @NgModule({
          declarations: [Cmp],
          imports: [BetaModule],
        })
        export class Module {}
      `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');

        // Expect that ExternalDir from alpha is imported via the re-export from beta.
        expect(jsContents).toContain('import * as i1 from "root/beta";');
        expect(jsContents).toContain('dependencies: [i1.\u0275ng$root$alpha$$ExternalDir]');
      });

      it('should directly import a directive from a deep dependency when _useHostForImportGeneration is set', () => {
        env.tsconfig({'_useHostForImportGeneration': true});

        // 'alpha' declares the directive which will ultimately be imported.
        env.write(
          'alpha.d.ts',
          `
        import {ɵɵDirectiveDeclaration, ɵɵNgModuleDeclaration} from '@angular/core';

        export declare class ExternalDir {
          static ɵdir: ɵɵDirectiveDeclaration<ExternalDir, '[test]', never, never, never, never>;
        }

        export declare class AlphaModule {
          static ɵmod: ɵɵNgModuleDeclaration<AlphaModule, [typeof ExternalDir], never, [typeof ExternalDir]>;
        }
      `,
        );

        // 'beta' re-exports AlphaModule from alpha.
        env.write(
          'beta.d.ts',
          `
        import {ɵɵNgModuleDeclaration} from '@angular/core';
        import {AlphaModule} from './alpha';

        export declare class BetaModule {
          static ɵmod: ɵɵNgModuleDeclaration<AlphaModule, never, never, [typeof AlphaModule]>;
        }
      `,
        );

        // The application imports BetaModule from beta, gaining visibility of
        // ExternalDir from alpha.
        env.write(
          'test.ts',
          `
        import {Component, NgModule} from '@angular/core';
        import {BetaModule} from './beta';

        @Component({
          selector: 'cmp',
          template: '<div test></div>',
          standalone: false,
        })
        export class Cmp {}

        @NgModule({
          declarations: [Cmp],
          imports: [BetaModule],
        })
        export class Module {}
      `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');

        // Expect that ExternalDir from alpha is imported via the re-export from beta.
        expect(jsContents).toContain('import * as i1 from "root/alpha";');
        expect(jsContents).toContain('dependencies: [i1.ExternalDir]');
      });

      it('should write alias ES2015 exports for NgModule exported directives when _useHostForImportAndAliasGeneration is set', () => {
        env.tsconfig({'_useHostForImportAndAliasGeneration': true});
        env.write(
          'external.d.ts',
          `
        import {ɵɵDirectiveDeclaration, ɵɵNgModuleDeclaration} from '@angular/core';
        import {LibModule} from './lib';

        export declare class ExternalDir {
          static ɵdir: ɵɵDirectiveDeclaration<ExternalDir, '[test]', never, never, never, never>;
        }

        export declare class ExternalModule {
          static ɵmod: ɵɵNgModuleDeclaration<ExternalModule, [typeof ExternalDir], never, [typeof ExternalDir, typeof LibModule]>;
        }
      `,
        );
        env.write(
          'lib.d.ts',
          `
        import {ɵɵDirectiveDeclaration, ɵɵNgModuleDeclaration} from '@angular/core';

        export declare class LibDir {
          static ɵdir: ɵɵDirectiveDeclaration<LibDir, '[lib]', never, never, never, never>;
        }

        export declare class LibModule {
          static ɵmod: ɵɵNgModuleDeclaration<LibModule, [typeof LibDir], never, [typeof LibDir]>;
        }
      `,
        );
        env.write(
          'foo.ts',
          `
        import {Directive, NgModule} from '@angular/core';
        import {ExternalModule} from './external';

        @Directive({
          selector: '[foo]',
          standalone: false,
        })
        export class FooDir {}

        @NgModule({
          declarations: [FooDir],
          exports: [FooDir, ExternalModule]
        })
        export class FooModule {}
      `,
        );
        env.write(
          'index.ts',
          `
        import {Component, NgModule} from '@angular/core';
        import {FooModule} from './foo';

        @Component({
          selector: 'index',
          template: '<div foo test lib></div>',
          standalone: false,
        })
        export class IndexCmp {}

        @NgModule({
          declarations: [IndexCmp],
          exports: [FooModule],
        })
        export class IndexModule {}
      `,
        );
        env.driveMain();
        const jsContents = env.getContents('index.js');
        expect(jsContents).toContain(
          'export { FooDir as \u0275ng$root$foo$$FooDir } from "root/foo";',
        );
      });

      it('should not write alias ES2015 exports for NgModule exported directives when _useHostForImportGeneration is set', () => {
        env.tsconfig({'_useHostForImportGeneration': true});
        env.write(
          'external.d.ts',
          `
        import {ɵɵDirectiveDeclaration, ɵɵNgModuleDeclaration} from '@angular/core';
        import {LibModule} from './lib';

        export declare class ExternalDir {
          static ɵdir: ɵɵDirectiveDeclaration<ExternalDir, '[test]', never, never, never, never>;
        }

        export declare class ExternalModule {
          static ɵmod: ɵɵNgModuleDeclaration<ExternalModule, [typeof ExternalDir], never, [typeof ExternalDir, typeof LibModule]>;
        }
      `,
        );
        env.write(
          'lib.d.ts',
          `
        import {ɵɵDirectiveDeclaration, ɵɵNgModuleDeclaration} from '@angular/core';

        export declare class LibDir {
          static ɵdir: ɵɵDirectiveDeclaration<LibDir, '[lib]', never, never, never, never>;
        }

        export declare class LibModule {
          static ɵmod: ɵɵNgModuleDeclaration<LibModule, [typeof LibDir], never, [typeof LibDir]>;
        }
      `,
        );
        env.write(
          'foo.ts',
          `
        import {Directive, NgModule} from '@angular/core';
        import {ExternalModule} from './external';

        @Directive({
          selector: '[foo]',
          standalone: false,
        })
        export class FooDir {}

        @NgModule({
          declarations: [FooDir],
          exports: [FooDir, ExternalModule]
        })
        export class FooModule {}
      `,
        );
        env.write(
          'index.ts',
          `
        import {Component, NgModule} from '@angular/core';
        import {FooModule} from './foo';

        @Component({
          selector: 'index',
          template: '<div foo test lib></div>',
          standalone: false,
        })
        export class IndexCmp {}

        @NgModule({
          declarations: [IndexCmp],
          exports: [FooModule],
        })
        export class IndexModule {}
      `,
        );
        env.driveMain();
        const jsContents = env.getContents('index.js');
        expect(jsContents).not.toMatch(
          /export\s+\{\s*FooDir\s+as\s+ \u0275ng$root$foo$$FooDir\s*\}\s+from\s+"root\/foo";/,
        );
      });

      it('should escape unusual characters in aliased filenames', () => {
        env.tsconfig({'_useHostForImportAndAliasGeneration': true});
        env.write(
          'other._$test.ts',
          `
        import {Directive, NgModule} from '@angular/core';

        @Directive({
          selector: 'test',
          standalone: false,
        })
        export class TestDir {}

        @NgModule({
          declarations: [TestDir],
          exports: [TestDir],
        })
        export class OtherModule {}
      `,
        );
        env.write(
          'index.ts',
          `
        import {NgModule} from '@angular/core';
        import {OtherModule} from './other._$test';

        @NgModule({
          exports: [OtherModule],
        })
        export class IndexModule {}
      `,
        );
        env.driveMain();
        const jsContents = env.getContents('index.js');
        expect(jsContents).toContain(
          'export { TestDir as \u0275ng$root$other___test$$TestDir } from "root/other._$test";',
        );
      });
    });

    describe('disableTypeScriptVersionCheck', () => {
      afterEach(() => restoreTypeScriptVersionForTesting());

      it('produces an error when not supported and version check is enabled', () => {
        setTypeScriptVersionForTesting('3.4.0');
        env.tsconfig({disableTypeScriptVersionCheck: false});
        env.write('empty.ts', '');

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain('but 3.4.0 was found instead');
      });

      it('does not produce an error when supported and version check is enabled', () => {
        env.tsconfig({disableTypeScriptVersionCheck: false});
        env.write('empty.ts', '');

        // The TypeScript version is not overwritten, so the version
        // that is actually used should be supported
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('does not produce an error when not supported but version check is disabled', () => {
        setTypeScriptVersionForTesting('3.4.0');
        env.tsconfig({disableTypeScriptVersionCheck: true});
        env.write('empty.ts', '');

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('produces an error when not supported using default configuration', () => {
        setTypeScriptVersionForTesting('3.4.0');
        env.write('empty.ts', '');

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain('but 3.4.0 was found instead');
      });
    });

    describe('inherited directives', () => {
      beforeEach(() => {
        env.write(
          'local.ts',
          `
          import {Component, Directive, ElementRef} from '@angular/core';

          export class BasePlain {}

          export class BasePlainWithBlankConstructor {
            constructor() {}
          }

          export class BasePlainWithConstructorParameters {
            constructor(elementRef: ElementRef) {}
          }

          @Component({
            selector: 'base-cmp',
            template: 'BaseCmp',
          })
          export class BaseCmp {}

          @Directive({
            selector: '[base]',
          })
          export class BaseDir {}
        `,
        );

        env.write(
          'lib.d.ts',
          `
          import {ɵɵComponentDeclaration, ɵɵDirectiveDeclaration, ElementRef} from '@angular/core';

          export declare class BasePlain {}

          export declare class BasePlainWithBlankConstructor {
            constructor() {}
          }

          export declare class BasePlainWithConstructorParameters {
            constructor(elementRef: ElementRef) {}
          }

          export declare class BaseCmp {
            static ɵcmp: ɵɵComponentDeclaration<BaseCmp, "base-cmp", never, {}, {}, never>
          }

          export declare class BaseDir {
            static ɵdir: ɵɵDirectiveDeclaration<BaseDir, '[base]', never, never, never, never>;
          }
        `,
        );
      });

      it('should not error when inheriting a constructor from a decorated directive class', () => {
        env.tsconfig();
        env.write(
          'test.ts',
          `
          import {Directive, Component} from '@angular/core';
          import {BaseDir, BaseCmp} from './local';

          @Directive({
            selector: '[dir]',
          })
          export class Dir extends BaseDir {}

          @Component({
            selector: 'test-cmp',
            template: 'TestCmp',
          })
          export class Cmp extends BaseCmp {}
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should not error when inheriting a constructor without parameters', () => {
        env.tsconfig();
        env.write(
          'test.ts',
          `
          import {Directive, Component} from '@angular/core';
          import {BasePlainWithBlankConstructor} from './local';

          @Directive({
            selector: '[dir]',
          })
          export class Dir extends BasePlainWithBlankConstructor {}

          @Component({
            selector: 'test-cmp',
            template: 'TestCmp',
          })
          export class Cmp extends BasePlainWithBlankConstructor {}
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should not error when inheriting from a class without a constructor', () => {
        env.tsconfig();
        env.write(
          'test.ts',
          `
          import {Directive, Component} from '@angular/core';
          import {BasePlain} from './local';

          @Directive({
            selector: '[dir]',
          })
          export class Dir extends BasePlain {}

          @Component({
            selector: 'test-cmp',
            template: 'TestCmp',
          })
          export class Cmp extends BasePlain {}
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should error when inheriting a constructor from an undecorated class', () => {
        env.tsconfig();
        env.write(
          'test.ts',
          `
          import {Directive, Component} from '@angular/core';
          import {BasePlainWithConstructorParameters} from './local';

          @Directive({
            selector: '[dir]',
          })
          export class Dir extends BasePlainWithConstructorParameters {}

          @Component({
            selector: 'test-cmp',
            template: 'TestCmp',
          })
          export class Cmp extends BasePlainWithConstructorParameters {}
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText).toContain('Dir');
        expect(diags[0].messageText).toContain('BasePlainWithConstructorParameters');
        expect(diags[1].messageText).toContain('Cmp');
        expect(diags[1].messageText).toContain('BasePlainWithConstructorParameters');
      });

      it('should error when inheriting a constructor from undecorated grand super class', () => {
        env.tsconfig();
        env.write(
          'test.ts',
          `
          import {Directive, Component} from '@angular/core';
          import {BasePlainWithConstructorParameters} from './local';

          class Parent extends BasePlainWithConstructorParameters {}

          @Directive({
            selector: '[dir]',
          })
          export class Dir extends Parent {}

          @Component({
            selector: 'test-cmp',
            template: 'TestCmp',
          })
          export class Cmp extends Parent {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText).toContain('Dir');
        expect(diags[0].messageText).toContain('BasePlainWithConstructorParameters');
        expect(diags[1].messageText).toContain('Cmp');
        expect(diags[1].messageText).toContain('BasePlainWithConstructorParameters');
      });

      it('should error when inheriting a constructor from undecorated grand grand super class', () => {
        env.tsconfig();
        env.write(
          'test.ts',
          `
              import {Directive, Component} from '@angular/core';
              import {BasePlainWithConstructorParameters} from './local';

              class GrandParent extends BasePlainWithConstructorParameters {}

              class Parent extends GrandParent {}

              @Directive({
                selector: '[dir]',
              })
              export class Dir extends Parent {}

              @Component({
                selector: 'test-cmp',
                template: 'TestCmp',
              })
              export class Cmp extends Parent {}
            `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText).toContain('Dir');
        expect(diags[0].messageText).toContain('BasePlainWithConstructorParameters');
        expect(diags[1].messageText).toContain('Cmp');
        expect(diags[1].messageText).toContain('BasePlainWithConstructorParameters');
      });

      it('should not error when inheriting a constructor from decorated directive or component classes in a .d.ts file', () => {
        env.tsconfig();
        env.write(
          'test.ts',
          `
              import {Component, Directive} from '@angular/core';
              import {BaseDir, BaseCmp} from './lib';

              @Directive({
                selector: '[dir]',
              })
              export class Dir extends BaseDir {}

              @Component({
                selector: 'test-cmp',
                template: 'TestCmp',
              })
              export class Cmp extends BaseCmp {}
           `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should error when inheriting a constructor from an undecorated class in a .d.ts file', () => {
        env.tsconfig();
        env.write(
          'test.ts',
          `
              import {Directive} from '@angular/core';

              import {BasePlainWithConstructorParameters} from './lib';

              @Directive({
                selector: '[dir]',
              })
              export class Dir extends BasePlainWithConstructorParameters {}
            `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain('Dir');
        expect(diags[0].messageText).toContain('Base');
      });

      it('should produce a diagnostic if an inherited required input is not bound', () => {
        env.tsconfig();
        env.write(
          'test.ts',
          `
          import {Directive, Component, Input} from '@angular/core';

          @Directive()
          export class BaseDir {
            @Input({required: true}) input: any;
          }

          @Directive({
            selector: '[dir]',
            standalone: true
          })
          export class Dir extends BaseDir {}

          @Component({
            selector: 'test-cmp',
            template: '<div dir></div>',
            standalone: true,
            imports: [Dir]
          })
          export class Cmp {}
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Required input 'input' from directive Dir must be specified.`,
        );
      });

      it('should not produce a diagnostic if an inherited required input is bound', () => {
        env.tsconfig();
        env.write(
          'test.ts',
          `
          import {Directive, Component, Input} from '@angular/core';

          @Directive()
          export class BaseDir {
            @Input({required: true}) input: any;
          }

          @Directive({
            selector: '[dir]',
            standalone: true
          })
          export class Dir extends BaseDir {}

          @Component({
            selector: 'test-cmp',
            template: '<div dir [input]="value"></div>',
            standalone: true,
            imports: [Dir]
          })
          export class Cmp {
            value = 123;
          }
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });
    });

    describe('inline resources', () => {
      it('should process inline <style> tags', () => {
        env.write(
          'test.ts',
          `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<style>h1 {font-size: larger}</style>',
          styles: ['h2 {width: 10px}']
        })
        export class TestCmp {}
      `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain(
          'styles: ["h2[_ngcontent-%COMP%] {width: 10px}", "h1[_ngcontent-%COMP%] {font-size: larger}"]',
        );
      });

      it('should process inline <link> tags', () => {
        env.write('style.css', `h1 {font-size: larger}`);
        env.write(
          'test.ts',
          `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<link rel="stylesheet" href="./style.css">',
        })
        export class TestCmp {}
      `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain('styles: ["h1[_ngcontent-%COMP%] {font-size: larger}"]');
      });

      it('should share same styles declared in different components in the same file', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'comp-a',
            template: 'Comp A',
            styles: [
              'span { font-size: larger; }',
              'div { background: url(/some-very-very-long-path.png); }',
              'img { background: url(/a/some-very-very-long-path.png); }'
            ]
          })
          export class CompA {}

          @Component({
            selector: 'comp-b',
            template: 'Comp B',
            styles: [
              'span { font-size: larger; }',
              'div { background: url(/some-very-very-long-path.png); }',
              'img { background: url(/b/some-very-very-long-path.png); }'
            ]
          })
          export class CompB {}
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        // Verify that long styles present in both components are extracted to a
        // separate var.
        expect(jsContents).toContain(
          '_c0 = "div[_ngcontent-%COMP%] { background: url(/some-very-very-long-path.png); }";',
        );

        expect(jsContents).toContain(
          'styles: [' +
            // This style is present in both components, but was not extracted into
            // a separate var since it doesn't reach length threshold (50 chars) in
            // `ConstantPool`.
            '"span[_ngcontent-%COMP%] { font-size: larger; }", ' +
            // Style that is present in both components, but reaches length
            // threshold - extracted to a separate var.
            '_c0, ' +
            // Style that is unique to this component, but that reaches length
            // threshold - remains a string in the `styles` array.
            '"img[_ngcontent-%COMP%] { background: url(/a/some-very-very-long-path.png); }"]',
        );

        expect(jsContents).toContain(
          'styles: [' +
            // This style is present in both components, but was not extracted into
            // a separate var since it doesn't reach length threshold (50 chars) in
            // `ConstantPool`.
            '"span[_ngcontent-%COMP%] { font-size: larger; }", ' +
            // Style that is present in both components, but reaches length
            // threshold - extracted to a separate var.
            '_c0, ' +
            // Style that is unique to this component, but that reaches length
            // threshold - remains a string in the `styles` array.
            '"img[_ngcontent-%COMP%] { background: url(/b/some-very-very-long-path.png); }"]',
        );
      });

      it('large strings are wrapped in a function for Closure', () => {
        env.tsconfig({
          annotateForClosureCompiler: true,
        });

        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'comp-a',
            template: 'Comp A',
            styles: [
              'div { background: url(/a.png); }',
              'div { background: url(/some-very-very-long-path.png); }',
            ]
          })
          export class CompA {}

          @Component({
            selector: 'comp-b',
            template: 'Comp B',
            styles: [
              'div { background: url(/b.png); }',
              'div { background: url(/some-very-very-long-path.png); }',
            ]
          })
          export class CompB {}
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        // Verify that long strings are extracted to a separate var. This should be
        // wrapped in a function to trick Closure not to inline the contents for very
        // large strings. See: https://github.com/angular/angular/pull/38253.
        expect(jsContents).toContain(
          '_c0 = function () {' +
            ' return "div[_ngcontent-%COMP%] {' +
            ' background: url(/some-very-very-long-path.png);' +
            ' }";' +
            ' };',
        );

        expect(jsContents).toContain(
          'styles: [' +
            // Check styles for component A.
            '"div[_ngcontent-%COMP%] { background: url(/a.png); }", ' +
            // Large string should be called from function definition.
            '_c0()]',
        );

        expect(jsContents).toContain(
          'styles: [' +
            // Check styles for component B.
            '"div[_ngcontent-%COMP%] { background: url(/b.png); }", ' +
            // Large string should be called from function definition.
            '_c0()]',
        );
      });

      it('should process `styles` as a string', () => {
        env.write(
          'test.ts',
          `
        import {Component} from '@angular/core';

        @Component({
          template: '',
          styles: 'h2 {width: 10px}'
        })
        export class TestCmp {}
      `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain('styles: ["h2[_ngcontent-%COMP%] {width: 10px}"]');
      });

      it('should process `styleUrl`', () => {
        env.write('dir/styles.css', 'h2 {width: 10px}');
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            styleUrl: 'dir/styles.css',
            template: '',
          })
          export class TestCmp {}
        `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).not.toContain('styleUrl');
        expect(jsContents).toContain('styles: ["h2[_ngcontent-%COMP%] {width: 10px}"]');
      });

      it('should produce a diagnostic if both `styleUrls` and `styleUrl` are defined', () => {
        env.write('dir/styles.css', 'h2 {width: 10px}');
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            styleUrl: 'dir/styles.css',
            styleUrls: ['dir/styles.css'],
            template: '',
          })
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain(
          '@Component cannot define both `styleUrl` and `styleUrls`',
        );
      });
    });

    describe('empty resources', () => {
      it('should not include empty inline styles in the compiled output', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          const someStyle = ' ';

          @Component({
            selector: 'test-cmp',
            styles: ['', someStyle, '      '],
            template: '',
          })
          export class TestCmp {}
      `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).not.toContain('styles');
        expect(jsContents).not.toContain('styleUrls');
      });

      it('should not include empty external styles in the compiled output', () => {
        env.write('dir/a.css', '');
        env.write('dir/b.css', '                ');
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            styleUrls: ['./dir/a.css', './dir/b.css'],
            template: '',
          })
          export class TestCmp {}
        `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).not.toContain('styles');
        expect(jsContents).not.toContain('styleUrls');
      });

      it('should not include empty <link> tags that resolve to empty stylesheets', () => {
        env.write('dir/a.css', '');
        env.write('dir/b.css', '                ');
        env.write(
          'test.ts',
          `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test',
          template: \`
            <link rel="stylesheet" href="./dir/a.css">
            <link rel="stylesheet" href="./dir/b.css">
          \`,
        })
        export class TestCmp {}
      `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js').replace(/<link [^>]*>/g, '');
        expect(jsContents).not.toContain('styles');
        expect(jsContents).not.toContain('styleUrls');
      });
    });

    describe('non-exported classes', () => {
      beforeEach(() => env.tsconfig({compileNonExportedClasses: false}));

      it('should not emit directive definitions for non-exported classes if configured', () => {
        env.write(
          'test.ts',
          `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[test]'
          })
          class TestDirective {}
        `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).not.toContain('defineDirective(');
        expect(jsContents).toContain('Directive({');
      });

      it('should not emit component definitions for non-exported classes if configured', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test',
            template: 'hello'
          })
          class TestComponent {}
        `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).not.toContain('defineComponent(');
        expect(jsContents).toContain('Component({');
      });

      it('should not emit module definitions for non-exported classes if configured', () => {
        env.write(
          'test.ts',
          `
          import {NgModule} from '@angular/core';

          @NgModule({
            declarations: []
          })
          class TestModule {}
        `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).not.toContain('defineNgModule(');
        expect(jsContents).toContain('NgModule({');
      });

      it('should still compile a class that is indirectly exported', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: 'Test Cmp',
          })
          class TestCmp {}

          export {TestCmp};
        `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('defineComponent');
      });
    });

    describe('iframe processing', () => {
      it('should generate attribute and property bindings with a validator fn when on <iframe>', () => {
        env.write(
          'test.ts',
          `
                import {Component} from '@angular/core';

                @Component({
                  template: \`
                    <iframe src="http://angular.io"
                      [sandbox]="''" [attr.allow]="''"
                      [title]="'Hi!'"
                    ></iframe>
                  \`
                })
                export class SomeComponent {}
              `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        // Only `sandbox` has an extra validation fn (since it's security-sensitive),
        // the `title` property doesn't have an extra validation fn.
        expect(jsContents).toContain(
          'ɵɵdomProperty("sandbox", "", i0.ɵɵvalidateIframeAttribute)("title", "Hi!")',
        );

        // The `allow` property is also security-sensitive, thus an extra validation fn.
        expect(jsContents).toContain('ɵɵattribute("allow", "", i0.ɵɵvalidateIframeAttribute)');
      });

      it(
        'should generate an attribute binding instruction with a validator function ' +
          "(making sure it's case-insensitive, since this is allowed in Angular templates)",
        () => {
          env.write(
            'test.ts',
            `
              import {Component} from '@angular/core';

              @Component({
                template: \`
                  <IFRAME
                    src="http://angular.io"
                    [attr.SANDBOX]="''"
                  ></IFRAME>
                \`
              })
              export class SomeComponent {}
            `,
          );

          env.driveMain();
          const jsContents = env.getContents('test.js');

          // Make sure that the `sandbox` has an extra validation fn,
          // and the check is case-insensitive (since the `setAttribute` DOM API
          // is case-insensitive as well).
          expect(jsContents).toContain('ɵɵattribute("SANDBOX", "", i0.ɵɵvalidateIframeAttribute)');
        },
      );

      it('should *not* generate a validator fn for attribute and property bindings when *not* on <iframe>', () => {
        env.write(
          'test.ts',
          `
                import {Component, Directive} from '@angular/core';

                @Directive({
                  standalone: true,
                  selector: '[sandbox]',
                  inputs: ['sandbox']
                })
                class Dir {}

                @Component({
                  standalone: true,
                  imports: [Dir],
                  template: \`
                    <div [sandbox]="''" [title]="'Hi!'"></div>
                  \`
                })
                export class SomeComponent {}
              `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        // Note: no extra validation fn, since a security-sensitive attribute is *not* on an
        // <iframe>.
        expect(jsContents).toContain('ɵɵproperty("sandbox", "")("title", "Hi!")');
      });

      it('should generate a validator fn for attribute and property host bindings on a directive', () => {
        env.write(
          'test.ts',
          `
              import {Directive} from '@angular/core';

              @Directive({
                host: {
                  '[sandbox]': "''",
                  '[attr.allow]': "''",
                  'src': 'http://angular.io'
                }
              })
              export class SomeDir {}
            `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        // The `sandbox` is potentially a security-sensitive attribute of an <iframe>.
        // Generate an extra validation function to invoke at runtime, which would
        // check if an underlying host element is an <iframe>.
        expect(jsContents).toContain('ɵɵdomProperty("sandbox", "", i0.ɵɵvalidateIframeAttribute)');

        // Similar to the above, but for an attribute binding (host attributes are
        // represented via `ɵɵattribute`).
        expect(jsContents).toContain('ɵɵattribute("allow", "", i0.ɵɵvalidateIframeAttribute)');
      });

      it(
        'should generate a validator fn for attribute host bindings on a directive ' +
          '(making sure the check is case-insensitive)',
        () => {
          env.write(
            'test.ts',
            `
              import {Directive} from '@angular/core';

              @Directive({
                host: {
                  '[attr.SANDBOX]': "''"
                }
              })
              export class SomeDir {}
            `,
          );

          env.driveMain();
          const jsContents = env.getContents('test.js');

          // Make sure that we generate a validation fn for the `sandbox` attribute,
          // even when it was declared as `SANDBOX`.
          expect(jsContents).toContain('ɵɵattribute("SANDBOX", "", i0.ɵɵvalidateIframeAttribute)');
        },
      );
    });

    describe('undecorated providers', () => {
      it('should error when an undecorated class, with a non-trivial constructor, is provided directly in a module', () => {
        env.write(
          'test.ts',
          `
            import {NgModule, NgZone} from '@angular/core';

            class NotAService {
              constructor(ngZone: NgZone) {}
            }

            @NgModule({
              providers: [NotAService]
            })
            export class SomeModule {}
          `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain('cannot be created via dependency injection');
      });

      it('should error when an undecorated class is provided via useClass', () => {
        env.write(
          'test.ts',
          `
          import {NgModule, Injectable, NgZone} from '@angular/core';

          @Injectable({providedIn: 'root'})
          class Service {}

          class NotAService {
            constructor(ngZone: NgZone) {}
          }

          @NgModule({
            providers: [{provide: Service, useClass: NotAService}]
          })
          export class SomeModule {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain('cannot be created via dependency injection');
      });

      it('should not error when an undecorated class is provided via useClass with deps', () => {
        env.write(
          'test.ts',
          `
          import {NgModule, Injectable, NgZone} from '@angular/core';

          @Injectable({providedIn: 'root'})
          class Service {}

          class NotAService {
            constructor(ngZone: NgZone) {}
          }

          @NgModule({
            providers: [{provide: Service, useClass: NotAService, deps: [NgZone]}]
          })
          export class SomeModule {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should error when an undecorated class is provided via an array', () => {
        env.write(
          'test.ts',
          `
          import {NgModule, Injectable, NgZone} from '@angular/core';

          @Injectable({providedIn: 'root'})
          class Service {}

          class NotAService {
            constructor(ngZone: NgZone) {}
          }

          @NgModule({
            providers: [Service, [NotAService]]
          })
          export class SomeModule {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain('cannot be created via dependency injection');
      });

      it('should error when an undecorated class is provided to a directive', () => {
        env.write(
          'test.ts',
          `
          import {NgModule, Directive, NgZone} from '@angular/core';

          class NotAService {
            constructor(ngZone: NgZone) {}
          }

          @Directive({
            selector: '[some-dir]',
            providers: [NotAService],
            standalone: false,
          })
          class SomeDirective {}

          @NgModule({
            declarations: [SomeDirective]
          })
          export class SomeModule {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain('cannot be created via dependency injection');
      });

      it('should error when an undecorated class is provided to a component', () => {
        env.write(
          'test.ts',
          `
          import {NgModule, Component, NgZone} from '@angular/core';

          class NotAService {
            constructor(ngZone: NgZone) {}
          }

          @Component({
            selector: 'some-comp',
            template: '',
            providers: [NotAService],
            standalone: false,
          })
          class SomeComponent {}

          @NgModule({
            declarations: [SomeComponent]
          })
          export class SomeModule {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain('cannot be created via dependency injection');
      });

      it('should error when an undecorated class is provided to a component via viewProviders', () => {
        env.write(
          'test.ts',
          `
          import {NgModule, Component, NgZone} from '@angular/core';

          class NotAService {
            constructor(ngZone: NgZone) {}
          }

          @Component({
            selector: 'some-comp',
            template: '',
            viewProviders: [NotAService],
            standalone: false,
          })
          class SomeComponent {}

          @NgModule({
            declarations: [SomeComponent]
          })
          export class SomeModule {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain('cannot be created via dependency injection');
      });

      it('should not error when a class with a factory is provided', () => {
        env.write(
          'test.ts',
          `
          import {NgModule, Pipe} from '@angular/core';

          @Pipe({
            name: 'some-pipe',
            standalone: false,
          })
          class SomePipe {}

          @NgModule({
            declarations: [SomePipe],
            providers: [SomePipe]
          })
          export class SomeModule {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should not error when an NgModule is provided', () => {
        env.write(
          'test.ts',
          `
          import {Injectable, NgModule} from '@angular/core';

          @Injectable()
          export class Service {}

          @NgModule({
          })
          class SomeModule {
            constructor(dep: Service) {}
          }

          @NgModule({
            providers: [SomeModule],
          })
          export class Module {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should not error when an undecorated class from a declaration file is provided', () => {
        env.write(
          'node_modules/@angular/core/testing/index.d.ts',
          `
          export declare class Testability {
          }
        `,
        );
        env.write(
          'test.ts',
          `
          import {NgModule} from '@angular/core';
          import {Testability} from '@angular/core/testing';

          @NgModule({
            providers: [Testability]
          })
          export class SomeModule {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should not error when an undecorated class without a constructor from a declaration file is provided via useClass', () => {
        env.write(
          'node_modules/@angular/core/testing/index.d.ts',
          `
            export declare class Testability {
            }
          `,
        );
        env.write(
          'test.ts',
          `
            import {NgModule, Injectable} from '@angular/core';
            import {Testability} from '@angular/core/testing';

            @Injectable()
            class TestingService {}

            @NgModule({
              providers: [{provide: TestingService, useClass: Testability}]
            })
            export class SomeModule {}
          `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should not error if the undecorated class does not have a constructor or the constructor is blank', () => {
        env.write(
          'test.ts',
          `
          import {NgModule, NgZone} from '@angular/core';

          class NoConstructorService {
          }

          class BlankConstructorService {
          }

          @NgModule({
            providers: [NoConstructorService, BlankConstructorService]
          })
          export class SomeModule {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      // TODO(alxhub): this test never worked correctly, as it used to declare a constructor
      // with a body, which real declaration files don't have. Without the body, the
      // ReflectionHost used to not return any constructor data, preventing an error from
      // showing. That bug was fixed, but the error for declaration files is disabled until g3
      // can be updated.
      xit('should error when an undecorated class with a non-trivial constructor in a declaration file is provided via useClass', () => {
        env.write(
          'node_modules/@angular/core/testing/index.d.ts',
          `
            export declare class NgZone {}

            export declare class Testability {
              constructor(ngZone: NgZone);
            }
          `,
        );
        env.write(
          'test.ts',
          `
            import {NgModule, Injectable} from '@angular/core';
            import {Testability} from '@angular/core/testing';

            @Injectable()
            class TestingService {}

            @NgModule({
              providers: [{provide: TestingService, useClass: Testability}]
            })
            export class SomeModule {}
          `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain('cannot be created via dependency injection');
      });

      it('should not error when an class with a factory definition and a non-trivial constructor in a declaration file is provided via useClass', () => {
        env.write(
          'node_modules/@angular/core/testing/index.d.ts',
          `
            import * as i0 from '@angular/core';

            export declare class NgZone {}

            export declare class Testability {
              static ɵfac: i0.ɵɵFactoryDeclaration<Testability, never>;
              constructor(ngZone: NgZone);
            }
          `,
        );
        env.write(
          'test.ts',
          `
            import {NgModule, Injectable} from '@angular/core';
            import {Testability} from '@angular/core/testing';

            @Injectable()
            class TestingService {}

            @NgModule({
              providers: [{provide: TestingService, useClass: Testability}]
            })
            export class SomeModule {}
          `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      describe('template parsing diagnostics', () => {
        // These tests validate that errors which occur during template parsing are
        // expressed as diagnostics instead of a compiler crash (which used to be the
        // case). They only assert that the error is produced with an accurate span -
        // the exact semantics of the errors are tested separately, via the parser
        // tests.
        it('should emit a diagnostic for a template parsing error', () => {
          env.write(
            'test.ts',
            `
            import {Component} from '@angular/core';
            @Component({
              template: '<div></span>',
              selector: 'test-cmp',
            })
            export class TestCmp {}
          `,
          );
          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(getDiagnosticSourceCode(diags[0])).toBe('</span>');
        });

        it('should emit a diagnostic for an expression parsing error', () => {
          env.write(
            'test.ts',
            `
            import {Component} from '@angular/core';
            @Component({
              template: '<input [value]="x ? y"/>',
              selector: 'test-cmp',
            })
            export class TestCmp {
                x = null;
                y = null;
            }
          `,
          );
          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(getDiagnosticSourceCode(diags[0])).toBe('x ? y');
        });

        it('should use a single character span for an unexpected EOF parsing error', () => {
          env.write(
            'test.ts',
            `
              import {Component} from '@angular/core';
              @Component({
                template: '<input [value]="x/>',
                selector: 'test-cmp',
              })
              export class TestCmp {
                x = null;
              }
            `,
          );
          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(getDiagnosticSourceCode(diags[0])).toBe("'");
        });

        it('should emit both type-check diagnostics and parse error diagnostics', () => {
          env.write(
            'test.ts',
            `
              import {Component} from '@angular/core';
              @Component({
                template: \`<input (click)="x = 'invalid'"/> {{x = 2}}\`,
                selector: 'test-cmp',
              })
              export class TestCmp {
                x: number = 1;
              }
            `,
          );
          const diags = env.driveDiagnostics();

          expect(diags.length).toBe(2);
          expect(diags[0].messageText).toEqual(`Type 'string' is not assignable to type 'number'.`);
          expect(diags[1].messageText).toContain(
            'Parser Error: Bindings cannot contain assignments at column 5 in [ {{x = 2}}]',
          );
        });
      });

      describe('shadow DOM selector diagnostics', () => {
        it('should emit a diagnostic when a selector does not include a hyphen', () => {
          env.write(
            'test.ts',
            `
            import {Component, ViewEncapsulation} from '@angular/core';
            @Component({
              template: '',
              selector: 'cmp',
              encapsulation: ViewEncapsulation.ShadowDom
            })
            export class TestCmp {}
          `,
          );
          const diags = env.driveDiagnostics();

          expect(diags.length).toBe(1);
          expect(diags[0].messageText).toBe(
            'Selector of a component that uses ViewEncapsulation.ShadowDom must contain a hyphen.',
          );
          expect(getDiagnosticSourceCode(diags[0])).toBe(`'cmp'`);
        });

        it('should emit a diagnostic when a selector includes uppercase letters', () => {
          env.write(
            'test.ts',
            `
            import {Component, ViewEncapsulation} from '@angular/core';
            @Component({
              template: '',
              selector: 'my-Comp',
              encapsulation: ViewEncapsulation.ShadowDom
            })
            export class TestCmp {}
          `,
          );
          const diags = env.driveDiagnostics();

          expect(diags.length).toBe(1);
          expect(diags[0].messageText).toBe(
            'Selector of a ShadowDom-encapsulated component must all be in lower case.',
          );
          expect(getDiagnosticSourceCode(diags[0])).toBe(`'my-Comp'`);
        });

        it('should emit a diagnostic when a selector starts with a digit', () => {
          env.write(
            'test.ts',
            `
            import {Component, ViewEncapsulation} from '@angular/core';
            @Component({
              template: '',
              selector: '123-comp',
              encapsulation: ViewEncapsulation.ShadowDom
            })
            export class TestCmp {}
          `,
          );
          const diags = env.driveDiagnostics();

          expect(diags.length).toBe(1);
          expect(diags[0].messageText).toBe(
            'Selector of a ShadowDom-encapsulated component must start with a lower case letter.',
          );
          expect(getDiagnosticSourceCode(diags[0])).toBe(`'123-comp'`);
        });

        it('should emit a diagnostic when a selector starts with a hyphen', () => {
          env.write(
            'test.ts',
            `
            import {Component, ViewEncapsulation} from '@angular/core';
            @Component({
              template: '',
              selector: '-comp',
              encapsulation: ViewEncapsulation.ShadowDom
            })
            export class TestCmp {}
          `,
          );
          const diags = env.driveDiagnostics();

          expect(diags.length).toBe(1);
          expect(diags[0].messageText).toBe(
            'Selector of a ShadowDom-encapsulated component must start with a lower case letter.',
          );
          expect(getDiagnosticSourceCode(diags[0])).toBe(`'-comp'`);
        });

        it('should not emit a diagnostic for a component using an attribute selector', () => {
          env.write(
            'test.ts',
            `
            import {Component, ViewEncapsulation} from '@angular/core';
            @Component({
              template: '',
              selector: '[button]',
              encapsulation: ViewEncapsulation.ShadowDom
            })
            export class TestCmp {}
          `,
          );
          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(0);
        });

        it('should not emit a diagnostic for a component using a class selector', () => {
          env.write(
            'test.ts',
            `
            import {Component, ViewEncapsulation} from '@angular/core';
            @Component({
              template: '',
              selector: '.button',
              encapsulation: ViewEncapsulation.ShadowDom
            })
            export class TestCmp {}
          `,
          );
          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(0);
        });
      });

      describe('i18n errors', () => {
        it('reports a diagnostics on nested i18n sections', () => {
          env.write(
            'test.ts',
            `
            import {Component} from '@angular/core';
            @Component({
              selector: 'test-component',
              template: '<div i18n><div i18n>Content</div></div>'
            })
            class TestComponent {}
            `,
          );

          const diags = env.driveDiagnostics();

          expect(diags.length).toEqual(1);
          expect(diags[0].messageText).toEqual(
            'Cannot mark an element as translatable inside of a translatable section.' +
              ' Please remove the nested i18n marker.',
          );
          expect(diags[0].file?.fileName).toEqual(absoluteFrom('/test.ts'));
          expect(
            diags[0].file?.text.slice(diags[0].start!, diags[0].start! + diags[0].length!),
          ).toEqual('<div i18n>Content</div>');
        });

        it('reports a diagnostic on nested i18n sections with tags in between', () => {
          env.write(
            'test.ts',
            `
            import {Component} from '@angular/core';
            @Component({
              selector: 'test-component',
              template: '<div i18n><div><div i18n>Content</div></div></div>'
            })
            class TestComponent {}
          `,
          );

          const diags = env.driveDiagnostics();

          expect(diags.length).toEqual(1);
          expect(diags[0].messageText).toEqual(
            'Cannot mark an element as translatable inside of a translatable section.' +
              ' Please remove the nested i18n marker.',
          );
          expect(diags[0].file?.fileName).toEqual(absoluteFrom('/test.ts'));
          expect(
            diags[0].file?.text.slice(diags[0].start!, diags[0].start! + diags[0].length!),
          ).toEqual('<div i18n>Content</div>');
        });

        it('reports a diagnostic on nested i18n sections represented with <ng-continers>s', () => {
          env.write(
            'test.ts',
            `
            import {Component} from '@angular/core';
            @Component({
              selector: 'test-component',
              template: '<div i18n><div><ng-container i18n>Content</ng-container></div></div>'
            })
            class TestComponent {}
          `,
          );

          const diags = env.driveDiagnostics();

          expect(diags.length).toEqual(1);
          expect(diags[0].messageText).toEqual(
            'Cannot mark an element as translatable inside of a translatable section.' +
              ' Please remove the nested i18n marker.',
          );
          expect(diags[0].file?.fileName).toEqual(absoluteFrom('/test.ts'));
          expect(
            diags[0].file?.text.slice(diags[0].start!, diags[0].start! + diags[0].length!),
          ).toEqual('<ng-container i18n>Content</ng-container>');
        });
      });
    });

    it(
      'reports a COMPONENT_RESOURCE_NOT_FOUND for a component with a templateUrl' +
        ' that points to a non-existent file',
      () => {
        env.write(
          'test.ts',
          `
                  import {Component} from '@angular/core';
                  @Component({
                    selector: 'test-component',
                    templateUrl: './non-existent-file.html'
                  })
                  class TestComponent {}
                `,
        );

        const diags = env.driveDiagnostics();

        expect(diags.length).toEqual(1);
        expect(diags[0].code).toEqual(ngErrorCode(ErrorCode.COMPONENT_RESOURCE_NOT_FOUND));
        expect(diags[0].messageText).toEqual(
          `Could not find template file './non-existent-file.html'.`,
        );
      },
    );

    it(
      `reports a COMPONENT_RESOURCE_NOT_FOUND when style sheet link in a component's template` +
        ` does not exist`,
      () => {
        env.write(
          'test.ts',
          `
                  import {Component} from '@angular/core';
                  @Component({
                    selector: 'test-component',
                    templateUrl: './test.html'
                  })
                  class TestComponent {}
                `,
        );
        env.write(
          'test.html',
          `
                  <link rel="stylesheet" href="./non-existent-file.css">
                  `,
        );

        const diags = env.driveDiagnostics();

        expect(diags.length).toEqual(1);
        expect(diags[0].code).toEqual(ngErrorCode(ErrorCode.COMPONENT_RESOURCE_NOT_FOUND));
        expect(diags[0].messageText).toEqual(
          `Could not find stylesheet file './non-existent-file.css' linked from the template.`,
        );
      },
    );

    it(
      'reports a COMPONENT_RESOURCE_NOT_FOUND for a component with a style url ' +
        'defined in a spread that points to a non-existent file',
      () => {
        env.write(
          'test.ts',
          `
                  import {Component} from '@angular/core';
                  @Component({
                    selector: 'test-component',
                    template: '',
                    styleUrls: [...['./non-existent-file.css']]
                  })
                  class TestComponent {}
                `,
        );

        const diags = env.driveDiagnostics();

        expect(diags.length).toEqual(1);
        expect(diags[0].code).toEqual(ngErrorCode(ErrorCode.COMPONENT_RESOURCE_NOT_FOUND));
        expect(diags[0].messageText).toEqual(
          `Could not find stylesheet file './non-existent-file.css'.`,
        );
      },
    );

    it('passes the build when only warnings are emitted', () => {
      env.tsconfig({strictTemplates: true});

      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-component',
          // Invalid banana in box (should be \`[(foo)]="bar"\`).
          template: '<div ([foo])="bar"></div>',
        })
        class TestComponent {
          bar = 'test';
        }
      `,
      );

      const diagnostics = env.driveDiagnostics(0 /* expectedExitCode */);
      const codes = diagnostics.map((diag) => diag.code);
      expect(codes).toEqual([ngErrorCode(ErrorCode.INVALID_BANANA_IN_BOX)]);
    });

    it('should produce an error when standalone component is used in @NgModule.bootstrap', () => {
      env.tsconfig();

      env.write(
        'test.ts',
        `
        import {Component, NgModule} from '@angular/core';

        @Component({
          standalone: true,
          selector: 'standalone-component',
          template: '...',
        })
        class StandaloneComponent {}

        @NgModule({
          bootstrap: [StandaloneComponent]
        })
        class BootstrapModule {}
      `,
      );

      const diagnostics = env.driveDiagnostics();
      const codes = diagnostics.map((diag) => diag.code);
      expect(codes).toEqual([ngErrorCode(ErrorCode.NGMODULE_BOOTSTRAP_IS_STANDALONE)]);
    });

    it('should produce an error when standalone component wrapped in `forwardRef` is used in @NgModule.bootstrap', () => {
      env.tsconfig();

      env.write(
        'test.ts',
        `
        import {Component, NgModule, forwardRef} from '@angular/core';

        @Component({
          standalone: true,
          selector: 'standalone-component',
          template: '...',
        })
        class StandaloneComponent {}

        @NgModule({
          bootstrap: [forwardRef(() => StandaloneComponent)]
        })
        class BootstrapModule {}
      `,
      );

      const diagnostics = env.driveDiagnostics();
      const codes = diagnostics.map((diag) => diag.code);
      expect(codes).toEqual([ngErrorCode(ErrorCode.NGMODULE_BOOTSTRAP_IS_STANDALONE)]);
    });

    it('should be able to turn off control flow using a compiler flag', () => {
      env.tsconfig({_enableBlockSyntax: false});
      env.write(
        '/test.ts',
        `
        import { Component } from '@angular/core';

        @Component({
          standalone: true,
          template: 'My email is foo@bar.com',
        })
        export class TestCmp {}
      `,
      );

      env.driveMain();

      // If blocks are enabled, this test will fail since `@bar.com` is an incomplete block.
      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('text(0, "My email is foo@bar.com")');
    });

    describe('InjectorDef emit optimizations for standalone', () => {
      it('should not filter components out of NgModule.imports', () => {
        env.write(
          'test.ts',
          `
          import {Component, Injectable, NgModule} from '@angular/core';

          @Injectable()
          export class Service {}

          @NgModule({
            providers: [Service]
          })
          export class DepModule {}

          @Component({
            standalone: true,
            selector: 'standalone-cmp',
            imports: [DepModule],
            template: '',
          })
          export class StandaloneCmp {}

          @NgModule({
            imports: [StandaloneCmp],
            exports: [StandaloneCmp],
          })
          export class Module {}
        `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain('i0.ɵɵdefineInjector({ imports: [StandaloneCmp] })');
      });

      it('should filter directives & pipes out of NgModule.imports', () => {
        env.write(
          'test.ts',
          `
          import {Directive, ModuleWithProviders, NgModule, Pipe} from '@angular/core';
          @Directive({standalone: true})
          export class StandaloneDir {}

          @NgModule({})
          export class SubModule {};

          declare function SubModuleWithProviders(): ModuleWithProviders<SubModule>;

          @Pipe({standalone: true, name: 'st'})
          export class StandalonePipe {}

          export const LOCAL_ARRAY = [StandaloneDir, StandalonePipe, SubModule];

          export const ARRAY_WITH_MWP = [StandalonePipe, SubModuleWithProviders()];

          @NgModule({
            imports: [
              StandaloneDir,
              ...LOCAL_ARRAY,
              SubModule,
              SubModuleWithProviders(),
              ARRAY_WITH_MWP,
            ],
          })
          export class Module {}
        `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');
        const expectedImports = 'SubModule, SubModule, SubModuleWithProviders(), ARRAY_WITH_MWP';
        expect(jsContents.replace(/\s/g, '')).toContain(
          `Module.ɵinj=/*@__PURE__*/i0.ɵɵdefineInjector({imports:[${expectedImports.replace(
            /\s/g,
            '',
          )}]});`,
        );
      });
    });

    describe('input transforms', () => {
      it('should compile a directive input with a transform function', () => {
        env.write(
          '/test.ts',
          `
          import {Directive, Input} from '@angular/core';

          function toNumber(value: boolean | string) { return 1; }

          @Directive({standalone: true})
          export class Dir {
            @Input({transform: toNumber}) value!: number;
          }
        `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');
        const dtsContents = env.getContents('test.d.ts');

        expect(jsContents).toContain('inputs: { value: [2, "value", "value", toNumber] }');
        expect(dtsContents).toContain('static ngAcceptInputType_value: boolean | string;');
      });

      it('should compile a component input with a transform function', () => {
        env.write(
          '/test.ts',
          `
          import {Component, Input} from '@angular/core';

          function toNumber(value: boolean | string) { return 1; }

          @Component({standalone: true, template: 'hello'})
          export class Dir {
            @Input({transform: toNumber}) value!: number;
          }
        `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');
        const dtsContents = env.getContents('test.d.ts');

        expect(jsContents).toContain('inputs: { value: [2, "value", "value", toNumber] }');
        expect(dtsContents).toContain('static ngAcceptInputType_value: boolean | string;');
      });

      it('should compile an input with a transform function that contains a generic parameter', () => {
        env.write(
          '/types.ts',
          `
            export interface GenericWrapper<T> {
              value: T;
            }
          `,
        );
        env.write(
          '/test.ts',
          `
            import {Directive, Input} from '@angular/core';
            import {GenericWrapper} from './types';

            function toNumber(value: boolean | string | GenericWrapper<string>) { return 1; }

            @Directive({standalone: true})
            export class Dir {
              @Input({transform: toNumber}) value!: number;
            }
          `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');
        const dtsContents = env.getContents('test.d.ts');

        expect(jsContents).toContain('inputs: { value: [2, "value", "value", toNumber] }');
        expect(dtsContents).toContain('import * as i1 from "./types"');
        expect(dtsContents).toContain(
          'static ngAcceptInputType_value: boolean | string | i1.GenericWrapper<string>;',
        );
      });

      it('should compile an input with a transform function that contains nested generic parameters', () => {
        env.write(
          '/types.ts',
          `
              export interface GenericWrapper<T> {
                value: T;
              }
            `,
        );
        env.write(
          '/other-types.ts',
          `
              export class GenericClass<T> {
                foo: T;
              }
            `,
        );

        env.write(
          '/test.ts',
          `
              import {Directive, Input} from '@angular/core';
              import {GenericWrapper} from './types';
              import {GenericClass} from './other-types';

              function toNumber(value: boolean | string | GenericWrapper<GenericClass<string>>) { return 1; }

              @Directive({standalone: true})
              export class Dir {
                @Input({transform: toNumber}) value!: number;
              }
            `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');
        const dtsContents = env.getContents('test.d.ts');

        expect(jsContents).toContain('inputs: { value: [2, "value", "value", toNumber] }');
        expect(dtsContents).toContain('import * as i1 from "./types"');
        expect(dtsContents).toContain('import * as i2 from "./other-types"');
        expect(dtsContents).toContain(
          'static ngAcceptInputType_value: boolean | string | i1.GenericWrapper<i2.GenericClass<string>>;',
        );
      });

      it('should compile an input with an external transform function', () => {
        env.write(
          'node_modules/external/index.d.ts',
          `
          export interface ExternalObj {
            foo: boolean;
          }

          export type ExternalToNumberType = string | boolean | ExternalObj;

          export declare function externalToNumber(val: ExternalToNumberType): number;
        `,
        );

        env.write(
          '/test.ts',
          `
          import {Directive, Input} from '@angular/core';
          import {externalToNumber} from 'external';

          @Directive({standalone: true})
          export class Dir {
            @Input({transform: externalToNumber}) value!: number;
          }
        `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');
        const dtsContents = env.getContents('test.d.ts');

        expect(jsContents).toContain(`import { externalToNumber } from 'external';`);
        expect(jsContents).toContain('inputs: { value: [2, "value", "value", externalToNumber] }');
        expect(dtsContents).toContain('import * as i1 from "external";');
        expect(dtsContents).toContain('static ngAcceptInputType_value: i1.ExternalToNumberType;');
      });

      it('should compile an input with an inline transform function', () => {
        env.write(
          'node_modules/external/index.d.ts',
          `
          export interface ExternalObj {
            foo: boolean;
          }

          export type ExternalToNumberType = string | boolean | ExternalObj;
        `,
        );

        env.write(
          '/test.ts',
          `
          import {Directive, Input} from '@angular/core';
          import {ExternalToNumberType} from 'external';

          @Directive({standalone: true})
          export class Dir {
            @Input({transform: (value: ExternalToNumberType) => value ? 1 : 0}) value!: number;
          }
        `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');
        const dtsContents = env.getContents('test.d.ts');

        expect(jsContents).toContain(
          'inputs: { value: [2, "value", "value", (value) => value ? 1 : 0] }',
        );
        expect(dtsContents).toContain('import * as i1 from "external";');
        expect(dtsContents).toContain('static ngAcceptInputType_value: i1.ExternalToNumberType;');
      });

      it('should compile an input referencing an imported function with literal types', () => {
        env.write(
          '/transforms.ts',
          `
          export function toBoolean(value: boolean | '' | 'true' | 'false'): boolean {
            return !!value;
          }
        `,
        );
        env.write(
          '/test.ts',
          `
          import {Directive, Input} from '@angular/core';
          import {toBoolean} from './transforms';

          @Directive({standalone: true})
          export class Dir {
            @Input({transform: toBoolean}) value!: number;
          }
        `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');
        const dtsContents = env.getContents('test.d.ts');

        expect(jsContents).toContain('inputs: { value: [2, "value", "value", toBoolean] }');
        expect(dtsContents).toContain(
          `static ngAcceptInputType_value: boolean | "" | "true" | "false";`,
        );
      });

      it('should compile a directive input with a transform function with a `this` typing', () => {
        env.write(
          '/test.ts',
          `
          import {Directive, Input} from '@angular/core';

          function toNumber(this: Dir, value: boolean | string) { return 1; }

          @Directive({standalone: true})
          export class Dir {
            @Input({transform: toNumber}) value!: number;
          }
        `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');
        const dtsContents = env.getContents('test.d.ts');

        expect(jsContents).toContain('inputs: { value: [2, "value", "value", toNumber] }');
        expect(dtsContents).toContain('static ngAcceptInputType_value: boolean | string;');
      });

      it('should treat an input transform function only with a `this` parameter as unknown', () => {
        env.write(
          '/test.ts',
          `
          import {Directive, Input} from '@angular/core';

          function toNumber(this: Dir) { return 1; }

          @Directive({standalone: true})
          export class Dir {
            @Input({transform: toNumber}) value!: number;
          }
        `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');
        const dtsContents = env.getContents('test.d.ts');

        expect(jsContents).toContain('inputs: { value: [2, "value", "value", toNumber] }');
        expect(dtsContents).toContain('static ngAcceptInputType_value: unknown;');
      });

      it('should compile an input with using an ambient type in the transform function', () => {
        env.write(
          'node_modules/external/index.d.ts',
          `
          import {ElementRef} from '@angular/core';

          export declare function coerceElement(value: HTMLElement | ElementRef<HTMLElement>): HTMLElement;
        `,
        );

        env.write(
          '/test.ts',
          `
          import {Directive, Input, Component} from '@angular/core';
          import {coerceElement} from 'external';

          @Directive({standalone: true})
          export class Dir {
            @Input({transform: coerceElement}) element!: HTMLElement;
          }
        `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');
        const dtsContents = env.getContents('test.d.ts');

        expect(jsContents).toContain(
          'inputs: { element: [2, "element", "element", coerceElement] }',
        );
        expect(dtsContents).toContain(
          'static ngAcceptInputType_element: HTMLElement | i0.ElementRef<HTMLElement>;',
        );
      });
    });

    describe('debug info', () => {
      it('should set forbidOrphanRendering debug info for component when the option forbidOrphanComponents is set', () => {
        env.write(
          'tsconfig.json',
          JSON.stringify({
            extends: './tsconfig-base.json',
            angularCompilerOptions: {
              forbidOrphanComponents: true,
            },
          }),
        );
        env.write(
          `test.ts`,
          `
            import {Component} from '@angular/core';

            @Component({
              template: '...',
            })
            export class Comp {}
            `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toMatch('forbidOrphanRendering: true');
      });

      it('should set forbidOrphanRendering debug info for standalone components when the option forbidOrphanComponents is set', () => {
        env.write(
          'tsconfig.json',
          JSON.stringify({
            extends: './tsconfig-base.json',
            angularCompilerOptions: {
              forbidOrphanComponents: true,
            },
          }),
        );
        env.write(
          `test.ts`,
          `
            import {Component} from '@angular/core';

            @Component({
              standalone: true,
              template: '...',
            })
            export class Comp {}
        `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toMatch('forbidOrphanRendering: true');
      });

      it('should not set forbidOrphanRendering debug info when the option forbidOrphanComponents is not set', () => {
        env.write(
          `test.ts`,
          `
          import {Component} from '@angular/core';

          @Component({
            template: '...',
          })
          export class Comp {}
      `,
        );

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).not.toMatch('forbidOrphanRendering:');
      });
    });

    describe('tsickle compatibility', () => {
      it('should preserve fileoverview comments', () => {
        env.write(
          'test.ts',
          `
          // type-only import that will be elided.
          import {SimpleChanges} from '@angular/core';

          export class X {
            p: SimpleChanges = null!;
          }
        `,
        );

        const options: CompilerOptions = {
          strict: true,
          strictTemplates: true,
          target: ts.ScriptTarget.Latest,
          module: ts.ModuleKind.ESNext,
          annotateForClosureCompiler: true,
        };

        const program = new NgtscProgram(['/test.ts'], options, createCompilerHost({options}));
        const transformers = program.compiler.prepareEmit().transformers;

        // Add a "fake tsickle" transform before Angular's transform.
        transformers.before!.unshift((ctx) => (sf: ts.SourceFile) => {
          const tsickleFileOverview = ctx.factory.createNotEmittedStatement(sf);
          ts.setSyntheticLeadingComments(tsickleFileOverview, [
            {
              kind: ts.SyntaxKind.MultiLineCommentTrivia,
              text: `*
                  * @fileoverview Closure comment
                  * @suppress bla1
                  * @suppress bla2
                `,
              pos: -1,
              end: -1,
              hasTrailingNewLine: true,
            },
          ]);
          return ctx.factory.updateSourceFile(
            sf,
            [tsickleFileOverview, ...sf.statements],
            sf.isDeclarationFile,
            sf.referencedFiles,
            sf.typeReferenceDirectives,
            sf.hasNoDefaultLib,
            sf.libReferenceDirectives,
          );
        });

        const {diagnostics, emitSkipped} = program
          .getTsProgram()
          .emit(undefined, undefined, undefined, undefined, transformers);

        expect(diagnostics.length).toBe(0);
        expect(emitSkipped).toBe(false);

        expect(env.getContents('/test.js')).toContain(`* @fileoverview Closure comment`);
      });
    });

    describe('standalone by default opt-out', () => {
      it('should consider declarations as standalone by default', () => {
        env.write(
          '/test.ts',
          `
            import {Directive, Component, Pipe, NgModule} from '@angular/core';

            @Directive()
            export class TestDir {}

            @Component({template: ''})
            export class TestComp {}

            @Pipe({name: 'test'})
            export class TestPipe {}

            @NgModule({
              declarations: [TestDir, TestComp, TestPipe]
            })
            export class TestModule {}
          `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(3);
        expect(diags[0].messageText).toContain(
          'Directive TestDir is standalone, and cannot be declared in an NgModule.',
        );
        expect(diags[1].messageText).toContain(
          'Component TestComp is standalone, and cannot be declared in an NgModule.',
        );
        expect(diags[2].messageText).toContain(
          'Pipe TestPipe is standalone, and cannot be declared in an NgModule.',
        );
      });

      it('should consider declarations as standalone by default in v19 pre-release versions', () => {
        env.tsconfig({
          _angularCoreVersion: '19.1.0-next.0',
        });

        env.write(
          '/test.ts',
          `
            import {Directive, Component, Pipe, NgModule} from '@angular/core';

            @Directive()
            export class TestDir {}

            @Component({template: ''})
            export class TestComp {}

            @Pipe({name: 'test'})
            export class TestPipe {}

            @NgModule({
              declarations: [TestDir, TestComp, TestPipe]
            })
            export class TestModule {}
          `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(3);
        expect(diags[0].messageText).toContain(
          'Directive TestDir is standalone, and cannot be declared in an NgModule.',
        );
        expect(diags[1].messageText).toContain(
          'Component TestComp is standalone, and cannot be declared in an NgModule.',
        );
        expect(diags[2].messageText).toContain(
          'Pipe TestPipe is standalone, and cannot be declared in an NgModule.',
        );
      });

      it('should disable standalone by default on versions older than 19', () => {
        env.tsconfig({
          _angularCoreVersion: '18.2.10',
        });

        env.write(
          '/test.ts',
          `
            import {Directive, Component, Pipe, NgModule} from '@angular/core';

            @Directive()
            export class TestDir {}

            @Component({template: ''})
            export class TestComp {}

            @Pipe({name: 'test'})
            export class TestPipe {}

            @NgModule({
              imports: [TestDir, TestComp, TestPipe]
            })
            export class TestModule {}
          `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(3);
        expect(diags[0].messageText).toContain(
          `The directive 'TestDir' appears in 'imports', but is not standalone`,
        );
        expect(diags[1].messageText).toContain(
          `The component 'TestComp' appears in 'imports', but is not standalone`,
        );
        expect(diags[2].messageText).toContain(
          `The pipe 'TestPipe' appears in 'imports', but is not standalone`,
        );
      });
    });
  });

  function expectTokenAtPosition<T extends ts.Node>(
    sf: ts.SourceFile,
    pos: number,
    guard: (node: ts.Node) => node is T,
  ): T {
    // getTokenAtPosition is part of TypeScript's private API.
    const node = (ts as any).getTokenAtPosition(sf, pos) as ts.Node;
    expect(guard(node)).toBe(true);
    return node as T;
  }
});
