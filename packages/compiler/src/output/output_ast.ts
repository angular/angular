/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computeMsgId} from '../i18n/digest';
import {Message} from '../i18n/i18n_ast';
import {ParseSourceSpan} from '../parse_util';
import type {I18nMeta} from '../render3/view/i18n/meta';

//// Types
export enum TypeModifier {
  None = 0,
  Const = 1 << 0,
}

export abstract class Type {
  constructor(public modifiers: TypeModifier = TypeModifier.None) {}
  abstract visitType(visitor: TypeVisitor, context: any): any;

  hasModifier(modifier: TypeModifier): boolean {
    return (this.modifiers & modifier) !== 0;
  }
}

export enum BuiltinTypeName {
  Dynamic,
  Bool,
  String,
  Int,
  Number,
  Function,
  Inferred,
  None,
}

export class BuiltinType extends Type {
  constructor(
    public name: BuiltinTypeName,
    modifiers?: TypeModifier,
  ) {
    super(modifiers);
  }
  override visitType(visitor: TypeVisitor, context: any): any {
    return visitor.visitBuiltinType(this, context);
  }
}

export class ExpressionType extends Type {
  constructor(
    public value: Expression,
    modifiers?: TypeModifier,
    public typeParams: Type[] | null = null,
  ) {
    super(modifiers);
  }
  override visitType(visitor: TypeVisitor, context: any): any {
    return visitor.visitExpressionType(this, context);
  }
}

export class ArrayType extends Type {
  constructor(
    public of: Type,
    modifiers?: TypeModifier,
  ) {
    super(modifiers);
  }
  override visitType(visitor: TypeVisitor, context: any): any {
    return visitor.visitArrayType(this, context);
  }
}

export class MapType extends Type {
  public valueType: Type | null;
  constructor(valueType: Type | null | undefined, modifiers?: TypeModifier) {
    super(modifiers);
    this.valueType = valueType || null;
  }
  override visitType(visitor: TypeVisitor, context: any): any {
    return visitor.visitMapType(this, context);
  }
}

export class TransplantedType<T> extends Type {
  constructor(
    readonly type: T,
    modifiers?: TypeModifier,
  ) {
    super(modifiers);
  }
  override visitType(visitor: TypeVisitor, context: any): any {
    return visitor.visitTransplantedType(this, context);
  }
}

export const DYNAMIC_TYPE = new BuiltinType(BuiltinTypeName.Dynamic);
export const INFERRED_TYPE = new BuiltinType(BuiltinTypeName.Inferred);
export const BOOL_TYPE = new BuiltinType(BuiltinTypeName.Bool);
export const INT_TYPE = new BuiltinType(BuiltinTypeName.Int);
export const NUMBER_TYPE = new BuiltinType(BuiltinTypeName.Number);
export const STRING_TYPE = new BuiltinType(BuiltinTypeName.String);
export const FUNCTION_TYPE = new BuiltinType(BuiltinTypeName.Function);
export const NONE_TYPE = new BuiltinType(BuiltinTypeName.None);

export interface TypeVisitor {
  visitBuiltinType(type: BuiltinType, context: any): any;
  visitExpressionType(type: ExpressionType, context: any): any;
  visitArrayType(type: ArrayType, context: any): any;
  visitMapType(type: MapType, context: any): any;
  visitTransplantedType(type: TransplantedType<unknown>, context: any): any;
}

///// Expressions

export enum UnaryOperator {
  Minus,
  Plus,
}

export enum BinaryOperator {
  Equals,
  NotEquals,
  Identical,
  NotIdentical,
  Minus,
  Plus,
  Divide,
  Multiply,
  Modulo,
  And,
  Or,
  BitwiseOr,
  BitwiseAnd,
  Lower,
  LowerEquals,
  Bigger,
  BiggerEquals,
  NullishCoalesce,
}

export function nullSafeIsEquivalent<T extends {isEquivalent(other: T): boolean}>(
  base: T | null,
  other: T | null,
) {
  if (base == null || other == null) {
    return base == other;
  }
  return base.isEquivalent(other);
}

function areAllEquivalentPredicate<T>(
  base: T[],
  other: T[],
  equivalentPredicate: (baseElement: T, otherElement: T) => boolean,
) {
  const len = base.length;
  if (len !== other.length) {
    return false;
  }
  for (let i = 0; i < len; i++) {
    if (!equivalentPredicate(base[i], other[i])) {
      return false;
    }
  }
  return true;
}

export function areAllEquivalent<T extends {isEquivalent(other: T): boolean}>(
  base: T[],
  other: T[],
) {
  return areAllEquivalentPredicate(base, other, (baseElement: T, otherElement: T) =>
    baseElement.isEquivalent(otherElement),
  );
}

export abstract class Expression {
  public type: Type | null;
  public sourceSpan: ParseSourceSpan | null;

  constructor(type: Type | null | undefined, sourceSpan?: ParseSourceSpan | null) {
    this.type = type || null;
    this.sourceSpan = sourceSpan || null;
  }

  abstract visitExpression(visitor: ExpressionVisitor, context: any): any;

  /**
   * Calculates whether this expression produces the same value as the given expression.
   * Note: We don't check Types nor ParseSourceSpans nor function arguments.
   */
  abstract isEquivalent(e: Expression): boolean;

  /**
   * Return true if the expression is constant.
   */
  abstract isConstant(): boolean;

  abstract clone(): Expression;

  prop(name: string, sourceSpan?: ParseSourceSpan | null): ReadPropExpr {
    return new ReadPropExpr(this, name, null, sourceSpan);
  }

  key(index: Expression, type?: Type | null, sourceSpan?: ParseSourceSpan | null): ReadKeyExpr {
    return new ReadKeyExpr(this, index, type, sourceSpan);
  }

  callFn(
    params: Expression[],
    sourceSpan?: ParseSourceSpan | null,
    pure?: boolean,
  ): InvokeFunctionExpr {
    return new InvokeFunctionExpr(this, params, null, sourceSpan, pure);
  }

  instantiate(
    params: Expression[],
    type?: Type | null,
    sourceSpan?: ParseSourceSpan | null,
  ): InstantiateExpr {
    return new InstantiateExpr(this, params, type, sourceSpan);
  }

  conditional(
    trueCase: Expression,
    falseCase: Expression | null = null,
    sourceSpan?: ParseSourceSpan | null,
  ): ConditionalExpr {
    return new ConditionalExpr(this, trueCase, falseCase, null, sourceSpan);
  }

