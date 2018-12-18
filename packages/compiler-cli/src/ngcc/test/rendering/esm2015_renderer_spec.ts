/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {dirname} from 'canonical-path';
import MagicString from 'magic-string';
import * as ts from 'typescript';
import {DecorationAnalyzer} from '../../src/analysis/decoration_analyzer';
import {NgccReferencesRegistry} from '../../src/analysis/ngcc_references_registry';
import {SwitchMarkerAnalyzer} from '../../src/analysis/switch_marker_analyzer';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {EsmRenderer} from '../../src/rendering/esm_renderer';
import {makeTestEntryPointBundle} from '../helpers/utils';

function setup(file: {name: string, contents: string}) {
  const dir = dirname(file.name);
  const bundle = makeTestEntryPointBundle('esm2015', [file]) !;
  const typeChecker = bundle.src.program.getTypeChecker();
  const host = new Esm2015ReflectionHost(false, typeChecker);
  const referencesRegistry = new NgccReferencesRegistry(host);
  const decorationAnalyses = new DecorationAnalyzer(
                                 bundle.src.program, bundle.src.options, bundle.src.host,
                                 typeChecker, host, referencesRegistry, [''], false)
                                 .analyzeProgram();
  const switchMarkerAnalyses = new SwitchMarkerAnalyzer(host).analyzeProgram(bundle.src.program);
  const renderer = new EsmRenderer(host, false, bundle, dir, dir);
  return {
    host,
    program: bundle.src.program,
    sourceFile: bundle.src.file, renderer, decorationAnalyses, switchMarkerAnalyses
  };
}

