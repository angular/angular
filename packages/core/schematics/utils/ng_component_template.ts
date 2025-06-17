/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {extractAngularClassMetadata} from './extract_metadata';
import {computeLineStartsMap, getLineAndCharacterFromPosition} from './line_mappings';
import {getPropertyNameText} from './typescript/property_name';
import {AbsoluteFsPath, getFileSystem} from '@angular/compiler-cli';

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
  filePath: string | AbsoluteFsPath;
  /**
   * Gets the character and line of a given position index in the template.
   * If the template is declared inline within a TypeScript source file, the line and
   * character are based on the full source file content.
   */
  getCharacterAndLineOfPosition: (pos: number) => {
    character: number;
    line: number;
  };
}

/**
 * Visitor that can be used to determine Angular templates referenced within given
 * TypeScript source files (inline templates or external referenced templates)
 */
export class NgComponentTemplateVisitor {
  resolvedTemplates: ResolvedTemplate[] = [];

  private fs = getFileSystem();

  constructor(public typeChecker: ts.TypeChecker) {}

  visitNode(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.ClassDeclaration) {
      this.visitClassDeclaration(node as ts.ClassDeclaration);
    }

    ts.forEachChild(node, (n) => this.visitNode(n));
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
    metadata.node.properties.forEach((property) => {
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
          getCharacterAndLineOfPosition: (pos) =>
            ts.getLineAndCharacterOfPosition(sourceFile, pos + start),
        });
      }
      if (propertyName === 'templateUrl' && ts.isStringLiteralLike(property.initializer)) {
        const absolutePath = this.fs.resolve(
          this.fs.dirname(sourceFileName),
          property.initializer.text,
        );
        if (!this.fs.exists(absolutePath)) {
          return;
        }

        const fileContent = this.fs.readFile(absolutePath);
        const lineStartsMap = computeLineStartsMap(fileContent);

        this.resolvedTemplates.push({
          filePath: absolutePath,
          container: node,
          content: fileContent,
          inline: false,
          start: 0,
          getCharacterAndLineOfPosition: (pos) =>
            getLineAndCharacterFromPosition(lineStartsMap, pos),
        });
      }
    });
  }
}
