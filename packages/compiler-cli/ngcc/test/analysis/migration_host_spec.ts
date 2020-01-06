/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ErrorCode, makeDiagnostic, ngErrorCode} from '../../../src/ngtsc/diagnostics';
import {absoluteFrom} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {ClassDeclaration, Decorator, isNamedClassDeclaration} from '../../../src/ngtsc/reflection';
import {getDeclaration} from '../../../src/ngtsc/testing';
import {AnalysisOutput, CompileResult, DecoratorHandler, DetectResult, HandlerPrecedence, TraitState} from '../../../src/ngtsc/transform';
import {loadTestFiles} from '../../../test/helpers';
import {DefaultMigrationHost} from '../../src/analysis/migration_host';
import {NgccTraitCompiler} from '../../src/analysis/ngcc_trait_compiler';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {createComponentDecorator} from '../../src/migrations/utils';
import {EntryPointBundle} from '../../src/packages/entry_point_bundle';
import {MockLogger} from '../helpers/mock_logger';
import {makeTestEntryPointBundle} from '../helpers/utils';

runInEachFileSystem(() => {
  describe('DefaultMigrationHost', () => {
    let _: typeof absoluteFrom;
    let mockMetadata: any = {};
    let mockEvaluator: any = {};
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

    function createMigrationHost({entryPoint, handlers}: {
      entryPoint: EntryPointBundle; handlers: DecoratorHandler<unknown, unknown, unknown>[]
    }) {
      const reflectionHost = new Esm2015ReflectionHost(new MockLogger(), false, entryPoint.src);
      const compiler = new NgccTraitCompiler(handlers, reflectionHost);
      const host = new DefaultMigrationHost(
          reflectionHost, mockMetadata, mockEvaluator, compiler, entryPoint.entryPoint.path);
      return {compiler, host};
    }

    describe('injectSyntheticDecorator()', () => {
      it('should call `detect()` on each of the provided handlers', () => {
        const log: string[] = [];
        const handler1 = new TestHandler('handler1', log);
        const handler2 = new TestHandler('handler2', log);
        loadTestFiles([{name: _('/node_modules/test/index.js'), contents: ``}]);
        const entryPoint =
            makeTestEntryPointBundle('test', 'esm2015', false, [_('/node_modules/test/index.js')]);
        const {host} = createMigrationHost({entryPoint, handlers: [handler1, handler2]});
        host.injectSyntheticDecorator(mockClazz, injectedDecorator);
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
           const {host} =
               createMigrationHost({entryPoint, handlers: [handler1, handler2, handler3]});
           host.injectSyntheticDecorator(mockClazz, injectedDecorator);
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
        const {host, compiler} = createMigrationHost({entryPoint, handlers: [injectedHandler]});
        host.injectSyntheticDecorator(mockClazz, injectedDecorator);

        const record = compiler.recordFor(mockClazz);
        expect(record).toBeDefined();
        expect(record !.traits.length).toBe(1);
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
        const {host, compiler} =
            createMigrationHost({entryPoint, handlers: [directiveHandler, injectedHandler]});
        const myClass = getDeclaration(
            entryPoint.src.program, _('/node_modules/test/index.js'), 'MyClass',
            isNamedClassDeclaration);

        compiler.analyzeFile(entryPoint.src.file);
        host.injectSyntheticDecorator(myClass, injectedDecorator);

        const record = compiler.recordFor(myClass) !;
        expect(record).toBeDefined();
        expect(record.traits.length).toBe(2);
        expect(record.traits[0].detected.decorator !.name).toBe('Directive');
        expect(record.traits[1].detected.decorator !.name).toBe('InjectedDecorator');
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
        const {host, compiler} =
            createMigrationHost({entryPoint, handlers: [directiveHandler, injectedHandler]});
        const myClass = getDeclaration(
            entryPoint.src.program, _('/node_modules/test/index.js'), 'MyClass',
            isNamedClassDeclaration);

        compiler.analyzeFile(entryPoint.src.file);

        host.injectSyntheticDecorator(myClass, injectedDecorator);

        const record = compiler.recordFor(myClass) !;
        expect(record).toBeDefined();
        expect(record.traits.length).toBe(1);
        expect(record.traits[0].detected.decorator !.name).toBe('Directive');
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
        const {host, compiler} =
            createMigrationHost({entryPoint, handlers: [directiveHandler, injectedHandler]});
        const myClass = getDeclaration(
            entryPoint.src.program, _('/node_modules/test/index.js'), 'MyClass',
            isNamedClassDeclaration);

        compiler.analyzeFile(entryPoint.src.file);

        host.injectSyntheticDecorator(myClass, injectedDecorator);

        const record = compiler.recordFor(myClass) !;
        expect(record).toBeDefined();
        expect(record.traits.length).toBe(1);
        expect(record.traits[0].detected.decorator !.name).toBe('InjectedDecorator');
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
           const {host, compiler} =
               createMigrationHost({entryPoint, handlers: [directiveHandler, injectedHandler]});
           const myClass = getDeclaration(
               entryPoint.src.program, _('/node_modules/test/index.js'), 'MyClass',
               isNamedClassDeclaration);

           compiler.analyzeFile(entryPoint.src.file);

           host.injectSyntheticDecorator(myClass, injectedDecorator);

           const record = compiler.recordFor(myClass) !;
           expect(record).toBeDefined();
           expect(record.metaDiagnostics).toBeDefined();
           expect(record.metaDiagnostics !.length).toBe(1);
           expect(record.metaDiagnostics ![0].code)
               .toBe(ngErrorCode(ErrorCode.DECORATOR_COLLISION));
           expect(record.traits.length).toBe(0);
         });

      it('should report diagnostics from handlers', () => {
        const log: string[] = [];
        const handler = new DiagnosticProducingHandler('handler', log);
        loadTestFiles([{name: _('/node_modules/test/index.js'), contents: ``}]);
        const entryPoint =
            makeTestEntryPointBundle('test', 'esm2015', false, [_('/node_modules/test/index.js')]);
        const {host, compiler} = createMigrationHost({entryPoint, handlers: [handler]});
        const decorator = createComponentDecorator(mockClazz, {selector: 'comp', exportAs: null});
        host.injectSyntheticDecorator(mockClazz, decorator);

        const record = compiler.recordFor(mockClazz) !;
        const migratedTrait = record.traits[0];
        if (migratedTrait.state !== TraitState.ERRORED) {
          return fail('Expected migrated class trait to be in an error state');
        }

        expect(migratedTrait.diagnostics.length).toBe(1);
        expect(ts.flattenDiagnosticMessageText(migratedTrait.diagnostics[0].messageText, '\n'))
            .toEqual(
                `test diagnostic\n` +
                `  Occurs for @Component decorator inserted by an automatic migration\n` +
                `  @Component({ template: "", selector: "comp" })`);
      });
    });



    describe('getAllDecorators', () => {
      it('should be null for classes without decorators', () => {
        loadTestFiles(
            [{name: _('/node_modules/test/index.js'), contents: `export class MyClass {};`}]);
        const entryPoint =
            makeTestEntryPointBundle('test', 'esm2015', false, [_('/node_modules/test/index.js')]);
        const {host} = createMigrationHost({entryPoint, handlers: []});
        const myClass = getDeclaration(
            entryPoint.src.program, _('/node_modules/test/index.js'), 'MyClass',
            isNamedClassDeclaration);

        const decorators = host.getAllDecorators(myClass);
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
        const {host, compiler} =
            createMigrationHost({entryPoint, handlers: [directiveHandler, injectedHandler]});
        const myClass = getDeclaration(
            entryPoint.src.program, _('/node_modules/test/index.js'), 'MyClass',
            isNamedClassDeclaration);

        compiler.analyzeFile(entryPoint.src.file);

        host.injectSyntheticDecorator(myClass, injectedDecorator);

        const decorators = host.getAllDecorators(myClass) !;
        expect(decorators.length).toBe(2);
        expect(decorators[0].name).toBe('Directive');
        expect(decorators[1].name).toBe('InjectedDecorator');
      });
    });

    describe('isInScope', () => {
      it('should be true for nodes within the entry-point', () => {
        loadTestFiles([
          {name: _('/node_modules/test/index.js'), contents: `export * from './internal';`},
          {name: _('/node_modules/test/internal.js'), contents: `export class InternalClass {}`},
        ]);
        const entryPoint =
            makeTestEntryPointBundle('test', 'esm2015', false, [_('/node_modules/test/index.js')]);
        const {host} = createMigrationHost({entryPoint, handlers: []});
        const internalClass = getDeclaration(
            entryPoint.src.program, _('/node_modules/test/internal.js'), 'InternalClass',
            isNamedClassDeclaration);

        expect(host.isInScope(internalClass)).toBe(true);
      });

      it('should be false for nodes outside the entry-point', () => {
        loadTestFiles([
          {name: _('/node_modules/external/index.js'), contents: `export class ExternalClass {}`},
          {
            name: _('/node_modules/test/index.js'),
            contents: `
              export {ExternalClass} from 'external';
              export class InternalClass {}
            `
          },
        ]);
        const entryPoint =
            makeTestEntryPointBundle('test', 'esm2015', false, [_('/node_modules/test/index.js')]);
        const {host} = createMigrationHost({entryPoint, handlers: []});
        const externalClass = getDeclaration(
            entryPoint.src.program, _('/node_modules/external/index.js'), 'ExternalClass',
            isNamedClassDeclaration);

        expect(host.isInScope(externalClass)).toBe(false);
      });
    });
  });
});

