/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RegExpWrapper, isBlank, isPresent} from '../facade/lang';
import {HtmlAst, HtmlElementAst} from '../html_ast';
import {HtmlParser} from '../html_parser';
import {ParseError, ParseSourceSpan} from '../parse_util';

import {Message, id} from './message';

let _PLACEHOLDER_REGEXP = RegExpWrapper.create(`\\<ph(\\s)+name=("(\\w)+")\\/\\>`);
const _ID_ATTR = 'id';
const _MSG_ELEMENT = 'msg';
const _BUNDLE_ELEMENT = 'message-bundle';

export function serializeXmb(messages: Message[]): string {
  let ms = messages.map((m) => _serializeMessage(m)).join('');
  return `<message-bundle>${ms}</message-bundle>`;
}

export class XmbDeserializationResult {
  constructor(
      public content: string, public messages: {[key: string]: HtmlAst[]},
      public errors: ParseError[]) {}
}

export class XmbDeserializationError extends ParseError {
  constructor(span: ParseSourceSpan, msg: string) { super(span, msg); }
}

export function deserializeXmb(content: string, url: string): XmbDeserializationResult {
  const normalizedContent = _expandPlaceholder(content.trim());
  const parsed = new HtmlParser().parse(normalizedContent, url);

  if (parsed.errors.length > 0) {
    return new XmbDeserializationResult(null, {}, parsed.errors);
  }

  if (_checkRootElement(parsed.rootNodes)) {
    return new XmbDeserializationResult(
        null, {}, [new XmbDeserializationError(null, `Missing element "${_BUNDLE_ELEMENT}"`)]);
  }

  const bundleEl = <HtmlElementAst>parsed.rootNodes[0];  // test this
  const errors: ParseError[] = [];
  const messages: {[key: string]: HtmlAst[]} = {};

  _createMessages(bundleEl.children, messages, errors);

  return (errors.length == 0) ?
      new XmbDeserializationResult(normalizedContent, messages, []) :
      new XmbDeserializationResult(null, <{[key: string]: HtmlAst[]}>{}, errors);
}

function _checkRootElement(nodes: HtmlAst[]): boolean {
  return nodes.length < 1 || !(nodes[0] instanceof HtmlElementAst) ||
      (<HtmlElementAst>nodes[0]).name != _BUNDLE_ELEMENT;
}

function _createMessages(
    nodes: HtmlAst[], messages: {[key: string]: HtmlAst[]}, errors: ParseError[]): void {
  nodes.forEach((node) => {
    if (node instanceof HtmlElementAst) {
      let msg = <HtmlElementAst>node;

      if (msg.name != _MSG_ELEMENT) {
        errors.push(
            new XmbDeserializationError(node.sourceSpan, `Unexpected element "${msg.name}"`));
        return;
      }

      let idAttr = msg.attrs.find(a => a.name == _ID_ATTR);

      if (idAttr) {
        messages[idAttr.value] = msg.children;
      } else {
        errors.push(
            new XmbDeserializationError(node.sourceSpan, `"${_ID_ATTR}" attribute is missing`));
      }
    }
  });
}

function _serializeMessage(m: Message): string {
  const desc = isPresent(m.description) ? ` desc='${_escapeXml(m.description)}'` : '';
  const meaning = isPresent(m.meaning) ? ` meaning='${_escapeXml(m.meaning)}'` : '';
  return `<msg id='${id(m)}'${desc}${meaning}>${m.content}</msg>`;
}

function _expandPlaceholder(input: string): string {
  return RegExpWrapper.replaceAll(_PLACEHOLDER_REGEXP, input, (match: string[]) => {
    let nameWithQuotes = match[2];
    return `<ph name=${nameWithQuotes}></ph>`;
  });
}

const _XML_ESCAPED_CHARS: [RegExp, string][] = [
  [/&/g, '&amp;'],
  [/"/g, '&quot;'],
  [/'/g, '&apos;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
];

function _escapeXml(value: string): string {
  return _XML_ESCAPED_CHARS.reduce((value, escape) => value.replace(escape[0], escape[1]), value);
}
