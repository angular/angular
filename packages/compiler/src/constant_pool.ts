/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from './output/output_ast';
import {I18nMeta, parseI18nMeta} from './render3/view/i18n';
import {OutputContext, error} from './util';

const CONSTANT_PREFIX = '_c';

// Closure variables holding messages must be named `MSG_[A-Z0-9]+`
const TRANSLATION_PREFIX = 'MSG_';

export const enum DefinitionKind {Injector, Directive, Component, Pipe}

/**
 * Closure uses `goog.getMsg(message)` to lookup translations
 */
const GOOG_GET_MSG = 'goog.getMsg';

/**
 * Context to use when producing a key.
 *
 * This ensures we see the constant not the reference variable when producing
 * a key.
 */
const KEY_CONTEXT = {};

/**
 * A node that is a place-holder that allows the node to be replaced when the actual
 * node is known.
 *
 * This allows the constant pool to change an expression from a direct reference to
 * a constant to a shared constant. It returns a fix-up node that is later allowed to
 * change the referenced expression.
 */
class FixupExpression extends o.Expression {
  private original: o.Expression;

  // TODO(issue/24571): remove '!'.
  shared !: boolean;

  constructor(public resolved: o.Expression) {
    super(resolved.type);
    this.original = resolved;
  }

  visitExpression(visitor: o.ExpressionVisitor, context: any): any {
    if (context === KEY_CONTEXT) {
      // When producing a key we want to traverse the constant not the
      // variable used to refer to it.
      return this.original.visitExpression(visitor, context);
    } else {
      return this.resolved.visitExpression(visitor, context);
    }
  }

  isEquivalent(e: o.Expression): boolean {
    return e instanceof FixupExpression && this.resolved.isEquivalent(e.resolved);
  }

  isConstant() { return true; }

  fixup(expression: o.Expression) {
    this.resolved = expression;
    this.shared = true;
  }
}

/**
 * A constant pool allows a code emitter to share constant in an output context.
 *
 * The constant pool also supports sharing access to ivy definitions references.
 */
export class ConstantPool {
  statements: o.Statement[] = [];
  private translations = new Map<string, o.Expression>();
  private deferredTranslations = new Map<o.ReadVarExpr, number>();
  private literals = new Map<string, FixupExpression>();
  private literalFactories = new Map<string, o.Expression>();
  private injectorDefinitions = new Map<any, FixupExpression>();
  private directiveDefinitions = new Map<any, FixupExpression>();
  private componentDefinitions = new Map<any, FixupExpression>();
  private pipeDefinitions = new Map<any, FixupExpression>();

  private nextNameIndex = 0;

