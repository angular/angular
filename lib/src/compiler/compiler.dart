library angular2.src.compiler.compiler;

import "runtime_compiler.dart" show RuntimeCompiler_;
export "template_compiler.dart" show TemplateCompiler;
export "directive_metadata.dart"
    show CompileDirectiveMetadata, CompileTypeMetadata, CompileTemplateMetadata;
export "source_module.dart" show SourceModule, SourceWithImports;
export "package:angular2/src/core/platform_directives_and_pipes.dart"
    show PLATFORM_DIRECTIVES, PLATFORM_PIPES;
import "package:angular2/src/facade/lang.dart" show assertionsEnabled, Type;
import "package:angular2/src/core/di.dart" show provide, Provider;
import "package:angular2/src/compiler/template_parser.dart" show TemplateParser;
import "package:angular2/src/compiler/html_parser.dart" show HtmlParser;
import "package:angular2/src/compiler/template_normalizer.dart"
    show TemplateNormalizer;
import "package:angular2/src/compiler/runtime_metadata.dart"
    show RuntimeMetadataResolver;
import "package:angular2/src/compiler/change_detector_compiler.dart"
    show ChangeDetectionCompiler;
import "package:angular2/src/compiler/style_compiler.dart" show StyleCompiler;
import "package:angular2/src/compiler/command_compiler.dart"
    show CommandCompiler;
import "package:angular2/src/compiler/template_compiler.dart"
    show TemplateCompiler;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show ChangeDetectorGenConfig;
import "package:angular2/src/core/linker/compiler.dart" show Compiler;
import "package:angular2/src/compiler/runtime_compiler.dart"
    show RuntimeCompiler;
import "package:angular2/src/compiler/schema/element_schema_registry.dart"
    show ElementSchemaRegistry;
import "package:angular2/src/compiler/schema/dom_element_schema_registry.dart"
    show DomElementSchemaRegistry;
import "package:angular2/src/compiler/url_resolver.dart" show UrlResolver;
import "package:angular2/src/compiler/app_root_url.dart" show AppRootUrl;
import "package:angular2/src/compiler/anchor_based_app_root_url.dart"
    show AnchorBasedAppRootUrl;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show Parser, Lexer;

_createChangeDetectorGenConfig() {
  return new ChangeDetectorGenConfig(assertionsEnabled(), false, true);
}

const List<
        dynamic /* Type | Provider | List < dynamic > */ > COMPILER_PROVIDERS =
    const [
  Lexer,
  Parser,
  HtmlParser,
  TemplateParser,
  TemplateNormalizer,
  RuntimeMetadataResolver,
  StyleCompiler,
  CommandCompiler,
  ChangeDetectionCompiler,
  const Provider(ChangeDetectorGenConfig,
      useFactory: _createChangeDetectorGenConfig, deps: const []),
  TemplateCompiler,
  const Provider(RuntimeCompiler, useClass: RuntimeCompiler_),
  const Provider(Compiler, useExisting: RuntimeCompiler),
  DomElementSchemaRegistry,
  const Provider(ElementSchemaRegistry, useExisting: DomElementSchemaRegistry),
  AnchorBasedAppRootUrl,
  const Provider(AppRootUrl, useExisting: AnchorBasedAppRootUrl),
  UrlResolver
];
