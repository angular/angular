library angular2.test.transform.directive_metadata_linker.all_tests;

import 'dart:async';
import 'package:angular2/src/core/render/api.dart';
import 'package:angular2/src/core/change_detection/change_detection.dart';
import 'package:angular2/src/transform/common/directive_metadata_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/ng_deps.dart';
import 'package:angular2/src/transform/directive_metadata_linker/'
    'linker.dart';
import 'package:barback/barback.dart';
import 'package:dart_style/dart_style.dart';
import 'package:guinness/guinness.dart';

import '../common/read_file.dart';

var formatter = new DartFormatter();

main() => allTests();

void allTests() {
  TestAssetReader reader = null;

  beforeEach(() {
    reader = new TestAssetReader();
  });

  it('should include `DirectiveMetadata` from exported files.', () async {
    var extracted = await linkDirectiveMetadata(
        reader,
        new AssetId(
            'a', 'directive_metadata_linker/export_files/foo.ng_meta.json'));
    expect(extracted.types).toContain('FooComponent');
    expect(extracted.types).toContain('BarComponent');

    expect(extracted.types['FooComponent'].selector).toEqual('[foo]');
    expect(extracted.types['BarComponent'].selector).toEqual('[bar]');
  });

  it('should include `DirectiveMetadata` recursively from exported files.',
      () async {
    var extracted = await linkDirectiveMetadata(
        reader,
        new AssetId('a',
            'directive_metadata_linker/recursive_export_files/foo.ng_meta.json'));
    expect(extracted.types).toContain('FooComponent');
    expect(extracted.types).toContain('BarComponent');
    expect(extracted.types).toContain('BazComponent');

    expect(extracted.types['FooComponent'].selector).toEqual('[foo]');
    expect(extracted.types['BarComponent'].selector).toEqual('[bar]');
    expect(extracted.types['BazComponent'].selector).toEqual('[baz]');
  });

  it('should handle `DirectiveMetadata` export cycles gracefully.', () async {
    var extracted = await linkDirectiveMetadata(
        reader,
        new AssetId('a',
            'directive_metadata_linker/export_cycle_files/baz.ng_meta.json'));
    expect(extracted.types).toContain('FooComponent');
    expect(extracted.types).toContain('BarComponent');
    expect(extracted.types).toContain('BazComponent');
  });

  it(
      'should include `DirectiveMetadata` from exported files '
      'expressed as absolute uris', () async {
    var extracted = await linkDirectiveMetadata(
        reader,
        new AssetId('a',
            'directive_metadata_linker/absolute_export_files/foo.ng_meta.json'));
    expect(extracted.types).toContain('FooComponent');
    expect(extracted.types).toContain('BarComponent');

    expect(extracted.types['FooComponent'].selector).toEqual('[foo]');
    expect(extracted.types['BarComponent'].selector).toEqual('[bar]');
  });
}