const PROGRAM = {
  name: '/some/file.js',
  contents: `
/* A copyright notice */
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
export class C {}
C.decorators = [
  { type: Directive, args: [{ selector: '[c]' }] },
];
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

const PROGRAM_DECORATE_HELPER = {
  name: '/some/file.js',
  contents: `
import * as tslib_1 from "tslib";
var D_1;
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

describe('Esm2015Renderer', () => {

  describe('addImports', () => {
    it('should insert the given imports at the start of the source file', () => {
      const {renderer} = setup(PROGRAM);
      const output = new MagicString(PROGRAM.contents);
      renderer.addImports(
          output, [{name: '@angular/core', as: 'i0'}, {name: '@angular/common', as: 'i1'}]);
      expect(output.toString()).toContain(`import * as i0 from '@angular/core';
import * as i1 from '@angular/common';

/* A copyright notice */`);
    });
  });

  describe('addExports', () => {
    it('should insert the given exports at the end of the source file', () => {
      const {renderer} = setup(PROGRAM);
      const output = new MagicString(PROGRAM.contents);
      renderer.addExports(output, PROGRAM.name.replace(/\.js$/, ''), [
        {from: '/some/a.js', identifier: 'ComponentA1'},
        {from: '/some/a.js', identifier: 'ComponentA2'},
        {from: '/some/foo/b.js', identifier: 'ComponentB'},
        {from: PROGRAM.name, identifier: 'TopLevelComponent'},
      ]);
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
      const {renderer, program} = setup(PROGRAM);
      const file = program.getSourceFile('some/file.js');
      if (file === undefined) {
        throw new Error(`Could not find source file`);
      }
      const output = new MagicString(PROGRAM.contents);
      renderer.addConstants(output, 'const x = 3;', file);
      expect(output.toString()).toContain(`
import {Directive} from '@angular/core';
const x = 3;

export class A {}`);
    });
  });

  describe('rewriteSwitchableDeclarations', () => {
    it('should switch marked declaration initializers', () => {
      const {renderer, program, switchMarkerAnalyses, sourceFile} = setup(PROGRAM);
      const file = program.getSourceFile('some/file.js');
      if (file === undefined) {
        throw new Error(`Could not find source file`);
      }
      const output = new MagicString(PROGRAM.contents);
      renderer.rewriteSwitchableDeclarations(
          output, file, switchMarkerAnalyses.get(sourceFile) !.declarations);
      expect(output.toString())
          .not.toContain(`let compileNgModuleFactory = compileNgModuleFactory__PRE_R3__;`);
      expect(output.toString())
          .toContain(`let badlyFormattedVariable = __PRE_R3__badlyFormattedVariable;`);
      expect(output.toString())
          .toContain(`let compileNgModuleFactory = compileNgModuleFactory__POST_R3__;`);
      expect(output.toString())
          .toContain(`function compileNgModuleFactory__PRE_R3__(injector, options, moduleType) {`);
      expect(output.toString())
          .toContain(`function compileNgModuleFactory__POST_R3__(injector, options, moduleType) {`);
    });
  });

  describe('addDefinitions', () => {
    it('should insert the definitions directly after the class declaration', () => {
      const {renderer, decorationAnalyses, sourceFile} = setup(PROGRAM);
      const output = new MagicString(PROGRAM.contents);
      const compiledClass =
          decorationAnalyses.get(sourceFile) !.compiledClasses.find(c => c.name === 'A') !;
      renderer.addDefinitions(output, compiledClass, 'SOME DEFINITION TEXT');
      expect(output.toString()).toContain(`
export class A {}
SOME DEFINITION TEXT
A.decorators = [
`);
    });

  });


  describe('removeDecorators', () => {
    describe('[static property declaration]', () => {
      it('should delete the decorator (and following comma) that was matched in the analysis',
         () => {
           const {decorationAnalyses, sourceFile, renderer} = setup(PROGRAM);
           const output = new MagicString(PROGRAM.contents);
           const compiledClass =
               decorationAnalyses.get(sourceFile) !.compiledClasses.find(c => c.name === 'A') !;
           const decorator = compiledClass.decorators[0];
           const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
           decoratorsToRemove.set(decorator.node.parent !, [decorator.node]);
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
           const {decorationAnalyses, sourceFile, renderer} = setup(PROGRAM);
           const output = new MagicString(PROGRAM.contents);
           const compiledClass =
               decorationAnalyses.get(sourceFile) !.compiledClasses.find(c => c.name === 'B') !;
           const decorator = compiledClass.decorators[0];
           const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
           decoratorsToRemove.set(decorator.node.parent !, [decorator.node]);
           renderer.removeDecorators(output, decoratorsToRemove);
           expect(output.toString()).toContain(`{ type: Directive, args: [{ selector: '[a]' }] },`);
           expect(output.toString()).toContain(`{ type: OtherA }`);
           expect(output.toString())
               .not.toContain(`{ type: Directive, args: [{ selector: '[b]' }] }`);
           expect(output.toString()).toContain(`{ type: OtherB }`);
           expect(output.toString()).toContain(`{ type: Directive, args: [{ selector: '[c]' }] }`);
         });


      it('should delete the decorator (and its container if there are no other decorators left) that was matched in the analysis',
         () => {
           const {decorationAnalyses, sourceFile, renderer} = setup(PROGRAM);
           const output = new MagicString(PROGRAM.contents);
           const compiledClass =
               decorationAnalyses.get(sourceFile) !.compiledClasses.find(c => c.name === 'C') !;
           const decorator = compiledClass.decorators[0];
           const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
           decoratorsToRemove.set(decorator.node.parent !, [decorator.node]);
           renderer.removeDecorators(output, decoratorsToRemove);
           expect(output.toString()).toContain(`{ type: Directive, args: [{ selector: '[a]' }] },`);
           expect(output.toString()).toContain(`{ type: OtherA }`);
           expect(output.toString()).toContain(`{ type: Directive, args: [{ selector: '[b]' }] }`);
           expect(output.toString()).toContain(`{ type: OtherB }`);
           expect(output.toString())
               .not.toContain(`{ type: Directive, args: [{ selector: '[c]' }] }`);
           expect(output.toString()).not.toContain(`C.decorators = [`);
         });
    });
  });

  describe('[__decorate declarations]', () => {
    it('should delete the decorator (and following comma) that was matched in the analysis', () => {
      const {renderer, decorationAnalyses, sourceFile} = setup(PROGRAM_DECORATE_HELPER);
      const output = new MagicString(PROGRAM_DECORATE_HELPER.contents);
      const compiledClass =
          decorationAnalyses.get(sourceFile) !.compiledClasses.find(c => c.name === 'A') !;
      const decorator = compiledClass.decorators.find(d => d.name === 'Directive') !;
      const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
      decoratorsToRemove.set(decorator.node.parent !, [decorator.node]);
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
             decorationAnalyses.get(sourceFile) !.compiledClasses.find(c => c.name === 'B') !;
         const decorator = compiledClass.decorators.find(d => d.name === 'Directive') !;
         const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
         decoratorsToRemove.set(decorator.node.parent !, [decorator.node]);
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
             decorationAnalyses.get(sourceFile) !.compiledClasses.find(c => c.name === 'C') !;
         const decorator = compiledClass.decorators.find(d => d.name === 'Directive') !;
         const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
         decoratorsToRemove.set(decorator.node.parent !, [decorator.node]);
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
});
