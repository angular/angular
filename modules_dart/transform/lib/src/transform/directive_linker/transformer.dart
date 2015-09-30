library angular2.transform.directive_linker.transformer;

import 'dart:async';
import 'dart:convert';

import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/code/ng_deps_code.dart';
import 'package:angular2/src/transform/common/formatter.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/common/names.dart';
import 'package:barback/barback.dart';

import 'linker.dart';

/// Transformer responsible for processing `.ng_deps.json` files created by
/// {@link DirectiveProcessor} and ensuring that each imports its dependencies'
/// .ng_deps.dart files.
class DirectiveLinker extends Transformer implements DeclaringTransformer {
  final _encoder = const JsonEncoder.withIndent('  ');

  DirectiveLinker();

  @override
  bool isPrimary(AssetId id) => id.path.endsWith(DEPS_JSON_EXTENSION);

  @override
  declareOutputs(DeclaringTransform transform) {
    // TODO(kegluenq): We should consume this, but doing so causes barback to
    // incorrectly determine what assets are available in this phase.
    // transform.consumePrimary();
    transform.declareOutput(_depsAssetId(transform.primaryId));
  }

  @override
  Future apply(Transform transform) async {
    await log.initZoned(transform, () async {
      var reader = new AssetReader.fromTransform(transform);
      var primaryId = transform.primaryInput.id;
      var ngDepsModel = await linkNgDeps(reader, primaryId);
      // See above
      // transform.consumePrimary();
      var outputAssetId = _depsAssetId(primaryId);
      if (ngDepsModel != null) {
        var buf = new StringBuffer();
        var writer = new NgDepsWriter(buf);
        writer.writeNgDepsModel(ngDepsModel);
        var formattedCode = formatter.format('$buf', uri: primaryId.path);
        transform.addOutput(new Asset.fromString(outputAssetId, formattedCode));
      } else {
        transform.addOutput(new Asset.fromString(outputAssetId, ''));
      }
    });
  }
}

AssetId _depsAssetId(AssetId primaryId) =>
    new AssetId(primaryId.package, toDepsExtension(primaryId.path));

/// Transformer responsible for removing unnecessary `.ng_deps.json` files
/// created by {@link DirectiveProcessor}.
class EmptyNgDepsRemover extends Transformer implements DeclaringTransformer {
  EmptyNgDepsRemover();

  @override
  bool isPrimary(AssetId id) => id.path.endsWith(DEPS_JSON_EXTENSION);

  /// We occasionally consume the primary input, but that depends on the
  /// contents of the file, so we conservatively declare that we both consume
  /// and output the asset. This prevents barback from making any assumptions
  /// about the existence of the assets until after the transformer has run.
  @override
  declareOutputs(DeclaringTransform transform) {
    transform.consumePrimary();
    transform.declareOutput(transform.primaryId);
  }

  @override
  Future apply(Transform transform) async {
    await log.initZoned(transform, () async {
      var reader = new AssetReader.fromTransform(transform);
      transform.consumePrimary();
      if ((await isNecessary(reader, transform.primaryInput.id))) {
        transform.addOutput(transform.primaryInput);
      }
    });
  }
}
