/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Tree} from '@angular-devkit/schematics';
import {dirname, relative, resolve} from 'path';
import ts from 'typescript';

import {extractAngularClassMetadata} from './extract_metadata';
import {computeLineStartsMap, getLineAndCharacterFromPosition} from './line_mappings';
import {getPropertyNameText} from './typescript/property_name';

export interface ResolvedTemplate {
  /** Class declaration that contains this template. */
  container: ts.ClassDeclaration;
  /** File content of the given template. */
  content: string;
  /** Start offset of the template content (e.g. in the inline source file) */
  start: number;
  /** Whether the given template is inline or not. */
  inline: boolean;
  /** Path to the file that contains this template. */
  filePath: string;
  /**
   * Gets the character and line of a given position index in the template.
   * If the template is declared inline within a TypeScript source file, the line and
   * character are based on the full source file content.
   */
  getCharacterAndLineOfPosition: (pos: number) => {
    character: number, line: number
  };
}

/**
 * Visitor that can be used to determine Angular templates referenced within given
 * TypeScript source files (inline templates or external referenced templates)
 */
export class NgComponentTemplateVisitor {
  resolvedTemplates: ResolvedTemplate[] = [];

  constructor(public typeChecker: ts.TypeChecker, private _basePath: string, private _tree: Tree) {}

  visitNode(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.ClassDeclaration) {
      this.visitClassDeclaration(node as ts.ClassDeclaration);
    }

    ts.forEachChild(node, n => this.visitNode(n));
  }

  private visitClassDeclaration(node: ts.ClassDeclaration) {
    const metadata = extractAngularClassMetadata(this.typeChecker, node);
    if (metadata === null || metadata.type !== 'component') {
      return;
    }

    const sourceFile = node.getSourceFile();
    const sourceFileName = sourceFile.fileName;

    // Walk through all component metadata properties and determine the referenced
    // HTML templates (either external or inline)
    metadata.node.properties.forEach(property => {
      if (!ts.isPropertyAssignment(property)) {
        return;
      }

      const propertyName = getPropertyNameText(property.name);

      // In case there is an inline template specified, ensure that the value is statically
      // analyzable by checking if the initializer is a string literal-like node.
      if (propertyName === 'template' && ts.isStringLiteralLike(property.initializer)) {
        // Need to add an offset of one to the start because the template quotes are
        // not part of the template content.
        // The `getText()` method gives us the original raw text.
        // We could have used the `text` property, but if the template is defined as a backtick
        // string then the `text` property contains a "cooked" version of the string. Such cooked
        // strings will have converted CRLF characters to only LF. This messes up string
        // replacements in template migrations.
        // The raw text returned by `getText()` includes the enclosing quotes so we change the
        // `content` and `start` values accordingly.
        const content = property.initializer.getText().slice(1, -1);
        const start = property.initializer.getStart() + 1;
        this.resolvedTemplates.push({
          filePath: sourceFileName,
          container: node,
          content,
          inline: true,
          start: start,
          getCharacterAndLineOfPosition: pos =>
              ts.getLineAndCharacterOfPosition(sourceFile, pos + start)
        });
      }
      if (propertyName === 'templateUrl' && ts.isStringLiteralLike(property.initializer)) {
        const templateDiskPath = resolve(dirname(sourceFileName), property.initializer.text);
        // TODO(devversion): Remove this when the TypeScript compiler host is fully virtual
        // relying on the devkit virtual tree and not dealing with disk paths. This is blocked on
        // providing common utilities for schematics/migrations, given this is done in the
        // Angular CDK already:
        // https://github.com/angular/components/blob/3704400ee67e0190c9783e16367587489c803ebc/src/cdk/schematics/update-tool/utils/virtual-host.ts.
        const templateDevkitPath = relative(this._basePath, templateDiskPath);

        // In case the template does not exist in the file system, skip this
        // external template.
        if (!this._tree.exists(templateDevkitPath)) {
          return;
        }

        const fileContent = this._tree.read(templateDevkitPath)!.toString();
        const lineStartsMap = computeLineStartsMap(fileContent);

        this.resolvedTemplates.push({
          filePath: templateDiskPath,
          container: node,
          content: fileContent,
          inline: false,
          start: 0,
          getCharacterAndLineOfPosition: pos => getLineAndCharacterFromPosition(lineStartsMap, pos),
        });
      }
    });
  }
}
