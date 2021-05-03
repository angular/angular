/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as i18n from '../../../i18n/i18n_ast';
import {mapLiteral} from '../../../output/map_util';
import * as o from '../../../output/output_ast';

import {serializeIcuNode} from './icu_serializer';
import {i18nMetaToJSDoc} from './meta';
import {formatI18nPlaceholderName} from './util';

/** Closure uses `goog.getMsg(message)` to lookup translations */
const GOOG_GET_MSG = 'goog.getMsg';

export function createGoogleGetMsgStatements(
    variable: o.ReadVarExpr, message: i18n.Message, closureVar: o.ReadVarExpr,
    params: {[name: string]: o.Expression}): o.Statement[] {
  const messageString = serializeI18nMessageForGetMsg(message);
  const args = [o.literal(messageString) as o.Expression];
  if (Object.keys(params).length) {
    args.push(mapLiteral(params, true));
  }

  // /**
  //  * @desc description of message
  //  * @meaning meaning of message
  //  */
  // const MSG_... = goog.getMsg(..);
  // I18N_X = MSG_...;
  const googGetMsgStmt = closureVar.set(o.variable(GOOG_GET_MSG).callFn(args)).toConstDecl();
  const metaComment = i18nMetaToJSDoc(message);
  if (metaComment !== null) {
    googGetMsgStmt.addLeadingComment(metaComment);
  }
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
    return container.children.map(child => child.visit(this)).join('');
  }

  visitIcu(icu: i18n.Icu): any {
    return serializeIcuNode(icu);
  }

  visitTagPlaceholder(ph: i18n.TagPlaceholder): any {
    return ph.isVoid ?
        this.formatPh(ph.startName) :
        `${this.formatPh(ph.startName)}${ph.children.map(child => child.visit(this)).join('')}${
            this.formatPh(ph.closeName)}`;
  }

  visitPlaceholder(ph: i18n.Placeholder): any {
    return this.formatPh(ph.name);
  }

  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): any {
    return this.formatPh(ph.name);
  }
}

const serializerVisitor = new GetMsgSerializerVisitor();

export function serializeI18nMessageForGetMsg(message: i18n.Message): string {
  return message.nodes.map(node => node.visit(serializerVisitor, null)).join('');
}
