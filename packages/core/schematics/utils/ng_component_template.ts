/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {existsSync, readFileSync} from 'fs';
import {dirname, resolve} from 'path';
import * as ts from 'typescript';

import {computeLineStartsMap, getLineAndCharacterFromPosition} from './line_mappings';
import {getAngularDecorators} from './ng_decorators';
import {unwrapExpression} from './typescript/functions';
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

  constructor(public typeChecker: ts.TypeChecker) {}

  visitNode(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.ClassDeclaration) {
      this.visitClassDeclaration(node as ts.ClassDeclaration);
    }

    ts.forEachChild(node, n => this.visitNode(n));
  }

  private visitClassDeclaration(node: ts.ClassDeclaration) {
    if (!node.decorators || !node.decorators.length) {
      return;
    }

    const ngDecorators = getAngularDecorators(this.typeChecker, node.decorators);
    const componentDecorator = ngDecorators.find(dec => dec.name === 'Component');

    // In case no "@Component" decorator could be found on the current class, skip.
    if (!componentDecorator) {
      return;
    }

    const decoratorCall = componentDecorator.node.expression;

    // In case the component decorator call is not valid, skip this class declaration.
    if (decoratorCall.arguments.length !== 1) {
      return;
    }

    const componentMetadata = unwrapExpression(decoratorCall.arguments[0]);

    // Ensure that the component metadata is an object literal expression.
    if (!ts.isObjectLiteralExpression(componentMetadata)) {
      return;
    }

    const sourceFile = node.getSourceFile();
    const sourceFileName = sourceFile.fileName;

    // Walk through all component metadata properties and determine the referenced
    // HTML templates (either external or inline)
    componentMetadata.properties.forEach(property => {
      if (!ts.isPropertyAssignment(property)) {
        return;
      }

      const propertyName = getPropertyNameText(property.name);

      // In case there is an inline template specified, ensure that the value is statically
      // analyzable by checking if the initializer is a string literal-like node.
      if (propertyName === 'template' && ts.isStringLiteralLike(property.initializer)) {
        // Need to add an offset of one to the start because the template quotes are
        // not part of the template content.
        const templateStartIdx = property.initializer.getStart() + 1;
        const filePath = resolve(sourceFileName);
        this.resolvedTemplates.push({
          filePath: filePath,
          container: node,
          content: property.initializer.text,
          inline: true,
          start: templateStartIdx,
          getCharacterAndLineOfPosition: pos =>
              ts.getLineAndCharacterOfPosition(sourceFile, pos + templateStartIdx)
        });
      }
      if (propertyName === 'templateUrl' && ts.isStringLiteralLike(property.initializer)) {
        const templatePath = resolve(dirname(sourceFileName), property.initializer.text);

        // In case the template does not exist in the file system, skip this
        // external template.
        if (!existsSync(templatePath)) {
          return;
        }

        const fileContent = readFileSync(templatePath, 'utf8');
        const lineStartsMap = computeLineStartsMap(fileContent);

        this.resolvedTemplates.push({
          filePath: templatePath,
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
