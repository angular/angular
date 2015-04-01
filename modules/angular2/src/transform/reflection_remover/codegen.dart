library angular2.transform.reflection_remover.codegen;

import 'package:analyzer/src/generated/ast.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/resolver.dart';
import 'package:path/path.dart' as path;

import 'package:angular2/src/transform/common/names.dart';

class Codegen {
  static const _PREFIX_BASE = 'ngStaticInit';

  /// The prefix used to import our generated file.
  final String prefix;
  /// The import uri
  final String importUri;

  Codegen(String reflectionEntryPointPath, String newEntryPointPath,
      {String prefix})
      : this.prefix = prefix == null ? _PREFIX_BASE : prefix,
        importUri = path.relative(newEntryPointPath,
            from: path.dirname(reflectionEntryPointPath)) {
    if (this.prefix.isEmpty) throw new ArgumentError.value('(empty)', 'prefix');
  }

  factory Codegen.fromResolver(
      Resolver resolver, AssetId reflectionEntryPoint, AssetId newEntryPoint) {
    var lib = resolver.getLibrary(reflectionEntryPoint);
    var prefix = _PREFIX_BASE;
    var idx = 0;
    while (lib.imports.any((import) {
      return import.prefix != null && import.prefix == prefix;
    })) {
      prefix = '${_PREFIX_BASE}${idx++}';
    }

    return new Codegen(reflectionEntryPoint, newEntryPoint, prefix: prefix);
  }

  /// Generates code to import the library containing the method which sets up
  /// Angular2 reflection statically.
  ///
  /// The code generated here should follow the example of code generated for
  /// an [ImportDirective] node.
  String codegenImport() {
    return 'import \'${importUri}\' as ${prefix};';
  }

  /// Generates code to call the method which sets up Angular2 reflection
  /// statically.
  ///
  /// If [reflectorAssignment] is provided, it is expected to be the node
  /// representing the [ReflectionCapabilities] assignment, and we will
  /// attempt to parse the access of [reflector] from it so that [reflector] is
  /// properly prefixed if necessary.
  String codegenSetupReflectionCall(
      {AssignmentExpression reflectorAssignment}) {
    var reflectorExpression = null;
    if (reflectorAssignment != null) {
      reflectorExpression = reflectorAssignment.accept(new _ReflectorVisitor());
    }
    if (reflectorExpression == null) {
      reflectorExpression = 'reflector';
    }

    return '${prefix}.${SETUP_METHOD_NAME}(${reflectorExpression});';
  }
}

/// A visitor whose job it is to find the access of [reflector].
class _ReflectorVisitor extends Object with SimpleAstVisitor<Expression> {
  @override
  Expression visitAssignmentExpression(AssignmentExpression node) {
    if (node == null || node.leftHandSide == null) return null;
    return node.leftHandSide.accept(this);
  }

  @override
  Expression visitPropertyAccess(PropertyAccess node) {
    if (node == null || node.target == null) return null;
    return node.target;
  }

  @override
  Expression visitPrefixedIdentifier(PrefixedIdentifier node) {
    if (node == null || node.prefix == null) return null;
    return node.prefix;
  }
}
