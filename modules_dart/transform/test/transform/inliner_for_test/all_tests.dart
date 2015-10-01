library angular2.test.transform.inliner_for_test.all_tests;

import 'dart:async';
import 'dart:convert';

import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/inliner_for_test.dart';
import 'package:barback/barback.dart';
import 'package:guinness/guinness.dart';
import 'package:dart_style/dart_style.dart';

import '../common/read_file.dart';

main() {
  allTests();
}

allTests() {
  AssetReader absoluteReader;
  DartFormatter formatter = new DartFormatter();

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
}

AssetId _assetId(String path) => new AssetId('a', 'inliner_for_test/$path');