  equals(rhs: Expression, sourceSpan?: ParseSourceSpan | null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Equals, this, rhs, null, sourceSpan);
  }
  notEquals(rhs: Expression, sourceSpan?: ParseSourceSpan | null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.NotEquals, this, rhs, null, sourceSpan);
  }
  identical(rhs: Expression, sourceSpan?: ParseSourceSpan | null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Identical, this, rhs, null, sourceSpan);
  }
  notIdentical(rhs: Expression, sourceSpan?: ParseSourceSpan | null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.NotIdentical, this, rhs, null, sourceSpan);
  }
  minus(rhs: Expression, sourceSpan?: ParseSourceSpan | null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Minus, this, rhs, null, sourceSpan);
  }
  plus(rhs: Expression, sourceSpan?: ParseSourceSpan | null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Plus, this, rhs, null, sourceSpan);
  }
  divide(rhs: Expression, sourceSpan?: ParseSourceSpan | null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Divide, this, rhs, null, sourceSpan);
  }
  multiply(rhs: Expression, sourceSpan?: ParseSourceSpan | null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Multiply, this, rhs, null, sourceSpan);
  }
  modulo(rhs: Expression, sourceSpan?: ParseSourceSpan | null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Modulo, this, rhs, null, sourceSpan);
  }
  and(rhs: Expression, sourceSpan?: ParseSourceSpan | null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.And, this, rhs, null, sourceSpan);
  }
  bitwiseOr(
    rhs: Expression,
    sourceSpan?: ParseSourceSpan | null,
    parens: boolean = true,
  ): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.BitwiseOr, this, rhs, null, sourceSpan, parens);
  }
  bitwiseAnd(
    rhs: Expression,
    sourceSpan?: ParseSourceSpan | null,
    parens: boolean = true,
  ): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.BitwiseAnd, this, rhs, null, sourceSpan, parens);
  }
  or(rhs: Expression, sourceSpan?: ParseSourceSpan | null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Or, this, rhs, null, sourceSpan);
  }
  lower(rhs: Expression, sourceSpan?: ParseSourceSpan | null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Lower, this, rhs, null, sourceSpan);
  }
  lowerEquals(rhs: Expression, sourceSpan?: ParseSourceSpan | null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.LowerEquals, this, rhs, null, sourceSpan);
  }
  bigger(rhs: Expression, sourceSpan?: ParseSourceSpan | null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Bigger, this, rhs, null, sourceSpan);
  }
  biggerEquals(rhs: Expression, sourceSpan?: ParseSourceSpan | null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.BiggerEquals, this, rhs, null, sourceSpan);
  }
  isBlank(sourceSpan?: ParseSourceSpan | null): Expression {
    // Note: We use equals by purpose here to compare to null and undefined in JS.
    // We use the typed null to allow strictNullChecks to narrow types.
    return this.equals(TYPED_NULL_EXPR, sourceSpan);
  }
  nullishCoalesce(rhs: Expression, sourceSpan?: ParseSourceSpan | null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.NullishCoalesce, this, rhs, null, sourceSpan);
  }

  toStmt(): Statement {
    return new ExpressionStatement(this, null);
  }
}

export class ReadVarExpr extends Expression {
  constructor(
    public name: string,
    type?: Type | null,
    sourceSpan?: ParseSourceSpan | null,
  ) {
    super(type, sourceSpan);
  }

  override isEquivalent(e: Expression): boolean {
    return e instanceof ReadVarExpr && this.name === e.name;
  }

  override isConstant() {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitReadVarExpr(this, context);
  }

  override clone(): ReadVarExpr {
    return new ReadVarExpr(this.name, this.type, this.sourceSpan);
  }

  set(value: Expression): WriteVarExpr {
    return new WriteVarExpr(this.name, value, null, this.sourceSpan);
  }
}

export class TypeofExpr extends Expression {
  constructor(
    public expr: Expression,
    type?: Type | null,
    sourceSpan?: ParseSourceSpan | null,
  ) {
    super(type, sourceSpan);
  }

  override visitExpression(visitor: ExpressionVisitor, context: any) {
    return visitor.visitTypeofExpr(this, context);
  }

  override isEquivalent(e: Expression): boolean {
    return e instanceof TypeofExpr && e.expr.isEquivalent(this.expr);
  }

  override isConstant(): boolean {
    return this.expr.isConstant();
  }

  override clone(): TypeofExpr {
    return new TypeofExpr(this.expr.clone());
  }
}

export class WrappedNodeExpr<T> extends Expression {
  constructor(
    public node: T,
    type?: Type | null,
    sourceSpan?: ParseSourceSpan | null,
  ) {
    super(type, sourceSpan);
  }

  override isEquivalent(e: Expression): boolean {
    return e instanceof WrappedNodeExpr && this.node === e.node;
  }

  override isConstant() {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitWrappedNodeExpr(this, context);
  }

  override clone(): WrappedNodeExpr<T> {
    return new WrappedNodeExpr(this.node, this.type, this.sourceSpan);
  }
}

export class WriteVarExpr extends Expression {
  public value: Expression;
  constructor(
    public name: string,
    value: Expression,
    type?: Type | null,
    sourceSpan?: ParseSourceSpan | null,
  ) {
    super(type || value.type, sourceSpan);
    this.value = value;
  }

  override isEquivalent(e: Expression): boolean {
    return e instanceof WriteVarExpr && this.name === e.name && this.value.isEquivalent(e.value);
  }

  override isConstant() {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitWriteVarExpr(this, context);
  }

  override clone(): WriteVarExpr {
    return new WriteVarExpr(this.name, this.value.clone(), this.type, this.sourceSpan);
  }

  toDeclStmt(type?: Type | null, modifiers?: StmtModifier): DeclareVarStmt {
    return new DeclareVarStmt(this.name, this.value, type, modifiers, this.sourceSpan);
  }

  toConstDecl(): DeclareVarStmt {
    return this.toDeclStmt(INFERRED_TYPE, StmtModifier.Final);
  }
}

export class WriteKeyExpr extends Expression {
  public value: Expression;
  constructor(
    public receiver: Expression,
    public index: Expression,
    value: Expression,
    type?: Type | null,
    sourceSpan?: ParseSourceSpan | null,
  ) {
    super(type || value.type, sourceSpan);
    this.value = value;
  }

  override isEquivalent(e: Expression): boolean {
    return (
      e instanceof WriteKeyExpr &&
      this.receiver.isEquivalent(e.receiver) &&
      this.index.isEquivalent(e.index) &&
      this.value.isEquivalent(e.value)
    );
  }

  override isConstant() {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitWriteKeyExpr(this, context);
  }

  override clone(): WriteKeyExpr {
    return new WriteKeyExpr(
      this.receiver.clone(),
      this.index.clone(),
      this.value.clone(),
      this.type,
      this.sourceSpan,
    );
  }
}

export class WritePropExpr extends Expression {
  public value: Expression;
  constructor(
    public receiver: Expression,
    public name: string,
    value: Expression,
    type?: Type | null,
    sourceSpan?: ParseSourceSpan | null,
  ) {
    super(type || value.type, sourceSpan);
    this.value = value;
  }

  override isEquivalent(e: Expression): boolean {
    return (
      e instanceof WritePropExpr &&
      this.receiver.isEquivalent(e.receiver) &&
      this.name === e.name &&
      this.value.isEquivalent(e.value)
    );
  }

  override isConstant() {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitWritePropExpr(this, context);
  }

  override clone(): WritePropExpr {
    return new WritePropExpr(
      this.receiver.clone(),
      this.name,
      this.value.clone(),
      this.type,
      this.sourceSpan,
    );
  }
}

export class InvokeFunctionExpr extends Expression {
  constructor(
    public fn: Expression,
    public args: Expression[],
    type?: Type | null,
    sourceSpan?: ParseSourceSpan | null,
    public pure = false,
  ) {
    super(type, sourceSpan);
  }

  // An alias for fn, which allows other logic to handle calls and property reads together.
  get receiver(): Expression {
    return this.fn;
  }

