/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {makeDiagnostic} from '../../../src/ngtsc/diagnostics';
import {absoluteFrom} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {SemanticSymbol} from '../../../src/ngtsc/incremental/semantic_graph';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {ClassDeclaration, Decorator, isNamedClassDeclaration} from '../../../src/ngtsc/reflection';
import {getDeclaration, loadTestFiles} from '../../../src/ngtsc/testing';
import {AnalysisOutput, CompileResult, DecoratorHandler, DetectResult, HandlerPrecedence} from '../../../src/ngtsc/transform';
import {DefaultMigrationHost} from '../../src/analysis/migration_host';
import {NgccTraitCompiler} from '../../src/analysis/ngcc_trait_compiler';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {createComponentDecorator} from '../../src/migrations/utils';
import {EntryPointBundle} from '../../src/packages/entry_point_bundle';
import {makeTestEntryPointBundle} from '../helpers/utils';
import {getTraitDiagnostics} from '../host/util';

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
      entryPoint: EntryPointBundle;
      handlers: DecoratorHandler<unknown, unknown, SemanticSymbol|null, unknown>[]
    }) {
      const reflectionHost = new Esm2015ReflectionHost(new MockLogger(), false, entryPoint.src);
      const compiler = new NgccTraitCompiler(handlers, reflectionHost);
      const host = new DefaultMigrationHost(
          reflectionHost, mockMetadata, mockEvaluator, compiler, entryPoint.entryPoint.path);
      return {compiler, host};
    }

    describe('injectSyntheticDecorator()', () => {
      it('should add the injected decorator into the compilation', () => {
        const handler = new DetectDecoratorHandler('InjectedDecorator', HandlerPrecedence.WEAK);
        loadTestFiles([{name: _('/node_modules/test/index.js'), contents: ``}]);
        const entryPoint =
            makeTestEntryPointBundle('test', 'esm2015', false, [_('/node_modules/test/index.js')]);
        const {host, compiler} = createMigrationHost({entryPoint, handlers: [handler]});
        host.injectSyntheticDecorator(mockClazz, injectedDecorator);

        const record = compiler.recordFor(mockClazz)!;
        expect(record).toBeDefined();
        expect(record.traits.length).toBe(1);
        expect(record.traits[0].detected.decorator).toBe(injectedDecorator);
      });

      it('should mention the migration that failed in the diagnostics message', () => {
        const handler = new DiagnosticProducingHandler();
        loadTestFiles([{name: _('/node_modules/test/index.js'), contents: ``}]);
        const entryPoint =
            makeTestEntryPointBundle('test', 'esm2015', false, [_('/node_modules/test/index.js')]);
        const {host, compiler} = createMigrationHost({entryPoint, handlers: [handler]});
        const decorator = createComponentDecorator(mockClazz, {selector: 'comp', exportAs: null});
        host.injectSyntheticDecorator(mockClazz, decorator);

        const record = compiler.recordFor(mockClazz)!;
        const migratedTrait = record.traits[0];
        const diagnostics = getTraitDiagnostics(migratedTrait);
        if (diagnostics === null) {
          return fail('Expected migrated class trait to be in an error state');
        }

        expect(diagnostics.length).toBe(1);
        expect(ts.flattenDiagnosticMessageText(diagnostics[0].messageText, '\n'))
            .toEqual(
                `test diagnostic\n` +
                `  Occurs for @Component decorator inserted by an automatic migration\n` +
                `  @Component({ template: "", selector: "comp" })`);
      });
    });

    describe('getAllDecorators', () => {
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

        const decorators = host.getAllDecorators(myClass)!;
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

      it('should be false for nodes outside the entry-point (in sibling package)', () => {
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

      it('should be false for nodes outside the entry-point (in nested `node_modules/`)', () => {
        loadTestFiles([
          {
            name: _('/node_modules/test/index.js'),
            contents: `
              export {NestedDependencyClass} from 'nested';
              export class InternalClass {}
            `,
          },
          {
            name: _('/node_modules/test/node_modules/nested/index.js'),
            contents: `export class NestedDependencyClass {}`,
          },
        ]);
        const entryPoint =
            makeTestEntryPointBundle('test', 'esm2015', false, [_('/node_modules/test/index.js')]);
        const {host} = createMigrationHost({entryPoint, handlers: []});
        const nestedDepClass = getDeclaration(
            entryPoint.src.program, _('/node_modules/test/node_modules/nested/index.js'),
            'NestedDependencyClass', isNamedClassDeclaration);

        expect(host.isInScope(nestedDepClass)).toBe(false);
      });
    });
  });
});

class DetectDecoratorHandler implements DecoratorHandler<unknown, unknown, null, unknown> {
  readonly name = DetectDecoratorHandler.name;

  constructor(private decorator: string, readonly precedence: HandlerPrecedence) {}

  detect(node: ClassDeclaration, decorators: Decorator[]|null): DetectResult<unknown>|undefined {
    if (decorators === null) {
      return undefined;
    }
    const decorator = decorators.find(decorator => decorator.name === this.decorator);
    if (decorator === undefined) {
      return undefined;
    }
    return {trigger: node, decorator, metadata: {}};
  }

  analyze(node: ClassDeclaration): AnalysisOutput<unknown> {
    return {};
  }

  symbol(node: ClassDeclaration, analysis: Readonly<unknown>): null {
    return null;
  }

  compileFull(node: ClassDeclaration): CompileResult|CompileResult[] {
    return [];
  }
}

class DiagnosticProducingHandler implements DecoratorHandler<unknown, unknown, null, unknown> {
  readonly name = DiagnosticProducingHandler.name;
  readonly precedence = HandlerPrecedence.PRIMARY;

  detect(node: ClassDeclaration, decorators: Decorator[]|null): DetectResult<unknown>|undefined {
    const decorator = decorators !== null ? decorators[0] : null;
    return {trigger: node, decorator, metadata: {}};
  }

  analyze(node: ClassDeclaration): AnalysisOutput<any> {
    return {diagnostics: [makeDiagnostic(9999, node, 'test diagnostic')]};
  }

  symbol(node: ClassDeclaration, analysis: Readonly<unknown>): null {
    return null;
  }

  compileFull(node: ClassDeclaration): CompileResult|CompileResult[] {
    return [];
  }
}
