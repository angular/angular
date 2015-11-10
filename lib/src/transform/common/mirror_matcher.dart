library angular2.transform.common.mirror_matcher;

import 'package:analyzer/src/generated/ast.dart';
import 'package:angular2/src/transform/common/names.dart';

const BOOTSTRAP_STATIC_URI = 'package:angular2/bootstrap_static.dart';
const BOOTSTRAP_URI = 'package:angular2/bootstrap.dart';
const REFLECTION_CAPABILITIES_URI =
    'package:angular2/src/core/reflection/reflection_capabilities.dart';

/// Syntactially checks for code related to the use of `dart:mirrors`.
///
/// Checks various [AstNode]s to determine if they are
/// - Libraries that transitively import `dart:mirrors`
/// - Instantiations of [ReflectionCapabilities]
class MirrorMatcher {
  const MirrorMatcher();

  bool isNewReflectionCapabilities(InstanceCreationExpression node) =>
      '${node.constructorName.type.name}' == REFLECTION_CAPABILITIES_NAME;

  bool hasReflectionCapabilitiesUri(UriBasedDirective node) {
    return node.uri.stringValue == REFLECTION_CAPABILITIES_URI;
  }

  bool hasBootstrapUri(UriBasedDirective node) {
    return node.uri.stringValue == BOOTSTRAP_URI;
  }
}
