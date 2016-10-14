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
import {ParseError} from '../../parse_util';
import * as i18n from '../i18n_ast';
import {MessageBundle} from '../message_bundle';

import {Serializer} from './serializer';



// https://www.gnu.org/software/gettext/manual/html_node/PO-Files.html
export class Gettext implements Serializer {
  constructor(private _htmlParser: HtmlParser, private _interpolationConfig: InterpolationConfig) {}

  write(messageMap: {[id: string]: i18n.Message}): string {
    const visitor = new _WriteVisitor();

    const entries: PoEntry[] = [];

    Object.keys(messageMap).forEach(id => {
      const message = messageMap[id];

      // TODO(alfaproject): add file references (#: <file-name>:<line number>)
      const entry: PoEntry = {
        comments: [],
        references: [id],
        msgctxt: message.meaning,
        msgid: visitor.serialize(message.nodes)
      };

      if (message.description) {
        entry.comments.push(message.description);
      }

      entries.push(entry);
    });

    return entries.reduce(
        (template, entry) => template + entry.comments.map(comment => '\n#. ' + comment).join('') +
            entry.references.map(reference => '\n#: ' + reference).join('') +
            (entry.msgctxt ? `\nmsgctxt "${entry.msgctxt.replace(/"/g, '\\"')}"` : '') + `
msgid "${entry.msgid.replace(/"/g, '\\"')}"
msgstr ""
`,
        `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Project-Id-Version: \\n"
`);
  }

  load(content: string, url: string, messageBundle: MessageBundle): {[id: string]: ml.Node[]} {
    const messageMap: {[id: string]: ml.Node[]} = {};
    const parseErrors: ParseError[] = [];

    // Parse the content
    let isMsgIdParsed: boolean;
    let message: PoEntry;
    const lines = content.split('\n');
    lines.forEach((line, lineIndex) => {
      line = line.trim();

      // New message
      if (lineIndex === 0 || line.length === 0) {
        if (message) {
          // Convert the string message to html ast
          const res = this._htmlParser.parse(message.msgstr, url, true, this._interpolationConfig);

          // TODO(alfaproject): map error message back to the original message in gettext
          parseErrors.push(...res.errors);

          // TODO(alfaproject): make sure we are extracting the id from the right reference
          const id = message.references[0];
          if (id) {
            messageMap[id] = res.rootNodes;
          }
        }

        // Start a new message
        message = {
          comments: [],
          references: [],
          msgid: '',
        };
        isMsgIdParsed = false;
        return;
      }

      // Parse current line
      const firstToken = line.substr(0, line.indexOf(' '));
      switch (firstToken) {
        case '#.':
          message.comments.push(line.substr(3));
          return;
        case '#:':
          message.references.push(line.substr(3));
          return;
        case 'msgctxt':
          message.msgctxt = line.substr(9, line.length - 10).replace(/\\"/g, '"');
          return;
        case 'msgid':
          message.msgid = line.substr(7, line.length - 8).replace(/\\"/g, '"');
          return;
        case 'msgstr':
          isMsgIdParsed = true;
          message.msgstr = line.substr(8, line.length - 9).replace(/\\"/g, '"');
          return;
      }

      if (line[0] === '"') {
        line = line.substr(1, line.length - 2).replace(/\\"/g, '"');
        if (isMsgIdParsed) {
          message.msgstr += line;
        } else {
          message.msgid += line;
        }
      }
    });

    if (parseErrors.length) {
      throw new Error(`gettext parse errors:\n${parseErrors.join('\n')}`);
    }

    return messageMap;
  }
}

interface PoEntry {
  comments: string[];
  references: string[];
  msgctxt?: string;
  msgid: string;
  msgstr?: string;
}

class _WriteVisitor implements i18n.Visitor {
  visitText(text: i18n.Text, context?: any): string { return text.value; }

  visitContainer(container: i18n.Container, context?: any): string {
    return container.children.map(child => child.visit(this)).join('');
  }

  visitIcu(icu: i18n.Icu, context?: any): string {
    // TODO(alfaproject): investigate the possibility of using gettext plural for basic ICU plural
    const cases = Object.keys(icu.cases).map((k: string) => `${k} {${icu.cases[k].visit(this)}}`);
    return `{${icu.expression}, ${icu.type}, ${cases.join(', ')}}`;
  }

  visitTagPlaceholder(ph: i18n.TagPlaceholder, context?: any): string {
    let startTag = '<' + ph.tag;

    startTag += Object.keys(ph.attrs).reduce(
        (attributes, attrName) => `${attributes} ${attrName}="${ph.attrs[attrName]}"`, '');

    startTag += '>';

    if (ph.isVoid) {
      // void tags have no children nor closing tags
      return startTag;
    }

    const closeTag = '</' + ph.tag + '>';

    return startTag + ph.children.map(child => child.visit(this)).join('') + closeTag;
  }

  visitPlaceholder(ph: i18n.Placeholder, context?: any): string { return '{{' + ph.value + '}}'; }

  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): string {
    return '{{' + ph.value.visit(this) + '}}';
  }

  serialize(nodes: i18n.Node[]): string { return nodes.map(node => node.visit(this)).join(''); }
}
