library angular2.transform.directive_processor.transformer;

import 'dart:async';
import 'dart:convert';

import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/code/ng_deps_code.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/options.dart';
import 'package:angular2/src/transform/common/ng_meta.dart';
import 'package:barback/barback.dart';

import 'rewriter.dart';

/// Transformer responsible for processing all .dart assets and creating
/// .ng_deps.dart files which register @Injectable annotated classes with the
/// reflector.
///
/// This will also create .ng_deps.dart files for classes annotated
/// with @Component, @View, @Directive, etc.
///
/// This transformer is the first phase in a two-phase transform. It should
/// be followed by {@link DirectiveLinker}.
class DirectiveProcessor extends Transformer {
  final TransformerOptions options;

  DirectiveProcessor(this.options);

  @override
  bool isPrimary(AssetId id) => id.extension.endsWith('dart');

  @override
  Future apply(Transform transform) async {
    await log.initZoned(transform, () async {
      var asset = transform.primaryInput;
      var reader = new AssetReader.fromTransform(transform);
      var ngMeta = new NgMeta.empty();
      var ngDepsModel = await createNgDeps(
          reader, asset.id, options.annotationMatcher, ngMeta,
          inlineViews: options.inlineViews);
      if (ngDepsModel != null) {
        var ngDepsAssetId =
            transform.primaryInput.id.changeExtension(DEPS_EXTENSION);
        if (await transform.hasInput(ngDepsAssetId)) {
          log.logger.error('Clobbering ${ngDepsAssetId}. '
              'This probably will not end well');
        }
        var buf = new StringBuffer();
        var writer = new NgDepsWriter(buf);
        writer.writeNgDepsModel(ngDepsModel);
        transform.addOutput(new Asset.fromString(ngDepsAssetId, '$buf'));
      }
      if (!ngMeta.isEmpty) {
        var ngAliasesId =
            transform.primaryInput.id.changeExtension(ALIAS_EXTENSION);
        transform.addOutput(new Asset.fromString(ngAliasesId,
            new JsonEncoder.withIndent("  ").convert(ngMeta.toJson())));
      }
    });
  }
}
