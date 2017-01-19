/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HtmlParser} from '../ml_parser/html_parser';
import {InterpolationConfig} from '../ml_parser/interpolation_config';
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
      private _htmlParser: HtmlParser, private _implicitTags: string[],
      private _implicitAttrs: {[k: string]: string[]}) {}

  updateFromTemplate(html: string, url: string, interpolationConfig: InterpolationConfig):
      ParseError[] {
    const htmlParserResult = this._htmlParser.parse(html, url, true, interpolationConfig);

    if (htmlParserResult.errors.length) {
      return htmlParserResult.errors;
    }

    const i18nParserResult = extractMessages(
        htmlParserResult.rootNodes, interpolationConfig, this._implicitTags, this._implicitAttrs);

    if (i18nParserResult.errors.length) {
      return i18nParserResult.errors;
    }

    this._messages.push(...i18nParserResult.messages);
  }

  // Return the message in the internal format
  // The public (serialized) format might be different, see the `write` method.
  getMessages(): i18n.Message[] { return this._messages; }

  write(serializer: Serializer): string {
    const messages: {[id: string]: i18n.Message} = {};
    const mapperVisitor = new MapPlaceholderNames();

    // Deduplicate messages based on their ID
    this._messages.forEach(message => {
      const id = serializer.digest(message);
      if (!messages.hasOwnProperty(id)) {
        messages[id] = message;
      }
    });

    // Transform placeholder names using the serializer mapping
    const msgList = Object.keys(messages).map(id => {
      const mapper = serializer.createNameMapper(messages[id]);
      const src = messages[id];
      const nodes = mapper ? mapperVisitor.convert(src.nodes, mapper) : src.nodes;
      return new i18n.Message(nodes, {}, {}, src.meaning, src.description, id);
    });

    return serializer.write(msgList);
  }
}

// Transform an i18n AST by renaming the placeholder nodes with the given mapper
class MapPlaceholderNames implements i18n.Visitor {
  convert(nodes: i18n.Node[], mapper: PlaceholderMapper): i18n.Node[] {
    return mapper ? nodes.map(n => n.visit(this, mapper)) : nodes;
  }

  visitText(text: i18n.Text, mapper: PlaceholderMapper): i18n.Text {
    return new i18n.Text(text.value, text.sourceSpan);
  }

  visitContainer(container: i18n.Container, mapper: PlaceholderMapper): i18n.Container {
    const children = container.children.map(n => n.visit(this, mapper));
    return new i18n.Container(children, container.sourceSpan);
  }

  visitIcu(icu: i18n.Icu, mapper: PlaceholderMapper): i18n.Icu {
    const cases: {[k: string]: i18n.Node} = {};
    Object.keys(icu.cases).forEach(key => cases[key] = icu.cases[key].visit(this, mapper));
    const msg = new i18n.Icu(icu.expression, icu.type, cases, icu.sourceSpan);
    msg.expressionPlaceholder = icu.expressionPlaceholder;
    return msg;
  }

  visitTagPlaceholder(ph: i18n.TagPlaceholder, mapper: PlaceholderMapper): i18n.TagPlaceholder {
    const startName = mapper.toPublicName(ph.startName);
    const closeName = ph.closeName ? mapper.toPublicName(ph.closeName) : ph.closeName;
    const children = ph.children.map(n => n.visit(this, mapper));
    return new i18n.TagPlaceholder(
        ph.tag, ph.attrs, startName, closeName, children, ph.isVoid, ph.sourceSpan);
  }

  visitPlaceholder(ph: i18n.Placeholder, mapper: PlaceholderMapper): i18n.Placeholder {
    return new i18n.Placeholder(ph.value, mapper.toPublicName(ph.name), ph.sourceSpan);
  }

  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, mapper: PlaceholderMapper): i18n.IcuPlaceholder {
    return new i18n.IcuPlaceholder(ph.value, mapper.toPublicName(ph.name), ph.sourceSpan);
  }
}