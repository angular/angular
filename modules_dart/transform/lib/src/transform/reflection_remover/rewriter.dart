library angular2.transform.reflection_remover.rewriter;

import 'package:analyzer/src/generated/ast.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/mirror_matcher.dart';
import 'package:angular2/src/transform/common/mirror_mode.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:path/path.dart' as path;

import 'codegen.dart';

class Rewriter {
  final String _code;
  final Codegen _codegen;
  final MirrorMatcher _mirrorMatcher;
  final MirrorMode _mirrorMode;
  final bool _writeStaticInit;

  Rewriter(this._code, this._codegen,
      {MirrorMatcher mirrorMatcher,
      MirrorMode mirrorMode: MirrorMode.none,
      bool writeStaticInit: true})
      : _mirrorMode = mirrorMode,
        _writeStaticInit = writeStaticInit,
        _mirrorMatcher =
            mirrorMatcher == null ? const MirrorMatcher() : mirrorMatcher;

  /// Rewrites the provided code removing imports of the
  /// {@link ReflectionCapabilities} library and instantiations of
  /// {@link ReflectionCapabilities}, as detected by the (potentially) provided
  /// {@link MirrorMatcher}.
  ///
  /// To the extent possible, this method does not change line numbers or
  /// offsets in the provided code to facilitate debugging via source maps.
  String rewrite(CompilationUnit node) {
    if (node == null) throw new ArgumentError.notNull('node');

    var visitor = new _RewriterVisitor(this);

    node.accept(visitor);

    return visitor.outputRewrittenCode();
  }
}

/// Visitor responsible for rewriting the Angular 2 code which instantiates
/// {@link ReflectionCapabilities} and removing its associated import.
///
/// This breaks our dependency on dart:mirrors, which enables smaller code
/// size and better performance.
class _RewriterVisitor extends Object with RecursiveAstVisitor<Object> {
  final Rewriter _rewriter;
  final buf = new StringBuffer();
  final reflectionCapabilityAssignments = [];

  int _currentIndex = 0;
  bool _setupAdded = false;
  bool _importAdded = false;

  _RewriterVisitor(this._rewriter);

  @override
  Object visitImportDirective(ImportDirective node) {
    buf.write(_rewriter._code.substring(_currentIndex, node.offset));
    _currentIndex = node.offset;
    if (_rewriter._mirrorMatcher.hasReflectionCapabilitiesUri(node)) {
      _rewriteReflectionCapabilitiesImport(node);
    } else if (_rewriter._mirrorMatcher.hasBootstrapUri(node)) {
      _rewriteBootstrapImportToStatic(node);
    }
    if (!_importAdded && _rewriter._writeStaticInit) {
      // Add imports for ng_deps (once)
      buf.write(_rewriter._codegen.codegenImport());
      _importAdded = true;
    }
    return null;
  }

  @override
  Object visitAssignmentExpression(AssignmentExpression node) {
    if (node.rightHandSide is InstanceCreationExpression &&
        _rewriter._mirrorMatcher
            .isNewReflectionCapabilities(node.rightHandSide)) {
      reflectionCapabilityAssignments.add(node);
      _rewriteReflectionCapabilitiesAssignment(node);
    }
    return super.visitAssignmentExpression(node);
  }

  @override
  Object visitInstanceCreationExpression(InstanceCreationExpression node) {
    if (_rewriter._mirrorMatcher.isNewReflectionCapabilities(node) &&
        !reflectionCapabilityAssignments.contains(node.parent)) {
      log.error('Unexpected format in creation of '
          '${REFLECTION_CAPABILITIES_NAME}');
    }
    return super.visitInstanceCreationExpression(node);
  }

  @override
  Object visitMethodInvocation(MethodInvocation node) {
    if (node.methodName.toString() == BOOTSTRAP_NAME) {
      _rewriteBootstrapCallToStatic(node);
    }
    return super.visitMethodInvocation(node);
  }

  String outputRewrittenCode() {
    if (_currentIndex < _rewriter._code.length) {
      buf.write(_rewriter._code.substring(_currentIndex));
    }
    return '$buf';
  }

