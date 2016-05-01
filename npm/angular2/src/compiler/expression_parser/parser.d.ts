import { Lexer, Token } from './lexer';
import { AST, BindingPipe, LiteralMap, TemplateBinding, ASTWithSource } from './ast';
export declare class SplitInterpolation {
    strings: string[];
    expressions: string[];
    constructor(strings: string[], expressions: string[]);
}
export declare class TemplateBindingParseResult {
    templateBindings: TemplateBinding[];
    warnings: string[];
    constructor(templateBindings: TemplateBinding[], warnings: string[]);
}
export declare class Parser {
    /** @internal */ _lexer: Lexer;
    constructor(/** @internal */ _lexer: Lexer);
    parseAction(input: string, location: any): ASTWithSource;
    parseBinding(input: string, location: any): ASTWithSource;
    parseSimpleBinding(input: string, location: string): ASTWithSource;
    private _parseBindingAst(input, location);
    private _parseQuote(input, location);
    parseTemplateBindings(input: string, location: any): TemplateBindingParseResult;
    parseInterpolation(input: string, location: any): ASTWithSource;
    splitInterpolation(input: string, location: string): SplitInterpolation;
    wrapLiteralPrimitive(input: string, location: any): ASTWithSource;
    private _stripComments(input);
    private _commentStart(input);
    private _checkNoInterpolation(input, location);
    private _findInterpolationErrorColumn(parts, partInErrIdx);
}
export declare class _ParseAST {
    input: string;
    location: any;
    tokens: any[];
    parseAction: boolean;
    index: number;
    constructor(input: string, location: any, tokens: any[], parseAction: boolean);
    peek(offset: number): Token;
    next: Token;
    inputIndex: number;
    advance(): void;
    optionalCharacter(code: number): boolean;
    peekKeywordLet(): boolean;
    peekDeprecatedKeywordVar(): boolean;
    peekDeprecatedOperatorHash(): boolean;
    expectCharacter(code: number): void;
    optionalOperator(op: string): boolean;
    expectOperator(operator: string): void;
    expectIdentifierOrKeyword(): string;
    expectIdentifierOrKeywordOrString(): string;
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
    parseTemplateBindings(): TemplateBindingParseResult;
    error(message: string, index?: number): void;
}
