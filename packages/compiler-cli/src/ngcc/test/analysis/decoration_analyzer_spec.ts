/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {Decorator} from '../../../ngtsc/host';
import {DecoratorHandler} from '../../../ngtsc/transform';
import {DecorationAnalyses, DecorationAnalyzer} from '../../src/analysis/decoration_analyzer';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';

import {makeProgram} from '../helpers/utils';

const TEST_PROGRAM = {
  name: 'test.js',
  contents: `
  import {Component, Injectable} from '@angular/core';

  export class MyComponent {}
  MyComponent.decorators = [{type: Component}];

  export class MyService {}
  MyService.decorators = [{type: Injectable}];
  `
};

function createTestHandler() {
  const handler = jasmine.createSpyObj<DecoratorHandler<any, any>>('TestDecoratorHandler', [
    'detect',
    'analyze',
    'compile',
  ]);
  // Only detect the Component decorator
  handler.detect.and.callFake((node: ts.Declaration, decorators: Decorator[]) => {
    if (!decorators) {
      return undefined;
    }
    return decorators.find(d => d.name === 'Component');
  });
  // The "test" analysis is just the name of the decorator being analyzed
  handler.analyze.and.callFake(
      ((decl: ts.Declaration, dec: Decorator) => ({analysis: dec.name, diagnostics: null})));
  // The "test" compilation result is just the name of the decorator being compiled
  handler.compile.and.callFake(((decl: ts.Declaration, analysis: any) => ({analysis})));
  return handler;
}

describe('DecorationAnalyzer', () => {
  describe('analyzeProgram()', () => {
    let program: ts.Program;
    let testHandler: jasmine.SpyObj<DecoratorHandler<any, any>>;
    let result: DecorationAnalyses;

    beforeEach(() => {
      program = makeProgram(TEST_PROGRAM);
      const analyzer = new DecorationAnalyzer(
          program.getTypeChecker(), new Esm2015ReflectionHost(false, program.getTypeChecker()),
          [''], false);
      testHandler = createTestHandler();
      analyzer.handlers = [testHandler];
      result = analyzer.analyzeProgram(program);
    });

    it('should return an object containing a reference to the original source file', () => {
      const file = program.getSourceFile(TEST_PROGRAM.name) !;
      expect(result.get(file) !.sourceFile).toBe(file);
    });

    it('should call detect on the decorator handlers with each class from the parsed file', () => {
      expect(testHandler.detect).toHaveBeenCalledTimes(2);
      expect(testHandler.detect.calls.allArgs()[0][1]).toEqual([jasmine.objectContaining(
          {name: 'Component'})]);
      expect(testHandler.detect.calls.allArgs()[1][1]).toEqual([jasmine.objectContaining(
          {name: 'Injectable'})]);
    });

    it('should return an object containing the classes that were analyzed', () => {
      const file = program.getSourceFile(TEST_PROGRAM.name) !;
      const analysis = result.get(file) !;
      expect(analysis.analyzedClasses.length).toEqual(1);
      expect(analysis.analyzedClasses[0].name).toEqual('MyComponent');
    });

    it('should analyze and compile the classes that are detected', () => {
      expect(testHandler.analyze).toHaveBeenCalledTimes(1);
      expect(testHandler.analyze.calls.allArgs()[0][1].name).toEqual('Component');

      expect(testHandler.compile).toHaveBeenCalledTimes(1);
      expect(testHandler.compile.calls.allArgs()[0][1]).toEqual('Component');
    });
  });
});
