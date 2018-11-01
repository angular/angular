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
import {isStringLiteralLike} from '../typescript/literal';
import {createComponentFile, ExternalResource} from './component-file';
import {ExternalFailureWalker} from './external-failure-walker';

/**
 * Custom TSLint rule walker that identifies Angular components and visits specific parts of
 * the component metadata.
 */
export class ComponentWalker extends ExternalFailureWalker {

  visitInlineTemplate(_template: ts.StringLiteralLike) {}
  visitInlineStylesheet(_stylesheet: ts.StringLiteralLike) {}

  visitExternalTemplate(_template: ExternalResource) {}
  visitExternalStylesheet(_stylesheet: ExternalResource) {}

  /**
   * We keep track of all visited stylesheet files because we allow manually reporting external
   * stylesheets which couldn't be detected by the component walker. Reporting these files multiple
   * times will result in duplicated TSLint failures and replacements.
   */
  private _visitedStylesheetFiles: Set<string> = new Set<string>();

  visitNode(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.CallExpression) {
      const callExpression = node as ts.CallExpression;
      const callExpressionName = callExpression.expression.getText();

      if (callExpressionName === 'Component' || callExpressionName === 'Directive') {
        this._visitDirectiveCallExpression(callExpression);
      }
    }

    super.visitNode(node);
  }

  private _visitDirectiveCallExpression(callExpression: ts.CallExpression) {
    // If the call expressions does not have the correct amount of arguments, we can assume that
    // this call expression is not related to Angular and just uses a similar decorator name.
    if (callExpression.arguments.length !== 1) {
      return;
    }

    const directiveMetadata = this._findMetadataFromExpression(callExpression.arguments[0]);

    if (!directiveMetadata) {
      return;
    }

    for (const property of directiveMetadata.properties as ts.NodeArray<ts.PropertyAssignment>) {
      const propertyName = property.name.getText();

      if (propertyName === 'template' && isStringLiteralLike(property.initializer)) {
        this.visitInlineTemplate(property.initializer);
      }

      if (propertyName === 'templateUrl' && isStringLiteralLike(property.initializer)) {
        this._reportExternalTemplate(property.initializer);
      }

      if (propertyName === 'styles' && ts.isArrayLiteralExpression(property.initializer)) {
        this._reportInlineStyles(property.initializer);
      }

      if (propertyName === 'styleUrls' && ts.isArrayLiteralExpression(property.initializer)) {
        this._visitExternalStylesArrayLiteral(property.initializer);
      }
    }
  }

  private _reportExternalTemplate(node: ts.StringLiteralLike) {
    const templatePath = resolve(dirname(this.getSourceFile().fileName), node.text);

    // Check if the external template file exists before proceeding.
    if (!existsSync(templatePath)) {
      this._createResourceNotFoundFailure(node, templatePath);
      return;
    }

    // Create a fake TypeScript source file that includes the template content.
    const templateFile = createComponentFile(templatePath, readFileSync(templatePath, 'utf8'));

    this.visitExternalTemplate(templateFile);
  }

  private _reportInlineStyles(expression: ts.ArrayLiteralExpression) {
    expression.elements.forEach(node => {
      if (isStringLiteralLike(node)) {
        this.visitInlineStylesheet(node);
      }
    });
  }

  private _visitExternalStylesArrayLiteral(expression: ts.ArrayLiteralExpression) {
    expression.elements.forEach(node => {
      if (isStringLiteralLike(node)) {
        const stylePath = resolve(dirname(this.getSourceFile().fileName), node.text);

        // Check if the external stylesheet file exists before proceeding.
        if (!existsSync(stylePath)) {
          return this._createResourceNotFoundFailure(node, stylePath);
        }

        this._reportExternalStyle(stylePath);
      }
    });
  }

  private _reportExternalStyle(stylePath: string) {
    // Keep track of all reported external stylesheets because we allow reporting additional
    // stylesheet files which couldn't be detected by the component walker. This allows us to
    // ensure that no stylesheet files are visited multiple times.
    if (this._visitedStylesheetFiles.has(stylePath)) {
      return;
    }

    this._visitedStylesheetFiles.add(stylePath);

    // Create a fake TypeScript source file that includes the stylesheet content.
    const stylesheetFile = createComponentFile(stylePath, readFileSync(stylePath, 'utf8'));

    this.visitExternalStylesheet(stylesheetFile);
  }

  /**
   * Recursively searches for the metadata object literal expression inside of a directive call
   * expression. Since expression calls can be nested through *parenthesized* expressions, we
   * need to recursively visit and check every expression inside of a parenthesized expression.
   *
   * e.g. @Component((({myMetadataExpression}))) will return `myMetadataExpression`.
   */
  private _findMetadataFromExpression(node: ts.Expression): ts.ObjectLiteralExpression | null {
    if (node.kind === ts.SyntaxKind.ObjectLiteralExpression) {
      return node as ts.ObjectLiteralExpression;
    } else if (node.kind === ts.SyntaxKind.ParenthesizedExpression) {
      return this._findMetadataFromExpression((node as ts.ParenthesizedExpression).expression);
    }

    return null;
  }

  /**
   * Creates a TSLint failure that reports that the resource file that belongs to the specified
   * TypeScript node could not be resolved in the file system.
   */
  private _createResourceNotFoundFailure(node: ts.Node, resourceUrl: string) {
    this.addFailureAtNode(node, `Could not resolve resource file: "${resourceUrl}". ` +
        `Skipping automatic upgrade for this file.`);
  }

  /** Reports the specified additional stylesheets. */
  _reportExtraStylesheetFiles(filePaths: string[]) {
    filePaths.forEach(filePath => this._reportExternalStyle(resolve(filePath)));
  }
}
