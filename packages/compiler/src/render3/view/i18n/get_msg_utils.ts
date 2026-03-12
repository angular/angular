/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as i18n from '../../../i18n/i18n_ast';
import {mapLiteral} from '../../../output/map_util';
import * as o from '../../../output/output_ast';

import {serializeIcuNode} from './icu_serializer';
import {i18nMetaToJSDoc} from './meta';
import {formatI18nPlaceholderName, formatI18nPlaceholderNamesInMap} from './util';

/** Closure uses `goog.getMsg(message)` to lookup translations */
const GOOG_GET_MSG = 'goog.getMsg';

/**
 * Generates a `goog.getMsg()` statement and reassignment. The template:
 *
 * ```html
 * <div i18n>Sent from {{ sender }} to <span class="receiver">{{ receiver }}</span></div>
 * ```
 *
 * Generates:
 *
 * ```ts
 * const MSG_FOO = goog.getMsg(
 *   // Message template.
 *   'Sent from {$interpolation} to {$startTagSpan}{$interpolation_1}{$closeTagSpan}.',
 *   // Placeholder values, set to magic strings which get replaced by the Angular runtime.
 *   {
 *     'interpolation': '\uFFFD0\uFFFD',
 *     'startTagSpan': '\uFFFD1\uFFFD',
 *     'interpolation_1': '\uFFFD2\uFFFD',
 *     'closeTagSpan': '\uFFFD3\uFFFD',
 *   },
 *   // Options bag.
 *   {
 *     // Maps each placeholder to the original Angular source code which generates it's value.
 *     original_code: {
 *       'interpolation': '{{ sender }}',
 *       'startTagSpan': '<span class="receiver">',
 *       'interpolation_1': '{{ receiver }}',
 *       'closeTagSpan': '</span>',
 *     },
 *   },
 * );
 * const I18N_0 = MSG_FOO;
 * ```
 */
export function createGoogleGetMsgStatements(
  variable: o.ReadVarExpr,
  message: i18n.Message,
  closureVar: o.ReadVarExpr,
  placeholderValues: {[name: string]: o.Expression},
): o.Statement[] {
  const messageString = serializeI18nMessageForGetMsg(message);
  const args = [o.literal(messageString) as o.Expression];
  if (Object.keys(placeholderValues).length) {
    // Message template parameters containing the magic strings replaced by the Angular runtime with
    // real data, e.g. `{'interpolation': '\uFFFD0\uFFFD'}`.
    args.push(
      mapLiteral(
        formatI18nPlaceholderNamesInMap(placeholderValues, true /* useCamelCase */),
        true /* quoted */,
      ),
    );

    // Message options object, which contains original source code for placeholders (as they are
    // present in a template, e.g.
    // `{original_code: {'interpolation': '{{ name }}', 'startTagSpan': '<span>'}}`.
    args.push(
      mapLiteral({
        original_code: o.literalMap(
          Object.keys(placeholderValues).map((param) => ({
            key: formatI18nPlaceholderName(param),
            quoted: true,
            value: message.placeholders[param]
              ? // Get source span for typical placeholder if it exists.
                o.literal(message.placeholders[param].sourceSpan.toString())
              : // Otherwise must be an ICU expression, get it's source span.
                o.literal(
                  message.placeholderToMessage[param].nodes
                    .map((node) => node.sourceSpan.toString())
                    .join(''),
                ),
          })),
        ),
      }),
    );
  }

  // /**
  //  * @desc description of message
  //  * @meaning meaning of message
  //  */
  // const MSG_... = goog.getMsg(..);
  // I18N_X = MSG_...;
  const googGetMsgStmt = new o.DeclareVarStmt(
    closureVar.name,
    o.variable(GOOG_GET_MSG).callFn(args),
    o.INFERRED_TYPE,
    o.StmtModifier.Final,
  );
  googGetMsgStmt.addLeadingComment(i18nMetaToJSDoc(message));
  const i18nAssignmentStmt = new o.ExpressionStatement(variable.set(closureVar));
  return [googGetMsgStmt, i18nAssignmentStmt];
}

/**
 * This visitor walks over i18n tree and generates its string representation, including ICUs and
 * placeholders in `{$placeholder}` (for plain messages) or `{PLACEHOLDER}` (inside ICUs) format.
 */
class GetMsgSerializerVisitor implements i18n.Visitor {
  private formatPh(value: string): string {
    return `{$${formatI18nPlaceholderName(value)}}`;
  }

  visitText(text: i18n.Text): any {
    return text.value;
  }

  visitContainer(container: i18n.Container): any {
    return container.children.map((child) => child.visit(this)).join('');
  }

  visitIcu(icu: i18n.Icu): any {
    return serializeIcuNode(icu);
  }

  visitTagPlaceholder(ph: i18n.TagPlaceholder): any {
    return ph.isVoid
      ? this.formatPh(ph.startName)
      : `${this.formatPh(ph.startName)}${ph.children
          .map((child) => child.visit(this))
          .join('')}${this.formatPh(ph.closeName)}`;
  }

  visitPlaceholder(ph: i18n.Placeholder): any {
    return this.formatPh(ph.name);
  }

  visitBlockPlaceholder(ph: i18n.BlockPlaceholder): any {
    return `${this.formatPh(ph.startName)}${ph.children
      .map((child) => child.visit(this))
      .join('')}${this.formatPh(ph.closeName)}`;
  }

  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): any {
    return this.formatPh(ph.name);
  }
}

const serializerVisitor = new GetMsgSerializerVisitor();

export function serializeI18nMessageForGetMsg(message: i18n.Message): string {
  return message.nodes.map((node) => node.visit(serializerVisitor, null)).join('');
}
