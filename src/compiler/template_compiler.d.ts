import { Type } from 'angular2/src/facade/lang';
import { Promise } from 'angular2/src/facade/async';
import { CompiledHostTemplate } from 'angular2/src/core/linker/template_commands';
import { CompileDirectiveMetadata } from './directive_metadata';
import { SourceModule } from './source_module';
import { ChangeDetectionCompiler } from './change_detector_compiler';
import { StyleCompiler } from './style_compiler';
import { CommandCompiler } from './command_compiler';
import { TemplateParser } from './template_parser';
import { TemplateNormalizer } from './template_normalizer';
import { RuntimeMetadataResolver } from './runtime_metadata';
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
    private _commandCompiler;
    private _cdCompiler;
    private _hostCacheKeys;
    private _compiledTemplateCache;
    private _compiledTemplateDone;
    private _nextTemplateId;
    constructor(_runtimeMetadataResolver: RuntimeMetadataResolver, _templateNormalizer: TemplateNormalizer, _templateParser: TemplateParser, _styleCompiler: StyleCompiler, _commandCompiler: CommandCompiler, _cdCompiler: ChangeDetectionCompiler);
    normalizeDirectiveMetadata(directive: CompileDirectiveMetadata): Promise<CompileDirectiveMetadata>;
    compileHostComponentRuntime(type: Type): Promise<CompiledHostTemplate>;
    clearCache(): void;
    private _compileComponentRuntime(cacheKey, compMeta, viewDirectives, compilingComponentCacheKeys);
    private _compileCommandsRuntime(compMeta, parsedTemplate, changeDetectorFactories, compilingComponentCacheKeys, childPromises);
    compileTemplatesCodeGen(components: NormalizedComponentWithViewDirectives[]): SourceModule;
    compileStylesheetCodeGen(stylesheetUrl: string, cssText: string): SourceModule[];
    private _processTemplateCodeGen(compMeta, directives, targetDeclarations, targetTemplateArguments);
}
export declare class NormalizedComponentWithViewDirectives {
    component: CompileDirectiveMetadata;
    directives: CompileDirectiveMetadata[];
    constructor(component: CompileDirectiveMetadata, directives: CompileDirectiveMetadata[]);
}
