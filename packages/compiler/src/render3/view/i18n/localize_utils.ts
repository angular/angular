/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as i18n from '../../../i18n/i18n_ast';
import * as o from '../../../output/output_ast';
import {ParseLocation, ParseSourceSpan} from '../../../parse_util';

import {serializeIcuNode} from './icu_serializer';
import {formatI18nPlaceholderName} from './util';

export function createLocalizeStatements(
    variable: o.ReadVarExpr, message: i18n.Message,
    params: {[name: string]: o.Expression}): o.Statement[] {
  const {messageParts, placeHolders} = serializeI18nMessageForLocalize(message);
  const sourceSpan = getSourceSpan(message);
  const expressions = placeHolders.map(ph => params[ph.text]);
  const localizedString =
      o.localizedString(message, messageParts, placeHolders, expressions, sourceSpan);
  const variableInitialization = variable.set(localizedString);
  return [new o.ExpressionStatement(variableInitialization)];
}

/**
 * This visitor walks over an i18n tree, capturing literal strings and placeholders.
 *
 * The result can be used for generating the `$localize` tagged template literals.
 */
class LocalizeSerializerVisitor implements i18n.Visitor {
  visitText(text: i18n.Text, context: o.MessagePiece[]): any {
    if (context[context.length - 1] instanceof o.LiteralPiece) {
      // Two literal pieces in a row means that there was some comment node in-between.
      context[context.length - 1].text += text.value;
    } else {
      context.push(new o.LiteralPiece(text.value, text.sourceSpan));
    }
  }

  visitContainer(container: i18n.Container, context: o.MessagePiece[]): any {
    container.children.forEach(child => child.visit(this, context));
  }

  visitIcu(icu: i18n.Icu, context: o.MessagePiece[]): any {
    context.push(new o.LiteralPiece(serializeIcuNode(icu), icu.sourceSpan));
  }

  visitTagPlaceholder(ph: i18n.TagPlaceholder, context: o.MessagePiece[]): any {
    context.push(this.createPlaceholderPiece(ph.startName, ph.startSourceSpan ?? ph.sourceSpan));
    if (!ph.isVoid) {
      ph.children.forEach(child => child.visit(this, context));
      context.push(this.createPlaceholderPiece(ph.closeName, ph.endSourceSpan ?? ph.sourceSpan));
    }
  }

  visitPlaceholder(ph: i18n.Placeholder, context: o.MessagePiece[]): any {
    context.push(this.createPlaceholderPiece(ph.name, ph.sourceSpan));
  }

  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): any {
    context.push(this.createPlaceholderPiece(ph.name, ph.sourceSpan));
  }

  private createPlaceholderPiece(name: string, sourceSpan: ParseSourceSpan): o.PlaceholderPiece {
    return new o.PlaceholderPiece(
        formatI18nPlaceholderName(name, /* useCamelCase */ false), sourceSpan);
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
    {messageParts: o.LiteralPiece[], placeHolders: o.PlaceholderPiece[]} {
  const pieces: o.MessagePiece[] = [];
  message.nodes.forEach(node => node.visit(serializerVisitor, pieces));
  return processMessagePieces(pieces);
}

function getSourceSpan(message: i18n.Message): ParseSourceSpan {
  const startNode = message.nodes[0];
  const endNode = message.nodes[message.nodes.length - 1];
  return new ParseSourceSpan(
      startNode.sourceSpan.start, endNode.sourceSpan.end, startNode.sourceSpan.fullStart,
      startNode.sourceSpan.details);
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
function processMessagePieces(pieces: o.MessagePiece[]):
    {messageParts: o.LiteralPiece[], placeHolders: o.PlaceholderPiece[]} {
  const messageParts: o.LiteralPiece[] = [];
  const placeHolders: o.PlaceholderPiece[] = [];

  if (pieces[0] instanceof o.PlaceholderPiece) {
    // The first piece was a placeholder so we need to add an initial empty message part.
    messageParts.push(createEmptyMessagePart(pieces[0].sourceSpan.start));
  }

  for (let i = 0; i < pieces.length; i++) {
    const part = pieces[i];
    if (part instanceof o.LiteralPiece) {
      messageParts.push(part);
    } else {
      placeHolders.push(part);
      if (pieces[i - 1] instanceof o.PlaceholderPiece) {
        // There were two placeholders in a row, so we need to add an empty message part.
        messageParts.push(createEmptyMessagePart(pieces[i - 1].sourceSpan.end));
      }
    }
  }
  if (pieces[pieces.length - 1] instanceof o.PlaceholderPiece) {
    // The last piece was a placeholder so we need to add a final empty message part.
    messageParts.push(createEmptyMessagePart(pieces[pieces.length - 1].sourceSpan.end));
  }
  return {messageParts, placeHolders};
}

function createEmptyMessagePart(location: ParseLocation): o.LiteralPiece {
  return new o.LiteralPiece('', new ParseSourceSpan(location, location));
}
