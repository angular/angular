/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {DeclareVarStmt, LiteralExpr, StmtModifier} from '@angular/compiler';
import MagicString from 'magic-string';
import * as ts from 'typescript';

import {absoluteFrom, getFileSystem, getSourceFileOrError} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem, TestFile} from '../../../src/ngtsc/file_system/testing';
import {NoopImportRewriter} from '../../../src/ngtsc/imports';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {loadFakeCore, loadTestFiles} from '../../../src/ngtsc/testing';
import {ImportManager} from '../../../src/ngtsc/translator';
import {DecorationAnalyzer} from '../../src/analysis/decoration_analyzer';
import {ModuleWithProvidersAnalyzer} from '../../src/analysis/module_with_providers_analyzer';
import {NgccReferencesRegistry} from '../../src/analysis/ngcc_references_registry';
import {SwitchMarkerAnalyzer} from '../../src/analysis/switch_marker_analyzer';
import {IMPORT_PREFIX} from '../../src/constants';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {EsmRenderingFormatter} from '../../src/rendering/esm_rendering_formatter';
import {getRootFiles, makeTestEntryPointBundle} from '../helpers/utils';

function setup(files: TestFile[], dtsFiles?: TestFile[]) {
  const fs = getFileSystem();
  loadFakeCore(fs);
  loadTestFiles(files);
  if (dtsFiles) {
    loadTestFiles(dtsFiles);
  }
  const logger = new MockLogger();
  const bundle = makeTestEntryPointBundle(
      'test-package', 'esm2015', false, getRootFiles(files), dtsFiles && getRootFiles(dtsFiles))!;
  const host = new Esm2015ReflectionHost(logger, false, bundle.src, bundle.dts);
  const referencesRegistry = new NgccReferencesRegistry(host);
  const decorationAnalyses =
      new DecorationAnalyzer(fs, bundle, host, referencesRegistry).analyzeProgram();
  const switchMarkerAnalyses = new SwitchMarkerAnalyzer(host, bundle.entryPoint.packagePath)
                                   .analyzeProgram(bundle.src.program);
  const renderer = new EsmRenderingFormatter(fs, host, false);
  const importManager = new ImportManager(new NoopImportRewriter(), IMPORT_PREFIX);
  return {
    host,
    bundle,
    program: bundle.src.program,
    sourceFile: bundle.src.file,
    renderer,
    decorationAnalyses,
    switchMarkerAnalyses,
    importManager,
  };
}

const PROGRAM_CONTENT: Record<string, string> = {
  'top-level': `
/* A copyright notice */
import 'some-side-effect';
import {Directive} from '@angular/core';
export class A {}
A.decorators = [
  { type: Directive, args: [{ selector: '[a]' }] },
  { type: OtherA }
];
export class B {}
B.decorators = [
  { type: OtherB },
  { type: Directive, args: [{ selector: '[b]' }] }
];
let C_1;
let C = C_1 = class C {};
C.decorators = [
  { type: Directive, args: [{ selector: '[c]' }] },
];
export C;
let compileNgModuleFactory = compileNgModuleFactory__PRE_R3__;
let badlyFormattedVariable = __PRE_R3__badlyFormattedVariable;

function compileNgModuleFactory__PRE_R3__(injector, options, moduleType) {
  const compilerFactory = injector.get(CompilerFactory);
  const compiler = compilerFactory.createCompiler([options]);
  return compiler.compileModuleAsync(moduleType);
}

function compileNgModuleFactory__POST_R3__(injector, options, moduleType) {
  ngDevMode && assertNgModuleType(moduleType);
  return Promise.resolve(new R3NgModuleFactory(moduleType));
}
// Some other content`,


  'iife-wrapped': `
/* A copyright notice */
import 'some-side-effect';
import {Directive} from '@angular/core';
let A = /** @class */ (() => {
class A {}
A.decorators = [
  { type: Directive, args: [{ selector: '[a]' }] },
  { type: OtherA }
];
return A;
})();
let B = /** @class */ (() => {
class B {}
B.decorators = [
  { type: OtherB },
  { type: Directive, args: [{ selector: '[b]' }] }
];
return B;
})();
let C_1;
let C = C_1 = /** @class */ (() => {
class C {}
C.decorators = [
  { type: Directive, args: [{ selector: '[c]' }] },
];
return C;
})();
export A, B, C;
let compileNgModuleFactory = compileNgModuleFactory__PRE_R3__;
let badlyFormattedVariable = __PRE_R3__badlyFormattedVariable;
function compileNgModuleFactory__PRE_R3__(injector, options, moduleType) {
  const compilerFactory = injector.get(CompilerFactory);
  const compiler = compilerFactory.createCompiler([options]);
  return compiler.compileModuleAsync(moduleType);
}
function compileNgModuleFactory__POST_R3__(injector, options, moduleType) {
  ngDevMode && assertNgModuleType(moduleType);
  return Promise.resolve(new R3NgModuleFactory(moduleType));
}
// Some other content`
};