  override isEquivalent(e: Expression): boolean {
    return (
      e instanceof InvokeFunctionExpr &&
      this.fn.isEquivalent(e.fn) &&
      areAllEquivalent(this.args, e.args) &&
      this.pure === e.pure
    );
  }

  override isConstant() {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitInvokeFunctionExpr(this, context);
  }

  override clone(): InvokeFunctionExpr {
    return new InvokeFunctionExpr(
      this.fn.clone(),
      this.args.map((arg) => arg.clone()),
      this.type,
      this.sourceSpan,
      this.pure,
    );
  }
}

export class TaggedTemplateLiteralExpr extends Expression {
  constructor(
    public tag: Expression,
    public template: TemplateLiteralExpr,
    type?: Type | null,
    sourceSpan?: ParseSourceSpan | null,
  ) {
    super(type, sourceSpan);
  }

  override isEquivalent(e: Expression): boolean {
    return (
      e instanceof TaggedTemplateLiteralExpr &&
      this.tag.isEquivalent(e.tag) &&
      this.template.isEquivalent(e.template)
    );
  }

  override isConstant() {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitTaggedTemplateLiteralExpr(this, context);
  }

  override clone(): TaggedTemplateLiteralExpr {
    return new TaggedTemplateLiteralExpr(
      this.tag.clone(),
      this.template.clone(),
      this.type,
      this.sourceSpan,
    );
  }
}

export class InstantiateExpr extends Expression {
  constructor(
    public classExpr: Expression,
    public args: Expression[],
    type?: Type | null,
    sourceSpan?: ParseSourceSpan | null,
  ) {
    super(type, sourceSpan);
  }

  override isEquivalent(e: Expression): boolean {
    return (
      e instanceof InstantiateExpr &&
      this.classExpr.isEquivalent(e.classExpr) &&
      areAllEquivalent(this.args, e.args)
    );
  }

  override isConstant() {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitInstantiateExpr(this, context);
  }

  override clone(): InstantiateExpr {
    return new InstantiateExpr(
      this.classExpr.clone(),
      this.args.map((arg) => arg.clone()),
      this.type,
      this.sourceSpan,
    );
  }
}

export class LiteralExpr extends Expression {
  constructor(
    public value: number | string | boolean | null | undefined,
    type?: Type | null,
    sourceSpan?: ParseSourceSpan | null,
  ) {
    super(type, sourceSpan);
  }

  override isEquivalent(e: Expression): boolean {
    return e instanceof LiteralExpr && this.value === e.value;
  }

  override isConstant() {
    return true;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitLiteralExpr(this, context);
  }

  override clone(): LiteralExpr {
    return new LiteralExpr(this.value, this.type, this.sourceSpan);
  }
}

export class TemplateLiteralExpr extends Expression {
  constructor(
    public elements: TemplateLiteralElementExpr[],
    public expressions: Expression[],
    sourceSpan?: ParseSourceSpan | null,
  ) {
    super(null, sourceSpan);
  }

  override isEquivalent(e: Expression): boolean {
    return (
      e instanceof TemplateLiteralExpr &&
      areAllEquivalentPredicate(this.elements, e.elements, (a, b) => a.text === b.text) &&
      areAllEquivalent(this.expressions, e.expressions)
    );
  }

  override isConstant() {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitTemplateLiteralExpr(this, context);
  }

  override clone(): TemplateLiteralExpr {
    return new TemplateLiteralExpr(
      this.elements.map((el) => el.clone()),
      this.expressions.map((expr) => expr.clone()),
    );
  }
}
export class TemplateLiteralElementExpr extends Expression {
  rawText: string;

  constructor(
    public text: string,
    sourceSpan?: ParseSourceSpan | null,
    rawText?: string,
  ) {
    super(STRING_TYPE, sourceSpan);

    // If `rawText` is not provided, try to extract the raw string from its
    // associated `sourceSpan`. If that is also not available, "fake" the raw
    // string instead by escaping the following control sequences:
    // - "\" would otherwise indicate that the next character is a control character.
    // - "`" and "${" are template string control sequences that would otherwise prematurely
    // indicate the end of the template literal element.
    this.rawText =
      rawText ?? sourceSpan?.toString() ?? escapeForTemplateLiteral(escapeSlashes(text));
  }

  override visitExpression(visitor: ExpressionVisitor, context: any) {
    return visitor.visitTemplateLiteralElementExpr(this, context);
  }

  override isEquivalent(e: Expression): boolean {
    return (
      e instanceof TemplateLiteralElementExpr && e.text === this.text && e.rawText === this.rawText
    );
  }

  override isConstant(): boolean {
    return true;
  }

  override clone(): TemplateLiteralElementExpr {
    return new TemplateLiteralElementExpr(this.text, this.sourceSpan, this.rawText);
  }
}

export class LiteralPiece {
  constructor(
    public text: string,
    public sourceSpan: ParseSourceSpan,
  ) {}
}
export class PlaceholderPiece {
  /**
   * Create a new instance of a `PlaceholderPiece`.
   *
   * @param text the name of this placeholder (e.g. `PH_1`).
   * @param sourceSpan the location of this placeholder in its localized message the source code.
   * @param associatedMessage reference to another message that this placeholder is associated with.
   * The `associatedMessage` is mainly used to provide a relationship to an ICU message that has
   * been extracted out from the message containing the placeholder.
   */
  constructor(
    public text: string,
    public sourceSpan: ParseSourceSpan,
    public associatedMessage?: Message,
  ) {}
}

export type MessagePiece = LiteralPiece | PlaceholderPiece;

const MEANING_SEPARATOR = '|';
const ID_SEPARATOR = '@@';
const LEGACY_ID_INDICATOR = '␟';

export class LocalizedString extends Expression {
  constructor(
    readonly metaBlock: I18nMeta,
    readonly messageParts: LiteralPiece[],
    readonly placeHolderNames: PlaceholderPiece[],
    readonly expressions: Expression[],
    sourceSpan?: ParseSourceSpan | null,
  ) {
    super(STRING_TYPE, sourceSpan);
  }

  override isEquivalent(e: Expression): boolean {
    // return e instanceof LocalizedString && this.message === e.message;
    return false;
  }

  override isConstant() {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitLocalizedString(this, context);
  }

  override clone(): LocalizedString {
    return new LocalizedString(
      this.metaBlock,
      this.messageParts,
      this.placeHolderNames,
      this.expressions.map((expr) => expr.clone()),
      this.sourceSpan,
    );
  }

  /**
   * Serialize the given `meta` and `messagePart` into "cooked" and "raw" strings that can be used
   * in a `$localize` tagged string. The format of the metadata is the same as that parsed by
   * `parseI18nMeta()`.
   *
   * @param meta The metadata to serialize
   * @param messagePart The first part of the tagged string
   */
  serializeI18nHead(): CookedRawString {
    let metaBlock = this.metaBlock.description || '';
    if (this.metaBlock.meaning) {
      metaBlock = `${this.metaBlock.meaning}${MEANING_SEPARATOR}${metaBlock}`;
    }
    if (this.metaBlock.customId) {
      metaBlock = `${metaBlock}${ID_SEPARATOR}${this.metaBlock.customId}`;
    }
    if (this.metaBlock.legacyIds) {
      this.metaBlock.legacyIds.forEach((legacyId) => {
        metaBlock = `${metaBlock}${LEGACY_ID_INDICATOR}${legacyId}`;
      });
    }
    return createCookedRawString(
      metaBlock,
      this.messageParts[0].text,
      this.getMessagePartSourceSpan(0),
    );
  }

