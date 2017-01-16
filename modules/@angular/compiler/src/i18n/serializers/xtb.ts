/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ml from '../../ml_parser/ast';
import {XmlParser} from '../../ml_parser/xml_parser';
import * as i18n from '../i18n_ast';
import {I18nError} from '../parse_util';

import {Serializer} from './serializer';
import {digest} from './xmb';

const _TRANSLATIONS_TAG = 'translationbundle';
const _TRANSLATION_TAG = 'translation';
const _PLACEHOLDER_TAG = 'ph';

export class Xtb implements Serializer {
  write(messages: i18n.Message[]): string { throw new Error('Unsupported'); }

  load(content: string, url: string): {[msgId: string]: i18n.Node[]} {
    // xtb to xml nodes
    const xtbParser = new XtbParser();
    const {mlNodesByMsgId, errors} = xtbParser.parse(content, url);

    // xml nodes to i18n nodes
    const i18nNodesByMsgId: {[msgId: string]: i18n.Node[]} = {};
    const converter = new XmlToI18n();
    Object.keys(mlNodesByMsgId).forEach(msgId => {
      const {i18nNodes, errors: e} = converter.convert(mlNodesByMsgId[msgId]);
      errors.push(...e);
      i18nNodesByMsgId[msgId] = i18nNodes;
    });

    if (errors.length) {
      throw new Error(`xtb parse errors:\n${errors.join('\n')}`);
    }

    return i18nNodesByMsgId;
  }

  digest(message: i18n.Message): string { return digest(message); }
}

// Extract messages as xml nodes from the xtb file
class XtbParser implements ml.Visitor {
  private _bundleDepth: number;
  private _errors: I18nError[];
  private _mlNodesByMsgId: {[msgId: string]: ml.Node[]};

  parse(xtb: string, url: string) {
    this._bundleDepth = 0;
    this._mlNodesByMsgId = {};

    const xml = new XmlParser().parse(xtb, url, true);

    this._errors = xml.errors;
    ml.visitAll(this, xml.rootNodes);

    return {
      mlNodesByMsgId: this._mlNodesByMsgId,
      errors: this._errors,
    };
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
        const idAttr = element.attrs.find((attr) => attr.name === 'id');
        if (!idAttr) {
          this._addError(element, `<${_TRANSLATION_TAG}> misses the "id" attribute`);
        } else {
          const id = idAttr.value;
          if (this._mlNodesByMsgId.hasOwnProperty(id)) {
            this._addError(element, `Duplicated translations for msg ${id}`);
          } else {
            this._mlNodesByMsgId[id] = element.children;
          }
        }
        break;

      default:
        this._addError(element, 'Unexpected tag');
    }
  }

  visitAttribute(attribute: ml.Attribute, context: any): any {}

  visitText(text: ml.Text, context: any): any {}

  visitComment(comment: ml.Comment, context: any): any {}

  visitExpansion(expansion: ml.Expansion, context: any): any {}

  visitExpansionCase(expansionCase: ml.ExpansionCase, context: any): any {}

  private _addError(node: ml.Node, message: string): void {
    this._errors.push(new I18nError(node.sourceSpan, message));
  }
}

// Convert ml nodes (xtb syntax) to i18n nodes
class XmlToI18n implements ml.Visitor {
  private _errors: I18nError[];

  convert(nodes: ml.Node[]) {
    this._errors = [];
    return {
      i18nNodes: ml.visitAll(this, nodes),
      errors: this._errors,
    };
  }

  visitText(text: ml.Text, context: any) { return new i18n.Text(text.value, text.sourceSpan); }

  visitExpansion(icu: ml.Expansion, context: any) {
    const caseMap: {[value: string]: i18n.Node} = {};

    ml.visitAll(this, icu.cases).forEach(c => {
      caseMap[c.value] = new i18n.Container(c.nodes, icu.sourceSpan);
    });

    return new i18n.Icu(icu.switchValue, icu.type, caseMap, icu.sourceSpan);
  }

  visitExpansionCase(icuCase: ml.ExpansionCase, context: any): any {
    return {
      value: icuCase.value,
      nodes: ml.visitAll(this, icuCase.expression),
    };
  }

  visitElement(el: ml.Element, context: any): i18n.Placeholder {
    if (el.name === _PLACEHOLDER_TAG) {
      const nameAttr = el.attrs.find((attr) => attr.name === 'name');
      if (nameAttr) {
        return new i18n.Placeholder('', nameAttr.value, el.sourceSpan);
      }

      this._addError(el, `<${_PLACEHOLDER_TAG}> misses the "name" attribute`);
    } else {
      this._addError(el, `Unexpected tag`);
    }
  }

  visitComment(comment: ml.Comment, context: any) {}

  visitAttribute(attribute: ml.Attribute, context: any) {}

  private _addError(node: ml.Node, message: string): void {
    this._errors.push(new I18nError(node.sourceSpan, message));
  }
}
