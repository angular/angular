/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

interface Options {
  selfClosing?: boolean;
  preserveWhitespace?: boolean;
}

export class XmlFile {
  private output = '<?xml version="1.0" encoding="UTF-8" ?>\n';
  private indent = '';
  private elements: string[] = [];
  private preservingWhitespace = false;
  toString() {
    return this.output;
  }

  startTag(
      name: string, attributes: Record<string, string|undefined> = {},
      {selfClosing = false, preserveWhitespace}: Options = {}): this {
    if (!this.preservingWhitespace) {
      this.output += this.indent;
    }

    this.output += `<${name}`;

    for (const [attrName, attrValue] of Object.entries(attributes)) {
      if (attrValue) {
        this.output += ` ${attrName}="${escapeXml(attrValue)}"`;
      }
    }

    if (selfClosing) {
      this.output += '/>';
    } else {
      this.output += '>';
      this.elements.push(name);
      this.incIndent();
    }

    if (preserveWhitespace !== undefined) {
      this.preservingWhitespace = preserveWhitespace;
    }
    if (!this.preservingWhitespace) {
      this.output += `\n`;
    }
    return this;
  }

  endTag(name: string, {preserveWhitespace}: Options = {}): this {
    const expectedTag = this.elements.pop();
    if (expectedTag !== name) {
      throw new Error(`Unexpected closing tag: "${name}", expected: "${expectedTag}"`);
    }

    this.decIndent();

    if (!this.preservingWhitespace) {
      this.output += this.indent;
    }
    this.output += `</${name}>`;

    if (preserveWhitespace !== undefined) {
      this.preservingWhitespace = preserveWhitespace;
    }
    if (!this.preservingWhitespace) {
      this.output += `\n`;
    }
    return this;
  }

  text(str: string): this {
    this.output += escapeXml(str);
    return this;
  }

  rawText(str: string): this {
    this.output += str;
    return this;
  }

  private incIndent() {
    this.indent = this.indent + '  ';
  }
  private decIndent() {
    this.indent = this.indent.slice(0, -2);
  }
}

const _ESCAPED_CHARS: [RegExp, string][] = [
  [/&/g, '&amp;'],
  [/"/g, '&quot;'],
  [/'/g, '&apos;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
];

function escapeXml(text: string): string {
  return _ESCAPED_CHARS.reduce(
      (text: string, entry: [RegExp, string]) => text.replace(entry[0], entry[1]), text);
}