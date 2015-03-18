library angular2.src.transform.reflection_remover.remove_reflection_capabilities;

import 'package:analyzer/analyzer.dart';

import 'codegen.dart';
import 'rewriter.dart';

/// Finds the call to the Angular2 [ReflectionCapabilities] constructor
/// in [code] and replaces it with a call to `setupReflection` in
/// [newEntryPoint].
///
/// [reflectionEntryPointPath] is the path where [code] is defined and is
/// used to display parsing errors.
///
/// This only searches [code] not `part`s, `import`s, `export`s, etc.
String removeReflectionCapabilities(
    String code, String reflectionEntryPointPath, String newEntryPointPath) {
  var codegen = new Codegen(reflectionEntryPointPath, newEntryPointPath);
  return new Rewriter(code, codegen)
      .rewrite(parseCompilationUnit(code, name: reflectionEntryPointPath));
}
