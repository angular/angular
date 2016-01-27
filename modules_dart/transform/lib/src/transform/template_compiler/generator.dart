library angular2.transform.template_compiler.generator;

import 'dart:async';

import 'package:barback/barback.dart';

import 'package:angular2/src/compiler/source_module.dart';
import 'package:angular2/src/core/change_detection/interfaces.dart';
import 'package:angular2/src/facade/lang.dart';
import 'package:angular2/src/core/reflection/reflection.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/model/annotation_model.pb.dart';
import 'package:angular2/src/transform/common/model/ng_deps_model.pb.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/ng_compiler.dart';
import 'package:angular2/src/transform/common/zone.dart' as zone;

import 'reflection/processor.dart' as reg;
import 'reflection/reflection_capabilities.dart';
import 'compile_data_creator.dart';

/// Generates `.template.dart` files to initialize the Angular2 system.
///
/// - Processes the `.ng_meta.json` file represented by `assetId` using
///   `createCompileData`.
/// - Uses the resulting `NgMeta` object to register `getter`s, `setter`s, and
///   `method`s that would otherwise need to be reflectively accessed with the
///   `NgDeps` object.
/// - Passes the resulting `NormalizedComponentWithViewDirectives` instance(s)
///   to the `TemplateCompiler` to generate compiled template(s) as a
///   `SourceModule`.
/// - Uses the resulting `NgDeps` object to generate code which initializes the
///   Angular2 reflective system.
///
/// This method assumes a {@link DomAdapter} has been registered.
Future<Outputs> processTemplates(AssetReader reader, AssetId assetId,
    {bool genChangeDetectionDebugInfo: false,
    bool reflectPropertiesAsAttributes: false,
    List<String> platformDirectives,
    List<String> platformPipes}) async {
  var viewDefResults = await createCompileData(
      reader, assetId, platformDirectives, platformPipes);
  if (viewDefResults == null) return null;
  final compileTypeMetadatas = viewDefResults.ngMeta.types.values;
  if (compileTypeMetadatas.isNotEmpty) {
    var processor = new reg.Processor();
    compileTypeMetadatas.forEach(processor.process);
    viewDefResults.ngMeta.ngDeps.getters
        .addAll(processor.getterNames.map((e) => e.sanitizedName));
    viewDefResults.ngMeta.ngDeps.setters
        .addAll(processor.setterNames.map((e) => e.sanitizedName));
    viewDefResults.ngMeta.ngDeps.methods
        .addAll(processor.methodNames.map((e) => e.sanitizedName));
  }
  var templateCompiler = zone.templateCompiler;
  if (templateCompiler == null) {
    templateCompiler = createTemplateCompiler(reader,
        changeDetectionConfig: new ChangeDetectorGenConfig(
            genChangeDetectionDebugInfo, reflectPropertiesAsAttributes, false));
  }

  final compileData =
      viewDefResults.viewDefinitions.values.toList(growable: false);
  if (compileData.isEmpty) {
    return new Outputs._(viewDefResults.ngMeta.ngDeps, null);
  }

  var savedReflectionCapabilities = reflector.reflectionCapabilities;
  reflector.reflectionCapabilities = const NullReflectionCapabilities();
  // Since we need global state to remain consistent here, make sure not to do
  // any asynchronous operations here.
  final compiledTemplates = logElapsedSync(() {
    return templateCompiler.compileTemplatesCodeGen(compileData);
  }, operationName: 'compileTemplatesCodegen', assetId: assetId);
  reflector.reflectionCapabilities = savedReflectionCapabilities;

  if (compiledTemplates != null) {
    // We successfully compiled templates!
    // For each compiled template, add the compiled template class as an
    // "Annotation" on the code to be registered with the reflector.
    for (var reflectable in viewDefResults.viewDefinitions.keys) {
      // TODO(kegluneq): Avoid duplicating naming logic for generated classes.
      reflectable.annotations.add(new AnnotationModel()
        ..name = 'hostViewFactory_${reflectable.name}'
        ..isConstObject = true);
    }
  }

  return new Outputs._(viewDefResults.ngMeta.ngDeps, compiledTemplates);
}

AssetId templatesAssetId(AssetId primaryId) =>
    new AssetId(primaryId.package, toTemplateExtension(primaryId.path));

class Outputs {
  final NgDepsModel ngDeps;
  final SourceModule templatesSource;

  Outputs._(this.ngDeps, this.templatesSource);
}
