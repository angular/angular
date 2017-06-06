import { Console } from 'angular2/src/core/console';
import { RecursiveAstVisitor, BindingPipe } from './expression_parser/ast';
import { Parser } from './expression_parser/parser';
import { CompileDirectiveMetadata, CompilePipeMetadata } from './compile_metadata';
import { HtmlParser } from './html_parser';
import { ParseSourceSpan, ParseError, ParseErrorLevel } from './parse_util';
import { TemplateAst, TemplateAstVisitor } from './template_ast';
import { ElementSchemaRegistry } from 'angular2/src/compiler/schema/element_schema_registry';
/**
 * Provides an array of {@link TemplateAstVisitor}s which will be used to transform
 * parsed templates before compilation is invoked, allowing custom expression syntax
 * and other advanced transformations.
 *
 * This is currently an internal-only feature and not meant for general use.
 */
export declare const TEMPLATE_TRANSFORMS: any;
export declare class TemplateParseError extends ParseError {
    constructor(message: string, span: ParseSourceSpan, level: ParseErrorLevel);
}
export declare class TemplateParseResult {
    templateAst: TemplateAst[];
    errors: ParseError[];
    constructor(templateAst?: TemplateAst[], errors?: ParseError[]);
}
export declare class TemplateParser {
    private _exprParser;
    private _schemaRegistry;
    private _htmlParser;
    private _console;
    transforms: TemplateAstVisitor[];
    constructor(_exprParser: Parser, _schemaRegistry: ElementSchemaRegistry, _htmlParser: HtmlParser, _console: Console, transforms: TemplateAstVisitor[]);
    parse(component: CompileDirectiveMetadata, template: string, directives: CompileDirectiveMetadata[], pipes: CompilePipeMetadata[], templateUrl: string): TemplateAst[];
    tryParse(component: CompileDirectiveMetadata, template: string, directives: CompileDirectiveMetadata[], pipes: CompilePipeMetadata[], templateUrl: string): TemplateParseResult;
}
export declare function splitClasses(classAttrValue: string): string[];
export declare class PipeCollector extends RecursiveAstVisitor {
    pipes: Set<string>;
    visitPipe(ast: BindingPipe, context: any): any;
}
