/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export class Message {
  /**
   * @param nodes message AST
   * @param placeholders maps placeholder names to static content and their source spans
   * @param placeholderToMessage maps placeholder names to messages (used for nested ICU messages)
   * @param meaning
   * @param description
   * @param customId
   */
  constructor(nodes, placeholders, placeholderToMessage, meaning, description, customId) {
    this.nodes = nodes;
    this.placeholders = placeholders;
    this.placeholderToMessage = placeholderToMessage;
    this.meaning = meaning;
    this.description = description;
    this.customId = customId;
    /** The ids to use if there are no custom id and if `i18nLegacyMessageIdFormat` is not empty */
    this.legacyIds = [];
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
export class Text {
  constructor(value, sourceSpan) {
    this.value = value;
    this.sourceSpan = sourceSpan;
  }
  visit(visitor, context) {
    return visitor.visitText(this, context);
  }
}
// TODO(vicb): do we really need this node (vs an array) ?
export class Container {
  constructor(children, sourceSpan) {
    this.children = children;
    this.sourceSpan = sourceSpan;
  }
  visit(visitor, context) {
    return visitor.visitContainer(this, context);
  }
}
export class Icu {
  constructor(expression, type, cases, sourceSpan, expressionPlaceholder) {
    this.expression = expression;
    this.type = type;
    this.cases = cases;
    this.sourceSpan = sourceSpan;
    this.expressionPlaceholder = expressionPlaceholder;
  }
  visit(visitor, context) {
    return visitor.visitIcu(this, context);
  }
}
export class TagPlaceholder {
  constructor(
    tag,
    attrs,
    startName,
    closeName,
    children,
    isVoid,
    // TODO sourceSpan should cover all (we need a startSourceSpan and endSourceSpan)
    sourceSpan,
    startSourceSpan,
    endSourceSpan,
  ) {
    this.tag = tag;
    this.attrs = attrs;
    this.startName = startName;
    this.closeName = closeName;
    this.children = children;
    this.isVoid = isVoid;
    this.sourceSpan = sourceSpan;
    this.startSourceSpan = startSourceSpan;
    this.endSourceSpan = endSourceSpan;
  }
  visit(visitor, context) {
    return visitor.visitTagPlaceholder(this, context);
  }
}
export class Placeholder {
  constructor(value, name, sourceSpan) {
    this.value = value;
    this.name = name;
    this.sourceSpan = sourceSpan;
  }
  visit(visitor, context) {
    return visitor.visitPlaceholder(this, context);
  }
}
export class IcuPlaceholder {
  constructor(value, name, sourceSpan) {
    this.value = value;
    this.name = name;
    this.sourceSpan = sourceSpan;
  }
  visit(visitor, context) {
    return visitor.visitIcuPlaceholder(this, context);
  }
}
export class BlockPlaceholder {
  constructor(
    name,
    parameters,
    startName,
    closeName,
    children,
    sourceSpan,
    startSourceSpan,
    endSourceSpan,
  ) {
    this.name = name;
    this.parameters = parameters;
    this.startName = startName;
    this.closeName = closeName;
    this.children = children;
    this.sourceSpan = sourceSpan;
    this.startSourceSpan = startSourceSpan;
    this.endSourceSpan = endSourceSpan;
  }
  visit(visitor, context) {
    return visitor.visitBlockPlaceholder(this, context);
  }
}
// Clone the AST
export class CloneVisitor {
  visitText(text, context) {
    return new Text(text.value, text.sourceSpan);
  }
  visitContainer(container, context) {
    const children = container.children.map((n) => n.visit(this, context));
    return new Container(children, container.sourceSpan);
  }
  visitIcu(icu, context) {
    const cases = {};
    Object.keys(icu.cases).forEach((key) => (cases[key] = icu.cases[key].visit(this, context)));
    const msg = new Icu(icu.expression, icu.type, cases, icu.sourceSpan, icu.expressionPlaceholder);
    return msg;
  }
  visitTagPlaceholder(ph, context) {
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
  visitPlaceholder(ph, context) {
    return new Placeholder(ph.value, ph.name, ph.sourceSpan);
  }
  visitIcuPlaceholder(ph, context) {
    return new IcuPlaceholder(ph.value, ph.name, ph.sourceSpan);
  }
  visitBlockPlaceholder(ph, context) {
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
export class RecurseVisitor {
  visitText(text, context) {}
  visitContainer(container, context) {
    container.children.forEach((child) => child.visit(this));
  }
  visitIcu(icu, context) {
    Object.keys(icu.cases).forEach((k) => {
      icu.cases[k].visit(this);
    });
  }
  visitTagPlaceholder(ph, context) {
    ph.children.forEach((child) => child.visit(this));
  }
  visitPlaceholder(ph, context) {}
  visitIcuPlaceholder(ph, context) {}
  visitBlockPlaceholder(ph, context) {
    ph.children.forEach((child) => child.visit(this));
  }
}
/**
 * Serialize the message to the Localize backtick string format that would appear in compiled code.
 */
function serializeMessage(messageNodes) {
  const visitor = new LocalizeMessageStringVisitor();
  const str = messageNodes.map((n) => n.visit(visitor)).join('');
  return str;
}
class LocalizeMessageStringVisitor {
  visitText(text) {
    return text.value;
  }
  visitContainer(container) {
    return container.children.map((child) => child.visit(this)).join('');
  }
  visitIcu(icu) {
    const strCases = Object.keys(icu.cases).map((k) => `${k} {${icu.cases[k].visit(this)}}`);
    return `{${icu.expressionPlaceholder}, ${icu.type}, ${strCases.join(' ')}}`;
  }
  visitTagPlaceholder(ph) {
    const children = ph.children.map((child) => child.visit(this)).join('');
    return `{$${ph.startName}}${children}{$${ph.closeName}}`;
  }
  visitPlaceholder(ph) {
    return `{$${ph.name}}`;
  }
  visitIcuPlaceholder(ph) {
    return `{$${ph.name}}`;
  }
  visitBlockPlaceholder(ph) {
    const children = ph.children.map((child) => child.visit(this)).join('');
    return `{$${ph.startName}}${children}{$${ph.closeName}}`;
  }
}
//# sourceMappingURL=i18n_ast.js.map
