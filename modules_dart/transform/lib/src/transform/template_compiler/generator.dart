library angular2.transform.template_compiler.generator;

import 'dart:async';

import 'package:angular2/src/core/change_detection/interfaces.dart';
import 'package:angular2/src/core/facade/lang.dart';
import 'package:angular2/src/core/reflection/reflection.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/code/source_module.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/model/annotation_model.pb.dart';
import 'package:angular2/src/transform/common/model/import_export_model.pb.dart';
import 'package:angular2/src/transform/common/model/ng_deps_model.pb.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/ng_compiler.dart';
import 'package:barback/barback.dart';
import 'package:path/path.dart' as path;

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
  if (viewDefResults == null) return null;
  final directiveMetadatas = viewDefResults.ngMeta.types.values;
  if (directiveMetadatas.isNotEmpty) {
    var processor = new reg.Processor();
    directiveMetadatas.forEach(processor.process);
    viewDefResults.ngMeta.ngDeps.getters
        .addAll(processor.getterNames.map((e) => e.sanitizedName));
    viewDefResults.ngMeta.ngDeps.setters
        .addAll(processor.setterNames.map((e) => e.sanitizedName));
    viewDefResults.ngMeta.ngDeps.methods
        .addAll(processor.methodNames.map((e) => e.sanitizedName));
  }
  var templateCompiler = createTemplateCompiler(reader,
      changeDetectionConfig: new ChangeDetectorGenConfig(assertionsEnabled(),
          assertionsEnabled(), reflectPropertiesAsAttributes, false));

  final compileData =
      viewDefResults.viewDefinitions.values.toList(growable: false);
  if (compileData.isEmpty) {
    return new Outputs._(viewDefResults.ngMeta.ngDeps, null);
  }

  var savedReflectionCapabilities = reflector.reflectionCapabilities;
  reflector.reflectionCapabilities = const NullReflectionCapabilities();
  final compiledTemplates = await logElapsedAsync(() async {
    return templateCompiler.compileTemplatesCodeGen(compileData);
  }, operationName: 'compileTemplatesCodegen', assetId: assetId);
  reflector.reflectionCapabilities = savedReflectionCapabilities;

  if (compiledTemplates != null) {
    viewDefResults.ngMeta.ngDeps.imports.add(new ImportModel()
      ..uri = toTemplateExtension(path.basename(assetId.path))
      ..prefix = '_templates');
    for (var reflectable in viewDefResults.viewDefinitions.keys) {
      reflectable.annotations.add(new AnnotationModel()
        ..name = '_templates.Host${reflectable.name}Template'
        ..isConstObject = true);
    }
  }

  return new Outputs._(
      viewDefResults.ngMeta.ngDeps, writeSourceModule(compiledTemplates));
}

AssetId ngDepsAssetId(AssetId primaryId) =>
    new AssetId(primaryId.package, toDepsExtension(primaryId.path));

AssetId templatesAssetId(AssetId primaryId) =>
    new AssetId(primaryId.package, toTemplateExtension(primaryId.path));

class Outputs {
  final NgDepsModel ngDeps;
  final String templatesCode;

  Outputs._(this.ngDeps, this.templatesCode);
}
