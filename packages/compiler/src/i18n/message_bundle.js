/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {WhitespaceVisitor, visitAllWithSiblings} from '../ml_parser/html_whitespaces';
import {extractMessages} from './extractor_merger';
import * as i18n from './i18n_ast';
/**
 * A container for message extracted from the templates.
 */
export class MessageBundle {
  constructor(
    _htmlParser,
    _implicitTags,
    _implicitAttrs,
    _locale = null,
    _preserveWhitespace = true,
  ) {
    this._htmlParser = _htmlParser;
    this._implicitTags = _implicitTags;
    this._implicitAttrs = _implicitAttrs;
    this._locale = _locale;
    this._preserveWhitespace = _preserveWhitespace;
    this._messages = [];
  }
  updateFromTemplate(source, url, interpolationConfig) {
    const htmlParserResult = this._htmlParser.parse(source, url, {
      tokenizeExpansionForms: true,
      interpolationConfig,
    });
    if (htmlParserResult.errors.length) {
      return htmlParserResult.errors;
    }
    // Trim unnecessary whitespace from extracted messages if requested. This
    // makes the messages more durable to trivial whitespace changes without
    // affected message IDs.
    const rootNodes = this._preserveWhitespace
      ? htmlParserResult.rootNodes
      : visitAllWithSiblings(
          new WhitespaceVisitor(/* preserveSignificantWhitespace */ false),
          htmlParserResult.rootNodes,
        );
    const i18nParserResult = extractMessages(
      rootNodes,
      interpolationConfig,
      this._implicitTags,
      this._implicitAttrs,
      /* preserveSignificantWhitespace */ this._preserveWhitespace,
    );
    if (i18nParserResult.errors.length) {
      return i18nParserResult.errors;
    }
    this._messages.push(...i18nParserResult.messages);
    return [];
  }
  // Return the message in the internal format
  // The public (serialized) format might be different, see the `write` method.
  getMessages() {
    return this._messages;
  }
  write(serializer, filterSources) {
    const messages = {};
    const mapperVisitor = new MapPlaceholderNames();
    // Deduplicate messages based on their ID
    this._messages.forEach((message) => {
      const id = serializer.digest(message);
      if (!messages.hasOwnProperty(id)) {
        messages[id] = message;
      } else {
        messages[id].sources.push(...message.sources);
      }
    });
    // Transform placeholder names using the serializer mapping
    const msgList = Object.keys(messages).map((id) => {
      const mapper = serializer.createNameMapper(messages[id]);
      const src = messages[id];
      const nodes = mapper ? mapperVisitor.convert(src.nodes, mapper) : src.nodes;
      let transformedMessage = new i18n.Message(nodes, {}, {}, src.meaning, src.description, id);
      transformedMessage.sources = src.sources;
      if (filterSources) {
        transformedMessage.sources.forEach(
          (source) => (source.filePath = filterSources(source.filePath)),
        );
      }
      return transformedMessage;
    });
    return serializer.write(msgList, this._locale);
  }
}
// Transform an i18n AST by renaming the placeholder nodes with the given mapper
class MapPlaceholderNames extends i18n.CloneVisitor {
  convert(nodes, mapper) {
    return mapper ? nodes.map((n) => n.visit(this, mapper)) : nodes;
  }
  visitTagPlaceholder(ph, mapper) {
    const startName = mapper.toPublicName(ph.startName);
    const closeName = ph.closeName ? mapper.toPublicName(ph.closeName) : ph.closeName;
    const children = ph.children.map((n) => n.visit(this, mapper));
    return new i18n.TagPlaceholder(
      ph.tag,
      ph.attrs,
      startName,
      closeName,
      children,
      ph.isVoid,
      ph.sourceSpan,
      ph.startSourceSpan,
      ph.endSourceSpan,
    );
  }
  visitBlockPlaceholder(ph, mapper) {
    const startName = mapper.toPublicName(ph.startName);
    const closeName = ph.closeName ? mapper.toPublicName(ph.closeName) : ph.closeName;
    const children = ph.children.map((n) => n.visit(this, mapper));
    return new i18n.BlockPlaceholder(
      ph.name,
      ph.parameters,
      startName,
      closeName,
      children,
      ph.sourceSpan,
      ph.startSourceSpan,
      ph.endSourceSpan,
    );
  }
  visitPlaceholder(ph, mapper) {
    return new i18n.Placeholder(ph.value, mapper.toPublicName(ph.name), ph.sourceSpan);
  }
  visitIcuPlaceholder(ph, mapper) {
    return new i18n.IcuPlaceholder(ph.value, mapper.toPublicName(ph.name), ph.sourceSpan);
  }
}
//# sourceMappingURL=message_bundle.js.map
