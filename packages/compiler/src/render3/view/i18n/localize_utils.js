import * as o from '../../../output/output_ast';
import {ParseSourceSpan} from '../../../parse_util';
import {serializeIcuNode} from './icu_serializer';
import {formatI18nPlaceholderName} from './util';
export function createLocalizeStatements(variable, message, params) {
  const {messageParts, placeHolders} = serializeI18nMessageForLocalize(message);
  const sourceSpan = getSourceSpan(message);
  const expressions = placeHolders.map((ph) => params[ph.text]);
  const localizedString = o.localizedString(
    message,
    messageParts,
    placeHolders,
    expressions,
    sourceSpan,
  );
  const variableInitialization = variable.set(localizedString);
  return [new o.ExpressionStatement(variableInitialization)];
}
/**
 * This visitor walks over an i18n tree, capturing literal strings and placeholders.
 *
 * The result can be used for generating the `$localize` tagged template literals.
 */
class LocalizeSerializerVisitor {
  constructor(placeholderToMessage, pieces) {
    this.placeholderToMessage = placeholderToMessage;
    this.pieces = pieces;
  }
  visitText(text) {
    if (this.pieces[this.pieces.length - 1] instanceof o.LiteralPiece) {
      // Two literal pieces in a row means that there was some comment node in-between.
      this.pieces[this.pieces.length - 1].text += text.value;
    } else {
      const sourceSpan = new ParseSourceSpan(
        text.sourceSpan.fullStart,
        text.sourceSpan.end,
        text.sourceSpan.fullStart,
        text.sourceSpan.details,
      );
      this.pieces.push(new o.LiteralPiece(text.value, sourceSpan));
    }
  }
  visitContainer(container) {
    container.children.forEach((child) => child.visit(this));
  }
  visitIcu(icu) {
    this.pieces.push(new o.LiteralPiece(serializeIcuNode(icu), icu.sourceSpan));
  }
  visitTagPlaceholder(ph) {
    this.pieces.push(
      this.createPlaceholderPiece(ph.startName, ph.startSourceSpan ?? ph.sourceSpan),
    );
    if (!ph.isVoid) {
      ph.children.forEach((child) => child.visit(this));
      this.pieces.push(
        this.createPlaceholderPiece(ph.closeName, ph.endSourceSpan ?? ph.sourceSpan),
      );
    }
  }
  visitPlaceholder(ph) {
    this.pieces.push(this.createPlaceholderPiece(ph.name, ph.sourceSpan));
  }
  visitBlockPlaceholder(ph) {
    this.pieces.push(
      this.createPlaceholderPiece(ph.startName, ph.startSourceSpan ?? ph.sourceSpan),
    );
    ph.children.forEach((child) => child.visit(this));
    this.pieces.push(this.createPlaceholderPiece(ph.closeName, ph.endSourceSpan ?? ph.sourceSpan));
  }
  visitIcuPlaceholder(ph) {
    this.pieces.push(
      this.createPlaceholderPiece(ph.name, ph.sourceSpan, this.placeholderToMessage[ph.name]),
    );
  }
  createPlaceholderPiece(name, sourceSpan, associatedMessage) {
    return new o.PlaceholderPiece(
      formatI18nPlaceholderName(name, /* useCamelCase */ false),
      sourceSpan,
      associatedMessage,
    );
  }
}
/**
 * Serialize an i18n message into two arrays: messageParts and placeholders.
 *
 * These arrays will be used to generate `$localize` tagged template literals.
 *
 * @param message The message to be serialized.
 * @returns an object containing the messageParts and placeholders.
 */
export function serializeI18nMessageForLocalize(message) {
  const pieces = [];
  const serializerVisitor = new LocalizeSerializerVisitor(message.placeholderToMessage, pieces);
  message.nodes.forEach((node) => node.visit(serializerVisitor));
  return processMessagePieces(pieces);
}
function getSourceSpan(message) {
  const startNode = message.nodes[0];
  const endNode = message.nodes[message.nodes.length - 1];
  return new ParseSourceSpan(
    startNode.sourceSpan.fullStart,
    endNode.sourceSpan.end,
    startNode.sourceSpan.fullStart,
    startNode.sourceSpan.details,
  );
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
function processMessagePieces(pieces) {
  const messageParts = [];
  const placeHolders = [];
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
function createEmptyMessagePart(location) {
  return new o.LiteralPiece('', new ParseSourceSpan(location, location));
}
//# sourceMappingURL=localize_utils.js.map
