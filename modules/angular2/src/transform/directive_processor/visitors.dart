library angular2.transform.directive_processor;

import 'package:analyzer/analyzer.dart';
import 'package:analyzer/src/generated/java_core.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/visitor_mixin.dart';

/// SourceVisitor designed to accept [ConstructorDeclaration] nodes.
class _CtorTransformVisitor extends ToSourceVisitor with VisitorMixin {
  bool _withParameterAnnotations = true;
  bool _withParameterTypes = true;
  bool _withParameterNames = true;
  final PrintWriter writer;

  /// Maps field names to their declared types. This is populated whenever
  /// the listener visits a [ConstructorDeclaration] node.
  final Map<String, TypeName> _fieldNameToType = {};

  _CtorTransformVisitor(PrintWriter writer)
      : this.writer = writer,
        super(writer);

  /// If [_withParameterTypes] is true, this method outputs [node]'s type. If
  /// [_withParameterNames] is true, this method outputs [node]'s identifier.
  Object _visitNormalFormalParameter(
      NodeList<Annotation> metadata, TypeName type, SimpleIdentifier name) {
    if (_withParameterAnnotations && metadata != null) {
      assert(_withParameterTypes);
      var suffix = type != null ? ', ' : '';
      visitNodeListWithSeparatorAndSuffix(metadata, ', ', suffix);
    }
    var needCompileTimeConstants = !_withParameterNames;
    if (_withParameterTypes && type != null) {
      visitNodeWithSuffix(type.name, ' ');
      if (!needCompileTimeConstants) {
        // Types with arguments are not compile-time constants.
        visitNodeWithSuffix(type.typeArguments, ' ');
      }
    }
    if (_withParameterNames) {
      visitNode(name);
    }
    return null;
  }

  void _buildFieldMap(ConstructorDeclaration node) {
    ClassDeclaration clazz =
        node.getAncestor((node) => node is ClassDeclaration);
    _fieldNameToType.clear();
    clazz.members
        .where((member) => member is FieldDeclaration)
        .forEach((FieldDeclaration field) {
      var type = field.fields.type;
      if (type != null) {
        field.fields.variables.forEach((VariableDeclaration decl) {
          _fieldNameToType[decl.name.toString()] = type;
        });
      }
    });
  }

  @override
  Object visitSimpleFormalParameter(SimpleFormalParameter node) {
    return _visitNormalFormalParameter(
        node.metadata, node.type, node.identifier);
  }

  @override
  Object visitFieldFormalParameter(FieldFormalParameter node) {
    if (node.parameters != null) {
      logger.error('Parameters in ctor not supported '
          '(${node.toSource()})');
    }
    var type = node.type;
    if (type == null) {
      type = _fieldNameToType[node.identifier.toString()];
    }
    return _visitNormalFormalParameter(node.metadata, type, node.identifier);
  }

  @override
  Object visitFunctionTypedFormalParameter(FunctionTypedFormalParameter node) {
    logger.error('Function typed formal parameters not supported '
        '(${node.toSource()})');
    return _visitNormalFormalParameter(node.metadata, null, node.identifier);
  }

  @override
  Object visitDefaultFormalParameter(DefaultFormalParameter node) {
    visitNode(node.parameter);
    // Ignore the declared default value.
    return null;
  }

  @override
  /// Overridden to avoid outputting grouping operators for default parameters.
  Object visitFormalParameterList(FormalParameterList node) {
    writer.print('(');
    NodeList<FormalParameter> parameters = node.parameters;
    int size = parameters.length;
    for (int i = 0; i < size; i++) {
      if (i > 0) {
        writer.print(', ');
      }
      parameters[i].accept(this);
    }
    writer.print(')');
    return null;
  }

  @override
  Object visitAnnotation(Annotation node) {
    var prefix =
        node.arguments != null && node.arguments.length > 0 ? 'const ' : '';
    visitNodeWithPrefix(prefix, node.name);
    visitNodeWithPrefix(".", node.constructorName);
    visitNode(node.arguments);
    return null;
  }
}

/// ToSourceVisitor designed to print 'parameters' values for Angular2's
/// [registerType] calls.
class ParameterTransformVisitor extends _CtorTransformVisitor {
  ParameterTransformVisitor(PrintWriter writer) : super(writer) {
    _withParameterNames = false;
    _withParameterTypes = true;
    _withParameterAnnotations = true;
  }

  @override
  Object visitConstructorDeclaration(ConstructorDeclaration node) {
    _buildFieldMap(node);
    writer.print('const [');
    visitNode(node.parameters);
    writer.print(']');
    return null;
  }

  @override
  Object visitFormalParameterList(FormalParameterList node) {
    NodeList<FormalParameter> parameters = node.parameters;
    int size = parameters.length;
    for (int i = 0; i < size; i++) {
      if (i > 0) {
        writer.print(', ');
      }
      // TODO(kegluneq): Include annotations on parameters.
      writer.print('const [');
      parameters[i].accept(this);
      writer.print(']');
    }
    return null;
  }
}

/// ToSourceVisitor designed to print 'factory' values for Angular2's
/// [registerType] calls.
class FactoryTransformVisitor extends _CtorTransformVisitor {
  FactoryTransformVisitor(PrintWriter writer) : super(writer) {
    _withParameterAnnotations = false;
  }

  @override
  Object visitConstructorDeclaration(ConstructorDeclaration node) {
    _buildFieldMap(node);
    _withParameterNames = true;
    _withParameterTypes = true;
    visitNode(node.parameters);
    writer.print(' => new ');
    visitNode(node.returnType);
    visitNodeWithPrefix(".", node.name);

    _withParameterTypes = false;
    visitNode(node.parameters);
    return null;
  }
}

/// ToSourceVisitor designed to print a [ClassDeclaration] node as a
/// 'annotations' value for Angular2's [registerType] calls.
class AnnotationsTransformVisitor extends ToSourceVisitor with VisitorMixin {
  final PrintWriter writer;
  AnnotationsTransformVisitor(PrintWriter writer)
      : this.writer = writer,
        super(writer);

  @override
  Object visitClassDeclaration(ClassDeclaration node) {
    writer.print('const [');
    var size = node.metadata.length;
    for (var i = 0; i < size; ++i) {
      if (i > 0) {
        writer.print(', ');
      }
      node.metadata[i].accept(this);
    }
    writer.print(']');
    return null;
  }

  @override
  Object visitAnnotation(Annotation node) {
    writer.print('const ');
    visitNode(node.name);
    visitNodeWithPrefix(".", node.constructorName);
    visitNode(node.arguments);
    return null;
  }
}
