/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ml from '../../ml_parser/ast';
import {HtmlParser} from '../../ml_parser/html_parser';
import {InterpolationConfig} from '../../ml_parser/interpolation_config';
import {XmlParser} from '../../ml_parser/xml_parser';
import {ParseError} from '../../parse_util';
import {digest} from '../digest';
import * as i18n from '../i18n_ast';
import {MessageBundle} from '../message_bundle';
import {I18nError} from '../parse_util';

import {Serializer} from './serializer';
import * as xml from './xml_helper';

const _VERSION = '1.2';
const _XMLNS = 'urn:oasis:names:tc:xliff:document:1.2';
// TODO(vicb): make this a param (s/_/-/)
const _SOURCE_LANG = 'en';
const _PLACEHOLDER_TAG = 'x';
const _SOURCE_TAG = 'source';
const _TARGET_TAG = 'target';
const _UNIT_TAG = 'trans-unit';

// http://docs.oasis-open.org/xliff/v1.2/os/xliff-core.html
// http://docs.oasis-open.org/xliff/v1.2/xliff-profile-html/xliff-profile-html-1.2.html
export class Xliff implements Serializer {
  constructor(private _htmlParser: HtmlParser, private _interpolationConfig: InterpolationConfig) {}

  write(messages: i18n.Message[]): string {
    const visitor = new _WriteVisitor();
    const visited: {[id: string]: boolean} = {};
    const transUnits: xml.Node[] = [];

    messages.forEach(message => {
      const id = this.digest(message);

      // deduplicate messages
      if (visited[id]) return;
      visited[id] = true;

      const transUnit = new xml.Tag(_UNIT_TAG, {id, datatype: 'html'});
      transUnit.children.push(
          new xml.CR(8), new xml.Tag(_SOURCE_TAG, {}, visitor.serialize(message.nodes)),
          new xml.CR(8), new xml.Tag(_TARGET_TAG));

      if (message.description) {
        transUnit.children.push(
            new xml.CR(8),
            new xml.Tag(
                'note', {priority: '1', from: 'description'}, [new xml.Text(message.description)]));
      }

      if (message.meaning) {
        transUnit.children.push(
            new xml.CR(8),
            new xml.Tag('note', {priority: '1', from: 'meaning'}, [new xml.Text(message.meaning)]));
      }

      transUnit.children.push(new xml.CR(6));

      transUnits.push(new xml.CR(6), transUnit);
    });

    const body = new xml.Tag('body', {}, [...transUnits, new xml.CR(4)]);
    const file = new xml.Tag(
        'file', {'source-language': _SOURCE_LANG, datatype: 'plaintext', original: 'ng2.template'},
        [new xml.CR(4), body, new xml.CR(2)]);
    const xliff = new xml.Tag(
        'xliff', {version: _VERSION, xmlns: _XMLNS}, [new xml.CR(2), file, new xml.CR()]);

    return xml.serialize([
      new xml.Declaration({version: '1.0', encoding: 'UTF-8'}), new xml.CR(), xliff, new xml.CR()
    ]);
  }

  load(content: string, url: string, messageBundle: MessageBundle): {[id: string]: ml.Node[]} {
    // Parse the xtb file into xml nodes
    const result = new XmlParser().parse(content, url);

    if (result.errors.length) {
      throw new Error(`xtb parse errors:\n${result.errors.join('\n')}`);
    }

    // Replace the placeholders, messages are now string
    const {messages, errors} = new _LoadVisitor(this).parse(result.rootNodes, messageBundle);

    if (errors.length) {
      throw new Error(`xtb parse errors:\n${errors.join('\n')}`);
    }

    // Convert the string messages to html ast
    // TODO(vicb): map error message back to the original message in xtb
    const messageMap: {[id: string]: ml.Node[]} = {};
    const parseErrors: ParseError[] = [];

    Object.keys(messages).forEach((id) => {
      const res = this._htmlParser.parse(messages[id], url, true, this._interpolationConfig);
      parseErrors.push(...res.errors);
      messageMap[id] = res.rootNodes;
    });

    if (parseErrors.length) {
      throw new Error(`xtb parse errors:\n${parseErrors.join('\n')}`);
    }

    return messageMap;
  }

  digest(message: i18n.Message): string { return digest(message); }
}

class _WriteVisitor implements i18n.Visitor {
  private _isInIcu: boolean;

  visitText(text: i18n.Text, context?: any): xml.Node[] { return [new xml.Text(text.value)]; }

  visitContainer(container: i18n.Container, context?: any): xml.Node[] {
    const nodes: xml.Node[] = [];
    container.children.forEach((node: i18n.Node) => nodes.push(...node.visit(this)));
    return nodes;
  }

  visitIcu(icu: i18n.Icu, context?: any): xml.Node[] {
    if (this._isInIcu) {
      // nested ICU is not supported
      throw new Error('xliff does not support nested ICU messages');
    }
    this._isInIcu = true;

    // TODO(vicb): support ICU messages
    // https://lists.oasis-open.org/archives/xliff/201201/msg00028.html
    // http://docs.oasis-open.org/xliff/v1.2/xliff-profile-po/xliff-profile-po-1.2-cd02.html
    const nodes: xml.Node[] = [];

    this._isInIcu = false;

    return nodes;
  }

