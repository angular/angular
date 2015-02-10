library angular2.transformer;

import 'package:analyzer/src/generated/ast.dart';
import 'package:analyzer/src/generated/element.dart';
import 'package:analyzer/src/generated/java_core.dart';

String codegenClassTypeString(ClassElement el,
                              Map<LibraryElement, String> libraryPrefixes) {
  return '${_getPrefixDot(libraryPrefixes, el.library)}${el.name}';
}

/// Creates the 'annotations' property for the Angular2 [registerType] call
/// for [el].
String codegenAnnotationsProp(ClassElement el,
                             Map<LibraryElement, String> libraryPrefixes) {
  var writer = new PrintStringWriter();
  var visitor = new _AnnotationsTransformVisitor(writer, libraryPrefixes);
  el.node.accept(visitor);
  return writer.toString();
}

/// Creates the 'factory' property for the Angular2 [registerType] call
/// for [ctor].
String codegenFactoryProp(ConstructorElement ctor,
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

/// Creates the 'parameters' property for the Angular2 [registerType] call
/// for [ctor].
String codegenParametersProp(ConstructorElement ctor,
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

String _getPrefixDot(Map<LibraryElement, String> libraryPrefixes,
                     LibraryElement lib) {
  var prefix = lib != null && !lib.isInSdk
      ? libraryPrefixes.putIfAbsent(lib, () => 'i${libraryPrefixes.length}')
      : null;
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