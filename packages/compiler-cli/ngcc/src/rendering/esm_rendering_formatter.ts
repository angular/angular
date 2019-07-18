/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import MagicString from 'magic-string';
import * as ts from 'typescript';
import {relative, dirname, AbsoluteFsPath, absoluteFromSourceFile} from '../../../src/ngtsc/file_system';
import {Import, ImportManager} from '../../../src/ngtsc/translator';
import {isDtsPath} from '../../../src/ngtsc/util/src/typescript';
import {CompiledClass} from '../analysis/types';
import {NgccReflectionHost, POST_R3_MARKER, PRE_R3_MARKER, SwitchableVariableDeclaration} from '../host/ngcc_host';
import {ModuleWithProvidersInfo} from '../analysis/module_with_providers_analyzer';
import {ExportInfo} from '../analysis/private_declarations_analyzer';
import {RenderingFormatter, RedundantDecoratorMap} from './rendering_formatter';
import {stripExtension} from './utils';

/**
 * A RenderingFormatter that works with ECMAScript Module import and export statements.
 */
export class EsmRenderingFormatter implements RenderingFormatter {
  constructor(protected host: NgccReflectionHost, protected isCore: boolean) {}

  /**
   *  Add the imports at the top of the file, after any imports that are already there.
   */
  addImports(output: MagicString, imports: Import[], sf: ts.SourceFile): void {
    const insertionPoint = this.findEndOfImports(sf);
    const renderedImports =
        imports.map(i => `import * as ${i.qualifier} from '${i.specifier}';\n`).join('');
    output.appendLeft(insertionPoint, renderedImports);
  }

  /**
   * Add the exports to the end of the file.
   */
  addExports(
      output: MagicString, entryPointBasePath: AbsoluteFsPath, exports: ExportInfo[],
      importManager: ImportManager, file: ts.SourceFile): void {
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

  /**
   * Add the constants directly after the imports.
   */
  addConstants(output: MagicString, constants: string, file: ts.SourceFile): void {
    if (constants === '') {
      return;
    }
    const insertionPoint = this.findEndOfImports(file);

    // Append the constants to the right of the insertion point, to ensure they get ordered after
    // added imports (those are appended left to the insertion point).
    output.appendRight(insertionPoint, '\n' + constants + '\n');
  }

  /**
   * Add the definitions directly after their decorated class.
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
   * Remove static decorator properties from classes.
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

  /**
   * Rewrite the the IVY switch markers to indicate we are in IVY mode.
   */
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


  /**
   * Add the type parameters to the appropriate functions that return `ModuleWithProviders`
   * structures.
   *
   * This function will only get called on typings files.
   */
  addModuleWithProvidersParams(
      outputText: MagicString, moduleWithProviders: ModuleWithProvidersInfo[],
      importManager: ImportManager): void {
    moduleWithProviders.forEach(info => {
      const ngModuleName = info.ngModule.node.name.text;
      const declarationFile = absoluteFromSourceFile(info.declaration.getSourceFile());
      const ngModuleFile = absoluteFromSourceFile(info.ngModule.node.getSourceFile());
      const importPath = info.ngModule.viaModule ||
          (declarationFile !== ngModuleFile ?
               stripExtension(`./${relative(dirname(declarationFile), ngModuleFile)}`) :
               null);
      const ngModule = generateImportString(importManager, importPath, ngModuleName);

      if (info.declaration.type) {
        const typeName = info.declaration.type && ts.isTypeReferenceNode(info.declaration.type) ?
            info.declaration.type.typeName :
            null;
        if (this.isCoreModuleWithProvidersType(typeName)) {
          // The declaration already returns `ModuleWithProvider` but it needs the `NgModule` type
          // parameter adding.
          outputText.overwrite(
              info.declaration.type.getStart(), info.declaration.type.getEnd(),
              `ModuleWithProviders<${ngModule}>`);
        } else {
          // The declaration returns an unknown type so we need to convert it to a union that
          // includes the ngModule property.
          const originalTypeString = info.declaration.type.getText();
          outputText.overwrite(
              info.declaration.type.getStart(), info.declaration.type.getEnd(),
              `(${originalTypeString})&{ngModule:${ngModule}}`);
        }
      } else {
        // The declaration has no return type so provide one.
        const lastToken = info.declaration.getLastToken();
        const insertPoint = lastToken && lastToken.kind === ts.SyntaxKind.SemicolonToken ?
            lastToken.getStart() :
            info.declaration.getEnd();
        outputText.appendLeft(
            insertPoint,
            `: ${generateImportString(importManager, '@angular/core', 'ModuleWithProviders')}<${ngModule}>`);
      }
    });
  }

  protected findEndOfImports(sf: ts.SourceFile): number {
    for (const stmt of sf.statements) {
      if (!ts.isImportDeclaration(stmt) && !ts.isImportEqualsDeclaration(stmt) &&
          !ts.isNamespaceImport(stmt)) {
        return stmt.getStart();
      }
    }
    return 0;
  }



  /**
   * Check whether the given type is the core Angular `ModuleWithProviders` interface.
   * @param typeName The type to check.
   * @returns true if the type is the core Angular `ModuleWithProviders` interface.
   */
  private isCoreModuleWithProvidersType(typeName: ts.EntityName|null) {
    const id =
        typeName && ts.isIdentifier(typeName) ? this.host.getImportOfIdentifier(typeName) : null;
    return (
        id && id.name === 'ModuleWithProviders' && (this.isCore || id.from === '@angular/core'));
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

function generateImportString(
    importManager: ImportManager, importPath: string | null, importName: string) {
  const importAs = importPath ? importManager.generateNamedImport(importPath, importName) : null;
  return importAs ? `${importAs.moduleImport}.${importAs.symbol}` : `${importName}`;
}
