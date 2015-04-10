library angular2.transform.reflection_remover.remove_reflection_capabilities;

import 'dart:async';
import 'package:analyzer/analyzer.dart';
import 'package:barback/barback.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';

import 'codegen.dart';
import 'rewriter.dart';

/// Finds the call to the Angular2 `ReflectionCapabilities` constructor
/// in [reflectionEntryPoint] and replaces it with a call to
/// `setupReflection` in [newEntryPoint].
///
/// This only searches the code in [reflectionEntryPoint], not `part`s,
/// `import`s, `export`s, etc.
Future<String> removeReflectionCapabilities(AssetReader reader,
    AssetId reflectionEntryPoint, Iterable<AssetId> newEntryPoints) async {
  var code = await reader.readAsString(reflectionEntryPoint);
  var reflectionEntryPointPath = reflectionEntryPoint.path;
  var newEntryPointPaths = newEntryPoints.map((id) => id.path);

  var codegen = new Codegen(reflectionEntryPointPath, newEntryPointPaths);
  return new Rewriter(code, codegen)
      .rewrite(parseCompilationUnit(code, name: reflectionEntryPointPath));
}
