library angular2.src.transform;

import 'dart:async';
import 'package:analyzer/src/generated/ast.dart';
import 'package:analyzer/src/generated/element.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/resolver.dart';

import 'annotation_processor.dart';
import 'codegen.dart' as codegen;
import 'find_bootstrap.dart';
import 'logging.dart' as log;
import 'options.dart';
import 'resolvers.dart';
import 'setup_reflection/remove_reflection_capabilities.dart';
import 'traversal.dart';

export 'options.dart';

/// Removes the mirror-based initialization logic and replaces it with static
/// logic.
class AngularTransformer extends Transformer {
  final Resolvers _resolvers;
  final TransformerOptions options;

  AngularTransformer(this.options) : _resolvers = createResolvers();

  factory AngularTransformer.asPlugin(BarbackSettings settings) {
    var config = settings.configuration;
    return new AngularTransformer(new TransformerOptions(
        config[entryPointParam],
        reflectionEntryPoint: config[reflectionEntryPointParam],
        newEntryPoint: config[newEntryPointParam]));
  }

  bool isPrimary(AssetId id) => options.reflectionEntryPoint == id.path;

  Future apply(Transform transform) async {
    log.init(transform);

    var entryPointId =
    new AssetId(transform.primaryInput.id.package, options.entryPoint);
    var reflectionEntryPointId = new AssetId(
        transform.primaryInput.id.package, options.reflectionEntryPoint);
    var newEntryPointId =
    new AssetId(transform.primaryInput.id.package, options.newEntryPoint);

    var reflectionExists = await transform.hasInput(reflectionEntryPointId);
    var newEntryPointExists = await transform.hasInput(newEntryPointId);

    Resolver myResolver;
    if (!reflectionExists) {
      log.logger.error('Reflection entry point file '
      '${reflectionEntryPointId} does not exist.');
    } else if (newEntryPointExists) {
      log.logger
      .error('New entry point file $newEntryPointId already exists.');
    } else {
      var resolver = await _resolvers.get(transform, [entryPointId,
      reflectionEntryPointId]);
      try {
        try {
          String reflectionCapabilitiesCreation = removeReflectionCapabilities(
              resolver, reflectionEntryPointId, newEntryPointId);

          transform.addOutput(new Asset.fromString(
              reflectionEntryPointId, reflectionCapabilitiesCreation));
          // Find the call to `new ReflectionCapabilities()`
          // Generate new source.
        } catch (err, stackTrace) {
          log.logger.error('${err}: ${stackTrace}',
          asset: reflectionEntryPointId);
          rethrow;
        }

        try {
          new _BootstrapFileBuilder(
              resolver, transform, entryPointId, newEntryPointId).run();
        } catch (err, stackTrace) {
          log.logger.error('${err}: ${stackTrace}',
          asset: transform.primaryInput.id);
          rethrow;
        }
      }
      finally {
        if (resolver != null) {
          resolver.release();
        }
      }
    }
  }
}

class _BootstrapFileBuilder {
  final Resolver _resolver;
  final Transform _transform;
  final AssetId _entryPoint;
  final AssetId _newEntryPoint;

  _BootstrapFileBuilder(Resolver resolver, Transform transform,
      this._entryPoint, this._newEntryPoint)
      : _resolver = resolver,
        _transform = transform;

  /// Adds the new entry point file to the transform. Should only be ran once.
  void run() {
    Set<BootstrapCallInfo> bootstrapCalls =
        findBootstrapCalls(_resolver, _resolver.getLibrary(_entryPoint));

    var types = new Angular2Types(_resolver);
    // TODO(kegluneq): Also match [Inject].
    var matcher = new AnnotationMatcher(
        new Set.from([types.directiveAnnotation, types.templateAnnotation]));

    var traversal = new AngularVisibleTraversal(types, matcher);
    bootstrapCalls.forEach((call) => traversal.traverse(call.bootstrapType));

    var context = new codegen.Context();
    matcher.matchQueue
        .forEach((entry) => context.directiveRegistry.register(entry));

    _transform.addOutput(new Asset.fromString(_newEntryPoint,
        codegen.codegenEntryPoint(context, newEntryPoint: _newEntryPoint)));
  }
}
