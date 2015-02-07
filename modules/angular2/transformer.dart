// Copyright (c) 2015, the Dart project authors.  Please see the AUTHORS file
// for details. All rights reserved. Use of this source code is governed by a
// BSD-style license that can be found in the LICENSE file.
library angular2.transformer;

import 'dart:async';
import 'dart:collection' show Queue;
import 'package:analyzer/src/generated/ast.dart';
import 'package:analyzer/src/generated/element.dart';
import 'package:analyzer/src/generated/java_core.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/resolver.dart';
import 'package:html5lib/dom.dart' as dom;
import 'package:html5lib/parser.dart' show parse;
import 'package:path/path.dart' as path;

/// Removes the mirror-based initialization logic and replaces it with static
/// logic.
class AngularTransformer extends Transformer {
  final Resolvers _resolvers;
  final String _entryPoint;
  final String _newEntryPoint;
  final String _htmlEntryPoint;

  AngularTransformer(
      this._entryPoint, this._newEntryPoint, this._htmlEntryPoint)
      : _resolvers = new Resolvers.fromMock({
        // The list of types below is derived from:
        //   * types that are used internally by the resolver (see
        //   _initializeFrom in resolver.dart).
        // TODO(jakemac): Move this into code_transformers so it can be shared.
        'dart:core': '''
            library dart.core;
            class Object {}
            class Function {}
            class StackTrace {}
            class Symbol {}
            class Type {}

            class String extends Object {}
            class bool extends Object {}
            class num extends Object {}
            class int extends num {}
            class double extends num {}
            class DateTime extends Object {}
            class Null extends Object {}

            class Deprecated extends Object {
              final String expires;
              const Deprecated(this.expires);
            }
            const Object deprecated = const Deprecated("next release");
            class _Override { const _Override(); }
            const Object override = const _Override();
            class _Proxy { const _Proxy(); }
            const Object proxy = const _Proxy();

            class List<V> extends Object {}
            class Map<K, V> extends Object {}
            ''',
        'dart:html': '''
            library dart.html;
            class HtmlElement {}
            ''',
      });

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
    return new AngularTransformer(entryPoint, newEntryPoint, htmlEntryPoint);
  }

  bool isPrimary(AssetId id) =>
      _entryPoint == id.path || _htmlEntryPoint == id.path;

  Future apply(Transform transform) {
    if (transform.primaryInput.id.path == _entryPoint) {
      return _buildBootstrapFile(transform);
    } else if (transform.primaryInput.id.path == _htmlEntryPoint) {
      return _replaceEntryWithBootstrap(transform);
    }
    return null;
  }

  Future _buildBootstrapFile(Transform transform) {
    var newEntryPointId =
        new AssetId(transform.primaryInput.id.package, _newEntryPoint);
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

  Future _replaceEntryWithBootstrap(Transform transform) {
    // For now at least, _htmlEntryPoint, _entryPoint, and _newEntryPoint need
    // to be in the same folder.
    // TODO(jakemac): support package urls with _entryPoint or _newEntryPoint
    // in `lib`, and _htmlEntryPoint in another directory.
    var _expectedDir = path.split(_htmlEntryPoint)[0];
    if (_expectedDir != path.split(_entryPoint)[0] ||
        _expectedDir != path.split(_newEntryPoint)[0]) {
      transform.logger.error(
          '${_htmlEntryPointParam}, ${_entryPointParam}, and ${_newEntryPointParam} '
          ' (if supplied) all must be in the same top level directory.');
    }

    return transform.primaryInput.readAsString().then((String html) {
      var found = false;
      var doc = parse(html);
      var scripts = doc.querySelectorAll('script[type="application/dart"]');
      for (dom.Element script in scripts) {
        if (!_isEntryPointScript(script)) continue;
        script.attributes['src'] = _relativeDartEntryPath(_newEntryPoint);
        found = true;
      }
      if (!found) {
        transform.logger.error(
            'Unable to find script for $_entryPoint in $_htmlEntryPoint.');
      }
      return transform.addOutput(
          new Asset.fromString(transform.primaryInput.id, doc.outerHtml));
    });
  }

  // Checks if the src of this script tag is pointing at `_entryPoint`.
  bool _isEntryPointScript(dom.Element script) =>
      path.normalize(script.attributes['src']) ==
          _relativeDartEntryPath(_entryPoint);

  // The relative path from `_htmlEntryPoint` to `dartEntry`. You must ensure
  // that neither of these is null before calling this function.
  String _relativeDartEntryPath(String dartEntry) =>
      path.relative(dartEntry, from: path.dirname(_htmlEntryPoint));
}

