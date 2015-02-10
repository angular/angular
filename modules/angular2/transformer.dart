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
import 'package:path/path.dart' as path;

import 'src/transform/html_transform.dart';
import 'src/transform/options.dart';

export 'src/transform/options.dart';

/// Removes the mirror-based initialization logic and replaces it with static
/// logic.
class AngularTransformer extends Transformer {
  final Resolvers _resolvers;
  final TransformerOptions options;

  AngularTransformer(this.options)
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

  String _writeAnnotationsProp(ClassElement el,
      Map<LibraryElement, String> libraryPrefixes) {
    var writer = new PrintStringWriter();
    var visitor = new _AnnotationsTransformVisitor(writer, libraryPrefixes);
    el.node.accept(visitor);
    return writer.toString();
  }

  String _writeFactoryProp(ConstructorElement ctor,
      Map<LibraryElement, String> libraryPrefixes) {
    if (ctor.node == null) {
      // This occurs when the class does not declare a constructor.
      var prefix = _getPrefixDot(libraryPrefixes, ctor.type.element.library);
      return '() => new ${prefix}${ctor.enclosingElement.displayName}()';
    } else {
      var writer = new PrintStringWriter();
      var visitor = new _FactoryTransformVisitor(writer, libraryPrefixes);
      ctor.node.accept(visitor);
      return writer.toString();
    }
  }

  String _writeParametersProp(ConstructorElement ctor,
                                  Map<LibraryElement, String> libraryPrefixes) {
    if (ctor.node == null) {
      // This occurs when the class does not declare a constructor.
      return 'const [const []]';
    } else {
      var writer = new PrintStringWriter();
      var visitor = new _ParameterTransformVisitor(writer, libraryPrefixes);
      ctor.node.accept(visitor);
      return writer.toString();
    }
  }

  _writeInitializer(_InitializerData data,
      Map<LibraryElement, String> libraryPrefixes, StringBuffer buffer) {
    final annotationElement = data.annotation.element;
    final element = data.element;

    if (annotationElement is! ConstructorElement) {
      _logger.error('Unsupported annotation type. '
          'Only constructors are supported as Directives.');
    }
    if (element is! ClassElement) {
      _logger.error('Directives can only be applied to classes.');
    }
    if (element.node is! ClassDeclaration) {
      _logger.error('Unsupported annotation type. '
          'Only class declarations are supported as Directives.');
    }
    final ConstructorElement ctor = element.unnamedConstructor;
    if (ctor == null) {
      _logger.error('No default constructor found for ${element.name}');
      return;
    }

    var elementString = '${libraryPrefixes[data.element.library]}.${element.name}';

    if (buffer.isEmpty) {
      buffer.write('reflector');
    }

    buffer
      ..writeln()
      ..writeln('..registerType(${elementString}, {')
      ..write('"factory": ${_writeFactoryProp(ctor, libraryPrefixes)},\n'
          '"parameters": ${_writeParametersProp(ctor, libraryPrefixes)},\n'
          '"annotations": ${_writeAnnotationsProp(element, libraryPrefixes)}\n'
          '})');
  }
}

String _getPrefixDot(Map<LibraryElement, String> libraryPrefixes,
                     LibraryElement lib) {
  var prefix = null;
  if (lib != null && !lib.isInSdk) {
    prefix = libraryPrefixes.putIfAbsent(lib, () => 'i${libraryPrefixes.length}');
  }
  return prefix == null ? '' : '${prefix}.';
}

/// Visitor providing common methods for concrete implementations.
abstract class _TransformVisitor extends ToSourceVisitor {

  final PrintWriter _writer;

  /// Map of [LibraryElement] to its associated prefix.
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
    // Make sure the identifier is prefixed if necessary.
    if (node.bestElement is ClassElementImpl ||
        node.bestElement is PropertyAccessorElement) {
      _writer
        ..print(_getPrefixDot(_libraryPrefixes, node.bestElement.library))
        ..print(node.token.lexeme);
    } else {
      return super.visitSimpleIdentifier(node);
    }
    return null;
  }
}

