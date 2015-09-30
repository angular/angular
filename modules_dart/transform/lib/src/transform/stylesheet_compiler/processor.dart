library angular2.transform.stylesheet_compiler.processor;

import 'dart:async';

import 'package:angular2/src/core/dom/html_adapter.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/code/uri.dart';
import 'package:angular2/src/transform/common/formatter.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/ng_compiler.dart';
import 'package:angular2/src/compiler/template_compiler.dart';
import 'package:angular2/src/compiler/source_module.dart';

import 'package:barback/barback.dart';

AssetId shimmedStylesheetAssetId(AssetId cssAssetId) => new AssetId(
    cssAssetId.package, toShimmedStylesheetExtension(cssAssetId.path));

AssetId nonShimmedStylesheetAssetId(AssetId cssAssetId) => new AssetId(
    cssAssetId.package, toNonShimmedStylesheetExtension(cssAssetId.path));

Future<Iterable<Asset>> processStylesheet(
    AssetReader reader, AssetId stylesheetId) async {
  final stylesheetUrl = '${stylesheetId.package}|${stylesheetId.path}';
  final templateCompiler = createTemplateCompiler(reader);
  final cssText = await reader.readAsString(stylesheetId);
  final sourceModules =
      templateCompiler.compileStylesheetCodeGen(stylesheetUrl, cssText);

  return sourceModules.map((SourceModule module) {
    final code = new StringBuffer();
    final stylesheetSource = module.getSourceWithImports();
    code.writeAll(stylesheetSource.imports.map((List<String> import) {
      // Format for importLine := [uri, prefix]
      return writeImportUri(import[0],
          prefix: import[1], fromAbsolute: module.moduleUrl);
    }), '\n');
    code..writeln()..writeln(stylesheetSource.source);
    return new Asset.fromString(
        new AssetId.parse('${module.moduleUrl}'), code.toString());
  });
}
