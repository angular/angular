/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  BindingType,
  ParseSourceSpan,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstComponent,
  TmplAstDirective,
  TmplAstElement,
  TmplAstTemplate,
  TmplAstTextAttribute,
} from '@angular/compiler';
import ts from 'typescript';
import {TcbDirectiveMetadata} from '../../api';
import {ClassPropertyName} from '../../../metadata';
import {Reference} from '../../../imports';
import {Context} from './context';
import {tsCastToAny} from '../ts_util';

export interface TcbBoundAttribute {
  value: AST | string;
  sourceSpan: ParseSourceSpan;
  keySpan: ParseSourceSpan | null;
  inputs: {
    fieldName: ClassPropertyName;
    required: boolean;
    isSignal: boolean;
    transformType?: ts.TypeNode;
    isTwoWayBinding: boolean;
  }[];
}

/**
 * An input binding that corresponds with a field of a directive.
 */
export interface TcbDirectiveBoundInput {
  type: 'binding';

  /**
   * The name of a field on the directive that is set.
   */
  field: string;

  /**
   * The `ts.Expression` corresponding with the input binding expression.
   */
  expression: ts.Expression;

  /**
   * The source span of the full attribute binding.
   */
  sourceSpan: ParseSourceSpan;

  /**
   * Whether the binding is part of a two-way binding.
   */
  isTwoWayBinding: boolean;
}

/**
 * Indicates that a certain field of a directive does not have a corresponding input binding.
 */
export interface TcbDirectiveUnsetInput {
  type: 'unset';

  /**
   * The name of a field on the directive for which no input binding is present.
   */
  field: string;
}

export type TcbDirectiveInput = TcbDirectiveBoundInput | TcbDirectiveUnsetInput;

export function getBoundAttributes(
  directive: TcbDirectiveMetadata,
  node: TmplAstTemplate | TmplAstElement | TmplAstComponent | TmplAstDirective,
): TcbBoundAttribute[] {
  const boundInputs: TcbBoundAttribute[] = [];

  const processAttribute = (attr: TmplAstBoundAttribute | TmplAstTextAttribute) => {
    // Skip non-property bindings.
    if (
      attr instanceof TmplAstBoundAttribute &&
      attr.type !== BindingType.Property &&
      attr.type !== BindingType.TwoWay
    ) {
      return;
    }

    // Skip the attribute if the directive does not have an input for it.
    const inputs = directive.inputs.getByBindingPropertyName(attr.name);

    if (inputs !== null) {
      boundInputs.push({
        value: attr.value,
        sourceSpan: attr.sourceSpan,
        keySpan: attr.keySpan ?? null,
        inputs: inputs.map((input) => {
          return {
            fieldName: input.classPropertyName,
            required: input.required,
            transformType: input.transformType,
            isSignal: input.isSignal,
            isTwoWayBinding:
              attr instanceof TmplAstBoundAttribute && attr.type === BindingType.TwoWay,
          };
        }),
      });
    }
  };

  if (node instanceof TmplAstTemplate) {
    if (node.tagName === 'ng-template') {
      node.inputs.forEach(processAttribute);
      node.attributes.forEach(processAttribute);
    }

    node.templateAttrs.forEach(processAttribute);
  } else {
    node.inputs.forEach(processAttribute);
    node.attributes.forEach(processAttribute);
  }

  return boundInputs;
}

export function checkSplitTwoWayBinding(
  inputName: string,
  output: TmplAstBoundEvent,
  inputs: TmplAstBoundAttribute[],
  tcb: Context,
) {
  const input = inputs.find((input) => input.name === inputName);
  if (input === undefined || input.sourceSpan !== output.sourceSpan) {
    return false;
  }
  // Input consumer should be a directive because it's claimed
  const inputConsumer = tcb.boundTarget.getConsumerOfBinding(input) as TcbDirectiveMetadata;
  const outputConsumer = tcb.boundTarget.getConsumerOfBinding(output);
  if (
    outputConsumer === null ||
    inputConsumer.ref === undefined ||
    outputConsumer instanceof TmplAstTemplate
  ) {
    return false;
  }
  if (outputConsumer instanceof TmplAstElement) {
    tcb.oobRecorder.splitTwoWayBinding(tcb.id, input, output, inputConsumer, outputConsumer);
    return true;
  } else if (outputConsumer.ref !== inputConsumer.ref) {
    tcb.oobRecorder.splitTwoWayBinding(tcb.id, input, output, inputConsumer, outputConsumer);
    return true;
  }
  return false;
}

/**
 * Potentially widens the type of `expr` according to the type-checking configuration.
 */
export function widenBinding(expr: ts.Expression, tcb: Context): ts.Expression {
  if (!tcb.env.config.checkTypeOfInputBindings) {
    // If checking the type of bindings is disabled, cast the resulting expression to 'any'
    // before the assignment.
    return tsCastToAny(expr);
  } else if (!tcb.env.config.strictNullInputBindings) {
    if (ts.isObjectLiteralExpression(expr) || ts.isArrayLiteralExpression(expr)) {
      // Object literals and array literals should not be wrapped in non-null assertions as that
      // would cause literals to be prematurely widened, resulting in type errors when assigning
      // into a literal type.
      return expr;
    } else {
      // If strict null checks are disabled, erase `null` and `undefined` from the type by
      // wrapping the expression in a non-null assertion.
      return ts.factory.createNonNullExpression(expr);
    }
  } else {
    // No widening is requested, use the expression as is.
    return expr;
  }
}
