library angular2.src.transform;

import 'dart:async';
import 'package:analyzer/src/generated/ast.dart';
import 'package:analyzer/src/generated/element.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/resolver.dart';

import 'annotation_processor.dart';
import 'codegen.dart' as codegen;
import 'find_bootstrap.dart';
import 'html_transform.dart';
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

  static const _bootstrapEntryPointParam = 'bootstrap_entry_point';
  static const _entryPointParam = 'entry_point';
  static const _newEntryPointParam = 'new_entry_point';
  static const _htmlEntryPointParam = 'html_entry_point';

  factory AngularTransformer.asPlugin(BarbackSettings settings) {
    var bootstrapEntryPoint = settings.configuration[_bootstrapEntryPointParam];
    var entryPoint = settings.configuration[_entryPointParam];
    var newEntryPoint = settings.configuration[_newEntryPointParam];
    if (newEntryPoint == null) {
      newEntryPoint = entryPoint.replaceFirst('.dart', '.bootstrap.dart');
    }
    var htmlEntryPoint = settings.configuration[_htmlEntryPointParam];
    return new AngularTransformer(new TransformerOptions(
        bootstrapEntryPoint, entryPoint, newEntryPoint, htmlEntryPoint));
  }

  bool isPrimary(AssetId id) =>
      options.entryPoint == id.path || options.htmlEntryPoint == id.path;

  Future apply(Transform transform) {
    log.init(transform);

    if (transform.primaryInput.id.path == options.entryPoint) {
      return _buildBootstrapFile(transform);
    } else if (transform.primaryInput.id.path == options.htmlEntryPoint) {
      return transformHtmlEntryPoint(options, transform);
    }
    return null;
  }

  Future _buildBootstrapFile(Transform transform) {
    var bootstrapEntryPointId = new AssetId(
        transform.primaryInput.id.package, options.bootstrapEntryPoint);
    var newEntryPointId =
        new AssetId(transform.primaryInput.id.package, options.newEntryPoint);
    return transform.hasInput(newEntryPointId).then((exists) {
      if (exists) {
        log.logger
            .error('New entry point file $newEntryPointId already exists.');
      } else {
        return _resolvers.get(transform).then((resolver) {
          try {
            new _BootstrapFileBuilder(resolver, transform,
                transform.primaryInput.id, bootstrapEntryPointId,
                newEntryPointId).run();
          } catch (err, stackTrace) {
            log.logger.error('${err}: ${stackTrace}',
                asset: bootstrapEntryPointId);
            rethrow;
          } finally {
            resolver.release();
          }
        });
      }
    });
  }
}

class _BootstrapFileBuilder {
  final Resolver _resolver;
  final Transform _transform;
  final AssetId _bootstrapEntryPoint;
  final AssetId _entryPoint;
  final AssetId _newEntryPoint;

  _BootstrapFileBuilder(Resolver resolver, Transform transform,
      this._entryPoint, this._bootstrapEntryPoint, this._newEntryPoint)
      : _resolver = resolver,
        _transform = transform;

  /// Adds the new entry point file to the transform. Should only be ran once.
  void run() {
    var entryLib = _resolver.getLibrary(_entryPoint);

    Set<BootstrapCallInfo> bootstrapCalls = findBootstrapCalls(
        _resolver, _resolver.getLibrary(_bootstrapEntryPoint));

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

    _transform.addOutput(new Asset.fromString(_newEntryPoint, codegen
        .codegenEntryPoint(context,
            entryPoint: entryLib, newEntryPoint: _newEntryPoint)));
  }
}