/// SourceVisitor designed to accept [ConstructorDeclaration] nodes.
class _CtorTransformVisitor extends _TransformVisitor {
  bool _withParameterTypes = true;
  bool _withParameterNames = true;

  _CtorTransformVisitor(PrintWriter writer, libraryPrefixes)
    : super(writer, libraryPrefixes);

  /// If [_withParameterTypes] is true, this method outputs [node]'s type
  /// (appropriately prefixed based on [_libraryPrefixes]. If
  /// [_withParameterNames] is true, this method outputs [node]'s identifier.
  Object _visitNormalFormalParameter(NormalFormalParameter node) {
    if (_withParameterTypes) {
      var paramType = node.element.type;
      var prefix = _getPrefixDot(_libraryPrefixes, paramType.element.library);
      _writer.print('${prefix}${paramType.displayName}');
      if (_withParameterNames) {
        _visitNodeWithPrefix(' ', node.identifier);
      }
    } else if (_withParameterNames) {
      _visitNode(node.identifier);
    }
    return null;
  }

  @override
  Object visitSimpleFormalParameter(SimpleFormalParameter node) {
    return _visitNormalFormalParameter(node);
  }

  @override
  Object visitFieldFormalParameter(FieldFormalParameter node) {
    if (node.parameters != null) {
      throw new Error('Parameters in ctor not supported '
      '(${super.visitFormalParameterList(node)}');
    }
    return _visitNormalFormalParameter(node);
  }

  @override
  Object visitDefaultFormalParameter(DefaultFormalParameter node) {
    _visitNode(node.parameter);
    return null;
  }

  @override
  /// Overridden to avoid outputting grouping operators for default parameters.
  Object visitFormalParameterList(FormalParameterList node) {
    _writer.print('(');
    NodeList<FormalParameter> parameters = node.parameters;
    int size = parameters.length;
    for (int i = 0; i < size; i++) {
      if (i > 0) {
        _writer.print(', ');
      }
      parameters[i].accept(this);
    }
    _writer.print(')');
    return null;
  }
}

/// ToSourceVisitor designed to print 'parameters' values for Angular2's
/// [registerType] calls.
class _ParameterTransformVisitor extends _CtorTransformVisitor {
  _ParameterTransformVisitor(PrintWriter writer, libraryPrefixes)
  : super(writer, libraryPrefixes);

  @override
  Object visitConstructorDeclaration(ConstructorDeclaration node) {
    _withParameterNames = false;
    _withParameterTypes = true;
    _writer.print('const [const [');
    _visitNode(node.parameters);
    _writer.print(']]');
    return null;
  }

  @override
  Object visitFormalParameterList(FormalParameterList node) {
    NodeList<FormalParameter> parameters = node.parameters;
    int size = parameters.length;
    for (int i = 0; i < size; i++) {
      if (i > 0) {
        _writer.print(', ');
      }
      parameters[i].accept(this);
    }
    return null;
  }
}

/// ToSourceVisitor designed to print 'factory' values for Angular2's
/// [registerType] calls.
class _FactoryTransformVisitor extends _CtorTransformVisitor {
  _FactoryTransformVisitor(PrintWriter writer, libraryPrefixes)
    : super(writer, libraryPrefixes);

  @override
  Object visitConstructorDeclaration(ConstructorDeclaration node) {
    _withParameterNames = true;
    _withParameterTypes = true;
    _visitNode(node.parameters);
    _writer.print(' => new ');
    _visitNode(node.returnType);
    _visitNodeWithPrefix(".", node.name);
    _withParameterTypes = false;
    _visitNode(node.parameters);
    return null;
  }
}

/// ToSourceVisitor designed to print a [ClassDeclaration] node as a
/// 'annotations' value for Angular2's [registerType] calls.
class _AnnotationsTransformVisitor extends _TransformVisitor {

  _AnnotationsTransformVisitor(PrintWriter writer, libraryPrefixes)
  : super(writer, libraryPrefixes);

  @override
  Object visitClassDeclaration(ClassDeclaration node) {
    _writer.print('const [');
    node.metadata.forEach((m) => m.accept(this));
    _writer.print(']');
    return null;
  }

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