/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {decimalDigest} from '../digest';
import * as i18n from '../i18n_ast';

import {PlaceholderMapper, Serializer, SimplePlaceholderMapper} from './serializer';
import * as xml from './xml_helper';

/**
 * Defines the `handler` value on the serialized XMB, indicating that Angular
 * generated the bundle. This is useful for analytics in Translation Console.
 *
 * NOTE: Keep in sync with
 * packages/localize/tools/src/extract/translation_files/xmb_translation_serializer.ts.
 */
const _XMB_HANDLER = 'angular';

const _MESSAGES_TAG = 'messagebundle';
const _MESSAGE_TAG = 'msg';
const _PLACEHOLDER_TAG = 'ph';
const _EXAMPLE_TAG = 'ex';
const _SOURCE_TAG = 'source';

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

export class Xmb extends Serializer {
  override write(messages: i18n.Message[], locale: string | null): string {
    const exampleVisitor = new ExampleVisitor();
    const visitor = new _Visitor();
    const rootNode = new xml.Tag(_MESSAGES_TAG);
    rootNode.attrs['handler'] = _XMB_HANDLER;

    messages.forEach((message) => {
      const attrs: {[k: string]: string} = {id: message.id};

      if (message.description) {
        attrs['desc'] = message.description;
      }

      if (message.meaning) {
        attrs['meaning'] = message.meaning;
      }

      let sourceTags: xml.Tag[] = [];
      message.sources.forEach((source: i18n.MessageSpan) => {
        sourceTags.push(
          new xml.Tag(_SOURCE_TAG, {}, [
            new xml.Text(
              `${source.filePath}:${source.startLine}${
                source.endLine !== source.startLine ? ',' + source.endLine : ''
              }`,
            ),
          ]),
        );
      });

      rootNode.children.push(
        new xml.CR(2),
        new xml.Tag(_MESSAGE_TAG, attrs, [...sourceTags, ...visitor.serialize(message.nodes)]),
      );
    });

    rootNode.children.push(new xml.CR());

    return xml.serialize([
      new xml.Declaration({version: '1.0', encoding: 'UTF-8'}),
      new xml.CR(),
      new xml.Doctype(_MESSAGES_TAG, _DOCTYPE),
      new xml.CR(),
      exampleVisitor.addDefaultExamples(rootNode),
      new xml.CR(),
    ]);
  }

  override load(
    content: string,
    url: string,
  ): {locale: string; i18nNodesByMsgId: {[msgId: string]: i18n.Node[]}} {
    throw new Error('Unsupported');
  }

  override digest(message: i18n.Message): string {
    return digest(message);
  }

  override createNameMapper(message: i18n.Message): PlaceholderMapper {
    return new SimplePlaceholderMapper(message, toPublicName);
  }
}

class _Visitor implements i18n.Visitor {
  visitText(text: i18n.Text, context?: any): xml.Node[] {
    return [new xml.Text(text.value)];
  }

  visitContainer(container: i18n.Container, context: any): xml.Node[] {
    const nodes: xml.Node[] = [];
    container.children.forEach((node: i18n.Node) => nodes.push(...node.visit(this)));
    return nodes;
  }

  visitIcu(icu: i18n.Icu, context?: any): xml.Node[] {
    const nodes = [new xml.Text(`{${icu.expressionPlaceholder}, ${icu.type}, `)];

    Object.keys(icu.cases).forEach((c: string) => {
      nodes.push(new xml.Text(`${c} {`), ...icu.cases[c].visit(this), new xml.Text(`} `));
    });

    nodes.push(new xml.Text(`}`));

    return nodes;
  }

