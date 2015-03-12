library angular2.src.transform.reflection_remover.ast_tester;

import 'package:analyzer/src/generated/ast.dart';
import 'package:analyzer/src/generated/element.dart';

/// An object that checks for [ReflectionCapabilities] syntactically, that is,
/// without resolution information.
class AstTester {
  static const REFLECTION_CAPABILITIES_NAME = 'ReflectionCapabilities';

  const AstTester();

  bool isNewReflectionCapabilities(InstanceCreationExpression node) =>
      '${node.constructorName.type.name}' == REFLECTION_CAPABILITIES_NAME;

  bool isReflectionCapabilitiesImport(ImportDirective node) {
    return node.uri.stringValue.endsWith("reflection_capabilities.dart");
  }
}

/// An object that checks for [ReflectionCapabilities] using a fully resolved
/// Ast.
class ResolvedTester implements AstTester {
  final ClassElement _forbiddenClass;

  ResolvedTester(this._forbiddenClass);

  bool isNewReflectionCapabilities(InstanceCreationExpression node) {
    var typeElement = node.constructorName.type.name.bestElement;
    return typeElement != null && typeElement == _forbiddenClass;
  }

  bool isReflectionCapabilitiesImport(ImportDirective node) {
    return node.uriElement == _forbiddenClass.library;
  }
}
