/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ErrorCode, makeDiagnostic, ngErrorCode} from '../../../src/ngtsc/diagnostics';
import {absoluteFrom} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {SemanticSymbol} from '../../../src/ngtsc/incremental/semantic_graph';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {ClassDeclaration, Decorator, isNamedClassDeclaration} from '../../../src/ngtsc/reflection';
import {getDeclaration, loadTestFiles} from '../../../src/ngtsc/testing';
import {AnalysisOutput, CompileResult, DecoratorHandler, DetectResult, HandlerPrecedence, TraitState} from '../../../src/ngtsc/transform';
import {NgccTraitCompiler} from '../../src/analysis/ngcc_trait_compiler';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {createComponentDecorator} from '../../src/migrations/utils';
import {EntryPointBundle} from '../../src/packages/entry_point_bundle';
import {makeTestEntryPointBundle} from '../helpers/utils';
import {getTraitDiagnostics} from '../host/util';

runInEachFileSystem(() => {
  describe('NgccTraitCompiler', () => {
    let _: typeof absoluteFrom;
    let mockClazz: any;
    let injectedDecorator: any = {name: 'InjectedDecorator'};
    beforeEach(() => {
      _ = absoluteFrom;
      const mockSourceFile: any = {
        fileName: _('/node_modules/some-package/entry-point/test-file.js'),
      };
      mockClazz = {
        name: {text: 'MockClazz'},
        getSourceFile: () => mockSourceFile,
        getStart: () => 0,
        getWidth: () => 0,
      };
    });

    function createCompiler({entryPoint, handlers}: {
      entryPoint: EntryPointBundle;
      handlers: DecoratorHandler<unknown, unknown, SemanticSymbol|null, unknown>[]
    }) {
      const reflectionHost = new Esm2015ReflectionHost(new MockLogger(), false, entryPoint.src);
      return new NgccTraitCompiler(handlers, reflectionHost);
    }

    describe('injectSyntheticDecorator()', () => {
      it('should call `detect()` on each of the provided handlers', () => {
        const log: string[] = [];
        const handler1 = new TestHandler('handler1', log);
        const handler2 = new TestHandler('handler2', log);
        loadTestFiles([{name: _('/node_modules/test/index.js'), contents: ``}]);
        const entryPoint =
            makeTestEntryPointBundle('test', 'esm2015', false, [_('/node_modules/test/index.js')]);
        const compiler = createCompiler({entryPoint, handlers: [handler1, handler2]});
        compiler.injectSyntheticDecorator(mockClazz, injectedDecorator);
        expect(log).toEqual([
          `handler1:detect:MockClazz:InjectedDecorator`,
          `handler2:detect:MockClazz:InjectedDecorator`,
        ]);
      });

      it('should call `analyze()` on each of the provided handlers whose `detect()` call returns a result',
         () => {
           const log: string[] = [];
           const handler1 = new TestHandler('handler1', log);
           const handler2 = new AlwaysDetectHandler('handler2', log);
           const handler3 = new TestHandler('handler3', log);
           loadTestFiles([{name: _('/node_modules/test/index.js'), contents: ``}]);
           const entryPoint = makeTestEntryPointBundle(
               'test', 'esm2015', false, [_('/node_modules/test/index.js')]);
           const compiler = createCompiler({entryPoint, handlers: [handler1, handler2, handler3]});
           compiler.injectSyntheticDecorator(mockClazz, injectedDecorator);
           expect(log).toEqual([
             `handler1:detect:MockClazz:InjectedDecorator`,
             `handler2:detect:MockClazz:InjectedDecorator`,
             `handler3:detect:MockClazz:InjectedDecorator`,
             'handler2:analyze:MockClazz',
           ]);
         });

      it('should inject a new class record into the compilation', () => {
        const injectedHandler =
            new DetectDecoratorHandler('InjectedDecorator', HandlerPrecedence.WEAK);
        loadTestFiles([{name: _('/node_modules/test/index.js'), contents: ``}]);
        const entryPoint =
            makeTestEntryPointBundle('test', 'esm2015', false, [_('/node_modules/test/index.js')]);
        const compiler = createCompiler({entryPoint, handlers: [injectedHandler]});
        compiler.injectSyntheticDecorator(mockClazz, injectedDecorator);

        const record = compiler.recordFor(mockClazz);
        expect(record).toBeDefined();
        expect(record!.traits.length).toBe(1);
      });

      it('should add a new trait to an existing class record', () => {
        const directiveHandler = new DetectDecoratorHandler('Directive', HandlerPrecedence.WEAK);
        const injectedHandler =
            new DetectDecoratorHandler('InjectedDecorator', HandlerPrecedence.WEAK);
        loadTestFiles([{
          name: _('/node_modules/test/index.js'),
          contents: `
              import {Directive} from '@angular/core';

              export class MyClass {};
              MyClass.decorators = [{ type: Directive }];
            `
        }]);
        const entryPoint =
            makeTestEntryPointBundle('test', 'esm2015', false, [_('/node_modules/test/index.js')]);
        const compiler =
            createCompiler({entryPoint, handlers: [directiveHandler, injectedHandler]});
        const myClass = getDeclaration(
            entryPoint.src.program, _('/node_modules/test/index.js'), 'MyClass',
            isNamedClassDeclaration);

        compiler.analyzeFile(entryPoint.src.file);
        compiler.injectSyntheticDecorator(myClass, injectedDecorator);

        const record = compiler.recordFor(myClass)!;
        expect(record).toBeDefined();
        expect(record.traits.length).toBe(2);
        expect(record.traits[0].detected.decorator!.name).toBe('Directive');
        expect(record.traits[1].detected.decorator!.name).toBe('InjectedDecorator');
      });

      it('should not add a weak handler when a primary handler already exists', () => {
        const directiveHandler = new DetectDecoratorHandler('Directive', HandlerPrecedence.PRIMARY);
        const injectedHandler =
            new DetectDecoratorHandler('InjectedDecorator', HandlerPrecedence.WEAK);
        loadTestFiles([{
          name: _('/node_modules/test/index.js'),
          contents: `
              import {Directive} from '@angular/core';

              export class MyClass {};
              MyClass.decorators = [{ type: Directive }];
            `
        }]);
        const entryPoint =
            makeTestEntryPointBundle('test', 'esm2015', false, [_('/node_modules/test/index.js')]);
        const compiler =
            createCompiler({entryPoint, handlers: [directiveHandler, injectedHandler]});
        const myClass = getDeclaration(
            entryPoint.src.program, _('/node_modules/test/index.js'), 'MyClass',
            isNamedClassDeclaration);

        compiler.analyzeFile(entryPoint.src.file);

        compiler.injectSyntheticDecorator(myClass, injectedDecorator);

        const record = compiler.recordFor(myClass)!;
        expect(record).toBeDefined();
        expect(record.traits.length).toBe(1);
        expect(record.traits[0].detected.decorator!.name).toBe('Directive');
      });

      it('should replace an existing weak handler when injecting a primary handler', () => {
        const directiveHandler = new DetectDecoratorHandler('Directive', HandlerPrecedence.WEAK);
        const injectedHandler =
            new DetectDecoratorHandler('InjectedDecorator', HandlerPrecedence.PRIMARY);
        loadTestFiles([{
          name: _('/node_modules/test/index.js'),
          contents: `
              import {Directive} from '@angular/core';

              export class MyClass {};
              MyClass.decorators = [{ type: Directive }];
            `
        }]);
        const entryPoint =
            makeTestEntryPointBundle('test', 'esm2015', false, [_('/node_modules/test/index.js')]);
        const compiler =
            createCompiler({entryPoint, handlers: [directiveHandler, injectedHandler]});
        const myClass = getDeclaration(
            entryPoint.src.program, _('/node_modules/test/index.js'), 'MyClass',
            isNamedClassDeclaration);

        compiler.analyzeFile(entryPoint.src.file);

        compiler.injectSyntheticDecorator(myClass, injectedDecorator);

        const record = compiler.recordFor(myClass)!;
        expect(record).toBeDefined();
        expect(record.traits.length).toBe(1);
        expect(record.traits[0].detected.decorator!.name).toBe('InjectedDecorator');
      });

      it('should produce an error when a primary handler is added when a primary handler is already present',
         () => {
           const directiveHandler =
               new DetectDecoratorHandler('Directive', HandlerPrecedence.PRIMARY);
           const injectedHandler =
               new DetectDecoratorHandler('InjectedDecorator', HandlerPrecedence.PRIMARY);
           loadTestFiles([{
             name: _('/node_modules/test/index.js'),
             contents: `
              import {Directive} from '@angular/core';

              export class MyClass {};
              MyClass.decorators = [{ type: Directive }];
            `
           }]);
           const entryPoint = makeTestEntryPointBundle(
               'test', 'esm2015', false, [_('/node_modules/test/index.js')]);
           const compiler =
               createCompiler({entryPoint, handlers: [directiveHandler, injectedHandler]});
           const myClass = getDeclaration(
               entryPoint.src.program, _('/node_modules/test/index.js'), 'MyClass',
               isNamedClassDeclaration);

           compiler.analyzeFile(entryPoint.src.file);

           compiler.injectSyntheticDecorator(myClass, injectedDecorator);

           const record = compiler.recordFor(myClass)!;
           expect(record).toBeDefined();
           expect(record.metaDiagnostics).toBeDefined();
           expect(record.metaDiagnostics!.length).toBe(1);
           expect(record.metaDiagnostics![0].code).toBe(ngErrorCode(ErrorCode.DECORATOR_COLLISION));
           expect(record.traits.length).toBe(0);
         });

      it('should report diagnostics from handlers', () => {
        const log: string[] = [];
        const handler = new DiagnosticProducingHandler('handler', log);
        loadTestFiles([{name: _('/node_modules/test/index.js'), contents: ``}]);
        const entryPoint =
            makeTestEntryPointBundle('test', 'esm2015', false, [_('/node_modules/test/index.js')]);
        const compiler = createCompiler({entryPoint, handlers: [handler]});
        const decorator = createComponentDecorator(mockClazz, {selector: 'comp', exportAs: null});
        compiler.injectSyntheticDecorator(mockClazz, decorator);

        const record = compiler.recordFor(mockClazz)!;
        const migratedTrait = record.traits[0];
        const diagnostics = getTraitDiagnostics(migratedTrait);
        if (diagnostics === null) {
          return fail('Expected migrated class trait to be in an error state');
        }

        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].messageText).toEqual(`test diagnostic`);
      });
    });



    describe('getAllDecorators', () => {
      it('should be null for classes without decorators', () => {
        loadTestFiles(
            [{name: _('/node_modules/test/index.js'), contents: `export class MyClass {};`}]);
        const entryPoint =
            makeTestEntryPointBundle('test', 'esm2015', false, [_('/node_modules/test/index.js')]);
        const compiler = createCompiler({entryPoint, handlers: []});
        const myClass = getDeclaration(
            entryPoint.src.program, _('/node_modules/test/index.js'), 'MyClass',
            isNamedClassDeclaration);

        const decorators = compiler.getAllDecorators(myClass);
        expect(decorators).toBeNull();
      });

      it('should include injected decorators', () => {
        const directiveHandler = new DetectDecoratorHandler('Directive', HandlerPrecedence.WEAK);
        const injectedHandler =
            new DetectDecoratorHandler('InjectedDecorator', HandlerPrecedence.WEAK);
        loadTestFiles([{
          name: _('/node_modules/test/index.js'),
          contents: `
            import {Directive} from '@angular/core';

            export class MyClass {};
            MyClass.decorators = [{ type: Directive }];
          `
        }]);
        const entryPoint =
            makeTestEntryPointBundle('test', 'esm2015', false, [_('/node_modules/test/index.js')]);
        const compiler =
            createCompiler({entryPoint, handlers: [directiveHandler, injectedHandler]});
        const myClass = getDeclaration(
            entryPoint.src.program, _('/node_modules/test/index.js'), 'MyClass',
            isNamedClassDeclaration);

        compiler.analyzeFile(entryPoint.src.file);

        compiler.injectSyntheticDecorator(myClass, injectedDecorator);

        const decorators = compiler.getAllDecorators(myClass)!;
        expect(decorators.length).toBe(2);
        expect(decorators[0].name).toBe('Directive');
        expect(decorators[1].name).toBe('InjectedDecorator');
      });
    });
  });
});