  visitTagPlaceholder(ph: i18n.TagPlaceholder, context?: any): xml.Node[] {
    const startTagAsText = new xml.Text(`<${ph.tag}>`);
    const startEx = new xml.Tag(_EXAMPLE_TAG, {}, [startTagAsText]);
    // TC requires PH to have a non empty EX, and uses the text node to show the "original" value.
    const startTagPh = new xml.Tag(_PLACEHOLDER_TAG, {name: ph.startName}, [
      startEx,
      startTagAsText,
    ]);
    if (ph.isVoid) {
      // void tags have no children nor closing tags
      return [startTagPh];
    }

    const closeTagAsText = new xml.Text(`</${ph.tag}>`);
    const closeEx = new xml.Tag(_EXAMPLE_TAG, {}, [closeTagAsText]);
    // TC requires PH to have a non empty EX, and uses the text node to show the "original" value.
    const closeTagPh = new xml.Tag(_PLACEHOLDER_TAG, {name: ph.closeName}, [
      closeEx,
      closeTagAsText,
    ]);

    return [startTagPh, ...this.serialize(ph.children), closeTagPh];
  }

  visitPlaceholder(ph: i18n.Placeholder, context?: any): xml.Node[] {
    const interpolationAsText = new xml.Text(`{{${ph.value}}}`);
    // Example tag needs to be not-empty for TC.
    const exTag = new xml.Tag(_EXAMPLE_TAG, {}, [interpolationAsText]);
    return [
      // TC requires PH to have a non empty EX, and uses the text node to show the "original" value.
      new xml.Tag(_PLACEHOLDER_TAG, {name: ph.name}, [exTag, interpolationAsText]),
    ];
  }

  visitBlockPlaceholder(ph: i18n.BlockPlaceholder, context?: any): xml.Node[] {
    const startAsText = new xml.Text(`@${ph.name}`);
    const startEx = new xml.Tag(_EXAMPLE_TAG, {}, [startAsText]);
    // TC requires PH to have a non empty EX, and uses the text node to show the "original" value.
    const startTagPh = new xml.Tag(_PLACEHOLDER_TAG, {name: ph.startName}, [startEx, startAsText]);

    const closeAsText = new xml.Text(`}`);
    const closeEx = new xml.Tag(_EXAMPLE_TAG, {}, [closeAsText]);
    // TC requires PH to have a non empty EX, and uses the text node to show the "original" value.
    const closeTagPh = new xml.Tag(_PLACEHOLDER_TAG, {name: ph.closeName}, [closeEx, closeAsText]);

    return [startTagPh, ...this.serialize(ph.children), closeTagPh];
  }

  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): xml.Node[] {
    const icuExpression = ph.value.expression;
    const icuType = ph.value.type;
    const icuCases = Object.keys(ph.value.cases)
      .map((value: string) => value + ' {...}')
      .join(' ');
    const icuAsText = new xml.Text(`{${icuExpression}, ${icuType}, ${icuCases}}`);
    const exTag = new xml.Tag(_EXAMPLE_TAG, {}, [icuAsText]);
    return [
      // TC requires PH to have a non empty EX, and uses the text node to show the "original" value.
      new xml.Tag(_PLACEHOLDER_TAG, {name: ph.name}, [exTag, icuAsText]),
    ];
  }

  serialize(nodes: i18n.Node[]): xml.Node[] {
    return [].concat(...nodes.map((node) => node.visit(this)));
  }
}

export function digest(message: i18n.Message): string {
  return decimalDigest(message);
}

// TC requires at least one non-empty example on placeholders
class ExampleVisitor implements xml.IVisitor {
  addDefaultExamples(node: xml.Node): xml.Node {
    node.visit(this);
    return node;
  }

  visitTag(tag: xml.Tag): void {
    if (tag.name === _PLACEHOLDER_TAG) {
      if (!tag.children || tag.children.length == 0) {
        const exText = new xml.Text(tag.attrs['name'] || '...');
        tag.children = [new xml.Tag(_EXAMPLE_TAG, {}, [exText])];
      }
    } else if (tag.children) {
      tag.children.forEach((node) => node.visit(this));
    }
  }

  visitText(text: xml.Text): void {}
  visitDeclaration(decl: xml.Declaration): void {}
  visitDoctype(doctype: xml.Doctype): void {}
}

// XMB/XTB placeholders can only contain A-Z, 0-9 and _
export function toPublicName(internalName: string): string {
  return internalName.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
}
