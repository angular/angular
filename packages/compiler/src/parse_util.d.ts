export declare class ParseLocation {
    file: ParseSourceFile;
    offset: number;
    line: number;
    col: number;
    constructor(file: ParseSourceFile, offset: number, line: number, col: number);
    toString(): string;
    moveBy(delta: number): ParseLocation;
    getContext(maxChars: number, maxLines: number): {
        before: string;
        after: string;
    } | null;
}
export declare class ParseSourceFile {
    content: string;
    url: string;
    constructor(content: string, url: string);
}
export declare class ParseSourceSpan {
    start: ParseLocation;
    end: ParseLocation;
    fullStart: ParseLocation;
    details: string | null;
    /**
     * Create an object that holds information about spans of tokens/nodes captured during
     * lexing/parsing of text.
     *
     * @param start
     * The location of the start of the span (having skipped leading trivia).
     * Skipping leading trivia makes source-spans more "user friendly", since things like HTML
     * elements will appear to begin at the start of the opening tag, rather than at the start of any
     * leading trivia, which could include newlines.
     *
     * @param end
     * The location of the end of the span.
     *
     * @param fullStart
     * The start of the token without skipping the leading trivia.
     * This is used by tooling that splits tokens further, such as extracting Angular interpolations
     * from text tokens. Such tooling creates new source-spans relative to the original token's
     * source-span. If leading trivia characters have been skipped then the new source-spans may be
     * incorrectly offset.
     *
     * @param details
     * Additional information (such as identifier names) that should be associated with the span.
     */
    constructor(start: ParseLocation, end: ParseLocation, fullStart?: ParseLocation, details?: string | null);
    toString(): string;
}
export declare enum ParseErrorLevel {
    WARNING = 0,
    ERROR = 1
}
export declare class ParseError extends Error {
    /** Location of the error. */
    readonly span: ParseSourceSpan;
    /** Error message. */
    readonly msg: string;
    /** Severity level of the error. */
    readonly level: ParseErrorLevel;
    /**
     * Error that caused the error to be surfaced. For example, an error in a sub-expression that
     * couldn't be parsed. Not guaranteed to be defined, but can be used to provide more context.
     */
    readonly relatedError?: unknown | undefined;
    constructor(
    /** Location of the error. */
    span: ParseSourceSpan, 
    /** Error message. */
    msg: string, 
    /** Severity level of the error. */
    level?: ParseErrorLevel, 
    /**
     * Error that caused the error to be surfaced. For example, an error in a sub-expression that
     * couldn't be parsed. Not guaranteed to be defined, but can be used to provide more context.
     */
    relatedError?: unknown | undefined);
    contextualMessage(): string;
    toString(): string;
}
/**
 * Generates Source Span object for a given R3 Type for JIT mode.
 *
 * @param kind Component or Directive.
 * @param typeName name of the Component or Directive.
 * @param sourceUrl reference to Component or Directive source.
 * @returns instance of ParseSourceSpan that represent a given Component or Directive.
 */
export declare function r3JitTypeSourceSpan(kind: string, typeName: string, sourceUrl: string): ParseSourceSpan;
export declare function identifierName(compileIdentifier: CompileIdentifierMetadata | null | undefined): string | null;
export interface CompileIdentifierMetadata {
    reference: any;
}
export declare function sanitizeIdentifier(name: string): string;
