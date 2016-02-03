library angular2.transform.template_compiler.transformer;

import 'dart:async';

import 'package:barback/barback.dart';

import 'package:angular2/src/platform/server/html_adapter.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/code/ng_deps_code.dart';
import 'package:angular2/src/transform/common/code/source_module.dart';
import 'package:angular2/src/transform/common/formatter.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/options.dart';
import 'package:angular2/src/transform/common/zone.dart' as zone;

import 'generator.dart';

/// {@link Transformer} responsible for processing Angular 2 templates.
///
/// {@link TemplateCompiler} uses the Angular 2 `TemplateCompiler` to process
/// the templates, extracting information about what reflection is necessary to
/// render and use that template. It then generates code in place of those
/// reflective accesses.
///
/// This transformer is part of a multi-phase transform.
/// See `angular2/src/transform/transformer.dart` for transformer ordering.
class TemplateCompiler extends Transformer implements LazyTransformer {
  final TransformerOptions options;

  TemplateCompiler(this.options);

  @override
  bool isPrimary(AssetId id) => id.path.endsWith(META_EXTENSION);

  @override
  declareOutputs(DeclaringTransform transform) {
    transform.declareOutput(templatesAssetId(transform.primaryId));
  }

  @override
  Future apply(Transform transform) async {
    return zone.exec(() async {
      Html5LibDomAdapter.makeCurrent();
      var primaryId = transform.primaryInput.id;
      var reader = new AssetReader.fromTransform(transform);
      var outputs = await processTemplates(reader, primaryId,
          genChangeDetectionDebugInfo: options.genChangeDetectionDebugInfo,
          reflectPropertiesAsAttributes: options.reflectPropertiesAsAttributes,
          platformDirectives: options.platformDirectives,
          platformPipes: options.platformPipes);
      var ngDepsCode = _emptyNgDepsContents;
      if (outputs != null) {
        if (outputs.ngDeps != null) {
          final buf = new StringBuffer();
          final templatesSrc =
              options.genCompiledTemplates ? outputs.templatesSource : null;
          writeTemplateFile(
              new NgDepsWriter(buf), outputs.ngDeps, templatesSrc);
          ngDepsCode = formatter.format(buf.toString());
        }
      }
      transform.addOutput(
          new Asset.fromString(templatesAssetId(primaryId), ngDepsCode));
    }, log: transform.logger);
  }
}

const _emptyNgDepsContents = 'initReflector() {}\n';
