/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConstantPool} from '@angular/compiler';
import * as o from '@angular/compiler/src/output/output_ast';

import {absoluteFrom} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {NOOP_INCREMENTAL_BUILD} from '../../incremental';
import {NOOP_PERF_RECORDER} from '../../perf';
import {ClassDeclaration, Decorator, isNamedClassDeclaration, TypeScriptReflectionHost} from '../../reflection';
import {getDeclaration, makeProgram} from '../../testing';
import {CompilationMode, DetectResult, DtsTransformRegistry, TraitCompiler} from '../../transform';
import {AnalysisOutput, CompileResult, DecoratorHandler, HandlerPrecedence} from '../src/api';

runInEachFileSystem(() => {
  describe('TraitCompiler', () => {
    let _: typeof absoluteFrom;
    beforeEach(() => _ = absoluteFrom);

    it('should not run decoration handlers against declaration files', () => {
      class FakeDecoratorHandler implements DecoratorHandler<{}|null, unknown, null, unknown> {
        name = 'FakeDecoratorHandler';
        precedence = HandlerPrecedence.PRIMARY;

        detect(): undefined {
          throw new Error('detect should not have been called');
        }
        analyze(): AnalysisOutput<unknown> {
          throw new Error('analyze should not have been called');
        }
        symbol(): null {
          throw new Error('symbol should not have been called');
        }
        compileFull(): CompileResult {
          throw new Error('compile should not have been called');
        }
      }

      const {program} = makeProgram([{
        name: _('/lib.d.ts'),
        contents: `export declare class SomeDirective {}`,
      }]);
      const checker = program.getTypeChecker();
      const reflectionHost = new TypeScriptReflectionHost(checker);
      const compiler = new TraitCompiler(
          [new FakeDecoratorHandler()], reflectionHost, NOOP_PERF_RECORDER, NOOP_INCREMENTAL_BUILD,
          true, CompilationMode.FULL, new DtsTransformRegistry(), null);
      const sourceFile = program.getSourceFile('lib.d.ts')!;
      const analysis = compiler.analyzeSync(sourceFile);

      expect(sourceFile.isDeclarationFile).toBe(true);
      expect(analysis).toBeFalsy();
    });

    describe('compilation mode', () => {
      class PartialDecoratorHandler implements DecoratorHandler<{}, {}, null, unknown> {
        name = 'PartialDecoratorHandler';
        precedence = HandlerPrecedence.PRIMARY;

        detect(node: ClassDeclaration, decorators: Decorator[]|null): DetectResult<{}>|undefined {
          if (node.name.text !== 'Partial') {
            return undefined;
          }
          return {trigger: node, decorator: null, metadata: {}};
        }

        analyze(): AnalysisOutput<unknown> {
          return {analysis: {}};
        }

        symbol(): null {
          return null;
        }

        compileFull(): CompileResult {
          return {
            name: 'compileFull',
            initializer: o.literal(true),
            statements: [],
            type: o.BOOL_TYPE
          };
        }

        compilePartial(): CompileResult {
          return {
            name: 'compilePartial',
            initializer: o.literal(true),
            statements: [],
            type: o.BOOL_TYPE
          };
        }
      }

      class FullDecoratorHandler implements DecoratorHandler<{}, {}, null, unknown> {
        name = 'FullDecoratorHandler';
        precedence = HandlerPrecedence.PRIMARY;

        detect(node: ClassDeclaration, decorators: Decorator[]|null): DetectResult<{}>|undefined {
          if (node.name.text !== 'Full') {
            return undefined;
          }
          return {trigger: node, decorator: null, metadata: {}};
        }

        analyze(): AnalysisOutput<unknown> {
          return {analysis: {}};
        }

        symbol(): null {
          return null;
        }

        compileFull(): CompileResult {
          return {
            name: 'compileFull',
            initializer: o.literal(true),
            statements: [],
            type: o.BOOL_TYPE
          };
        }
      }

      it('should run partial compilation when implemented if compilation mode is partial', () => {
        const {program} = makeProgram([{
          name: _('/test.ts'),
          contents: `
            export class Full {}
            export class Partial {}
          `,
        }]);
        const checker = program.getTypeChecker();
        const reflectionHost = new TypeScriptReflectionHost(checker);
        const compiler = new TraitCompiler(
            [new PartialDecoratorHandler(), new FullDecoratorHandler()], reflectionHost,
            NOOP_PERF_RECORDER, NOOP_INCREMENTAL_BUILD, true, CompilationMode.PARTIAL,
            new DtsTransformRegistry(), null);
        const sourceFile = program.getSourceFile('test.ts')!;
        compiler.analyzeSync(sourceFile);
        compiler.resolve();

        const partialDecl =
            getDeclaration(program, _('/test.ts'), 'Partial', isNamedClassDeclaration);
        const partialResult = compiler.compile(partialDecl, new ConstantPool())!;
        expect(partialResult.length).toBe(1);
        expect(partialResult[0].name).toBe('compilePartial');

        const fullDecl = getDeclaration(program, _('/test.ts'), 'Full', isNamedClassDeclaration);
        const fullResult = compiler.compile(fullDecl, new ConstantPool())!;
        expect(fullResult.length).toBe(1);
        expect(fullResult[0].name).toBe('compileFull');
      });

      it('should run full compilation if compilation mode is full', () => {
        const {program} = makeProgram([{
          name: _('/test.ts'),
          contents: `
            export class Full {}
            export class Partial {}
          `,
        }]);
        const checker = program.getTypeChecker();
        const reflectionHost = new TypeScriptReflectionHost(checker);
        const compiler = new TraitCompiler(
            [new PartialDecoratorHandler(), new FullDecoratorHandler()], reflectionHost,
            NOOP_PERF_RECORDER, NOOP_INCREMENTAL_BUILD, true, CompilationMode.FULL,
            new DtsTransformRegistry(), null);
        const sourceFile = program.getSourceFile('test.ts')!;
        compiler.analyzeSync(sourceFile);
        compiler.resolve();

        const partialDecl =
            getDeclaration(program, _('/test.ts'), 'Partial', isNamedClassDeclaration);
        const partialResult = compiler.compile(partialDecl, new ConstantPool())!;
        expect(partialResult.length).toBe(1);
        expect(partialResult[0].name).toBe('compileFull');

        const fullDecl = getDeclaration(program, _('/test.ts'), 'Full', isNamedClassDeclaration);
        const fullResult = compiler.compile(fullDecl, new ConstantPool())!;
        expect(fullResult.length).toBe(1);
        expect(fullResult[0].name).toBe('compileFull');
      });
    });
  });
});
