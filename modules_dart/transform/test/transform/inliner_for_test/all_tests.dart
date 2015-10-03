library angular2.test.transform.inliner_for_test.all_tests;

import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/inliner_for_test.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/tests.dart';
import 'package:guinness/guinness.dart';
import 'package:dart_style/dart_style.dart';

import '../common/read_file.dart';

main() {
  allTests();
}

DartFormatter formatter = new DartFormatter();

void allTests() {
  AssetReader absoluteReader;

  beforeEach(() {
    absoluteReader = new TestAssetReader();
  });

  it('should inline `templateUrl` values', () async {
    var output = await inline(
        absoluteReader, _assetId('url_expression_files/hello.dart'));
    expect(output).toBeNotNull();
    expect(() => formatter.format(output)).not.toThrow();
    expect(output).toContain("template: r'''{{greeting}}'''");
  });

  it(
      'should inline `templateUrl` and `styleUrls` values expressed as '
      'absolute urls.', () async {
    absoluteReader.addAsset(
        new AssetId('other_package', 'lib/template.html'),
        readFile(
            'inliner_for_test/absolute_url_expression_files/template.html'));
    absoluteReader.addAsset(
        new AssetId('other_package', 'lib/template.css'),
        readFile(
            'inliner_for_test/absolute_url_expression_files/template.css'));

    var output = await inline(
        absoluteReader, _assetId('absolute_url_expression_files/hello.dart'));

    expect(output).toBeNotNull();
    expect(() => formatter.format(output)).not.toThrow();

    expect(output).toContain("template: r'''{{greeting}}'''");
    expect(output).toContain("styles: const ["
        "r'''.greeting { .color: blue; }''', ]");
  });

  it('should inline multiple `styleUrls` values expressed as absolute urls.',
      () async {
    absoluteReader
      ..addAsset(new AssetId('other_package', 'lib/template.html'), '')
      ..addAsset(new AssetId('other_package', 'lib/template.css'), '');
    var output = await inline(
        absoluteReader, _assetId('multiple_style_urls_files/hello.dart'));

    expect(output).toBeNotNull();
    expect(() => formatter.format(output)).not.toThrow();

    expect(output)
      ..toContain("r'''.greeting { .color: blue; }'''")
      ..toContain("r'''.hello { .color: red; }'''");
  });

  it('should inline `templateUrl`s expressed as adjacent strings.', () async {
    var output = await inline(
        absoluteReader, _assetId('split_url_expression_files/hello.dart'));

    expect(output).toBeNotNull();
    expect(() => formatter.format(output)).not.toThrow();

    expect(output).toContain("{{greeting}}");
  });

  _runAbsoluteUrlEndToEndTest();
  _runMultiStylesEndToEndTest();
}

AssetId _assetId(String path) => new AssetId('a', 'inliner_for_test/$path');

void _runAbsoluteUrlEndToEndTest() {
  InlinerForTest transformer = new InlinerForTest(formatCode: true);
  var inputMap = {
    'a|absolute_url_expression_files/hello.dart':
        _readFile('absolute_url_expression_files/hello.dart'),
    'other_package|lib/template.css':
        _readFile('absolute_url_expression_files/template.css'),
    'other_package|lib/template.html':
        _readFile('absolute_url_expression_files/template.html')
  };
  var outputMap = {
    'a|absolute_url_expression_files/hello.dart':
        _readFile('absolute_url_expression_files/expected/hello.dart')
  };
  testPhases(
      'Inliner For Test should inline `templateUrl` and `styleUrls` values '
      'expressed as absolute urls',
      [
        [transformer]
      ],
      inputMap,
      outputMap,
      []);
}

void _runMultiStylesEndToEndTest() {
  InlinerForTest transformer = new InlinerForTest(formatCode: true);
  var inputMap = {
    'pkg|web/hello.dart': _readFile('multiple_style_urls_files/hello.dart'),
    'pkg|web/template.css': _readFile('multiple_style_urls_files/template.css'),
    'pkg|web/template_other.css':
        _readFile('multiple_style_urls_files/template_other.css'),
    'pkg|web/template.html':
        _readFile('multiple_style_urls_files/template.html')
  };
  var outputMap = {
    'pkg|web/hello.dart':
        _readFile('multiple_style_urls_files/expected/hello.dart')
  };
  testPhases(
      'Inliner For Test should inline `templateUrl` and `styleUrls` values '
      'expressed as relative urls',
      [
        [transformer]
      ],
      inputMap,
      outputMap,
      []);
}

/// Smooths over differences in CWD between IDEs and running tests in Travis.
String _readFile(String path) {
  var code = readFile('inliner_for_test/$path');
  if (path.endsWith('.dart')) {
    code = formatter.format(code);
  }
  return code;
}
