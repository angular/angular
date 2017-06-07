/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


/**
 * Migrate i18n messages from one id version to the latest
 */
import {I18nVersion} from '@angular/core';

import * as ml from '../ml_parser/ast';
import {XmlParser} from '../ml_parser/xml_parser';

import {serializeNodes} from './digest';
import {Message} from './i18n_ast';
import {createSerializer} from './i18n_html_parser';
import {MessageBundle} from './message_bundle';
import {I18nError} from './parse_util';


/**
 * Updates translations based on the provided mapping
 * @param translations
 * @param mapping: the IDs to update, oldId --> newId
 * - if oldId --> null, the message will be removed
 * - if oldId === newId, nothing is changed
 * @returns updated translations
 */
export function applyIdsMapping(
    translations: string, mapping: {[oldId: string]: string | null}): string {
  const msgIdToElement = getElementsMapping(translations);
  msgIdToElement.reverse().forEach(([id, element]: [string, ml.Element]) => {
    const newId = mapping[id];
    if (typeof newId !== 'undefined' && newId !== id) {
      if (newId) {
        const idStart = element.startSourceSpan !.start.offset +
            translations
                .substring(
                    element.startSourceSpan !.start.offset, element.endSourceSpan !.end.offset)
                .indexOf('id="') +
            4;
        const idEnd = idStart + id.length;
        translations = translations.substring(0, idStart) + newId + translations.substr(idEnd);
      } else {  // remove the message
        // we also need to trim the spaces between the start of this element and the previous one
        const previousElement =
            translations.substr(0, element.startSourceSpan !.start.offset).lastIndexOf('>') + 1;
        translations = translations.substring(0, previousElement) +
            translations.substr(element.endSourceSpan !.end.offset);
      }
    }
  });

  return translations;
}

/**
 * Returns the mappings of new --> [old Ids], and old --> new Id
 */
export function getIdsMapping(
    messageBundle: MessageBundle, formatName?: string, fromVersion?: I18nVersion):
    {newToOld: {[newId: string]: string[]}, oldToNew: {[oldId: string]: string}} {
  const oldSerializer = createSerializer(formatName, fromVersion || I18nVersion.Version0);
  const serializerV1 = createSerializer(formatName, I18nVersion.Version1);
  const newToOld: {[newId: string]: string[]} = {};
  const oldToNew: {[oldId: string]: string} = {};

  messageBundle.getMessages().forEach((msg: Message) => {
    const initId = oldSerializer.digest(msg);
    let newId = msg.id || serializerV1.digest(msg);
    oldToNew[initId] = newId;
    if (!newToOld[newId]) {
      newToOld[newId] = [];
    }
    if (newToOld[newId].indexOf(initId) === -1) {
      newToOld[newId].push(initId);
    }
  });

  return {newToOld, oldToNew};
}

export function getElementsMapping(
    translations: string, format?: string, version?: I18nVersion): [string, ml.Element, string][] {
  const visitor = new IdAttributeMappingVisitor();
  const {errors, msgIdToElement} = visitor.generateMapping(translations, 'i18n');

  if (errors.length) {
    throw new Error(`Translations parse errors:\n${errors.join('\n')}`);
  }

  const msgMap: {[id: string]: string} = {};
  if (format) {
    const serializer = createSerializer(format, version);
    const {i18nNodesByMsgId} = serializer.load(translations, 'url');

    Object.keys(i18nNodesByMsgId)
        .forEach(id => msgMap[id] = serializeNodes(i18nNodesByMsgId[id]).join(''));
  }

  const res: [string, ml.Element, string][] = [];
  msgIdToElement.forEach(([id, element]: [string, ml.Element]) => {
    res.push([id, element, msgMap[id] ? msgMap[id] : '']);
  });
  return res;
}

/**
 * Visitor to get a list of ids & elements from xliff/xliff2/xtb/xmb files
 */
class IdAttributeMappingVisitor implements ml.Visitor {
  private _errors: I18nError[];
  private _msgIdToElement: [string, ml.Element][];

  generateMapping(content: string, url: string):
      {msgIdToElement: [string, ml.Element][], errors: I18nError[]} {
    const xmlParser = new XmlParser().parse(content, url, false);

    this._errors = xmlParser.errors;
    this._msgIdToElement = [];

    ml.visitAll(this, xmlParser.rootNodes, null);

    return {msgIdToElement: this._msgIdToElement, errors: this._errors};
  }

  visitElement(element: ml.Element, context: any): any {
    switch (element.name) {
      case 'trans-unit':   // xliff
      case 'unit':         // xliff2
      case 'translation':  // xtb
      case 'msg':          // xmb
        const idAttr = element.attrs.find(attr => attr.name === 'id');
        if (!idAttr) {
          this._addError(element, `<${element.name}> misses the "id" attribute`);
        } else {
          this._msgIdToElement.push([idAttr.value, element]);
        }
        break;

      default:
        ml.visitAll(this, element.children, null);
    }
  }

  visitAttribute(attribute: ml.Attribute, context: any): any {}

  visitText(text: ml.Text, context: any): any {}

  visitComment(comment: ml.Comment, context: any): any {}

  visitExpansion(expansion: ml.Expansion, context: any): any {}

  visitExpansionCase(expansionCase: ml.ExpansionCase, context: any): any {}

  private _addError(node: ml.Node, message: string): void {
    this._errors.push(new I18nError(node.sourceSpan !, message));
  }
}