class TestHandler implements DecoratorHandler<unknown, unknown, null, unknown> {
  constructor(readonly name: string, protected log: string[]) {}

  precedence = HandlerPrecedence.PRIMARY;

  detect(node: ClassDeclaration, decorators: Decorator[]|null): DetectResult<unknown>|undefined {
    this.log.push(`${this.name}:detect:${node.name.text}:${decorators!.map(d => d.name)}`);
    return undefined;
  }

  analyze(node: ClassDeclaration): AnalysisOutput<unknown> {
    this.log.push(this.name + ':analyze:' + node.name.text);
    return {};
  }

  symbol(node: ClassDeclaration, analysis: Readonly<unknown>): null {
    return null;
  }

  compileFull(node: ClassDeclaration): CompileResult|CompileResult[] {
    this.log.push(this.name + ':compile:' + node.name.text);
    return [];
  }
}

class AlwaysDetectHandler extends TestHandler {
  override detect(node: ClassDeclaration, decorators: Decorator[]|null):
      DetectResult<unknown>|undefined {
    super.detect(node, decorators);
    const decorator = decorators !== null ? decorators[0] : null;
    return {trigger: node, decorator, metadata: {}};
  }
}

class DetectDecoratorHandler extends TestHandler {
  constructor(private decorator: string, override readonly precedence: HandlerPrecedence) {
    super(decorator, []);
  }

  override detect(node: ClassDeclaration, decorators: Decorator[]|null):
      DetectResult<unknown>|undefined {
    super.detect(node, decorators);
    if (decorators === null) {
      return undefined;
    }
    const decorator = decorators.find(decorator => decorator.name === this.decorator);
    if (decorator === undefined) {
      return undefined;
    }
    return {trigger: node, decorator, metadata: {}};
  }
}

class DiagnosticProducingHandler extends AlwaysDetectHandler {
  override analyze(node: ClassDeclaration): AnalysisOutput<any> {
    super.analyze(node);
    return {diagnostics: [makeDiagnostic(9999, node, 'test diagnostic')]};
  }
}