  visitTagPlaceholder(ph: i18n.TagPlaceholder, context?: any): xml.Node[] {
    const ctype = getCtypeForTag(ph.tag);

    const startTagPh = new xml.Tag(_PLACEHOLDER_TAG, {id: ph.startName, ctype});
    if (ph.isVoid) {
      // void tags have no children nor closing tags
      return [startTagPh];
    }

    const closeTagPh = new xml.Tag(_PLACEHOLDER_TAG, {id: ph.closeName, ctype});

    return [startTagPh, ...this.serialize(ph.children), closeTagPh];
  }

  visitPlaceholder(ph: i18n.Placeholder, context?: any): xml.Node[] {
    return [new xml.Tag(_PLACEHOLDER_TAG, {id: ph.name})];
  }

  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): xml.Node[] {
    return [new xml.Tag(_PLACEHOLDER_TAG, {id: ph.name})];
  }

  serialize(nodes: i18n.Node[]): xml.Node[] {
    this._isInIcu = false;
    return [].concat(...nodes.map(node => node.visit(this)));
  }
}

// TODO(vicb): add error management (structure)
// TODO(vicb): factorize (xtb) ?
class _LoadVisitor implements ml.Visitor {
  private _messageNodes: [string, ml.Node[]][];
  private _translatedMessages: {[id: string]: string};
  private _msgId: string;
  private _target: ml.Node[];
  private _errors: I18nError[];
  private _sourceMessage: i18n.Message;

  constructor(private _serializer: Serializer) {}

  parse(nodes: ml.Node[], messageBundle: MessageBundle):
      {messages: {[k: string]: string}, errors: I18nError[]} {
    this._messageNodes = [];
    this._translatedMessages = {};
    this._msgId = '';
    this._target = [];
    this._errors = [];

    // Find all messages
    ml.visitAll(this, nodes, null);

    const messageMap: {[msgId: string]: i18n.Message} = {};
    messageBundle.getMessages().forEach(m => messageMap[this._serializer.digest(m)] = m);

    this._messageNodes
        .filter(message => {
          // Remove any messages that is not present in the source message bundle.
          return messageMap.hasOwnProperty(message[0]);
        })
        .sort((a, b) => {
          // Because there could be no ICU placeholdersByMsgId inside an ICU message,
          // we do not need to take into account the `placeholderToMsgIds` of the referenced
          // messages, those would always be empty
          // TODO(vicb): overkill - create 2 buckets and [...woDeps, ...wDeps].process()
          if (Object.keys(messageMap[a[0]].placeholderToMessage).length == 0) {
            return -1;
          }

          if (Object.keys(messageMap[b[0]].placeholderToMessage).length == 0) {
            return 1;
          }

          return 0;
        })
        .forEach(message => {
          const msgId = message[0];
          this._sourceMessage = messageMap[msgId];
          // TODO(vicb): make sure there is no `_TRANSLATIONS_TAG` nor `_TRANSLATION_TAG`
          this._translatedMessages[msgId] = ml.visitAll(this, message[1]).join('');
        });

    return {messages: this._translatedMessages, errors: this._errors};
  }

  visitElement(element: ml.Element, context: any): any {
    switch (element.name) {
      case _UNIT_TAG:
        this._target = null;
        const msgId = element.attrs.find((attr) => attr.name === 'id');
        if (!msgId) {
          this._addError(element, `<${_UNIT_TAG}> misses the "id" attribute`);
        } else {
          this._msgId = msgId.value;
        }
        ml.visitAll(this, element.children, null);
        if (this._msgId !== null) {
          this._messageNodes.push([this._msgId, this._target]);
        }
        break;

      case _SOURCE_TAG:
        // ignore source message
        break;

      case _TARGET_TAG:
        this._target = element.children;
        break;

      case _PLACEHOLDER_TAG:
        const idAttr = element.attrs.find((attr) => attr.name === 'id');
        if (!idAttr) {
          this._addError(element, `<${_PLACEHOLDER_TAG}> misses the "id" attribute`);
        } else {
          const phName = idAttr.value;
          if (this._sourceMessage.placeholders.hasOwnProperty(phName)) {
            return this._sourceMessage.placeholders[phName];
          }
          if (this._sourceMessage.placeholderToMessage.hasOwnProperty(phName)) {
            const refMsg = this._sourceMessage.placeholderToMessage[phName];
            const refMsgId = this._serializer.digest(refMsg);
            if (this._translatedMessages.hasOwnProperty(refMsgId)) {
              return this._translatedMessages[refMsgId];
            }
          }
          // TODO(vicb): better error message for when
          // !this._translatedMessages.hasOwnProperty(this._placeholderToIds[id])
          this._addError(
              element, `The placeholder "${phName}" does not exists in the source message`);
        }
        break;

      default:
        ml.visitAll(this, element.children, null);
    }
  }

  visitAttribute(attribute: ml.Attribute, context: any): any {
    throw new Error('unreachable code');
  }

  visitText(text: ml.Text, context: any): any { return text.value; }

  visitComment(comment: ml.Comment, context: any): any { return ''; }

  visitExpansion(expansion: ml.Expansion, context: any): any {
    throw new Error('unreachable code');
  }

  visitExpansionCase(expansionCase: ml.ExpansionCase, context: any): any {
    throw new Error('unreachable code');
  }

  private _addError(node: ml.Node, message: string): void {
    this._errors.push(new I18nError(node.sourceSpan, message));
  }
}

function getCtypeForTag(tag: string): string {
  switch (tag.toLowerCase()) {
    case 'br':
      return 'lb';
    case 'img':
      return 'image';
    default:
      return `x-${tag}`;
  }
}