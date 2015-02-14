library angular2.transformer;

import 'package:analyzer/src/generated/ast.dart';
import 'package:analyzer/src/generated/element.dart';
import 'package:analyzer/src/generated/java_core.dart';
import 'package:barback/barback.dart' show AssetId, TransformLogger;
import 'package:dart_style/dart_style.dart';
import 'package:path/path.dart' as path;

import 'annotation_processor.dart';

/// Base class that maintains codegen state.
class Context {
  final TransformLogger _logger;
  /// Maps libraries to the import prefixes we will use in the newly
  /// generated code.
  final Map<LibraryElement, String> _libraryPrefixes;

  DirectiveRegistry _directiveRegistry;
  DirectiveRegistry get directiveRegistry => _directiveRegistry;

  Context({TransformLogger logger})
      : _logger = logger,
        _libraryPrefixes = {} {
    _directiveRegistry = new _DirectiveRegistryImpl(this);
  }

  void error(String errorString) {
    if (_logger != null) {
      _logger.error(errorString);
    } else {
      throw new Error(errorString);
    }
  }

  /// If elements in [lib] should be prefixed in our generated code, returns
  /// the appropriate prefix followed by a `.`. Future items from the same
  /// library will use the same prefix.
  /// If [lib] does not need a prefix, returns the empty string.
  String _getPrefixDot(LibraryElement lib) {
    var prefix = lib != null && !lib.isInSdk
        ? _libraryPrefixes.putIfAbsent(lib, () => 'i${_libraryPrefixes.length}')
        : null;
    return prefix == null ? '' : '${prefix}.';
  }
}

abstract class DirectiveRegistry {
  // Adds [entry] to the `registerType` calls which will be generated.
  void register(AnnotationMatch entry);
}

const _reflectorImport =
    'import \'package:angular2/src/reflection/reflection.dart\' '
    'show reflector;';

/// Default implementation to map from [LibraryElement] to [AssetId]. This
/// assumes that [el.source] has a getter called [assetId].
AssetId _assetIdFromLibraryElement(LibraryElement el) {
  return (el.source as dynamic).assetId;
}

String codegenEntryPoint(Context context,
    {LibraryElement entryPoint, AssetId newEntryPoint}) {
  // This must be called prior to [codegenImports] or the entry point
  // library will not be imported.
  var entryPointPrefix = context._getPrefixDot(entryPoint);
  // TODO(jakemac): copyright and library declaration
  var outBuffer = new StringBuffer(_reflectorImport);
  _codegenImports(context, newEntryPoint, outBuffer);
  outBuffer
    ..write('main() {')
    ..write(context.directiveRegistry.toString())
    ..write('${entryPointPrefix}main();}');

  return new DartFormatter().format(outBuffer.toString());
}

String _codegenImports(
    Context context, AssetId newEntryPoint, StringBuffer buffer) {
  context._libraryPrefixes.forEach((lib, prefix) {
    buffer
      ..write(_codegenImport(
          context, _assetIdFromLibraryElement(lib), newEntryPoint))
      ..writeln('as ${prefix};');
  });
}

_codegenImport(Context context, AssetId libraryId, AssetId entryPoint) {
  if (libraryId.path.startsWith('lib/')) {
    var packagePath = libraryId.path.replaceFirst('lib/', '');
    return "import 'package:${libraryId.package}/${packagePath}'";
  } else if (libraryId.package != entryPoint.package) {
    context._error("Can't import `${libraryId}` from `${entryPoint}`");
  } else if (path.url.split(libraryId.path)[0] ==
      path.url.split(entryPoint.path)[0]) {
    var relativePath =
        path.relative(libraryId.path, from: path.dirname(entryPoint.path));
    return "import '${relativePath}'";
  } else {
    context._error("Can't import `${libraryId}` from `${entryPoint}`");
  }
}

class _DirectiveRegistryImpl implements DirectiveRegistry {
  final Context _context;
  final StringBuffer _buffer = new StringBuffer();

  _DirectiveRegistryImpl(this._context);

  @override
  String toString() {
    return _buffer.isEmpty ? '' : 'reflector${_buffer};';
  }

