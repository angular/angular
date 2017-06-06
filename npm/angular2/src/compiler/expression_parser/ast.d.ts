export declare class AST {
    visit(visitor: AstVisitor, context?: any): any;
    toString(): string;
}
/**
 * Represents a quoted expression of the form:
 *
 * quote = prefix `:` uninterpretedExpression
 * prefix = identifier
 * uninterpretedExpression = arbitrary string
 *
 * A quoted expression is meant to be pre-processed by an AST transformer that
 * converts it into another AST that no longer contains quoted expressions.
 * It is meant to allow third-party developers to extend Angular template
 * expression language. The `uninterpretedExpression` part of the quote is
 * therefore not interpreted by the Angular's own expression parser.
 */
export declare class Quote extends AST {
    prefix: string;
    uninterpretedExpression: string;
    location: any;
    constructor(prefix: string, uninterpretedExpression: string, location: any);
    visit(visitor: AstVisitor, context?: any): any;
    toString(): string;
}
export declare class EmptyExpr extends AST {
    visit(visitor: AstVisitor, context?: any): void;
}
export declare class ImplicitReceiver extends AST {
    visit(visitor: AstVisitor, context?: any): any;
}
/**
 * Multiple expressions separated by a semicolon.
 */
export declare class Chain extends AST {
    expressions: any[];
    constructor(expressions: any[]);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class Conditional extends AST {
    condition: AST;
    trueExp: AST;
    falseExp: AST;
    constructor(condition: AST, trueExp: AST, falseExp: AST);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class PropertyRead extends AST {
    receiver: AST;
    name: string;
    constructor(receiver: AST, name: string);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class PropertyWrite extends AST {
    receiver: AST;
    name: string;
    value: AST;
    constructor(receiver: AST, name: string, value: AST);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class SafePropertyRead extends AST {
    receiver: AST;
    name: string;
    constructor(receiver: AST, name: string);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class KeyedRead extends AST {
    obj: AST;
    key: AST;
    constructor(obj: AST, key: AST);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class KeyedWrite extends AST {
    obj: AST;
    key: AST;
    value: AST;
    constructor(obj: AST, key: AST, value: AST);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class BindingPipe extends AST {
    exp: AST;
    name: string;
    args: any[];
    constructor(exp: AST, name: string, args: any[]);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class LiteralPrimitive extends AST {
    value: any;
    constructor(value: any);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class LiteralArray extends AST {
    expressions: any[];
    constructor(expressions: any[]);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class LiteralMap extends AST {
    keys: any[];
    values: any[];
    constructor(keys: any[], values: any[]);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class Interpolation extends AST {
    strings: any[];
    expressions: any[];
    constructor(strings: any[], expressions: any[]);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class Binary extends AST {
    operation: string;
    left: AST;
    right: AST;
    constructor(operation: string, left: AST, right: AST);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class PrefixNot extends AST {
    expression: AST;
    constructor(expression: AST);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class MethodCall extends AST {
    receiver: AST;
    name: string;
    args: any[];
    constructor(receiver: AST, name: string, args: any[]);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class SafeMethodCall extends AST {
    receiver: AST;
    name: string;
    args: any[];
    constructor(receiver: AST, name: string, args: any[]);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class FunctionCall extends AST {
    target: AST;
    args: any[];
    constructor(target: AST, args: any[]);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class ASTWithSource extends AST {
    ast: AST;
    source: string;
    location: string;
    constructor(ast: AST, source: string, location: string);
    visit(visitor: AstVisitor, context?: any): any;
    toString(): string;
}
export declare class TemplateBinding {
    key: string;
    keyIsVar: boolean;
    name: string;
    expression: ASTWithSource;
    constructor(key: string, keyIsVar: boolean, name: string, expression: ASTWithSource);
}
export interface AstVisitor {
    visitBinary(ast: Binary, context: any): any;
    visitChain(ast: Chain, context: any): any;
    visitConditional(ast: Conditional, context: any): any;
    visitFunctionCall(ast: FunctionCall, context: any): any;
    visitImplicitReceiver(ast: ImplicitReceiver, context: any): any;
    visitInterpolation(ast: Interpolation, context: any): any;
    visitKeyedRead(ast: KeyedRead, context: any): any;
    visitKeyedWrite(ast: KeyedWrite, context: any): any;
    visitLiteralArray(ast: LiteralArray, context: any): any;
    visitLiteralMap(ast: LiteralMap, context: any): any;
    visitLiteralPrimitive(ast: LiteralPrimitive, context: any): any;
    visitMethodCall(ast: MethodCall, context: any): any;
    visitPipe(ast: BindingPipe, context: any): any;
    visitPrefixNot(ast: PrefixNot, context: any): any;
    visitPropertyRead(ast: PropertyRead, context: any): any;
    visitPropertyWrite(ast: PropertyWrite, context: any): any;
    visitQuote(ast: Quote, context: any): any;
    visitSafeMethodCall(ast: SafeMethodCall, context: any): any;
    visitSafePropertyRead(ast: SafePropertyRead, context: any): any;
}
export declare class RecursiveAstVisitor implements AstVisitor {
    visitBinary(ast: Binary, context: any): any;
    visitChain(ast: Chain, context: any): any;
    visitConditional(ast: Conditional, context: any): any;
    visitPipe(ast: BindingPipe, context: any): any;
    visitFunctionCall(ast: FunctionCall, context: any): any;
    visitImplicitReceiver(ast: ImplicitReceiver, context: any): any;
    visitInterpolation(ast: Interpolation, context: any): any;
    visitKeyedRead(ast: KeyedRead, context: any): any;
    visitKeyedWrite(ast: KeyedWrite, context: any): any;
    visitLiteralArray(ast: LiteralArray, context: any): any;
    visitLiteralMap(ast: LiteralMap, context: any): any;
    visitLiteralPrimitive(ast: LiteralPrimitive, context: any): any;
    visitMethodCall(ast: MethodCall, context: any): any;
    visitPrefixNot(ast: PrefixNot, context: any): any;
    visitPropertyRead(ast: PropertyRead, context: any): any;
    visitPropertyWrite(ast: PropertyWrite, context: any): any;
    visitSafePropertyRead(ast: SafePropertyRead, context: any): any;
    visitSafeMethodCall(ast: SafeMethodCall, context: any): any;
    visitAll(asts: AST[], context: any): any;
    visitQuote(ast: Quote, context: any): any;
}
export declare class AstTransformer implements AstVisitor {
    visitImplicitReceiver(ast: ImplicitReceiver, context: any): AST;
    visitInterpolation(ast: Interpolation, context: any): AST;
    visitLiteralPrimitive(ast: LiteralPrimitive, context: any): AST;
    visitPropertyRead(ast: PropertyRead, context: any): AST;
    visitPropertyWrite(ast: PropertyWrite, context: any): AST;
    visitSafePropertyRead(ast: SafePropertyRead, context: any): AST;
    visitMethodCall(ast: MethodCall, context: any): AST;
    visitSafeMethodCall(ast: SafeMethodCall, context: any): AST;
    visitFunctionCall(ast: FunctionCall, context: any): AST;
    visitLiteralArray(ast: LiteralArray, context: any): AST;
    visitLiteralMap(ast: LiteralMap, context: any): AST;
    visitBinary(ast: Binary, context: any): AST;
    visitPrefixNot(ast: PrefixNot, context: any): AST;
    visitConditional(ast: Conditional, context: any): AST;
    visitPipe(ast: BindingPipe, context: any): AST;
    visitKeyedRead(ast: KeyedRead, context: any): AST;
    visitKeyedWrite(ast: KeyedWrite, context: any): AST;
    visitAll(asts: any[]): any[];
    visitChain(ast: Chain, context: any): AST;
    visitQuote(ast: Quote, context: any): AST;
}