  _rewriteBootstrapImportToStatic(ImportDirective node) {
    if (_rewriter._writeStaticInit) {
      // rewrite bootstrap import to its static version.
      buf.write(_rewriter._code.substring(_currentIndex, node.offset));
      // TODO(yjbanov): handle import "..." show/hide ...
      buf.write("import '$BOOTSTRAP_STATIC_URI';");
    } else {
      // leave it as is
      buf.write(_rewriter._code.substring(_currentIndex, node.end));
    }
    _currentIndex = node.end;
  }

  _rewriteBootstrapCallToStatic(MethodInvocation node) {
    if (_rewriter._writeStaticInit) {
      buf.write(_rewriter._code.substring(_currentIndex, node.offset));

      var args = node.argumentList.arguments;
      int numArgs = node.argumentList.arguments.length;
      if (numArgs < 1 || numArgs > 2) {
        log.warning('`bootstrap` does not support $numArgs arguments. '
            'Found bootstrap${node.argumentList}. Transform may not succeed.');
      }

      var reflectorInit =
          _setupAdded ? '' : ', () { ${_getStaticReflectorInitBlock()} }';

      // rewrite `bootstrap(...)` to `bootstrapStatic(...)`
      buf.write('$BOOTSTRAP_STATIC_NAME(${args[0]}');
      if (numArgs == 1) {
        // bootstrap args are positional, so before we pass reflectorInit code
        // we need to pass `null` for DI bindings.
        if (reflectorInit.isNotEmpty) {
          buf.write(', null');
        }
      } else {
        // pass DI bindings
        buf.write(', ${args[1]}');
      }
      buf.write(reflectorInit);
      buf.write(')');
      _setupAdded = true;
    } else {
      // leave it as is
      buf.write(_rewriter._code.substring(_currentIndex, node.end));
    }
    _currentIndex = node.end;
  }

  String _getStaticReflectorInitBlock() {
    return _rewriter._codegen.codegenSetupReflectionCall();
  }

  _rewriteReflectionCapabilitiesImport(ImportDirective node) {
    buf.write(_rewriter._code.substring(_currentIndex, node.offset));
    if ('${node.prefix}' == _rewriter._codegen.prefix) {
      log.warning(
          'Found import prefix "${_rewriter._codegen.prefix}" in source file.'
          ' Transform may not succeed.');
    }
    if (_rewriter._mirrorMode != MirrorMode.none) {
      buf.write(_importDebugReflectionCapabilities(node));
    } else {
      buf.write(_commentedNode(node));
    }
    _currentIndex = node.end;
  }

  _rewriteReflectionCapabilitiesAssignment(AssignmentExpression assignNode) {
    var node = assignNode;
    while (node.parent is ExpressionStatement) {
      node = node.parent;
    }
    buf.write(_rewriter._code.substring(_currentIndex, node.offset));
    if (_rewriter._writeStaticInit && !_setupAdded) {
      buf.write(_getStaticReflectorInitBlock());
      _setupAdded = true;
    }
    switch (_rewriter._mirrorMode) {
      case MirrorMode.debug:
        buf.write(node);
        break;
      case MirrorMode.verbose:
        buf.write(_instantiateVerboseReflectionCapabilities(assignNode));
        break;
      case MirrorMode.none:
      default:
        buf.write(_commentedNode(node));
        break;
    }
    _currentIndex = node.end;
  }

  String _commentedNode(AstNode node) {
    return '/*${_rewriter._code.substring(node.offset, node.end)}*/';
  }
}

String _importDebugReflectionCapabilities(ImportDirective node) {
  var uri = '${node.uri}';
  uri = path
      .join(path.dirname(uri), 'debug_${path.basename(uri)}')
      .replaceAll('\\', '/');
  var asClause = node.prefix != null ? ' as ${node.prefix}' : '';
  return 'import $uri$asClause;';
}

String _instantiateVerboseReflectionCapabilities(
    AssignmentExpression assignNode) {
  if (assignNode.rightHandSide is! InstanceCreationExpression) {
    return '$assignNode;';
  }
  var rhs = (assignNode.rightHandSide as InstanceCreationExpression);
  return '${assignNode.leftHandSide} ${assignNode.operator} '
      'new ${rhs.constructorName}(verbose: true);';
}
