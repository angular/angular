library angular2.transform.stylesheet_compiler.processor;

import 'dart:async';

import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/code/source_module.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/ng_compiler.dart';
import 'package:angular2/src/core/compiler/source_module.dart';

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
  final timer = new Stopwatch()..start();
  final sourceModules =
      templateCompiler.compileStylesheetCodeGen(stylesheetUrl, cssText);
  timer.stop();
  logger.fine(
      '[processStylesheet] took ${timer.elapsedMilliseconds} ms on $stylesheetId');

  return sourceModules.map((SourceModule module) => new Asset.fromString(
      new AssetId.parse('${module.moduleUrl}'), writeSourceModule(module)));
}
