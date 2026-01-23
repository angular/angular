/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ConstantPool, outputAst as o} from '@angular/compiler';

import {absoluteFrom} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {NOOP_INCREMENTAL_BUILD} from '../../incremental';
import {NOOP_PERF_RECORDER} from '../../perf';
import {
  ClassDeclaration,
  Decorator,
  isNamedClassDeclaration,
  TypeScriptReflectionHost,
} from '../../reflection';
import {getDeclaration, makeProgram} from '../../testing';
import {CompilationMode, DetectResult, DtsTransformRegistry, TraitCompiler} from '../../transform';
import {
  AnalysisOutput,
  CompileResult,
  DecoratorHandler,
  HandlerPrecedence,
  ResolveResult,
} from '../src/api';

const fakeSfTypeIdentifier = {
  isShim: () => false,
  isResource: () => false,
};

runInEachFileSystem(() => {
  describe('TraitCompiler', () => {
    let _: typeof absoluteFrom;
    beforeEach(() => (_ = absoluteFrom));

    function setup(
      programContents: string,
      handlers: DecoratorHandler<{} | null, unknown, null, unknown>[],
      compilationMode: CompilationMode,
      makeDtsSourceFile = false,
    ) {
      const filename = makeDtsSourceFile ? 'test.d.ts' : 'test.ts';
      const {program} = makeProgram([
        {
          name: _('/' + filename),
          contents: programContents,
        },
      ]);
      const checker = program.getTypeChecker();
      const reflectionHost = new TypeScriptReflectionHost(checker);
      const compiler = new TraitCompiler(
        handlers,
        reflectionHost,
        NOOP_PERF_RECORDER,
        NOOP_INCREMENTAL_BUILD,
        true,
        compilationMode,
        new DtsTransformRegistry(),
        null,
        fakeSfTypeIdentifier,
        /* emitDeclarationOnly */ false,
      );
      const sourceFile = program.getSourceFile(filename)!;

      return {compiler, sourceFile, program, filename: _('/' + filename)};
    }

    it('should not run decoration handlers against declaration files', () => {
      class FakeDecoratorHandler implements DecoratorHandler<{} | null, unknown, null, unknown> {
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
          throw new Error('compileFull should not have been called');
        }
        compileLocal(): CompileResult {
          throw new Error('compileLocal should not have been called');
        }
      }
      const contents = `export declare class SomeDirective {}`;
      const {compiler, sourceFile} = setup(
        contents,
        [new FakeDecoratorHandler()],
        CompilationMode.FULL,
        true,
      );

      const analysis = compiler.analyzeSync(sourceFile);

      expect(sourceFile.isDeclarationFile).toBe(true);
      expect(analysis).toBeFalsy();
    });

    describe('compilation mode', () => {
      class LocalDecoratorHandler implements DecoratorHandler<{}, {}, null, unknown> {
        name = 'LocalDecoratorHandler';
        precedence = HandlerPrecedence.PRIMARY;

        detect(
          node: ClassDeclaration,
          decorators: Decorator[] | null,
        ): DetectResult<{}> | undefined {
          if (node.name.text !== 'Local') {
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
            type: o.BOOL_TYPE,
            deferrableImports: null,
          };
        }

        compileLocal(): CompileResult {
          return {
            name: 'compileLocal',
            initializer: o.literal(true),
            statements: [],
            type: o.BOOL_TYPE,
            deferrableImports: null,
          };
        }
      }

      class PartialDecoratorHandler implements DecoratorHandler<{}, {}, null, unknown> {
        name = 'PartialDecoratorHandler';
        precedence = HandlerPrecedence.PRIMARY;

        detect(
          node: ClassDeclaration,
          decorators: Decorator[] | null,
        ): DetectResult<{}> | undefined {
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
            type: o.BOOL_TYPE,
            deferrableImports: null,
          };
        }

        compilePartial(): CompileResult {
          return {
            name: 'compilePartial',
            initializer: o.literal(true),
            statements: [],
            type: o.BOOL_TYPE,
            deferrableImports: null,
          };
        }

        compileLocal(): CompileResult {
          return {
            name: 'compileLocal',
            initializer: o.literal(true),
            statements: [],
            type: o.BOOL_TYPE,
            deferrableImports: null,
          };
        }
      }

      class FullDecoratorHandler implements DecoratorHandler<{}, {}, null, unknown> {
        name = 'FullDecoratorHandler';
        precedence = HandlerPrecedence.PRIMARY;

        detect(
          node: ClassDeclaration,
          decorators: Decorator[] | null,
        ): DetectResult<{}> | undefined {
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
            type: o.BOOL_TYPE,
            deferrableImports: null,
          };
        }

        compileLocal(): CompileResult {
          return {
            name: 'compileLocal',
            initializer: o.literal(true),
            statements: [],
            type: o.BOOL_TYPE,
            deferrableImports: null,
          };
        }
      }

      it('should run partial compilation when implemented if compilation mode is partial', () => {
        const contents = `
          export class Full {}
          export class Partial {}
        `;
        const {compiler, sourceFile, program, filename} = setup(
          contents,
          [new PartialDecoratorHandler(), new FullDecoratorHandler()],
          CompilationMode.PARTIAL,
        );

        compiler.analyzeSync(sourceFile);
        compiler.resolve();

        const partialDecl = getDeclaration(program, filename, 'Partial', isNamedClassDeclaration);
        const partialResult = compiler.compile(partialDecl, new ConstantPool())!;
        expect(partialResult.length).toBe(1);
        expect(partialResult[0].name).toBe('compilePartial');

        const fullDecl = getDeclaration(program, filename, 'Full', isNamedClassDeclaration);
        const fullResult = compiler.compile(fullDecl, new ConstantPool())!;
        expect(fullResult.length).toBe(1);
        expect(fullResult[0].name).toBe('compileFull');
      });

      it('should run local compilation when compilation mode is local', () => {
        const contents = `
          export class Full {}
          export class Local {}
        `;
        const {compiler, sourceFile, program, filename} = setup(
          contents,
          [new LocalDecoratorHandler(), new FullDecoratorHandler()],
          CompilationMode.LOCAL,
        );

        compiler.analyzeSync(sourceFile);
        compiler.resolve();

        const localDecl = getDeclaration(program, filename, 'Local', isNamedClassDeclaration);
        const localResult = compiler.compile(localDecl, new ConstantPool())!;
        expect(localResult.length).toBe(1);
        expect(localResult[0].name).toBe('compileLocal');

        const fullDecl = getDeclaration(program, filename, 'Full', isNamedClassDeclaration);
        const fullResult = compiler.compile(fullDecl, new ConstantPool())!;
        expect(fullResult.length).toBe(1);
        expect(fullResult[0].name).toBe('compileLocal');
      });

      it('should run full compilation if compilation mode is full', () => {
        const contents = `
          export class Full {}
          export class Partial {}
          export class Local {}
        `;
        const {compiler, sourceFile, program, filename} = setup(
          contents,
          [new LocalDecoratorHandler(), new PartialDecoratorHandler(), new FullDecoratorHandler()],
          CompilationMode.FULL,
        );

        compiler.analyzeSync(sourceFile);
        compiler.resolve();

        const localDecl = getDeclaration(program, filename, 'Local', isNamedClassDeclaration);
        const localResult = compiler.compile(localDecl, new ConstantPool())!;
        expect(localResult.length).toBe(1);
        expect(localResult[0].name).toBe('compileFull');

        const partialDecl = getDeclaration(program, filename, 'Partial', isNamedClassDeclaration);
        const partialResult = compiler.compile(partialDecl, new ConstantPool())!;
        expect(partialResult.length).toBe(1);
        expect(partialResult[0].name).toBe('compileFull');

        const fullDecl = getDeclaration(program, filename, 'Full', isNamedClassDeclaration);
        const fullResult = compiler.compile(fullDecl, new ConstantPool())!;
        expect(fullResult.length).toBe(1);
        expect(fullResult[0].name).toBe('compileFull');
      });
    });

    describe('local compilation', () => {
      class TestDecoratorHandler implements DecoratorHandler<{}, {}, null, unknown> {
        name = 'TestDecoratorHandler';
        precedence = HandlerPrecedence.PRIMARY;

        detect(
          node: ClassDeclaration,
          decorators: Decorator[] | null,
        ): DetectResult<{}> | undefined {
          if (node.name.text !== 'Test') {
            return undefined;
          }
          return {trigger: node, decorator: null, metadata: {}};
        }

        analyze(): AnalysisOutput<unknown> {
          return {analysis: {}};
        }

        resolve(): ResolveResult<unknown> {
          return {};
        }

        register(): void {}

        updateResources() {}

        symbol(): null {
          return null;
        }

        compileFull(): CompileResult {
          return {
            name: 'compileFull',
            initializer: o.literal(true),
            statements: [],
            type: o.BOOL_TYPE,
            deferrableImports: null,
          };
        }

        compileLocal(): CompileResult {
          return {
            name: 'compileLocal',
            initializer: o.literal(true),
            statements: [],
            type: o.BOOL_TYPE,
            deferrableImports: null,
          };
        }
      }

      it('should invoke `resolve` phase', () => {
        const contents = `
          export class Test {}
        `;
        const handler = new TestDecoratorHandler();
        spyOn(handler, 'resolve').and.callThrough();
        const {compiler, sourceFile} = setup(contents, [handler], CompilationMode.LOCAL);

        compiler.analyzeSync(sourceFile);
        compiler.resolve();

        expect(handler.resolve).toHaveBeenCalled();
      });

      it('should invoke `register` phase', () => {
        const contents = `
          export class Test {}
        `;
        const handler = new TestDecoratorHandler();
        spyOn(handler, 'register');
        const {compiler, sourceFile} = setup(contents, [handler], CompilationMode.LOCAL);

        compiler.analyzeSync(sourceFile);
        compiler.resolve();

        expect(handler.register).toHaveBeenCalled();
      });

      it('should not call updateResources', () => {
        const contents = `
          export class Test {}
        `;
        const handler = new TestDecoratorHandler();
        spyOn(handler, 'updateResources');
        const {compiler, sourceFile, program, filename} = setup(
          contents,
          [handler],
          CompilationMode.LOCAL,
        );
        const decl = getDeclaration(program, filename, 'Test', isNamedClassDeclaration);

        compiler.analyzeSync(sourceFile);
        compiler.resolve();
        compiler.updateResources(decl);

        expect(handler.updateResources).not.toHaveBeenCalled();
      });
    });
  });
});
