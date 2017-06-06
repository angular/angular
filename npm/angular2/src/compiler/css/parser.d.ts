import { ParseSourceSpan, ParseSourceFile, ParseError } from "angular2/src/compiler/parse_util";
import { CssToken, CssScanner } from "angular2/src/compiler/css/lexer";
export { CssToken } from "angular2/src/compiler/css/lexer";
export declare enum BlockType {
    Import = 0,
    Charset = 1,
    Namespace = 2,
    Supports = 3,
    Keyframes = 4,
    MediaQuery = 5,
    Selector = 6,
    FontFace = 7,
    Page = 8,
    Document = 9,
    Viewport = 10,
    Unsupported = 11,
}
export declare class CssAST {
    visit(visitor: CssASTVisitor, context?: any): void;
}
export interface CssASTVisitor {
    visitCssValue(ast: CssStyleValueAST, context?: any): void;
    visitInlineCssRule(ast: CssInlineRuleAST, context?: any): void;
    visitCssKeyframeRule(ast: CssKeyframeRuleAST, context?: any): void;
    visitCssKeyframeDefinition(ast: CssKeyframeDefinitionAST, context?: any): void;
    visitCssMediaQueryRule(ast: CssMediaQueryRuleAST, context?: any): void;
    visitCssSelectorRule(ast: CssSelectorRuleAST, context?: any): void;
    visitCssSelector(ast: CssSelectorAST, context?: any): void;
    visitCssDefinition(ast: CssDefinitionAST, context?: any): void;
    visitCssBlock(ast: CssBlockAST, context?: any): void;
    visitCssStyleSheet(ast: CssStyleSheetAST, context?: any): void;
    visitUnkownRule(ast: CssUnknownTokenListAST, context?: any): void;
}
export declare class ParsedCssResult {
    errors: CssParseError[];
    ast: CssStyleSheetAST;
    constructor(errors: CssParseError[], ast: CssStyleSheetAST);
}
export declare class CssParser {
    private _scanner;
    private _fileName;
    private _errors;
    private _file;
    constructor(_scanner: CssScanner, _fileName: string);
    parse(): ParsedCssResult;
}
export declare class CssStyleValueAST extends CssAST {
    tokens: CssToken[];
    strValue: string;
    constructor(tokens: CssToken[], strValue: string);
    visit(visitor: CssASTVisitor, context?: any): void;
}
export declare class CssRuleAST extends CssAST {
}
export declare class CssBlockRuleAST extends CssRuleAST {
    type: BlockType;
    block: CssBlockAST;
    name: CssToken;
    constructor(type: BlockType, block: CssBlockAST, name?: CssToken);
    visit(visitor: CssASTVisitor, context?: any): void;
}
export declare class CssKeyframeRuleAST extends CssBlockRuleAST {
    constructor(name: CssToken, block: CssBlockAST);
    visit(visitor: CssASTVisitor, context?: any): void;
}
export declare class CssKeyframeDefinitionAST extends CssBlockRuleAST {
    steps: any;
    constructor(_steps: CssToken[], block: CssBlockAST);
    visit(visitor: CssASTVisitor, context?: any): void;
}
export declare class CssBlockDefinitionRuleAST extends CssBlockRuleAST {
    query: CssToken[];
    strValue: string;
    constructor(type: BlockType, query: CssToken[], block: CssBlockAST);
    visit(visitor: CssASTVisitor, context?: any): void;
}
export declare class CssMediaQueryRuleAST extends CssBlockDefinitionRuleAST {
    constructor(query: CssToken[], block: CssBlockAST);
    visit(visitor: CssASTVisitor, context?: any): void;
}
export declare class CssInlineRuleAST extends CssRuleAST {
    type: BlockType;
    value: CssStyleValueAST;
    constructor(type: BlockType, value: CssStyleValueAST);
    visit(visitor: CssASTVisitor, context?: any): void;
}
export declare class CssSelectorRuleAST extends CssBlockRuleAST {
    selectors: CssSelectorAST[];
    strValue: string;
    constructor(selectors: CssSelectorAST[], block: CssBlockAST);
    visit(visitor: CssASTVisitor, context?: any): void;
}
export declare class CssDefinitionAST extends CssAST {
    property: CssToken;
    value: CssStyleValueAST;
    constructor(property: CssToken, value: CssStyleValueAST);
    visit(visitor: CssASTVisitor, context?: any): void;
}
export declare class CssSelectorAST extends CssAST {
    tokens: CssToken[];
    isComplex: boolean;
    strValue: any;
    constructor(tokens: CssToken[], isComplex?: boolean);
    visit(visitor: CssASTVisitor, context?: any): void;
}
export declare class CssBlockAST extends CssAST {
    entries: CssAST[];
    constructor(entries: CssAST[]);
    visit(visitor: CssASTVisitor, context?: any): void;
}
export declare class CssStyleSheetAST extends CssAST {
    rules: CssAST[];
    constructor(rules: CssAST[]);
    visit(visitor: CssASTVisitor, context?: any): void;
}
export declare class CssParseError extends ParseError {
    static create(file: ParseSourceFile, offset: number, line: number, col: number, length: number, errMsg: string): CssParseError;
    constructor(span: ParseSourceSpan, message: string);
}
export declare class CssUnknownTokenListAST extends CssRuleAST {
    name: any;
    tokens: CssToken[];
    constructor(name: any, tokens: CssToken[]);
    visit(visitor: CssASTVisitor, context?: any): void;
}
