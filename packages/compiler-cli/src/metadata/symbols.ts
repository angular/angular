/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {MetadataSymbolicReferenceExpression, MetadataValue} from './schema';

export class Symbols {
  // TODO(issue/24571): remove '!'.
  private _symbols!: Map<string, MetadataValue>;
  private references = new Map<string, MetadataSymbolicReferenceExpression>();

  constructor(private sourceFile: ts.SourceFile) {}

  resolve(name: string, preferReference?: boolean): MetadataValue|undefined {
    return (preferReference && this.references.get(name)) || this.symbols.get(name);
  }

  define(name: string, value: MetadataValue) {
    this.symbols.set(name, value);
  }
  defineReference(name: string, value: MetadataSymbolicReferenceExpression) {
    this.references.set(name, value);
  }

  has(name: string): boolean {
    return this.symbols.has(name);
  }

  private get symbols(): Map<string, MetadataValue> {
    let result = this._symbols;
    if (!result) {
      result = this._symbols = new Map<string, MetadataValue>();
      populateBuiltins(result);
      this.buildImports();
    }
    return result;
  }

  private buildImports(): void {
    const symbols = this._symbols;
    // Collect the imported symbols into this.symbols
    const stripQuotes = (s: string) => s.replace(/^['"]|['"]$/g, '');
    const visit = (node: ts.Node) => {
      switch (node.kind) {
        case ts.SyntaxKind.ImportEqualsDeclaration:
          const importEqualsDeclaration = <ts.ImportEqualsDeclaration>node;
          if (importEqualsDeclaration.moduleReference.kind ===
              ts.SyntaxKind.ExternalModuleReference) {
            const externalReference =
                <ts.ExternalModuleReference>importEqualsDeclaration.moduleReference;
            if (externalReference.expression) {
              // An `import <identifier> = require(<module-specifier>);
              if (!externalReference.expression.parent) {
                // The `parent` field of a node is set by the TypeScript binder (run as
                // part of the type checker). Setting it here allows us to call `getText()`
                // even if the `SourceFile` was not type checked (which looks for `SourceFile`
                // in the parent chain). This doesn't damage the node as the binder unconditionally
                // sets the parent.
                (externalReference.expression.parent as ts.Node) = externalReference;
                (externalReference.parent as ts.Node) = this.sourceFile;
              }
              const from = stripQuotes(externalReference.expression.getText());
              symbols.set(
                  importEqualsDeclaration.name.text, {__symbolic: 'reference', module: from});
              break;
            }
          }
          symbols.set(
              importEqualsDeclaration.name.text,
              {__symbolic: 'error', message: `Unsupported import syntax`});
          break;
        case ts.SyntaxKind.ImportDeclaration:
          const importDecl = <ts.ImportDeclaration>node;
          if (!importDecl.importClause) {
            // An `import <module-specifier>` clause which does not bring symbols into scope.
            break;
          }
          if (!importDecl.moduleSpecifier.parent) {
            // See note above in the `ImportEqualDeclaration` case.
            (importDecl.moduleSpecifier.parent as ts.Node) = importDecl;
            (importDecl.parent as ts.Node) = this.sourceFile;
          }
          const from = stripQuotes(importDecl.moduleSpecifier.getText());
          if (importDecl.importClause.name) {
            // An `import <identifier> form <module-specifier>` clause. Record the default symbol.
            symbols.set(
                importDecl.importClause.name.text,
                {__symbolic: 'reference', module: from, default: true});
          }
          const bindings = importDecl.importClause.namedBindings;
          if (bindings) {
            switch (bindings.kind) {
              case ts.SyntaxKind.NamedImports:
                // An `import { [<identifier> [, <identifier>] } from <module-specifier>` clause
                for (const binding of (<ts.NamedImports>bindings).elements) {
                  symbols.set(binding.name.text, {
                    __symbolic: 'reference',
                    module: from,
                    name: binding.propertyName ? binding.propertyName.text : binding.name.text
                  });
                }
                break;
              case ts.SyntaxKind.NamespaceImport:
                // An `input * as <identifier> from <module-specifier>` clause.
                symbols.set(
                    (<ts.NamespaceImport>bindings).name.text,
                    {__symbolic: 'reference', module: from});
                break;
            }
          }
          break;
      }
      ts.forEachChild(node, visit);
    };
    if (this.sourceFile) {
      ts.forEachChild(this.sourceFile, visit);
    }
  }
}

function populateBuiltins(symbols: Map<string, MetadataValue>) {
  // From lib.core.d.ts (all "define const")
  ['Object', 'Function', 'String', 'Number', 'Array', 'Boolean', 'Map', 'NaN', 'Infinity', 'Math',
   'Date', 'RegExp', 'Error', 'Error', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError',
   'TypeError', 'URIError', 'JSON', 'ArrayBuffer', 'DataView', 'Int8Array', 'Uint8Array',
   'Uint8ClampedArray', 'Uint16Array', 'Int16Array', 'Int32Array', 'Uint32Array', 'Float32Array',
   'Float64Array']
      .forEach(name => symbols.set(name, {__symbolic: 'reference', name}));
}
