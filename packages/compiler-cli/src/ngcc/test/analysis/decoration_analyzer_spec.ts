/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {AbsoluteFsPath} from '../../../ngtsc/path';
import {Decorator} from '../../../ngtsc/reflection';
import {DecoratorHandler, DetectResult} from '../../../ngtsc/transform';
import {CompiledClass, DecorationAnalyses, DecorationAnalyzer} from '../../src/analysis/decoration_analyzer';
import {NgccReferencesRegistry} from '../../src/analysis/ngcc_references_registry';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {makeTestBundleProgram} from '../helpers/utils';

const TEST_PROGRAM = [
  {
    name: 'test.js',
    contents: `
      import {Component, Directive, Injectable} from '@angular/core';

      export class MyComponent {}
      MyComponent.decorators = [{type: Component}];

      export class MyDirective {}
      MyDirective.decorators = [{type: Directive}];

      export class MyService {}
      MyService.decorators = [{type: Injectable}];
    `,
  },
  {
    name: 'other.js',
    contents: `
      import {Component} from '@angular/core';

      export class MyOtherComponent {}
      MyOtherComponent.decorators = [{type: Component}];
    `,
  },
];

const INTERNAL_COMPONENT_PROGRAM = [
  {
    name: 'entrypoint.js',
    contents: `
    import {Component, NgModule} from '@angular/core';
    import {ImportedComponent} from './component';

    export class LocalComponent {}
    LocalComponent.decorators = [{type: Component}];

    export class MyModule {}
    MyModule.decorators = [{type: NgModule, args: [{
                declarations: [ImportedComponent, LocalComponent],
                exports: [ImportedComponent, LocalComponent],
            },] }];
  `
  },
  {
    name: 'component.js',
    contents: `
    import {Component} from '@angular/core';
    export class ImportedComponent {}
    ImportedComponent.decorators = [{type: Component}];
  `,
    isRoot: false,
  }
];

type DecoratorHandlerWithResolve = DecoratorHandler<any, any>& {
  resolve: NonNullable<DecoratorHandler<any, any>['resolve']>;
};

function createTestHandler() {
  const handler = jasmine.createSpyObj<DecoratorHandlerWithResolve>('TestDecoratorHandler', [
    'detect',
    'analyze',
    'resolve',
    'compile',
  ]);
  // Only detect the Component and Directive decorators
  handler.detect.and.callFake(
      (node: ts.Declaration, decorators: Decorator[]): DetectResult<any>| undefined => {
        if (!decorators) {
          return undefined;
        }
        const metadata = decorators.find(d => d.name === 'Component' || d.name === 'Directive');
        if (metadata === undefined) {
          return undefined;
        } else {
          return {
            metadata,
            trigger: metadata.node,
          };
        }
      });
  // The "test" analysis is an object with the name of the decorator being analyzed
  handler.analyze.and.callFake((decl: ts.Declaration, dec: Decorator) => {
    expect(handler.resolve).not.toHaveBeenCalled();
    return {analysis: {decoratorName: dec.name}, diagnostics: undefined};
  });
  // The "test" resolution is just setting `resolved: true` on the analysis
  handler.resolve.and.callFake((decl: ts.Declaration, analysis: any) => {
    expect(handler.compile).not.toHaveBeenCalled();
    analysis.resolved = true;
  });
  // The "test" compilation result is just the name of the decorator being compiled (suffixed with
  // `(compiled)`), as long as it has already passed through `resolve()`
  handler.compile.and.callFake((decl: ts.Declaration, analysis: any) => {
    expect(handler.resolve).toHaveBeenCalledWith(decl, analysis);
    return analysis.resolved && `@${analysis.decoratorName} (compiled)`;
  });
  return handler;
}