  getMessagePartSourceSpan(i: number): ParseSourceSpan | null {
    return this.messageParts[i]?.sourceSpan ?? this.sourceSpan;
  }

  getPlaceholderSourceSpan(i: number): ParseSourceSpan {
    return (
      this.placeHolderNames[i]?.sourceSpan ?? this.expressions[i]?.sourceSpan ?? this.sourceSpan
    );
  }

  /**
   * Serialize the given `placeholderName` and `messagePart` into "cooked" and "raw" strings that
   * can be used in a `$localize` tagged string.
   *
   * The format is `:<placeholder-name>[@@<associated-id>]:`.
   *
   * The `associated-id` is the message id of the (usually an ICU) message to which this placeholder
   * refers.
   *
   * @param partIndex The index of the message part to serialize.
   */
  serializeI18nTemplatePart(partIndex: number): CookedRawString {
    const placeholder = this.placeHolderNames[partIndex - 1];
    const messagePart = this.messageParts[partIndex];
    let metaBlock = placeholder.text;
    if (placeholder.associatedMessage?.legacyIds.length === 0) {
      metaBlock += `${ID_SEPARATOR}${computeMsgId(
        placeholder.associatedMessage.messageString,
        placeholder.associatedMessage.meaning,
      )}`;
    }
    return createCookedRawString(
      metaBlock,
      messagePart.text,
      this.getMessagePartSourceSpan(partIndex),
    );
  }
}

/**
 * A structure to hold the cooked and raw strings of a template literal element, along with its
 * source-span range.
 */
export interface CookedRawString {
  cooked: string;
  raw: string;
  range: ParseSourceSpan | null;
}

