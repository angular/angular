library angular2.transform.reflection_remover.codegen;

import 'package:analyzer/src/generated/ast.dart';
import 'package:path/path.dart' as path;

import 'package:angular2/src/transform/common/names.dart';

class Codegen {
  static const _PREFIX_BASE = 'ngStaticInit';

  /// The prefix used to import our generated file.
  final String prefix;
  /// The import uris
  final Iterable<String> importUris;

  Codegen(String reflectionEntryPointPath, Iterable<String> newEntryPointPaths,
      {String prefix})
      : this.prefix = prefix == null ? _PREFIX_BASE : prefix,
        importUris = newEntryPointPaths.map((p) =>
            path.relative(p, from: path.dirname(reflectionEntryPointPath))) {
    if (this.prefix.isEmpty) throw new ArgumentError.value('(empty)', 'prefix');
  }

  /// Generates code to import the library containing the method which sets up
  /// Angular2 reflection statically.
  ///
  /// The code generated here should follow the example of code generated for
  /// an {@link ImportDirective} node.
  String codegenImport() {
    var count = 0;
    return importUris
        .map((importUri) => 'import \'${importUri}\' as ${prefix}${count++};')
        .join('');
  }

  /// Generates code to call the method which sets up Angular2 reflection
  /// statically.
  ///
  /// If `reflectorAssignment` is provided, it is expected to be the node
  /// representing the {@link ReflectionCapabilities} assignment, and we will
  /// attempt to parse the access of `reflector` from it so that `reflector` is
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

    var count = 0;
    return importUris
        .map((_) =>
            '${prefix}${count++}.${SETUP_METHOD_NAME}(${reflectorExpression});')
        .join('');
  }
}

/// A visitor whose job it is to find the access of `reflector`.
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
