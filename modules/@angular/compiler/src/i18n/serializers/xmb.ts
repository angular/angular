/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ListWrapper} from '../../facade/collection';
import * as html from '../../ml_parser/ast';
import * as i18n from '../i18n_ast';
import {MessageBundle} from '../message_bundle';

import {Serializer} from './serializer';
import * as xml from './xml_helper';

const _MESSAGES_TAG = 'messagebundle';
const _MESSAGE_TAG = 'msg';
const _PLACEHOLDER_TAG = 'ph';
const _EXEMPLE_TAG = 'ex';

const _DOCTYPE = `<!ELEMENT messagebundle (msg)*>
<!ATTLIST messagebundle class CDATA #IMPLIED>

<!ELEMENT msg (#PCDATA|ph|source)*>
<!ATTLIST msg id CDATA #IMPLIED>
<!ATTLIST msg seq CDATA #IMPLIED>
<!ATTLIST msg name CDATA #IMPLIED>
<!ATTLIST msg desc CDATA #IMPLIED>
<!ATTLIST msg meaning CDATA #IMPLIED>
<!ATTLIST msg obsolete (obsolete) #IMPLIED>
<!ATTLIST msg xml:space (default|preserve) "default">
<!ATTLIST msg is_hidden CDATA #IMPLIED>

<!ELEMENT source (#PCDATA)>

<!ELEMENT ph (#PCDATA|ex)*>
<!ATTLIST ph name CDATA #REQUIRED>

<!ELEMENT ex (#PCDATA)>`;

export class Xmb implements Serializer {
  write(messageMap: {[k: string]: i18n.Message}): string {
    const visitor = new _Visitor();
    let rootNode = new xml.Tag(_MESSAGES_TAG);

    Object.keys(messageMap).forEach((id) => {
      const message = messageMap[id];
      let attrs: {[k: string]: string} = {id};

      if (message.description) {
        attrs['desc'] = message.description;
      }

      if (message.meaning) {
        attrs['meaning'] = message.meaning;
      }

      rootNode.children.push(
          new xml.CR(2), new xml.Tag(_MESSAGE_TAG, attrs, visitor.serialize(message.nodes)));
    });

    rootNode.children.push(new xml.CR());

    return xml.serialize([
      new xml.Declaration({version: '1.0', encoding: 'UTF-8'}),
      new xml.CR(),
      new xml.Doctype(_MESSAGES_TAG, _DOCTYPE),
      new xml.CR(),
      rootNode,
      new xml.CR(),
    ]);
  }

  load(content: string, url: string, messageBundle: MessageBundle): {[id: string]: html.Node[]} {
    throw new Error('Unsupported');
  }
}

class _Visitor implements i18n.Visitor {
  visitText(text: i18n.Text, context?: any): xml.Node[] { return [new xml.Text(text.value)]; }

  visitContainer(container: i18n.Container, context?: any): xml.Node[] {
    const nodes: xml.Node[] = [];
    container.children.forEach((node: i18n.Node) => nodes.push(...node.visit(this)));
    return nodes;
  }

  visitIcu(icu: i18n.Icu, context?: any): xml.Node[] {
    const nodes = [new xml.Text(`{${icu.expression}, ${icu.type}, `)];

    Object.keys(icu.cases).forEach((c: string) => {
      nodes.push(new xml.Text(`${c} {`), ...icu.cases[c].visit(this), new xml.Text(`} `));
    });

    nodes.push(new xml.Text(`}`));

    return nodes;
  }

  visitTagPlaceholder(ph: i18n.TagPlaceholder, context?: any): xml.Node[] {
    const startEx = new xml.Tag(_EXEMPLE_TAG, {}, [new xml.Text(`<${ph.tag}>`)]);
    const startTagPh = new xml.Tag(_PLACEHOLDER_TAG, {name: ph.startName}, [startEx]);
    if (ph.isVoid) {
      // void tags have no children nor closing tags
      return [startTagPh];
    }

    const closeEx = new xml.Tag(_EXEMPLE_TAG, {}, [new xml.Text(`</${ph.tag}>`)]);
    const closeTagPh = new xml.Tag(_PLACEHOLDER_TAG, {name: ph.closeName}, [closeEx]);

    return [startTagPh, ...this.serialize(ph.children), closeTagPh];
  }

  visitPlaceholder(ph: i18n.Placeholder, context?: any): xml.Node[] {
    return [new xml.Tag(_PLACEHOLDER_TAG, {name: ph.name})];
  }

  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): xml.Node[] {
    return [new xml.Tag(_PLACEHOLDER_TAG, {name: ph.name})];
  }

  serialize(nodes: i18n.Node[]): xml.Node[] {
    return ListWrapper.flatten(nodes.map(node => node.visit(this)));
  }
}