  // Adds [entry] to the `registerType` calls which will be generated.
  void register(AnnotationMatch entry) {
    var element = entry.element;
    var annotation = entry.annotation;

    if (annotation.element is! ConstructorElement) {
      _context._error('Unsupported annotation type. '
          'Only constructors are supported as Directives.');
      return;
    }
    if (element is! ClassElement) {
      _context._error('Directives can only be applied to classes.');
      return;
    }
    if (element.node is! ClassDeclaration) {
      _context._error('Unsupported annotation type. '
          'Only class declarations are supported as Directives.');
      return;
    }
    final ConstructorElement ctor = element.unnamedConstructor;
    if (ctor == null) {
      _context._error('No default constructor found for ${element.name}');
      return;
    }

    _buffer.writeln('..registerType(${_codegenClassTypeString(element)}, {'
        '"factory": ${_codegenFactoryProp(ctor)},'
        '"parameters": ${_codegenParametersProp(ctor)},'
        '"annotations": ${_codegenAnnotationsProp(element)}'
        '})');
  }

  String _codegenClassTypeString(ClassElement el) {
    return '${_context._getPrefixDot(el.library)}${el.name}';
  }

  /// Creates the 'annotations' property for the Angular2 [registerType] call
  /// for [el].
  String _codegenAnnotationsProp(ClassElement el) {
    var writer = new PrintStringWriter();
    var visitor = new _AnnotationsTransformVisitor(writer, _context);
    el.node.accept(visitor);
    return writer.toString();
  }

  /// Creates the 'factory' property for the Angular2 [registerType] call
  /// for [ctor].
  String _codegenFactoryProp(ConstructorElement ctor) {
    if (ctor.node == null) {
      // This occurs when the class does not declare a constructor.
      var prefix = _context._getPrefixDot(ctor.type.element.library);
      return '() => new ${prefix}${ctor.enclosingElement.displayName}()';
    } else {
      var writer = new PrintStringWriter();
      var visitor = new _FactoryTransformVisitor(writer, _context);
      ctor.node.accept(visitor);
      return writer.toString();
    }
  }

  /// Creates the 'parameters' property for the Angular2 [registerType] call
  /// for [ctor].
  String _codegenParametersProp(ConstructorElement ctor) {
    if (ctor.node == null) {
      // This occurs when the class does not declare a constructor.
      return 'const [const []]';
    } else {
      var writer = new PrintStringWriter();
      var visitor = new _ParameterTransformVisitor(writer, _context);
      ctor.node.accept(visitor);
      return writer.toString();
    }
  }
}

/// Visitor providing common methods for concrete implementations.
abstract class _TransformVisitor extends ToSourceVisitor {
  final Context _context;
  final PrintWriter _writer;

  _TransformVisitor(PrintWriter writer, this._context)
      : this._writer = writer,
        super(writer);

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
        ..print(_context._getPrefixDot(node.bestElement.library))
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

  _CtorTransformVisitor(PrintWriter writer, Context _context)
      : super(writer, _context);

  /// If [_withParameterTypes] is true, this method outputs [node]'s type
  /// (appropriately prefixed based on [_libraryPrefixes]. If
  /// [_withParameterNames] is true, this method outputs [node]'s identifier.
  Object _visitNormalFormalParameter(NormalFormalParameter node) {
    if (_withParameterTypes) {
      var paramType = node.element.type;
      var prefix = _context._getPrefixDot(paramType.element.library);
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
      _context.error('Parameters in ctor not supported '
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
  _ParameterTransformVisitor(PrintWriter writer, Context _context)
      : super(writer, _context);

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
  _FactoryTransformVisitor(PrintWriter writer, Context _context)
      : super(writer, _context);

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
  _AnnotationsTransformVisitor(PrintWriter writer, Context _context)
      : super(writer, _context);

  @override
  Object visitClassDeclaration(ClassDeclaration node) {
    _writer.print('const [');
    var size = node.metadata.length;
    for (var i = 0; i < size; ++i) {
      if (i > 0) {
        _writer.print(', ');
      }
      node.metadata[i].accept(this);
    }
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
