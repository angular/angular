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
import * as i18n from '../i18n_ast';
import {MessageBundle} from '../message_bundle';
import {I18nError} from '../parse_util';

import {Serializer} from './serializer';
import {digest} from './xmb';

const _TRANSLATIONS_TAG = 'translationbundle';
const _TRANSLATION_TAG = 'translation';
const _PLACEHOLDER_TAG = 'ph';

export class Xtb implements Serializer {
  constructor(private _htmlParser: HtmlParser, private _interpolationConfig: InterpolationConfig) {}

  write(messages: i18n.Message[]): string { throw new Error('Unsupported'); }

  load(content: string, url: string, messageBundle: MessageBundle): {[id: string]: ml.Node[]} {
    // Parse the xtb file into xml nodes
    const result = new XmlParser().parse(content, url, true);

    if (result.errors.length) {
      throw new Error(`xtb parse errors:\n${result.errors.join('\n')}`);
    }

    // Replace the placeholders, messages are now string
    const {messages, errors} = new _Visitor(this).parse(result.rootNodes, messageBundle);

    if (errors.length) {
      throw new Error(`xtb parse errors:\n${errors.join('\n')}`);
    }

    // Convert the string messages to html ast
    // TODO(vicb): map error message back to the original message in xtb
    const messageMap: {[id: string]: ml.Node[]} = {};
    const parseErrors: ParseError[] = [];

    Object.keys(messages).forEach((msgId) => {
      const res = this._htmlParser.parse(messages[msgId], url, true, this._interpolationConfig);
      parseErrors.push(...res.errors);
      messageMap[msgId] = res.rootNodes;
    });

    if (parseErrors.length) {
      throw new Error(`xtb parse errors:\n${parseErrors.join('\n')}`);
    }

    return messageMap;
  }

  digest(message: i18n.Message): string {
    // we must use the same digest as xmb
    return digest(message);
  }
}

class _Visitor implements ml.Visitor {
  private _messageNodes: [string, ml.Node[]][];
  private _translatedMessages: {[id: string]: string};
  private _bundleDepth: number;
  private _translationDepth: number;
  private _errors: I18nError[];
  private _sourceMessage: i18n.Message;

  constructor(private _serializer: Serializer) {}

  parse(nodes: ml.Node[], messageBundle: MessageBundle):
      {messages: {[k: string]: string}, errors: I18nError[]} {
    // Tuple [<message id>, [ml nodes]]
    this._messageNodes = [];
    this._translatedMessages = {};
    this._bundleDepth = 0;
    this._translationDepth = 0;
    this._errors = [];

    // load all translations
    ml.visitAll(this, nodes, null);

    const messageMap: {[msgId: string]: i18n.Message} = {};
    messageBundle.getMessages().forEach(m => messageMap[this._serializer.digest(m)] = m);

    this._messageNodes
        .filter(message => {
          // Remove any messages that is not present in the source message bundle.
          return messageMap.hasOwnProperty(message[0]);
        })
        .sort((a, b) => {
          // Because there could be no ICU placeholders inside an ICU message,
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
      case _TRANSLATIONS_TAG:
        this._bundleDepth++;
        if (this._bundleDepth > 1) {
          this._addError(element, `<${_TRANSLATIONS_TAG}> elements can not be nested`);
        }
        ml.visitAll(this, element.children, null);
        this._bundleDepth--;
        break;

      case _TRANSLATION_TAG:
        this._translationDepth++;
        if (this._translationDepth > 1) {
          this._addError(element, `<${_TRANSLATION_TAG}> elements can not be nested`);
        }
        const idAttr = element.attrs.find((attr) => attr.name === 'id');
        if (!idAttr) {
          this._addError(element, `<${_TRANSLATION_TAG}> misses the "id" attribute`);
        } else {
          // ICU placeholders are reference to other messages.
          // The referenced message might not have been decoded yet.
          // We need to have all messages available to make sure deps are decoded first.
          // TODO(vicb): report an error on duplicate id
          this._messageNodes.push([idAttr.value, element.children]);
        }
        this._translationDepth--;
        break;

      case _PLACEHOLDER_TAG:
        const nameAttr = element.attrs.find((attr) => attr.name === 'name');
        if (!nameAttr) {
          this._addError(element, `<${_PLACEHOLDER_TAG}> misses the "name" attribute`);
        } else {
          const phName = nameAttr.value;
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
          // !this._translatedMessages.hasOwnProperty(refMessageId)
          this._addError(
              element, `The placeholder "${phName}" does not exists in the source message`);
        }
        break;

      default:
        this._addError(element, 'Unexpected tag');
    }
  }

  visitAttribute(attribute: ml.Attribute, context: any): any {
    throw new Error('unreachable code');
  }

  visitText(text: ml.Text, context: any): any { return text.value; }

  visitComment(comment: ml.Comment, context: any): any { return ''; }

  visitExpansion(expansion: ml.Expansion, context: any): any {
    const strCases = expansion.cases.map(c => c.visit(this, null));
    return `{${expansion.switchValue}, ${expansion.type}, ${strCases.join(' ')}}`;
  }

  visitExpansionCase(expansionCase: ml.ExpansionCase, context: any): any {
    return `${expansionCase.value} {${ml.visitAll(this, expansionCase.expression, null).join('')}}`;
  }

  private _addError(node: ml.Node, message: string): void {
    this._errors.push(new I18nError(node.sourceSpan, message));
  }
}
