library angular2.transform.directive_linker.linker;

import 'dart:async';

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/ng_deps.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/assets.dart';
import 'package:path/path.dart' as path;

/// Checks the `.ng_deps.dart` file represented by `entryPoint` and
/// determines whether it is necessary to the functioning of the Angular 2
/// Dart app.
///
/// An `.ng_deps.dart` file is not necessary if:
/// 1. It does not register any `@Injectable` types with the system.
/// 2. It does not import any libraries whose `.ng_deps.dart` files register
///    any `@Injectable` types with the system.
///
/// Since `@Directive` and `@Component` inherit from `@Injectable`, we know
/// we will not miss processing any classes annotated with those tags.
Future<bool> isNecessary(AssetReader reader, AssetId entryPoint) async {
  NgDeps ngDeps = await NgDeps.parse(reader, entryPoint);

  if (ngDeps.registeredTypes.isNotEmpty) return true;

  // We do not register any @Injectables, do we call any dependencies?
  var linkedDepsMap =
      await _processNgImports(reader, entryPoint, _getSortedDeps(ngDeps));
  return linkedDepsMap.isNotEmpty;
}

/// Modifies the `.ng_deps.dart` file represented by `entryPoint` to call its
/// dependencies associated `initReflector` methods.
///
/// For example, if entry_point.ng_deps.dart imports dependency.dart, this
/// will check if dependency.ng_deps.dart exists. If it does, we add:
///
/// ```
/// import 'dependency.ng_deps.dart' as i0;
/// ...
/// void setupReflection(reflector) {
///   ...
///   i0.initReflector(reflector);
/// }
/// ```
Future<String> linkNgDeps(AssetReader reader, AssetId entryPoint) async {
  NgDeps ngDeps = await NgDeps.parse(reader, entryPoint);

  if (ngDeps == null) return null;

  var allDeps = _getSortedDeps(ngDeps);
  var linkedDepsMap = await _processNgImports(reader, entryPoint, allDeps);

  if (linkedDepsMap.isEmpty) {
    // We are not calling `initReflector` on any other libraries.
    return ngDeps.code;
  }

  var importBuf = new StringBuffer();
  var declarationBuf = new StringBuffer();
  var code = ngDeps.code;
  var codeIdx = 0;
  // Generate import statements for linked deps where necessary.
  for (var i = 0, it = allDeps.iterator; it.moveNext();) {
    if (linkedDepsMap.containsKey(it.current)) {
      importBuf.write(code.substring(codeIdx, it.current.end));
      codeIdx = it.current.end;
      importBuf.write('''
        import '${linkedDepsMap[it.current]}' as i${i};
      ''');
      declarationBuf
          .write('i${i}.${SETUP_METHOD_NAME}(${REFLECTOR_VAR_NAME});');
      ++i;
    }
  }

  var declarationSeamIdx = ngDeps.setupMethod.end - 1;
  return '$importBuf'
      '${code.substring(codeIdx, declarationSeamIdx)}'
      '$declarationBuf'
      '${code.substring(declarationSeamIdx)}';
}

/// All `import`s and `export`s in `ngDeps` sorted by order of appearance in
/// the file.
List<UriBasedDirective> _getSortedDeps(NgDeps ngDeps) {
  return <UriBasedDirective>[]
    ..addAll(ngDeps.imports)
    ..addAll(ngDeps.exports)
    ..sort((a, b) => a.end.compareTo(b.end));
}

String _toDepsUri(String importUri) =>
    '${path.withoutExtension(importUri)}${DEPS_EXTENSION}';

bool _isNotDartDirective(UriBasedDirective directive) {
  return !stringLiteralToString(directive.uri).startsWith('dart:');
}

/// Maps each input {@link UriBasedDirective} to its associated `.ng_deps.dart`
/// file, if it exists.
Future<Map<UriBasedDirective, String>> _processNgImports(AssetReader reader,
    AssetId entryPoint, Iterable<UriBasedDirective> directives) {
  final nullFuture = new Future.value(null);
  final retVal = <UriBasedDirective, String>{};
  return Future
      .wait(directives
          .where(_isNotDartDirective)
          .map((UriBasedDirective directive) {
    var ngDepsUri = _toDepsUri(stringLiteralToString(directive.uri));
    var spanArg = null;
    var ngDepsAsset = uriToAssetId(entryPoint, ngDepsUri, logger, spanArg,
        errorOnAbsolute: false);
    if (ngDepsAsset == entryPoint) return nullFuture;
    return reader.hasInput(ngDepsAsset).then((hasInput) {
      if (hasInput) {
        retVal[directive] = ngDepsUri;
      }
    }, onError: (_) => null);
  })).then((_) => retVal);
}
