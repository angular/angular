import { CompileIdentifierMetadata, CompileDirectiveMetadata } from './compile_metadata';
import * as o from './output/output_ast';
import { UrlResolver } from 'angular2/src/compiler/url_resolver';
export declare class StylesCompileDependency {
    sourceUrl: string;
    isShimmed: boolean;
    valuePlaceholder: CompileIdentifierMetadata;
    constructor(sourceUrl: string, isShimmed: boolean, valuePlaceholder: CompileIdentifierMetadata);
}
export declare class StylesCompileResult {
    statements: o.Statement[];
    stylesVar: string;
    dependencies: StylesCompileDependency[];
    constructor(statements: o.Statement[], stylesVar: string, dependencies: StylesCompileDependency[]);
}
export declare class StyleCompiler {
    private _urlResolver;
    private _shadowCss;
    constructor(_urlResolver: UrlResolver);
    compileComponent(comp: CompileDirectiveMetadata): StylesCompileResult;
    compileStylesheet(stylesheetUrl: string, cssText: string, isShimmed: boolean): StylesCompileResult;
    private _compileStyles(stylesVar, plainStyles, absUrls, shim);
    private _shimIfNeeded(style, shim);
}
