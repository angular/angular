library angular2.transform.common.code.reflection_info_code;

import 'package:angular2/src/transform/common/url_resolver.dart';
import 'package:path/path.dart' as path;

/// Generates an `import` statement to be used in the file `fromAbsolute`
/// for the file specified by `importPath`.
String writeImportUri(String importPath, {String prefix, String fromAbsolute}) {
  // TODO(kegluneq): Handle null or empty `fromAbsolute`.

  var resolver = const TransformerUrlResolver();
  var moduleUri = Uri.parse(resolver.resolve('', fromAbsolute));
  var importUri = Uri.parse(resolver.resolve('', importPath));

  if (moduleUri.scheme != 'asset') {
    throw new ArgumentError.value(fromAbsolute, 'fromAbsolute',
        'Unsupported scheme "${moduleUri.scheme}" for module id $moduleUri');
  }
  if (importUri.scheme != 'asset') {
    throw new ArgumentError.value(importPath, 'import',
        'Unsupported scheme "${importUri.scheme}" for import $importUri');
  }

  var modulePackage = moduleUri.pathSegments.first;
  var importPackage = importUri.pathSegments.first;
  var importSubdir = importUri.pathSegments[1];

  var codegenImportPath;
  if (modulePackage == importPackage &&
      moduleUri.pathSegments[1] == importSubdir) {
    codegenImportPath = path.relative(importUri.toString(),
        from: path.dirname(moduleUri.toString()));
  } else {
    if (importSubdir != 'lib') {
      throw new FormatException(
          'Cannot import $importUri from $moduleUri', importUri);
    }
    var subPath = importUri.pathSegments
        .getRange(2, importUri.pathSegments.length)
        .join('/');
    codegenImportPath = 'package:$importPackage/$subPath';
  }

  if (prefix != null && prefix.isNotEmpty) {
    prefix = ' as $prefix';
  }
  return 'import \'$codegenImportPath\'$prefix;';
}
