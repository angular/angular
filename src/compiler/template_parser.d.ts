import { OpaqueToken } from 'angular2/core';
import { Parser } from 'angular2/src/core/change_detection/change_detection';
import { CompileDirectiveMetadata, CompilePipeMetadata } from './directive_metadata';
import { HtmlParser } from './html_parser';
import { ParseError, ParseLocation } from './parse_util';
import { RecursiveAstVisitor, BindingPipe } from 'angular2/src/core/change_detection/parser/ast';
import { TemplateAst, TemplateAstVisitor } from './template_ast';
import { ElementSchemaRegistry } from 'angular2/src/compiler/schema/element_schema_registry';
/**
 * Provides an array of {@link TemplateAstVisitor}s which will be used to transform
 * parsed templates before compilation is invoked, allowing custom expression syntax
 * and other advanced transformations.
 *
 * This is currently an internal-only feature and not meant for general use.
 */
export declare const TEMPLATE_TRANSFORMS: OpaqueToken;
export declare class TemplateParseError extends ParseError {
    constructor(message: string, location: ParseLocation);
}
export declare class TemplateParser {
    private _exprParser;
    private _schemaRegistry;
    private _htmlParser;
    transforms: TemplateAstVisitor[];
    constructor(_exprParser: Parser, _schemaRegistry: ElementSchemaRegistry, _htmlParser: HtmlParser, transforms: TemplateAstVisitor[]);
    parse(template: string, directives: CompileDirectiveMetadata[], pipes: CompilePipeMetadata[], templateUrl: string): TemplateAst[];
}
export declare function splitClasses(classAttrValue: string): string[];
export declare class PipeCollector extends RecursiveAstVisitor {
    pipes: Set<string>;
    visitPipe(ast: BindingPipe): any;
}
