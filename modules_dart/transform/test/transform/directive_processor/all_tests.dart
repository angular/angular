library angular2.test.transform.directive_processor.all_tests;

import 'dart:convert';

import 'package:barback/barback.dart';
import 'package:angular2/src/transform/directive_processor/rewriter.dart';
import 'package:angular2/src/transform/common/annotation_matcher.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/common/ng_meta.dart';
import 'package:code_transformers/messages/build_logger.dart';
import 'package:dart_style/dart_style.dart';
import 'package:guinness/guinness.dart';
import 'package:path/path.dart' as path;
import 'package:source_span/source_span.dart';
import '../common/read_file.dart';

var formatter = new DartFormatter();

main() {
  allTests();
}

void allTests() {
  _testProcessor('should preserve parameter annotations as const instances.',
      'parameter_metadata/soup.dart');

  _testProcessor('should handle `part` directives.', 'part_files/main.dart');

  _testProcessor('should handle multiple `part` directives.',
      'multiple_part_files/main.dart');

  _testProcessor('should not generate .ng_deps.dart for `part` files.',
      'part_files/part.dart');

  _testProcessor('should recognize custom annotations with package: imports',
      'custom_metadata/package_soup.dart',
      customDescriptors: [
    const ClassDescriptor('Soup', 'package:soup/soup.dart',
        superClass: 'Component'),
  ]);

  _testProcessor('should recognize custom annotations with relative imports',
      'custom_metadata/relative_soup.dart',
      assetId: new AssetId('soup', 'lib/relative_soup.dart'),
      customDescriptors: [
        const ClassDescriptor('Soup', 'package:soup/annotations/soup.dart',
            superClass: 'Component'),
      ]);

  _testProcessor(
      'Requires the specified import.', 'custom_metadata/bad_soup.dart',
      customDescriptors: [
    const ClassDescriptor('Soup', 'package:soup/soup.dart',
        superClass: 'Component'),
  ]);

  _testProcessor(
      'should inline `templateUrl` values.', 'url_expression_files/hello.dart');

  var absoluteReader = new TestAssetReader();
  absoluteReader.addAsset(
      new AssetId('other_package', 'lib/template.html'),
      readFile(
          'directive_processor/absolute_url_expression_files/template.html'));
  absoluteReader.addAsset(
      new AssetId('other_package', 'lib/template.css'),
      readFile(
          'directive_processor/absolute_url_expression_files/template.css'));
  _testProcessor(
      'should inline `templateUrl` and `styleUrls` values expressed'
      ' as absolute urls.',
      'absolute_url_expression_files/hello.dart',
      reader: absoluteReader);

  _testProcessor(
      'should inline multiple `styleUrls` values expressed as absolute urls.',
      'multiple_style_urls_files/hello.dart');

  absoluteReader.addAsset(new AssetId('a', 'lib/template.html'),
      readFile('directive_processor/multiple_style_urls_files/template.html'));
  absoluteReader.addAsset(new AssetId('a', 'lib/template.css'),
      readFile('directive_processor/multiple_style_urls_files/template.css'));
  absoluteReader.addAsset(
      new AssetId('a', 'lib/template_other.css'),
      readFile(
          'directive_processor/multiple_style_urls_files/template_other.css'));
  _testProcessor(
      'shouldn\'t inline multiple `styleUrls` values expressed as absolute '
      'urls.',
      'multiple_style_urls_not_inlined_files/hello.dart',
      inlineViews: false,
      reader: absoluteReader);

  _testProcessor('should inline `templateUrl`s expressed as adjacent strings.',
      'split_url_expression_files/hello.dart');

  _testProcessor('should report implemented types as `interfaces`.',
      'interfaces_files/soup.dart');

  _testProcessor('should not include transitively implemented types.',
      'interface_chain_files/soup.dart');

  _testProcessor('should not include superclasses in `interfaces`.',
      'superclass_files/soup.dart');

  _testProcessor(
      'should populate `lifecycle` when lifecycle interfaces are present.',
      'interface_lifecycle_files/soup.dart');

  _testProcessor('should populate multiple `lifecycle` values when necessary.',
      'multiple_interface_lifecycle_files/soup.dart');

  _testProcessor(
      'should populate `lifecycle` when lifecycle superclass is present.',
      'superclass_lifecycle_files/soup.dart');

  _testProcessor('should populate `lifecycle` with prefix when necessary.',
      'prefixed_interface_lifecycle_files/soup.dart');

  _testProcessor(
      'should not throw/hang on invalid urls', 'invalid_url_files/hello.dart',
      expectedLogs: [
    'ERROR: Uri /bad/absolute/url.html not supported from angular2|test/'
        'transform/directive_processor/invalid_url_files/hello.dart, could not '
        'build AssetId',
    'ERROR: Could not read asset at uri package:invalid/package.css from '
        'angular2|test/transform/directive_processor/invalid_url_files/'
        'hello.dart',
    'ERROR: Could not read asset at uri bad_relative_url.css from angular2|'
        'test/transform/directive_processor/invalid_url_files/hello.dart'
  ]);

  _testProcessor('should find and register static functions.',
      'static_function_files/hello.dart');

  _testProcessor('should find direcive aliases patterns.',
      'directive_aliases_files/hello.dart',
      reader: absoluteReader);
}

