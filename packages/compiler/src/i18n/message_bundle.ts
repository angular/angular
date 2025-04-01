/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InterpolationConfig} from '../ml_parser/defaults';
import {HtmlParser} from '../ml_parser/html_parser';
import {WhitespaceVisitor, visitAllWithSiblings} from '../ml_parser/html_whitespaces';
import {ParseError} from '../parse_util';

import {extractMessages} from './extractor_merger';
import * as i18n from './i18n_ast';
import {PlaceholderMapper, Serializer} from './serializers/serializer';

/**
 * A container for message extracted from the templates.
 */
export class MessageBundle {
  private _messages: i18n.Message[] = [];

  constructor(
    private _htmlParser: HtmlParser,
    private _implicitTags: string[],
    private _implicitAttrs: {[k: string]: string[]},
    private _locale: string | null = null,
    private readonly _preserveWhitespace = true,
  ) {}

  updateFromTemplate(
    source: string,
    url: string,
    interpolationConfig: InterpolationConfig,
  ): ParseError[] {
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
  getMessages(): i18n.Message[] {
    return this._messages;
  }

  write(serializer: Serializer, filterSources?: (path: string) => string): string {
    const messages: {[id: string]: i18n.Message} = {};
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
          (source: i18n.MessageSpan) => (source.filePath = filterSources(source.filePath)),
        );
      }
      return transformedMessage;
    });

    return serializer.write(msgList, this._locale);
  }
}

// Transform an i18n AST by renaming the placeholder nodes with the given mapper
class MapPlaceholderNames extends i18n.CloneVisitor {
  convert(nodes: i18n.Node[], mapper: PlaceholderMapper): i18n.Node[] {
    return mapper ? nodes.map((n) => n.visit(this, mapper)) : nodes;
  }

  override visitTagPlaceholder(
    ph: i18n.TagPlaceholder,
    mapper: PlaceholderMapper,
  ): i18n.TagPlaceholder {
    const startName = mapper.toPublicName(ph.startName)!;
    const closeName = ph.closeName ? mapper.toPublicName(ph.closeName)! : ph.closeName;
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

  override visitBlockPlaceholder(
    ph: i18n.BlockPlaceholder,
    mapper: PlaceholderMapper,
  ): i18n.BlockPlaceholder {
    const startName = mapper.toPublicName(ph.startName)!;
    const closeName = ph.closeName ? mapper.toPublicName(ph.closeName)! : ph.closeName;
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

  override visitPlaceholder(ph: i18n.Placeholder, mapper: PlaceholderMapper): i18n.Placeholder {
    return new i18n.Placeholder(ph.value, mapper.toPublicName(ph.name)!, ph.sourceSpan);
  }

  override visitIcuPlaceholder(
    ph: i18n.IcuPlaceholder,
    mapper: PlaceholderMapper,
  ): i18n.IcuPlaceholder {
    return new i18n.IcuPlaceholder(ph.value, mapper.toPublicName(ph.name)!, ph.sourceSpan);
  }
}
