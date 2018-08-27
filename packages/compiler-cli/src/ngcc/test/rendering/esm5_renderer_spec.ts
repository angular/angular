/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import MagicString from 'magic-string';
import {makeProgram} from '../helpers/utils';
import {Analyzer} from '../../src/analyzer';
import {Esm5ReflectionHost} from '../../src/host/esm5_host';
import {Esm5FileParser} from '../../src/parsing/esm5_parser';
import {Esm5Renderer} from '../../src/rendering/esm5_renderer';

function setup(file: {name: string, contents: string}) {
  const program = makeProgram(file);
  const host = new Esm5ReflectionHost(program.getTypeChecker());
  const parser = new Esm5FileParser(program, host);
  const analyzer = new Analyzer(program.getTypeChecker(), host, ['']);
  const renderer = new Esm5Renderer(host);
  return {analyzer, host, parser, program, renderer};
}

function analyze(parser: Esm5FileParser, analyzer: Analyzer, file: ts.SourceFile) {
  const parsedFiles = parser.parseFile(file);
  return parsedFiles.map(file => analyzer.analyzeFile(file))[0];
}

const PROGRAM = {
  name: 'some/file.js',
  contents: `
/* A copyright notice */
import {Directive} from '@angular/core';
var A = (function() {
  function A() {}
  A.decorators = [
    { type: Directive, args: [{ selector: '[a]' }] },
    { type: OtherA }
  ];
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

var compileNgModuleFactory = compileNgModuleFactory__PRE_NGCC__;
var badlyFormattedVariable = __PRE_NGCC__badlyFormattedVariable;
function compileNgModuleFactory__PRE_NGCC__(injector, options, moduleType) {
  const compilerFactory = injector.get(CompilerFactory);
  const compiler = compilerFactory.createCompiler([options]);
  return compiler.compileModuleAsync(moduleType);
}

function compileNgModuleFactory__POST_NGCC__(injector, options, moduleType) {
  ngDevMode && assertNgModuleType(moduleType);
  return Promise.resolve(new R3NgModuleFactory(moduleType));
}
// Some other content
export {A, B, C};`
};

describe('Esm5Renderer', () => {

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

var A = (function() {`);
    });
  });

  describe('rewriteSwitchableDeclarations', () => {
    it('should switch marked declaration initializers', () => {
      const {renderer, program} = setup(PROGRAM);
      const file = program.getSourceFile('some/file.js');
      if (file === undefined) {
        throw new Error(`Could not find source file`);
      }
      const output = new MagicString(PROGRAM.contents);
      renderer.rewriteSwitchableDeclarations(output, file);
      expect(output.toString())
          .not.toContain(`var compileNgModuleFactory = compileNgModuleFactory__PRE_NGCC__;`);
      expect(output.toString())
          .toContain(`var badlyFormattedVariable = __PRE_NGCC__badlyFormattedVariable;`);
      expect(output.toString())
          .toContain(`var compileNgModuleFactory = compileNgModuleFactory__POST_NGCC__;`);
      expect(output.toString())
          .toContain(
              `function compileNgModuleFactory__PRE_NGCC__(injector, options, moduleType) {`);
      expect(output.toString())
          .toContain(
              `function compileNgModuleFactory__POST_NGCC__(injector, options, moduleType) {`);
    });
  });

  describe('addDefinitions', () => {
    it('should insert the definitions directly after the class declaration', () => {
      const {analyzer, parser, program, renderer} = setup(PROGRAM);
      const analyzedFile = analyze(parser, analyzer, program.getSourceFile(PROGRAM.name) !);
      const output = new MagicString(PROGRAM.contents);
      renderer.addDefinitions(output, analyzedFile.analyzedClasses[0], 'SOME DEFINITION TEXT');
      expect(output.toString()).toContain(`
  function A() {}
SOME DEFINITION TEXT
  A.decorators = [
`);
    });

  });


  describe('removeDecorators', () => {

    it('should delete the decorator (and following comma) that was matched in the analysis', () => {
      const {analyzer, parser, program, renderer} = setup(PROGRAM);
      const analyzedFile = analyze(parser, analyzer, program.getSourceFile(PROGRAM.name) !);
      const output = new MagicString(PROGRAM.contents);
      const analyzedClass = analyzedFile.analyzedClasses[0];
      const decorator = analyzedClass.decorators[0];
      const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
      decoratorsToRemove.set(decorator.node.parent !, [decorator.node]);
      renderer.removeDecorators(output, decoratorsToRemove);
      expect(output.toString()).not.toContain(`{ type: Directive, args: [{ selector: '[a]' }] },`);
      expect(output.toString()).toContain(`{ type: OtherA }`);
      expect(output.toString()).toContain(`{ type: Directive, args: [{ selector: '[b]' }] }`);
      expect(output.toString()).toContain(`{ type: OtherB }`);
      expect(output.toString()).toContain(`{ type: Directive, args: [{ selector: '[c]' }] }`);
    });


    it('should delete the decorator (but cope with no trailing comma) that was matched in the analysis',
       () => {
         const {analyzer, parser, program, renderer} = setup(PROGRAM);
         const analyzedFile = analyze(parser, analyzer, program.getSourceFile(PROGRAM.name) !);
         const output = new MagicString(PROGRAM.contents);
         const analyzedClass = analyzedFile.analyzedClasses[1];
         const decorator = analyzedClass.decorators[1];
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


    it('should delete the decorator (and its container if there are not other decorators left) that was matched in the analysis',
       () => {
         const {analyzer, parser, program, renderer} = setup(PROGRAM);
         const analyzedFile = analyze(parser, analyzer, program.getSourceFile(PROGRAM.name) !);
         const output = new MagicString(PROGRAM.contents);
         const analyzedClass = analyzedFile.analyzedClasses[2];
         const decorator = analyzedClass.decorators[0];
         const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
         decoratorsToRemove.set(decorator.node.parent !, [decorator.node]);
         renderer.removeDecorators(output, decoratorsToRemove);
         expect(output.toString()).toContain(`{ type: Directive, args: [{ selector: '[a]' }] },`);
         expect(output.toString()).toContain(`{ type: OtherA }`);
         expect(output.toString()).toContain(`{ type: Directive, args: [{ selector: '[b]' }] }`);
         expect(output.toString()).toContain(`{ type: OtherB }`);
         expect(output.toString()).not.toContain(`C.decorators = [
  { type: Directive, args: [{ selector: '[c]' }] },
];`);
       });

  });
});
