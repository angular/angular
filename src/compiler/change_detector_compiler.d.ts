import { CompileTypeMetadata } from './directive_metadata';
import { SourceExpressions } from './source_module';
import { AbstractChangeDetector } from 'angular2/src/core/change_detection/abstract_change_detector';
import { ChangeDetectionUtil } from 'angular2/src/core/change_detection/change_detection_util';
import { ChangeDetectorState } from 'angular2/src/core/change_detection/constants';
import { ChangeDetectorGenConfig, ChangeDetectionStrategy } from 'angular2/src/core/change_detection/change_detection';
import { TemplateAst } from './template_ast';
export declare const CHANGE_DETECTION_JIT_IMPORTS: {
    'AbstractChangeDetector': typeof AbstractChangeDetector;
    'ChangeDetectionUtil': typeof ChangeDetectionUtil;
    'ChangeDetectorState': typeof ChangeDetectorState;
};
export declare class ChangeDetectionCompiler {
    private _genConfig;
    constructor(_genConfig: ChangeDetectorGenConfig);
    compileComponentRuntime(componentType: CompileTypeMetadata, strategy: ChangeDetectionStrategy, parsedTemplate: TemplateAst[]): Function[];
    private _createChangeDetectorFactory(definition);
    compileComponentCodeGen(componentType: CompileTypeMetadata, strategy: ChangeDetectionStrategy, parsedTemplate: TemplateAst[]): SourceExpressions;
}
