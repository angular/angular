/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
class _Visitor {
  visitTag(tag) {
    const strAttrs = this._serializeAttributes(tag.attrs);
    if (tag.children.length == 0) {
      return `<${tag.name}${strAttrs}/>`;
    }
    const strChildren = tag.children.map((node) => node.visit(this));
    return `<${tag.name}${strAttrs}>${strChildren.join('')}</${tag.name}>`;
  }
  visitText(text) {
    return text.value;
  }
  visitDeclaration(decl) {
    return `<?xml${this._serializeAttributes(decl.attrs)} ?>`;
  }
  _serializeAttributes(attrs) {
    const strAttrs = Object.keys(attrs)
      .map((name) => `${name}="${attrs[name]}"`)
      .join(' ');
    return strAttrs.length > 0 ? ' ' + strAttrs : '';
  }
  visitDoctype(doctype) {
    return `<!DOCTYPE ${doctype.rootTag} [\n${doctype.dtd}\n]>`;
  }
}
const _visitor = new _Visitor();
export function serialize(nodes) {
  return nodes.map((node) => node.visit(_visitor)).join('');
}
export class Declaration {
  constructor(unescapedAttrs) {
    this.attrs = {};
    Object.keys(unescapedAttrs).forEach((k) => {
      this.attrs[k] = escapeXml(unescapedAttrs[k]);
    });
  }
  visit(visitor) {
    return visitor.visitDeclaration(this);
  }
}
export class Doctype {
  constructor(rootTag, dtd) {
    this.rootTag = rootTag;
    this.dtd = dtd;
  }
  visit(visitor) {
    return visitor.visitDoctype(this);
  }
}
export class Tag {
  constructor(name, unescapedAttrs = {}, children = []) {
    this.name = name;
    this.children = children;
    this.attrs = {};
    Object.keys(unescapedAttrs).forEach((k) => {
      this.attrs[k] = escapeXml(unescapedAttrs[k]);
    });
  }
  visit(visitor) {
    return visitor.visitTag(this);
  }
}
export class Text {
  constructor(unescapedValue) {
    this.value = escapeXml(unescapedValue);
  }
  visit(visitor) {
    return visitor.visitText(this);
  }
}
export class CR extends Text {
  constructor(ws = 0) {
    super(`\n${new Array(ws + 1).join(' ')}`);
  }
}
const _ESCAPED_CHARS = [
  [/&/g, '&amp;'],
  [/"/g, '&quot;'],
  [/'/g, '&apos;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
];
// Escape `_ESCAPED_CHARS` characters in the given text with encoded entities
export function escapeXml(text) {
  return _ESCAPED_CHARS.reduce((text, entry) => text.replace(entry[0], entry[1]), text);
}
//# sourceMappingURL=xml_helper.js.map
