/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentWalker, ExternalResource} from '@angular/cdk/schematics';
import {Replacement, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {
  convertSpeedFactorToDuration,
  createSpeedFactorConvertExpression,
} from './ripple-speed-factor';

/** Regular expression that matches [matRippleSpeedFactor]="$NUMBER" in templates. */
const speedFactorNumberRegex = /\[matRippleSpeedFactor]="(\d+(?:\.\d+)?)"/g;

/** Regular expression that matches [matRippleSpeedFactor]="$NOT_A_NUMBER" in templates. */
const speedFactorNotParseable = /\[matRippleSpeedFactor]="(?!\d+(?:\.\d+)?")(.*)"/g;

/** Failure message that will be shown if a speed factor is set to a readable number. */
const failureMessageReadableNumber =
  'Detected deprecated [matRippleSpeedFactor] input binding with readable number.';

/** Failure message that will be shown if a speed factor is set to a non-parseable value. */
const failureMessageNonParseableValue =
  'Detected deprecated [matRippleSpeedFactor] input binding with non-parseable value.';

/**
 * Rule that walks through every inline or external template and updates the deprecated
 * [matRippleSpeedFactor] to [matRippleAnimation].
 */
export class Rule extends Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

export class Walker extends ComponentWalker {

  visitInlineTemplate(node: ts.StringLiteralLike) {
    this._createReplacementsForContent(node, node.getText()).forEach(data => {
      this.addFailureAtReplacement(data.failureMessage, data.replacement);
    });
  }

  visitExternalTemplate(node: ExternalResource) {
    this._createReplacementsForContent(node, node.getText()).forEach(data => {
      this.addExternalFailureAtReplacement(node, data.failureMessage, data.replacement);
    });
  }

  private _createReplacementsForContent(node: ts.Node, templateText: string) {
    const replacements: {failureMessage: string, replacement: Replacement}[] = [];
    const startPos = node.getStart();

    let match: RegExpMatchArray | null;

    while ((match = speedFactorNumberRegex.exec(templateText)) !== null) {
      const newEnterDuration = convertSpeedFactorToDuration(parseFloat(match[1]));
      const fix = this.createReplacement(startPos + match.index!, match[0].length,
          `[matRippleAnimation]="{enterDuration: ${newEnterDuration}}"`);

      replacements.push({
        replacement: fix,
        failureMessage: failureMessageReadableNumber,
      });
    }

    while ((match = speedFactorNotParseable.exec(templateText)) !== null) {
      const newDurationExpression = createSpeedFactorConvertExpression(match[1]);
      const fix = this.createReplacement(startPos + match.index!, match[0].length,
          `[matRippleAnimation]="{enterDuration: (${newDurationExpression})}"`);

      replacements.push({
        replacement: fix,
        failureMessage: failureMessageNonParseableValue,
      });
    }

    return replacements;
  }
}
