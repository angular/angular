/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticReflector, StaticSymbol, StaticSymbolCache, StaticSymbolResolver, StaticSymbolResolverHost} from '@angular/compiler';
import * as o from '@angular/compiler/src/output/output_ast';
import {ImportResolver} from '@angular/compiler/src/output/path_util';
import {TypeScriptEmitter} from '@angular/compiler/src/output/ts_emitter';
import {convertValueToOutputAst} from '@angular/compiler/src/output/value_util';
import {MetadataCollector, isClassMetadata, isMetadataSymbolicCallExpression} from '@angular/tsc-wrapped';
import * as ts from 'typescript';

import {MockSummaryResolver} from '../aot/static_symbol_resolver_spec';

describe('TypeScriptEmitter (node only)', () => {
  it('should quote identifiers quoted in the source', () => {
    const sourceText = `
      import {Component} from '@angular/core';

      @Component({
        providers: [{ provide: 'SomeToken', useValue: {a: 1, 'b': 2, c: 3, 'd': 4}}]
      })
      export class MyComponent {}
    `;
    const source = ts.createSourceFile('test.ts', sourceText, ts.ScriptTarget.Latest);
    const collector = new MetadataCollector({quotedNames: true});
    const stubHost = new StubReflectorHost();
    const symbolCache = new StaticSymbolCache();
    const symbolResolver =
        new StaticSymbolResolver(stubHost, symbolCache, new MockSummaryResolver());
    const reflector = new StaticReflector(symbolResolver);

    // Get the metadata from the above source
    const metadata = collector.getMetadata(source);
    const componentMetadata = metadata.metadata['MyComponent'];

    // Get the first argument of the decorator call which is passed to @Component
    expect(isClassMetadata(componentMetadata)).toBeTruthy();
    if (!isClassMetadata(componentMetadata)) return;
    const decorators = componentMetadata.decorators;
    const firstDecorator = decorators[0];
    expect(isMetadataSymbolicCallExpression(firstDecorator)).toBeTruthy();
    if (!isMetadataSymbolicCallExpression(firstDecorator)) return;
    const firstArgument = firstDecorator.arguments[0];

    // Simplify this value using the StaticReflector
    const context = reflector.getStaticSymbol('none', 'none');
    const argumentValue = reflector.simplify(context, firstArgument);

    // Convert the value to an output AST
    const outputAst = convertValueToOutputAst(argumentValue);
    const statement = outputAst.toStmt();

    // Convert the value to text using the typescript emitter
    const emitter = new TypeScriptEmitter(new StubImportResolver());
    const text = emitter.emitStatements('module', [statement], []);

    // Expect the keys for 'b' and 'd' to be quoted but 'a' and 'c' not to be.
    expect(text).toContain('\'b\': 2');
    expect(text).toContain('\'d\': 4');
    expect(text).not.toContain('\'a\'');
    expect(text).not.toContain('\'c\'');
  });
});

class StubReflectorHost implements StaticSymbolResolverHost {
  getMetadataFor(modulePath: string): {[key: string]: any}[] { return []; }
  moduleNameToFileName(moduleName: string, containingFile: string): string { return 'somePath'; }
}

class StubImportResolver extends ImportResolver {
  fileNameToModuleName(importedFilePath: string, containingFilePath: string): string { return ''; }
}
