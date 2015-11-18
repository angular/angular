import { CompileTypeMetadata, CompileTemplateMetadata } from './directive_metadata';
import { Promise } from 'angular2/src/facade/async';
import { XHR } from 'angular2/src/compiler/xhr';
import { UrlResolver } from 'angular2/src/compiler/url_resolver';
import { HtmlParser } from './html_parser';
export declare class TemplateNormalizer {
    private _xhr;
    private _urlResolver;
    private _domParser;
    constructor(_xhr: XHR, _urlResolver: UrlResolver, _domParser: HtmlParser);
    normalizeTemplate(directiveType: CompileTypeMetadata, template: CompileTemplateMetadata): Promise<CompileTemplateMetadata>;
    normalizeLoadedTemplate(directiveType: CompileTypeMetadata, templateMeta: CompileTemplateMetadata, template: string, templateAbsUrl: string): CompileTemplateMetadata;
}