class TestHandler implements DecoratorHandler<unknown, unknown, unknown> {
  constructor(readonly name: string, protected log: string[]) {}

  precedence = HandlerPrecedence.PRIMARY;

  detect(node: ClassDeclaration, decorators: Decorator[]|null): DetectResult<unknown>|undefined {
    this.log.push(`${this.name}:detect:${node.name.text}:${decorators !.map(d => d.name)}`);
    return undefined;
  }

  analyze(node: ClassDeclaration): AnalysisOutput<unknown> {
    this.log.push(this.name + ':analyze:' + node.name.text);
    return {};
  }

  compile(node: ClassDeclaration): CompileResult|CompileResult[] {
    this.log.push(this.name + ':compile:' + node.name.text);
    return [];
  }
}

class AlwaysDetectHandler extends TestHandler {
  detect(node: ClassDeclaration, decorators: Decorator[]|null): DetectResult<unknown>|undefined {
    super.detect(node, decorators);
    const decorator = decorators !== null ? decorators[0] : null;
    return {trigger: node, decorator, metadata: {}};
  }
}

class DetectDecoratorHandler extends TestHandler {
  constructor(private decorator: string, readonly precedence: HandlerPrecedence) {
    super(decorator, []);
  }

  detect(node: ClassDeclaration, decorators: Decorator[]|null): DetectResult<unknown>|undefined {
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
  analyze(node: ClassDeclaration): AnalysisOutput<any> {
    super.analyze(node);
    return {diagnostics: [makeDiagnostic(9999, node, 'test diagnostic')]};
  }
}
