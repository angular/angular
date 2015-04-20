library angular2.transform.reflection_remover.rewriter;

import 'package:analyzer/src/generated/ast.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';

import 'ast_tester.dart';
import 'codegen.dart';

class Rewriter {
  final String _code;
  final Codegen _codegen;
  final AstTester _tester;

  Rewriter(this._code, this._codegen, {AstTester tester})
      : _tester = tester == null ? const AstTester() : tester;

  /// Rewrites the provided code removing imports of the
  /// {@link ReflectionCapabilities} library and instantiations of
  /// {@link ReflectionCapabilities}, as detected by the (potentially) provided
  /// {@link AstTester}.
  ///
  /// To the extent possible, this method does not change line numbers or
  /// offsets in the provided code to facilitate debugging via source maps.
  String rewrite(CompilationUnit node) {
    if (node == null) throw new ArgumentError.notNull('node');

    var visitor = new _FindReflectionCapabilitiesVisitor(_tester);
    node.accept(visitor);
    if (visitor.reflectionCapabilityImports.isEmpty) {
      logger.error('Failed to find ${REFLECTION_CAPABILITIES_NAME} import.');
      return _code;
    }
    if (visitor.reflectionCapabilityAssignments.isEmpty) {
      logger.error('Failed to find ${REFLECTION_CAPABILITIES_NAME} '
          'instantiation.');
      return _code;
    }

    var compare = (AstNode a, AstNode b) => b.offset - a.offset;
    visitor.reflectionCapabilityImports.sort(compare);
    visitor.reflectionCapabilityAssignments.sort(compare);

    var importAdded = false;
    var buf = new StringBuffer();
    var idx = visitor.reflectionCapabilityImports.fold(0,
        (int lastIdx, ImportDirective node) {
      buf.write(_code.substring(lastIdx, node.offset));
      if ('${node.prefix}' == _codegen.prefix) {
        logger.warning(
            'Found import prefix "${_codegen.prefix}" in source file.'
            ' Transform may not succeed.');
      }
      buf.write(_commentedNode(node));
      if (!importAdded) {
        buf.write(_codegen.codegenImport());
        importAdded = true;
      }
      return node.end;
    });

    var setupAdded = false;
    idx = visitor.reflectionCapabilityAssignments.fold(idx,
        (int lastIdx, AssignmentExpression assignNode) {
      var node = assignNode;
      while (node.parent is ExpressionStatement) {
        node = node.parent;
      }
      buf.write(_code.substring(lastIdx, node.offset));
      buf.write(_commentedNode(node));
      if (!setupAdded) {
        buf.write(_codegen.codegenSetupReflectionCall(
            reflectorAssignment: assignNode));
        setupAdded = true;
      }
      return node.end;
    });
    if (idx < _code.length) buf.write(_code.substring(idx));
    return buf.toString();
  }

  String _commentedNode(AstNode node) {
    // TODO(kegluneq): Return commented code once we generate all needed code.
    return '/*${_code.substring(node.offset, node.end)}*/';
  }
}

/// Visitor responsible for rewriting the Angular 2 code which instantiates
/// {@link ReflectionCapabilities} and removing its associated import.
///
/// This breaks our dependency on dart:mirrors, which enables smaller code
/// size and better performance.
class _FindReflectionCapabilitiesVisitor extends Object
    with RecursiveAstVisitor<Object> {
  final reflectionCapabilityImports = new List<ImportDirective>();
  final reflectionCapabilityAssignments = new List<AssignmentExpression>();
  final AstTester _tester;

  _FindReflectionCapabilitiesVisitor(this._tester);

  @override
  Object visitImportDirective(ImportDirective node) {
    if (_tester.isReflectionCapabilitiesImport(node)) {
      reflectionCapabilityImports.add(node);
    }
    return null;
  }

  @override
  Object visitAssignmentExpression(AssignmentExpression node) {
    if (node.rightHandSide is InstanceCreationExpression &&
        _tester.isNewReflectionCapabilities(node.rightHandSide)) {
      reflectionCapabilityAssignments.add(node);
    }
    return super.visitAssignmentExpression(node);
  }

  @override
  Object visitInstanceCreationExpression(InstanceCreationExpression node) {
    if (_tester.isNewReflectionCapabilities(node) &&
        !reflectionCapabilityAssignments.contains(node.parent)) {
      logger.error('Unexpected format in creation of '
          '${REFLECTION_CAPABILITIES_NAME}');
    }
    return super.visitInstanceCreationExpression(node);
  }
}