/// Provides a mechanism for checking an element for the provided
/// [_annotationClass] and reporting the resulting (element, annotation) pairs.
class _AnnotationMatcher {
  /// Queue for annotations.
  final initQueue = new Queue<_InitializerData>();
  /// All the annotations we have seen for each element
  final _seenAnnotations = new Map<Element, Set<ElementAnnotation>>();

  /// The class we are searching for to populate [initQueue].
  final ClassElement _annotationClass;

  _AnnotationMatcher(this._annotationClass);

  /// Records all [_annotationClass] annotations and the [element]s they apply to.
  /// Returns [true] if 1) [element] is annotated with [_annotationClass] and
  /// 2) ([element], [_annotationClass]) has been seen previously.
  bool processAnnotations(ClassElement element) {
    var found = false;
    element.metadata.where((ElementAnnotation meta) {
      // Only process [_annotationClass]s.
      // TODO(tjblasi): Make this recognize non-ConstructorElement annotations.
      return meta.element is ConstructorElement &&
          _isAnnotationMatch(meta.element.returnType);
    }).where((ElementAnnotation meta) {
      // Only process ([element], [meta]) combinations we haven't seen previously.
      return !_seenAnnotations
          .putIfAbsent(element, () => new Set<ElementAnnotation>())
          .contains(meta);
    }).forEach((ElementAnnotation meta) {
      _seenAnnotations[element].add(meta);
      initQueue.addLast(new _InitializerData(element, meta));
      found = true;
    });
    return found;
  }

  /// Whether [type], its superclass, or one of its interfaces matches [_annotationClass].
  bool _isAnnotationMatch(InterfaceType type) {
    if (type == null || type.element == null) return false;
    if (type.element.type == _annotationClass.type) return true;
    if (_isAnnotationMatch(type.superclass)) return true;
    for (var interface in type.interfaces) {
      if (_isAnnotationMatch(interface)) return true;
    }
    return false;
  }
}

class _ImportTraversal {
  final _AnnotationMatcher _annotationMatcher;

  _ImportTraversal(this._annotationMatcher);

  /// Reads Initializer annotations on this library and all its dependencies in
  /// post-order.
  void traverse(LibraryElement library, [Set<LibraryElement> seen]) {
    if (seen == null) seen = new Set<LibraryElement>();
    seen.add(library);

    // Visit all our dependencies.
    for (var importedLibrary in _sortedLibraryImports(library)) {
      // Don't include anything from the sdk.
      if (importedLibrary.isInSdk) continue;
      if (seen.contains(importedLibrary)) continue;
      traverse(importedLibrary, seen);
    }

    for (var clazz in _classesOfLibrary(library, seen)) {
      var superClass = clazz.supertype;
      while (superClass != null) {
        if (_annotationMatcher.processAnnotations(superClass.element) &&
            superClass.element.library != clazz.library) {
          _logger.warning(
              'We have detected a cycle in your import graph when running '
              'initializers on ${clazz.name}. This means the super class '
              '${superClass.name} has a dependency on this library '
              '(possibly transitive).');
        }
        superClass = superClass.superclass;
      }
      _annotationMatcher.processAnnotations(clazz);
    }
  }

  /// Retrieves all classes that are visible if you were to import [lib]. This
  /// includes exported classes from other libraries.
  List<ClassElement> _classesOfLibrary(
      LibraryElement library, Set<LibraryElement> seen) {
    var result = [];
    result.addAll(library.units.expand((u) => u.types));
    for (var export in library.exports) {
      if (seen.contains(export.exportedLibrary)) continue;
      var exported = _classesOfLibrary(export.exportedLibrary, seen);
      _filter(exported, export.combinators);
      result.addAll(exported);
    }
    result.sort((a, b) => a.name.compareTo(b.name));
    return result;
  }

  /// Filters [elements] that come from an export, according to its show/hide
  /// combinators. This modifies [elements] in place.
  void _filter(List<Element> elements, List<NamespaceCombinator> combinators) {
    for (var c in combinators) {
      if (c is ShowElementCombinator) {
        var show = c.shownNames.toSet();
        elements.retainWhere((e) => show.contains(e.displayName));
      } else if (c is HideElementCombinator) {
        var hide = c.hiddenNames.toSet();
        elements.removeWhere((e) => hide.contains(e.displayName));
      }
    }
  }

