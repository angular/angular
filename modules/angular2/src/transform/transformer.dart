library angular2.src.transform;

import 'dart:async';
import 'package:analyzer/src/generated/ast.dart';
import 'package:analyzer/src/generated/element.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/resolver.dart';

import 'annotation_processor.dart';
import 'codegen.dart' as codegen;
import 'find_bootstrap.dart';
import 'find_reflection_capabilities.dart';
import 'logging.dart' as log;
import 'options.dart';
import 'resolvers.dart';
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

  Future apply(Transform transform) {
    log.init(transform);

    var entryPointId =
        new AssetId(transform.primaryInput.id.package, options.entryPoint);
    var reflectionEntryPointId = new AssetId(
        transform.primaryInput.id.package, options.reflectionEntryPoint);
    var newEntryPointId =
        new AssetId(transform.primaryInput.id.package, options.newEntryPoint);

    var reflectionExists = transform.hasInput(reflectionEntryPointId);
    var newEntryPointExists = transform.hasInput(newEntryPointId);

    Resolver myResolver;
    return Future
        .wait([reflectionExists, newEntryPointExists])
        .then((existsList) {
      if (!existsList[0]) {
        log.logger.error('Reflection entry point file '
            '${reflectionEntryPointId} does not exist.');
      } else if (existsList[1]) {
        log.logger
            .error('New entry point file $newEntryPointId already exists.');
      } else {
        return _resolvers
            .get(transform, [entryPointId, reflectionEntryPointId])
            .then((resolver) {
          myResolver = resolver;
          try {
            String reflectionCapabilitiesCreation = findReflectionCapabilities(
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
        });
      }
    }).whenComplete(() {
      if (myResolver != null) {
        myResolver.release();
      }
    });
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

    log.logger.info('found ${bootstrapCalls.length} call(s) to `bootstrap`');
    bootstrapCalls.forEach((BootstrapCallInfo info) {
      log.logger.info('Arg1: ${info.bootstrapType}');
    });

    var types = new Angular2Types(_resolver);
    // TODO(kegluneq): Also match [Inject].
    var matcher = new AnnotationMatcher(new Set.from([
      types.componentAnnotation,
      types.decoratorAnnotation,
      types.templateAnnotation
    ]));

    var traversal = new AngularVisibleTraversal(types, matcher);
    bootstrapCalls.forEach((call) => traversal.traverse(call.bootstrapType));

    var context = new codegen.Context(logger: _transform.logger);
    matcher.matchQueue
        .forEach((entry) => context.directiveRegistry.register(entry));

    _transform.addOutput(new Asset.fromString(_newEntryPoint,
        codegen.codegenEntryPoint(context, newEntryPoint: _newEntryPoint)));
  }
}
