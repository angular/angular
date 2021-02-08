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

import {absoluteFrom, absoluteFromSourceFile, AbsoluteFsPath, getFileSystem, getSourceFileOrError} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem, TestFile} from '../../../src/ngtsc/file_system/testing';
import {NoopImportRewriter} from '../../../src/ngtsc/imports';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {getDeclaration, loadTestFiles} from '../../../src/ngtsc/testing';
import {ImportManager} from '../../../src/ngtsc/translator';
import {DecorationAnalyzer} from '../../src/analysis/decoration_analyzer';
import {NgccReferencesRegistry} from '../../src/analysis/ngcc_references_registry';
import {SwitchMarkerAnalyzer} from '../../src/analysis/switch_marker_analyzer';
import {IMPORT_PREFIX} from '../../src/constants';
import {Esm5ReflectionHost} from '../../src/host/esm5_host';
import {Esm5RenderingFormatter} from '../../src/rendering/esm5_rendering_formatter';
import {makeTestEntryPointBundle} from '../helpers/utils';

function setup(file: {name: AbsoluteFsPath, contents: string}) {
  loadTestFiles([file]);
  const fs = getFileSystem();
  const logger = new MockLogger();
  const bundle = makeTestEntryPointBundle('test-package', 'esm5', false, [file.name]);
  const host = new Esm5ReflectionHost(logger, false, bundle.src);
  const referencesRegistry = new NgccReferencesRegistry(host);
  const decorationAnalyses =
      new DecorationAnalyzer(fs, bundle, host, referencesRegistry).analyzeProgram();
  const switchMarkerAnalyses = new SwitchMarkerAnalyzer(host, bundle.entryPoint.packagePath)
                                   .analyzeProgram(bundle.src.program);
  const renderer = new Esm5RenderingFormatter(fs, host, false);
  const importManager = new ImportManager(new NoopImportRewriter(), IMPORT_PREFIX);
  return {
    host,
    program: bundle.src.program,
    sourceFile: bundle.src.file,
    renderer,
    decorationAnalyses,
    switchMarkerAnalyses,
    importManager
  };
}