runInEachFileSystem(() => {
  ['top-level', 'iife-wrapped'].forEach(classLayout => {
    describe(`EsmRenderingFormatter {${classLayout} classes}`, () => {
      let _: typeof absoluteFrom;
      let PROGRAM: TestFile;

      beforeEach(() => {
        _ = absoluteFrom;

        PROGRAM = {
          name: _('/node_modules/test-package/some/file.js'),
          contents: PROGRAM_CONTENT[classLayout],
        };
      });

      describe('addImports', () => {
        it('should insert the given imports after existing imports of the source file', () => {
          const {renderer, sourceFile} = setup([PROGRAM]);
          const output = new MagicString(PROGRAM.contents);
          renderer.addImports(
              output,
              [
                {specifier: '@angular/core', qualifier: ts.createIdentifier('i0')},
                {specifier: '@angular/common', qualifier: ts.createIdentifier('i1')}
              ],
              sourceFile);
          expect(output.toString()).toContain(`/* A copyright notice */
import 'some-side-effect';
import {Directive} from '@angular/core';
import * as i0 from '@angular/core';
import * as i1 from '@angular/common';`);
        });

        it('should leave the file unchanged if there are no imports to add', () => {
          const {renderer, sourceFile} = setup([PROGRAM]);
          const output = new MagicString(PROGRAM.contents);
          const contentsBefore = output.toString();

          renderer.addImports(output, [], sourceFile);
          const contentsAfter = output.toString();

          expect(contentsAfter).toBe(contentsBefore);
        });
      });

      describe('addExports', () => {
        it('should insert the given exports at the end of the source file', () => {
          const {importManager, renderer, sourceFile} = setup([PROGRAM]);
          const output = new MagicString(PROGRAM.contents);
          renderer.addExports(
              output, _(PROGRAM.name.replace(/\.js$/, '')),
              [
                {
                  from: _('/node_modules/test-package/some/a.js'),
                  dtsFrom: _('/node_modules/test-package/some/a.d.ts'),
                  identifier: 'ComponentA1'
                },
                {
                  from: _('/node_modules/test-package/some/a.js'),
                  dtsFrom: _('/node_modules/test-package/some/a.d.ts'),
                  identifier: 'ComponentA2'
                },
                {
                  from: _('/node_modules/test-package/some/foo/b.js'),
                  dtsFrom: _('/node_modules/test-package/some/foo/b.d.ts'),
                  identifier: 'ComponentB'
                },
                {from: PROGRAM.name, dtsFrom: PROGRAM.name, identifier: 'TopLevelComponent'},
              ],
              importManager, sourceFile);
          expect(output.toString()).toContain(`
// Some other content
export {ComponentA1} from './a';
export {ComponentA2} from './a';
export {ComponentB} from './foo/b';
export {TopLevelComponent};`);
        });
      });

      describe('addConstants', () => {
        it('should insert the given constants after imports in the source file', () => {
          const {renderer, program} = setup([PROGRAM]);
          const file = getSourceFileOrError(program, _('/node_modules/test-package/some/file.js'));
          const output = new MagicString(PROGRAM.contents);
          renderer.addConstants(output, 'const x = 3;', file);
          expect(output.toString()).toContain(`
import {Directive} from '@angular/core';

const x = 3;
`);
        });

        it('should insert constants after inserted imports', () => {
          const {renderer, program} = setup([PROGRAM]);
          const file = getSourceFileOrError(program, _('/node_modules/test-package/some/file.js'));
          const output = new MagicString(PROGRAM.contents);
          renderer.addConstants(output, 'const x = 3;', file);
          renderer.addImports(
              output, [{specifier: '@angular/core', qualifier: ts.createIdentifier('i0')}], file);
          expect(output.toString()).toContain(`
import {Directive} from '@angular/core';
import * as i0 from '@angular/core';

const x = 3;
`);
        });
      });

      describe('rewriteSwitchableDeclarations', () => {
        it('should switch marked declaration initializers', () => {
          const {renderer, program, switchMarkerAnalyses, sourceFile} = setup([PROGRAM]);
          const file = getSourceFileOrError(program, _('/node_modules/test-package/some/file.js'));
          const output = new MagicString(PROGRAM.contents);
          renderer.rewriteSwitchableDeclarations(
              output, file, switchMarkerAnalyses.get(sourceFile)!.declarations);
          expect(output.toString())
              .not.toContain(`let compileNgModuleFactory = compileNgModuleFactory__PRE_R3__;`);
          expect(output.toString())
              .toContain(`let badlyFormattedVariable = __PRE_R3__badlyFormattedVariable;`);
          expect(output.toString())
              .toContain(`let compileNgModuleFactory = compileNgModuleFactory__POST_R3__;`);
          expect(output.toString())
              .toContain(
                  `function compileNgModuleFactory__PRE_R3__(injector, options, moduleType) {`);
          expect(output.toString())
              .toContain(
                  `function compileNgModuleFactory__POST_R3__(injector, options, moduleType) {`);
        });
      });

      describe('addDefinitions', () => {
        it('should insert the definitions directly after the class declaration', () => {
          const {renderer, decorationAnalyses, sourceFile} = setup([PROGRAM]);
          const output = new MagicString(PROGRAM.contents);
          const compiledClass =
              decorationAnalyses.get(sourceFile)!.compiledClasses.find(c => c.name === 'A')!;
          renderer.addDefinitions(output, compiledClass, 'SOME DEFINITION TEXT');
          expect(output.toString()).toContain(`class A {}
SOME DEFINITION TEXT
A.decorators = [
`);
        });

        it('should insert the definitions after the variable declaration of class expressions',
           () => {
             const {renderer, decorationAnalyses, sourceFile} = setup([PROGRAM]);
             const output = new MagicString(PROGRAM.contents);
             const compiledClass =
                 decorationAnalyses.get(sourceFile)!.compiledClasses.find(c => c.name === 'C')!;
             renderer.addDefinitions(output, compiledClass, 'SOME DEFINITION TEXT');
             expect(output.toString())
                 .toMatch(/class C \{\};?\nSOME DEFINITION TEXT\nC.decorators = \[/);
           });
      });

      describe('addAdjacentStatements', () => {
        const contents = `import {Directive, NgZone, Console} from '@angular/core';\n` +
            `export class SomeDirective {\n` +
            `  constructor(zone, cons) {}\n` +
            `  method() {}\n` +
            `}\n` +
            `SomeDirective.decorators = [\n` +
            `  { type: Directive, args: [{ selector: '[a]' }] },\n` +
            `  { type: OtherA }\n` +
            `];\n` +
            `SomeDirective.ctorParameters = () => [\n` +
            `  { type: NgZone },\n` +
            `  { type: Console }\n` +
            `];`;

        it('should insert the statements after all the static methods of the class', () => {
          const program = {name: _('/node_modules/test-package/some/file.js'), contents};
          const {renderer, decorationAnalyses, sourceFile} = setup([program]);
          const output = new MagicString(contents);
          const compiledClass = decorationAnalyses.get(sourceFile)!.compiledClasses.find(
              c => c.name === 'SomeDirective')!;
          renderer.addAdjacentStatements(output, compiledClass, 'SOME STATEMENTS');
          expect(output.toString())
              .toContain(
                  `SomeDirective.ctorParameters = () => [\n` +
                  `  { type: NgZone },\n` +
                  `  { type: Console }\n` +
                  `];\n` +
                  `SOME STATEMENTS`);
        });

        it('should insert the statements after any definitions', () => {
          const program = {name: _('/node_modules/test-package/some/file.js'), contents};
          const {renderer, decorationAnalyses, sourceFile} = setup([program]);
          const output = new MagicString(contents);
          const compiledClass = decorationAnalyses.get(sourceFile)!.compiledClasses.find(
              c => c.name === 'SomeDirective')!;
          renderer.addDefinitions(output, compiledClass, 'SOME DEFINITIONS');
          renderer.addAdjacentStatements(output, compiledClass, 'SOME STATEMENTS');
          const definitionsPosition = output.toString().indexOf('SOME DEFINITIONS');
          const statementsPosition = output.toString().indexOf('SOME STATEMENTS');
          expect(definitionsPosition).not.toEqual(-1, 'definitions should exist');
          expect(statementsPosition).not.toEqual(-1, 'statements should exist');
          expect(statementsPosition).toBeGreaterThan(definitionsPosition);
        });
      });

      describe('removeDecorators', () => {
        describe('[static property declaration]', () => {
          it('should delete the decorator (and following comma) that was matched in the analysis',
             () => {
               const {decorationAnalyses, sourceFile, renderer} = setup([PROGRAM]);
               const output = new MagicString(PROGRAM.contents);
               const compiledClass =
                   decorationAnalyses.get(sourceFile)!.compiledClasses.find(c => c.name === 'A')!;
               const decorator = compiledClass.decorators![0];
               const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
               decoratorsToRemove.set(decorator.node!.parent!, [decorator.node!]);
               renderer.removeDecorators(output, decoratorsToRemove);
               expect(output.toString())
                   .not.toContain(`{ type: Directive, args: [{ selector: '[a]' }] },`);
               expect(output.toString()).toContain(`{ type: OtherA }`);
               expect(output.toString())
                   .toContain(`{ type: Directive, args: [{ selector: '[b]' }] }`);
               expect(output.toString()).toContain(`{ type: OtherB }`);
               expect(output.toString())
                   .toContain(`{ type: Directive, args: [{ selector: '[c]' }] }`);
             });


          it('should delete the decorator (but cope with no trailing comma) that was matched in the analysis',
             () => {
               const {decorationAnalyses, sourceFile, renderer} = setup([PROGRAM]);
               const output = new MagicString(PROGRAM.contents);
               const compiledClass =
                   decorationAnalyses.get(sourceFile)!.compiledClasses.find(c => c.name === 'B')!;
               const decorator = compiledClass.decorators![0];
               const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
               decoratorsToRemove.set(decorator.node!.parent!, [decorator.node!]);
               renderer.removeDecorators(output, decoratorsToRemove);
               expect(output.toString())
                   .toContain(`{ type: Directive, args: [{ selector: '[a]' }] },`);
               expect(output.toString()).toContain(`{ type: OtherA }`);
               expect(output.toString())
                   .not.toContain(`{ type: Directive, args: [{ selector: '[b]' }] }`);
               expect(output.toString()).toContain(`{ type: OtherB }`);
               expect(output.toString())
                   .toContain(`{ type: Directive, args: [{ selector: '[c]' }] }`);
             });

          it('should handle a decorator with a trailing comment', () => {
            const text = `
import {Directive} from '@angular/core';
export class A {}
A.decorators = [
  { type: Directive, args: [{ selector: '[a]' }] },
  { type: OtherA }
];
          `;
            const file = {name: _('/node_modules/test-package/index.js'), contents: text};
            const {decorationAnalyses, sourceFile, renderer} = setup([file]);
            const output = new MagicString(text);
            const compiledClass =
                decorationAnalyses.get(sourceFile)!.compiledClasses.find(c => c.name === 'A')!;
            const decorator = compiledClass.decorators![0];
            const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
            decoratorsToRemove.set(decorator.node!.parent!, [decorator.node!]);
            renderer.removeDecorators(output, decoratorsToRemove);
            // The decorator should have been removed correctly.
            expect(output.toString()).toContain('A.decorators = [ { type: OtherA }');
          });


          it('should delete the decorator (and its container if there are no other decorators left) that was matched in the analysis',
             () => {
               const {decorationAnalyses, sourceFile, renderer} = setup([PROGRAM]);
               const output = new MagicString(PROGRAM.contents);
               const compiledClass =
                   decorationAnalyses.get(sourceFile)!.compiledClasses.find(c => c.name === 'C')!;
               const decorator = compiledClass.decorators![0];
               const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
               decoratorsToRemove.set(decorator.node!.parent!, [decorator.node!]);
               renderer.removeDecorators(output, decoratorsToRemove);
               expect(output.toString())
                   .toContain(`{ type: Directive, args: [{ selector: '[a]' }] },`);
               expect(output.toString()).toContain(`{ type: OtherA }`);
               expect(output.toString())
                   .toContain(`{ type: Directive, args: [{ selector: '[b]' }] }`);
               expect(output.toString()).toContain(`{ type: OtherB }`);
               expect(output.toString())
                   .not.toContain(`{ type: Directive, args: [{ selector: '[c]' }] }`);
               expect(output.toString()).not.toContain(`C.decorators = [`);
             });
        });
      });

      describe('[__decorate declarations]', () => {
        let PROGRAM_DECORATE_HELPER: TestFile;

        beforeEach(() => {
          PROGRAM_DECORATE_HELPER = {
            name: _('/node_modules/test-package/some/file.js'),
            contents: `
import * as tslib_1 from "tslib";
let D_1;
/* A copyright notice */
import { Directive } from '@angular/core';
const OtherA = () => (node) => { };
const OtherB = () => (node) => { };
let A = class A {
};
A = tslib_1.__decorate([
    Directive({ selector: '[a]' }),
    OtherA()
], A);
export { A };
let B = class B {
};
B = tslib_1.__decorate([
    OtherB(),
    Directive({ selector: '[b]' })
], B);
export { B };
let C = class C {
};
C = tslib_1.__decorate([
    Directive({ selector: '[c]' })
], C);
export { C };
let D = D_1 = class D {
};
D = D_1 = tslib_1.__decorate([
    Directive({ selector: '[d]', providers: [D_1] })
], D);
export { D };
// Some other content`
          };
        });

        it('should delete the decorator (and following comma) that was matched in the analysis',
           () => {
             const {renderer, decorationAnalyses, sourceFile} = setup([PROGRAM_DECORATE_HELPER]);
             const output = new MagicString(PROGRAM_DECORATE_HELPER.contents);
             const compiledClass =
                 decorationAnalyses.get(sourceFile)!.compiledClasses.find(c => c.name === 'A')!;
             const decorator = compiledClass.decorators!.find(d => d.name === 'Directive')!;
             const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
             decoratorsToRemove.set(decorator.node!.parent!, [decorator.node!]);
             renderer.removeDecorators(output, decoratorsToRemove);
             expect(output.toString()).not.toContain(`Directive({ selector: '[a]' }),`);
             expect(output.toString()).toContain(`OtherA()`);
             expect(output.toString()).toContain(`Directive({ selector: '[b]' })`);
             expect(output.toString()).toContain(`OtherB()`);
             expect(output.toString()).toContain(`Directive({ selector: '[c]' })`);
           });

        it('should delete the decorator (but cope with no trailing comma) that was matched in the analysis',
           () => {
             const {renderer, decorationAnalyses, sourceFile} = setup([PROGRAM_DECORATE_HELPER]);
             const output = new MagicString(PROGRAM_DECORATE_HELPER.contents);
             const compiledClass =
                 decorationAnalyses.get(sourceFile)!.compiledClasses.find(c => c.name === 'B')!;
             const decorator = compiledClass.decorators!.find(d => d.name === 'Directive')!;
             const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
             decoratorsToRemove.set(decorator.node!.parent!, [decorator.node!]);
             renderer.removeDecorators(output, decoratorsToRemove);
             expect(output.toString()).toContain(`Directive({ selector: '[a]' }),`);
             expect(output.toString()).toContain(`OtherA()`);
             expect(output.toString()).not.toContain(`Directive({ selector: '[b]' })`);
             expect(output.toString()).toContain(`OtherB()`);
             expect(output.toString()).toContain(`Directive({ selector: '[c]' })`);
           });


        it('should delete the decorator (and its container if there are not other decorators left) that was matched in the analysis',
           () => {
             const {renderer, decorationAnalyses, sourceFile} = setup([PROGRAM_DECORATE_HELPER]);
             const output = new MagicString(PROGRAM_DECORATE_HELPER.contents);
             const compiledClass =
                 decorationAnalyses.get(sourceFile)!.compiledClasses.find(c => c.name === 'C')!;
             const decorator = compiledClass.decorators!.find(d => d.name === 'Directive')!;
             const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
             decoratorsToRemove.set(decorator.node!.parent!, [decorator.node!]);
             renderer.removeDecorators(output, decoratorsToRemove);
             expect(output.toString()).toContain(`Directive({ selector: '[a]' }),`);
             expect(output.toString()).toContain(`OtherA()`);
             expect(output.toString()).toContain(`Directive({ selector: '[b]' })`);
             expect(output.toString()).toContain(`OtherB()`);
             expect(output.toString()).not.toContain(`Directive({ selector: '[c]' })`);
             expect(output.toString()).not.toContain(`C = tslib_1.__decorate([`);
             expect(output.toString()).toContain(`let C = class C {\n};\nexport { C };`);
           });
      });

      describe('addModuleWithProvidersParams', () => {
        let MODULE_WITH_PROVIDERS_PROGRAM: TestFile[];
        let MODULE_WITH_PROVIDERS_DTS_PROGRAM: TestFile[];
        beforeEach(() => {
          MODULE_WITH_PROVIDERS_PROGRAM = [
            {
              name: _('/node_modules/test-package/src/index.js'),
              contents: `
        import {ExternalModule} from './module';
        import {LibraryModule} from 'some-library';
        export class SomeClass {}
        export class SomeModule {
          static withProviders1() { return {ngModule: SomeModule}; }
          static withProviders2() { return {ngModule: SomeModule}; }
          static withProviders3() { return {ngModule: SomeClass}; }
          static withProviders4() { return {ngModule: ExternalModule}; }
          static withProviders5() { return {ngModule: ExternalModule}; }
          static withProviders6() { return {ngModule: LibraryModule}; }
          static withProviders7() { return {ngModule: SomeModule, providers: []}; };
          static withProviders8() { return {ngModule: SomeModule}; }
        }
        export function withProviders1() { return {ngModule: SomeModule}; }
        export function withProviders2() { return {ngModule: SomeModule}; }
        export function withProviders3() { return {ngModule: SomeClass}; }
        export function withProviders4() { return {ngModule: ExternalModule}; }
        export function withProviders5() { return {ngModule: ExternalModule}; }
        export function withProviders6() { return {ngModule: LibraryModule}; }
        export function withProviders7() { return {ngModule: SomeModule, providers: []}; }
        export function withProviders8() { return {ngModule: SomeModule}; }
        export {ExternalModule} from './module';
        `
            },
            {
              name: _('/node_modules/test-package/src/module.js'),
              contents: `
        export class ExternalModule {
          static withProviders1() { return {ngModule: ExternalModule}; }
          static withProviders2() { return {ngModule: ExternalModule}; }
        }`
            },
            {
              name: _('/node_modules/some-library/index.d.ts'),
              contents: 'export declare class LibraryModule {}'
            },
          ];

          MODULE_WITH_PROVIDERS_DTS_PROGRAM = [
            {
              name: _('/node_modules/test-package/typings/index.d.ts'),
              contents: `
        import {ModuleWithProviders} from '@angular/core';
        export declare class SomeClass {}
        export interface MyModuleWithProviders extends ModuleWithProviders {}
        export declare class SomeModule {
          static withProviders1(): ModuleWithProviders;
          static withProviders2(): ModuleWithProviders<any>;
          static withProviders3(): ModuleWithProviders<SomeClass>;
          static withProviders4(): ModuleWithProviders;
          static withProviders5();
          static withProviders6(): ModuleWithProviders;
          static withProviders7(): {ngModule: SomeModule, providers: any[]};
          static withProviders8(): MyModuleWithProviders;
        }
        export declare function withProviders1(): ModuleWithProviders;
        export declare function withProviders2(): ModuleWithProviders<any>;
        export declare function withProviders3(): ModuleWithProviders<SomeClass>;
        export declare function withProviders4(): ModuleWithProviders;
        export declare function withProviders5();
        export declare function withProviders6(): ModuleWithProviders;
        export declare function withProviders7(): {ngModule: SomeModule, providers: any[]};
        export declare function withProviders8(): MyModuleWithProviders;
        export {ExternalModule} from './module';
        `
            },
            {
              name: _('/node_modules/test-package/typings/module.d.ts'),
              contents: `
        export interface ModuleWithProviders {}
        export declare class ExternalModule {
          static withProviders1(): ModuleWithProviders;
          static withProviders2(): ModuleWithProviders;
        }`
            },
            {
              name: _('/node_modules/some-library/index.d.ts'),
              contents: 'export declare class LibraryModule {}'
            },
          ];
        });

        it('should fixup functions/methods that return ModuleWithProviders structures', () => {
          const {bundle, renderer, host} =
              setup(MODULE_WITH_PROVIDERS_PROGRAM, MODULE_WITH_PROVIDERS_DTS_PROGRAM);

          const referencesRegistry = new NgccReferencesRegistry(host);
          const moduleWithProvidersAnalyses =
              new ModuleWithProvidersAnalyzer(
                  host, bundle.src.program.getTypeChecker(), referencesRegistry, true)
                  .analyzeProgram(bundle.src.program);
          const typingsFile = getSourceFileOrError(
              bundle.dts!.program, _('/node_modules/test-package/typings/index.d.ts'));
          const moduleWithProvidersInfo = moduleWithProvidersAnalyses.get(typingsFile)!;

          const output = new MagicString(MODULE_WITH_PROVIDERS_DTS_PROGRAM[0].contents);
          const importManager = new ImportManager(new NoopImportRewriter(), 'i');
          renderer.addModuleWithProvidersParams(output, moduleWithProvidersInfo, importManager);

          expect(output.toString()).toContain(`
          static withProviders1(): ModuleWithProviders<SomeModule>;
          static withProviders2(): ModuleWithProviders<SomeModule>;
          static withProviders3(): ModuleWithProviders<SomeClass>;
          static withProviders4(): ModuleWithProviders<i0.ExternalModule>;
          static withProviders5(): i1.ModuleWithProviders<i0.ExternalModule>;
          static withProviders6(): ModuleWithProviders<i2.LibraryModule>;
          static withProviders7(): ({ngModule: SomeModule, providers: any[]})&{ngModule:SomeModule};
          static withProviders8(): (MyModuleWithProviders)&{ngModule:SomeModule};`);
          expect(output.toString()).toContain(`
        export declare function withProviders1(): ModuleWithProviders<SomeModule>;
        export declare function withProviders2(): ModuleWithProviders<SomeModule>;
        export declare function withProviders3(): ModuleWithProviders<SomeClass>;
        export declare function withProviders4(): ModuleWithProviders<i0.ExternalModule>;
        export declare function withProviders5(): i1.ModuleWithProviders<i0.ExternalModule>;
        export declare function withProviders6(): ModuleWithProviders<i2.LibraryModule>;
        export declare function withProviders7(): ({ngModule: SomeModule, providers: any[]})&{ngModule:SomeModule};
        export declare function withProviders8(): (MyModuleWithProviders)&{ngModule:SomeModule};`);
        });

        it('should not mistake `ModuleWithProviders` types that are not imported from `@angular/core',
           () => {
             const {bundle, renderer, host} =
                 setup(MODULE_WITH_PROVIDERS_PROGRAM, MODULE_WITH_PROVIDERS_DTS_PROGRAM);

             const referencesRegistry = new NgccReferencesRegistry(host);
             const moduleWithProvidersAnalyses =
                 new ModuleWithProvidersAnalyzer(
                     host, bundle.src.program.getTypeChecker(), referencesRegistry, true)
                     .analyzeProgram(bundle.src.program);
             const typingsFile = getSourceFileOrError(
                 bundle.dts!.program, _('/node_modules/test-package/typings/module.d.ts'));
             const moduleWithProvidersInfo = moduleWithProvidersAnalyses.get(typingsFile)!;

             const output = new MagicString(MODULE_WITH_PROVIDERS_DTS_PROGRAM[1].contents);
             const importManager = new ImportManager(new NoopImportRewriter(), 'i');
             renderer.addModuleWithProvidersParams(output, moduleWithProvidersInfo, importManager);
             expect(output.toString()).toContain(`
          static withProviders1(): (ModuleWithProviders)&{ngModule:ExternalModule};
          static withProviders2(): (ModuleWithProviders)&{ngModule:ExternalModule};`);
           });
      });

      describe('printStatement', () => {
        it('should transpile code to ES2015', () => {
          const {renderer, sourceFile, importManager} = setup([PROGRAM]);

          const stmt1 = new DeclareVarStmt('foo', new LiteralExpr(42), null, [StmtModifier.Final]);
          const stmt2 = new DeclareVarStmt('bar', new LiteralExpr(true));
          const stmt3 = new DeclareVarStmt('baz', new LiteralExpr('qux'), undefined, []);

          expect(renderer.printStatement(stmt1, sourceFile, importManager)).toBe('const foo = 42;');
          expect(renderer.printStatement(stmt2, sourceFile, importManager)).toBe('let bar = true;');
          expect(renderer.printStatement(stmt3, sourceFile, importManager))
              .toBe('let baz = "qux";');
        });
      });
    });
  });
});