  Iterable<LibraryElement> _sortedLibraryImports(LibraryElement library) =>
      (new List.from(library.imports)
    ..sort((ImportElement a, ImportElement b) {
      // dart: imports don't have a uri
      if (a.uri == null && b.uri != null) return -1;
      if (b.uri == null && a.uri != null) return 1;
      if (a.uri == null && b.uri == null) {
        return a.importedLibrary.name.compareTo(b.importedLibrary.name);
      }

      // package: imports next
      var aIsPackage = a.uri.startsWith('package:');
      var bIsPackage = b.uri.startsWith('package:');
      if (aIsPackage && !bIsPackage) {
        return -1;
      } else if (bIsPackage && !aIsPackage) {
        return 1;
      } else if (bIsPackage && aIsPackage) {
        return a.uri.compareTo(b.uri);
      }

      // And finally compare based on the relative uri if both are file paths.
      var aUri = path.relative(a.source.uri.path,
          from: path.dirname(library.source.uri.path));
      var bUri = path.relative(b.source.uri.path,
          from: path.dirname(library.source.uri.path));
      return aUri.compareTo(bUri);
    })).map((import) => import.importedLibrary);
}

class _BootstrapFileBuilder {
  final Resolver _resolver;
  final Transform _transform;
  final AssetId _entryPoint;
  final AssetId _newEntryPoint;

  _AnnotationMatcher _directiveInfo;

  final TransformLogger _logger;

  _BootstrapFileBuilder(Resolver resolver, Transform transform,
      this._entryPoint, this._newEntryPoint)
      : _resolver = resolver,
        _transform = transform,
        _logger = transform.logger,
        _directiveInfo = new _AnnotationMatcher(resolver
            .getLibrary(new AssetId(
                'angular2', 'lib/src/core/annotations/annotations.dart'))
            .getType('Directive'));

  /// Adds the new entry point file to the transform. Should only be ran once.
  void run() {
    var entryLib = _resolver.getLibrary(_entryPoint);
    new _ImportTraversal(_directiveInfo).traverse(entryLib);

    _transform.addOutput(
        new Asset.fromString(_newEntryPoint, _buildNewEntryPoint(entryLib)));
  }

  String _buildNewEntryPoint(LibraryElement entryLib) {
    var importsBuffer = new StringBuffer();
    var initializersBuffer = new StringBuffer();
    var libraryPrefixes = new Map<LibraryElement, String>();

    // Import the original entry point.
    libraryPrefixes[entryLib] = 'i0';

    while (_directiveInfo.initQueue.isNotEmpty) {
      var next = _directiveInfo.initQueue.removeFirst();

      libraryPrefixes.putIfAbsent(
          next.element.library, () => 'i${libraryPrefixes.length}');
      libraryPrefixes.putIfAbsent(
          next.annotation.element.library, () => 'i${libraryPrefixes.length}');

      _writeInitializer(next, libraryPrefixes, initializersBuffer);
    }
    libraryPrefixes
        .forEach((lib, prefix) => _writeImport(lib, prefix, importsBuffer));

    // TODO(jakemac): copyright and library declaration
    return '''
import 'package:angular2/src/reflection/reflection.dart' show reflector;
${importsBuffer}
main() {
$initializersBuffer;
i0.main();
}
''';
  }

  _writeImport(LibraryElement lib, String prefix, StringBuffer buffer) {
    AssetId id = (lib.source as dynamic).assetId;

    if (id.path.startsWith('lib/')) {
      var packagePath = id.path.replaceFirst('lib/', '');
      buffer.write("import 'package:${id.package}/${packagePath}'");
    } else if (id.package != _newEntryPoint.package) {
      _logger.error("Can't import `${id}` from `${_newEntryPoint}`");
    } else if (path.url.split(id.path)[0] ==
        path.url.split(_newEntryPoint.path)[0]) {
      var relativePath =
          path.relative(id.path, from: path.dirname(_newEntryPoint.path));
      buffer.write("import '${relativePath}'");
    } else {
      _logger.error("Can't import `${id}` from `${_newEntryPoint}`");
    }
    buffer.writeln(' as $prefix;');
  }

  _parameterList(
      ConstructorElement ctor, Map<LibraryElement, String> libraryPrefixes,
      {withTypes: true, withNames: true}) {
    var mapFunc;
    if (withTypes) {
      var getLibPrefix = (ParameterElement p) {
        if (p.type.element.library.isInSdk) {
          return '';
        }
        var libPrefix = libraryPrefixes.putIfAbsent(
            p.type.element.library, () => 'i${libraryPrefixes.length}');
        return libPrefix == null ? '' : '$libPrefix.';
      };
      if (withNames) {
        mapFunc =
            (p) => '${getLibPrefix(p)}${p.type.displayName} ${p.displayName}';
      } else {
        mapFunc = (p) => '${getLibPrefix(p)}${p.type.displayName}';
      }
    } else if (withNames) {
      mapFunc = (p) => p.displayName;
    }
    return mapFunc != null ? ctor.parameters.map(mapFunc).join(', ') : '';
  }

