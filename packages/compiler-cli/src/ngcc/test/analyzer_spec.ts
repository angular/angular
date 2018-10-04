/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {Analyzer} from '../src/analyzer';
import {DecoratedFile, DecoratorAnalyzer} from '../src/decorator_analyzer';
import {Esm2015ReflectionHost} from '../src/host/esm2015_host';
import {Esm2015FileParser} from '../src/parsing/esm2015_parser';

import {makeProgram} from './helpers/utils';

const ONLY_DECORATORS_FILE = {
  name: 'only_decorators.js',
  contents: `
  import {Component} from '@angular/core';

  export class A {}
  A.decorators = [
    { type: Component, args: [{ selector: 'a' }] }
  ];
  `
};

const ONLY_SWITCHES_FILE = {
  name: 'only_switches.js',
  contents: `
  let compileNgModuleFactory = compileNgModuleFactory__PRE_NGCC__;

  function compileNgModuleFactory__PRE_NGCC__() {}
  function compileNgModuleFactory__POST_NGCC__() {}
  `
};

const SWITCHES_AND_DECORATORS_FILE = {
  name: 'switches_and_decorators.js',
  contents: `
  import {Component} from '@angular/core';

  export class B {}
  B.decorators = [
    { type: Component, args: [{ selector: 'b' }] }
  ];

  let compileNgModuleFactory = compileNgModuleFactory__PRE_NGCC__;

  function compileNgModuleFactory__PRE_NGCC__() {}
  function compileNgModuleFactory__POST_NGCC__() {}
  `
};

function setup(program: ts.Program) {
  const host = new Esm2015ReflectionHost(program.getTypeChecker(), null as any);
  const parser = new Esm2015FileParser(program, host);
  const decoratorAnalyzer =
      jasmine.createSpyObj<DecoratorAnalyzer>('MockDecoratorAnalyzer', ['analyzeFile']);
  const analyzer = new Analyzer(program, host, parser, decoratorAnalyzer);

  return {analyzer, decoratorAnalyzer};
}

function createDecoratedFile(sourceFile: ts.SourceFile): DecoratedFile {
  return {sourceFile, decoratedClasses: [], constantPool: null as any};
}

describe('Analyzer', () => {

  it('finds decorators', () => {
    const program = makeProgram(ONLY_DECORATORS_FILE);
    const {analyzer, decoratorAnalyzer} = setup(program);
    const decoratedFile = createDecoratedFile(program.getSourceFile(ONLY_DECORATORS_FILE.name) !);
    decoratorAnalyzer.analyzeFile.and.returnValue(decoratedFile);

    const analyzedFiles = analyzer.analyzeEntryPoint(ONLY_DECORATORS_FILE.name);
    expect(analyzedFiles.length).toBe(1);
    expect(analyzedFiles[0].decorated).toBe(decoratedFile);
    expect(analyzedFiles[0].switchable).toBeUndefined();
  });

  it('finds switchable declarations', () => {
    const program = makeProgram(ONLY_SWITCHES_FILE);
    const {analyzer, decoratorAnalyzer} = setup(program);
    decoratorAnalyzer.analyzeFile.and.returnValue([]);

    const analyzedFiles = analyzer.analyzeEntryPoint(ONLY_SWITCHES_FILE.name);
    expect(analyzedFiles.length).toBe(1);
    expect(analyzedFiles[0].decorated).toBeUndefined();
    expect(analyzedFiles[0].switchable !.declarations.length).toBe(1);
  });

  it('combines decorators with switchable declarations', () => {
    const program = makeProgram(SWITCHES_AND_DECORATORS_FILE);
    const {analyzer, decoratorAnalyzer} = setup(program);
    const decoratedFile =
        createDecoratedFile(program.getSourceFile(SWITCHES_AND_DECORATORS_FILE.name) !);
    decoratorAnalyzer.analyzeFile.and.returnValue(decoratedFile);

    const analyzedFiles = analyzer.analyzeEntryPoint(SWITCHES_AND_DECORATORS_FILE.name);
    expect(analyzedFiles.length).toBe(1);
    expect(analyzedFiles[0].decorated).toBe(decoratedFile);
    expect(analyzedFiles[0].switchable !.declarations.length).toBe(1);
  });

});
