export declare class AST {
    visit(visitor: AstVisitor): any;
    toString(): string;
}
export declare class EmptyExpr extends AST {
    visit(visitor: AstVisitor): void;
}
export declare class ImplicitReceiver extends AST {
    visit(visitor: AstVisitor): any;
}
/**
 * Multiple expressions separated by a semicolon.
 */
export declare class Chain extends AST {
    expressions: any[];
    constructor(expressions: any[]);
    visit(visitor: AstVisitor): any;
}
export declare class Conditional extends AST {
    condition: AST;
    trueExp: AST;
    falseExp: AST;
    constructor(condition: AST, trueExp: AST, falseExp: AST);
    visit(visitor: AstVisitor): any;
}
export declare class PropertyRead extends AST {
    receiver: AST;
    name: string;
    getter: Function;
    constructor(receiver: AST, name: string, getter: Function);
    visit(visitor: AstVisitor): any;
}
export declare class PropertyWrite extends AST {
    receiver: AST;
    name: string;
    setter: Function;
    value: AST;
    constructor(receiver: AST, name: string, setter: Function, value: AST);
    visit(visitor: AstVisitor): any;
}
export declare class SafePropertyRead extends AST {
    receiver: AST;
    name: string;
    getter: Function;
    constructor(receiver: AST, name: string, getter: Function);
    visit(visitor: AstVisitor): any;
}
export declare class KeyedRead extends AST {
    obj: AST;
    key: AST;
    constructor(obj: AST, key: AST);
    visit(visitor: AstVisitor): any;
}
export declare class KeyedWrite extends AST {
    obj: AST;
    key: AST;
    value: AST;
    constructor(obj: AST, key: AST, value: AST);
    visit(visitor: AstVisitor): any;
}
export declare class BindingPipe extends AST {
    exp: AST;
    name: string;
    args: any[];
    constructor(exp: AST, name: string, args: any[]);
    visit(visitor: AstVisitor): any;
}
export declare class LiteralPrimitive extends AST {
    value: any;
    constructor(value: any);
    visit(visitor: AstVisitor): any;
}
export declare class LiteralArray extends AST {
    expressions: any[];
    constructor(expressions: any[]);
    visit(visitor: AstVisitor): any;
}
export declare class LiteralMap extends AST {
    keys: any[];
    values: any[];
    constructor(keys: any[], values: any[]);
    visit(visitor: AstVisitor): any;
}
export declare class Interpolation extends AST {
    strings: any[];
    expressions: any[];
    constructor(strings: any[], expressions: any[]);
    visit(visitor: AstVisitor): void;
}
export declare class Binary extends AST {
    operation: string;
    left: AST;
    right: AST;
    constructor(operation: string, left: AST, right: AST);
    visit(visitor: AstVisitor): any;
}
export declare class PrefixNot extends AST {
    expression: AST;
    constructor(expression: AST);
    visit(visitor: AstVisitor): any;
}
export declare class MethodCall extends AST {
    receiver: AST;
    name: string;
    fn: Function;
    args: any[];
    constructor(receiver: AST, name: string, fn: Function, args: any[]);
    visit(visitor: AstVisitor): any;
}
export declare class SafeMethodCall extends AST {
    receiver: AST;
    name: string;
    fn: Function;
    args: any[];
    constructor(receiver: AST, name: string, fn: Function, args: any[]);
    visit(visitor: AstVisitor): any;
}
export declare class FunctionCall extends AST {
    target: AST;
    args: any[];
    constructor(target: AST, args: any[]);
    visit(visitor: AstVisitor): any;
}
export declare class ASTWithSource extends AST {
    ast: AST;
    source: string;
    location: string;
    constructor(ast: AST, source: string, location: string);
    visit(visitor: AstVisitor): any;
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
    visitBinary(ast: Binary): any;
    visitChain(ast: Chain): any;
    visitConditional(ast: Conditional): any;
    visitFunctionCall(ast: FunctionCall): any;
    visitImplicitReceiver(ast: ImplicitReceiver): any;
    visitInterpolation(ast: Interpolation): any;
    visitKeyedRead(ast: KeyedRead): any;
    visitKeyedWrite(ast: KeyedWrite): any;
    visitLiteralArray(ast: LiteralArray): any;
    visitLiteralMap(ast: LiteralMap): any;
    visitLiteralPrimitive(ast: LiteralPrimitive): any;
    visitMethodCall(ast: MethodCall): any;
    visitPipe(ast: BindingPipe): any;
    visitPrefixNot(ast: PrefixNot): any;
    visitPropertyRead(ast: PropertyRead): any;
    visitPropertyWrite(ast: PropertyWrite): any;
    visitSafeMethodCall(ast: SafeMethodCall): any;
    visitSafePropertyRead(ast: SafePropertyRead): any;
}
export declare class RecursiveAstVisitor implements AstVisitor {
    visitBinary(ast: Binary): any;
    visitChain(ast: Chain): any;
    visitConditional(ast: Conditional): any;
    visitPipe(ast: BindingPipe): any;
    visitFunctionCall(ast: FunctionCall): any;
    visitImplicitReceiver(ast: ImplicitReceiver): any;
    visitInterpolation(ast: Interpolation): any;
    visitKeyedRead(ast: KeyedRead): any;
    visitKeyedWrite(ast: KeyedWrite): any;
    visitLiteralArray(ast: LiteralArray): any;
    visitLiteralMap(ast: LiteralMap): any;
    visitLiteralPrimitive(ast: LiteralPrimitive): any;
    visitMethodCall(ast: MethodCall): any;
    visitPrefixNot(ast: PrefixNot): any;
    visitPropertyRead(ast: PropertyRead): any;
    visitPropertyWrite(ast: PropertyWrite): any;
    visitSafePropertyRead(ast: SafePropertyRead): any;
    visitSafeMethodCall(ast: SafeMethodCall): any;
    visitAll(asts: AST[]): any;
}
export declare class AstTransformer implements AstVisitor {
    visitImplicitReceiver(ast: ImplicitReceiver): ImplicitReceiver;
    visitInterpolation(ast: Interpolation): Interpolation;
    visitLiteralPrimitive(ast: LiteralPrimitive): LiteralPrimitive;
    visitPropertyRead(ast: PropertyRead): PropertyRead;
    visitPropertyWrite(ast: PropertyWrite): PropertyWrite;
    visitSafePropertyRead(ast: SafePropertyRead): SafePropertyRead;
    visitMethodCall(ast: MethodCall): MethodCall;
    visitSafeMethodCall(ast: SafeMethodCall): SafeMethodCall;
    visitFunctionCall(ast: FunctionCall): FunctionCall;
    visitLiteralArray(ast: LiteralArray): LiteralArray;
    visitLiteralMap(ast: LiteralMap): LiteralMap;
    visitBinary(ast: Binary): Binary;
    visitPrefixNot(ast: PrefixNot): PrefixNot;
    visitConditional(ast: Conditional): Conditional;
    visitPipe(ast: BindingPipe): BindingPipe;
    visitKeyedRead(ast: KeyedRead): KeyedRead;
    visitKeyedWrite(ast: KeyedWrite): KeyedWrite;
    visitAll(asts: any[]): any[];
    visitChain(ast: Chain): Chain;
}
