import { CompileTypeMetadata } from './directive_metadata';
import { SourceExpressions } from './source_module';
import { ChangeDetectorGenConfig, ChangeDetectionStrategy } from 'angular2/src/core/change_detection/change_detection';
import { TemplateAst } from './template_ast';
export declare class ChangeDetectionCompiler {
    private _genConfig;
    constructor(_genConfig: ChangeDetectorGenConfig);
    compileComponentRuntime(componentType: CompileTypeMetadata, strategy: ChangeDetectionStrategy, parsedTemplate: TemplateAst[]): Function[];
    private _createChangeDetectorFactory(definition);
    compileComponentCodeGen(componentType: CompileTypeMetadata, strategy: ChangeDetectionStrategy, parsedTemplate: TemplateAst[]): SourceExpressions;
}
