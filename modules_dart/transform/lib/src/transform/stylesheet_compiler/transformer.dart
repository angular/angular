library angular2.transform.stylesheet_compiler.transformer;

import 'dart:async';

import 'package:angular2/src/core/dom/html_adapter.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/formatter.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/ng_compiler.dart';
import 'package:angular2/src/compiler/template_compiler.dart';
import 'package:angular2/src/compiler/source_module.dart';

import 'package:barback/barback.dart';

/// Pre-compiles CSS stylesheet files to Dart code for Angular 2.
class StylesheetCompiler extends Transformer implements DeclaringTransformer {

  StylesheetCompiler();

  @override
  bool isPrimary(AssetId id) {
    return id.path.endsWith(CSS_EXTENSION);
  }

  @override
  declareOutputs(DeclaringTransform transform) {
    transform.declareOutput(nonShimmedStylesheetAssetId(transform.primaryId));
    transform.declareOutput(shimmedStylesheetAssetId(transform.primaryId));
  }

  @override
  Future apply(Transform transform) async {
    await log.initZoned(transform, () async {
      Html5LibDomAdapter.makeCurrent();
      var reader = new AssetReader.fromTransform(transform);
      var outputs = await processStylesheet(reader, transform.primaryInput);
      outputs.forEach((Asset compiledStylesheet) {
        transform.addOutput(compiledStylesheet);
      });
    });
  }
}

AssetId shimmedStylesheetAssetId(AssetId cssAssetId) => new AssetId(
    cssAssetId.package, toShimmedStylesheetExtension(cssAssetId.path));

AssetId nonShimmedStylesheetAssetId(AssetId cssAssetId) => new AssetId(
    cssAssetId.package, toNonShimmedStylesheetExtension(cssAssetId.path));

Future<List<Asset>> processStylesheet(
    AssetReader reader, Asset stylesheet) async {
  final stylesheetId = stylesheet.id;
  final stylesheetModuleId = '${stylesheetId.package}|${stylesheetId.path}';
  final templateCompiler = createTemplateCompiler(reader);
  final cssText = await stylesheet.readAsString();
  final sourceModules =
      templateCompiler.compileStylesheetCodeGen(stylesheetModuleId, cssText);

  return sourceModules.map((SourceModule module) {
    final code = new StringBuffer();
    final stylesheetSource = module.getSourceWithImports();
    stylesheetSource.imports.forEach((List<String> import) {
      final importPath = import[0];
      final alias = import[1];
      code.write('import ${importPath}');
      if (alias.isNotEmpty) {
        code.write(' ${alias}');
      }
      code.writeln(';');
    });
    code.writeln();
    code.write(stylesheetSource.source);
    return new Asset.fromString(
        new AssetId.parse('${module.moduleId}.dart'), code.toString());
  }).toList();
}