  String _writeAnnotationsProperty(ClassDeclaration node, Map<LibraryElement, String> libraryPrefixes) {
    var writer = new PrintStringWriter();
    writer.print('const [');
    var visitor = new _AnnotationsTransformVisitor(writer, libraryPrefixes);
    node.metadata.forEach((m) => m.accept(visitor));
    writer.print(']');
    return writer.toString();
  }

  _writeInitializer(_InitializerData data,
      Map<LibraryElement, String> libraryPrefixes, StringBuffer buffer) {
    final annotationElement = data.annotation.element;
    final element = data.element;

    // TODO(tjblasi): Include the "annotations" info
    //     [https://github.com/angular/angular/issues/496].
    //     Make sure the annotation type is imported.
    if (annotationElement is! ConstructorElement) {
      _logger.error('Unsupported annotation type. '
          'Only constructors are supported as Directives.');
    }
    var node = element.node;
    if (node is! ClassDeclaration) {
      _logger.error(
          'Unsupported annotation type. Only class declarations are supported as Directives.');
    }

    if (element is ClassElement) {
      var elementString = '${libraryPrefixes[data.element.library]}.${element.name}';
      final ConstructorElement ctor = element.constructors[0];
      if (buffer.isEmpty) {
        buffer.write('reflector');
      }
      buffer
        ..writeln()
        ..writeln('..registerType(${elementString}, {')
        ..write('"factory": (${_parameterList(ctor, libraryPrefixes)}) => '
            'new ${elementString}(${_parameterList(ctor, libraryPrefixes, withTypes: false)}),\n'
            '"parameters": const [const [${_parameterList(ctor, libraryPrefixes, withNames: false)}]],\n'
            '"annotations": ${_writeAnnotationsProperty(node, libraryPrefixes)}\n'
            '})');
    } else {
      _logger.error('Directives can only be applied to classes.');
    }
  }
}

class _TransformVisitor extends ToSourceVisitor {

  final PrintWriter _writer;
  final Map<LibraryElement, String> _libraryPrefixes;

  _TransformVisitor(PrintWriter writer, this._libraryPrefixes)
  : this._writer = writer, super(writer);

  /// Safely visit the given node.
  /// @param node the node to be visited
  void _visitNode(AstNode node) {
    if (node != null) {
      node.accept(this);
    }
  }

  String _getPrefixDot(LibraryElement lib) {
    var prefix = null;
    if (lib != null && !lib.isInSdk) {
      prefix = _libraryPrefixes.putIfAbsent(lib, () => 'i${_libraryPrefixes.length}');
    }
    return prefix == null ? '' : '${prefix}.';
  }

  /**
   * Safely visit the given node, printing the prefix before the node if it is non-`null`.
   *
   * @param prefix the prefix to be printed if there is a node to visit
   * @param node the node to be visited
   */
  void _visitNodeWithPrefix(String prefix, AstNode node) {
    if (node != null) {
      _writer.print(prefix);
      node.accept(this);
    }
  }

  /**
   * Safely visit the given node, printing the suffix after the node if it is non-`null`.
   *
   * @param suffix the suffix to be printed if there is a node to visit
   * @param node the node to be visited
   */
  void _visitNodeWithSuffix(AstNode node, String suffix) {
    if (node != null) {
      node.accept(this);
      _writer.print(suffix);
    }
  }

  @override
  Object visitSimpleIdentifier(SimpleIdentifier node) {
    if (node.bestElement is ClassElementImpl) {
      _writer
        ..print(_getPrefixDot(node.bestElement.library))
        ..print(node.token.lexeme);
    } else {
      return super.visitSimpleIdentifier(node);
    }
    return null;
  }
}

class _AnnotationsTransformVisitor extends _TransformVisitor {

  _AnnotationsTransformVisitor(PrintWriter writer, libraryPrefixes)
  : super(writer, libraryPrefixes);

  @override
  Object visitAnnotation(Annotation node) {
    _writer.print('const ');
    _visitNode(node.name);
//     TODO(tjblasi): Do we need to handle named constructors for annotations?
//    _visitNodeWithPrefix(".", node.constructorName);
    _visitNode(node.arguments);
    return null;
  }
}

// Element/ElementAnnotation pair.
class _InitializerData {
  final Element element;
  final ElementAnnotation annotation;

  _InitializerData(this.element, this.annotation);
}
