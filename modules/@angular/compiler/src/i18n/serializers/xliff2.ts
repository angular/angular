/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ListWrapper} from '../../facade/collection';
import * as ml from '../../ml_parser/ast';
import {HtmlParser} from '../../ml_parser/html_parser';
import {InterpolationConfig} from '../../ml_parser/interpolation_config';
import {XmlParser} from '../../ml_parser/xml_parser';
import {ParseError} from '../../parse_util';
import * as i18n from '../i18n_ast';
import {MessageBundle} from '../message_bundle';
import {I18nError} from '../parse_util';

import {Serializer, extractPlaceholderToIds, extractPlaceholders} from './serializer';
import * as xml from './xml_helper';

const _VERSION = '2.0';
const _XMLNS = 'urn:oasis:names:tc:xliff:document:2.0';
// TODO(vicb): make this a param (s/_/-/)
const _SOURCE_LANG = 'en';
const _PLACEHOLDER_TAG = 'ph';
const _PLACEHOLDER_SPANNING_TAG = 'pc';
const _SOURCE_TAG = 'source';
const _TARGET_TAG = 'target';
const _UNIT_TAG = 'unit';

// http://docs.oasis-open.org/xliff/xliff-core/v2.0/os/xliff-core-v2.0-os.html
export class Xliff2 implements Serializer {
  constructor(private _htmlParser: HtmlParser, private _interpolationConfig: InterpolationConfig) {}

  write(messageMap: {[id: string]: i18n.Message}): string {
    const visitor = new _WriteVisitor();

    const units: xml.Node[] = [];

    Object.keys(messageMap).forEach((id) => {
      const message = messageMap[id];

      const unit = new xml.Tag(_UNIT_TAG, {id: id});

      if (message.description || message.meaning) {
        const notes = new xml.Tag('notes');

        if (message.description) {
          notes.children.push(
              new xml.CR(8),
              new xml.Tag('note', {category: 'description'}, [new xml.Text(message.description)]));
        }

        if (message.meaning) {
          notes.children.push(
              new xml.CR(8),
              new xml.Tag('note', {category: 'meaning'}, [new xml.Text(message.meaning)]));
        }

        notes.children.push(new xml.CR(6));

        unit.children.push(new xml.CR(6), notes);
      }

      const segment = new xml.Tag('segment');

      segment.children.push(
          new xml.CR(8), new xml.Tag(_SOURCE_TAG, {}, visitor.serialize(message.nodes)),
          new xml.CR(6));

      unit.children.push(new xml.CR(6), segment);

      unit.children.push(new xml.CR(4));

      units.push(new xml.CR(4), unit);
    });

    const file =
        new xml.Tag('file', {original: 'ng2.template', id: 'ngi18n'}, [...units, new xml.CR(2)]);
    const xliff = new xml.Tag(
        'xliff', {version: _VERSION, xmlns: _XMLNS, srcLang: _SOURCE_LANG},
        [new xml.CR(2), file, new xml.CR()]);

    return xml.serialize([
      new xml.Declaration({version: '1.0', encoding: 'UTF-8'}), new xml.CR(), xliff, new xml.CR()
    ]);
  }

  load(content: string, url: string, messageBundle: MessageBundle): {[id: string]: ml.Node[]} {
    // Parse the xliff file into xml nodes
    const result = new XmlParser().parse(content, url);

    if (result.errors.length) {
      throw new Error(`xliff parse errors:\n${result.errors.join('\n')}`);
    }

    // Replace the placeholders, messages are now string
    const {messages, errors} = new _LoadVisitor().parse(result.rootNodes, messageBundle);

    if (errors.length) {
      throw new Error(`xliff parse errors:\n${errors.join('\n')}`);
    }

    // Convert the string messages to html ast
    // TODO(vicb): map error message back to the original message in xtb
    let messageMap: {[id: string]: ml.Node[]} = {};
    const parseErrors: ParseError[] = [];

    Object.keys(messages).forEach((id) => {
      const res = this._htmlParser.parse(messages[id], url, true, this._interpolationConfig);
      parseErrors.push(...res.errors);
      messageMap[id] = res.rootNodes;
    });

    if (parseErrors.length) {
      throw new Error(`xliff parse errors:\n${parseErrors.join('\n')}`);
    }

    return messageMap;
  }
}

class _WriteVisitor implements i18n.Visitor {
  private _isInIcu: boolean;
  private _nextPlaceholderId: number;

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
    const type = getTypeForTag(ph.tag);
    const subType = getSubTypeForTag(ph.tag);

    if (ph.isVoid) {
      const tagPh = new xml.Tag(_PLACEHOLDER_TAG, {
        id: (this._nextPlaceholderId++).toString(),
        equiv: ph.startName,
        type: type,
        subType: subType,
        disp: `<${ph.tag}/>`,
        canCopy: 'no',
        canDelete: 'no'
      });
      return [tagPh];
    }

    const tagPc = new xml.Tag(_PLACEHOLDER_SPANNING_TAG, {
      id: (this._nextPlaceholderId++).toString(),
      equivStart: ph.startName,
      equivEnd: ph.closeName,
      type: type,
      subType: subType,
      dispStart: `<${ph.tag}>`,
      dispEnd: `</${ph.tag}>`,
      canCopy: 'no',
      canDelete: 'no'
    });
    const nodes: xml.Node[] = ListWrapper.flatten(ph.children.map(node => node.visit(this)));
    if (nodes.length) {
      nodes.forEach((node: xml.Node) => tagPc.children.push(node));
    } else {
      tagPc.children.push(new xml.Text(''));
    }

