library angular2.test.transform.directive_processor.all_tests;

import 'package:barback/barback.dart';
import 'package:angular2/src/transform/directive_processor/rewriter.dart';
import 'package:angular2/src/transform/common/annotation_matcher.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
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
  _testNgDeps('should inline `templateUrl` values expressed as absolute urls.',
      'absolute_url_expression_files/hello.dart', reader: absoluteReader);

  _testNgDeps('should inline `templateUrl`s expressed as adjacent strings.',
      'split_url_expression_files/hello.dart');

  _testNgDeps('should report implemented types as `interfaces`.',
      'interfaces_files/soup.dart');

  _testNgDeps('should not include transitively implemented types.',
      'interface_chain_files/soup.dart');

  _testNgDeps('should not include superclasses in `interfaces`.',
      'superclass_files/soup.dart');
}

void _testNgDeps(String name, String inputPath,
    {List<AnnotationDescriptor> customDescriptors: const [], AssetId assetId,
    AssetReader reader}) {
  it(name, () async {
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
    var output = await createNgDeps(reader, inputId, annotationMatcher);
    if (output == null) {
      expect(await reader.hasInput(expectedId)).toBeFalse();
    } else {
      expect(formatter.format(output))
          .toEqual(await reader.readAsString(expectedId));
    }
  });
}

AssetId _assetIdForPath(String path) =>
    new AssetId('angular2', 'test/transform/directive_processor/$path');
