import 'package:analyzer/src/generated/ast.dart';
import 'package:analyzer/src/generated/element.dart';
import 'package:code_transformers/resolver.dart';

import 'resolvers.dart';

/// Finds all calls to the Angular2 [bootstrap] method defined in [library].
/// This only searches the code defined in the file
// represented by [library], not `part`s, `import`s, `export`s, etc.
Set<BootstrapCallInfo> findBootstrapCalls(
    Resolver resolver, LibraryElement library) {
  var types = new Angular2Types(resolver);
  if (types.bootstrapMethod == null) {
    throw new ArgumentError(
        'Could not find symbol for ${bootstrapMethodName}.');
  }
  var visitor = new _FindFunctionVisitor(types.bootstrapMethod);

  // TODO(kegluneq): Determine how to get nodes without querying Element#node.
  // Root of file defining that library (main part).
  library.definingCompilationUnit.node.accept(visitor);

  return new Set.from(visitor.functionCalls.map((MethodInvocation mi) {
    var visitor = new _ParseBootstrapTypeVisitor(types);
    if (mi.argumentList.arguments.isEmpty) {
      throw new ArgumentError('No arguments provided to `bootstrap`.');
    }
    mi.argumentList.arguments[0].accept(visitor);
    if (visitor.bootstrapType == null) {
      throw new UnsupportedError(
          'Failed to parse `bootstrap` call: ${mi.toSource()}');
    }
    return new BootstrapCallInfo(mi, visitor.bootstrapType);
  }));
}

/// Information about a single call to Angular2's [bootstrap] method.
class BootstrapCallInfo {
  /// The [AstNode] representing the call to [bootstrap].
  final MethodInvocation call;

  /// The type, which should be annotated as a [Component], which is the root
  /// of the Angular2 app.
  final ClassElement bootstrapType;

  BootstrapCallInfo(this.call, this.bootstrapType);
}

/// Visitor that finds the Angular2 bootstrap component given [bootstrap]'s
/// first argument.
///
/// This visitor does not recursively visit nodes in the Ast.
class _ParseBootstrapTypeVisitor extends SimpleAstVisitor<Object> {
  ClassElement bootstrapType = null;

  final Angular2Types _types;

  _ParseBootstrapTypeVisitor(this._types);

  // TODO(kegluneq): Allow non-SimpleIdentifier expressions.

  @override
  Object visitSimpleIdentifier(SimpleIdentifier e) {
    bootstrapType = (e.bestElement as ClassElement);
    if (!_types.isComponent(bootstrapType)) {
      throw new ArgumentError('Class passed to `${bootstrapMethodName}` must '
          'be a @${_types.componentAnnotation.name}');
    }
  }
}

/// Recursively visits all nodes in an Ast structure, recording all encountered
/// calls to the provided [FunctionElement].
class _FindFunctionVisitor extends UnifyingAstVisitor<Object> {
  final FunctionElement _target;
  _FindFunctionVisitor(this._target);

  final Set<MethodInvocation> functionCalls = new Set();

  bool _isDesiredMethod(MethodInvocation node) {
    return node.methodName.bestElement == _target;
  }

  @override
  Object visitMethodInvocation(MethodInvocation node) {
    if (_isDesiredMethod(node)) {
      functionCalls.add(node);
    }
    return super.visitMethodInvocation(node);
  }
}