    return [tagPc];
  }

  visitPlaceholder(ph: i18n.Placeholder, context?: any): xml.Node[] {
    return [new xml.Tag(_PLACEHOLDER_TAG, {
      id: (this._nextPlaceholderId++).toString(),
      equiv: ph.name,
      disp: `{{${ph.value}}}`,
      canCopy: 'no',
      canDelete: 'no'
    })];
  }

  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): xml.Node[] {
    return [new xml.Tag(_PLACEHOLDER_TAG, {id: ph.name, canCopy: 'no', canDelete: 'no'})];
  }

  serialize(nodes: i18n.Node[]): xml.Node[] {
    this._isInIcu = false;
    this._nextPlaceholderId = 0;
    return ListWrapper.flatten(nodes.map(node => node.visit(this)));
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
  private _placeholders: {[name: string]: string};
  private _placeholderToIds: {[name: string]: string};

  parse(nodes: ml.Node[], messageBundle: MessageBundle):
      {messages: {[k: string]: string}, errors: I18nError[]} {
    this._messageNodes = [];
    this._translatedMessages = {};
    this._msgId = '';
    this._target = [];
    this._errors = [];

    // Find all messages
    ml.visitAll(this, nodes, null);

    const messageMap = messageBundle.getMessageMap();
    const placeholders = extractPlaceholders(messageBundle);
    const placeholderToIds = extractPlaceholderToIds(messageBundle);

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
          if (Object.keys(messageMap[a[0]].placeholderToMsgIds).length == 0) {
            return -1;
          }

          if (Object.keys(messageMap[b[0]].placeholderToMsgIds).length == 0) {
            return 1;
          }

          return 0;
        })
        .forEach(message => {
          const id = message[0];
          this._placeholders = placeholders[id] || {};
          this._placeholderToIds = placeholderToIds[id] || {};
          // TODO(vicb): make sure there is no `_TRANSLATIONS_TAG` nor `_TRANSLATION_TAG`
          this._translatedMessages[id] = ml.visitAll(this, message[1]).join('');
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
        const idAttr = element.attrs.find((attr) => attr.name === 'equiv');
        if (!idAttr) {
          this._addError(element, `<${_PLACEHOLDER_TAG}> misses the "equiv" attribute`);
        } else {
          const id = idAttr.value;

          if (this._placeholders.hasOwnProperty(id)) {
            return this._placeholders[id];
          }

          if (this._placeholderToIds.hasOwnProperty(id) &&
              this._translatedMessages.hasOwnProperty(this._placeholderToIds[id])) {
            return this._translatedMessages[this._placeholderToIds[id]];
          }
          // TODO(vicb): better error message for when
          // !this._translatedMessages.hasOwnProperty(this._placeholderToIds[id])
          this._addError(element, `The placeholder "${id}" does not exists in the source message`);
        }
        break;

      case _PLACEHOLDER_SPANNING_TAG:
        const startIdAttr = element.attrs.find((attr) => attr.name === 'equivStart');
        const endIdAttr = element.attrs.find((attr) => attr.name === 'equivEnd');
        if (!startIdAttr) {
          this._addError(element, `<${_PLACEHOLDER_TAG}> misses the "equivStart" attribute`);
        } else if (!endIdAttr) {
          this._addError(element, `<${_PLACEHOLDER_TAG}> misses the "equivEnd" attribute`);
        } else {
          const startId = startIdAttr.value;
          const endId = endIdAttr.value;

          let startTag: string;
          let endTag: string;

          if (this._placeholders.hasOwnProperty(startId)) {
            startTag = this._placeholders[startId];
          } else if (
              this._placeholderToIds.hasOwnProperty(startId) &&
              this._translatedMessages.hasOwnProperty(this._placeholderToIds[startId])) {
            startTag = this._translatedMessages[this._placeholderToIds[startId]];
          }

          if (this._placeholders.hasOwnProperty(endId)) {
            endTag = this._placeholders[endId];
          } else if (
              this._placeholderToIds.hasOwnProperty(endId) &&
              this._translatedMessages.hasOwnProperty(this._placeholderToIds[endId])) {
            endTag = this._translatedMessages[this._placeholderToIds[endId]];
          }

          if (startTag && endTag) {
            return [startTag, ...ml.visitAll(this, element.children, null), endTag].join('');
          }

          // TODO(vicb): better error message for when
          // !this._translatedMessages.hasOwnProperty(this._placeholderToIds[id])
          this._addError(
              element, `The placeholder "${startId}" does not exists in the source message`);
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

function getTypeForTag(tag: string): string {
  switch (tag.toLowerCase()) {
    case 'br':
    case 'b':
    case 'i':
    case 'u':
      return 'fmt';
    case 'img':
      return 'image';
    case 'a':
      return 'link';
    default:
      return 'other';
  }
}

function getSubTypeForTag(tag: string): string {
  switch (tag.toLowerCase()) {
    case 'br':
      return 'xlf:lb';
    case 'b':
      return 'xlf:b';
    case 'i':
      return 'xlf:i';
    case 'u':
      return 'xlf:u';
    default:
      return `other:${tag}`;
  }
}