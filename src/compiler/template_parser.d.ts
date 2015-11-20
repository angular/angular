import { Parser } from 'angular2/src/core/change_detection/change_detection';
import { CompileDirectiveMetadata } from './directive_metadata';
import { HtmlParser } from './html_parser';
import { ParseError, ParseLocation } from './parse_util';
import { TemplateAst } from './template_ast';
import { ElementSchemaRegistry } from 'angular2/src/compiler/schema/element_schema_registry';
export declare class TemplateParseError extends ParseError {
    constructor(message: string, location: ParseLocation);
}
export declare class TemplateParser {
    private _exprParser;
    private _schemaRegistry;
    private _htmlParser;
    constructor(_exprParser: Parser, _schemaRegistry: ElementSchemaRegistry, _htmlParser: HtmlParser);
    parse(template: string, directives: CompileDirectiveMetadata[], templateUrl: string): TemplateAst[];
}
export declare function splitClasses(classAttrValue: string): string[];
