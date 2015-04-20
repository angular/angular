library angular2.transform.reflection_remover.transformer;

import 'dart:async';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/common/mirror_mode.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/options.dart';
import 'package:barback/barback.dart';

import 'remove_reflection_capabilities.dart';

/// Transformer responsible for removing the import and instantiation of
/// {@link ReflectionCapabilities}.
///
/// The goal of this is to break the app's dependency on dart:mirrors.
///
/// This transformer assumes that {@link DirectiveProcessor} and {@link DirectiveLinker}
/// have already been run and that a .ng_deps.dart file has been generated for
/// {@link options.entryPoint}. The instantiation of {@link ReflectionCapabilities} is
/// replaced by calling `setupReflection` in that .ng_deps.dart file.
class ReflectionRemover extends Transformer {
  final TransformerOptions options;

  ReflectionRemover(this.options);

  @override
  bool isPrimary(AssetId id) => options.reflectionEntryPoints != null &&
      options.reflectionEntryPoints.contains(id.path);

  @override
  Future apply(Transform transform) async {
    log.init(transform);

    try {
      var newEntryPoints = options.entryPoints.map((entryPoint) {
        return new AssetId(transform.primaryInput.id.package, entryPoint)
            .changeExtension(DEPS_EXTENSION);
      });
      var reader = new AssetReader.fromTransform(transform);

      var mirrorMode = options.mirrorMode;
      var writeStaticInit = options.initReflector;
      if (options.modeName == TRANSFORM_DYNAMIC_MODE) {
        mirrorMode = MirrorMode.debug;
        writeStaticInit = false;
        log.logger.info('Running in "${options.modeName}", '
            'mirrorMode: ${mirrorMode}, '
            'writeStaticInit: ${writeStaticInit}.');
      }

      var transformedCode = await removeReflectionCapabilities(
          reader, transform.primaryInput.id, newEntryPoints,
          mirrorMode: mirrorMode, writeStaticInit: writeStaticInit);
      transform.addOutput(
          new Asset.fromString(transform.primaryInput.id, transformedCode));
    } catch (ex, stackTrace) {
      log.logger.error('Removing reflection failed.\n'
          'Exception: $ex\n'
          'Stack Trace: $stackTrace');
    }
  }
}
