library angular2.transform.common.code.reflection_info_code;

import 'package:angular2/src/transform/common/url_resolver.dart';
import 'package:path/path.dart' as path;

/// Generates an `import` statement for the file specified by `importPath`.
///
/// If `fromAbsolute` is specified, `importPath` may be a relative path,
/// otherwise it is expected to be absolute.
String writeImportUri(String importPath, {String prefix, String fromAbsolute}) {
  var codegenImportPath;

  var resolver = const TransformerUrlResolver();
  var importUri = resolver.toAssetScheme(Uri.parse(importPath));
  if (_canPackageImport(importUri) ||
      fromAbsolute == null ||
      fromAbsolute.isEmpty) {
    codegenImportPath = _toPackageImport(importUri);
  } else {
    var moduleUri = resolver.toAssetScheme(Uri.parse(fromAbsolute));
    if (_canImportRelative(importUri, from: moduleUri)) {
      codegenImportPath = path.url.relative(importUri.toString(),
          from: path.dirname(moduleUri.toString()));
    } else {
      var errMsg;
      if (fromAbsolute == null || fromAbsolute.isEmpty) {
        errMsg = 'Cannot only import $importPath using a relative uri';
      } else {
        errMsg = 'Cannot import $importPath from $fromAbsolute';
      }
      throw new FormatException(errMsg, importPath);
    }
  }

  if (prefix != null && prefix.isNotEmpty) {
    prefix = ' as $prefix';
  }
  return 'import \'$codegenImportPath\'$prefix;';
}

// For a relative import, the scheme, first (package) and second (lib|test|web)
// path segments must be equal.
bool _canImportRelative(Uri import, {Uri from}) {
  if (import == null) throw new ArgumentError.notNull('import');
  if (from == null) throw new ArgumentError.notNull('from');
  return import.scheme == from.scheme &&
      import.pathSegments.first == from.pathSegments.first &&
      import.pathSegments[1] == from.pathSegments[1];
}

/// Pub's package scheme assumes that an asset lives under the lib/ directory,
/// so an asset: Uri is package-importable if its second path segment is lib/.
///
/// For a file located at angular2/lib/src/file.dart:
/// - Asset scheme =>  asset:angular2/lib/src/file.dart
/// - Package scheme => package:angular2/src/file.dart
bool _canPackageImport(Uri assetImport) {
  if (assetImport == null) throw new ArgumentError.notNull('assetImport');
  if (!assetImport.isAbsolute || assetImport.scheme != 'asset') {
    throw new ArgumentError.value(assetImport, 'assetImport',
        'Must be an absolute uri using the asset: scheme');
  }
  return assetImport.pathSegments.length >= 2 &&
      assetImport.pathSegments[1] == 'lib';
}

String _toPackageImport(Uri assetImport) {
  assert(_canPackageImport(assetImport));
  var subPath = assetImport.pathSegments
      .getRange(2, assetImport.pathSegments.length)
      .join('/');
  return 'package:${assetImport.pathSegments.first}/$subPath';
}
