/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface IVisitor {
  visitTag(tag: Tag): any;
  visitText(text: Text): any;
  visitDeclaration(decl: Declaration): any;
  visitDoctype(doctype: Doctype): any;
}

class _Visitor implements IVisitor {
  visitTag(tag: Tag): string {
    const strAttrs = this._serializeAttributes(tag.attrs);

    if (tag.children.length == 0) {
      return `<${tag.name}${strAttrs}/>`;
    }

    const strChildren = tag.children.map(node => node.visit(this));
    return `<${tag.name}${strAttrs}>${strChildren.join('')}</${tag.name}>`;
  }

  visitText(text: Text): string {
    return text.value;
  }

  visitDeclaration(decl: Declaration): string {
    return `<?xml${this._serializeAttributes(decl.attrs)} ?>`;
  }

  private _serializeAttributes(attrs: {[k: string]: string}) {
    const strAttrs = Object.keys(attrs).map((name: string) => `${name}="${attrs[name]}"`).join(' ');
    return strAttrs.length > 0 ? ' ' + strAttrs : '';
  }

  visitDoctype(doctype: Doctype): any {
    return `<!DOCTYPE ${doctype.rootTag} [\n${doctype.dtd}\n]>`;
  }
}

const _visitor = new _Visitor();

export function serialize(nodes: Node[]): string {
  return nodes.map((node: Node): string => node.visit(_visitor)).join('');
}

export interface Node {
  visit(visitor: IVisitor): any;
}

export class Declaration implements Node {
  public attrs: {[k: string]: string} = {};

  constructor(unescapedAttrs: {[k: string]: string}) {
    Object.keys(unescapedAttrs).forEach((k: string) => {
      this.attrs[k] = escapeXml(unescapedAttrs[k]);
    });
  }

  visit(visitor: IVisitor): any {
    return visitor.visitDeclaration(this);
  }
}

export class Doctype implements Node {
  constructor(public rootTag: string, public dtd: string) {}

  visit(visitor: IVisitor): any {
    return visitor.visitDoctype(this);
  }
}

export class Tag implements Node {
  public attrs: {[k: string]: string} = {};

  constructor(
      public name: string, unescapedAttrs: {[k: string]: string} = {},
      public children: Node[] = []) {
    Object.keys(unescapedAttrs).forEach((k: string) => {
      this.attrs[k] = escapeXml(unescapedAttrs[k]);
    });
  }

  visit(visitor: IVisitor): any {
    return visitor.visitTag(this);
  }
}

export class Text implements Node {
  value: string;
  constructor(unescapedValue: string) {
    this.value = escapeXml(unescapedValue);
  }

  visit(visitor: IVisitor): any {
    return visitor.visitText(this);
  }
}

export class CR extends Text {
  constructor(ws: number = 0) {
    super(`\n${new Array(ws + 1).join(' ')}`);
  }
}

const _ESCAPED_CHARS: [RegExp, string][] = [
  [/&/g, '&amp;'],
  [/"/g, '&quot;'],
  [/'/g, '&apos;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
];

// Escape `_ESCAPED_CHARS` characters in the given text with encoded entities
export function escapeXml(text: string): string {
  return _ESCAPED_CHARS.reduce(
      (text: string, entry: [RegExp, string]) => text.replace(entry[0], entry[1]), text);
}