const escapeSlashes = (str: string): string => str.replace(/\\/g, '\\\\');
const escapeStartingColon = (str: string): string => str.replace(/^:/, '\\:');
const escapeColons = (str: string): string => str.replace(/:/g, '\\:');
const escapeForTemplateLiteral = (str: string): string =>
  str.replace(/`/g, '\\`').replace(/\${/g, '$\\{');

/**
 * Creates a `{cooked, raw}` object from the `metaBlock` and `messagePart`.
 *
 * The `raw` text must have various character sequences escaped:
 * * "\" would otherwise indicate that the next character is a control character.
 * * "`" and "${" are template string control sequences that would otherwise prematurely indicate
 *   the end of a message part.
 * * ":" inside a metablock would prematurely indicate the end of the metablock.
 * * ":" at the start of a messagePart with no metablock would erroneously indicate the start of a
 *   metablock.
 *
 * @param metaBlock Any metadata that should be prepended to the string
 * @param messagePart The message part of the string
 */
function createCookedRawString(
  metaBlock: string,
  messagePart: string,
  range: ParseSourceSpan | null,
): CookedRawString {
  if (metaBlock === '') {
    return {
      cooked: messagePart,
      raw: escapeForTemplateLiteral(escapeStartingColon(escapeSlashes(messagePart))),
      range,
    };
  } else {
    return {
      cooked: `:${metaBlock}:${messagePart}`,
      raw: escapeForTemplateLiteral(
        `:${escapeColons(escapeSlashes(metaBlock))}:${escapeSlashes(messagePart)}`,
      ),
      range,
    };
  }
}

export class ExternalExpr extends Expression {
  constructor(
    public value: ExternalReference,
    type?: Type | null,
    public typeParams: Type[] | null = null,
    sourceSpan?: ParseSourceSpan | null,
  ) {
    super(type, sourceSpan);
  }

  override isEquivalent(e: Expression): boolean {
    return (
      e instanceof ExternalExpr &&
      this.value.name === e.value.name &&
      this.value.moduleName === e.value.moduleName
    );
  }

  override isConstant() {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitExternalExpr(this, context);
  }

  override clone(): ExternalExpr {
    return new ExternalExpr(this.value, this.type, this.typeParams, this.sourceSpan);
  }
}

export class ExternalReference {
  constructor(
    public moduleName: string | null,
    public name: string | null,
  ) {}
  // Note: no isEquivalent method here as we use this as an interface too.
}

export class ConditionalExpr extends Expression {
  public trueCase: Expression;

  constructor(
    public condition: Expression,
    trueCase: Expression,
    public falseCase: Expression | null = null,
    type?: Type | null,
    sourceSpan?: ParseSourceSpan | null,
  ) {
    super(type || trueCase.type, sourceSpan);
    this.trueCase = trueCase;
  }

  override isEquivalent(e: Expression): boolean {
    return (
      e instanceof ConditionalExpr &&
      this.condition.isEquivalent(e.condition) &&
      this.trueCase.isEquivalent(e.trueCase) &&
      nullSafeIsEquivalent(this.falseCase, e.falseCase)
    );
  }

  override isConstant() {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitConditionalExpr(this, context);
  }

  override clone(): ConditionalExpr {
    return new ConditionalExpr(
      this.condition.clone(),
      this.trueCase.clone(),
      this.falseCase?.clone(),
      this.type,
      this.sourceSpan,
    );
  }
}

export class DynamicImportExpr extends Expression {
  constructor(
    public url: string | Expression,
    sourceSpan?: ParseSourceSpan | null,
    public urlComment?: string,
  ) {
    super(null, sourceSpan);
  }

  override isEquivalent(e: Expression): boolean {
    return e instanceof DynamicImportExpr && this.url === e.url && this.urlComment === e.urlComment;
  }

  override isConstant() {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitDynamicImportExpr(this, context);
  }

  override clone(): DynamicImportExpr {
    return new DynamicImportExpr(
      typeof this.url === 'string' ? this.url : this.url.clone(),
      this.sourceSpan,
      this.urlComment,
    );
  }
}

export class NotExpr extends Expression {
  constructor(
    public condition: Expression,
    sourceSpan?: ParseSourceSpan | null,
  ) {
    super(BOOL_TYPE, sourceSpan);
  }

  override isEquivalent(e: Expression): boolean {
    return e instanceof NotExpr && this.condition.isEquivalent(e.condition);
  }

  override isConstant() {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitNotExpr(this, context);
  }

  override clone(): NotExpr {
    return new NotExpr(this.condition.clone(), this.sourceSpan);
  }
}

export class FnParam {
  constructor(
    public name: string,
    public type: Type | null = null,
  ) {}

  isEquivalent(param: FnParam): boolean {
    return this.name === param.name;
  }

  clone(): FnParam {
    return new FnParam(this.name, this.type);
  }
}

export class FunctionExpr extends Expression {
  constructor(
    public params: FnParam[],
    public statements: Statement[],
    type?: Type | null,
    sourceSpan?: ParseSourceSpan | null,
    public name?: string | null,
  ) {
    super(type, sourceSpan);
  }

  override isEquivalent(e: Expression | Statement): boolean {
    return (
      (e instanceof FunctionExpr || e instanceof DeclareFunctionStmt) &&
      areAllEquivalent(this.params, e.params) &&
      areAllEquivalent(this.statements, e.statements)
    );
  }

  override isConstant() {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitFunctionExpr(this, context);
  }

  toDeclStmt(name: string, modifiers?: StmtModifier): DeclareFunctionStmt {
    return new DeclareFunctionStmt(
      name,
      this.params,
      this.statements,
      this.type,
      modifiers,
      this.sourceSpan,
    );
  }

  override clone(): FunctionExpr {
    // TODO: Should we deep clone statements?
    return new FunctionExpr(
      this.params.map((p) => p.clone()),
      this.statements,
      this.type,
      this.sourceSpan,
      this.name,
    );
  }
}

export class ArrowFunctionExpr extends Expression {
  // Note that `body: Expression` represents `() => expr` whereas
  // `body: Statement[]` represents `() => { expr }`.

  constructor(
    public params: FnParam[],
    public body: Expression | Statement[],
    type?: Type | null,
    sourceSpan?: ParseSourceSpan | null,
  ) {
    super(type, sourceSpan);
  }

  override isEquivalent(e: Expression): boolean {
    if (!(e instanceof ArrowFunctionExpr) || !areAllEquivalent(this.params, e.params)) {
      return false;
    }

    if (this.body instanceof Expression && e.body instanceof Expression) {
      return this.body.isEquivalent(e.body);
    }

    if (Array.isArray(this.body) && Array.isArray(e.body)) {
      return areAllEquivalent(this.body, e.body);
    }

    return false;
  }

  override isConstant(): boolean {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any) {
    return visitor.visitArrowFunctionExpr(this, context);
  }

  override clone(): Expression {
    // TODO: Should we deep clone statements?
    return new ArrowFunctionExpr(
      this.params.map((p) => p.clone()),
      Array.isArray(this.body) ? this.body : this.body.clone(),
      this.type,
      this.sourceSpan,
    );
  }

  toDeclStmt(name: string, modifiers?: StmtModifier): DeclareVarStmt {
    return new DeclareVarStmt(name, this, INFERRED_TYPE, modifiers, this.sourceSpan);
  }
}

export class UnaryOperatorExpr extends Expression {
  constructor(
    public operator: UnaryOperator,
    public expr: Expression,
    type?: Type | null,
    sourceSpan?: ParseSourceSpan | null,
    public parens: boolean = true,
  ) {
    super(type || NUMBER_TYPE, sourceSpan);
  }

  override isEquivalent(e: Expression): boolean {
    return (
      e instanceof UnaryOperatorExpr &&
      this.operator === e.operator &&
      this.expr.isEquivalent(e.expr)
    );
  }

  override isConstant() {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitUnaryOperatorExpr(this, context);
  }

  override clone(): UnaryOperatorExpr {
    return new UnaryOperatorExpr(
      this.operator,
      this.expr.clone(),
      this.type,
      this.sourceSpan,
      this.parens,
    );
  }
}

export class BinaryOperatorExpr extends Expression {
  public lhs: Expression;
  constructor(
    public operator: BinaryOperator,
    lhs: Expression,
    public rhs: Expression,
    type?: Type | null,
    sourceSpan?: ParseSourceSpan | null,
    public parens: boolean = true,
  ) {
    super(type || lhs.type, sourceSpan);
    this.lhs = lhs;
  }

  override isEquivalent(e: Expression): boolean {
    return (
      e instanceof BinaryOperatorExpr &&
      this.operator === e.operator &&
      this.lhs.isEquivalent(e.lhs) &&
      this.rhs.isEquivalent(e.rhs)
    );
  }

  override isConstant() {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitBinaryOperatorExpr(this, context);
  }

  override clone(): BinaryOperatorExpr {
    return new BinaryOperatorExpr(
      this.operator,
      this.lhs.clone(),
      this.rhs.clone(),
      this.type,
      this.sourceSpan,
      this.parens,
    );
  }
}

export class ReadPropExpr extends Expression {
  constructor(
    public receiver: Expression,
    public name: string,
    type?: Type | null,
    sourceSpan?: ParseSourceSpan | null,
  ) {
    super(type, sourceSpan);
  }

  // An alias for name, which allows other logic to handle property reads and keyed reads together.
  get index() {
    return this.name;
  }

  override isEquivalent(e: Expression): boolean {
    return (
      e instanceof ReadPropExpr && this.receiver.isEquivalent(e.receiver) && this.name === e.name
    );
  }

  override isConstant() {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitReadPropExpr(this, context);
  }

  set(value: Expression): WritePropExpr {
    return new WritePropExpr(this.receiver, this.name, value, null, this.sourceSpan);
  }

  override clone(): ReadPropExpr {
    return new ReadPropExpr(this.receiver.clone(), this.name, this.type, this.sourceSpan);
  }
}

export class ReadKeyExpr extends Expression {
  constructor(
    public receiver: Expression,
    public index: Expression,
    type?: Type | null,
    sourceSpan?: ParseSourceSpan | null,
  ) {
    super(type, sourceSpan);
  }

  override isEquivalent(e: Expression): boolean {
    return (
      e instanceof ReadKeyExpr &&
      this.receiver.isEquivalent(e.receiver) &&
      this.index.isEquivalent(e.index)
    );
  }

  override isConstant() {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitReadKeyExpr(this, context);
  }

  set(value: Expression): WriteKeyExpr {
    return new WriteKeyExpr(this.receiver, this.index, value, null, this.sourceSpan);
  }

  override clone(): ReadKeyExpr {
    return new ReadKeyExpr(this.receiver.clone(), this.index.clone(), this.type, this.sourceSpan);
  }
}

export class LiteralArrayExpr extends Expression {
  public entries: Expression[];
  constructor(entries: Expression[], type?: Type | null, sourceSpan?: ParseSourceSpan | null) {
    super(type, sourceSpan);
    this.entries = entries;
  }

  override isConstant() {
    return this.entries.every((e) => e.isConstant());
  }

  override isEquivalent(e: Expression): boolean {
    return e instanceof LiteralArrayExpr && areAllEquivalent(this.entries, e.entries);
  }
  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitLiteralArrayExpr(this, context);
  }

  override clone(): LiteralArrayExpr {
    return new LiteralArrayExpr(
      this.entries.map((e) => e.clone()),
      this.type,
      this.sourceSpan,
    );
  }
}

export class LiteralMapEntry {
  constructor(
    public key: string,
    public value: Expression,
    public quoted: boolean,
  ) {}
  isEquivalent(e: LiteralMapEntry): boolean {
    return this.key === e.key && this.value.isEquivalent(e.value);
  }

  clone(): LiteralMapEntry {
    return new LiteralMapEntry(this.key, this.value.clone(), this.quoted);
  }
}

export class LiteralMapExpr extends Expression {
  public valueType: Type | null = null;
  constructor(
    public entries: LiteralMapEntry[],
    type?: MapType | null,
    sourceSpan?: ParseSourceSpan | null,
  ) {
    super(type, sourceSpan);
    if (type) {
      this.valueType = type.valueType;
    }
  }

  override isEquivalent(e: Expression): boolean {
    return e instanceof LiteralMapExpr && areAllEquivalent(this.entries, e.entries);
  }

  override isConstant() {
    return this.entries.every((e) => e.value.isConstant());
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitLiteralMapExpr(this, context);
  }

  override clone(): LiteralMapExpr {
    const entriesClone = this.entries.map((entry) => entry.clone());
    return new LiteralMapExpr(entriesClone, this.type as MapType | null, this.sourceSpan);
  }
}

export class CommaExpr extends Expression {
  constructor(
    public parts: Expression[],
    sourceSpan?: ParseSourceSpan | null,
  ) {
    super(parts[parts.length - 1].type, sourceSpan);
  }

  override isEquivalent(e: Expression): boolean {
    return e instanceof CommaExpr && areAllEquivalent(this.parts, e.parts);
  }

  override isConstant() {
    return false;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitCommaExpr(this, context);
  }

  override clone(): CommaExpr {
    return new CommaExpr(this.parts.map((p) => p.clone()));
  }
}

export interface ExpressionVisitor {
  visitReadVarExpr(ast: ReadVarExpr, context: any): any;
  visitWriteVarExpr(expr: WriteVarExpr, context: any): any;
  visitWriteKeyExpr(expr: WriteKeyExpr, context: any): any;
  visitWritePropExpr(expr: WritePropExpr, context: any): any;
  visitInvokeFunctionExpr(ast: InvokeFunctionExpr, context: any): any;
  visitTaggedTemplateLiteralExpr(ast: TaggedTemplateLiteralExpr, context: any): any;
  visitTemplateLiteralExpr(ast: TemplateLiteralExpr, context: any): any;
  visitTemplateLiteralElementExpr(ast: TemplateLiteralElementExpr, context: any): any;
  visitInstantiateExpr(ast: InstantiateExpr, context: any): any;
  visitLiteralExpr(ast: LiteralExpr, context: any): any;
  visitLocalizedString(ast: LocalizedString, context: any): any;
  visitExternalExpr(ast: ExternalExpr, context: any): any;
  visitConditionalExpr(ast: ConditionalExpr, context: any): any;
  visitDynamicImportExpr(ast: DynamicImportExpr, context: any): any;
  visitNotExpr(ast: NotExpr, context: any): any;
  visitFunctionExpr(ast: FunctionExpr, context: any): any;
  visitUnaryOperatorExpr(ast: UnaryOperatorExpr, context: any): any;
  visitBinaryOperatorExpr(ast: BinaryOperatorExpr, context: any): any;
  visitReadPropExpr(ast: ReadPropExpr, context: any): any;
  visitReadKeyExpr(ast: ReadKeyExpr, context: any): any;
  visitLiteralArrayExpr(ast: LiteralArrayExpr, context: any): any;
  visitLiteralMapExpr(ast: LiteralMapExpr, context: any): any;
  visitCommaExpr(ast: CommaExpr, context: any): any;
  visitWrappedNodeExpr(ast: WrappedNodeExpr<any>, context: any): any;
  visitTypeofExpr(ast: TypeofExpr, context: any): any;
  visitArrowFunctionExpr(ast: ArrowFunctionExpr, context: any): any;
}

export const NULL_EXPR = new LiteralExpr(null, null, null);
export const TYPED_NULL_EXPR = new LiteralExpr(null, INFERRED_TYPE, null);

//// Statements
export enum StmtModifier {
  None = 0,
  Final = 1 << 0,
  Private = 1 << 1,
  Exported = 1 << 2,
  Static = 1 << 3,
}

export class LeadingComment {
  constructor(
    public text: string,
    public multiline: boolean,
    public trailingNewline: boolean,
  ) {}
  toString() {
    return this.multiline ? ` ${this.text} ` : this.text;
  }
}
export class JSDocComment extends LeadingComment {
  constructor(public tags: JSDocTag[]) {
    super('', /* multiline */ true, /* trailingNewline */ true);
  }
  override toString(): string {
    return serializeTags(this.tags);
  }
}

export abstract class Statement {
  constructor(
    public modifiers: StmtModifier = StmtModifier.None,
    public sourceSpan: ParseSourceSpan | null = null,
    public leadingComments?: LeadingComment[],
  ) {}
  /**
   * Calculates whether this statement produces the same value as the given statement.
   * Note: We don't check Types nor ParseSourceSpans nor function arguments.
   */
  abstract isEquivalent(stmt: Statement): boolean;

  abstract visitStatement(visitor: StatementVisitor, context: any): any;

  hasModifier(modifier: StmtModifier): boolean {
    return (this.modifiers & modifier) !== 0;
  }

  addLeadingComment(leadingComment: LeadingComment): void {
    this.leadingComments = this.leadingComments ?? [];
    this.leadingComments.push(leadingComment);
  }
}

export class DeclareVarStmt extends Statement {
  public type: Type | null;
  constructor(
    public name: string,
    public value?: Expression,
    type?: Type | null,
    modifiers?: StmtModifier,
    sourceSpan?: ParseSourceSpan | null,
    leadingComments?: LeadingComment[],
  ) {
    super(modifiers, sourceSpan, leadingComments);
    this.type = type || (value && value.type) || null;
  }
  override isEquivalent(stmt: Statement): boolean {
    return (
      stmt instanceof DeclareVarStmt &&
      this.name === stmt.name &&
      (this.value ? !!stmt.value && this.value.isEquivalent(stmt.value) : !stmt.value)
    );
  }
  override visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitDeclareVarStmt(this, context);
  }
}

