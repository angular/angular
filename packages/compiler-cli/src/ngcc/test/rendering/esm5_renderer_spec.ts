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
  const analyzer = new Analyzer(program.getTypeChecker(), host);
  const renderer = new Esm5Renderer(host);
  return {analyzer, host, parser, program, renderer};
}

function analyze(parser: Esm5FileParser, analyzer: Analyzer, file: ts.SourceFile) {
  const parsedFiles = parser.parseFile(file);
  return parsedFiles.map(file => analyzer.analyzeFile(file))[0];
}

describe('Esm5Renderer', () => {

  describe('addImports', () => {
    it('should insert the given imports at the start of the source file', () => {
      const PROGRAM = {
        name: 'some/file.js',
        contents: `
/* A copyright notice */
import {Directive} from '@angular/core';
var A = (function() {
  function A() {}
  A.decorators = [
    { type: Directive, args: [{ selector: '[a]' }] },
    { type: Other }
  ];
  return A;
}());
// Some other content
export {A};`
      };
      const {renderer} = setup(PROGRAM);
      const output = new MagicString(PROGRAM.contents);
      renderer.addImports(
          output, [{name: '@angular/core', as: 'i0'}, {name: '@angular/common', as: 'i1'}]);
      expect(output.toString())
          .toEqual(
              `import * as i0 from '@angular/core';\n` +
              `import * as i1 from '@angular/common';\n` + PROGRAM.contents);
    });
  });


  describe('addDefinitions', () => {
    it('should insert the definitions directly after the class declaration', () => {
      const PROGRAM = {
        name: 'some/file.js',
        contents: `
/* A copyright notice */
import {Directive} from '@angular/core';
var A = (function() {
  function A() {}
  A.decorators = [
    { type: Directive, args: [{ selector: '[a]' }] },
    { type: Other }
  ];
  return A;
}());
// Some other content
export {A};`
      };
      const {analyzer, parser, program, renderer} = setup(PROGRAM);
      const analyzedFile = analyze(parser, analyzer, program.getSourceFile(PROGRAM.name) !);
      const output = new MagicString(PROGRAM.contents);
      renderer.addDefinitions(output, analyzedFile.analyzedClasses[0], 'SOME DEFINITION TEXT');
      expect(output.toString()).toEqual(`
/* A copyright notice */
import {Directive} from '@angular/core';
var A = (function() {
  function A() {}
SOME DEFINITION TEXT
  A.decorators = [
    { type: Directive, args: [{ selector: '[a]' }] },
    { type: Other }
  ];
  return A;
}());
// Some other content
export {A};`);
    });

  });


  describe('removeDecorators', () => {

    it('should delete the decorator (and following comma) that was matched in the analysis', () => {
      const PROGRAM = {
        name: 'some/file.js',
        contents: `
/* A copyright notice */
import {Directive} from '@angular/core';
var A = (function() {
  function A() {}
  A.decorators = [
    { type: Directive, args: [{ selector: '[a]' }] },
    { type: Other }
  ];
  return A;
}());
// Some other content
export {A};`
      };
      const {analyzer, parser, program, renderer} = setup(PROGRAM);
      const analyzedFile = analyze(parser, analyzer, program.getSourceFile(PROGRAM.name) !);
      const output = new MagicString(PROGRAM.contents);
      const analyzedClass = analyzedFile.analyzedClasses[0];
      const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
      decoratorsToRemove.set(
          analyzedClass.decorators[0].node.parent !, [analyzedClass.decorators[0].node]);
      renderer.removeDecorators(output, decoratorsToRemove);
      expect(output.toString()).toEqual(`
/* A copyright notice */
import {Directive} from '@angular/core';
var A = (function() {
  function A() {}
  A.decorators = [
    { type: Other }
  ];
  return A;
}());
// Some other content
export {A};`);
    });


    it('should delete the decorator (but cope with no trailing comma) that was matched in the analysis',
       () => {
         const PROGRAM = {
           name: 'some/file.js',
           contents: `
/* A copyright notice */
import {Directive} from '@angular/core';
var A = (function() {
  function A() {}
  A.decorators = [
    { type: Other },
    { type: Directive, args: [{ selector: '[a]' }] }
  ];
  return A;
}());
// Some other content
export {A};`
         };
         const {analyzer, parser, program, renderer} = setup(PROGRAM);
         const analyzedFile = analyze(parser, analyzer, program.getSourceFile(PROGRAM.name) !);
         const output = new MagicString(PROGRAM.contents);
         const analyzedClass = analyzedFile.analyzedClasses[0];
         const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
         decoratorsToRemove.set(
             analyzedClass.decorators[0].node.parent !, [analyzedClass.decorators[1].node]);
         renderer.removeDecorators(output, decoratorsToRemove);
         expect(output.toString()).toEqual(`
/* A copyright notice */
import {Directive} from '@angular/core';
var A = (function() {
  function A() {}
  A.decorators = [
    { type: Other },
  ];
  return A;
}());
// Some other content
export {A};`);
       });


    it('should delete the decorator (and its container if there are not other decorators left) that was matched in the analysis',
       () => {
         const PROGRAM = {
           name: 'some/file.js',
           contents: `
/* A copyright notice */
import {Directive} from '@angular/core';
var A = (function() {
  function A() {}
  A.decorators = [
    { type: Directive, args: [{ selector: '[a]' }] }
  ];
  return A;
}());
// Some other content
export {A};`
         };
         const {analyzer, parser, program, renderer} = setup(PROGRAM);
         const analyzedFile = analyze(parser, analyzer, program.getSourceFile(PROGRAM.name) !);
         const output = new MagicString(PROGRAM.contents);
         const analyzedClass = analyzedFile.analyzedClasses[0];
         const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
         decoratorsToRemove.set(
             analyzedClass.decorators[0].node.parent !, [analyzedClass.decorators[0].node]);
         renderer.removeDecorators(output, decoratorsToRemove);
         expect(output.toString()).toEqual(`
/* A copyright notice */
import {Directive} from '@angular/core';
var A = (function() {
  function A() {}
  return A;
}());
// Some other content
export {A};`);
       });

  });
});
