library angular2.src.transform;

import 'package:analyzer/src/generated/java_core.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/resolver.dart';
import 'package:dart_style/dart_style.dart';

import '../resolvers.dart';
import 'rewrite_visitor.dart';

/// Finds all calls to the Angular2 [ReflectionCapabilities] constructor
/// defined in [library].
/// This only searches the code defined in the file
// represented by [library], not `part`s, `import`s, `export`s, etc.
String removeReflectionCapabilities(
    Resolver resolver, AssetId reflectionEntryPoint, AssetId newEntryPoint) {
  var types = new Angular2Types(resolver);
  if (types.reflectionCapabilities == null) {
    throw new ArgumentError(
        'Could not find class for ${reflectionCapabilitiesTypeName}.');
  }

  var codegen = new SetupReflectionCodegen(reflectionEntryPoint, newEntryPoint);

  var writer = new PrintStringWriter();
  // TODO(kegluneq): To resolve or not to resolve?
  var visitor = new RewriteReflectionEntryPointVisitor(writer, codegen,
      forbiddenClass: types.reflectionCapabilities);

  // TODO(kegluneq): Determine how to get nodes without querying Element#node.
  // Root of file defining that library (main part).
  resolver.getLibrary(reflectionEntryPoint).definingCompilationUnit.node
      .accept(visitor);

  return new DartFormatter().format(writer.toString());
}