export class DeclareFunctionStmt extends Statement {
  public type: Type | null;
  constructor(
    public name: string,
    public params: FnParam[],
    public statements: Statement[],
    type?: Type | null,
    modifiers?: StmtModifier,
    sourceSpan?: ParseSourceSpan | null,
    leadingComments?: LeadingComment[],
  ) {
    super(modifiers, sourceSpan, leadingComments);
    this.type = type || null;
  }
  override isEquivalent(stmt: Statement): boolean {
    return (
      stmt instanceof DeclareFunctionStmt &&
      areAllEquivalent(this.params, stmt.params) &&
      areAllEquivalent(this.statements, stmt.statements)
    );
  }
  override visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitDeclareFunctionStmt(this, context);
  }
}

export class ExpressionStatement extends Statement {
  constructor(
    public expr: Expression,
    sourceSpan?: ParseSourceSpan | null,
    leadingComments?: LeadingComment[],
  ) {
    super(StmtModifier.None, sourceSpan, leadingComments);
  }
  override isEquivalent(stmt: Statement): boolean {
    return stmt instanceof ExpressionStatement && this.expr.isEquivalent(stmt.expr);
  }
  override visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitExpressionStmt(this, context);
  }
}

export class ReturnStatement extends Statement {
  constructor(
    public value: Expression,
    sourceSpan: ParseSourceSpan | null = null,
    leadingComments?: LeadingComment[],
  ) {
    super(StmtModifier.None, sourceSpan, leadingComments);
  }
  override isEquivalent(stmt: Statement): boolean {
    return stmt instanceof ReturnStatement && this.value.isEquivalent(stmt.value);
  }
  override visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitReturnStmt(this, context);
  }
}

