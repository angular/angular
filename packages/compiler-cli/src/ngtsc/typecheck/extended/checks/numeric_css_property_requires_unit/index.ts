/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  ASTWithSource,
  BindingType,
  LiteralPrimitive,
  TmplAstBoundAttribute,
  TmplAstNode,
  Unary,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
  formatExtendedError,
} from '../../api';

/**
 * CSS properties that require length units for numeric values
 * This is a subset of the most commonly used length properties
 */
const CSS_LENGTH_PROPERTIES = new Set([
  // Box model & spacing
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',

  // dimensions
  'block-size',
  'inline-size',
  'min-block-size',
  'min-inline-size',
  'max-block-size',
  'max-inline-size',

  // margin & padding
  'margin-block',
  'margin-block-start',
  'margin-block-end',
  'margin-inline',
  'margin-inline-start',
  'margin-inline-end',
  'padding-block',
  'padding-block-start',
  'padding-block-end',
  'padding-inline',
  'padding-inline-start',
  'padding-inline-end',

  // Borders
  'border-width',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-radius',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'border-start-start-radius',
  'border-start-end-radius',
  'border-end-start-radius',
  'border-end-end-radius',
  'border-block-start-width',
  'border-block-end-width',
  'border-block-width',
  'border-inline-start-width',
  'border-inline-end-width',
  'border-inline-width',
  'border-spacing',
  'outline-width',
  'outline-offset',

  // Positioning
  'top',
  'right',
  'bottom',
  'left',
  'inset',
  'inset-block-start',
  'inset-block-end',
  'inset-inline-start',
  'inset-inline-end',

  // Typography & text spacing
  'font-size',
  'letter-spacing',
  'word-spacing',
  'text-indent',
  'text-decoration-thickness',
  'text-underline-offset',
  'vertical-align',

  // Gaps & columns
  'gap',
  'row-gap',
  'column-gap',
  'column-width',
  'column-rule-width',

  // Flex layout
  'flex-basis',

  // Grid layout
  'grid-template-columns',
  'grid-template-rows',
  'grid-auto-columns',
  'grid-auto-rows',
  'grid-gap',

  // Background & positioning
  'background-size',
  'background-position',
  'background-position-x',
  'background-position-y',
  'object-position',

  // Transform & visual
  'transform-origin',
  'perspective',
  'perspective-origin',
  'translate',

  // Scroll margin & padding (all variants)
  'scroll-margin',
  'scroll-margin-top',
  'scroll-margin-right',
  'scroll-margin-bottom',
  'scroll-margin-left',
  'scroll-margin-block',
  'scroll-margin-block-start',
  'scroll-margin-block-end',
  'scroll-margin-inline',
  'scroll-margin-inline-start',
  'scroll-margin-inline-end',
  'scroll-padding',
  'scroll-padding-top',
  'scroll-padding-right',
  'scroll-padding-bottom',
  'scroll-padding-left',
  'scroll-padding-block',
  'scroll-padding-block-start',
  'scroll-padding-block-end',
  'scroll-padding-inline',
  'scroll-padding-inline-start',
  'scroll-padding-inline-end',

  // Motion path & scroll animations
  'offset-anchor',
  'offset-distance',
  'offset-position',
  'view-timeline-inset',

  // Other layout helpers
  'shape-margin',
]);

/**
 * A check which detects when numeric values are bound to CSS properties that require units.
 */
class NumericCssPropertyRequiresUnitCheck extends TemplateCheckWithVisitor<ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT> {
  override code = ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT>[] {
    if (!(node instanceof TmplAstBoundAttribute)) return [];

    // Only check style property bindings
    if (node.type !== BindingType.Style) return [];

    // Skip if the property already has a unit (e.g., [style.width.px])
    if (node.unit) return [];

    // Check if this is a CSS length property that requires units
    if (!CSS_LENGTH_PROPERTIES.has(hyphenate(node.name))) return [];

    // Extract the AST from ASTWithSource if needed
    const ast = node.value instanceof ASTWithSource ? node.value.ast : node.value;
    const value = getNumericValue(ast);

    // Only non-zero numbers need a unit
    if (value === null || value === 0) return [];

    const diagnostic = ctx.makeTemplateDiagnostic(
      node.keySpan,
      formatExtendedError(
        ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT,
        `Binding a number to the CSS property '${node.name}' will have no effect. ` +
          `CSS requires units for length values. ` +
          `For example, use [style.${node.name}.px]="${value}" or ` +
          `[style.${node.name}]="'${value}px'" instead.`,
      ),
    );
    return [diagnostic];
  }
}

/**
 * Converts a camelCase style property name to kebab-case (e.g. `fontSize` to `font-size`), the
 * same way the compiler does before it emits the style binding.
 */
function hyphenate(name: string): string {
  return name.replace(/[a-z][A-Z]/g, (v) => v.charAt(0) + '-' + v.charAt(1)).toLowerCase();
}

/**
 * Returns the value of a numeric literal or numeric string literal (e.g. `500`, `-500` or
 * `'500'`), or `null` if the expression is not one.
 */
function getNumericValue(ast: AST): number | null {
  // Signed numbers such as `-10` are parsed as a unary expression wrapping the literal.
  if (ast instanceof Unary && (ast.operator === '-' || ast.operator === '+')) {
    const value = getNumericValue(ast.expr);
    return value !== null && ast.operator === '-' ? -value : value;
  }

  if (!(ast instanceof LiteralPrimitive)) return null;

  if (typeof ast.value === 'number') return ast.value;

  // Empty strings are used to reset a style, so they are not treated as numbers.
  if (typeof ast.value === 'string' && ast.value.trim() !== '') {
    const value = Number(ast.value);
    return isNaN(value) ? null : value;
  }

  return null;
}

export const factory: TemplateCheckFactory<
  ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT,
  ExtendedTemplateDiagnosticName.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT
> = {
  code: ErrorCode.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT,
  name: ExtendedTemplateDiagnosticName.NUMERIC_CSS_PROPERTY_REQUIRES_UNIT,
  create: () => new NumericCssPropertyRequiresUnitCheck(),
};
