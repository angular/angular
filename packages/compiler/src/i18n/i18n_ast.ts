/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ParseSourceSpan} from '../parse_util';

/**
 * Describes the text contents of a placeholder as it appears in an ICU expression, including its
 * source span information.
 */
export interface MessagePlaceholder {
  /** The text contents of the placeholder */
  text: string;

  /** The source span of the placeholder */
  sourceSpan: ParseSourceSpan;
}

export class Message {
  sources: MessageSpan[];
  id: string;
  /** The ids to use if there are no custom id and if `i18nLegacyMessageIdFormat` is not empty */
  legacyIds: string[] = [];

  messageString: string;

  /**
   * @param nodes message AST
   * @param placeholders maps placeholder names to static content and their source spans
   * @param placeholderToMessage maps placeholder names to messages (used for nested ICU messages)
   * @param meaning
   * @param description
   * @param customId
   */
  constructor(
    public nodes: Node[],
    public placeholders: {[phName: string]: MessagePlaceholder},
    public placeholderToMessage: {[phName: string]: Message},
    public meaning: string,
    public description: string,
    public customId: string,
  ) {
    this.id = this.customId;
    this.messageString = serializeMessage(this.nodes);

    if (nodes.length) {
      this.sources = [
        {
          filePath: nodes[0].sourceSpan.start.file.url,
          startLine: nodes[0].sourceSpan.start.line + 1,
          startCol: nodes[0].sourceSpan.start.col + 1,
          endLine: nodes[nodes.length - 1].sourceSpan.end.line + 1,
          endCol: nodes[0].sourceSpan.start.col + 1,
        },
      ];
    } else {
      this.sources = [];
    }
  }
}

// line and columns indexes are 1 based
export interface MessageSpan {
  filePath: string;
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
}

export interface Node {
  sourceSpan: ParseSourceSpan;
  visit(visitor: Visitor, context?: any): any;
}

export class Text implements Node {
  constructor(
    public value: string,
    public sourceSpan: ParseSourceSpan,
  ) {}

  visit(visitor: Visitor, context?: any): any {
    return visitor.visitText(this, context);
  }
}

// TODO(vicb): do we really need this node (vs an array) ?
export class Container implements Node {
  constructor(
    public children: Node[],
    public sourceSpan: ParseSourceSpan,
  ) {}

  visit(visitor: Visitor, context?: any): any {
    return visitor.visitContainer(this, context);
  }
}

export class Icu implements Node {
  constructor(
    public expression: string,
    public type: string,
    public cases: {[k: string]: Node},
    public sourceSpan: ParseSourceSpan,
    public expressionPlaceholder?: string,
  ) {}

  visit(visitor: Visitor, context?: any): any {
    return visitor.visitIcu(this, context);
  }
}

export class TagPlaceholder implements Node {
  constructor(
    public tag: string,
    public attrs: {[k: string]: string},
    public startName: string,
    public closeName: string,
    public children: Node[],
    public isVoid: boolean,
    // TODO sourceSpan should cover all (we need a startSourceSpan and endSourceSpan)
    public sourceSpan: ParseSourceSpan,
    public startSourceSpan: ParseSourceSpan | null,
    public endSourceSpan: ParseSourceSpan | null,
  ) {}

  visit(visitor: Visitor, context?: any): any {
    return visitor.visitTagPlaceholder(this, context);
  }
}

export class Placeholder implements Node {
  constructor(
    public value: string,
    public name: string,
    public sourceSpan: ParseSourceSpan,
  ) {}

  visit(visitor: Visitor, context?: any): any {
    return visitor.visitPlaceholder(this, context);
  }
}

export class IcuPlaceholder implements Node {
  /** Used to capture a message computed from a previous processing pass (see `setI18nRefs()`). */
  previousMessage?: Message;
  constructor(
    public value: Icu,
    public name: string,
    public sourceSpan: ParseSourceSpan,
  ) {}

  visit(visitor: Visitor, context?: any): any {
    return visitor.visitIcuPlaceholder(this, context);
  }
}

export class BlockPlaceholder implements Node {
  constructor(
    public name: string,
    public parameters: string[],
    public startName: string,
    public closeName: string,
    public children: Node[],
    public sourceSpan: ParseSourceSpan,
    public startSourceSpan: ParseSourceSpan | null,
    public endSourceSpan: ParseSourceSpan | null,
  ) {}

  visit(visitor: Visitor, context?: any): any {
    return visitor.visitBlockPlaceholder(this, context);
  }
}

/**
 * Each HTML node that is affect by an i18n tag will also have an `i18n` property that is of type
 * `I18nMeta`.
 * This information is either a `Message`, which indicates it is the root of an i18n message, or a
 * `Node`, which indicates is it part of a containing `Message`.
 */
