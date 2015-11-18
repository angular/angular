'use strict';var runtime_compiler_1 = require("./runtime_compiler");
var template_compiler_1 = require('./template_compiler');
exports.TemplateCompiler = template_compiler_1.TemplateCompiler;
var directive_metadata_1 = require('./directive_metadata');
exports.CompileDirectiveMetadata = directive_metadata_1.CompileDirectiveMetadata;
exports.CompileTypeMetadata = directive_metadata_1.CompileTypeMetadata;
exports.CompileTemplateMetadata = directive_metadata_1.CompileTemplateMetadata;
var source_module_1 = require('./source_module');
exports.SourceModule = source_module_1.SourceModule;
exports.SourceWithImports = source_module_1.SourceWithImports;
var platform_directives_and_pipes_1 = require('angular2/src/core/platform_directives_and_pipes');
exports.PLATFORM_DIRECTIVES = platform_directives_and_pipes_1.PLATFORM_DIRECTIVES;
exports.PLATFORM_PIPES = platform_directives_and_pipes_1.PLATFORM_PIPES;
var lang_1 = require('angular2/src/facade/lang');
var di_1 = require('angular2/src/core/di');
var template_parser_1 = require('angular2/src/compiler/template_parser');
var html_parser_1 = require('angular2/src/compiler/html_parser');
var template_normalizer_1 = require('angular2/src/compiler/template_normalizer');
var runtime_metadata_1 = require('angular2/src/compiler/runtime_metadata');
var change_detector_compiler_1 = require('angular2/src/compiler/change_detector_compiler');
var style_compiler_1 = require('angular2/src/compiler/style_compiler');
var command_compiler_1 = require('angular2/src/compiler/command_compiler');
var template_compiler_2 = require('angular2/src/compiler/template_compiler');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var compiler_1 = require('angular2/src/core/linker/compiler');
var runtime_compiler_2 = require('angular2/src/compiler/runtime_compiler');
var element_schema_registry_1 = require('angular2/src/compiler/schema/element_schema_registry');
var dom_element_schema_registry_1 = require('angular2/src/compiler/schema/dom_element_schema_registry');
var url_resolver_1 = require('angular2/src/compiler/url_resolver');
var app_root_url_1 = require('angular2/src/compiler/app_root_url');
var anchor_based_app_root_url_1 = require('angular2/src/compiler/anchor_based_app_root_url');
var change_detection_2 = require('angular2/src/core/change_detection/change_detection');
function _createChangeDetectorGenConfig() {
    return new change_detection_1.ChangeDetectorGenConfig(lang_1.assertionsEnabled(), false, true);
}
exports.COMPILER_PROVIDERS = lang_1.CONST_EXPR([
    change_detection_2.Lexer,
    change_detection_2.Parser,
    html_parser_1.HtmlParser,
    template_parser_1.TemplateParser,
    template_normalizer_1.TemplateNormalizer,
    runtime_metadata_1.RuntimeMetadataResolver,
    style_compiler_1.StyleCompiler,
    command_compiler_1.CommandCompiler,
    change_detector_compiler_1.ChangeDetectionCompiler,
    new di_1.Provider(change_detection_1.ChangeDetectorGenConfig, { useFactory: _createChangeDetectorGenConfig, deps: [] }),
    template_compiler_2.TemplateCompiler,
    new di_1.Provider(runtime_compiler_2.RuntimeCompiler, { useClass: runtime_compiler_1.RuntimeCompiler_ }),
    new di_1.Provider(compiler_1.Compiler, { useExisting: runtime_compiler_2.RuntimeCompiler }),
    dom_element_schema_registry_1.DomElementSchemaRegistry,
    new di_1.Provider(element_schema_registry_1.ElementSchemaRegistry, { useExisting: dom_element_schema_registry_1.DomElementSchemaRegistry }),
    anchor_based_app_root_url_1.AnchorBasedAppRootUrl,
    new di_1.Provider(app_root_url_1.AppRootUrl, { useExisting: anchor_based_app_root_url_1.AnchorBasedAppRootUrl }),
    url_resolver_1.UrlResolver
]);
//# sourceMappingURL=compiler.js.map