library angular2.src.transform.reflection_remover.transformer;

import 'dart:async';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/options.dart';
import 'package:barback/barback.dart';

import 'remove_reflection_capabilities.dart';

/// Transformer responsible for removing the import and instantiation of
/// [ReflectionCapabilities].
///
/// The goal of this is to break the app's dependency on dart:mirrors.
///
/// This transformer assumes that [DirectiveProcessor] and [DirectiveLinker]
/// have already been run and that a .ngDeps.dart file has been generated for
/// [options.entryPoint]. The instantiation of [ReflectionCapabilities] is
/// replaced by calling `setupReflection` in that .ngDeps.dart file.
class ReflectionRemover extends Transformer {
  final TransformerOptions options;

  ReflectionRemover(this.options);

  @override
  bool isPrimary(AssetId id) => options.reflectionEntryPoint == id.path;

  @override
  Future apply(Transform transform) async {
    log.init(transform);

    try {
      var newEntryPoint = new AssetId(
              transform.primaryInput.id.package, options.entryPoint)
          .changeExtension(DEPS_EXTENSION);

      var assetCode = await transform.primaryInput.readAsString();
      transform.addOutput(new Asset.fromString(transform.primaryInput.id,
          removeReflectionCapabilities(
              assetCode, transform.primaryInput.id.path, newEntryPoint.path)));
    } catch (ex, stackTrace) {
      log.logger.error('Removing reflection failed.\n'
          'Exception: $ex\n'
          'Stack Trace: $stackTrace');
    }
  }
}