describe('DecorationAnalyzer', () => {
  describe('analyzeProgram()', () => {
    let program: ts.Program;
    let testHandler: jasmine.SpyObj<DecoratorHandlerWithResolve>;
    let result: DecorationAnalyses;

    // Helpers
    const setUpAndAnalyzeProgram = (...progArgs: Parameters<typeof makeTestBundleProgram>) => {
      const {options, host, ...bundle} = makeTestBundleProgram(...progArgs);
      program = bundle.program;

      const reflectionHost = new Esm2015ReflectionHost(false, program.getTypeChecker());
      const referencesRegistry = new NgccReferencesRegistry(reflectionHost);
      const analyzer = new DecorationAnalyzer(
          program, options, host, program.getTypeChecker(), reflectionHost, referencesRegistry,
          [AbsoluteFsPath.fromUnchecked('/')], false);
      testHandler = createTestHandler();
      analyzer.handlers = [testHandler];
      result = analyzer.analyzeProgram();
    };

    describe('basic usage', () => {
      beforeEach(() => setUpAndAnalyzeProgram(TEST_PROGRAM));

      it('should return an object containing a reference to the original source file', () => {
        TEST_PROGRAM.forEach(({name}) => {
          const file = program.getSourceFile(name) !;
          expect(result.get(file) !.sourceFile).toBe(file);
        });
      });

      it('should call detect on the decorator handlers with each class from the parsed file',
         () => {
           expect(testHandler.detect).toHaveBeenCalledTimes(4);
           expect(testHandler.detect.calls.allArgs().map(args => args[1][0])).toEqual([
             jasmine.objectContaining({name: 'Component'}),
             jasmine.objectContaining({name: 'Directive'}),
             jasmine.objectContaining({name: 'Injectable'}),
             jasmine.objectContaining({name: 'Component'}),
           ]);
         });

      it('should return an object containing the classes that were analyzed', () => {
        const file1 = program.getSourceFile(TEST_PROGRAM[0].name) !;
        const compiledFile1 = result.get(file1) !;
        expect(compiledFile1.compiledClasses.length).toEqual(2);
        expect(compiledFile1.compiledClasses[0]).toEqual(jasmine.objectContaining({
          name: 'MyComponent', compilation: ['@Component (compiled)'],
        } as unknown as CompiledClass));
        expect(compiledFile1.compiledClasses[1]).toEqual(jasmine.objectContaining({
          name: 'MyDirective', compilation: ['@Directive (compiled)'],
        } as unknown as CompiledClass));

        const file2 = program.getSourceFile(TEST_PROGRAM[1].name) !;
        const compiledFile2 = result.get(file2) !;
        expect(compiledFile2.compiledClasses.length).toEqual(1);
        expect(compiledFile2.compiledClasses[0]).toEqual(jasmine.objectContaining({
          name: 'MyOtherComponent', compilation: ['@Component (compiled)'],
        } as unknown as CompiledClass));
      });

      it('should analyze, resolve and compile the classes that are detected', () => {
        expect(testHandler.analyze).toHaveBeenCalledTimes(3);
        expect(testHandler.analyze.calls.allArgs().map(args => args[1])).toEqual([
          jasmine.objectContaining({name: 'Component'}),
          jasmine.objectContaining({name: 'Directive'}),
          jasmine.objectContaining({name: 'Component'}),
        ]);

        expect(testHandler.resolve).toHaveBeenCalledTimes(3);
        expect(testHandler.resolve.calls.allArgs().map(args => args[1])).toEqual([
          {decoratorName: 'Component', resolved: true},
          {decoratorName: 'Directive', resolved: true},
          {decoratorName: 'Component', resolved: true},
        ]);

        expect(testHandler.compile).toHaveBeenCalledTimes(3);
        expect(testHandler.compile.calls.allArgs().map(args => args[1])).toEqual([
          {decoratorName: 'Component', resolved: true},
          {decoratorName: 'Directive', resolved: true},
          {decoratorName: 'Component', resolved: true},
        ]);
      });
    });

    describe('internal components', () => {
      beforeEach(() => setUpAndAnalyzeProgram(INTERNAL_COMPONENT_PROGRAM));

      // The problem of exposing the type of these internal components in the .d.ts typing files
      // is not yet solved.
      it('should analyze an internally imported component, which is not publicly exported from the entry-point',
         () => {
           const file = program.getSourceFile('component.js') !;
           const analysis = result.get(file) !;
           expect(analysis).toBeDefined();
           const ImportedComponent =
               analysis.compiledClasses.find(f => f.name === 'ImportedComponent') !;
           expect(ImportedComponent).toBeDefined();
         });

      it('should analyze an internally defined component, which is not exported at all', () => {
        const file = program.getSourceFile('entrypoint.js') !;
        const analysis = result.get(file) !;
        expect(analysis).toBeDefined();
        const LocalComponent = analysis.compiledClasses.find(f => f.name === 'LocalComponent') !;
        expect(LocalComponent).toBeDefined();
      });
    });
  });
});
