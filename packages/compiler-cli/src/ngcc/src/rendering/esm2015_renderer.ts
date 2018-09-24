/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import MagicString from 'magic-string';
import {POST_NGCC_MARKER, PRE_NGCC_MARKER} from '../host/ngcc_host';
import {AnalyzedClass} from '../analyzer';
import {Renderer} from './renderer';

export class Esm2015Renderer extends Renderer {
  /**
   *  Add the imports at the top of the file
   */
  addImports(output: MagicString, imports: {name: string; as: string;}[]): void {
    // The imports get inserted at the very top of the file.
    imports.forEach(i => { output.appendLeft(0, `import * as ${i.as} from '${i.name}';\n`); });
  }

  addConstants(output: MagicString, constants: string, file: ts.SourceFile): void {
    if (constants === '') {
      return;
    }
    const insertionPoint = file.statements.reduce((prev, stmt) => {
      if (ts.isImportDeclaration(stmt) || ts.isImportEqualsDeclaration(stmt) ||
          ts.isNamespaceImport(stmt)) {
        return stmt.getEnd();
      }
      return prev;
    }, 0);
    output.appendLeft(insertionPoint, '\n' + constants + '\n');
  }

  /**
   * Add the definitions to each decorated class
   */
  addDefinitions(output: MagicString, analyzedClass: AnalyzedClass, definitions: string): void {
    const classSymbol = this.host.getClassSymbol(analyzedClass.declaration);
    if (!classSymbol) {
      throw new Error(`Analyzed class does not have a valid symbol: ${analyzedClass.name}`);
    }
    const insertionPoint = classSymbol.valueDeclaration !.getEnd();
    output.appendLeft(insertionPoint, '\n' + definitions);
  }

  /**
   * Remove static decorator properties from classes
   */
  removeDecorators(output: MagicString, decoratorsToRemove: Map<ts.Node, ts.Node[]>): void {
    decoratorsToRemove.forEach((nodesToRemove, containerNode) => {
      if (ts.isArrayLiteralExpression(containerNode)) {
        const items = containerNode.elements;
        if (items.length === nodesToRemove.length) {
          // Remove the entire statement
          const statement = findStatement(containerNode);
          if (statement) {
            output.remove(statement.getFullStart(), statement.getEnd());
          }
        } else {
          nodesToRemove.forEach(node => {
            // remove any trailing comma
            const end = (output.slice(node.getEnd(), node.getEnd() + 1) === ',') ?
                node.getEnd() + 1 :
                node.getEnd();
            output.remove(node.getFullStart(), end);
          });
        }
      }
    });
  }

  rewriteSwitchableDeclarations(outputText: MagicString, sourceFile: ts.SourceFile): void {
    const declarations = this.host.getSwitchableDeclarations(sourceFile);
    declarations.forEach(declaration => {
      const start = declaration.initializer.getStart();
      const end = declaration.initializer.getEnd();
      const replacement = declaration.initializer.text.replace(PRE_NGCC_MARKER, POST_NGCC_MARKER);
      outputText.overwrite(start, end, replacement);
    });
  }
}

function findStatement(node: ts.Node) {
  while (node) {
    if (ts.isExpressionStatement(node)) {
      return node;
    }
    node = node.parent;
  }
  return undefined;
}
