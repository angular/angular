/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {dirname, relative} from 'canonical-path';
import MagicString from 'magic-string';
import * as ts from 'typescript';
import {NgccReflectionHost, POST_R3_MARKER, PRE_R3_MARKER, SwitchableVariableDeclaration} from '../host/ngcc_host';
import {CompiledClass} from '../analysis/decoration_analyzer';
import {RedundantDecoratorMap, Renderer, stripExtension} from './renderer';
import {EntryPointBundle} from '../packages/entry_point_bundle';
import {ExportInfo} from '../analysis/private_declarations_analyzer';
import {isDtsPath} from '../../../src/ngtsc/util/src/typescript';
import {Logger} from '../logging/logger';

export class EsmRenderer extends Renderer {
  constructor(
      logger: Logger, host: NgccReflectionHost, isCore: boolean, bundle: EntryPointBundle,
      sourcePath: string) {
    super(logger, host, isCore, bundle, sourcePath);
  }

  /**
   *  Add the imports at the top of the file
   */
  addImports(
      output: MagicString, imports: {specifier: string; qualifier: string;}[],
      sf: ts.SourceFile): void {
    const insertionPoint = findEndOfImports(sf);
    const renderedImports =
        imports.map(i => `import * as ${i.qualifier} from '${i.specifier}';\n`).join('');
    output.appendLeft(insertionPoint, renderedImports);
  }

  addExports(output: MagicString, entryPointBasePath: string, exports: ExportInfo[]): void {
    exports.forEach(e => {
      let exportFrom = '';
      const isDtsFile = isDtsPath(entryPointBasePath);
      const from = isDtsFile ? e.dtsFrom : e.from;

      if (from) {
        const basePath = stripExtension(from);
        const relativePath = './' + relative(dirname(entryPointBasePath), basePath);
        exportFrom = entryPointBasePath !== basePath ? ` from '${relativePath}'` : '';
      }

      // aliases should only be added in dts files as these are lost when rolling up dts file.
      const exportStatement = e.alias && isDtsFile ? `${e.alias} as ${e.identifier}` : e.identifier;
      const exportStr = `\nexport {${exportStatement}}${exportFrom};`;
      output.append(exportStr);
    });
  }

  addConstants(output: MagicString, constants: string, file: ts.SourceFile): void {
    if (constants === '') {
      return;
    }
    const insertionPoint = findEndOfImports(file);

    // Append the constants to the right of the insertion point, to ensure they get ordered after
    // added imports (those are appended left to the insertion point).
    output.appendRight(insertionPoint, '\n' + constants + '\n');
  }

  /**
   * Add the definitions to each decorated class
   */
  addDefinitions(output: MagicString, compiledClass: CompiledClass, definitions: string): void {
    const classSymbol = this.host.getClassSymbol(compiledClass.declaration);
    if (!classSymbol) {
      throw new Error(`Compiled class does not have a valid symbol: ${compiledClass.name}`);
    }
    const insertionPoint = classSymbol.valueDeclaration !.getEnd();
    output.appendLeft(insertionPoint, '\n' + definitions);
  }

  /**
   * Remove static decorator properties from classes
   */
  removeDecorators(output: MagicString, decoratorsToRemove: RedundantDecoratorMap): void {
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

  rewriteSwitchableDeclarations(
      outputText: MagicString, sourceFile: ts.SourceFile,
      declarations: SwitchableVariableDeclaration[]): void {
    declarations.forEach(declaration => {
      const start = declaration.initializer.getStart();
      const end = declaration.initializer.getEnd();
      const replacement = declaration.initializer.text.replace(PRE_R3_MARKER, POST_R3_MARKER);
      outputText.overwrite(start, end, replacement);
    });
  }
}

function findEndOfImports(sf: ts.SourceFile): number {
  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt) && !ts.isImportEqualsDeclaration(stmt) &&
        !ts.isNamespaceImport(stmt)) {
      return stmt.getStart();
    }
  }

  return 0;
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