runInEachFileSystem(() => {
  describe('Esm5RenderingFormatter', () => {
    let _: typeof absoluteFrom;
    let PROGRAM: TestFile;
    let PROGRAM_DECORATE_HELPER: TestFile;

    beforeEach(() => {
      _ = absoluteFrom;
      PROGRAM = {
        name: _('/node_modules/test-package/some/file.js'),
        contents: `
/* A copyright notice */
import 'some-side-effect';
import {Directive} from '@angular/core';
var A = (function() {
  function A() {}
  A.decorators = [
    { type: Directive, args: [{ selector: '[a]' }] },
    { type: OtherA }
  ];
  A.prototype.ngDoCheck = function() {
    //
  };
  return A;
}());

var B = (function() {
  function B() {}
  B.decorators = [
    { type: OtherB },
    { type: Directive, args: [{ selector: '[b]' }] }
  ];
  return B;
}());

var C = (function() {
  function C() {}
  C.decorators = [
    { type: Directive, args: [{ selector: '[c]' }] },
  ];
  return C;
}());

function NoIife() {}

var BadIife = (function() {
  function BadIife() {}
  BadIife.decorators = [
    { type: Directive, args: [{ selector: '[c]' }] },
  ];
}());

var compileNgModuleFactory = compileNgModuleFactory__PRE_R3__;
var badlyFormattedVariable = __PRE_R3__badlyFormattedVariable;
function compileNgModuleFactory__PRE_R3__(injector, options, moduleType) {
  var compilerFactory = injector.get(CompilerFactory);
  var compiler = compilerFactory.createCompiler([options]);
  return compiler.compileModuleAsync(moduleType);
}

function compileNgModuleFactory__POST_R3__(injector, options, moduleType) {
  ngDevMode && assertNgModuleType(moduleType);
  return Promise.resolve(new R3NgModuleFactory(moduleType));
}
// Some other content
export {A, B, C, NoIife, BadIife};`
      };

      PROGRAM_DECORATE_HELPER = {
        name: _('/node_modules/test-package/some/file.js'),
        contents: `
import * as tslib_1 from "tslib";
/* A copyright notice */
import { Directive } from '@angular/core';
var OtherA = function () { return function (node) { }; };
var OtherB = function () { return function (node) { }; };
var A = /** @class */ (function () {
    function A() {
    }
    A = tslib_1.__decorate([
        Directive({ selector: '[a]' }),
        OtherA()
    ], A);
    return A;
}());
export { A };
var B = /** @class */ (function () {
    function B() {
    }
    B = tslib_1.__decorate([
        OtherB(),
        Directive({ selector: '[b]' })
    ], B);
    return B;
}());
export { B };
var C = /** @class */ (function () {
    function C() {
    }
    C = tslib_1.__decorate([
        Directive({ selector: '[c]' })
    ], C);
    return C;
}());
export { C };
var D = /** @class */ (function () {
    function D() {
    }
    D_1 = D;
    var D_1;
    D = D_1 = tslib_1.__decorate([
        Directive({ selector: '[d]', providers: [D_1] })
    ], D);
    return D;
}());
export { D };
var E = /** @class */ (function () {
  function E() {}
  return E = tslib_1.__decorate([
      Directive({ selector: '[e]' })
  ], E);
}());
export { E };
var F = /** @class */ (function () {
  function F() {}
  return F = tslib_1.__decorate([
      Directive({ selector: '[f]' })
  ], F)
}());
export { F };
// Some other content`
      };
    });

    describe('addImports', () => {
      it('should insert the given imports after existing imports of the source file', () => {
        const {renderer, sourceFile} = setup(PROGRAM);
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
        const {renderer, sourceFile} = setup(PROGRAM);
        const output = new MagicString(PROGRAM.contents);
        const contentsBefore = output.toString();

        renderer.addImports(output, [], sourceFile);
        const contentsAfter = output.toString();

        expect(contentsAfter).toBe(contentsBefore);
      });
    });

    describe('addExports', () => {
      it('should insert the given exports at the end of the source file', () => {
        const {importManager, renderer, sourceFile} = setup(PROGRAM);
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
export {A, B, C, NoIife, BadIife};
export {ComponentA1} from './a';
export {ComponentA2} from './a';
export {ComponentB} from './foo/b';
export {TopLevelComponent};`);
      });
    });

    describe('addConstants', () => {
      it('should insert the given constants after imports in the source file', () => {
        const {renderer, program} = setup(PROGRAM);
        const file = getSourceFileOrError(program, _('/node_modules/test-package/some/file.js'));
        const output = new MagicString(PROGRAM.contents);
        renderer.addConstants(output, 'var x = 3;', file);
        expect(output.toString()).toContain(`
import {Directive} from '@angular/core';

var x = 3;
var A = (function() {`);
      });

      it('should insert constants after inserted imports', () => {
        const {renderer, program} = setup(PROGRAM);
        const file = getSourceFileOrError(program, _('/node_modules/test-package/some/file.js'));
        const output = new MagicString(PROGRAM.contents);
        renderer.addConstants(output, 'var x = 3;', file);
        renderer.addImports(
            output, [{specifier: '@angular/core', qualifier: ts.createIdentifier('i0')}], file);
        expect(output.toString()).toContain(`
import {Directive} from '@angular/core';
import * as i0 from '@angular/core';

var x = 3;
var A = (function() {`);
      });
    });

    describe('rewriteSwitchableDeclarations', () => {
      it('should switch marked declaration initializers', () => {
        const {renderer, program, sourceFile, switchMarkerAnalyses} = setup(PROGRAM);
        const file = getSourceFileOrError(program, _('/node_modules/test-package/some/file.js'));
        const output = new MagicString(PROGRAM.contents);
        renderer.rewriteSwitchableDeclarations(
            output, file, switchMarkerAnalyses.get(sourceFile)!.declarations);
        expect(output.toString())
            .not.toContain(`var compileNgModuleFactory = compileNgModuleFactory__PRE_R3__;`);
        expect(output.toString())
            .toContain(`var badlyFormattedVariable = __PRE_R3__badlyFormattedVariable;`);
        expect(output.toString())
            .toContain(`var compileNgModuleFactory = compileNgModuleFactory__POST_R3__;`);
        expect(output.toString())
            .toContain(
                `function compileNgModuleFactory__PRE_R3__(injector, options, moduleType) {`);
        expect(output.toString())
            .toContain(
                `function compileNgModuleFactory__POST_R3__(injector, options, moduleType) {`);
      });
    });

    describe('addDefinitions', () => {
      it('should insert the definitions directly before the return statement of the class IIFE',
         () => {
           const {renderer, decorationAnalyses, sourceFile} = setup(PROGRAM);
           const output = new MagicString(PROGRAM.contents);
           const compiledClass =
               decorationAnalyses.get(sourceFile)!.compiledClasses.find(c => c.name === 'A')!;
           renderer.addDefinitions(output, compiledClass, 'SOME DEFINITION TEXT');
           expect(output.toString()).toContain(`
  A.prototype.ngDoCheck = function() {
    //
  };
SOME DEFINITION TEXT
  return A;
`);
         });

      it('should error if the compiledClass is not valid', () => {
        const {renderer, sourceFile, program} = setup(PROGRAM);
        const output = new MagicString(PROGRAM.contents);

        const noIifeDeclaration = getDeclaration(
            program, absoluteFromSourceFile(sourceFile), 'NoIife', ts.isFunctionDeclaration);
        const mockNoIifeClass: any = {declaration: noIifeDeclaration, name: 'NoIife'};
        expect(() => renderer.addDefinitions(output, mockNoIifeClass, 'SOME DEFINITION TEXT'))
            .toThrowError(
                `Compiled class "NoIife" in "${
                    _('/node_modules/test-package/some/file.js')}" does not have a valid syntax.\n` +
                `Expected an ES5 IIFE wrapped function. But got:\n` +
                `function NoIife() {}`);

        const badIifeDeclaration = getDeclaration(
            program, absoluteFromSourceFile(sourceFile), 'BadIife', ts.isVariableDeclaration);
        const mockBadIifeClass: any = {declaration: badIifeDeclaration, name: 'BadIife'};
        expect(() => renderer.addDefinitions(output, mockBadIifeClass, 'SOME DEFINITION TEXT'))
            .toThrowError(
                `Compiled class wrapper IIFE does not have a return statement: BadIife in ${
                    _('/node_modules/test-package/some/file.js')}`);
      });
    });

    describe('addAdjacentStatements', () => {
      const contents = `import {Directive, NgZone, Console} from '@angular/core';\n` +
          `var SomeDirective = /** @class **/ (function () {\n` +
          `  function SomeDirective(zone, cons) {}\n` +
          `  SomeDirective.prototype.method = function() {}\n` +
          `  SomeDirective.decorators = [\n` +
          `    { type: Directive, args: [{ selector: '[a]' }] },\n` +
          `    { type: OtherA }\n` +
          `  ];\n` +
          `  SomeDirective.ctorParameters = function() { return [\n` +
          `    { type: NgZone },\n` +
          `    { type: Console }\n` +
          `  ]; };\n` +
          `  return SomeDirective;\n` +
          `}());\n` +
          `export {SomeDirective};`;

      it('should insert the statements after all the static methods of the class', () => {
        const program = {name: _('/node_modules/test-package/some/file.js'), contents};
        const {renderer, decorationAnalyses, sourceFile} = setup(program);
        const output = new MagicString(contents);
        const compiledClass = decorationAnalyses.get(sourceFile)!.compiledClasses.find(
            c => c.name === 'SomeDirective')!;
        renderer.addAdjacentStatements(output, compiledClass, 'SOME STATEMENTS');
        expect(output.toString())
            .toContain(
                `  SomeDirective.ctorParameters = function() { return [\n` +
                `    { type: NgZone },\n` +
                `    { type: Console }\n` +
                `  ]; };\n` +
                `SOME STATEMENTS\n` +
                `  return SomeDirective;\n`);
      });

      it('should insert the statements after any definitions', () => {
        const program = {name: _('/node_modules/test-package/some/file.js'), contents};
        const {renderer, decorationAnalyses, sourceFile} = setup(program);
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
      it('should delete the decorator (and following comma) that was matched in the analysis',
         () => {
           const {renderer, decorationAnalyses, sourceFile} = setup(PROGRAM);
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
           expect(output.toString()).toContain(`{ type: Directive, args: [{ selector: '[b]' }] }`);
           expect(output.toString()).toContain(`{ type: OtherB }`);
           expect(output.toString()).toContain(`{ type: Directive, args: [{ selector: '[c]' }] }`);
         });


      it('should delete the decorator (but cope with no trailing comma) that was matched in the analysis',
         () => {
           const {renderer, decorationAnalyses, sourceFile} = setup(PROGRAM);
           const output = new MagicString(PROGRAM.contents);
           const compiledClass =
               decorationAnalyses.get(sourceFile)!.compiledClasses.find(c => c.name === 'B')!;
           const decorator = compiledClass.decorators![0];
           const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
           decoratorsToRemove.set(decorator.node!.parent!, [decorator.node!]);
           renderer.removeDecorators(output, decoratorsToRemove);
           expect(output.toString()).toContain(`{ type: Directive, args: [{ selector: '[a]' }] },`);
           expect(output.toString()).toContain(`{ type: OtherA }`);
           expect(output.toString())
               .not.toContain(`{ type: Directive, args: [{ selector: '[b]' }] }`);
           expect(output.toString()).toContain(`{ type: OtherB }`);
           expect(output.toString()).toContain(`{ type: Directive, args: [{ selector: '[c]' }] }`);
         });


      it('should delete the decorator (and its container if there are not other decorators left) that was matched in the analysis',
         () => {
           const {renderer, decorationAnalyses, sourceFile} = setup(PROGRAM);
           const output = new MagicString(PROGRAM.contents);
           const compiledClass =
               decorationAnalyses.get(sourceFile)!.compiledClasses.find(c => c.name === 'C')!;
           const decorator = compiledClass.decorators![0];
           const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
           decoratorsToRemove.set(decorator.node!.parent!, [decorator.node!]);
           renderer.removeDecorators(output, decoratorsToRemove);
           renderer.addDefinitions(output, compiledClass, 'SOME DEFINITION TEXT');
           expect(output.toString()).toContain(`{ type: Directive, args: [{ selector: '[a]' }] },`);
           expect(output.toString()).toContain(`{ type: OtherA }`);
           expect(output.toString()).toContain(`{ type: Directive, args: [{ selector: '[b]' }] }`);
           expect(output.toString()).toContain(`{ type: OtherB }`);
           expect(output.toString())
               .toContain(`function C() {}\nSOME DEFINITION TEXT\n  return C;`);
           expect(output.toString()).not.toContain(`C.decorators`);
         });


      describe('[__decorate declarations]', () => {
        it('should delete the decorator (and following comma) that was matched in the analysis',
           () => {
             const {renderer, decorationAnalyses, sourceFile} = setup(PROGRAM_DECORATE_HELPER);
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
             const {renderer, decorationAnalyses, sourceFile} = setup(PROGRAM_DECORATE_HELPER);
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
             const {renderer, decorationAnalyses, sourceFile} = setup(PROGRAM_DECORATE_HELPER);
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
             expect(output.toString()).toContain(`function C() {\n    }\n    return C;`);
           });

        it('should delete call to `__decorate` but keep a return statement and semi-colon if there are no other decorators left',
           () => {
             const {renderer, decorationAnalyses, sourceFile} = setup(PROGRAM_DECORATE_HELPER);
             const output = new MagicString(PROGRAM_DECORATE_HELPER.contents);
             const compiledClass =
                 decorationAnalyses.get(sourceFile)!.compiledClasses.find(c => c.name === 'E')!;
             const decorator = compiledClass.decorators!.find(d => d.name === 'Directive')!;
             const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
             decoratorsToRemove.set(decorator.node!.parent!, [decorator.node!]);
             renderer.removeDecorators(output, decoratorsToRemove);
             expect(output.toString()).not.toContain(`Directive({ selector: '[e]' })`);
             expect(output.toString()).not.toContain(`E = tslib_1.__decorate([`);
             expect(output.toString()).toContain(`function E() {}\n  return E;`);
           });

        it('should delete call to `__decorate` but keep a return statement and no semi-colon if there are no other decorators left',
           () => {
             const {renderer, decorationAnalyses, sourceFile} = setup(PROGRAM_DECORATE_HELPER);
             const output = new MagicString(PROGRAM_DECORATE_HELPER.contents);
             const compiledClass =
                 decorationAnalyses.get(sourceFile)!.compiledClasses.find(c => c.name === 'F')!;
             const decorator = compiledClass.decorators!.find(d => d.name === 'Directive')!;
             const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
             decoratorsToRemove.set(decorator.node!.parent!, [decorator.node!]);
             renderer.removeDecorators(output, decoratorsToRemove);
             expect(output.toString()).not.toContain(`Directive({ selector: '[f]' })`);
             expect(output.toString()).not.toContain(`F = tslib_1.__decorate([`);
             expect(output.toString()).toContain(`function F() {}\n  return F\n`);
           });
      });
    });

    describe('printStatement', () => {
      it('should transpile code to ES5', () => {
        const {renderer, sourceFile, importManager} = setup(PROGRAM);

        const stmt1 = new DeclareVarStmt('foo', new LiteralExpr(42), null, [StmtModifier.Static]);
        const stmt2 = new DeclareVarStmt('bar', new LiteralExpr(true));
        const stmt3 = new DeclareVarStmt('baz', new LiteralExpr('qux'), undefined, []);

        expect(renderer.printStatement(stmt1, sourceFile, importManager)).toBe('var foo = 42;');
        expect(renderer.printStatement(stmt2, sourceFile, importManager)).toBe('var bar = true;');
        expect(renderer.printStatement(stmt3, sourceFile, importManager)).toBe('var baz = "qux";');
      });
    });
  });
});
