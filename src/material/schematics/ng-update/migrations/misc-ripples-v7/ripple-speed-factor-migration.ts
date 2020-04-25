/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Migration, ResolvedResource, TargetVersion} from '@angular/cdk/schematics';
import * as ts from 'typescript';
import {
  convertSpeedFactorToDuration,
  createSpeedFactorConvertExpression,
} from './ripple-speed-factor';

/** Regular expression that matches [matRippleSpeedFactor]="$NUMBER" in templates. */
const speedFactorNumberRegex = /\[matRippleSpeedFactor]="(\d+(?:\.\d+)?)"/g;

/** Regular expression that matches [matRippleSpeedFactor]="$NOT_A_NUMBER" in templates. */
const speedFactorNotParseable = /\[matRippleSpeedFactor]="(?!\d+(?:\.\d+)?")(.*)"/g;

/**
 * Note that will be added whenever a speed factor expression has been converted to calculate
 * the according duration. This note should encourage people to clean up their code by switching
 * away from the speed factors to explicit durations.
 */
const removeNote = `TODO: Cleanup duration calculation.`;

/**
 * Migration that walks through every property assignment and switches the global `baseSpeedFactor`
 * ripple option to the new global animation config. Also updates every class member assignment
 * that refers to MatRipple#speedFactor.
 */
export class RippleSpeedFactorMigration extends Migration<null> {

  // Only enable this rule if the migration targets version 7 as the ripple
  // speed factor has been removed in that version.
  enabled = this.targetVersion === TargetVersion.V7;

  visitNode(node: ts.Node): void {
    if (ts.isBinaryExpression(node)) {
      this._visitBinaryExpression(node);
    } else if (ts.isPropertyAssignment(node)) {
      this._visitPropertyAssignment(node);
    }
  }

  visitTemplate(template: ResolvedResource): void {
    let match: RegExpMatchArray|null;

    while ((match = speedFactorNumberRegex.exec(template.content)) !== null) {
      const newEnterDuration = convertSpeedFactorToDuration(parseFloat(match[1]));

      this._replaceText(
          template.filePath, template.start + match.index!, match[0].length,
          `[matRippleAnimation]="{enterDuration: ${newEnterDuration}}"`);
    }

    while ((match = speedFactorNotParseable.exec(template.content)) !== null) {
      const newDurationExpression = createSpeedFactorConvertExpression(match[1]);
      this._replaceText(
          template.filePath, template.start + match.index!, match[0].length,
          `[matRippleAnimation]="{enterDuration: (${newDurationExpression})}"`);
    }
  }

  /** Switches binary expressions (e.g. myRipple.speedFactor = 0.5) to the new animation config. */
  private _visitBinaryExpression(expression: ts.BinaryExpression) {
    if (!ts.isPropertyAccessExpression(expression.left)) {
      return;
    }

    // Left side expression consists of target object and property name (e.g. myInstance.val)
    const leftExpression = expression.left as ts.PropertyAccessExpression;
    const targetTypeNode = this.typeChecker.getTypeAtLocation(leftExpression.expression);

    if (!targetTypeNode.symbol) {
      return;
    }

    const targetTypeName = targetTypeNode.symbol.getName();
    const propertyName = leftExpression.name.getText();
    const filePath = leftExpression.getSourceFile().fileName;

    if (targetTypeName === 'MatRipple' && propertyName === 'speedFactor') {
      if (ts.isNumericLiteral(expression.right)) {
        const numericValue = parseFloat(expression.right.text);
        const newEnterDurationValue = convertSpeedFactorToDuration(numericValue);

        // Replace the `speedFactor` property name with `animation`.
        this._replaceText(
            filePath, leftExpression.name.getStart(), leftExpression.name.getWidth(), 'animation');

        // Replace the value assignment with the new animation config.
        this._replaceText(
            filePath, expression.right.getStart(), expression.right.getWidth(),
            `{enterDuration: ${newEnterDurationValue}}`);
      } else {
        // Handle the right expression differently if the previous speed factor value can't
        // be resolved statically. In that case, we just create a TypeScript expression that
        // calculates the explicit duration based on the non-static speed factor expression.
        const newExpression = createSpeedFactorConvertExpression(expression.right.getText());

        // Replace the `speedFactor` property name with `animation`.
        this._replaceText(
            filePath, leftExpression.name.getStart(), leftExpression.name.getWidth(), 'animation');

        // Replace the value assignment with the new animation config and remove TODO.
        this._replaceText(
            filePath, expression.right.getStart(), expression.right.getWidth(),
            `/** ${removeNote} */ {enterDuration: ${newExpression}}`);
      }
    }
  }

  /**
   * Switches the global option `baseSpeedFactor` to the new animation config. For this
   * we assume that the `baseSpeedFactor` is not used in combination with individual
   * speed factors.
   */
  private _visitPropertyAssignment(assignment: ts.PropertyAssignment) {
    // For switching the `baseSpeedFactor` global option we expect the property assignment
    // to be inside of a normal object literal. Custom ripple global options cannot be
    // witched automatically.
    if (!ts.isObjectLiteralExpression(assignment.parent)) {
      return;
    }

    // The assignment consists of a name (key) and initializer (value).
    if (assignment.name.getText() !== 'baseSpeedFactor') {
      return;
    }

    // We could technically lazily check for the MAT_RIPPLE_GLOBAL_OPTIONS injection token to
    // be present, but it's not right to assume that everyone sets the ripple global options
    // immediately in the provider object (e.g. it can happen that someone just imports the
    // config from a separate file).

    const {initializer, name} = assignment;
    const filePath = assignment.getSourceFile().fileName;

    if (ts.isNumericLiteral(initializer)) {
      const numericValue = parseFloat(initializer.text);
      const newEnterDurationValue = convertSpeedFactorToDuration(numericValue);

      // Replace the `baseSpeedFactor` property name with `animation`.
      this._replaceText(filePath, name.getStart(), name.getWidth(), 'animation');
      // Replace the value assignment initializer with the new animation config.
      this._replaceText(
          filePath, initializer.getStart(), initializer.getWidth(),
          `{enterDuration: ${newEnterDurationValue}}`);
    } else {
      // Handle the right expression differently if the previous speed factor value can't
      // be resolved statically. In that case, we just create a TypeScript expression that
      // calculates the explicit duration based on the non-static speed factor expression.
      const newExpression = createSpeedFactorConvertExpression(initializer.getText());

      // Replace the `baseSpeedFactor` property name with `animation`.
      this._replaceText(filePath, name.getStart(), name.getWidth(), 'animation');

      // Replace the value assignment with the new animation config and remove TODO.
      this._replaceText(
          filePath, initializer.getStart(), initializer.getWidth(),
          `/** ${removeNote} */ {enterDuration: ${newExpression}}`);
    }
  }

  private _replaceText(filePath: string, start: number, width: number, newText: string) {
    const recorder = this.fileSystem.edit(filePath);
    recorder.remove(start, width);
    recorder.insertRight(start, newText);
  }
}
