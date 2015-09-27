library angular2.transform.template_compiler.generator;

import 'dart:async';

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/compiler/change_detector_compiler.dart';
import 'package:angular2/src/compiler/command_compiler.dart';
import 'package:angular2/src/compiler/html_parser.dart';
import 'package:angular2/src/compiler/source_module.dart';
import 'package:angular2/src/compiler/style_compiler.dart';
import 'package:angular2/src/compiler/template_compiler.dart';
import 'package:angular2/src/compiler/template_normalizer.dart';
import 'package:angular2/src/compiler/template_parser.dart';
import 'package:angular2/src/core/change_detection/parser/lexer.dart' as ng;
import 'package:angular2/src/core/change_detection/parser/parser.dart' as ng;
import 'package:angular2/src/core/change_detection/interfaces.dart';
import 'package:angular2/src/core/facade/lang.dart';
import 'package:angular2/src/core/render/dom/schema/dom_element_schema_registry.dart';
import 'package:angular2/src/core/reflection/reflection.dart';
import 'package:angular2/src/core/services/url_resolver.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/ng_compiler.dart';
import 'package:angular2/src/transform/common/ng_deps.dart';
import 'package:angular2/src/transform/common/xhr_impl.dart';
import 'package:angular2/src/transform/common/url_resolver.dart';
import 'package:barback/barback.dart';
import 'package:path/path.dart' as path;

import 'reflection/codegen.dart' as reg;
import 'reflection/processor.dart' as reg;
import 'reflection/reflection_capabilities.dart';
import 'compile_data_creator.dart';

/// Reads the `.ng_deps.dart` file represented by `entryPoint` and parses any
/// Angular 2 `View` annotations it declares to generate `getter`s,
/// `setter`s, and `method`s that would otherwise be reflectively accessed.
///
/// This method assumes a {@link DomAdapter} has been registered.
Future<Outputs> processTemplates(AssetReader reader, AssetId entryPoint,
    {bool generateRegistrations: true,
    bool generateChangeDetectors: true,
    bool reflectPropertiesAsAttributes: false}) async {
  var viewDefResults = await createCompileData(reader, entryPoint);

  var templateCompiler = createTemplateCompiler(
      reader,
      changeDetectionConfig: new ChangeDetectorGenConfig(
        assertionsEnabled(),
        assertionsEnabled(),
        reflectPropertiesAsAttributes,
        false));

  var ngDeps = viewDefResults.ngDeps;
  var compileData =
      viewDefResults.viewDefinitions.values.toList(growable: false);
  if (compileData.isEmpty) return ngDeps.code;

  var moduleId = path.withoutExtension(entryPoint.path);
  var savedReflectionCapabilities = reflector.reflectionCapabilities;
  reflector.reflectionCapabilities = const NullReflectionCapabilities();
  var compiledTemplates =
      templateCompiler.compileTemplatesCodeGen(moduleId, compileData);
  reflector.reflectionCapabilities = savedReflectionCapabilities;

  var processor = new reg.Processor();
  compileData
      .map((withDirectives) => withDirectives.component)
      .forEach(processor.process);
  var codegen = new reg.Codegen();
  codegen.generate(processor);

  return new Outputs(entryPoint, ngDeps, codegen,
      viewDefResults.viewDefinitions, compiledTemplates.getSourceWithImports());
}

AssetId templatesAssetId(AssetId ngDepsAssetId) =>
    new AssetId(ngDepsAssetId.package, toTemplateExtension(ngDepsAssetId.path));

class Outputs {
  final String ngDepsCode;
  final String templatesCode;

  Outputs._(this.ngDepsCode, this.templatesCode);

  factory Outputs(
      AssetId assetId,
      NgDeps ngDeps,
      reg.Codegen accessors,
      Map<RegisteredType, NormalizedComponentWithViewDirectives> compileDataMap,
      SourceWithImports templatesSource) {
    return new Outputs._(
        _generateNgDepsCode(assetId, ngDeps, accessors, compileDataMap),
        _generateTemplatesCode(ngDeps, templatesSource));
  }

