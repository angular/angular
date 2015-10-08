library angular2.transform.template_compiler.generator;

import 'dart:async';

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/core/compiler/source_module.dart';
import 'package:angular2/src/core/compiler/template_compiler.dart';
import 'package:angular2/src/core/change_detection/interfaces.dart';
import 'package:angular2/src/core/facade/lang.dart';
import 'package:angular2/src/core/reflection/reflection.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/code/source_module.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/ng_compiler.dart';
import 'package:angular2/src/transform/common/ng_deps.dart';
import 'package:barback/barback.dart';
import 'package:path/path.dart' as path;

import 'reflection/codegen.dart' as reg;
import 'reflection/processor.dart' as reg;
import 'reflection/reflection_capabilities.dart';
import 'compile_data_creator.dart';

/// Reads the `.ng_deps.dart` file represented by `assetId` and parses any
/// Angular 2 `View` annotations it declares to generate `getter`s,
/// `setter`s, and `method`s that would otherwise be reflectively accessed.
///
/// This method assumes a {@link DomAdapter} has been registered.
Future<Outputs> processTemplates(AssetReader reader, AssetId assetId,
    {bool reflectPropertiesAsAttributes: false}) async {
  var viewDefResults = await createCompileData(reader, assetId);
  var codegen = null;
  if (viewDefResults.directiveMetadatas.isNotEmpty) {
    var processor = new reg.Processor();
    viewDefResults.directiveMetadatas.forEach(processor.process);
    codegen = new reg.Codegen();
    codegen.generate(processor);
  }
  var templateCompiler = createTemplateCompiler(reader,
      changeDetectionConfig: new ChangeDetectorGenConfig(assertionsEnabled(),
          assertionsEnabled(), reflectPropertiesAsAttributes, false));

  var ngDeps = viewDefResults.ngDeps;
  var compileData =
      viewDefResults.viewDefinitions.values.toList(growable: false);
  if (compileData.isEmpty) {
    return new Outputs(assetId, ngDeps, codegen, null, null);
  }

  var savedReflectionCapabilities = reflector.reflectionCapabilities;
  reflector.reflectionCapabilities = const NullReflectionCapabilities();
  final compiledTemplates = await logElapsedAsync(() async {
    return templateCompiler.compileTemplatesCodeGen(compileData);
  }, operationName: 'compileTemplatesCodegen', assetId: assetId);
  reflector.reflectionCapabilities = savedReflectionCapabilities;

  return new Outputs(assetId, ngDeps, codegen, viewDefResults.viewDefinitions,
      compiledTemplates);
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
      SourceModule templatesSource) {
    return new Outputs._(
        _generateNgDepsCode(assetId, ngDeps, accessors, compileDataMap),
        writeSourceModule(templatesSource));
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
    if (accessors == null &&
        (compileDataMap == null || compileDataMap.isEmpty)) return code;

    if (ngDeps.registeredTypes.isEmpty) return code;
    var beginRegistrationsIdx =
        ngDeps.registeredTypes.first.registerMethod.offset;
    var endRegistratationsIdx = ngDeps.registeredTypes.last.registerMethod.end;
    var importInjectIdx = ngDeps.lib != null ? ngDeps.lib.end : 0;

    // Add everything up to the point where we begin registering classes with
    // the reflector, injecting an import to the generated template code.
    var buf;
    if (compileDataMap != null) {
      buf = new StringBuffer('${code.substring(0, importInjectIdx)}'
          'import \'${toTemplateExtension(path.basename(id.path))}\' as _templates;'
          '${code.substring(importInjectIdx, beginRegistrationsIdx)}');
    } else {
      buf = new StringBuffer('${code.substring(0, beginRegistrationsIdx)}');
    }
    for (var registeredType in ngDeps.registeredTypes) {
      if (compileDataMap != null &&
          compileDataMap.containsKey(registeredType)) {
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
}
