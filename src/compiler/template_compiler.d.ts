import { Type } from 'angular2/src/facade/lang';
import { Promise } from 'angular2/src/facade/async';
import { CompileDirectiveMetadata, CompilePipeMetadata } from './directive_metadata';
import { SourceModule } from './source_module';
import { ChangeDetectionCompiler } from './change_detector_compiler';
import { StyleCompiler } from './style_compiler';
import { ViewCompiler } from './view_compiler';
import { ProtoViewCompiler } from './proto_view_compiler';
import { TemplateParser } from './template_parser';
import { TemplateNormalizer } from './template_normalizer';
import { RuntimeMetadataResolver } from './runtime_metadata';
import { HostViewFactory } from 'angular2/src/core/linker/view';
import { ChangeDetectorGenConfig } from 'angular2/src/core/change_detection/change_detection';
import { ResolvedMetadataCache } from 'angular2/src/core/linker/resolved_metadata_cache';
export declare var METADATA_CACHE_MODULE_REF: string;
/**
 * An internal module of the Angular compiler that begins with component types,
 * extracts templates, and eventually produces a compiled version of the component
 * ready for linking into an application.
 */
export declare class TemplateCompiler {
    private _runtimeMetadataResolver;
    private _templateNormalizer;
    private _templateParser;
    private _styleCompiler;
    private _cdCompiler;
    private _protoViewCompiler;
    private _viewCompiler;
    private _resolvedMetadataCache;
    private _genConfig;
    private _hostCacheKeys;
    private _compiledTemplateCache;
    private _compiledTemplateDone;
    constructor(_runtimeMetadataResolver: RuntimeMetadataResolver, _templateNormalizer: TemplateNormalizer, _templateParser: TemplateParser, _styleCompiler: StyleCompiler, _cdCompiler: ChangeDetectionCompiler, _protoViewCompiler: ProtoViewCompiler, _viewCompiler: ViewCompiler, _resolvedMetadataCache: ResolvedMetadataCache, _genConfig: ChangeDetectorGenConfig);
    normalizeDirectiveMetadata(directive: CompileDirectiveMetadata): Promise<CompileDirectiveMetadata>;
    compileHostComponentRuntime(type: Type): Promise<HostViewFactory>;
    clearCache(): void;
    compileTemplatesCodeGen(components: NormalizedComponentWithViewDirectives[]): SourceModule;
    compileStylesheetCodeGen(stylesheetUrl: string, cssText: string): SourceModule[];
    private _compileComponentRuntime(cacheKey, compMeta, viewDirectives, pipes, compilingComponentsPath);
    private _compileNestedComponentRuntime(childComponentDir, parentCompilingComponentsPath, childPromises);
    private _createViewFactoryRuntime(compMeta, parsedTemplate, directives, styles, pipes);
    private _getNestedComponentViewFactory(compMeta);
    private _compileComponentCodeGen(compMeta, directives, pipes, targetDeclarations);
    private _createViewFactoryCodeGen(resolvedMetadataCacheExpr, compMeta, styleExpr, parsedTemplate, pipes, targetDeclarations);
}
export declare class NormalizedComponentWithViewDirectives {
    component: CompileDirectiveMetadata;
    directives: CompileDirectiveMetadata[];
    pipes: CompilePipeMetadata[];
    constructor(component: CompileDirectiveMetadata, directives: CompileDirectiveMetadata[], pipes: CompilePipeMetadata[]);
}
