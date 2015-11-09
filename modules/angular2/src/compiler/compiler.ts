import {RuntimeCompiler_} from "./runtime_compiler";
export {TemplateCompiler} from './template_compiler';
export {
  CompileDirectiveMetadata,
  CompileTypeMetadata,
  CompileTemplateMetadata
} from './directive_metadata';
export {SourceModule, SourceWithImports} from './source_module';
export {PLATFORM_DIRECTIVES, PLATFORM_PIPES} from 'angular2/src/core/platform_directives_and_pipes';

import {assertionsEnabled, Type} from 'angular2/src/facade/lang';
import {provide, Provider} from 'angular2/src/core/di';
import {TemplateParser} from 'angular2/src/compiler/template_parser';
import {HtmlParser} from 'angular2/src/compiler/html_parser';
import {TemplateNormalizer} from 'angular2/src/compiler/template_normalizer';
import {RuntimeMetadataResolver} from 'angular2/src/compiler/runtime_metadata';
import {ChangeDetectionCompiler} from 'angular2/src/compiler/change_detector_compiler';
import {StyleCompiler} from 'angular2/src/compiler/style_compiler';
import {CommandCompiler} from 'angular2/src/compiler/command_compiler';
import {TemplateCompiler} from 'angular2/src/compiler/template_compiler';
import {ChangeDetectorGenConfig} from 'angular2/src/core/change_detection/change_detection';
import {Compiler} from 'angular2/src/core/linker/compiler';
import {RuntimeCompiler} from 'angular2/src/compiler/runtime_compiler';
import {ElementSchemaRegistry} from 'angular2/src/compiler/schema/element_schema_registry';
import {DomElementSchemaRegistry} from 'angular2/src/compiler/schema/dom_element_schema_registry';
import {UrlResolver} from 'angular2/src/compiler/url_resolver';
import {AppRootUrl} from 'angular2/src/compiler/app_root_url';
import {AnchorBasedAppRootUrl} from 'angular2/src/compiler/anchor_based_app_root_url';
import {Parser, Lexer} from 'angular2/src/core/change_detection/change_detection';

export function compilerProviders(): Array<Type | Provider | any[]> {
  return [
    Lexer,
    Parser,
    HtmlParser,
    TemplateParser,
    TemplateNormalizer,
    RuntimeMetadataResolver,
    StyleCompiler,
    CommandCompiler,
    ChangeDetectionCompiler,
    provide(ChangeDetectorGenConfig,
            {useValue: new ChangeDetectorGenConfig(assertionsEnabled(), false, true)}),
    TemplateCompiler,
    provide(RuntimeCompiler, {useClass: RuntimeCompiler_}),
    provide(Compiler, {useExisting: RuntimeCompiler}),
    DomElementSchemaRegistry,
    provide(ElementSchemaRegistry, {useExisting: DomElementSchemaRegistry}),
    AnchorBasedAppRootUrl,
    provide(AppRootUrl, {useExisting: AnchorBasedAppRootUrl}),
    UrlResolver
  ];
}
