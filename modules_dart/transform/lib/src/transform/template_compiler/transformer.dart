library angular2.transform.template_compiler.transformer;

import 'dart:async';

import 'package:barback/barback.dart';

import 'package:angular2/src/core/dom/html_adapter.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/code/ng_deps_code.dart';
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
class TemplateCompiler extends Transformer {
  final TransformerOptions options;

  TemplateCompiler(this.options);

  @override
  bool isPrimary(AssetId id) => id.path.endsWith(META_EXTENSION);

  @override
  Future apply(Transform transform) async {
    return zone.exec(() async {
      Html5LibDomAdapter.makeCurrent();
      var primaryId = transform.primaryInput.id;
      var reader = new AssetReader.fromTransform(transform);
      var outputs = await processTemplates(reader, primaryId,
          reflectPropertiesAsAttributes: options.reflectPropertiesAsAttributes);
      var ngDepsCode = _emptyNgDepsContents;
      var templatesCode = '';
      if (outputs != null) {
        if (outputs.ngDeps != null) {
          final buf = new StringBuffer();
          final writer = new NgDepsWriter(buf);
          writer.writeNgDepsModel(outputs.ngDeps);
          ngDepsCode = formatter.format(buf.toString());
        }
        if (outputs.templatesCode != null) {
          templatesCode = formatter.format(outputs.templatesCode);
        }
      }
      transform.addOutput(
          new Asset.fromString(ngDepsAssetId(primaryId), ngDepsCode));
      transform.addOutput(
          new Asset.fromString(templatesAssetId(primaryId), templatesCode));
    }, log: transform.logger);
  }
}

const _emptyNgDepsContents = 'initReflector() {}\n';
