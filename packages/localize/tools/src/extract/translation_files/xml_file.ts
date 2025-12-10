/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
    name: string,
    attributes: Record<string, string | undefined> = {},
    {selfClosing = false, preserveWhitespace}: Options = {},
  ): this {
    if (!this.preservingWhitespace) {
      this.output += this.indent;
    }

    this.output += `<${name}`;

    // Attributes escape uses escapeXmlAttribute (still escapes double quotes)
    for (const [attrName, attrValue] of Object.entries(attributes)) {
      if (attrValue) {
        this.output += ` ${attrName}="${escapeXmlAttribute(attrValue)}"`;
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
    // Text escape uses escapeXmlText, does not escape double quotes
    this.output += escapeXmlText(str);
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
// Helper for attributes
const _ESCAPED_ATTR_CHARS: [RegExp, string][] = [
  [/&/g, '&amp;'],
  [/"/g, '&quot;'],
  [/'/g, '&apos;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
];
// Helper for text nodes
const _ESCAPED_TEXT_CHARS: [RegExp, string][] = [
  [/&/g, '&amp;'],
  [/'/g, '&apos;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
];

function escapeXmlAttribute(text: string): string {
  return _ESCAPED_ATTR_CHARS.reduce((t, [re, rep]) => t.replace(re, rep), text);
}

function escapeXmlText(text: string): string {
  return _ESCAPED_TEXT_CHARS.reduce((t, [re, rep]) => t.replace(re, rep), text);
}