export class IfStmt extends Statement {
  constructor(
    public condition: Expression,
    public trueCase: Statement[],
    public falseCase: Statement[] = [],
    sourceSpan?: ParseSourceSpan | null,
    leadingComments?: LeadingComment[],
  ) {
    super(StmtModifier.None, sourceSpan, leadingComments);
  }
  override isEquivalent(stmt: Statement): boolean {
    return (
      stmt instanceof IfStmt &&
      this.condition.isEquivalent(stmt.condition) &&
      areAllEquivalent(this.trueCase, stmt.trueCase) &&
      areAllEquivalent(this.falseCase, stmt.falseCase)
    );
  }
  override visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitIfStmt(this, context);
  }
}

export interface StatementVisitor {
  visitDeclareVarStmt(stmt: DeclareVarStmt, context: any): any;
  visitDeclareFunctionStmt(stmt: DeclareFunctionStmt, context: any): any;
  visitExpressionStmt(stmt: ExpressionStatement, context: any): any;
  visitReturnStmt(stmt: ReturnStatement, context: any): any;
  visitIfStmt(stmt: IfStmt, context: any): any;
}

export class RecursiveAstVisitor implements StatementVisitor, ExpressionVisitor {
  visitType(ast: Type, context: any): any {
    return ast;
  }
  visitExpression(ast: Expression, context: any): any {
    if (ast.type) {
      ast.type.visitType(this, context);
    }
    return ast;
  }
  visitBuiltinType(type: BuiltinType, context: any): any {
    return this.visitType(type, context);
  }
  visitExpressionType(type: ExpressionType, context: any): any {
    type.value.visitExpression(this, context);
    if (type.typeParams !== null) {
      type.typeParams.forEach((param) => this.visitType(param, context));
    }
    return this.visitType(type, context);
  }
  visitArrayType(type: ArrayType, context: any): any {
    return this.visitType(type, context);
  }
  visitMapType(type: MapType, context: any): any {
    return this.visitType(type, context);
  }
  visitTransplantedType(type: TransplantedType<unknown>, context: any): any {
    return type;
  }
  visitWrappedNodeExpr(ast: WrappedNodeExpr<any>, context: any): any {
    return ast;
  }
  visitTypeofExpr(ast: TypeofExpr, context: any): any {
    return this.visitExpression(ast, context);
  }
  visitReadVarExpr(ast: ReadVarExpr, context: any): any {
    return this.visitExpression(ast, context);
  }
  visitWriteVarExpr(ast: WriteVarExpr, context: any): any {
    ast.value.visitExpression(this, context);
    return this.visitExpression(ast, context);
  }
  visitWriteKeyExpr(ast: WriteKeyExpr, context: any): any {
    ast.receiver.visitExpression(this, context);
    ast.index.visitExpression(this, context);
    ast.value.visitExpression(this, context);
    return this.visitExpression(ast, context);
  }
  visitWritePropExpr(ast: WritePropExpr, context: any): any {
    ast.receiver.visitExpression(this, context);
    ast.value.visitExpression(this, context);
    return this.visitExpression(ast, context);
  }
  visitDynamicImportExpr(ast: DynamicImportExpr, context: any) {
    return this.visitExpression(ast, context);
  }
  visitInvokeFunctionExpr(ast: InvokeFunctionExpr, context: any): any {
    ast.fn.visitExpression(this, context);
    this.visitAllExpressions(ast.args, context);
    return this.visitExpression(ast, context);
  }
  visitTaggedTemplateLiteralExpr(ast: TaggedTemplateLiteralExpr, context: any): any {
    ast.tag.visitExpression(this, context);
    ast.template.visitExpression(this, context);
    return this.visitExpression(ast, context);
  }
  visitInstantiateExpr(ast: InstantiateExpr, context: any): any {
    ast.classExpr.visitExpression(this, context);
    this.visitAllExpressions(ast.args, context);
    return this.visitExpression(ast, context);
  }
  visitLiteralExpr(ast: LiteralExpr, context: any): any {
    return this.visitExpression(ast, context);
  }
  visitLocalizedString(ast: LocalizedString, context: any): any {
    return this.visitExpression(ast, context);
  }
  visitExternalExpr(ast: ExternalExpr, context: any): any {
    if (ast.typeParams) {
      ast.typeParams.forEach((type) => type.visitType(this, context));
    }
    return this.visitExpression(ast, context);
  }
  visitConditionalExpr(ast: ConditionalExpr, context: any): any {
    ast.condition.visitExpression(this, context);
    ast.trueCase.visitExpression(this, context);
    ast.falseCase!.visitExpression(this, context);
    return this.visitExpression(ast, context);
  }
  visitNotExpr(ast: NotExpr, context: any): any {
    ast.condition.visitExpression(this, context);
    return this.visitExpression(ast, context);
  }
  visitFunctionExpr(ast: FunctionExpr, context: any): any {
    this.visitAllStatements(ast.statements, context);
    return this.visitExpression(ast, context);
  }
  visitArrowFunctionExpr(ast: ArrowFunctionExpr, context: any): any {
    if (Array.isArray(ast.body)) {
      this.visitAllStatements(ast.body, context);
    } else {
      // Note: `body.visitExpression`, rather than `this.visitExpressiont(body)`,
      // because the latter won't recurse into the sub-expressions.
      ast.body.visitExpression(this, context);
    }

    return this.visitExpression(ast, context);
  }
  visitUnaryOperatorExpr(ast: UnaryOperatorExpr, context: any): any {
    ast.expr.visitExpression(this, context);
    return this.visitExpression(ast, context);
  }
  visitBinaryOperatorExpr(ast: BinaryOperatorExpr, context: any): any {
    ast.lhs.visitExpression(this, context);
    ast.rhs.visitExpression(this, context);
    return this.visitExpression(ast, context);
  }
  visitReadPropExpr(ast: ReadPropExpr, context: any): any {
    ast.receiver.visitExpression(this, context);
    return this.visitExpression(ast, context);
  }
  visitReadKeyExpr(ast: ReadKeyExpr, context: any): any {
    ast.receiver.visitExpression(this, context);
    ast.index.visitExpression(this, context);
    return this.visitExpression(ast, context);
  }
  visitLiteralArrayExpr(ast: LiteralArrayExpr, context: any): any {
    this.visitAllExpressions(ast.entries, context);
    return this.visitExpression(ast, context);
  }
  visitLiteralMapExpr(ast: LiteralMapExpr, context: any): any {
    ast.entries.forEach((entry) => entry.value.visitExpression(this, context));
    return this.visitExpression(ast, context);
  }
  visitCommaExpr(ast: CommaExpr, context: any): any {
    this.visitAllExpressions(ast.parts, context);
    return this.visitExpression(ast, context);
  }
  visitTemplateLiteralExpr(ast: TemplateLiteralExpr, context: any) {
    this.visitAllExpressions(ast.elements, context);
    this.visitAllExpressions(ast.expressions, context);
    return this.visitExpression(ast, context);
  }
  visitTemplateLiteralElementExpr(ast: TemplateLiteralElementExpr, context: any) {
    return this.visitExpression(ast, context);
  }
  visitAllExpressions(exprs: Expression[], context: any): void {
    exprs.forEach((expr) => expr.visitExpression(this, context));
  }

