/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../src/ngtsc/diagnostics';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

const tsconfigBase = {
  extends: '../tsconfig-base.json',
  compilerOptions: {
    baseUrl: '.',
    rootDirs: ['/app'],
    emitDeclarationOnly: true,
    noCheck: true,
  },
};

runInEachFileSystem(() => {
  describe('declaration-only emission', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      const tsconfig: {[key: string]: any} = {
        ...tsconfigBase,
        angularCompilerOptions: {
          _experimentalAllowEmitDeclarationOnly: true,
        },
      };
      env.write('tsconfig.json', JSON.stringify(tsconfig, null, 2));
    });

    it('fails with config diagnostic if experimental flag is not provided', () => {
      env.write('tsconfig.json', JSON.stringify(tsconfigBase, null, 2));
      env.write('test.ts', '');

      const errors = env.driveDiagnostics();

      expect(errors.length).toBe(1);
      expect(errors[0].code).toBe(ngErrorCode(ErrorCode.CONFIG_EMIT_DECLARATION_ONLY_UNSUPPORTED));
      expect(errors[0].messageText).toBe(
        'TS compiler option "emitDeclarationOnly" is not supported.',
      );
    });

    it('fails with config diagnostic if experimental flag is disabled', () => {
      const tsconfig = {
        ...tsconfigBase,
        angularCompilerOptions: {
          _experimentalAllowEmitDeclarationOnly: false,
        },
      };
      env.write('tsconfig.json', JSON.stringify(tsconfig, null, 2));
      env.write('test.ts', '');

      const errors = env.driveDiagnostics();

      expect(errors.length).toBe(1);
      expect(errors[0].code).toBe(ngErrorCode(ErrorCode.CONFIG_EMIT_DECLARATION_ONLY_UNSUPPORTED));
      expect(errors[0].messageText).toBe(
        'TS compiler option "emitDeclarationOnly" is not supported.',
      );
    });

    it('should emit type declarations containing external reference in NgModule declarations', () => {
      env.write(
        'test.ts',
        `
        import {NgModule} from '@angular/core';
        import {Comp} from './comp';

        @NgModule({
          declarations: [Comp],
        })
        export class CompModule {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵmod: i0.ɵɵNgModuleDeclaration<CompModule, never, never, never>;',
      );
    });

    it('should emit type declarations containing external reference in NgModule imports', () => {
      env.write(
        'test.ts',
        `
        import {NgModule} from '@angular/core';
        import {Comp} from './comp';

        @NgModule({
          imports: [Comp],
        })
        export class CompModule {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵmod: i0.ɵɵNgModuleDeclaration<CompModule, never, [typeof i1.Comp], never>;',
      );
    });

    it('should emit `ReturnType<typeof ...>` for a `forRoot()`-style call in NgModule imports', () => {
      env.write(
        'test.ts',
        `
        import {NgModule} from '@angular/core';
        import {FooModule} from './foo';

        @NgModule({
          imports: [FooModule.forRoot()],
        })
        export class CompModule {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵmod: i0.ɵɵNgModuleDeclaration<CompModule, never, [ReturnType<typeof i1.FooModule.forRoot>], never>;',
      );
    });

    it('should emit `ReturnType<typeof ...>` for a bare function call in NgModule imports', () => {
      env.write(
        'test.ts',
        `
        import {NgModule} from '@angular/core';
        import {provideFoo} from './foo';

        @NgModule({
          imports: [provideFoo()],
        })
        export class CompModule {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵmod: i0.ɵɵNgModuleDeclaration<CompModule, never, [ReturnType<typeof i1.provideFoo>], never>;',
      );
    });

    it('should emit `ReturnType<typeof ...>` alongside plain `typeof` entries in NgModule imports', () => {
      env.write(
        'test.ts',
        `
        import {NgModule} from '@angular/core';
        import {BarModule} from './bar';
        import {FooModule} from './foo';

        @NgModule({
          imports: [BarModule, FooModule.forRoot()],
        })
        export class CompModule {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵmod: i0.ɵɵNgModuleDeclaration<CompModule, never, [typeof i1.BarModule, ReturnType<typeof i2.FooModule.forRoot>], never>;',
      );
    });

    it('should emit `ReturnType<typeof ...>` for a `forRoot()`-style call in NgModule exports', () => {
      env.write(
        'test.ts',
        `
        import {NgModule} from '@angular/core';
        import {FooModule} from './foo';

        @NgModule({
          exports: [FooModule.forRoot()],
        })
        export class CompModule {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵmod: i0.ɵɵNgModuleDeclaration<CompModule, never, never, [ReturnType<typeof i1.FooModule.forRoot>]>;',
      );
    });

    it('should resolve local function in NgModule imports and emit concrete references', () => {
      env.write(
        'test.ts',
        `
        import {NgModule} from '@angular/core';
        
        class BarModule {}
        
        function getImports() {
          return [BarModule];
        }

        @NgModule({
          imports: [getImports()],
        })
        export class CompModule {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵmod: i0.ɵɵNgModuleDeclaration<CompModule, never, [[typeof BarModule]], never>;',
      );
    });

    it('should resolve mixed array in NgModule imports', () => {
      env.write(
        'test.ts',
        `
        import {NgModule} from '@angular/core';
        import {provideFoo} from './foo';
        
        class BarModule {}
        
        function getLocalImports() {
          return [BarModule];
        }

        @NgModule({
          imports: [getLocalImports(), provideFoo()],
        })
        export class CompModule {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵmod: i0.ɵɵNgModuleDeclaration<CompModule, never, [[typeof BarModule], ReturnType<typeof i1.provideFoo>], never>;',
      );
    });

    it('should produce a diagnostic when an unsupported expression is used in NgModule imports', () => {
      env.write(
        'test.ts',
        `
        import {NgModule} from '@angular/core';
        import {isDev} from './config';
        
        class DevModule {}
        class ProdModule {}

        @NgModule({
          imports: [isDev ? DevModule : ProdModule],
        })
        export class CompModule {}
        `,
      );

      const errors = env.driveDiagnostics();
      expect(errors.length).toBe(1);
      expect(errors[0].code).toBe(ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNSUPPORTED_EXPRESSION));
      expect(ts.flattenDiagnosticMessageText(errors[0].messageText, '\n')).toContain(
        'In experimental declaration-only emission mode, this expression is not supported',
      );
    });

    it('should syntactically unwrap `forwardRef(() => X)` in NgModule imports', () => {
      env.write(
        'test.ts',
        `
        import {NgModule, forwardRef} from '@angular/core';
        import {FooModule} from './foo';

        @NgModule({
          imports: [forwardRef(() => FooModule)],
        })
        export class CompModule {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵmod: i0.ɵɵNgModuleDeclaration<CompModule, never, [typeof i1.FooModule], never>;',
      );
    });

    it('should emit type declarations containing external reference in NgModule exports', () => {
      env.write(
        'test.ts',
        `
        import {NgModule} from '@angular/core';
        import {Comp} from './comp';

        @NgModule({
          exports: [Comp],
        })
        export class CompModule {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵmod: i0.ɵɵNgModuleDeclaration<CompModule, never, never, [typeof i1.Comp]>;',
      );
    });

    it('should not error when using an @NgModule with an external reference in bootstrap', () => {
      env.write(
        'test.ts',
        `
        import {NgModule} from '@angular/core';
        import {Comp} from './comp';

        @NgModule({
          bootstrap: [Comp],
        })
        export class CompModule {}
        `,
      );

      env.driveMain();
      // No errors expected
    });

    it('should emit type declarations containing external reference in simple host directive on a component', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';
        import {Dir} from './dir';

        @Component({
          template: '',
          selector: 'host-comp',
          hostDirectives: [Dir],
        })
        export class HostComp {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵcmp: i0.ɵɵComponentDeclaration<HostComp, "host-comp", never, {}, {}, never, never, true, [{ directive: typeof i1.Dir; inputs: {}; outputs: {}; }]>;',
      );
    });

    it('should emit type declarations containing external reference in host directive object on a component', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';
        import {Dir} from './dir';

        @Component({
          template: '',
          selector: 'host-comp',
          hostDirectives: [{
            directive: Dir,
          }],
        })
        export class HostComp {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵcmp: i0.ɵɵComponentDeclaration<HostComp, "host-comp", never, {}, {}, never, never, true, [{ directive: typeof i1.Dir; inputs: {}; outputs: {}; }]>;',
      );
    });

    it('should emit type declarations containing external reference in simple host directive on a directive', () => {
      env.write(
        'test.ts',
        `
        import {Directive} from '@angular/core';
        import {Dir} from './dir';

        @Directive({
          selector: '[host-dir]',
          hostDirectives: [Dir],
        })
        export class HostDir {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵdir: i0.ɵɵDirectiveDeclaration<HostDir, "[host-dir]", never, {}, {}, never, never, true, [{ directive: typeof i1.Dir; inputs: {}; outputs: {}; }]>;',
      );
    });

    it('should emit type declarations containing external reference in host directive object on a directive', () => {
      env.write(
        'test.ts',
        `
        import {Directive} from '@angular/core';
        import {Dir} from './dir';

        @Directive({
          selector: '[host-dir]',
          hostDirectives: [{
            directive: Dir,
          }],
        })
        export class HostDir {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵdir: i0.ɵɵDirectiveDeclaration<HostDir, "[host-dir]", never, {}, {}, never, never, true, [{ directive: typeof i1.Dir; inputs: {}; outputs: {}; }]>;',
      );
    });

    it('should emit type declarations containing external reference via namespace import in host directive on a component', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';
        import * as n from './dir';

        @Component({
          template: '',
          selector: 'host-comp',
          hostDirectives: [n.Dir],
        })
        export class HostComp {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵcmp: i0.ɵɵComponentDeclaration<HostComp, "host-comp", never, {}, {}, never, never, true, [{ directive: typeof n.Dir; inputs: {}; outputs: {}; }]>;',
      );
    });

    it('should emit type declarations containing external reference with inputs and outputs in host directive on a component', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';
        import {Dir} from './dir';

        @Component({
          template: '',
          selector: 'host-comp',
          hostDirectives: [{
            directive: Dir,
            inputs: ['a: b'],
            outputs: ['c: d'],
          }],
        })
        export class HostComp {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵcmp: i0.ɵɵComponentDeclaration<HostComp, "host-comp", never, {}, {}, never, never, true, [{ directive: typeof i1.Dir; inputs: { "a": "b"; }; outputs: { "c": "d"; }; }]>;',
      );
    });

    it('should emit type declarations when using an indirect external reference in a simple host directive on a component', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';
        import {Dir} from './dir';

        const DirIndirect = Dir;

        @Component({
          template: '',
          selector: 'host-comp',
          hostDirectives: [DirIndirect],
        })
        export class HostComp {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵcmp: i0.ɵɵComponentDeclaration<HostComp, "host-comp", never, {}, {}, never, never, true, [{ directive: typeof DirIndirect; inputs: {}; outputs: {}; }]>;',
      );
    });

    it('should emit type declarations when using an indirect external reference in host directive object on a component', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';
        import {Dir} from './dir';

        const DirIndirect = Dir;

        @Component({
          template: '',
          selector: 'host-comp',
          hostDirectives: [{
            directive: DirIndirect,
          }],
        })
        export class HostComp {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵcmp: i0.ɵɵComponentDeclaration<HostComp, "host-comp", never, {}, {}, never, never, true, [{ directive: typeof DirIndirect; inputs: {}; outputs: {}; }]>;',
      );
    });

    it('should emit type declarations when using an indirect external reference in a simple host directive on a directive', () => {
      env.write(
        'test.ts',
        `
        import {Directive} from '@angular/core';
        import {Dir} from './dir';

        const DirIndirect = Dir;

        @Directive({
          selector: '[host-dir]',
          hostDirectives: [DirIndirect],
        })
        export class HostDir {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵdir: i0.ɵɵDirectiveDeclaration<HostDir, "[host-dir]", never, {}, {}, never, never, true, [{ directive: typeof DirIndirect; inputs: {}; outputs: {}; }]>;',
      );
    });

    it('should emit type declarations when using an indirect external reference in host directive object on a directive', () => {
      env.write(
        'test.ts',
        `
        import {Directive} from '@angular/core';
        import {Dir} from './dir';

        const DirIndirect = Dir;

        @Directive({
          selector: '[host-dir]',
          hostDirectives: [{
            directive: DirIndirect,
          }],
        })
        export class HostDir {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵdir: i0.ɵɵDirectiveDeclaration<HostDir, "[host-dir]", never, {}, {}, never, never, true, [{ directive: typeof DirIndirect; inputs: {}; outputs: {}; }]>;',
      );
    });

    it('should emit type declarations when using a property access expression resolving to an indirect external reference in a simple host directive on a component', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';
        import {Dir} from './dir';

        const DIR = {
          Dir
        };

        @Component({
          template: '',
          selector: 'host-comp',
          hostDirectives: [DIR.Dir],
        })
        export class HostComp {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵcmp: i0.ɵɵComponentDeclaration<HostComp, "host-comp", never, {}, {}, never, never, true, [{ directive: typeof DIR.Dir; inputs: {}; outputs: {}; }]>;',
      );
    });

    it('should emit type declarations when using a property access expression resolving to an indirect external reference in host directive object on a component', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';
        import {Dir} from './dir';

        const DIR = {
          Dir
        };

        @Component({
          template: '',
          selector: 'host-comp',
          hostDirectives: [{
            directive: DIR.Dir,
          }],
        })
        export class HostComp {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵcmp: i0.ɵɵComponentDeclaration<HostComp, "host-comp", never, {}, {}, never, never, true, [{ directive: typeof DIR.Dir; inputs: {}; outputs: {}; }]>;',
      );
    });

    it('should emit type declarations when using a property access expression resolving to an indirect external reference in a simple host directive on a directive', () => {
      env.write(
        'test.ts',
        `
        import {Directive} from '@angular/core';
        import {Dir} from './dir';

        const DIR = {
          Dir
        };

        @Directive({
          selector: '[host-dir]',
          hostDirectives: [DIR.Dir],
        })
        export class HostDir {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵdir: i0.ɵɵDirectiveDeclaration<HostDir, "[host-dir]", never, {}, {}, never, never, true, [{ directive: typeof DIR.Dir; inputs: {}; outputs: {}; }]>;',
      );
    });

    it('should emit type declarations when using a property access expression resolving to an indirect external reference in host directive object on a directive', () => {
      env.write(
        'test.ts',
        `
        import {Directive} from '@angular/core';
        import {Dir} from './dir';

        const DIR = {
          Dir
        };

        @Directive({
          selector: '[host-dir]',
          hostDirectives: [{
            directive: DIR.Dir,
          }],
        })
        export class HostDir {}
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ɵdir: i0.ɵɵDirectiveDeclaration<HostDir, "[host-dir]", never, {}, {}, never, never, true, [{ directive: typeof DIR.Dir; inputs: {}; outputs: {}; }]>;',
      );
    });

    it('should show correct error message when using an expression resovling to an external reference in a simple host directive on a component', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';
        import {Dir} from './dir';

        const DirArray = [Dir];

        @Component({
          template: '',
          selector: 'host-comp',
          hostDirectives: [DirArray[0]],
        })
        export class HostComp {}
        `,
      );

      const errors = env.driveDiagnostics();

      expect(errors.length).toBe(1);
      expect(errors[0].code).toBe(ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNSUPPORTED_EXPRESSION));
      expect(ts.flattenDiagnosticMessageText(errors[0].messageText, '\n')).toBe(
        'In experimental declaration-only emission mode, host directive cannot be an expression. Use an identifier instead',
      );
    });

    it('should show correct error message when using an expression resovling to an external reference in host directive object on a component', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';
        import {Dir} from './dir';

        const DirArray = [Dir];

        @Component({
          template: '',
          selector: 'host-comp',
          hostDirectives: [{
            directive: DirArray[0],
          }],
        })
        export class HostComp {}
        `,
      );

      const errors = env.driveDiagnostics();

      expect(errors.length).toBe(1);
      expect(errors[0].code).toBe(ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNSUPPORTED_EXPRESSION));
      expect(ts.flattenDiagnosticMessageText(errors[0].messageText, '\n')).toBe(
        'In experimental declaration-only emission mode, host directive cannot be an expression. Use an identifier instead',
      );
    });

    it('should show correct error message when using an expression resovling to an external reference in a simple host directive on a directive', () => {
      env.write(
        'test.ts',
        `
        import {Directive} from '@angular/core';
        import {Dir} from './dir';

        const DirArray = [Dir];

        @Directive({
          selector: '[host-dir]',
          hostDirectives: [DirArray[0]],
        })
        export class HostDir {}
        `,
      );

      const errors = env.driveDiagnostics();

      expect(errors.length).toBe(1);
      expect(errors[0].code).toBe(ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNSUPPORTED_EXPRESSION));
      expect(ts.flattenDiagnosticMessageText(errors[0].messageText, '\n')).toBe(
        'In experimental declaration-only emission mode, host directive cannot be an expression. Use an identifier instead',
      );
    });

    it('should show correct error message when using an expression resovling to an external reference in host directive object on a directive', () => {
      env.write(
        'test.ts',
        `
        import {Directive} from '@angular/core';
        import {Dir} from './dir';

        const DirArray = [Dir];

        @Directive({
          selector: '[host-dir]',
          hostDirectives: [{
            directive: DirArray[0],
          }],
        })
        export class HostDir {}
        `,
      );

      const errors = env.driveDiagnostics();

      expect(errors.length).toBe(1);
      expect(errors[0].code).toBe(ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNSUPPORTED_EXPRESSION));
      expect(ts.flattenDiagnosticMessageText(errors[0].messageText, '\n')).toBe(
        'In experimental declaration-only emission mode, host directive cannot be an expression. Use an identifier instead',
      );
    });

    it('should emit type declarations when using an @Input decorator with a transform function', () => {
      env.write(
        'test.ts',
        `
        import {booleanAttribute, Component, Input} from '@angular/core';

        @Component({template: '', selector: 'comp'})
        export class Comp {
          @Input({ transform: booleanAttribute }) decoratedInput!: boolean;
        }
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain(
        'static ngAcceptInputType_decoratedInput: Parameters<typeof i0.booleanAttribute>[0];',
      );
    });

    it('should emit type declarations when using an @Input decorator with an inline transform function', () => {
      env.write(
        'test.ts',
        `
        import {Component, Input} from '@angular/core';

        @Component({template: '', selector: 'comp'})
        export class Comp {
          @Input({ transform: (v: string) => !!v }) decoratedInput!: boolean;
        }
        `,
      );

      env.driveMain();
      const dtsContent = env.getContents('test.d.ts');

      expect(dtsContent).toContain('static ngAcceptInputType_decoratedInput: string;');
    });

    it('should produce a diagnostic when using an @Input decorator with an inline transform function missing a parameter type', () => {
      env.write(
        'test.ts',
        `
        import {Component, Input} from '@angular/core';

        @Component({template: '', selector: 'comp'})
        export class Comp {
          @Input({ transform: (v) => !!v }) decoratedInput!: boolean;
        }
        `,
      );

      const errors = env.driveDiagnostics();

      expect(errors.length).toBe(1);
      expect(errors[0].code).toBe(ngErrorCode(ErrorCode.VALUE_HAS_WRONG_TYPE));
      expect(ts.flattenDiagnosticMessageText(errors[0].messageText, '\n')).toContain(
        'Input transform function first parameter must have a type',
      );
    });

    it('should show correct error message when using custom decorators', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';
        
        export function Custom() {
          return function(target: any) {};
        }
        
        @Custom()
        @Component({template: '', selector: 'comp'})
        export class Comp {}
        `,
      );

      const errors = env.driveDiagnostics();

      expect(errors.length).toBe(1);
      expect(errors[0].code).toBe(ngErrorCode(ErrorCode.DECORATOR_UNEXPECTED));
      expect(ts.flattenDiagnosticMessageText(errors[0].messageText, '\n')).toBe(
        'In experimental declaration-only emission mode, Angular does not support custom decorators. Ensure all class decorators are from Angular.',
      );
    });
  });
});
