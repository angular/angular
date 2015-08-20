library angular2.transform.reflection_remover.ast_tester;

import 'package:analyzer/src/generated/ast.dart';
import 'package:analyzer/src/generated/element.dart';
import 'package:angular2/src/transform/common/names.dart';

/// An object that checks for {@link ReflectionCapabilities} syntactically, that is,
/// without resolution information.
class AstTester {
  const AstTester();

  bool isNewReflectionCapabilities(InstanceCreationExpression node) =>
      '${node.constructorName.type.name}' == REFLECTION_CAPABILITIES_NAME;

  bool isReflectionCapabilitiesImport(ImportDirective node) {
    return node.uri.stringValue ==
        "package:angular2/src/reflection/reflection_capabilities.dart";
  }

  bool isBootstrapImport(ImportDirective node) {
    return node.uri.stringValue == "package:angular2/bootstrap.dart";
  }
}

/// An object that checks for {@link ReflectionCapabilities} using a fully resolved
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

  bool isBootstrapImport(ImportDirective node) {
    throw 'Not implemented';
  }
}
