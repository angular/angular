/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as i18n from '../../../i18n/i18n_ast';
import * as o from '../../../output/output_ast';

import {serializeIcuNode} from './icu_serializer';
import {i18nMetaToDocStmt, metaFromI18nMessage} from './meta';
import {formatI18nPlaceholderName} from './util';

export function createLocalizeStatements(
    variable: o.ReadVarExpr, message: i18n.Message,
    params: {[name: string]: o.Expression}): o.Statement[] {
  const statements = [];

  // TODO: re-enable these comments when we have a plan on how to make them work so that Closure
  // compiler doesn't complain about the JSDOC comments.

  // const jsdocComment = i18nMetaToDocStmt(metaFromI18nMessage(message));
  // if (jsdocComment !== null) {
  //   statements.push(jsdocComment);
  // }

  const {messageParts, placeHolders} = serializeI18nMessageForLocalize(message);
  statements.push(new o.ExpressionStatement(variable.set(
      o.localizedString(messageParts, placeHolders, placeHolders.map(ph => params[ph])))));

  return statements;
}

class MessagePiece {
  constructor(public text: string) {}
}
class LiteralPiece extends MessagePiece {}
class PlaceholderPiece extends MessagePiece {
  constructor(name: string) { super(formatI18nPlaceholderName(name)); }
}

/**
 * This visitor walks over an i18n tree, capturing literal strings and placeholders.
 *
 * The result can be used for generating the `$localize` tagged template literals.
 */
class LocalizeSerializerVisitor implements i18n.Visitor {
  visitText(text: i18n.Text, context: MessagePiece[]): any {
    if (context[context.length - 1] instanceof LiteralPiece) {
      // Two literal pieces in a row means that there was some comment node in-between.
      context[context.length - 1].text += text.value;
    } else {
      context.push(new LiteralPiece(text.value));
    }
  }

  visitContainer(container: i18n.Container, context: MessagePiece[]): any {
    container.children.forEach(child => child.visit(this, context));
  }

  visitIcu(icu: i18n.Icu, context: MessagePiece[]): any {
    context.push(new LiteralPiece(serializeIcuNode(icu)));
  }

  visitTagPlaceholder(ph: i18n.TagPlaceholder, context: MessagePiece[]): any {
    context.push(new PlaceholderPiece(ph.startName));
    if (!ph.isVoid) {
      ph.children.forEach(child => child.visit(this, context));
      context.push(new PlaceholderPiece(ph.closeName));
    }
  }

  visitPlaceholder(ph: i18n.Placeholder, context: MessagePiece[]): any {
    context.push(new PlaceholderPiece(ph.name));
  }

  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): any {
    context.push(new PlaceholderPiece(ph.name));
  }
}

const serializerVisitor = new LocalizeSerializerVisitor();

/**
 * Serialize an i18n message into two arrays: messageParts and placeholders.
 *
 * These arrays will be used to generate `$localize` tagged template literals.
 *
 * @param message The message to be serialized.
 * @returns an object containing the messageParts and placeholders.
 */
export function serializeI18nMessageForLocalize(message: i18n.Message):
    {messageParts: string[], placeHolders: string[]} {
  const pieces: MessagePiece[] = [];
  message.nodes.forEach(node => node.visit(serializerVisitor, pieces));
  return processMessagePieces(pieces);
}

/**
 * Convert the list of serialized MessagePieces into two arrays.
 *
 * One contains the literal string pieces and the other the placeholders that will be replaced by
 * expressions when rendering `$localize` tagged template literals.
 *
 * @param pieces The pieces to process.
 * @returns an object containing the messageParts and placeholders.
 */
function processMessagePieces(pieces: MessagePiece[]):
    {messageParts: string[], placeHolders: string[]} {
  const messageParts: string[] = [];
  const placeHolders: string[] = [];

  if (pieces[0] instanceof PlaceholderPiece) {
    // The first piece was a placeholder so we need to add an initial empty message part.
    messageParts.push('');
  }

  for (let i = 0; i < pieces.length; i++) {
    const part = pieces[i];
    if (part instanceof LiteralPiece) {
      messageParts.push(part.text);
    } else {
      placeHolders.push(part.text);
      if (pieces[i - 1] instanceof PlaceholderPiece) {
        // There were two placeholders in a row, so we need to add an empty message part.
        messageParts.push('');
      }
    }
  }
  if (pieces[pieces.length - 1] instanceof PlaceholderPiece) {
    // The last piece was a placeholder so we need to add a final empty message part.
    messageParts.push('');
  }
  return {messageParts, placeHolders};
}