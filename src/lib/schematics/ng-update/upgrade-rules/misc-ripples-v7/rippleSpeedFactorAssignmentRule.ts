/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bold, red} from 'chalk';
import {ProgramAwareRuleWalker, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {
  convertSpeedFactorToDuration,
  createSpeedFactorConvertExpression,
} from './ripple-speed-factor';

/**
 * Note that will be added whenever a speed factor expression has been converted to calculate
 * the according duration. This note should encourage people to clean up their code by switching
 * away from the speed factors to explicit durations.
 */
const removeNote = `TODO: Cleanup duration calculation.`;

/**
 * Rule that walks through every property assignment and switches the global `baseSpeedFactor`
 * ripple option to the new global animation config. Also updates every class member assignment
 * that refers to MatRipple#speedFactor.
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

export class Walker extends ProgramAwareRuleWalker {

  /** Switches binary expressions (e.g. myRipple.speedFactor = 0.5) to the new animation config. */
  visitBinaryExpression(expression: ts.BinaryExpression) {
    if (!ts.isPropertyAccessExpression(expression.left)) {
      return;
    }

    // Left side expression consists of target object and property name (e.g. myInstance.val)
    const leftExpression = expression.left as ts.PropertyAccessExpression;
    const targetTypeNode = this.getTypeChecker().getTypeAtLocation(leftExpression.expression);

    if (!targetTypeNode.symbol) {
      return;
    }

    const targetTypeName = targetTypeNode.symbol.getName();
    const propertyName = leftExpression.name.getText();

    if (targetTypeName === 'MatRipple' && propertyName === 'speedFactor') {
      if (ts.isNumericLiteral(expression.right)) {
        const numericValue = parseFloat(expression.right.text);
        const newEnterDurationValue = convertSpeedFactorToDuration(numericValue);

        // Replace the `speedFactor` property name with `animation`.
        const propertyNameReplacement = this.createReplacement(leftExpression.name.getStart(),
            leftExpression.name.getWidth(), 'animation');

        // Replace the value assignment with the new animation config.
        const rightExpressionReplacement = this.createReplacement(expression.right.getStart(),
            expression.right.getWidth(), `{enterDuration: ${newEnterDurationValue}}`);

        this.addFailureAtNode(expression,
            `Found deprecated variable assignment for "${bold('MatRipple')}#${red('speedFactor')}"`,
            [propertyNameReplacement, rightExpressionReplacement]);
      } else {
        // Handle the right expression differently if the previous speed factor value can't
        // be resolved statically. In that case, we just create a TypeScript expression that
        // calculates the explicit duration based on the non-static speed factor expression.
        const newExpression = createSpeedFactorConvertExpression(expression.right.getText());

        // Replace the `speedFactor` property name with `animation`.
        const propertyNameReplacement = this.createReplacement(leftExpression.name.getStart(),
            leftExpression.name.getWidth(), 'animation');

        // Replace the value assignment with the new animation config and remove TODO.
        const rightExpressionReplacement = this.createReplacement(expression.right.getStart(),
            expression.right.getWidth(), `/** ${removeNote} */ {enterDuration: ${newExpression}}`);

        this.addFailureAtNode(expression,
            `Found deprecated variable assignment for "${bold('MatRipple')}#${red('speedFactor')}"`,
            [propertyNameReplacement, rightExpressionReplacement]);
      }
    }
  }

  /**
   * Switches a potential global option `baseSpeedFactor` to the new animation config. For this
   * we assume that the `baseSpeedFactor` is not used in combination with individual speed factors.
   */
  visitPropertyAssignment(assignment: ts.PropertyAssignment) {
    // For switching the `baseSpeedFactor` global option we expect the property assignment
    // to be inside of a normal object literal. Custom ripple global options cannot be switched
    // automatically.
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

    if (ts.isNumericLiteral(initializer)) {
      const numericValue = parseFloat(initializer.text);
      const newEnterDurationValue = convertSpeedFactorToDuration(numericValue);

      const keyNameReplacement = this.createReplacement(name.getStart(),
          assignment.name.getWidth(), `animation`);

      const initializerReplacement = this.createReplacement(initializer.getStart(),
          initializer.getWidth(), `{enterDuration: ${newEnterDurationValue}}`);

      this.addFailureAtNode(assignment,
          `Found deprecated property assignment for "${bold('MAT_RIPPLE_GLOBAL_OPTIONS')}:` +
          `${red('baseSpeedFactor')}"`,
          [keyNameReplacement, initializerReplacement]);
    } else {
      // Handle the right expression differently if the previous speed factor value can't
      // be resolved statically. In that case, we just create a TypeScript expression that
      // calculates the explicit duration based on the non-static speed factor expression.
      const newExpression = createSpeedFactorConvertExpression(initializer.getText());

      // Replace the `baseSpeedFactor` property name with `animation`.
      const propertyNameReplacement = this.createReplacement(name.getStart(),
          name.getWidth(), 'animation');

      // Replace the value assignment with the new animation config and remove TODO.
      const rightExpressionReplacement = this.createReplacement(initializer.getStart(),
          initializer.getWidth(), `/** ${removeNote} */ {enterDuration: ${newExpression}}`);

      this.addFailureAtNode(assignment,
          `Found a deprecated property assignment for "${bold('MAT_RIPPLE_GLOBAL_OPTIONS')}:` +
          `${red('baseSpeedFactor')}.`,
          [propertyNameReplacement, rightExpressionReplacement]);
    }
  }
}
