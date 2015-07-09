library angular2.test.transform.directive_processor.all_tests;

import 'package:barback/barback.dart';
import 'package:angular2/src/transform/directive_processor/rewriter.dart';
import 'package:angular2/src/transform/common/annotation_matcher.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:code_transformers/messages/build_logger.dart';
import 'package:dart_style/dart_style.dart';
import 'package:guinness/guinness.dart';
import 'package:path/path.dart' as path;
import '../common/read_file.dart';

var formatter = new DartFormatter();

main() {
  allTests();
}

void allTests() {
  _testNgDeps('should preserve parameter annotations as const instances.',
      'parameter_metadata/soup.dart');

  _testNgDeps('should recognize custom annotations with package: imports',
      'custom_metadata/package_soup.dart',
      customDescriptors: [
    const AnnotationDescriptor('Soup', 'package:soup/soup.dart', 'Component'),
  ]);

  _testNgDeps('should recognize custom annotations with relative imports',
      'custom_metadata/relative_soup.dart',
      assetId: new AssetId('soup', 'lib/relative_soup.dart'),
      customDescriptors: [
    const AnnotationDescriptor(
        'Soup', 'package:soup/annotations/soup.dart', 'Component'),
  ]);

  _testNgDeps('Requires the specified import.', 'custom_metadata/bad_soup.dart',
      customDescriptors: [
    const AnnotationDescriptor('Soup', 'package:soup/soup.dart', 'Component'),
  ]);

  _testNgDeps(
      'should inline `templateUrl` values.', 'url_expression_files/hello.dart');

  var absoluteReader = new TestAssetReader();
  absoluteReader.addAsset(new AssetId('other_package', 'lib/template.html'),
      readFile(
          'directive_processor/absolute_url_expression_files/template.html'));
  absoluteReader.addAsset(new AssetId('other_package', 'lib/template.css'),
      readFile(
          'directive_processor/absolute_url_expression_files/template.css'));
  _testNgDeps('should inline `templateUrl` and `styleUrls` values expressed as'
      ' absolute urls.', 'absolute_url_expression_files/hello.dart',
      reader: absoluteReader);

  _testNgDeps(
      'should inline multiple `styleUrls` values expressed as absolute urls.',
      'multiple_style_urls_files/hello.dart');

  absoluteReader.addAsset(new AssetId('a', 'lib/template.html'),
      readFile('directive_processor/multiple_style_urls_files/template.html'));
  absoluteReader.addAsset(new AssetId('a', 'lib/template.css'),
      readFile('directive_processor/multiple_style_urls_files/template.css'));
  absoluteReader.addAsset(new AssetId('a', 'lib/template_other.css'), readFile(
      'directive_processor/multiple_style_urls_files/template_other.css'));
  _testNgDeps(
      'shouldn\'t inline multiple `styleUrls` values expressed as absolute '
      'urls.', 'multiple_style_urls_not_inlined_files/hello.dart',
      inlineViews: false, reader: absoluteReader);

  _testNgDeps('should inline `templateUrl`s expressed as adjacent strings.',
      'split_url_expression_files/hello.dart');

  _testNgDeps('should report implemented types as `interfaces`.',
      'interfaces_files/soup.dart');

  _testNgDeps('should not include transitively implemented types.',
      'interface_chain_files/soup.dart');

  _testNgDeps('should not include superclasses in `interfaces`.',
      'superclass_files/soup.dart');

  _testNgDeps(
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

  _testNgDeps('should find and register static functions.',
      'static_function_files/hello.dart');
}

void _testNgDeps(String name, String inputPath,
    {List<AnnotationDescriptor> customDescriptors: const [], AssetId assetId,
    AssetReader reader, List<String> expectedLogs, bool inlineViews: true}) {
  it(name, () async {
    if (expectedLogs != null) {
      log.setLogger(new RecordingLogger());
    }

    var inputId = _assetIdForPath(inputPath);
    if (reader == null) {
      reader = new TestAssetReader();
    }
    if (assetId != null) {
      reader.addAsset(assetId, await reader.readAsString(inputId));
      inputId = assetId;
    }
    var expectedPath = path.join(path.dirname(inputPath), 'expected',
        path.basename(inputPath).replaceFirst('.dart', '.ng_deps.dart'));
    var expectedId = _assetIdForPath(expectedPath);

    var annotationMatcher = new AnnotationMatcher()..addAll(customDescriptors);
    var output =
        await createNgDeps(reader, inputId, annotationMatcher, inlineViews);
    if (output == null) {
      expect(await reader.hasInput(expectedId)).toBeFalse();
    } else {
      var input = await reader.readAsString(expectedId);
      expect(formatter.format(output)).toEqual(formatter.format(input));
    }

    if (expectedLogs != null) {
      expect((log.logger as RecordingLogger).logs, expectedLogs);
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

  List<String> logs = [];

  void _record(prefix, msg) => logs.add('$prefix: $msg');

  void info(msg, {AssetId asset, SourceSpan span}) => _record('INFO', msg);

  void fine(msg, {AssetId asset, SourceSpan span}) => _record('FINE', msg);

  void warning(msg, {AssetId asset, SourceSpan span}) => _record('WARN', msg);

  void error(msg, {AssetId asset, SourceSpan span}) => _record('ERROR', msg);

  Future writeOutput() => throw new UnimplementedError();
  Future addLogFilesFromAsset(AssetId id, [int nextNumber = 1]) =>
      throw new UnimplementedError();
}
