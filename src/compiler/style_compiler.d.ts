import { CompileTemplateMetadata } from './directive_metadata';
import { SourceModule, SourceExpression } from './source_module';
import { XHR } from 'angular2/src/compiler/xhr';
import { Promise } from 'angular2/src/facade/async';
import { UrlResolver } from 'angular2/src/compiler/url_resolver';
export declare class StyleCompiler {
    private _xhr;
    private _urlResolver;
    private _styleCache;
    private _shadowCss;
    constructor(_xhr: XHR, _urlResolver: UrlResolver);
    compileComponentRuntime(template: CompileTemplateMetadata): Promise<Array<string | any[]>>;
    compileComponentCodeGen(template: CompileTemplateMetadata): SourceExpression;
    compileStylesheetCodeGen(stylesheetUrl: string, cssText: string): SourceModule[];
    clearCache(): void;
    private _loadStyles(plainStyles, absUrls, encapsulate);
    private _styleCodeGen(plainStyles, absUrls, shim);
    private _styleModule(stylesheetUrl, shim, expression);
    private _shimIfNeeded(style, shim);
    private _createModuleUrl(stylesheetUrl, shim);
}
