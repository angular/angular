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

import {absoluteFrom, absoluteFromSourceFile, getFileSystem, getSourceFileOrError} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem, TestFile} from '../../../src/ngtsc/file_system/testing';
import {NoopImportRewriter} from '../../../src/ngtsc/imports';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {getDeclaration, loadTestFiles} from '../../../src/ngtsc/testing';
import {ImportManager} from '../../../src/ngtsc/translator';
import {DecorationAnalyzer} from '../../src/analysis/decoration_analyzer';
import {NgccReferencesRegistry} from '../../src/analysis/ngcc_references_registry';
import {SwitchMarkerAnalyzer} from '../../src/analysis/switch_marker_analyzer';
import {UmdReflectionHost} from '../../src/host/umd_host';
import {UmdRenderingFormatter} from '../../src/rendering/umd_rendering_formatter';
import {makeTestEntryPointBundle} from '../helpers/utils';

function setup(file: TestFile) {
  loadTestFiles([file]);
  const fs = getFileSystem();
  const logger = new MockLogger();
  const bundle = makeTestEntryPointBundle('test-package', 'esm5', false, [file.name]);
  const src = bundle.src;
  const host = new UmdReflectionHost(logger, false, src);
  const referencesRegistry = new NgccReferencesRegistry(host);
  const decorationAnalyses =
      new DecorationAnalyzer(fs, bundle, host, referencesRegistry).analyzeProgram();
  const switchMarkerAnalyses =
      new SwitchMarkerAnalyzer(host, bundle.entryPoint.packagePath).analyzeProgram(src.program);
  const renderer = new UmdRenderingFormatter(fs, host, false);
  const importManager = new ImportManager(new NoopImportRewriter(), 'i');
  return {
    decorationAnalyses,
    host,
    importManager,
    program: src.program,
    renderer,
    sourceFile: src.file,
    switchMarkerAnalyses
  };
}

