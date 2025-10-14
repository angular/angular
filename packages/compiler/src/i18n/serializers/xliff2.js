/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ml from '../../ml_parser/ast';
import {XmlParser} from '../../ml_parser/xml_parser';
import {ParseError} from '../../parse_util';
import {decimalDigest} from '../digest';
import * as i18n from '../i18n_ast';
import {Serializer} from './serializer';
import * as xml from './xml_helper';
const _VERSION = '2.0';
const _XMLNS = 'urn:oasis:names:tc:xliff:document:2.0';
// TODO(vicb): make this a param (s/_/-/)
const _DEFAULT_SOURCE_LANG = 'en';
const _PLACEHOLDER_TAG = 'ph';
const _PLACEHOLDER_SPANNING_TAG = 'pc';
const _MARKER_TAG = 'mrk';
const _XLIFF_TAG = 'xliff';
const _SOURCE_TAG = 'source';
const _TARGET_TAG = 'target';
const _UNIT_TAG = 'unit';
// https://docs.oasis-open.org/xliff/xliff-core/v2.0/os/xliff-core-v2.0-os.html
export class Xliff2 extends Serializer {
  write(messages, locale) {
    const visitor = new _WriteVisitor();
    const units = [];
    messages.forEach((message) => {
      const unit = new xml.Tag(_UNIT_TAG, {id: message.id});
      const notes = new xml.Tag('notes');
      if (message.description || message.meaning) {
        if (message.description) {
          notes.children.push(
            new xml.CR(8),
            new xml.Tag('note', {category: 'description'}, [new xml.Text(message.description)]),
          );
        }
        if (message.meaning) {
          notes.children.push(
            new xml.CR(8),
            new xml.Tag('note', {category: 'meaning'}, [new xml.Text(message.meaning)]),
          );
        }
      }
      message.sources.forEach((source) => {
        notes.children.push(
          new xml.CR(8),
          new xml.Tag('note', {category: 'location'}, [
            new xml.Text(
              `${source.filePath}:${source.startLine}${source.endLine !== source.startLine ? ',' + source.endLine : ''}`,
            ),
          ]),
        );
      });
      notes.children.push(new xml.CR(6));
      unit.children.push(new xml.CR(6), notes);
      const segment = new xml.Tag('segment');
      segment.children.push(
        new xml.CR(8),
        new xml.Tag(_SOURCE_TAG, {}, visitor.serialize(message.nodes)),
        new xml.CR(6),
      );
      unit.children.push(new xml.CR(6), segment, new xml.CR(4));
      units.push(new xml.CR(4), unit);
    });
    const file = new xml.Tag('file', {'original': 'ng.template', id: 'ngi18n'}, [
      ...units,
      new xml.CR(2),
    ]);
    const xliff = new xml.Tag(
      _XLIFF_TAG,
      {version: _VERSION, xmlns: _XMLNS, srcLang: locale || _DEFAULT_SOURCE_LANG},
      [new xml.CR(2), file, new xml.CR()],
    );
    return xml.serialize([
      new xml.Declaration({version: '1.0', encoding: 'UTF-8'}),
      new xml.CR(),
      xliff,
      new xml.CR(),
    ]);
  }
  load(content, url) {
    // xliff to xml nodes
    const xliff2Parser = new Xliff2Parser();
    const {locale, msgIdToHtml, errors} = xliff2Parser.parse(content, url);
    // xml nodes to i18n nodes
    const i18nNodesByMsgId = {};
    const converter = new XmlToI18n();
    Object.keys(msgIdToHtml).forEach((msgId) => {
      const {i18nNodes, errors: e} = converter.convert(msgIdToHtml[msgId], url);
      errors.push(...e);
      i18nNodesByMsgId[msgId] = i18nNodes;
    });
    if (errors.length) {
      throw new Error(`xliff2 parse errors:\n${errors.join('\n')}`);
    }
    return {locale: locale, i18nNodesByMsgId};
  }
  digest(message) {
    return decimalDigest(message);
  }
}
class _WriteVisitor {
  constructor() {
    this._nextPlaceholderId = 0;
  }
  visitText(text, context) {
    return [new xml.Text(text.value)];
  }
  visitContainer(container, context) {
    const nodes = [];
    container.children.forEach((node) => nodes.push(...node.visit(this)));
    return nodes;
  }
  visitIcu(icu, context) {
    const nodes = [new xml.Text(`{${icu.expressionPlaceholder}, ${icu.type}, `)];
    Object.keys(icu.cases).forEach((c) => {
      nodes.push(new xml.Text(`${c} {`), ...icu.cases[c].visit(this), new xml.Text(`} `));
    });
    nodes.push(new xml.Text(`}`));
    return nodes;
  }
  visitTagPlaceholder(ph, context) {
    const type = getTypeForTag(ph.tag);
    if (ph.isVoid) {
      const tagPh = new xml.Tag(_PLACEHOLDER_TAG, {
        id: (this._nextPlaceholderId++).toString(),
        equiv: ph.startName,
        type: type,
        disp: `<${ph.tag}/>`,
      });
      return [tagPh];
    }
    const tagPc = new xml.Tag(_PLACEHOLDER_SPANNING_TAG, {
      id: (this._nextPlaceholderId++).toString(),
      equivStart: ph.startName,
      equivEnd: ph.closeName,
      type: type,
      dispStart: `<${ph.tag}>`,
      dispEnd: `</${ph.tag}>`,
    });
    const nodes = [].concat(...ph.children.map((node) => node.visit(this)));
    if (nodes.length) {
      nodes.forEach((node) => tagPc.children.push(node));
    } else {
      tagPc.children.push(new xml.Text(''));
    }
    return [tagPc];
  }
  visitPlaceholder(ph, context) {
    const idStr = (this._nextPlaceholderId++).toString();
    return [
      new xml.Tag(_PLACEHOLDER_TAG, {
        id: idStr,
        equiv: ph.name,
        disp: `{{${ph.value}}}`,
      }),
    ];
  }
  visitBlockPlaceholder(ph, context) {
    const tagPc = new xml.Tag(_PLACEHOLDER_SPANNING_TAG, {
      id: (this._nextPlaceholderId++).toString(),
      equivStart: ph.startName,
      equivEnd: ph.closeName,
      type: 'other',
      dispStart: `@${ph.name}`,
      dispEnd: `}`,
    });
    const nodes = [].concat(...ph.children.map((node) => node.visit(this)));
    if (nodes.length) {
      nodes.forEach((node) => tagPc.children.push(node));
    } else {
      tagPc.children.push(new xml.Text(''));
    }
    return [tagPc];
  }
  visitIcuPlaceholder(ph, context) {
    const cases = Object.keys(ph.value.cases)
      .map((value) => value + ' {...}')
      .join(' ');
    const idStr = (this._nextPlaceholderId++).toString();
    return [
      new xml.Tag(_PLACEHOLDER_TAG, {
        id: idStr,
        equiv: ph.name,
        disp: `{${ph.value.expression}, ${ph.value.type}, ${cases}}`,
      }),
    ];
  }
  serialize(nodes) {
    this._nextPlaceholderId = 0;
    return [].concat(...nodes.map((node) => node.visit(this)));
  }
}
// Extract messages as xml nodes from the xliff file
class Xliff2Parser {
  constructor() {
    this._locale = null;
  }
  parse(xliff, url) {
    this._unitMlString = null;
    this._msgIdToHtml = {};
    const xml = new XmlParser().parse(xliff, url);
    this._errors = xml.errors;
    ml.visitAll(this, xml.rootNodes, null);
    return {
      msgIdToHtml: this._msgIdToHtml,
      errors: this._errors,
      locale: this._locale,
    };
  }
  visitElement(element, context) {
    switch (element.name) {
      case _UNIT_TAG:
        this._unitMlString = null;
        const idAttr = element.attrs.find((attr) => attr.name === 'id');
        if (!idAttr) {
          this._addError(element, `<${_UNIT_TAG}> misses the "id" attribute`);
        } else {
          const id = idAttr.value;
          if (this._msgIdToHtml.hasOwnProperty(id)) {
            this._addError(element, `Duplicated translations for msg ${id}`);
          } else {
            ml.visitAll(this, element.children, null);
            if (typeof this._unitMlString === 'string') {
              this._msgIdToHtml[id] = this._unitMlString;
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
        const innerTextStart = element.startSourceSpan.end.offset;
        const innerTextEnd = element.endSourceSpan.start.offset;
        const content = element.startSourceSpan.start.file.content;
        const innerText = content.slice(innerTextStart, innerTextEnd);
        this._unitMlString = innerText;
        break;
      case _XLIFF_TAG:
        const localeAttr = element.attrs.find((attr) => attr.name === 'trgLang');
        if (localeAttr) {
          this._locale = localeAttr.value;
        }
        const versionAttr = element.attrs.find((attr) => attr.name === 'version');
        if (versionAttr) {
          const version = versionAttr.value;
          if (version !== '2.0') {
            this._addError(
              element,
              `The XLIFF file version ${version} is not compatible with XLIFF 2.0 serializer`,
            );
          } else {
            ml.visitAll(this, element.children, null);
          }
        }
        break;
      default:
        ml.visitAll(this, element.children, null);
    }
  }
  visitAttribute(attribute, context) {}
  visitText(text, context) {}
  visitComment(comment, context) {}
  visitExpansion(expansion, context) {}
  visitExpansionCase(expansionCase, context) {}
  visitBlock(block, context) {}
  visitBlockParameter(parameter, context) {}
  visitLetDeclaration(decl, context) {}
  visitComponent(component, context) {}
  visitDirective(directive, context) {}
  _addError(node, message) {
    this._errors.push(new ParseError(node.sourceSpan, message));
  }
}
// Convert ml nodes (xliff syntax) to i18n nodes
class XmlToI18n {
  convert(message, url) {
    const xmlIcu = new XmlParser().parse(message, url, {tokenizeExpansionForms: true});
    this._errors = xmlIcu.errors;
    const i18nNodes =
      this._errors.length > 0 || xmlIcu.rootNodes.length == 0
        ? []
        : [].concat(...ml.visitAll(this, xmlIcu.rootNodes));
    return {
      i18nNodes,
      errors: this._errors,
    };
  }
  visitText(text, context) {
    return new i18n.Text(text.value, text.sourceSpan);
  }
  visitElement(el, context) {
    switch (el.name) {
      case _PLACEHOLDER_TAG:
        const nameAttr = el.attrs.find((attr) => attr.name === 'equiv');
        if (nameAttr) {
          return [new i18n.Placeholder('', nameAttr.value, el.sourceSpan)];
        }
        this._addError(el, `<${_PLACEHOLDER_TAG}> misses the "equiv" attribute`);
        break;
      case _PLACEHOLDER_SPANNING_TAG:
        const startAttr = el.attrs.find((attr) => attr.name === 'equivStart');
        const endAttr = el.attrs.find((attr) => attr.name === 'equivEnd');
        if (!startAttr) {
          this._addError(el, `<${_PLACEHOLDER_TAG}> misses the "equivStart" attribute`);
        } else if (!endAttr) {
          this._addError(el, `<${_PLACEHOLDER_TAG}> misses the "equivEnd" attribute`);
        } else {
          const startId = startAttr.value;
          const endId = endAttr.value;
          const nodes = [];
          return nodes.concat(
            new i18n.Placeholder('', startId, el.sourceSpan),
            ...el.children.map((node) => node.visit(this, null)),
            new i18n.Placeholder('', endId, el.sourceSpan),
          );
        }
        break;
      case _MARKER_TAG:
        return [].concat(...ml.visitAll(this, el.children));
      default:
        this._addError(el, `Unexpected tag`);
    }
    return null;
  }
  visitExpansion(icu, context) {
    const caseMap = {};
    ml.visitAll(this, icu.cases).forEach((c) => {
      caseMap[c.value] = new i18n.Container(c.nodes, icu.sourceSpan);
    });
    return new i18n.Icu(icu.switchValue, icu.type, caseMap, icu.sourceSpan);
  }
  visitExpansionCase(icuCase, context) {
    return {
      value: icuCase.value,
      nodes: [].concat(...ml.visitAll(this, icuCase.expression)),
    };
  }
  visitComment(comment, context) {}
  visitAttribute(attribute, context) {}
  visitBlock(block, context) {}
  visitBlockParameter(parameter, context) {}
  visitLetDeclaration(decl, context) {}
  visitComponent(component, context) {
    this._addError(component, 'Unexpected node');
  }
  visitDirective(directive, context) {
    this._addError(directive, 'Unexpected node');
  }
  _addError(node, message) {
    this._errors.push(new ParseError(node.sourceSpan, message));
  }
}
function getTypeForTag(tag) {
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
//# sourceMappingURL=xliff2.js.map