  // Updates the NgDeps code with an additional `CompiledTemplate` annotation
  // for each Directive we generated one for.
  //
  // Also adds an import to the `.template.dart` file that we will generate.
  static String _generateNgDepsCode(
      AssetId id,
      NgDeps ngDeps,
      reg.Codegen accessors,
      Map<RegisteredType,
          NormalizedComponentWithViewDirectives> compileDataMap) {
    var code = ngDeps.code;
    if (compileDataMap == null || compileDataMap.isEmpty) return code;

    if (ngDeps.registeredTypes.isEmpty) return code;
    var beginRegistrationsIdx =
        ngDeps.registeredTypes.first.registerMethod.offset;
    var endRegistratationsIdx = ngDeps.registeredTypes.last.registerMethod.end;
    var importInjectIdx = ngDeps.lib != null ? ngDeps.lib.end : 0;

    // Add everything up to the point where we begin registering classes with
    // the reflector, injecting an import to the generated template code.
    var buf = new StringBuffer('${code.substring(0, importInjectIdx)}'
        'import \'${toTemplateExtension(path.basename(id.path))}\' as _templates;'
        '${code.substring(importInjectIdx, beginRegistrationsIdx)}');

    for (var registeredType in ngDeps.registeredTypes) {
      if (compileDataMap.containsKey(registeredType)) {
        // We generated a template for this type, so add the generated
        // `CompiledTemplate` value as the final annotation in the list.
        var annotations = registeredType.annotations as ListLiteral;
        if (annotations.length == 0) {
          throw new FormatException('Unexpected format - attempting to codegen '
              'a class with no Component annotation ${registeredType.typeName}');
        }
        buf.write(code.substring(registeredType.registerMethod.offset,
            annotations.elements.last.end));
        buf.write(', _templates.Host${registeredType.typeName}Template]');
        buf.writeln(code.substring(
            registeredType.annotations.end, registeredType.registerMethod.end));
      } else {
        // There is no compiled template for this type, write it out without any
        // changes.
        buf.writeln(code.substring(registeredType.registerMethod.offset,
            registeredType.registerMethod.end));
      }
    }

    buf.writeln(accessors.toString());

    // Add everything after the final registration.
    buf.writeln(code.substring(endRegistratationsIdx));
    return buf.toString();
  }

  static String _generateTemplatesCode(
      NgDeps ngDeps, SourceWithImports templatesSource) {
    var buf = new StringBuffer();

    buf.writeln('${ngDeps.lib.name}_template;');
    buf.writeln();
    buf.writeAll(templatesSource.imports.map(_formatImportUri), '\n');
    buf.writeln();
    buf.writeln(templatesSource.source);

    // Refer to generated code from .ng_deps.dart file.
    return buf.toString();
  }

  static String _formatImportUri(List<String> import) {
    // Format for importLine := [uri, prefix]
    if (import.length != 2) {
      throw new FormatException(
          'Unexpected import format! '
          'Angular 2 compiler returned imports in an unexpected format.',
          import.join(', '));
    }
    var uri = import[0], prefix = import[1];

    // If this is an absolute uri, change to package: path.
    var parts = path.url.split(uri);
    if (parts.length > 1) {
      if (parts[1] == 'lib') {
        if (parts.length > 2) {
          uri =
              'package:${parts[0]}/${path.url.joinAll(parts.getRange(2, parts.length))}';
        }
      } else if (parts[1] == 'src') {
        // TODO(kegluneq): We might not want to support this case.
        uri =
            'package:${parts[0]}/${path.url.joinAll(parts.getRange(1, parts.length))}';
      }
    }

    if (prefix != null && prefix.isNotEmpty) {
      prefix = ' as $prefix';
    }
    return 'import \'$uri\'$prefix;';
  }
}