runInEachFileSystem(() => {
  describe('UmdRenderingFormatter', () => {
    let _: typeof absoluteFrom;
    let PROGRAM: TestFile;
    let PROGRAM_DECORATE_HELPER: TestFile;
    let PROGRAM_WITH_GLOBAL_INITIALIZER: TestFile;

    beforeEach(() => {
      _ = absoluteFrom;

      PROGRAM_WITH_GLOBAL_INITIALIZER = {
        name: _('/node_modules/test-package/some/file.js'),
        contents: `
        (function (global, factory) {
          typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports,require('some-side-effect'),require('/local-dep'),require('@angular/core')) :
          typeof define === 'function' && define.amd ? define('file', ['exports','some-side-effect','/local-dep','@angular/core'], factory) :
          (global = global || self, factory(global.file,global.someSideEffect,global.localDep,global.ng.core));
          }(this, (function (exports,someSideEffect,localDep,core) {'use strict'; })));`
      };

      PROGRAM = {
        name: _('/node_modules/test-package/some/file.js'),
        contents: `
/* A copyright notice */
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports,require('some-side-effect'),require('/local-dep'),require('@angular/core')) :
typeof define === 'function' && define.amd ? define('file', ['exports','some-side-effect','/local-dep','@angular/core'], factory) :
(factory(global.file,global.someSideEffect,global.localDep,global.ng.core));
}(this, (function (exports,someSideEffect,localDep,core) {'use strict';
var A = (function() {
  function A() {}
  A.decorators = [
    { type: core.Directive, args: [{ selector: '[a]' }] },
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
    { type: core.Directive, args: [{ selector: '[b]' }] }
  ];
  return B;
}());

var C = (function() {
  function C() {}
  C.decorators = [
    { type: core.Directive, args: [{ selector: '[c]' }] },
  ];
  return C;
}());

function NoIife() {}

var BadIife = (function() {
  function BadIife() {}
  BadIife.decorators = [
    { type: core.Directive, args: [{ selector: '[c]' }] },
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
exports.A = A;
exports.B = B;
exports.C = C;
exports.NoIife = NoIife;
exports.BadIife = BadIife;
})));`,
      };


      PROGRAM_DECORATE_HELPER = {
        name: _('/node_modules/test-package/some/file.js'),
        contents: `
/* A copyright notice */
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports,require('tslib'),require('@angular/core')) :
typeof define === 'function' && define.amd ? define('file', ['exports','/tslib','@angular/core'], factory) :
(factory(global.file,global.tslib,global.ng.core));
}(this, (function (exports,tslib,core) {'use strict';
  var OtherA = function () { return function (node) { }; };
  var OtherB = function () { return function (node) { }; };
  var A = /** @class */ (function () {
      function A() {
      }
      A = tslib.__decorate([
          core.Directive({ selector: '[a]' }),
          OtherA()
      ], A);
      return A;
  }());
  exports.A = A;
  var B = /** @class */ (function () {
      function B() {
      }
      B = tslib.__decorate([
          OtherB(),
          core.Directive({ selector: '[b]' })
      ], B);
      return B;
  }());
  exports.B = B;
  var C = /** @class */ (function () {
      function C() {
      }
      C = tslib.__decorate([
          core.Directive({ selector: '[c]' })
      ], C);
      return C;
  }());
  exports.C = C;
  var D = /** @class */ (function () {
      function D() {
      }
      D_1 = D;
      var D_1;
      D = D_1 = tslib.__decorate([
          core.Directive({ selector: '[d]', providers: [D_1] })
      ], D);
      return D;
  }());
  exports.D = D;
  // Some other content
})));`
      };
    });

    describe('addImports', () => {
      it('should append the given imports into the CommonJS factory call', () => {
        const {renderer, program} = setup(PROGRAM);
        const file = getSourceFileOrError(program, _('/node_modules/test-package/some/file.js'));
        const output = new MagicString(PROGRAM.contents);
        renderer.addImports(
            output,
            [
              {specifier: '@angular/core', qualifier: ts.createIdentifier('i0')},
              {specifier: '@angular/common', qualifier: ts.createIdentifier('i1')}
            ],
            file);
        expect(output.toString())
            .toContain(
                `typeof exports === 'object' && typeof module !== 'undefined' ? ` +
                `factory(require('@angular/core'),require('@angular/common'),exports,require('some-side-effect'),require('/local-dep'),require('@angular/core')) :`);
      });

      it('should append the given imports into the AMD initialization', () => {
        const {renderer, program} = setup(PROGRAM);
        const file = getSourceFileOrError(program, _('/node_modules/test-package/some/file.js'));
        const output = new MagicString(PROGRAM.contents);
        renderer.addImports(
            output,
            [
              {specifier: '@angular/core', qualifier: ts.createIdentifier('i0')},
              {specifier: '@angular/common', qualifier: ts.createIdentifier('i1')}
            ],
            file);
        expect(output.toString())
            .toContain(
                `typeof define === 'function' && define.amd ? define('file', ['@angular/core','@angular/common','exports','some-side-effect','/local-dep','@angular/core'], factory) :`);
      });

      it('should append the given imports into the global initialization', () => {
        const {renderer, program} = setup(PROGRAM);
        const file = getSourceFileOrError(program, _('/node_modules/test-package/some/file.js'));
        const output = new MagicString(PROGRAM.contents);
        renderer.addImports(
            output,
            [
              {specifier: '@angular/core', qualifier: ts.createIdentifier('i0')},
              {specifier: '@angular/common', qualifier: ts.createIdentifier('i1')}
            ],
            file);
        expect(output.toString())
            .toContain(
                `(factory(global.ng.core,global.ng.common,global.file,global.someSideEffect,global.localDep,global.ng.core));`);
      });

      it('should remap import identifiers to valid global properties', () => {
        const {renderer, program} = setup(PROGRAM);
        const file = getSourceFileOrError(program, _('/node_modules/test-package/some/file.js'));
        const output = new MagicString(PROGRAM.contents);
        renderer.addImports(
            output,
            [
              {specifier: '@ngrx/store', qualifier: ts.createIdentifier('i0')}, {
                specifier: '@angular/platform-browser-dynamic',
                qualifier: ts.createIdentifier('i1')
              },
              {specifier: '@angular/common/testing', qualifier: ts.createIdentifier('i2')},
              {specifier: '@angular-foo/package', qualifier: ts.createIdentifier('i3')}
            ],
            file);
        expect(output.toString())
            .toContain(
                `(factory(` +
                `global.ngrx.store,global.ng.platformBrowserDynamic,global.ng.common.testing,global.angularFoo.package,` +
                `global.file,global.someSideEffect,global.localDep,global.ng.core));`);
      });

      it('should append the given imports into the global initialization, if it has a global/self initializer',
         () => {
           const {renderer, program} = setup(PROGRAM_WITH_GLOBAL_INITIALIZER);
           const file = getSourceFileOrError(program, _('/node_modules/test-package/some/file.js'));
           const output = new MagicString(file.text);
           renderer.addImports(
               output,
               [
                 {specifier: '@angular/core', qualifier: ts.createIdentifier('i0')},
                 {specifier: '@angular/common', qualifier: ts.createIdentifier('i1')}
               ],
               file);
           expect(output.toString())
               .toContain(
                   `(global = global || self, factory(global.ng.core,global.ng.common,global.file,global.someSideEffect,global.localDep,global.ng.core));`);
         });

      it('should append the given imports as parameters into the factory function definition',
         () => {
           const {renderer, program} = setup(PROGRAM);
           const file = getSourceFileOrError(program, _('/node_modules/test-package/some/file.js'));
           const output = new MagicString(PROGRAM.contents);
           renderer.addImports(
               output,
               [
                 {specifier: '@angular/core', qualifier: ts.createIdentifier('i0')},
                 {specifier: '@angular/common', qualifier: ts.createIdentifier('i1')}
               ],
               file);
           expect(output.toString())
               .toContain(`(function (i0,i1,exports,someSideEffect,localDep,core) {'use strict';`);
         });

      it('should handle the case where there were no prior imports nor exports', () => {
        const PROGRAM: TestFile = {
          name: _('/node_modules/test-package/some/file.js'),
          contents: `
          /* A copyright notice */
          (function (global, factory) {
          typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
          typeof define === 'function' && define.amd ? define('file', factory) :
          (factory());
          }(this, (function () {'use strict';
            var index = '';
            return index;
          })));`,
        };
        const {renderer, program} = setup(PROGRAM);
        const file = getSourceFileOrError(program, _('/node_modules/test-package/some/file.js'));
        const output = new MagicString(PROGRAM.contents);
        renderer.addImports(
            output,
            [
              {specifier: '@angular/core', qualifier: ts.createIdentifier('i0')},
              {specifier: '@angular/common', qualifier: ts.createIdentifier('i1')}
            ],
            file);
        const outputSrc = output.toString();

        expect(outputSrc).toContain(
            `typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('@angular/core'),require('@angular/common')) :`);
        expect(outputSrc).toContain(
            `typeof define === 'function' && define.amd ? define('file',['@angular/core','@angular/common'], factory) :`);
        expect(outputSrc).toContain(`(factory(global.ng.core,global.ng.common));`);
        expect(outputSrc).toContain(`(function (i0,i1) {'use strict';`);
      });

      it('should leave the file unchanged if there are no imports to add', () => {
        const {renderer, program} = setup(PROGRAM);
        const file = getSourceFileOrError(program, _('/node_modules/test-package/some/file.js'));
        const output = new MagicString(PROGRAM.contents);
        const contentsBefore = output.toString();

        renderer.addImports(output, [], file);
        const contentsAfter = output.toString();

        expect(contentsAfter).toBe(contentsBefore);
      });

      it('should handle the case where not all dependencies are used by the factory', () => {
        const PROGRAM: TestFile = {
          name: _('/node_modules/test-package/some/file.js'),
          contents: `
          /* A copyright notice */
          /* A copyright notice */
          (function (global, factory) {
          typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports,require('/local-dep'),require('@angular/core'),require('some-side-effect')) :
          typeof define === 'function' && define.amd ? define('file', ['exports','/local-dep','@angular/core','some-side-effect'], factory) :
          (factory(global.file,global.localDep,global.ng.core,global.someSideEffect));
          }(this, (function (exports,localDep,core) {'use strict';
            // Note that someSideEffect is not in the factory function parameter list
          })));`,
        };
        const {renderer, program} = setup(PROGRAM);
        const file = getSourceFileOrError(program, _('/node_modules/test-package/some/file.js'));
        const output = new MagicString(PROGRAM.contents);
        renderer.addImports(
            output,
            [
              {specifier: '@angular/core', qualifier: ts.createIdentifier('i0')},
              {specifier: '@angular/common', qualifier: ts.createIdentifier('i1')}
            ],
            file);
        const outputSrc = output.toString();

        expect(outputSrc).toContain(
            `typeof exports === 'object' && typeof module !== 'undefined' ? ` +
            `factory(require('@angular/core'),require('@angular/common'),exports,require('/local-dep'),require('@angular/core'),require('some-side-effect')) :`);
        expect(outputSrc).toContain(
            `typeof define === 'function' && define.amd ? define('file', ` +
            `['@angular/core','@angular/common','exports','/local-dep','@angular/core','some-side-effect'], factory) :`);
        expect(outputSrc).toContain(
            `(factory(global.ng.core,global.ng.common,global.file,global.localDep,global.ng.core,global.someSideEffect));`);
        expect(outputSrc).toContain(`(function (i0,i1,exports,localDep,core) {'use strict';`);
      });
    });

    describe('addExports', () => {
      it('should insert the given exports at the end of the source file', () => {
        const {importManager, renderer, sourceFile} = setup(PROGRAM);
        const output = new MagicString(PROGRAM.contents);
        const generateNamedImportSpy =
            spyOn(importManager, 'generateNamedImport').and.callThrough();
        renderer.addExports(
            output, PROGRAM.name.replace(/\.js$/, ''),
            [
              {from: _('/node_modules/test-package/some/a.js'), identifier: 'ComponentA1'},
              {from: _('/node_modules/test-package/some/a.js'), identifier: 'ComponentA2'},
              {from: _('/node_modules/test-package/some/foo/b.js'), identifier: 'ComponentB'},
              {from: PROGRAM.name, identifier: 'TopLevelComponent'},
            ],
            importManager, sourceFile);

        expect(output.toString()).toContain(`
exports.A = A;
exports.B = B;
exports.C = C;
exports.NoIife = NoIife;
exports.BadIife = BadIife;
exports.ComponentA1 = i0.ComponentA1;
exports.ComponentA2 = i0.ComponentA2;
exports.ComponentB = i1.ComponentB;
exports.TopLevelComponent = TopLevelComponent;
})));`);

        expect(generateNamedImportSpy).toHaveBeenCalledWith('./a', 'ComponentA1');
        expect(generateNamedImportSpy).toHaveBeenCalledWith('./a', 'ComponentA2');
        expect(generateNamedImportSpy).toHaveBeenCalledWith('./foo/b', 'ComponentB');
      });
    });

    describe('addConstants', () => {
      it('should insert the given constants after imports in the source file', () => {
        const {renderer, program} = setup(PROGRAM);
        const file = getSourceFileOrError(program, _('/node_modules/test-package/some/file.js'));
        const output = new MagicString(PROGRAM.contents);
        renderer.addConstants(output, 'var x = 3;', file);
        expect(output.toString()).toContain(`
}(this, (function (exports,someSideEffect,localDep,core) {
var x = 3;
'use strict';
var A = (function() {`);
      });

      it('should insert constants after inserted imports',
         () => {
             // This test (from ESM5) is not needed as constants go in the body
             // of the UMD IIFE, so cannot come before imports.
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
      const contents = `(function (global, factory) {\n` +
          `  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports,require('tslib'),require('@angular/core')) :\n` +
          `  typeof define === 'function' && define.amd ? define('file', ['exports','/tslib','@angular/core'], factory) :\n` +
          `  (factory(global.file,global.tslib,global.ng.core));\n` +
          `  }(this, (function (exports,tslib,core) {'use strict';\n` +
          `\n` +
          `  var SomeDirective = /** @class **/ (function () {\n` +
          `    function SomeDirective(zone, cons) {}\n` +
          `    SomeDirective.prototype.method = function() {}\n` +
          `    SomeDirective.decorators = [\n` +
          `      { type: core.Directive, args: [{ selector: '[a]' }] },\n` +
          `      { type: OtherA }\n` +
          `    ];\n` +
          `    SomeDirective.ctorParameters = function() { return [\n` +
          `      { type: core.NgZone },\n` +
          `      { type: core.Console }\n` +
          `    ]; };\n` +
          `    return SomeDirective;\n` +
          `  }());\n` +
          `  exports.SomeDirective = SomeDirective;\n` +
          `})));`;

      it('should insert the statements after all the static methods of the class', () => {
        const program = {name: _('/node_modules/test-package/some/file.js'), contents};
        const {renderer, decorationAnalyses, sourceFile} = setup(program);
        const output = new MagicString(contents);
        const compiledClass = decorationAnalyses.get(sourceFile)!.compiledClasses.find(
            c => c.name === 'SomeDirective')!;
        renderer.addAdjacentStatements(output, compiledClass, 'SOME STATEMENTS');
        expect(output.toString())
            .toContain(
                `    SomeDirective.ctorParameters = function() { return [\n` +
                `      { type: core.NgZone },\n` +
                `      { type: core.Console }\n` +
                `    ]; };\n` +
                `SOME STATEMENTS\n` +
                `    return SomeDirective;\n`);
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
               .not.toContain(`{ type: core.Directive, args: [{ selector: '[a]' }] },`);
           expect(output.toString()).toContain(`{ type: OtherA }`);
           expect(output.toString())
               .toContain(`{ type: core.Directive, args: [{ selector: '[b]' }] }`);
           expect(output.toString()).toContain(`{ type: OtherB }`);
           expect(output.toString())
               .toContain(`{ type: core.Directive, args: [{ selector: '[c]' }] }`);
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
           expect(output.toString())
               .toContain(`{ type: core.Directive, args: [{ selector: '[a]' }] },`);
           expect(output.toString()).toContain(`{ type: OtherA }`);
           expect(output.toString())
               .not.toContain(`{ type: core.Directive, args: [{ selector: '[b]' }] }`);
           expect(output.toString()).toContain(`{ type: OtherB }`);
           expect(output.toString())
               .toContain(`{ type: core.Directive, args: [{ selector: '[c]' }] }`);
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
           expect(output.toString())
               .toContain(`{ type: core.Directive, args: [{ selector: '[a]' }] },`);
           expect(output.toString()).toContain(`{ type: OtherA }`);
           expect(output.toString())
               .toContain(`{ type: core.Directive, args: [{ selector: '[b]' }] }`);
           expect(output.toString()).toContain(`{ type: OtherB }`);
           expect(output.toString()).not.toContain(`C.decorators`);
         });
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
           expect(output.toString()).not.toContain(`core.Directive({ selector: '[a]' }),`);
           expect(output.toString()).toContain(`OtherA()`);
           expect(output.toString()).toContain(`core.Directive({ selector: '[b]' })`);
           expect(output.toString()).toContain(`OtherB()`);
           expect(output.toString()).toContain(`core.Directive({ selector: '[c]' })`);
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
           expect(output.toString()).toContain(`core.Directive({ selector: '[a]' }),`);
           expect(output.toString()).toContain(`OtherA()`);
           expect(output.toString()).not.toContain(`core.Directive({ selector: '[b]' })`);
           expect(output.toString()).toContain(`OtherB()`);
           expect(output.toString()).toContain(`core.Directive({ selector: '[c]' })`);
         });


      it('should delete the decorator (and its container if there are no other decorators left) that was matched in the analysis',
         () => {
           const {renderer, decorationAnalyses, sourceFile} = setup(PROGRAM_DECORATE_HELPER);
           const output = new MagicString(PROGRAM_DECORATE_HELPER.contents);
           const compiledClass =
               decorationAnalyses.get(sourceFile)!.compiledClasses.find(c => c.name === 'C')!;
           const decorator = compiledClass.decorators!.find(d => d.name === 'Directive')!;
           const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
           decoratorsToRemove.set(decorator.node!.parent!, [decorator.node!]);
           renderer.removeDecorators(output, decoratorsToRemove);
           expect(output.toString()).toContain(`core.Directive({ selector: '[a]' }),`);
           expect(output.toString()).toContain(`OtherA()`);
           expect(output.toString()).toContain(`core.Directive({ selector: '[b]' })`);
           expect(output.toString()).toContain(`OtherB()`);
           expect(output.toString()).not.toContain(`core.Directive({ selector: '[c]' })`);
           expect(output.toString()).not.toContain(`C = tslib_1.__decorate([`);
           expect(output.toString()).toContain(`function C() {\n      }\n      return C;`);
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