  getConstLiteral(literal: o.Expression, forceShared?: boolean): o.Expression {
    if (literal instanceof o.LiteralExpr || literal instanceof FixupExpression) {
      // Do no put simple literals into the constant pool or try to produce a constant for a
      // reference to a constant.
      return literal;
    }
    const key = this.keyOf(literal);
    let fixup = this.literals.get(key);
    let newValue = false;
    if (!fixup) {
      fixup = new FixupExpression(literal);
      this.literals.set(key, fixup);
      newValue = true;
    }

    if ((!newValue && !fixup.shared) || (newValue && forceShared)) {
      // Replace the expression with a variable
      const name = this.freshName();
      this.statements.push(
          o.variable(name).set(literal).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
      fixup.fixup(o.variable(name));
    }

    return fixup;
  }

  getDeferredTranslationConst(suffix: string): o.ReadVarExpr {
    const index = this.statements.push(new o.ExpressionStatement(o.NULL_EXPR)) - 1;
    const variable = o.variable(this.freshTranslationName(suffix));
    this.deferredTranslations.set(variable, index);
    return variable;
  }

  setDeferredTranslationConst(variable: o.ReadVarExpr, message: string): void {
    const index = this.deferredTranslations.get(variable) !;
    this.statements[index] = this.getTranslationDeclStmt(variable, message);
  }

  getTranslationDeclStmt(variable: o.ReadVarExpr, message: string): o.DeclareVarStmt {
    const fnCall = o.variable(GOOG_GET_MSG).callFn([o.literal(message)]);
    return variable.set(fnCall).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]);
  }

  appendTranslationMeta(meta: string|I18nMeta) {
    const parsedMeta = typeof meta === 'string' ? parseI18nMeta(meta) : meta;
    const docStmt = i18nMetaToDocStmt(parsedMeta);
    if (docStmt) {
      this.statements.push(docStmt);
    }
  }

  // Generates closure specific code for translation.
  //
  // ```
  // /**
  //  * @desc description?
  //  * @meaning meaning?
  //  */
  // const MSG_XYZ = goog.getMsg('message');
  // ```
  getTranslation(message: string, meta: string, suffix: string): o.Expression {
    const parsedMeta = parseI18nMeta(meta);

    // The identity of an i18n message depends on the message and its meaning
    const key = parsedMeta.meaning ? `${message}\u0000\u0000${parsedMeta.meaning}` : message;

    const exp = this.translations.get(key);

    if (exp) {
      return exp;
    }

    const variable = o.variable(this.freshTranslationName(suffix));
    this.appendTranslationMeta(parsedMeta);
    this.statements.push(this.getTranslationDeclStmt(variable, message));

    this.translations.set(key, variable);
    return variable;
  }

  getDefinition(type: any, kind: DefinitionKind, ctx: OutputContext, forceShared: boolean = false):
      o.Expression {
    const definitions = this.definitionsOf(kind);
    let fixup = definitions.get(type);
    let newValue = false;
    if (!fixup) {
      const property = this.propertyNameOf(kind);
      fixup = new FixupExpression(ctx.importExpr(type).prop(property));
      definitions.set(type, fixup);
      newValue = true;
    }

    if ((!newValue && !fixup.shared) || (newValue && forceShared)) {
      const name = this.freshName();
      this.statements.push(
          o.variable(name).set(fixup.resolved).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
      fixup.fixup(o.variable(name));
    }
    return fixup;
  }

  getLiteralFactory(literal: o.LiteralArrayExpr|o.LiteralMapExpr):
      {literalFactory: o.Expression, literalFactoryArguments: o.Expression[]} {
    // Create a pure function that builds an array of a mix of constant  and variable expressions
    if (literal instanceof o.LiteralArrayExpr) {
      const argumentsForKey = literal.entries.map(e => e.isConstant() ? e : o.literal(null));
      const key = this.keyOf(o.literalArr(argumentsForKey));
      return this._getLiteralFactory(key, literal.entries, entries => o.literalArr(entries));
    } else {
      const expressionForKey = o.literalMap(
          literal.entries.map(e => ({
                                key: e.key,
                                value: e.value.isConstant() ? e.value : o.literal(null),
                                quoted: e.quoted
                              })));
      const key = this.keyOf(expressionForKey);
      return this._getLiteralFactory(
          key, literal.entries.map(e => e.value),
          entries => o.literalMap(entries.map((value, index) => ({
                                                key: literal.entries[index].key,
                                                value,
                                                quoted: literal.entries[index].quoted
                                              }))));
    }
  }

  private _getLiteralFactory(
      key: string, values: o.Expression[], resultMap: (parameters: o.Expression[]) => o.Expression):
      {literalFactory: o.Expression, literalFactoryArguments: o.Expression[]} {
    let literalFactory = this.literalFactories.get(key);
    const literalFactoryArguments = values.filter((e => !e.isConstant()));
    if (!literalFactory) {
      const resultExpressions = values.map(
          (e, index) => e.isConstant() ? this.getConstLiteral(e, true) : o.variable(`a${index}`));
      const parameters =
          resultExpressions.filter(isVariable).map(e => new o.FnParam(e.name !, o.DYNAMIC_TYPE));
      const pureFunctionDeclaration =
          o.fn(parameters, [new o.ReturnStatement(resultMap(resultExpressions))], o.INFERRED_TYPE);
      const name = this.freshName();
      this.statements.push(
          o.variable(name).set(pureFunctionDeclaration).toDeclStmt(o.INFERRED_TYPE, [
            o.StmtModifier.Final
          ]));
      literalFactory = o.variable(name);
      this.literalFactories.set(key, literalFactory);
    }
    return {literalFactory, literalFactoryArguments};
  }

  /**
   * Produce a unique name.
   *
   * The name might be unique among different prefixes if any of the prefixes end in
   * a digit so the prefix should be a constant string (not based on user input) and
   * must not end in a digit.
   */
  uniqueName(prefix: string): string { return `${prefix}${this.nextNameIndex++}`; }

  private definitionsOf(kind: DefinitionKind): Map<any, FixupExpression> {
    switch (kind) {
      case DefinitionKind.Component:
        return this.componentDefinitions;
      case DefinitionKind.Directive:
        return this.directiveDefinitions;
      case DefinitionKind.Injector:
        return this.injectorDefinitions;
      case DefinitionKind.Pipe:
        return this.pipeDefinitions;
    }
    error(`Unknown definition kind ${kind}`);
    return this.componentDefinitions;
  }

  public propertyNameOf(kind: DefinitionKind): string {
    switch (kind) {
      case DefinitionKind.Component:
        return 'ngComponentDef';
      case DefinitionKind.Directive:
        return 'ngDirectiveDef';
      case DefinitionKind.Injector:
        return 'ngInjectorDef';
      case DefinitionKind.Pipe:
        return 'ngPipeDef';
    }
    error(`Unknown definition kind ${kind}`);
    return '<unknown>';
  }

  private freshName(): string { return this.uniqueName(CONSTANT_PREFIX); }

  private freshTranslationName(suffix: string): string {
    return this.uniqueName(TRANSLATION_PREFIX + suffix).toUpperCase();
  }

  private keyOf(expression: o.Expression) {
    return expression.visitExpression(new KeyVisitor(), KEY_CONTEXT);
  }
}

