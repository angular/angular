library angular2.transform.common.ast_tester;

import 'package:analyzer/src/generated/ast.dart';
import 'package:angular2/src/transform/common/names.dart';

const BOOTSTRAP_STATIC_URI = 'package:angular2/bootstrap_static.dart';
const BOOTSTRAP_URI = 'package:angular2/bootstrap.dart';
const REFLECTION_CAPABILITIES_URI =
    'package:angular2/src/core/reflection/reflection_capabilities.dart';

/// An object that checks for {@link ReflectionCapabilities} syntactically.
class AstTester {
  const AstTester();

  bool isNewReflectionCapabilities(InstanceCreationExpression node) =>
      '${node.constructorName.type.name}' == REFLECTION_CAPABILITIES_NAME;

  bool hasReflectionCapabilitiesUri(UriBasedDirective node) {
    return node.uri.stringValue == REFLECTION_CAPABILITIES_URI;
  }

  bool hasBootstrapUri(UriBasedDirective node) {
    return node.uri.stringValue == BOOTSTRAP_URI;
  }
}
