/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {Decorator} from '../../ngtsc/host';
import {DecoratorHandler} from '../../ngtsc/transform';
import {AnalyzedFile, Analyzer} from '../src/analyzer';
import {Fesm2015ReflectionHost} from '../src/host/fesm2015_host';
import {ParsedClass} from '../src/parsing/parsed_class';
import {ParsedFile} from '../src/parsing/parsed_file';
import {getDeclaration, makeProgram} from './helpers/utils';

const TEST_PROGRAM = {
  name: 'test.js',
  contents: `
  import {Component, Injectable} from '@angular/core';

  @Component()
  export class MyComponent {}

  @Injectable()
  export class MyService {}
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

function createParsedFile(program: ts.Program) {
  const file = new ParsedFile(program.getSourceFile('test.js') !);

  const componentClass = getDeclaration(program, 'test.js', 'MyComponent', ts.isClassDeclaration);
  file.decoratedClasses.push(new ParsedClass('MyComponent', {} as any, [{
                                               name: 'Component',
                                               import: {from: '@angular/core', name: 'Component'},
                                               node: null as any,
                                               args: null
                                             }]));

  const serviceClass = getDeclaration(program, 'test.js', 'MyService', ts.isClassDeclaration);
  file.decoratedClasses.push(new ParsedClass('MyService', {} as any, [{
                                               name: 'Injectable',
                                               import: {from: '@angular/core', name: 'Injectable'},
                                               node: null as any,
                                               args: null
                                             }]));

  return file;
}

describe('Analyzer', () => {
  describe('analyzeFile()', () => {
    let program: ts.Program;
    let testHandler: jasmine.SpyObj<DecoratorHandler<any, any>>;
    let result: AnalyzedFile;

    beforeEach(() => {
      program = makeProgram(TEST_PROGRAM);
      const file = createParsedFile(program);
      const analyzer = new Analyzer(
          program.getTypeChecker(), new Fesm2015ReflectionHost(program.getTypeChecker()));
      testHandler = createTestHandler();
      analyzer.handlers = [testHandler];
      result = analyzer.analyzeFile(file);
    });

    it('should return an object containing a reference to the original source file',
       () => { expect(result.sourceFile).toBe(program.getSourceFile('test.js') !); });

    it('should call detect on the decorator handlers with each class from the parsed file', () => {
      expect(testHandler.detect).toHaveBeenCalledTimes(2);
      expect(testHandler.detect.calls.allArgs()[0][1]).toEqual([jasmine.objectContaining(
          {name: 'Component'})]);
      expect(testHandler.detect.calls.allArgs()[1][1]).toEqual([jasmine.objectContaining(
          {name: 'Injectable'})]);
    });

    it('should return an object containing the classes that were analyzed', () => {
      expect(result.analyzedClasses.length).toEqual(1);
      expect(result.analyzedClasses[0].name).toEqual('MyComponent');
    });

    it('should analyze and compile the classes that are detected', () => {
      expect(testHandler.analyze).toHaveBeenCalledTimes(1);
      expect(testHandler.analyze.calls.allArgs()[0][1].name).toEqual('Component');

      expect(testHandler.compile).toHaveBeenCalledTimes(1);
      expect(testHandler.compile.calls.allArgs()[0][1]).toEqual('Component');
    });
  });
});