/**
 * Visitor used to determine if 2 expressions are equivalent and can be shared in the
 * `ConstantPool`.
 *
 * When the id (string) generated by the visitor is equal, expressions are considered equivalent.
 */
class KeyVisitor implements o.ExpressionVisitor {
  visitLiteralExpr(ast: o.LiteralExpr): string {
    return `${typeof ast.value === 'string' ? '"' + ast.value + '"' : ast.value}`;
  }

  visitLiteralArrayExpr(ast: o.LiteralArrayExpr, context: object): string {
    return `[${ast.entries.map(entry => entry.visitExpression(this, context)).join(',')}]`;
  }

  visitLiteralMapExpr(ast: o.LiteralMapExpr, context: object): string {
    const mapKey = (entry: o.LiteralMapEntry) => {
      const quote = entry.quoted ? '"' : '';
      return `${quote}${entry.key}${quote}`;
    };
    const mapEntry = (entry: o.LiteralMapEntry) =>
        `${mapKey(entry)}:${entry.value.visitExpression(this, context)}`;
    return `{${ast.entries.map(mapEntry).join(',')}`;
  }

  visitExternalExpr(ast: o.ExternalExpr): string {
    return ast.value.moduleName ? `EX:${ast.value.moduleName}:${ast.value.name}` :
                                  `EX:${ast.value.runtime.name}`;
  }

  visitReadVarExpr(node: o.ReadVarExpr) { return `VAR:${node.name}`; }

  visitTypeofExpr(node: o.TypeofExpr, context: any): string {
    return `TYPEOF:${node.expr.visitExpression(this, context)}`;
  }

  visitWrappedNodeExpr = invalid;
  visitWriteVarExpr = invalid;
  visitWriteKeyExpr = invalid;
  visitWritePropExpr = invalid;
  visitInvokeMethodExpr = invalid;
  visitInvokeFunctionExpr = invalid;
  visitInstantiateExpr = invalid;
  visitConditionalExpr = invalid;
  visitNotExpr = invalid;
  visitAssertNotNullExpr = invalid;
  visitCastExpr = invalid;
  visitFunctionExpr = invalid;
  visitBinaryOperatorExpr = invalid;
  visitReadPropExpr = invalid;
  visitReadKeyExpr = invalid;
  visitCommaExpr = invalid;
}

function invalid<T>(arg: o.Expression | o.Statement): never {
  throw new Error(
      `Invalid state: Visitor ${this.constructor.name} doesn't handle ${arg.constructor.name}`);
}

function isVariable(e: o.Expression): e is o.ReadVarExpr {
  return e instanceof o.ReadVarExpr;
}

// Converts i18n meta informations for a message (id, description, meaning)
// to a JsDoc statement formatted as expected by the Closure compiler.
function i18nMetaToDocStmt(meta: I18nMeta): o.JSDocCommentStmt|null {
  const tags: o.JSDocTag[] = [];

  if (meta.id || meta.description) {
    const text = meta.id ? `[BACKUP_MESSAGE_ID:${meta.id}] ${meta.description}` : meta.description;
    tags.push({tagName: o.JSDocTagName.Desc, text: text !.trim()});
  }

  if (meta.meaning) {
    tags.push({tagName: o.JSDocTagName.Meaning, text: meta.meaning});
  }

  return tags.length == 0 ? null : new o.JSDocCommentStmt(tags);
}
