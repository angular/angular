import { Lexer, Token } from './lexer';
import { Reflector } from 'angular2/src/core/reflection/reflection';
import { AST, BindingPipe, LiteralMap, TemplateBinding, ASTWithSource } from './ast';
export declare class Parser {
    /** @internal */ _lexer: Lexer;
    constructor(/** @internal */ _lexer: Lexer, providedReflector?: Reflector);
    parseAction(input: string, location: any): ASTWithSource;
    parseBinding(input: string, location: any): ASTWithSource;
    parseSimpleBinding(input: string, location: string): ASTWithSource;
    parseTemplateBindings(input: string, location: any): TemplateBinding[];
    parseInterpolation(input: string, location: any): ASTWithSource;
    wrapLiteralPrimitive(input: string, location: any): ASTWithSource;
    private _checkNoInterpolation(input, location);
    private _findInterpolationErrorColumn(parts, partInErrIdx);
}
export declare class _ParseAST {
    input: string;
    location: any;
    tokens: any[];
    reflector: Reflector;
    parseAction: boolean;
    index: number;
    constructor(input: string, location: any, tokens: any[], reflector: Reflector, parseAction: boolean);
    peek(offset: number): Token;
    next: Token;
    inputIndex: number;
    advance(): void;
    optionalCharacter(code: number): boolean;
    optionalKeywordVar(): boolean;
    peekKeywordVar(): boolean;
    expectCharacter(code: number): void;
    optionalOperator(op: string): boolean;
    expectOperator(operator: string): void;
    expectIdentifierOrKeyword(): string;
    expectIdentifierOrKeywordOrString(): string;
    parseSimpleBinding(): AST;
    parseChain(): AST;
    parsePipe(): AST;
    parseExpression(): AST;
    parseConditional(): AST;
    parseLogicalOr(): AST;
    parseLogicalAnd(): AST;
    parseEquality(): AST;
    parseRelational(): AST;
    parseAdditive(): AST;
    parseMultiplicative(): AST;
    parsePrefix(): AST;
    parseCallChain(): AST;
    parsePrimary(): AST;
    parseExpressionList(terminator: number): any[];
    parseLiteralMap(): LiteralMap;
    parseAccessMemberOrMethodCall(receiver: AST, isSafe?: boolean): AST;
    parseCallArguments(): BindingPipe[];
    parseBlockContent(): AST;
    /**
     * An identifier, a keyword, a string with an optional `-` inbetween.
     */
    expectTemplateBindingKey(): string;
    parseTemplateBindings(): any[];
    error(message: string, index?: number): void;
}
