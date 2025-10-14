/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export class NodeWithI18n {
  sourceSpan;
  i18n;
  constructor(sourceSpan, i18n) {
    this.sourceSpan = sourceSpan;
    this.i18n = i18n;
  }
}
export class Text extends NodeWithI18n {
  value;
  tokens;
  constructor(value, sourceSpan, tokens, i18n) {
    super(sourceSpan, i18n);
    this.value = value;
    this.tokens = tokens;
  }
  visit(visitor, context) {
    return visitor.visitText(this, context);
  }
}
export class Expansion extends NodeWithI18n {
  switchValue;
  type;
  cases;
  switchValueSourceSpan;
  constructor(switchValue, type, cases, sourceSpan, switchValueSourceSpan, i18n) {
    super(sourceSpan, i18n);
    this.switchValue = switchValue;
    this.type = type;
    this.cases = cases;
    this.switchValueSourceSpan = switchValueSourceSpan;
  }
  visit(visitor, context) {
    return visitor.visitExpansion(this, context);
  }
}
export class ExpansionCase {
  value;
  expression;
  sourceSpan;
  valueSourceSpan;
  expSourceSpan;
  constructor(value, expression, sourceSpan, valueSourceSpan, expSourceSpan) {
    this.value = value;
    this.expression = expression;
    this.sourceSpan = sourceSpan;
    this.valueSourceSpan = valueSourceSpan;
    this.expSourceSpan = expSourceSpan;
  }
  visit(visitor, context) {
    return visitor.visitExpansionCase(this, context);
  }
}
export class Attribute extends NodeWithI18n {
  name;
  value;
  keySpan;
  valueSpan;
  valueTokens;
  constructor(name, value, sourceSpan, keySpan, valueSpan, valueTokens, i18n) {
    super(sourceSpan, i18n);
    this.name = name;
    this.value = value;
    this.keySpan = keySpan;
    this.valueSpan = valueSpan;
    this.valueTokens = valueTokens;
  }
  visit(visitor, context) {
    return visitor.visitAttribute(this, context);
  }
}
export class Element extends NodeWithI18n {
  name;
  attrs;
  directives;
  children;
  isSelfClosing;
  startSourceSpan;
  endSourceSpan;
  isVoid;
  constructor(
    name,
    attrs,
    directives,
    children,
    isSelfClosing,
    sourceSpan,
    startSourceSpan,
    endSourceSpan = null,
    isVoid,
    i18n,
  ) {
    super(sourceSpan, i18n);
    this.name = name;
    this.attrs = attrs;
    this.directives = directives;
    this.children = children;
    this.isSelfClosing = isSelfClosing;
    this.startSourceSpan = startSourceSpan;
    this.endSourceSpan = endSourceSpan;
    this.isVoid = isVoid;
  }
  visit(visitor, context) {
    return visitor.visitElement(this, context);
  }
}
export class Comment {
  value;
  sourceSpan;
  constructor(value, sourceSpan) {
    this.value = value;
    this.sourceSpan = sourceSpan;
  }
  visit(visitor, context) {
    return visitor.visitComment(this, context);
  }
}
export class Block extends NodeWithI18n {
  name;
  parameters;
  children;
  nameSpan;
  startSourceSpan;
  endSourceSpan;
  constructor(
    name,
    parameters,
    children,
    sourceSpan,
    nameSpan,
    startSourceSpan,
    endSourceSpan = null,
    i18n,
  ) {
    super(sourceSpan, i18n);
    this.name = name;
    this.parameters = parameters;
    this.children = children;
    this.nameSpan = nameSpan;
    this.startSourceSpan = startSourceSpan;
    this.endSourceSpan = endSourceSpan;
  }
  visit(visitor, context) {
    return visitor.visitBlock(this, context);
  }
}
export class Component extends NodeWithI18n {
  componentName;
  tagName;
  fullName;
  attrs;
  directives;
  children;
  isSelfClosing;
  startSourceSpan;
  endSourceSpan;
  constructor(
    componentName,
    tagName,
    fullName,
    attrs,
    directives,
    children,
    isSelfClosing,
    sourceSpan,
    startSourceSpan,
    endSourceSpan = null,
    i18n,
  ) {
    super(sourceSpan, i18n);
    this.componentName = componentName;
    this.tagName = tagName;
    this.fullName = fullName;
    this.attrs = attrs;
    this.directives = directives;
    this.children = children;
    this.isSelfClosing = isSelfClosing;
    this.startSourceSpan = startSourceSpan;
    this.endSourceSpan = endSourceSpan;
  }
  visit(visitor, context) {
    return visitor.visitComponent(this, context);
  }
}
export class Directive {
  name;
  attrs;
  sourceSpan;
  startSourceSpan;
  endSourceSpan;
  constructor(name, attrs, sourceSpan, startSourceSpan, endSourceSpan = null) {
    this.name = name;
    this.attrs = attrs;
    this.sourceSpan = sourceSpan;
    this.startSourceSpan = startSourceSpan;
    this.endSourceSpan = endSourceSpan;
  }
  visit(visitor, context) {
    return visitor.visitDirective(this, context);
  }
}
export class BlockParameter {
  expression;
  sourceSpan;
  constructor(expression, sourceSpan) {
    this.expression = expression;
    this.sourceSpan = sourceSpan;
  }
  visit(visitor, context) {
    return visitor.visitBlockParameter(this, context);
  }
}
export class LetDeclaration {
  name;
  value;
  sourceSpan;
  nameSpan;
  valueSpan;
  constructor(name, value, sourceSpan, nameSpan, valueSpan) {
    this.name = name;
    this.value = value;
    this.sourceSpan = sourceSpan;
    this.nameSpan = nameSpan;
    this.valueSpan = valueSpan;
  }
  visit(visitor, context) {
    return visitor.visitLetDeclaration(this, context);
  }
}
export function visitAll(visitor, nodes, context = null) {
  const result = [];
  const visit = visitor.visit
    ? (ast) => visitor.visit(ast, context) || ast.visit(visitor, context)
    : (ast) => ast.visit(visitor, context);
  nodes.forEach((ast) => {
    const astResult = visit(ast);
    if (astResult) {
      result.push(astResult);
    }
  });
  return result;
}
export class RecursiveVisitor {
  constructor() {}
  visitElement(ast, context) {
    this.visitChildren(context, (visit) => {
      visit(ast.attrs);
      visit(ast.directives);
      visit(ast.children);
    });
  }
  visitAttribute(ast, context) {}
  visitText(ast, context) {}
  visitComment(ast, context) {}
  visitExpansion(ast, context) {
    return this.visitChildren(context, (visit) => {
      visit(ast.cases);
    });
  }
  visitExpansionCase(ast, context) {}
  visitBlock(block, context) {
    this.visitChildren(context, (visit) => {
      visit(block.parameters);
      visit(block.children);
    });
  }
  visitBlockParameter(ast, context) {}
  visitLetDeclaration(decl, context) {}
  visitComponent(component, context) {
    this.visitChildren(context, (visit) => {
      visit(component.attrs);
      visit(component.children);
    });
  }
  visitDirective(directive, context) {
    this.visitChildren(context, (visit) => {
      visit(directive.attrs);
    });
  }
  visitChildren(context, cb) {
    let results = [];
    let t = this;
    function visit(children) {
      if (children) results.push(visitAll(t, children, context));
    }
    cb(visit);
    return Array.prototype.concat.apply([], results);
  }
}
//# sourceMappingURL=ast.js.map
