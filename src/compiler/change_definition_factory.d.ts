import { ChangeDetectionStrategy, ChangeDetectorDefinition, ChangeDetectorGenConfig } from 'angular2/src/core/change_detection/change_detection';
import { CompileTypeMetadata } from './directive_metadata';
import { TemplateAst } from './template_ast';
export declare function createChangeDetectorDefinitions(componentType: CompileTypeMetadata, componentStrategy: ChangeDetectionStrategy, genConfig: ChangeDetectorGenConfig, parsedTemplate: TemplateAst[]): ChangeDetectorDefinition[];
