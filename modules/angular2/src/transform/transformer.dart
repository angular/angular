// Copyright (c) 2015, the Dart project authors.  Please see the AUTHORS file
// for details. All rights reserved. Use of this source code is governed by a
// BSD-style license that can be found in the LICENSE file.
library angular2.transformer;

import 'dart:async';
import 'package:barback/barback.dart';
import 'package:code_transformers/resolver.dart';

import 'annotation_processor.dart';
import 'codegen.dart' as codegen;
import 'html_transform.dart';
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

  static const _entryPointParam = 'entry_point';
  static const _newEntryPointParam = 'new_entry_point';
  static const _htmlEntryPointParam = 'html_entry_point';

  factory AngularTransformer.asPlugin(BarbackSettings settings) {
    var entryPoint = settings.configuration[_entryPointParam];
    var newEntryPoint = settings.configuration[_newEntryPointParam];
    if (newEntryPoint == null) {
      newEntryPoint = entryPoint.replaceFirst('.dart', '.bootstrap.dart');
    }
    var htmlEntryPoint = settings.configuration[_htmlEntryPointParam];
    return new AngularTransformer(
        new TransformerOptions(entryPoint, newEntryPoint, htmlEntryPoint));
  }

  bool isPrimary(AssetId id) =>
      options.entryPoint == id.path || options.htmlEntryPoint == id.path;

  Future apply(Transform transform) {
    if (transform.primaryInput.id.path == options.entryPoint) {
      return _buildBootstrapFile(transform);
    } else if (transform.primaryInput.id.path == options.htmlEntryPoint) {
      return transformHtmlEntryPoint(options, transform);
    }
    return null;
  }

  Future _buildBootstrapFile(Transform transform) {
    var newEntryPointId =
        new AssetId(transform.primaryInput.id.package, options.newEntryPoint);
    return transform.hasInput(newEntryPointId).then((exists) {
      if (exists) {
        transform.logger
            .error('New entry point file $newEntryPointId already exists.');
      } else {
        return _resolvers.get(transform).then((resolver) {
          new _BootstrapFileBuilder(resolver, transform,
              transform.primaryInput.id, newEntryPointId).run();
          resolver.release();
        });
      }
    });
  }
}

class _BootstrapFileBuilder {
  final Resolver _resolver;
  final Transform _transform;
  final AssetId _entryPoint;
  final AssetId _newEntryPoint;

  AnnotationMatcher _directiveInfo;

  _BootstrapFileBuilder(Resolver resolver, Transform transform,
      this._entryPoint, this._newEntryPoint)
      : _resolver = resolver,
        _transform = transform,
        _directiveInfo = new AnnotationMatcher(resolver
            .getLibrary(new AssetId(
                'angular2', 'lib/src/core/annotations/annotations.dart'))
            .getType('Directive'));

  /// Adds the new entry point file to the transform. Should only be ran once.
  void run() {
    var entryLib = _resolver.getLibrary(_entryPoint);

    new ImportTraversal(_directiveInfo).traverse(entryLib);

    var context = new codegen.Context(logger: _transform.logger);
    _directiveInfo.initQueue
        .forEach((entry) => context.directiveRegistry.register(entry));

    _transform.addOutput(new Asset.fromString(_newEntryPoint, codegen
        .codegenEntryPoint(context,
            entryPoint: entryLib, newEntryPoint: _newEntryPoint)));
  }
}
