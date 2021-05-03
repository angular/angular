/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {UpdateRecorder} from './update_recorder';


const RELATIVE_LINK_RESOLUTION = 'relativeLinkResolution';

export class RelativeLinkResolutionTransform {
  private printer = ts.createPrinter();

  constructor(private getUpdateRecorder: (sf: ts.SourceFile) => UpdateRecorder) {}

  /** Migrate the ExtraOptions#RelativeLinkResolution property assignments. */
  migrateRouterModuleForRootCalls(calls: ts.CallExpression[]) {
    calls.forEach(c => {
      this._updateCallExpressionWithoutExtraOptions(c);
    });
  }

  migrateObjectLiterals(vars: ts.ObjectLiteralExpression[]) {
    vars.forEach(v => this._maybeUpdateLiteral(v));
  }

  private _updateCallExpressionWithoutExtraOptions(callExpression: ts.CallExpression) {
    const args = callExpression.arguments;
    const emptyLiteral = ts.createObjectLiteral();
    const newNode = ts.updateCall(
        callExpression, callExpression.expression, callExpression.typeArguments,
        [args[0], this._getMigratedLiteralExpression(emptyLiteral)]);
    this._updateNode(callExpression, newNode);
  }

  private _getMigratedLiteralExpression(literal: ts.ObjectLiteralExpression) {
    if (literal.properties.some(
            prop => ts.isPropertyAssignment(prop) &&
                prop.name.getText() === RELATIVE_LINK_RESOLUTION)) {
      // literal already defines a value for relativeLinkResolution. Skip it
      return literal;
    }
    const legacyExpression =
        ts.createPropertyAssignment(RELATIVE_LINK_RESOLUTION, ts.createIdentifier(`'legacy'`));
    return ts.updateObjectLiteral(literal, [...literal.properties, legacyExpression]);
  }

  private _maybeUpdateLiteral(literal: ts.ObjectLiteralExpression) {
    const updatedLiteral = this._getMigratedLiteralExpression(literal);
    if (updatedLiteral !== literal) {
      this._updateNode(literal, updatedLiteral);
    }
  }

  private _updateNode(node: ts.Node, newNode: ts.Node) {
    const newText = this.printer.printNode(ts.EmitHint.Unspecified, newNode, node.getSourceFile());
    const recorder = this.getUpdateRecorder(node.getSourceFile());
    recorder.updateNode(node, newText);
  }
}
