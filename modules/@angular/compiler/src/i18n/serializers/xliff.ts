/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ml from '../../ml_parser/ast';
import {XmlParser} from '../../ml_parser/xml_parser';
import {digest} from '../digest';
import * as i18n from '../i18n_ast';
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

  load(content: string, url: string): {[msgId: string]: i18n.Node[]} {
    // xliff to xml nodes
    const xliffParser = new XliffParser();
    const {mlNodesByMsgId, errors} = xliffParser.parse(content, url);

    // xml nodes to i18n nodes
    const i18nNodesByMsgId: {[msgId: string]: i18n.Node[]} = {};
    const converter = new XmlToI18n();
    Object.keys(mlNodesByMsgId).forEach(msgId => {
      const {i18nNodes, errors: e} = converter.convert(mlNodesByMsgId[msgId]);
      errors.push(...e);
      i18nNodesByMsgId[msgId] = i18nNodes;
    });

    if (errors.length) {
      throw new Error(`xliff parse errors:\n${errors.join('\n')}`);
    }

    return i18nNodesByMsgId;
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
// Extract messages as xml nodes from the xliff file
class XliffParser implements ml.Visitor {
  private _unitMlNodes: ml.Node[];
  private _errors: I18nError[];
  private _mlNodesByMsgId: {[msgId: string]: ml.Node[]};

  parse(xliff: string, url: string) {
    this._unitMlNodes = [];
    this._mlNodesByMsgId = {};

    const xml = new XmlParser().parse(xliff, url, false);

    this._errors = xml.errors;
    ml.visitAll(this, xml.rootNodes, null);

    return {
      mlNodesByMsgId: this._mlNodesByMsgId,
      errors: this._errors,
    };
  }

  visitElement(element: ml.Element, context: any): any {
    switch (element.name) {
      case _UNIT_TAG:
        this._unitMlNodes = null;
        const idAttr = element.attrs.find((attr) => attr.name === 'id');
        if (!idAttr) {
          this._addError(element, `<${_UNIT_TAG}> misses the "id" attribute`);
        } else {
          const id = idAttr.value;
          if (this._mlNodesByMsgId.hasOwnProperty(id)) {
            this._addError(element, `Duplicated translations for msg ${id}`);
          } else {
            ml.visitAll(this, element.children, null);
            if (this._unitMlNodes) {
              this._mlNodesByMsgId[id] = this._unitMlNodes;
            } else {
              this._addError(element, `Message ${id} misses a translation`);
            }
          }
        }
        break;

      case _SOURCE_TAG:
        // ignore source message
        break;

      case _TARGET_TAG:
        this._unitMlNodes = element.children;
        break;

      default:
        // TODO(vicb): assert file structure, xliff version
        // For now only recurse on unhandled nodes
        ml.visitAll(this, element.children, null);
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

// Convert ml nodes (xliff syntax) to i18n nodes
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

  visitElement(el: ml.Element, context: any): i18n.Placeholder {
    if (el.name === _PLACEHOLDER_TAG) {
      const nameAttr = el.attrs.find((attr) => attr.name === 'id');
      if (nameAttr) {
        return new i18n.Placeholder('', nameAttr.value, el.sourceSpan);
      }

      this._addError(el, `<${_PLACEHOLDER_TAG}> misses the "id" attribute`);
    } else {
      this._addError(el, `Unexpected tag`);
    }
  }

  visitExpansion(icu: ml.Expansion, context: any) {}

  visitExpansionCase(icuCase: ml.ExpansionCase, context: any): any {}

  visitComment(comment: ml.Comment, context: any) {}

  visitAttribute(attribute: ml.Attribute, context: any) {}

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