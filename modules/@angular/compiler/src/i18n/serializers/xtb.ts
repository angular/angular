/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as xml from '../../html_parser/ast';
import {HtmlParser} from '../../html_parser/html_parser';
import {InterpolationConfig} from '../../html_parser/interpolation_config';
import {XmlParser} from '../../html_parser/xml_parser';
import {ParseError} from '../../parse_util';
import * as i18n from '../i18n_ast';
import {I18nError} from '../parse_util';

import {Serializer} from './serializer';

const _TRANSLATIONS_TAG = 'translationbundle';
const _TRANSLATION_TAG = 'translation';
const _PLACEHOLDER_TAG = 'ph';

export class Xtb implements Serializer {
  constructor(private _htmlParser: HtmlParser, private _interpolationConfig: InterpolationConfig) {}

  write(messageMap: {[id: string]: i18n.Message}): string { throw new Error('Unsupported'); }

  load(content: string, url: string, placeholders: {[id: string]: {[name: string]: string}}):
      {[id: string]: xml.Node[]} {
    // Parse the xtb file into xml nodes
    const result = new XmlParser().parse(content, url);

    if (result.errors.length) {
      throw new Error(`xtb parse errors:\n${result.errors.join('\n')}`);
    }

    // Replace the placeholders, messages are now string
    const {messages, errors} = new _Serializer().parse(result.rootNodes, placeholders);

    if (errors.length) {
      throw new Error(`xtb parse errors:\n${errors.join('\n')}`);
    }

    // Convert the string messages to html ast
    // TODO(vicb): map error message back to the original message in xtb
    let messageMap: {[id: string]: xml.Node[]} = {};
    let parseErrors: ParseError[] = [];

    Object.getOwnPropertyNames(messages).forEach((id) => {
      const res = this._htmlParser.parse(messages[id], url, true, this._interpolationConfig);
      parseErrors.push(...res.errors);
      messageMap[id] = res.rootNodes;
    });

    if (parseErrors.length) {
      throw new Error(`xtb parse errors:\n${parseErrors.join('\n')}`);
    }

    return messageMap;
  }
}

class _Serializer implements xml.Visitor {
  private _messages: {[id: string]: string};
  private _bundleDepth: number;
  private _translationDepth: number;
  private _errors: I18nError[];
  private _placeholders: {[id: string]: {[name: string]: string}};
  private _currentPlaceholders: {[name: string]: string};

  parse(nodes: xml.Node[], _placeholders: {[id: string]: {[name: string]: string}}):
      {messages: {[k: string]: string}, errors: I18nError[]} {
    this._messages = {};
    this._bundleDepth = 0;
    this._translationDepth = 0;
    this._errors = [];
    this._placeholders = _placeholders;

    xml.visitAll(this, nodes, null);

    return {messages: this._messages, errors: this._errors};
  }

  visitElement(element: xml.Element, context: any): any {
    switch (element.name) {
      case _TRANSLATIONS_TAG:
        this._bundleDepth++;
        if (this._bundleDepth > 1) {
          this._addError(element, `<${_TRANSLATIONS_TAG}> elements can not be nested`);
        }
        xml.visitAll(this, element.children, null);
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
          this._currentPlaceholders = this._placeholders[idAttr.value] || {};
          this._messages[idAttr.value] = xml.visitAll(this, element.children).join('');
        }
        this._translationDepth--;
        break;

      case _PLACEHOLDER_TAG:
        const nameAttr = element.attrs.find((attr) => attr.name === 'name');
        if (!nameAttr) {
          this._addError(element, `<${_PLACEHOLDER_TAG}> misses the "name" attribute`);
        } else {
          if (this._currentPlaceholders.hasOwnProperty(nameAttr.value)) {
            return this._currentPlaceholders[nameAttr.value];
          }
          this._addError(
              element, `The placeholder "${nameAttr.value}" does not exists in the source message`);
        }
        break;

      default:
        this._addError(element, 'Unexpected tag');
    }
  }

  visitAttribute(attribute: xml.Attribute, context: any): any {
    throw new Error('unreachable code');
  }

  visitText(text: xml.Text, context: any): any { return text.value; }

  visitComment(comment: xml.Comment, context: any): any { return ''; }

  visitExpansion(expansion: xml.Expansion, context: any): any {
    const strCases = expansion.cases.map(c => c.visit(this, null));

    return `{${expansion.switchValue}, ${expansion.type}, strCases.join(' ')}`;
  }

  visitExpansionCase(expansionCase: xml.ExpansionCase, context: any): any {
    return `${expansionCase.value} {${xml.visitAll(this, expansionCase.expression, null)}}`;
  }

  private _addError(node: xml.Node, message: string): void {
    this._errors.push(new I18nError(node.sourceSpan, message));
  }
}
