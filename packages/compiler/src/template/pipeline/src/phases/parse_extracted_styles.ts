/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SecurityContext} from '../../../../core';
import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';

import type {CompilationJob} from '../compilation';

// Any changes here should be ported to the Angular Domino fork.
// https://github.com/angular/domino/blob/main/lib/style_parser.js

const enum Char {
  OpenParen = 40,
  CloseParen = 41,
  Colon = 58,
  Semicolon = 59,
  BackSlash = 92,
  QuoteNone = 0, // indicating we are not inside a quote
  QuoteDouble = 34,
  QuoteSingle = 39,
}

/**
 * Parses string representation of a style and converts it into object literal.
 *
 * @param value string representation of style as used in the `style` attribute in HTML.
 *   Example: `color: red; height: auto`.
 * @returns An array of style property name and value pairs, e.g. `['color', 'red', 'height',
 * 'auto']`
 */
export function parse(value: string): string[] {
  // we use a string array here instead of a string map
  // because a string-map is not guaranteed to retain the
  // order of the entries whereas a string array can be
  // constructed in a [key, value, key, value] format.
  const styles: string[] = [];

  let i = 0;
  let parenDepth = 0;
  let quote: Char = Char.QuoteNone;
  let valueStart = 0;
  let propStart = 0;
  let currentProp: string | null = null;
  while (i < value.length) {
    const token = value.charCodeAt(i++) as Char;
    switch (token) {
      case Char.OpenParen:
        parenDepth++;
        break;
      case Char.CloseParen:
        parenDepth--;
        break;
      case Char.QuoteSingle:
        // valueStart needs to be there since prop values don't
        // have quotes in CSS
        if (quote === Char.QuoteNone) {
          quote = Char.QuoteSingle;
        } else if (quote === Char.QuoteSingle && value.charCodeAt(i - 1) !== Char.BackSlash) {
          quote = Char.QuoteNone;
        }
        break;
      case Char.QuoteDouble:
        // same logic as above
        if (quote === Char.QuoteNone) {
          quote = Char.QuoteDouble;
        } else if (quote === Char.QuoteDouble && value.charCodeAt(i - 1) !== Char.BackSlash) {
          quote = Char.QuoteNone;
        }
        break;
      case Char.Colon:
        if (!currentProp && parenDepth === 0 && quote === Char.QuoteNone) {
          // TODO: Do not hyphenate CSS custom property names like: `--intentionallyCamelCase`
          currentProp = hyphenate(value.substring(propStart, i - 1).trim());
          valueStart = i;
        }
        break;
      case Char.Semicolon:
        if (currentProp && valueStart > 0 && parenDepth === 0 && quote === Char.QuoteNone) {
          const styleVal = value.substring(valueStart, i - 1).trim();
          styles.push(currentProp, styleVal);
          propStart = i;
          valueStart = 0;
          currentProp = null;
        }
        break;
    }
  }

  if (currentProp && valueStart) {
    const styleVal = value.slice(valueStart).trim();
    styles.push(currentProp, styleVal);
  }

  return styles;
}

export function hyphenate(value: string): string {
  return value
    .replace(/[a-z][A-Z]/g, (v) => {
      return v.charAt(0) + '-' + v.charAt(1);
    })
    .toLowerCase();
}

/**
 * Parses extracted style and class attributes into separate ExtractedAttributeOps per style or
 * class property.
 */
export function parseExtractedStyles(job: CompilationJob) {
  const elements = new Map<ir.XrefId, ir.CreateOp>();

  for (const unit of job.units) {
    for (const op of unit.create) {
      if (ir.isElementOrContainerOp(op)) {
        elements.set(op.xref, op);
      }
    }
  }

  for (const unit of job.units) {
    for (const op of unit.create) {
      if (
        op.kind === ir.OpKind.ExtractedAttribute &&
        op.bindingKind === ir.BindingKind.Attribute &&
        ir.isStringLiteral(op.expression!)
      ) {
        const target = elements.get(op.target)!;

        if (
          target !== undefined &&
          (target.kind === ir.OpKind.Template ||
            target.kind === ir.OpKind.ConditionalCreate ||
            target.kind === ir.OpKind.ConditionalBranchCreate) &&
          target.templateKind === ir.TemplateKind.Structural
        ) {
          // TemplateDefinitionBuilder will not apply class and style bindings to structural
          // directives; instead, it will leave them as attributes.
          // (It's not clear what that would mean, anyway -- classes and styles on a structural
          // element should probably be a parse error.)
          // TODO: We may be able to remove this once Template Pipeline is the default.
          continue;
        }

        if (op.name === 'style') {
          const parsedStyles = parse(op.expression.value);
          for (let i = 0; i < parsedStyles.length - 1; i += 2) {
            ir.OpList.insertBefore<ir.CreateOp>(
              ir.createExtractedAttributeOp(
                op.target,
                ir.BindingKind.StyleProperty,
                null,
                parsedStyles[i],
                o.literal(parsedStyles[i + 1]),
                null,
                null,
                SecurityContext.STYLE,
              ),
              op,
            );
          }
          ir.OpList.remove<ir.CreateOp>(op);
        } else if (op.name === 'class') {
          const parsedClasses = op.expression.value.trim().split(/\s+/g);
          for (const parsedClass of parsedClasses) {
            ir.OpList.insertBefore<ir.CreateOp>(
              ir.createExtractedAttributeOp(
                op.target,
                ir.BindingKind.ClassName,
                null,
                parsedClass,
                null,
                null,
                null,
                SecurityContext.NONE,
              ),
              op,
            );
          }
          ir.OpList.remove<ir.CreateOp>(op);
        }
      }
    }
  }
}
