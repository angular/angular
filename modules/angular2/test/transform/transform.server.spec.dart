library angular2.test;

import 'dart:io';
import 'package:barback/barback.dart';
import 'package:angular2/transformer.dart';
import 'package:code_transformers/tests.dart';
import 'package:dart_style/dart_style.dart';
import 'package:unittest/unittest.dart';
import 'package:unittest/vm_config.dart';

main() {
  useVMConfiguration();

  // TODO(kegluneq): Add a test for generating multiple annotations.

  group('Annotation tests:', _runTests);
}

var formatter = new DartFormatter();
var transform = new AngularTransformer(new TransformerOptions('web/index.dart',
    reflectionEntryPoint: 'web/index.dart',
    newEntryPoint: 'web/index.bootstrap.dart'));

class TestConfig {
  final String name;
  final Map<String, String> assetPathToInputPath;
  final Map<String, String> assetPathToExpectedOutputPath;

  TestConfig(this.name,
      {Map<String, String> inputs, Map<String, String> outputs})
      : this.assetPathToInputPath = inputs,
        this.assetPathToExpectedOutputPath = outputs;
}

void _runTests() {
  /*
   * Each test has its own directory for inputs & an `expected` directory for
   * expected outputs.
   *
   * In addition to these declared inputs, we inject a set of common inputs for
   * every test.
   */
  var commonInputs = {
    'angular2|lib/src/core/annotations/annotations.dart':
        '../../lib/src/core/annotations/annotations.dart',
    'angular2|lib/src/core/application.dart': 'common.dart',
    'angular2|lib/src/reflection/reflection_capabilities.dart':
        'reflection_capabilities.dart'
  };

  var tests = [
    new TestConfig('Simple',
        inputs: {
      'a|web/index.dart': 'simple_annotation_files/index.dart',
      'a|web/bar.dart': 'simple_annotation_files/bar.dart'
    },
        outputs: {
      'a|web/index.bootstrap.dart':
          'simple_annotation_files/expected/index.bootstrap.dart',
      'a|web/index.dart': 'simple_annotation_files/expected/index.dart',
    }),
    new TestConfig('Two injected dependencies',
        inputs: {
      'a|web/index.dart': 'two_deps_files/index.dart',
      'a|web/foo.dart': 'two_deps_files/foo.dart',
      'a|web/bar.dart': 'two_deps_files/bar.dart'
    },
        outputs: {
      'a|web/index.bootstrap.dart':
          'two_deps_files/expected/index.bootstrap.dart'
    }),
    new TestConfig('List of types',
        inputs: {
      'a|web/index.dart': 'list_of_types_files/index.dart',
      'a|web/foo.dart': 'list_of_types_files/foo.dart',
      'a|web/bar.dart': 'list_of_types_files/bar.dart',
      'angular2|lib/src/core/annotations/annotations.dart':
          '../../lib/src/core/annotations/annotations.dart',
      'angular2|lib/src/core/application.dart': 'common.dart'
    },
        outputs: {
      'a|web/index.bootstrap.dart':
          'list_of_types_files/expected/index.bootstrap.dart'
    }),
    new TestConfig('Component with synthetic Constructor',
        inputs: {
      'a|web/index.dart': 'synthetic_ctor_files/index.dart',
      'a|web/bar.dart': 'synthetic_ctor_files/bar.dart',
      'angular2|lib/src/core/annotations/annotations.dart':
          '../../lib/src/core/annotations/annotations.dart',
      'angular2|lib/src/core/application.dart': 'common.dart'
    },
        outputs: {
      'a|web/index.bootstrap.dart':
          'synthetic_ctor_files/expected/index.bootstrap.dart'
    }),
    new TestConfig('Component with two annotations',
        inputs: {
      'a|web/index.dart': 'two_annotations_files/index.dart',
      'a|web/bar.dart': 'two_annotations_files/bar.dart',
      'angular2|lib/src/core/annotations/annotations.dart':
          '../../lib/src/core/annotations/annotations.dart',
      'angular2|lib/src/core/annotations/template.dart':
          '../../lib/src/core/annotations/template.dart',
      'angular2|lib/src/core/application.dart': 'common.dart'
    },
        outputs: {
      'a|web/index.bootstrap.dart':
          'two_annotations_files/expected/index.bootstrap.dart'
    })
  ];

  var cache = {};

  for (var config in tests) {

    // Read in input & output files.
    config.assetPathToInputPath
      ..addAll(commonInputs)
      ..forEach((key, value) {
        config.assetPathToInputPath[key] = cache.putIfAbsent(value,
            () => new File('test/transform/${value}').readAsStringSync());
      });
    config.assetPathToExpectedOutputPath.forEach((key, value) {
      config.assetPathToExpectedOutputPath[key] = cache.putIfAbsent(value, () {
        var code = new File('test/transform/${value}').readAsStringSync();
        return value.endsWith('dart') ? formatter.format(code) : code;
      });
    });
    testPhases(config.name, [
      [transform]
    ], config.assetPathToInputPath, config.assetPathToExpectedOutputPath, []);
  }
}
