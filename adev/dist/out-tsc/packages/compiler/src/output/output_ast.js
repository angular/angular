/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {computeMsgId} from '../i18n/digest';
//// Types
export var TypeModifier;
(function (TypeModifier) {
  TypeModifier[(TypeModifier['None'] = 0)] = 'None';
  TypeModifier[(TypeModifier['Const'] = 1)] = 'Const';
})(TypeModifier || (TypeModifier = {}));
export class Type {
  modifiers;
  constructor(modifiers = TypeModifier.None) {
    this.modifiers = modifiers;
  }
  hasModifier(modifier) {
    return (this.modifiers & modifier) !== 0;
  }
}
export var BuiltinTypeName;
(function (BuiltinTypeName) {
  BuiltinTypeName[(BuiltinTypeName['Dynamic'] = 0)] = 'Dynamic';
  BuiltinTypeName[(BuiltinTypeName['Bool'] = 1)] = 'Bool';
  BuiltinTypeName[(BuiltinTypeName['String'] = 2)] = 'String';
  BuiltinTypeName[(BuiltinTypeName['Int'] = 3)] = 'Int';
  BuiltinTypeName[(BuiltinTypeName['Number'] = 4)] = 'Number';
  BuiltinTypeName[(BuiltinTypeName['Function'] = 5)] = 'Function';
  BuiltinTypeName[(BuiltinTypeName['Inferred'] = 6)] = 'Inferred';
  BuiltinTypeName[(BuiltinTypeName['None'] = 7)] = 'None';
})(BuiltinTypeName || (BuiltinTypeName = {}));
export class BuiltinType extends Type {
  name;
  constructor(name, modifiers) {
    super(modifiers);
    this.name = name;
  }
  visitType(visitor, context) {
    return visitor.visitBuiltinType(this, context);
  }
}
export class ExpressionType extends Type {
  value;
  typeParams;
  constructor(value, modifiers, typeParams = null) {
    super(modifiers);
    this.value = value;
    this.typeParams = typeParams;
  }
  visitType(visitor, context) {
    return visitor.visitExpressionType(this, context);
  }
}
export class ArrayType extends Type {
  of;
  constructor(of, modifiers) {
    super(modifiers);
    this.of = of;
  }
  visitType(visitor, context) {
    return visitor.visitArrayType(this, context);
  }
}
export class MapType extends Type {
  valueType;
  constructor(valueType, modifiers) {
    super(modifiers);
    this.valueType = valueType || null;
  }
  visitType(visitor, context) {
    return visitor.visitMapType(this, context);
  }
}
export class TransplantedType extends Type {
  type;
  constructor(type, modifiers) {
    super(modifiers);
    this.type = type;
  }
  visitType(visitor, context) {
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
///// Expressions
export var UnaryOperator;
(function (UnaryOperator) {
  UnaryOperator[(UnaryOperator['Minus'] = 0)] = 'Minus';
  UnaryOperator[(UnaryOperator['Plus'] = 1)] = 'Plus';
})(UnaryOperator || (UnaryOperator = {}));
export var BinaryOperator;
(function (BinaryOperator) {
  BinaryOperator[(BinaryOperator['Equals'] = 0)] = 'Equals';
  BinaryOperator[(BinaryOperator['NotEquals'] = 1)] = 'NotEquals';
  BinaryOperator[(BinaryOperator['Assign'] = 2)] = 'Assign';
  BinaryOperator[(BinaryOperator['Identical'] = 3)] = 'Identical';
  BinaryOperator[(BinaryOperator['NotIdentical'] = 4)] = 'NotIdentical';
  BinaryOperator[(BinaryOperator['Minus'] = 5)] = 'Minus';
  BinaryOperator[(BinaryOperator['Plus'] = 6)] = 'Plus';
  BinaryOperator[(BinaryOperator['Divide'] = 7)] = 'Divide';
  BinaryOperator[(BinaryOperator['Multiply'] = 8)] = 'Multiply';
  BinaryOperator[(BinaryOperator['Modulo'] = 9)] = 'Modulo';
  BinaryOperator[(BinaryOperator['And'] = 10)] = 'And';
  BinaryOperator[(BinaryOperator['Or'] = 11)] = 'Or';
  BinaryOperator[(BinaryOperator['BitwiseOr'] = 12)] = 'BitwiseOr';
  BinaryOperator[(BinaryOperator['BitwiseAnd'] = 13)] = 'BitwiseAnd';
  BinaryOperator[(BinaryOperator['Lower'] = 14)] = 'Lower';
  BinaryOperator[(BinaryOperator['LowerEquals'] = 15)] = 'LowerEquals';
  BinaryOperator[(BinaryOperator['Bigger'] = 16)] = 'Bigger';
  BinaryOperator[(BinaryOperator['BiggerEquals'] = 17)] = 'BiggerEquals';
  BinaryOperator[(BinaryOperator['NullishCoalesce'] = 18)] = 'NullishCoalesce';
  BinaryOperator[(BinaryOperator['Exponentiation'] = 19)] = 'Exponentiation';
  BinaryOperator[(BinaryOperator['In'] = 20)] = 'In';
  BinaryOperator[(BinaryOperator['AdditionAssignment'] = 21)] = 'AdditionAssignment';
  BinaryOperator[(BinaryOperator['SubtractionAssignment'] = 22)] = 'SubtractionAssignment';
  BinaryOperator[(BinaryOperator['MultiplicationAssignment'] = 23)] = 'MultiplicationAssignment';
  BinaryOperator[(BinaryOperator['DivisionAssignment'] = 24)] = 'DivisionAssignment';
  BinaryOperator[(BinaryOperator['RemainderAssignment'] = 25)] = 'RemainderAssignment';
  BinaryOperator[(BinaryOperator['ExponentiationAssignment'] = 26)] = 'ExponentiationAssignment';
  BinaryOperator[(BinaryOperator['AndAssignment'] = 27)] = 'AndAssignment';
  BinaryOperator[(BinaryOperator['OrAssignment'] = 28)] = 'OrAssignment';
  BinaryOperator[(BinaryOperator['NullishCoalesceAssignment'] = 29)] = 'NullishCoalesceAssignment';
})(BinaryOperator || (BinaryOperator = {}));
export function nullSafeIsEquivalent(base, other) {
  if (base == null || other == null) {
    return base == other;
  }
  return base.isEquivalent(other);
}
function areAllEquivalentPredicate(base, other, equivalentPredicate) {
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
export function areAllEquivalent(base, other) {
  return areAllEquivalentPredicate(base, other, (baseElement, otherElement) =>
    baseElement.isEquivalent(otherElement),
  );
}
export class Expression {
  type;
  sourceSpan;
  constructor(type, sourceSpan) {
    this.type = type || null;
    this.sourceSpan = sourceSpan || null;
  }
  prop(name, sourceSpan) {
    return new ReadPropExpr(this, name, null, sourceSpan);
  }
  key(index, type, sourceSpan) {
    return new ReadKeyExpr(this, index, type, sourceSpan);
  }
  callFn(params, sourceSpan, pure) {
    return new InvokeFunctionExpr(this, params, null, sourceSpan, pure);
  }
  instantiate(params, type, sourceSpan) {
    return new InstantiateExpr(this, params, type, sourceSpan);
  }
  conditional(trueCase, falseCase = null, sourceSpan) {
    return new ConditionalExpr(this, trueCase, falseCase, null, sourceSpan);
  }
  equals(rhs, sourceSpan) {
    return new BinaryOperatorExpr(BinaryOperator.Equals, this, rhs, null, sourceSpan);
  }
  notEquals(rhs, sourceSpan) {
    return new BinaryOperatorExpr(BinaryOperator.NotEquals, this, rhs, null, sourceSpan);
  }
  identical(rhs, sourceSpan) {
    return new BinaryOperatorExpr(BinaryOperator.Identical, this, rhs, null, sourceSpan);
  }
  notIdentical(rhs, sourceSpan) {
    return new BinaryOperatorExpr(BinaryOperator.NotIdentical, this, rhs, null, sourceSpan);
  }
  minus(rhs, sourceSpan) {
    return new BinaryOperatorExpr(BinaryOperator.Minus, this, rhs, null, sourceSpan);
  }
  plus(rhs, sourceSpan) {
    return new BinaryOperatorExpr(BinaryOperator.Plus, this, rhs, null, sourceSpan);
  }
  divide(rhs, sourceSpan) {
    return new BinaryOperatorExpr(BinaryOperator.Divide, this, rhs, null, sourceSpan);
  }
  multiply(rhs, sourceSpan) {
    return new BinaryOperatorExpr(BinaryOperator.Multiply, this, rhs, null, sourceSpan);
  }
  modulo(rhs, sourceSpan) {
    return new BinaryOperatorExpr(BinaryOperator.Modulo, this, rhs, null, sourceSpan);
  }
  power(rhs, sourceSpan) {
    return new BinaryOperatorExpr(BinaryOperator.Exponentiation, this, rhs, null, sourceSpan);
  }
  and(rhs, sourceSpan) {
    return new BinaryOperatorExpr(BinaryOperator.And, this, rhs, null, sourceSpan);
  }
  bitwiseOr(rhs, sourceSpan) {
    return new BinaryOperatorExpr(BinaryOperator.BitwiseOr, this, rhs, null, sourceSpan);
  }
  bitwiseAnd(rhs, sourceSpan) {
    return new BinaryOperatorExpr(BinaryOperator.BitwiseAnd, this, rhs, null, sourceSpan);
  }
  or(rhs, sourceSpan) {
    return new BinaryOperatorExpr(BinaryOperator.Or, this, rhs, null, sourceSpan);
  }
  lower(rhs, sourceSpan) {
    return new BinaryOperatorExpr(BinaryOperator.Lower, this, rhs, null, sourceSpan);
  }
  lowerEquals(rhs, sourceSpan) {
    return new BinaryOperatorExpr(BinaryOperator.LowerEquals, this, rhs, null, sourceSpan);
  }
  bigger(rhs, sourceSpan) {
    return new BinaryOperatorExpr(BinaryOperator.Bigger, this, rhs, null, sourceSpan);
  }
  biggerEquals(rhs, sourceSpan) {
    return new BinaryOperatorExpr(BinaryOperator.BiggerEquals, this, rhs, null, sourceSpan);
  }
  isBlank(sourceSpan) {
    // Note: We use equals by purpose here to compare to null and undefined in JS.
    // We use the typed null to allow strictNullChecks to narrow types.
    return this.equals(TYPED_NULL_EXPR, sourceSpan);
  }
  nullishCoalesce(rhs, sourceSpan) {
    return new BinaryOperatorExpr(BinaryOperator.NullishCoalesce, this, rhs, null, sourceSpan);
  }
  toStmt() {
    return new ExpressionStatement(this, null);
  }
}
export class ReadVarExpr extends Expression {
  name;
  constructor(name, type, sourceSpan) {
    super(type, sourceSpan);
    this.name = name;
  }
  isEquivalent(e) {
    return e instanceof ReadVarExpr && this.name === e.name;
  }
  isConstant() {
    return false;
  }
  visitExpression(visitor, context) {
    return visitor.visitReadVarExpr(this, context);
  }
  clone() {
    return new ReadVarExpr(this.name, this.type, this.sourceSpan);
  }
  set(value) {
    return new BinaryOperatorExpr(BinaryOperator.Assign, this, value, null, this.sourceSpan);
  }
}
export class TypeofExpr extends Expression {
  expr;
  constructor(expr, type, sourceSpan) {
    super(type, sourceSpan);
    this.expr = expr;
  }
  visitExpression(visitor, context) {
    return visitor.visitTypeofExpr(this, context);
  }
  isEquivalent(e) {
    return e instanceof TypeofExpr && e.expr.isEquivalent(this.expr);
  }
  isConstant() {
    return this.expr.isConstant();
  }
  clone() {
    return new TypeofExpr(this.expr.clone());
  }
}
export class VoidExpr extends Expression {
  expr;
  constructor(expr, type, sourceSpan) {
    super(type, sourceSpan);
    this.expr = expr;
  }
  visitExpression(visitor, context) {
    return visitor.visitVoidExpr(this, context);
  }
  isEquivalent(e) {
    return e instanceof VoidExpr && e.expr.isEquivalent(this.expr);
  }
  isConstant() {
    return this.expr.isConstant();
  }
  clone() {
    return new VoidExpr(this.expr.clone());
  }
}
export class WrappedNodeExpr extends Expression {
  node;
  constructor(node, type, sourceSpan) {
    super(type, sourceSpan);
    this.node = node;
  }
  isEquivalent(e) {
    return e instanceof WrappedNodeExpr && this.node === e.node;
  }
  isConstant() {
    return false;
  }
  visitExpression(visitor, context) {
    return visitor.visitWrappedNodeExpr(this, context);
  }
  clone() {
    return new WrappedNodeExpr(this.node, this.type, this.sourceSpan);
  }
}
export class InvokeFunctionExpr extends Expression {
  fn;
  args;
  pure;
  constructor(fn, args, type, sourceSpan, pure = false) {
    super(type, sourceSpan);
    this.fn = fn;
    this.args = args;
    this.pure = pure;
  }
  // An alias for fn, which allows other logic to handle calls and property reads together.
  get receiver() {
    return this.fn;
  }
  isEquivalent(e) {
    return (
      e instanceof InvokeFunctionExpr &&
      this.fn.isEquivalent(e.fn) &&
      areAllEquivalent(this.args, e.args) &&
      this.pure === e.pure
    );
  }
  isConstant() {
    return false;
  }
  visitExpression(visitor, context) {
    return visitor.visitInvokeFunctionExpr(this, context);
  }
  clone() {
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
  tag;
  template;
  constructor(tag, template, type, sourceSpan) {
    super(type, sourceSpan);
    this.tag = tag;
    this.template = template;
  }
  isEquivalent(e) {
    return (
      e instanceof TaggedTemplateLiteralExpr &&
      this.tag.isEquivalent(e.tag) &&
      this.template.isEquivalent(e.template)
    );
  }
  isConstant() {
    return false;
  }
  visitExpression(visitor, context) {
    return visitor.visitTaggedTemplateLiteralExpr(this, context);
  }
  clone() {
    return new TaggedTemplateLiteralExpr(
      this.tag.clone(),
      this.template.clone(),
      this.type,
      this.sourceSpan,
    );
  }
}
export class InstantiateExpr extends Expression {
  classExpr;
  args;
  constructor(classExpr, args, type, sourceSpan) {
    super(type, sourceSpan);
    this.classExpr = classExpr;
    this.args = args;
  }
  isEquivalent(e) {
    return (
      e instanceof InstantiateExpr &&
      this.classExpr.isEquivalent(e.classExpr) &&
      areAllEquivalent(this.args, e.args)
    );
  }
  isConstant() {
    return false;
  }
  visitExpression(visitor, context) {
    return visitor.visitInstantiateExpr(this, context);
  }
  clone() {
    return new InstantiateExpr(
      this.classExpr.clone(),
      this.args.map((arg) => arg.clone()),
      this.type,
      this.sourceSpan,
    );
  }
}
export class RegularExpressionLiteral extends Expression {
  body;
  flags;
  constructor(body, flags, sourceSpan) {
    super(null, sourceSpan);
    this.body = body;
    this.flags = flags;
  }
  isEquivalent(e) {
    return e instanceof RegularExpressionLiteral && this.body === e.body && this.flags === e.flags;
  }
  isConstant() {
    return true;
  }
  visitExpression(visitor, context) {
    return visitor.visitRegularExpressionLiteral(this, context);
  }
  clone() {
    return new RegularExpressionLiteral(this.body, this.flags, this.sourceSpan);
  }
}
export class LiteralExpr extends Expression {
  value;
  constructor(value, type, sourceSpan) {
    super(type, sourceSpan);
    this.value = value;
  }
  isEquivalent(e) {
    return e instanceof LiteralExpr && this.value === e.value;
  }
  isConstant() {
    return true;
  }
  visitExpression(visitor, context) {
    return visitor.visitLiteralExpr(this, context);
  }
  clone() {
    return new LiteralExpr(this.value, this.type, this.sourceSpan);
  }
}
export class TemplateLiteralExpr extends Expression {
  elements;
  expressions;
  constructor(elements, expressions, sourceSpan) {
    super(null, sourceSpan);
    this.elements = elements;
    this.expressions = expressions;
  }
  isEquivalent(e) {
    return (
      e instanceof TemplateLiteralExpr &&
      areAllEquivalentPredicate(this.elements, e.elements, (a, b) => a.text === b.text) &&
      areAllEquivalent(this.expressions, e.expressions)
    );
  }
  isConstant() {
    return false;
  }
  visitExpression(visitor, context) {
    return visitor.visitTemplateLiteralExpr(this, context);
  }
  clone() {
    return new TemplateLiteralExpr(
      this.elements.map((el) => el.clone()),
      this.expressions.map((expr) => expr.clone()),
    );
  }
}
export class TemplateLiteralElementExpr extends Expression {
  text;
  rawText;
  constructor(text, sourceSpan, rawText) {
    super(STRING_TYPE, sourceSpan);
    this.text = text;
    // If `rawText` is not provided, "fake" the raw string by escaping the following sequences:
    // - "\" would otherwise indicate that the next character is a control character.
    // - "`" and "${" are template string control sequences that would otherwise prematurely
    // indicate the end of the template literal element.
    // Note that we can't rely on the `sourceSpan` here, because it may be incorrect (see
    // https://github.com/angular/angular/pull/60267#discussion_r1986402524).
    this.rawText = rawText ?? escapeForTemplateLiteral(escapeSlashes(text));
  }
  visitExpression(visitor, context) {
    return visitor.visitTemplateLiteralElementExpr(this, context);
  }
  isEquivalent(e) {
    return (
      e instanceof TemplateLiteralElementExpr && e.text === this.text && e.rawText === this.rawText
    );
  }
  isConstant() {
    return true;
  }
  clone() {
    return new TemplateLiteralElementExpr(this.text, this.sourceSpan, this.rawText);
  }
}
export class LiteralPiece {
  text;
  sourceSpan;
  constructor(text, sourceSpan) {
    this.text = text;
    this.sourceSpan = sourceSpan;
  }
}
export class PlaceholderPiece {
  text;
  sourceSpan;
  associatedMessage;
  /**
   * Create a new instance of a `PlaceholderPiece`.
   *
   * @param text the name of this placeholder (e.g. `PH_1`).
   * @param sourceSpan the location of this placeholder in its localized message the source code.
   * @param associatedMessage reference to another message that this placeholder is associated with.
   * The `associatedMessage` is mainly used to provide a relationship to an ICU message that has
   * been extracted out from the message containing the placeholder.
   */
  constructor(text, sourceSpan, associatedMessage) {
    this.text = text;
    this.sourceSpan = sourceSpan;
    this.associatedMessage = associatedMessage;
  }
}
const MEANING_SEPARATOR = '|';
const ID_SEPARATOR = '@@';
const LEGACY_ID_INDICATOR = '␟';
export class LocalizedString extends Expression {
  metaBlock;
  messageParts;
  placeHolderNames;
  expressions;
  constructor(metaBlock, messageParts, placeHolderNames, expressions, sourceSpan) {
    super(STRING_TYPE, sourceSpan);
    this.metaBlock = metaBlock;
    this.messageParts = messageParts;
    this.placeHolderNames = placeHolderNames;
    this.expressions = expressions;
  }
  isEquivalent(e) {
    // return e instanceof LocalizedString && this.message === e.message;
    return false;
  }
  isConstant() {
    return false;
  }
  visitExpression(visitor, context) {
    return visitor.visitLocalizedString(this, context);
  }
  clone() {
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
  serializeI18nHead() {
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
  getMessagePartSourceSpan(i) {
    return this.messageParts[i]?.sourceSpan ?? this.sourceSpan;
  }
  getPlaceholderSourceSpan(i) {
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
  serializeI18nTemplatePart(partIndex) {
    const placeholder = this.placeHolderNames[partIndex - 1];
    const messagePart = this.messageParts[partIndex];
    let metaBlock = placeholder.text;
    if (placeholder.associatedMessage?.legacyIds.length === 0) {
      metaBlock += `${ID_SEPARATOR}${computeMsgId(placeholder.associatedMessage.messageString, placeholder.associatedMessage.meaning)}`;
    }
    return createCookedRawString(
      metaBlock,
      messagePart.text,
      this.getMessagePartSourceSpan(partIndex),
    );
  }
}
const escapeSlashes = (str) => str.replace(/\\/g, '\\\\');
const escapeStartingColon = (str) => str.replace(/^:/, '\\:');
const escapeColons = (str) => str.replace(/:/g, '\\:');
const escapeForTemplateLiteral = (str) => str.replace(/`/g, '\\`').replace(/\${/g, '$\\{');
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
function createCookedRawString(metaBlock, messagePart, range) {
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
  value;
  typeParams;
  constructor(value, type, typeParams = null, sourceSpan) {
    super(type, sourceSpan);
    this.value = value;
    this.typeParams = typeParams;
  }
  isEquivalent(e) {
    return (
      e instanceof ExternalExpr &&
      this.value.name === e.value.name &&
      this.value.moduleName === e.value.moduleName
    );
  }
  isConstant() {
    return false;
  }
  visitExpression(visitor, context) {
    return visitor.visitExternalExpr(this, context);
  }
  clone() {
    return new ExternalExpr(this.value, this.type, this.typeParams, this.sourceSpan);
  }
}
export class ExternalReference {
  moduleName;
  name;
  constructor(moduleName, name) {
    this.moduleName = moduleName;
    this.name = name;
  }
}
export class ConditionalExpr extends Expression {
  condition;
  falseCase;
  trueCase;
  constructor(condition, trueCase, falseCase = null, type, sourceSpan) {
    super(type || trueCase.type, sourceSpan);
    this.condition = condition;
    this.falseCase = falseCase;
    this.trueCase = trueCase;
  }
  isEquivalent(e) {
    return (
      e instanceof ConditionalExpr &&
      this.condition.isEquivalent(e.condition) &&
      this.trueCase.isEquivalent(e.trueCase) &&
      nullSafeIsEquivalent(this.falseCase, e.falseCase)
    );
  }
  isConstant() {
    return false;
  }
  visitExpression(visitor, context) {
    return visitor.visitConditionalExpr(this, context);
  }
  clone() {
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
  url;
  urlComment;
  constructor(url, sourceSpan, urlComment) {
    super(null, sourceSpan);
    this.url = url;
    this.urlComment = urlComment;
  }
  isEquivalent(e) {
    return e instanceof DynamicImportExpr && this.url === e.url && this.urlComment === e.urlComment;
  }
  isConstant() {
    return false;
  }
  visitExpression(visitor, context) {
    return visitor.visitDynamicImportExpr(this, context);
  }
  clone() {
    return new DynamicImportExpr(
      typeof this.url === 'string' ? this.url : this.url.clone(),
      this.sourceSpan,
      this.urlComment,
    );
  }
}
export class NotExpr extends Expression {
  condition;
  constructor(condition, sourceSpan) {
    super(BOOL_TYPE, sourceSpan);
    this.condition = condition;
  }
  isEquivalent(e) {
    return e instanceof NotExpr && this.condition.isEquivalent(e.condition);
  }
  isConstant() {
    return false;
  }
  visitExpression(visitor, context) {
    return visitor.visitNotExpr(this, context);
  }
  clone() {
    return new NotExpr(this.condition.clone(), this.sourceSpan);
  }
}
export class FnParam {
  name;
  type;
  constructor(name, type = null) {
    this.name = name;
    this.type = type;
  }
  isEquivalent(param) {
    return this.name === param.name;
  }
  clone() {
    return new FnParam(this.name, this.type);
  }
}
export class FunctionExpr extends Expression {
  params;
  statements;
  name;
  constructor(params, statements, type, sourceSpan, name) {
    super(type, sourceSpan);
    this.params = params;
    this.statements = statements;
    this.name = name;
  }
  isEquivalent(e) {
    return (
      (e instanceof FunctionExpr || e instanceof DeclareFunctionStmt) &&
      areAllEquivalent(this.params, e.params) &&
      areAllEquivalent(this.statements, e.statements)
    );
  }
  isConstant() {
    return false;
  }
  visitExpression(visitor, context) {
    return visitor.visitFunctionExpr(this, context);
  }
  toDeclStmt(name, modifiers) {
    return new DeclareFunctionStmt(
      name,
      this.params,
      this.statements,
      this.type,
      modifiers,
      this.sourceSpan,
    );
  }
  clone() {
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
  params;
  body;
  // Note that `body: Expression` represents `() => expr` whereas
  // `body: Statement[]` represents `() => { expr }`.
  constructor(params, body, type, sourceSpan) {
    super(type, sourceSpan);
    this.params = params;
    this.body = body;
  }
  isEquivalent(e) {
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
  isConstant() {
    return false;
  }
  visitExpression(visitor, context) {
    return visitor.visitArrowFunctionExpr(this, context);
  }
  clone() {
    // TODO: Should we deep clone statements?
    return new ArrowFunctionExpr(
      this.params.map((p) => p.clone()),
      Array.isArray(this.body) ? this.body : this.body.clone(),
      this.type,
      this.sourceSpan,
    );
  }
  toDeclStmt(name, modifiers) {
    return new DeclareVarStmt(name, this, INFERRED_TYPE, modifiers, this.sourceSpan);
  }
}
export class UnaryOperatorExpr extends Expression {
  operator;
  expr;
  parens;
  constructor(operator, expr, type, sourceSpan, parens = true) {
    super(type || NUMBER_TYPE, sourceSpan);
    this.operator = operator;
    this.expr = expr;
    this.parens = parens;
  }
  isEquivalent(e) {
    return (
      e instanceof UnaryOperatorExpr &&
      this.operator === e.operator &&
      this.expr.isEquivalent(e.expr)
    );
  }
  isConstant() {
    return false;
  }
  visitExpression(visitor, context) {
    return visitor.visitUnaryOperatorExpr(this, context);
  }
  clone() {
    return new UnaryOperatorExpr(
      this.operator,
      this.expr.clone(),
      this.type,
      this.sourceSpan,
      this.parens,
    );
  }
}
export class ParenthesizedExpr extends Expression {
  expr;
  constructor(expr, type, sourceSpan) {
    super(type, sourceSpan);
    this.expr = expr;
  }
  visitExpression(visitor, context) {
    return visitor.visitParenthesizedExpr(this, context);
  }
  isEquivalent(e) {
    // TODO: should this ignore paren depth? i.e. is `(1)` equivalent to `1`?
    return e instanceof ParenthesizedExpr && e.expr.isEquivalent(this.expr);
  }
  isConstant() {
    return this.expr.isConstant();
  }
  clone() {
    return new ParenthesizedExpr(this.expr.clone());
  }
}
export class BinaryOperatorExpr extends Expression {
  operator;
  rhs;
  lhs;
  constructor(operator, lhs, rhs, type, sourceSpan) {
    super(type || lhs.type, sourceSpan);
    this.operator = operator;
    this.rhs = rhs;
    this.lhs = lhs;
  }
  isEquivalent(e) {
    return (
      e instanceof BinaryOperatorExpr &&
      this.operator === e.operator &&
      this.lhs.isEquivalent(e.lhs) &&
      this.rhs.isEquivalent(e.rhs)
    );
  }
  isConstant() {
    return false;
  }
  visitExpression(visitor, context) {
    return visitor.visitBinaryOperatorExpr(this, context);
  }
  clone() {
    return new BinaryOperatorExpr(
      this.operator,
      this.lhs.clone(),
      this.rhs.clone(),
      this.type,
      this.sourceSpan,
    );
  }
  isAssignment() {
    const op = this.operator;
    return (
      op === BinaryOperator.Assign ||
      op === BinaryOperator.AdditionAssignment ||
      op === BinaryOperator.SubtractionAssignment ||
      op === BinaryOperator.MultiplicationAssignment ||
      op === BinaryOperator.DivisionAssignment ||
      op === BinaryOperator.RemainderAssignment ||
      op === BinaryOperator.ExponentiationAssignment ||
      op === BinaryOperator.AndAssignment ||
      op === BinaryOperator.OrAssignment ||
      op === BinaryOperator.NullishCoalesceAssignment
    );
  }
}
export class ReadPropExpr extends Expression {
  receiver;
  name;
  constructor(receiver, name, type, sourceSpan) {
    super(type, sourceSpan);
    this.receiver = receiver;
    this.name = name;
  }
  // An alias for name, which allows other logic to handle property reads and keyed reads together.
  get index() {
    return this.name;
  }
  isEquivalent(e) {
    return (
      e instanceof ReadPropExpr && this.receiver.isEquivalent(e.receiver) && this.name === e.name
    );
  }
  isConstant() {
    return false;
  }
  visitExpression(visitor, context) {
    return visitor.visitReadPropExpr(this, context);
  }
  set(value) {
    return new BinaryOperatorExpr(
      BinaryOperator.Assign,
      this.receiver.prop(this.name),
      value,
      null,
      this.sourceSpan,
    );
  }
  clone() {
    return new ReadPropExpr(this.receiver.clone(), this.name, this.type, this.sourceSpan);
  }
}
export class ReadKeyExpr extends Expression {
  receiver;
  index;
  constructor(receiver, index, type, sourceSpan) {
    super(type, sourceSpan);
    this.receiver = receiver;
    this.index = index;
  }
  isEquivalent(e) {
    return (
      e instanceof ReadKeyExpr &&
      this.receiver.isEquivalent(e.receiver) &&
      this.index.isEquivalent(e.index)
    );
  }
  isConstant() {
    return false;
  }
  visitExpression(visitor, context) {
    return visitor.visitReadKeyExpr(this, context);
  }
  set(value) {
    return new BinaryOperatorExpr(
      BinaryOperator.Assign,
      this.receiver.key(this.index),
      value,
      null,
      this.sourceSpan,
    );
  }
  clone() {
    return new ReadKeyExpr(this.receiver.clone(), this.index.clone(), this.type, this.sourceSpan);
  }
}
export class LiteralArrayExpr extends Expression {
  entries;
  constructor(entries, type, sourceSpan) {
    super(type, sourceSpan);
    this.entries = entries;
  }
  isConstant() {
    return this.entries.every((e) => e.isConstant());
  }
  isEquivalent(e) {
    return e instanceof LiteralArrayExpr && areAllEquivalent(this.entries, e.entries);
  }
  visitExpression(visitor, context) {
    return visitor.visitLiteralArrayExpr(this, context);
  }
  clone() {
    return new LiteralArrayExpr(
      this.entries.map((e) => e.clone()),
      this.type,
      this.sourceSpan,
    );
  }
}
export class LiteralMapEntry {
  key;
  value;
  quoted;
  constructor(key, value, quoted) {
    this.key = key;
    this.value = value;
    this.quoted = quoted;
  }
  isEquivalent(e) {
    return this.key === e.key && this.value.isEquivalent(e.value);
  }
  clone() {
    return new LiteralMapEntry(this.key, this.value.clone(), this.quoted);
  }
}
export class LiteralMapExpr extends Expression {
  entries;
  valueType = null;
  constructor(entries, type, sourceSpan) {
    super(type, sourceSpan);
    this.entries = entries;
    if (type) {
      this.valueType = type.valueType;
    }
  }
  isEquivalent(e) {
    return e instanceof LiteralMapExpr && areAllEquivalent(this.entries, e.entries);
  }
  isConstant() {
    return this.entries.every((e) => e.value.isConstant());
  }
  visitExpression(visitor, context) {
    return visitor.visitLiteralMapExpr(this, context);
  }
  clone() {
    const entriesClone = this.entries.map((entry) => entry.clone());
    return new LiteralMapExpr(entriesClone, this.type, this.sourceSpan);
  }
}
export class CommaExpr extends Expression {
  parts;
  constructor(parts, sourceSpan) {
    super(parts[parts.length - 1].type, sourceSpan);
    this.parts = parts;
  }
  isEquivalent(e) {
    return e instanceof CommaExpr && areAllEquivalent(this.parts, e.parts);
  }
  isConstant() {
    return false;
  }
  visitExpression(visitor, context) {
    return visitor.visitCommaExpr(this, context);
  }
  clone() {
    return new CommaExpr(this.parts.map((p) => p.clone()));
  }
}
export const NULL_EXPR = new LiteralExpr(null, null, null);
export const TYPED_NULL_EXPR = new LiteralExpr(null, INFERRED_TYPE, null);
//// Statements
export var StmtModifier;
(function (StmtModifier) {
  StmtModifier[(StmtModifier['None'] = 0)] = 'None';
  StmtModifier[(StmtModifier['Final'] = 1)] = 'Final';
  StmtModifier[(StmtModifier['Private'] = 2)] = 'Private';
  StmtModifier[(StmtModifier['Exported'] = 4)] = 'Exported';
  StmtModifier[(StmtModifier['Static'] = 8)] = 'Static';
})(StmtModifier || (StmtModifier = {}));
export class LeadingComment {
  text;
  multiline;
  trailingNewline;
  constructor(text, multiline, trailingNewline) {
    this.text = text;
    this.multiline = multiline;
    this.trailingNewline = trailingNewline;
  }
  toString() {
    return this.multiline ? ` ${this.text} ` : this.text;
  }
}
export class JSDocComment extends LeadingComment {
  tags;
  constructor(tags) {
    super('', /* multiline */ true, /* trailingNewline */ true);
    this.tags = tags;
  }
  toString() {
    return serializeTags(this.tags);
  }
}
export class Statement {
  modifiers;
  sourceSpan;
  leadingComments;
  constructor(modifiers = StmtModifier.None, sourceSpan = null, leadingComments) {
    this.modifiers = modifiers;
    this.sourceSpan = sourceSpan;
    this.leadingComments = leadingComments;
  }
  hasModifier(modifier) {
    return (this.modifiers & modifier) !== 0;
  }
  addLeadingComment(leadingComment) {
    this.leadingComments = this.leadingComments ?? [];
    this.leadingComments.push(leadingComment);
  }
}
export class DeclareVarStmt extends Statement {
  name;
  value;
  type;
  constructor(name, value, type, modifiers, sourceSpan, leadingComments) {
    super(modifiers, sourceSpan, leadingComments);
    this.name = name;
    this.value = value;
    this.type = type || (value && value.type) || null;
  }
  isEquivalent(stmt) {
    return (
      stmt instanceof DeclareVarStmt &&
      this.name === stmt.name &&
      (this.value ? !!stmt.value && this.value.isEquivalent(stmt.value) : !stmt.value)
    );
  }
  visitStatement(visitor, context) {
    return visitor.visitDeclareVarStmt(this, context);
  }
}
export class DeclareFunctionStmt extends Statement {
  name;
  params;
  statements;
  type;
  constructor(name, params, statements, type, modifiers, sourceSpan, leadingComments) {
    super(modifiers, sourceSpan, leadingComments);
    this.name = name;
    this.params = params;
    this.statements = statements;
    this.type = type || null;
  }
  isEquivalent(stmt) {
    return (
      stmt instanceof DeclareFunctionStmt &&
      areAllEquivalent(this.params, stmt.params) &&
      areAllEquivalent(this.statements, stmt.statements)
    );
  }
  visitStatement(visitor, context) {
    return visitor.visitDeclareFunctionStmt(this, context);
  }
}
export class ExpressionStatement extends Statement {
  expr;
  constructor(expr, sourceSpan, leadingComments) {
    super(StmtModifier.None, sourceSpan, leadingComments);
    this.expr = expr;
  }
  isEquivalent(stmt) {
    return stmt instanceof ExpressionStatement && this.expr.isEquivalent(stmt.expr);
  }
  visitStatement(visitor, context) {
    return visitor.visitExpressionStmt(this, context);
  }
}
export class ReturnStatement extends Statement {
  value;
  constructor(value, sourceSpan = null, leadingComments) {
    super(StmtModifier.None, sourceSpan, leadingComments);
    this.value = value;
  }
  isEquivalent(stmt) {
    return stmt instanceof ReturnStatement && this.value.isEquivalent(stmt.value);
  }
  visitStatement(visitor, context) {
    return visitor.visitReturnStmt(this, context);
  }
}
export class IfStmt extends Statement {
  condition;
  trueCase;
  falseCase;
  constructor(condition, trueCase, falseCase = [], sourceSpan, leadingComments) {
    super(StmtModifier.None, sourceSpan, leadingComments);
    this.condition = condition;
    this.trueCase = trueCase;
    this.falseCase = falseCase;
  }
  isEquivalent(stmt) {
    return (
      stmt instanceof IfStmt &&
      this.condition.isEquivalent(stmt.condition) &&
      areAllEquivalent(this.trueCase, stmt.trueCase) &&
      areAllEquivalent(this.falseCase, stmt.falseCase)
    );
  }
  visitStatement(visitor, context) {
    return visitor.visitIfStmt(this, context);
  }
}
export class RecursiveAstVisitor {
  visitType(ast, context) {
    return ast;
  }
  visitExpression(ast, context) {
    if (ast.type) {
      ast.type.visitType(this, context);
    }
    return ast;
  }
  visitBuiltinType(type, context) {
    return this.visitType(type, context);
  }
  visitExpressionType(type, context) {
    type.value.visitExpression(this, context);
    if (type.typeParams !== null) {
      type.typeParams.forEach((param) => this.visitType(param, context));
    }
    return this.visitType(type, context);
  }
  visitArrayType(type, context) {
    return this.visitType(type, context);
  }
  visitMapType(type, context) {
    return this.visitType(type, context);
  }
  visitTransplantedType(type, context) {
    return type;
  }
  visitWrappedNodeExpr(ast, context) {
    return ast;
  }
  visitReadVarExpr(ast, context) {
    return this.visitExpression(ast, context);
  }
  visitDynamicImportExpr(ast, context) {
    return this.visitExpression(ast, context);
  }
  visitInvokeFunctionExpr(ast, context) {
    ast.fn.visitExpression(this, context);
    this.visitAllExpressions(ast.args, context);
    return this.visitExpression(ast, context);
  }
  visitTaggedTemplateLiteralExpr(ast, context) {
    ast.tag.visitExpression(this, context);
    ast.template.visitExpression(this, context);
    return this.visitExpression(ast, context);
  }
  visitInstantiateExpr(ast, context) {
    ast.classExpr.visitExpression(this, context);
    this.visitAllExpressions(ast.args, context);
    return this.visitExpression(ast, context);
  }
  visitLiteralExpr(ast, context) {
    return this.visitExpression(ast, context);
  }
  visitRegularExpressionLiteral(ast, context) {
    return this.visitExpression(ast, context);
  }
  visitLocalizedString(ast, context) {
    return this.visitExpression(ast, context);
  }
  visitExternalExpr(ast, context) {
    if (ast.typeParams) {
      ast.typeParams.forEach((type) => type.visitType(this, context));
    }
    return this.visitExpression(ast, context);
  }
  visitConditionalExpr(ast, context) {
    ast.condition.visitExpression(this, context);
    ast.trueCase.visitExpression(this, context);
    ast.falseCase.visitExpression(this, context);
    return this.visitExpression(ast, context);
  }
  visitNotExpr(ast, context) {
    ast.condition.visitExpression(this, context);
    return this.visitExpression(ast, context);
  }
  visitFunctionExpr(ast, context) {
    this.visitAllStatements(ast.statements, context);
    return this.visitExpression(ast, context);
  }
  visitArrowFunctionExpr(ast, context) {
    if (Array.isArray(ast.body)) {
      this.visitAllStatements(ast.body, context);
    } else {
      // Note: `body.visitExpression`, rather than `this.visitExpressiont(body)`,
      // because the latter won't recurse into the sub-expressions.
      ast.body.visitExpression(this, context);
    }
    return this.visitExpression(ast, context);
  }
  visitUnaryOperatorExpr(ast, context) {
    ast.expr.visitExpression(this, context);
    return this.visitExpression(ast, context);
  }
  visitTypeofExpr(ast, context) {
    ast.expr.visitExpression(this, context);
    return this.visitExpression(ast, context);
  }
  visitVoidExpr(ast, context) {
    ast.expr.visitExpression(this, context);
    return this.visitExpression(ast, context);
  }
  visitBinaryOperatorExpr(ast, context) {
    ast.lhs.visitExpression(this, context);
    ast.rhs.visitExpression(this, context);
    return this.visitExpression(ast, context);
  }
  visitReadPropExpr(ast, context) {
    ast.receiver.visitExpression(this, context);
    return this.visitExpression(ast, context);
  }
  visitReadKeyExpr(ast, context) {
    ast.receiver.visitExpression(this, context);
    ast.index.visitExpression(this, context);
    return this.visitExpression(ast, context);
  }
  visitLiteralArrayExpr(ast, context) {
    this.visitAllExpressions(ast.entries, context);
    return this.visitExpression(ast, context);
  }
  visitLiteralMapExpr(ast, context) {
    ast.entries.forEach((entry) => entry.value.visitExpression(this, context));
    return this.visitExpression(ast, context);
  }
  visitCommaExpr(ast, context) {
    this.visitAllExpressions(ast.parts, context);
    return this.visitExpression(ast, context);
  }
  visitTemplateLiteralExpr(ast, context) {
    this.visitAllExpressions(ast.elements, context);
    this.visitAllExpressions(ast.expressions, context);
    return this.visitExpression(ast, context);
  }
  visitTemplateLiteralElementExpr(ast, context) {
    return this.visitExpression(ast, context);
  }
  visitParenthesizedExpr(ast, context) {
    ast.expr.visitExpression(this, context);
    return this.visitExpression(ast, context);
  }
  visitAllExpressions(exprs, context) {
    exprs.forEach((expr) => expr.visitExpression(this, context));
  }
  visitDeclareVarStmt(stmt, context) {
    if (stmt.value) {
      stmt.value.visitExpression(this, context);
    }
    if (stmt.type) {
      stmt.type.visitType(this, context);
    }
    return stmt;
  }
  visitDeclareFunctionStmt(stmt, context) {
    this.visitAllStatements(stmt.statements, context);
    if (stmt.type) {
      stmt.type.visitType(this, context);
    }
    return stmt;
  }
  visitExpressionStmt(stmt, context) {
    stmt.expr.visitExpression(this, context);
    return stmt;
  }
  visitReturnStmt(stmt, context) {
    stmt.value.visitExpression(this, context);
    return stmt;
  }
  visitIfStmt(stmt, context) {
    stmt.condition.visitExpression(this, context);
    this.visitAllStatements(stmt.trueCase, context);
    this.visitAllStatements(stmt.falseCase, context);
    return stmt;
  }
  visitAllStatements(stmts, context) {
    stmts.forEach((stmt) => stmt.visitStatement(this, context));
  }
}
export function leadingComment(text, multiline = false, trailingNewline = true) {
  return new LeadingComment(text, multiline, trailingNewline);
}
export function jsDocComment(tags = []) {
  return new JSDocComment(tags);
}
export function variable(name, type, sourceSpan) {
  return new ReadVarExpr(name, type, sourceSpan);
}
export function importExpr(id, typeParams = null, sourceSpan) {
  return new ExternalExpr(id, null, typeParams, sourceSpan);
}
export function importType(id, typeParams, typeModifiers) {
  return id != null ? expressionType(importExpr(id, typeParams, null), typeModifiers) : null;
}
export function expressionType(expr, typeModifiers, typeParams) {
  return new ExpressionType(expr, typeModifiers, typeParams);
}
export function transplantedType(type, typeModifiers) {
  return new TransplantedType(type, typeModifiers);
}
export function typeofExpr(expr) {
  return new TypeofExpr(expr);
}
export function literalArr(values, type, sourceSpan) {
  return new LiteralArrayExpr(values, type, sourceSpan);
}
export function literalMap(values, type = null) {
  return new LiteralMapExpr(
    values.map((e) => new LiteralMapEntry(e.key, e.value, e.quoted)),
    type,
    null,
  );
}
export function unary(operator, expr, type, sourceSpan) {
  return new UnaryOperatorExpr(operator, expr, type, sourceSpan);
}
export function not(expr, sourceSpan) {
  return new NotExpr(expr, sourceSpan);
}
export function fn(params, body, type, sourceSpan, name) {
  return new FunctionExpr(params, body, type, sourceSpan, name);
}
export function arrowFn(params, body, type, sourceSpan) {
  return new ArrowFunctionExpr(params, body, type, sourceSpan);
}
export function ifStmt(condition, thenClause, elseClause, sourceSpan, leadingComments) {
  return new IfStmt(condition, thenClause, elseClause, sourceSpan, leadingComments);
}
export function taggedTemplate(tag, template, type, sourceSpan) {
  return new TaggedTemplateLiteralExpr(tag, template, type, sourceSpan);
}
export function literal(value, type, sourceSpan) {
  return new LiteralExpr(value, type, sourceSpan);
}
export function localizedString(
  metaBlock,
  messageParts,
  placeholderNames,
  expressions,
  sourceSpan,
) {
  return new LocalizedString(metaBlock, messageParts, placeholderNames, expressions, sourceSpan);
}
export function isNull(exp) {
  return exp instanceof LiteralExpr && exp.value === null;
}
/*
 * Serializes a `Tag` into a string.
 * Returns a string like " @foo {bar} baz" (note the leading whitespace before `@foo`).
 */
function tagToString(tag) {
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
function serializeTags(tags) {
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
//# sourceMappingURL=output_ast.js.map