export type I18nMeta = Message | Node;

export interface Visitor {
  visitText(text: Text, context?: any): any;
  visitContainer(container: Container, context?: any): any;
  visitIcu(icu: Icu, context?: any): any;
  visitTagPlaceholder(ph: TagPlaceholder, context?: any): any;
  visitPlaceholder(ph: Placeholder, context?: any): any;
  visitIcuPlaceholder(ph: IcuPlaceholder, context?: any): any;
  visitBlockPlaceholder(ph: BlockPlaceholder, context?: any): any;
}

// Clone the AST
export class CloneVisitor implements Visitor {
  visitText(text: Text, context?: any): Text {
    return new Text(text.value, text.sourceSpan);
  }

  visitContainer(container: Container, context?: any): Container {
    const children = container.children.map((n) => n.visit(this, context));
    return new Container(children, container.sourceSpan);
  }

  visitIcu(icu: Icu, context?: any): Icu {
    const cases: {[k: string]: Node} = {};
    Object.keys(icu.cases).forEach((key) => (cases[key] = icu.cases[key].visit(this, context)));
    const msg = new Icu(icu.expression, icu.type, cases, icu.sourceSpan, icu.expressionPlaceholder);
    return msg;
  }

  visitTagPlaceholder(ph: TagPlaceholder, context?: any): TagPlaceholder {
    const children = ph.children.map((n) => n.visit(this, context));
    return new TagPlaceholder(
      ph.tag,
      ph.attrs,
      ph.startName,
      ph.closeName,
      children,
      ph.isVoid,
      ph.sourceSpan,
      ph.startSourceSpan,
      ph.endSourceSpan,
    );
  }

  visitPlaceholder(ph: Placeholder, context?: any): Placeholder {
    return new Placeholder(ph.value, ph.name, ph.sourceSpan);
  }

  visitIcuPlaceholder(ph: IcuPlaceholder, context?: any): IcuPlaceholder {
    return new IcuPlaceholder(ph.value, ph.name, ph.sourceSpan);
  }

  visitBlockPlaceholder(ph: BlockPlaceholder, context?: any): BlockPlaceholder {
    const children = ph.children.map((n) => n.visit(this, context));
    return new BlockPlaceholder(
      ph.name,
      ph.parameters,
      ph.startName,
      ph.closeName,
      children,
      ph.sourceSpan,
      ph.startSourceSpan,
      ph.endSourceSpan,
    );
  }
}

// Visit all the nodes recursively
export class RecurseVisitor implements Visitor {
  visitText(text: Text, context?: any): any {}

  visitContainer(container: Container, context?: any): any {
    container.children.forEach((child) => child.visit(this));
  }

  visitIcu(icu: Icu, context?: any): any {
    Object.keys(icu.cases).forEach((k) => {
      icu.cases[k].visit(this);
    });
  }

  visitTagPlaceholder(ph: TagPlaceholder, context?: any): any {
    ph.children.forEach((child) => child.visit(this));
  }

  visitPlaceholder(ph: Placeholder, context?: any): any {}

  visitIcuPlaceholder(ph: IcuPlaceholder, context?: any): any {}

  visitBlockPlaceholder(ph: BlockPlaceholder, context?: any): any {
    ph.children.forEach((child) => child.visit(this));
  }
}

/**
 * Serialize the message to the Localize backtick string format that would appear in compiled code.
 */
function serializeMessage(messageNodes: Node[]): string {
  const visitor = new LocalizeMessageStringVisitor();
  const str = messageNodes.map((n) => n.visit(visitor)).join('');
  return str;
}

class LocalizeMessageStringVisitor implements Visitor {
  visitText(text: Text): any {
    return text.value;
  }

  visitContainer(container: Container): any {
    return container.children.map((child) => child.visit(this)).join('');
  }

  visitIcu(icu: Icu): any {
    const strCases = Object.keys(icu.cases).map(
      (k: string) => `${k} {${icu.cases[k].visit(this)}}`,
    );
    return `{${icu.expressionPlaceholder}, ${icu.type}, ${strCases.join(' ')}}`;
  }

  visitTagPlaceholder(ph: TagPlaceholder): any {
    const children = ph.children.map((child) => child.visit(this)).join('');
    return `{$${ph.startName}}${children}{$${ph.closeName}}`;
  }

  visitPlaceholder(ph: Placeholder): any {
    return `{$${ph.name}}`;
  }

  visitIcuPlaceholder(ph: IcuPlaceholder): any {
    return `{$${ph.name}}`;
  }

  visitBlockPlaceholder(ph: BlockPlaceholder): any {
    const children = ph.children.map((child) => child.visit(this)).join('');
    return `{$${ph.startName}}${children}{$${ph.closeName}}`;
  }
}
