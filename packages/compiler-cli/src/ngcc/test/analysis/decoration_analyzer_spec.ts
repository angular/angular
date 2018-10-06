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
import {Fesm2015ReflectionHost} from '../../src/host/fesm2015_host';

import {makeProgram} from '../helpers/utils';

const TEST_PROGRAM = {
  name: 'test.js',
  contents: `
  import {Component, Injectable} from '@angular/core';

  export class MyComponent {}
  MyComponent.decorators = [{type: Component, args: [{ template: '...' }]}];

  export class MyService {}
  MyService.decorators = [{type: Injectable}];
  `
};

const LIBRARY_ENTRYPOINT = {
  name: 'entrypoint.js',
  contents: `
  import {Component, NgModule} from '@angular/core';
  import {MyComponent1} from './component_1.js';
  import {MyComponent2} from './component_2.js';

  export class MyModule {}
  MyModule.decorators = [{
    type: MyModule, args: [{
      declarations: [MyComponent1, MyComponent2, MyComponent3],
    }]
  }];

  class MyComponent3 {}
  MyComponent.decorators = [{type: Component, args: [{ template: '...' }]}];
  `
};

const IMPORTED_COMPONENT_1 = {
  name: 'component_1.js',
  contents: `
  import {Component} from '@angular/core';

  export class MyComponent1 {}
  MyComponent1.decorators = [{type: Component, args: [{ template: '...' }]}];
  `,
  isRoot: false,
};
const IMPORTED_COMPONENT_2 = {
  name: 'component_2.js',
  contents: `
  import {Component} from '@angular/core';

  export class MyComponent2 {}
  MyComponent2.decorators = [{type: Component, args: [{ template: '...' }]}];
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
          program.getTypeChecker(), new Fesm2015ReflectionHost(false, program.getTypeChecker()),
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

  describe('analyzing internal components', () => {
    let program: ts.Program;
    let result: DecorationAnalyses;

    beforeEach(() => {
      // We include MyComponent2 as it is a root file AND imported from a root file
      // The DecorationAnalyzer must not try to analyze this file twice.
      program = makeProgram(LIBRARY_ENTRYPOINT, IMPORTED_COMPONENT_1, IMPORTED_COMPONENT_2);
      const analyzer = new DecorationAnalyzer(
          program.getTypeChecker(), new Fesm2015ReflectionHost(false, program.getTypeChecker()),
          [''], false);
      result = analyzer.analyzeProgram(program);
    });

    it('should have analyzed the internally imported component', () => {
      const file = program.getSourceFile(IMPORTED_COMPONENT_1.name) !;
      const analysis = result.get(file) !;
      expect(analysis).toBeDefined();
      expect(analysis.analyzedClasses.length).toEqual(1);
      expect(analysis.analyzedClasses[0].name).toEqual('MyComponent1');
    });

    it('should have analyzed the internally declared (no import) component', () => {
      const file = program.getSourceFile(LIBRARY_ENTRYPOINT.name) !;
      const analysis = result.get(file) !;
      expect(analysis).toBeDefined();
      expect(analysis.analyzedClasses.length).toEqual(2);
      expect(analysis.analyzedClasses[1].name).toEqual('MyComponent3');
    });
  });
});