  visitDeclareVarStmt(stmt: DeclareVarStmt, context: any): any {
    if (stmt.value) {
      stmt.value.visitExpression(this, context);
    }
    if (stmt.type) {
      stmt.type.visitType(this, context);
    }
    return stmt;
  }
  visitDeclareFunctionStmt(stmt: DeclareFunctionStmt, context: any): any {
    this.visitAllStatements(stmt.statements, context);
    if (stmt.type) {
      stmt.type.visitType(this, context);
    }
    return stmt;
  }
  visitExpressionStmt(stmt: ExpressionStatement, context: any): any {
    stmt.expr.visitExpression(this, context);
    return stmt;
  }
  visitReturnStmt(stmt: ReturnStatement, context: any): any {
    stmt.value.visitExpression(this, context);
    return stmt;
  }
  visitIfStmt(stmt: IfStmt, context: any): any {
    stmt.condition.visitExpression(this, context);
    this.visitAllStatements(stmt.trueCase, context);
    this.visitAllStatements(stmt.falseCase, context);
    return stmt;
  }
  visitAllStatements(stmts: Statement[], context: any): void {
    stmts.forEach((stmt) => stmt.visitStatement(this, context));
  }
}

export function leadingComment(
  text: string,
  multiline: boolean = false,
  trailingNewline: boolean = true,
): LeadingComment {
  return new LeadingComment(text, multiline, trailingNewline);
}

export function jsDocComment(tags: JSDocTag[] = []): JSDocComment {
  return new JSDocComment(tags);
}

export function variable(
  name: string,
  type?: Type | null,
  sourceSpan?: ParseSourceSpan | null,
): ReadVarExpr {
  return new ReadVarExpr(name, type, sourceSpan);
}

export function importExpr(
  id: ExternalReference,
  typeParams: Type[] | null = null,
  sourceSpan?: ParseSourceSpan | null,
): ExternalExpr {
  return new ExternalExpr(id, null, typeParams, sourceSpan);
}

export function importType(
  id: ExternalReference,
  typeParams?: Type[] | null,
  typeModifiers?: TypeModifier,
): ExpressionType | null {
  return id != null ? expressionType(importExpr(id, typeParams, null), typeModifiers) : null;
}

export function expressionType(
  expr: Expression,
  typeModifiers?: TypeModifier,
  typeParams?: Type[] | null,
): ExpressionType {
  return new ExpressionType(expr, typeModifiers, typeParams);
}

export function transplantedType<T>(type: T, typeModifiers?: TypeModifier): TransplantedType<T> {
  return new TransplantedType(type, typeModifiers);
}

export function typeofExpr(expr: Expression) {
  return new TypeofExpr(expr);
}

export function literalArr(
  values: Expression[],
  type?: Type | null,
  sourceSpan?: ParseSourceSpan | null,
): LiteralArrayExpr {
  return new LiteralArrayExpr(values, type, sourceSpan);
}

export function literalMap(
  values: {key: string; quoted: boolean; value: Expression}[],
  type: MapType | null = null,
): LiteralMapExpr {
  return new LiteralMapExpr(
    values.map((e) => new LiteralMapEntry(e.key, e.value, e.quoted)),
    type,
    null,
  );
}

export function unary(
  operator: UnaryOperator,
  expr: Expression,
  type?: Type,
  sourceSpan?: ParseSourceSpan | null,
): UnaryOperatorExpr {
  return new UnaryOperatorExpr(operator, expr, type, sourceSpan);
}

export function not(expr: Expression, sourceSpan?: ParseSourceSpan | null): NotExpr {
  return new NotExpr(expr, sourceSpan);
}

export function fn(
  params: FnParam[],
  body: Statement[],
  type?: Type | null,
  sourceSpan?: ParseSourceSpan | null,
  name?: string | null,
): FunctionExpr {
  return new FunctionExpr(params, body, type, sourceSpan, name);
}

export function arrowFn(
  params: FnParam[],
  body: Expression | Statement[],
  type?: Type | null,
  sourceSpan?: ParseSourceSpan | null,
) {
  return new ArrowFunctionExpr(params, body, type, sourceSpan);
}

export function ifStmt(
  condition: Expression,
  thenClause: Statement[],
  elseClause?: Statement[],
  sourceSpan?: ParseSourceSpan,
  leadingComments?: LeadingComment[],
) {
  return new IfStmt(condition, thenClause, elseClause, sourceSpan, leadingComments);
}

export function taggedTemplate(
  tag: Expression,
  template: TemplateLiteralExpr,
  type?: Type | null,
  sourceSpan?: ParseSourceSpan | null,
): TaggedTemplateLiteralExpr {
  return new TaggedTemplateLiteralExpr(tag, template, type, sourceSpan);
}

export function literal(
  value: any,
  type?: Type | null,
  sourceSpan?: ParseSourceSpan | null,
): LiteralExpr {
  return new LiteralExpr(value, type, sourceSpan);
}

export function localizedString(
  metaBlock: I18nMeta,
  messageParts: LiteralPiece[],
  placeholderNames: PlaceholderPiece[],
  expressions: Expression[],
  sourceSpan?: ParseSourceSpan | null,
): LocalizedString {
  return new LocalizedString(metaBlock, messageParts, placeholderNames, expressions, sourceSpan);
}

export function isNull(exp: Expression): boolean {
  return exp instanceof LiteralExpr && exp.value === null;
}

// The list of JSDoc tags that we currently support. Extend it if needed.
export const enum JSDocTagName {
  Desc = 'desc',
  Id = 'id',
  Meaning = 'meaning',
  Suppress = 'suppress',
}

/*
 * TypeScript has an API for JSDoc already, but it's not exposed.
 * https://github.com/Microsoft/TypeScript/issues/7393
 * For now we create types that are similar to theirs so that migrating
 * to their API will be easier. See e.g. `ts.JSDocTag` and `ts.JSDocComment`.
 */
export type JSDocTag =
  | {
      // `tagName` is e.g. "param" in an `@param` declaration
      tagName: JSDocTagName | string;
      // Any remaining text on the tag, e.g. the description
      text?: string;
    }
  | {
      // no `tagName` for plain text documentation that occurs before any `@param` lines
      tagName?: undefined;
      text: string;
    };

/*
 * Serializes a `Tag` into a string.
 * Returns a string like " @foo {bar} baz" (note the leading whitespace before `@foo`).
 */
function tagToString(tag: JSDocTag): string {
  let out = '';
  if (tag.tagName) {
    out += ` @${tag.tagName}`;
  }
  if (tag.text) {
    if (tag.text.match(/\/\*|\*\//)) {
      throw new Error('JSDoc text cannot contain "/*" and "*/"');
    }
    out += ' ' + tag.text.replace(/@/g, '\\@');
  }
  return out;
}

function serializeTags(tags: JSDocTag[]): string {
  if (tags.length === 0) return '';

  if (tags.length === 1 && tags[0].tagName && !tags[0].text) {
    // The JSDOC comment is a single simple tag: e.g `/** @tagname */`.
    return `*${tagToString(tags[0])} `;
  }

  let out = '*\n';
  for (const tag of tags) {
    out += ' *';
    // If the tagToString is multi-line, insert " * " prefixes on lines.
    out += tagToString(tag).replace(/\n/g, '\n * ');
    out += '\n';
  }
  out += ' ';
  return out;
}
