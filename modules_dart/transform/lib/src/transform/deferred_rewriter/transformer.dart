library angular2.transform.deferred_rewriter.transformer;

import 'dart:async';

import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/options.dart';
import 'package:barback/barback.dart';

import 'rewriter.dart';

/// Transformer responsible for rewriting deferred library loads to enable
/// initializing the reflector in a deferred way to keep the code with the
/// deferred library.
class DeferredRewriter extends Transformer implements DeclaringTransformer {
  final TransformerOptions options;

  DeferredRewriter(this.options);

  @override
  bool isPrimary(AssetId id) =>
      id.extension.endsWith('dart') && !id.path.endsWith(DEPS_EXTENSION);

  @override
  declareOutputs(DeclaringTransform transform) {
    transform.consumePrimary();
    transform.declareOutput(transform.primaryId);
  }

  @override
  Future apply(Transform transform) async {
    await log.initZoned(transform, () async {
      var asset = transform.primaryInput;
      var reader = new AssetReader.fromTransform(transform);
      var transformedCode = await rewriteDeferredLibraries(reader, asset.id);
      transform.consumePrimary();
      if (transformedCode != null) {
        transform.addOutput(new Asset.fromString(asset.id, transformedCode));
      } else {
        transform.addOutput(asset);
      }
    });
  }
}

// Visible for testing
Future<String> rewriteDeferredLibraries(AssetReader reader, AssetId id) async {
  var rewriter = new Rewriter(id, reader);
  return await rewriter.rewrite();
}