void _testProcessor(String name, String inputPath,
    {List<AnnotationDescriptor> customDescriptors: const [],
    AssetId assetId,
    AssetReader reader,
    List<String> expectedLogs,
    bool inlineViews: true,
    bool isolate: false}) {
  var testFn = isolate ? iit : it;
  testFn(name, () async {
    var logger = new RecordingLogger();
    await log.setZoned(logger, () async {
      var inputId = _assetIdForPath(inputPath);
      if (reader == null) {
        reader = new TestAssetReader();
      }
      if (assetId != null) {
        reader.addAsset(assetId, await reader.readAsString(inputId));
        inputId = assetId;
      }
      var expectedNgDepsPath = path.join(path.dirname(inputPath), 'expected',
          path.basename(inputPath).replaceFirst('.dart', '.ng_deps.dart'));
      var expectedNgDepsId = _assetIdForPath(expectedNgDepsPath);

      var expectedAliasesPath = path.join(path.dirname(inputPath), 'expected',
          path.basename(inputPath).replaceFirst('.dart', '.aliases.json'));
      var expectedAliasesId = _assetIdForPath(expectedAliasesPath);

      var annotationMatcher = new AnnotationMatcher()
        ..addAll(customDescriptors);
      var ngMeta = new NgMeta.empty();
      var output = await createNgDeps(
          reader, inputId, annotationMatcher, ngMeta,
          inlineViews: inlineViews);
      if (output == null) {
        expect(await reader.hasInput(expectedNgDepsId)).toBeFalse();
      } else {
        var expectedOutput = await reader.readAsString(expectedNgDepsId);
        expect(formatter.format(output))
            .toEqual(formatter.format(expectedOutput));
      }
      if (ngMeta.isEmpty) {
        expect(await reader.hasInput(expectedAliasesId)).toBeFalse();
      } else {
        var expectedJson = await reader.readAsString(expectedAliasesId);
        expect(new JsonEncoder.withIndent('  ').convert(ngMeta.toJson()))
            .toEqual(expectedJson.trim());
      }
    });

    if (expectedLogs == null) {
      expect(logger.hasErrors).toBeFalse();
    } else {
      expect(logger.logs, expectedLogs);
    }
  });
}

AssetId _assetIdForPath(String path) =>
    new AssetId('angular2', 'test/transform/directive_processor/$path');

class RecordingLogger implements BuildLogger {
  @override
  final String detailsUri = '';
  @override
  final bool convertErrorsToWarnings = false;

  bool hasErrors = false;

  List<String> logs = [];

  void _record(prefix, msg) => logs.add('$prefix: $msg');

  void info(msg, {AssetId asset, SourceSpan span}) => _record('INFO', msg);

  void fine(msg, {AssetId asset, SourceSpan span}) => _record('FINE', msg);

  void warning(msg, {AssetId asset, SourceSpan span}) => _record('WARN', msg);

  void error(msg, {AssetId asset, SourceSpan span}) {
    hasErrors = true;
    _record('ERROR', msg);
  }

  Future writeOutput() => throw new UnimplementedError();
  Future addLogFilesFromAsset(AssetId id, [int nextNumber = 1]) =>
      throw new UnimplementedError();
}
