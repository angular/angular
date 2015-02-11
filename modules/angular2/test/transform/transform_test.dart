library angular2.test;

import 'dart:io';
import 'package:barback/barback.dart';
import 'package:angular2/transformer.dart';
import 'package:code_transformers/tests.dart';
import 'package:dart_style/dart_style.dart';
import 'package:unittest/unittest.dart';
import 'package:unittest/vm_config.dart';

import 'common.dart';

main() {
  useVMConfiguration();

  group('Annotation tests:', _runTests);
}

var formatter = new DartFormatter();
var transform = new AngularTransformer(new TransformerOptions(
    'web/index.dart', 'web/index.bootstrap.dart', 'web/index.html'));

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
  // Each test has its own directory for inputs & an `expected` directory for
  // expected outputs.
  var tests = [
    new TestConfig('Simple',
        inputs: {
      'a|web/index.html': 'common.html',
      'a|web/index.dart': 'simple_annotation_files/index.dart',
      'a|web/bar.dart': 'simple_annotation_files/bar.dart',
      'angular2|lib/src/core/annotations/annotations.dart': 'common.dart'
    },
        outputs: {
      'a|web/index.bootstrap.dart':
          'simple_annotation_files/expected/index.bootstrap.dart'
    }),
    new TestConfig('Two injected dependencies',
        inputs: {
      'a|web/index.html': 'common.html',
      'a|web/index.dart': 'two_deps_files/index.dart',
      'a|web/foo.dart': 'two_deps_files/foo.dart',
      'a|web/bar.dart': 'two_deps_files/bar.dart',
      'angular2|lib/src/core/annotations/annotations.dart': 'common.dart'
    },
        outputs: {
      'a|web/index.bootstrap.dart':
          'two_deps_files/expected/index.bootstrap.dart'
    }),
    new TestConfig('List of types',
        inputs: {
      'a|web/index.html': 'common.html',
      'a|web/index.dart': 'list_of_types_files/index.dart',
      'a|web/foo.dart': 'list_of_types_files/foo.dart',
      'a|web/bar.dart': 'list_of_types_files/bar.dart',
      'angular2|lib/src/core/annotations/annotations.dart': 'common.dart'
    },
        outputs: {
      'a|web/index.bootstrap.dart':
          'list_of_types_files/expected/index.bootstrap.dart'
    }),
    new TestConfig('Component ctor with default value',
        inputs: {
      'a|web/index.html': 'common.html',
      'a|web/index.dart': 'ctor_with_default_value_files/index.dart',
      'a|web/bar.dart': 'ctor_with_default_value_files/bar.dart',
      'angular2|lib/src/core/annotations/annotations.dart': 'common.dart'
    },
        outputs: {
      'a|web/index.bootstrap.dart':
          'ctor_with_default_value_files/expected/index.bootstrap.dart'
    }),
    new TestConfig('Component with synthetic Constructor',
        inputs: {
      'a|web/index.html': 'common.html',
      'a|web/index.dart': 'synthetic_ctor_files/index.dart',
      'a|web/bar.dart': 'synthetic_ctor_files/bar.dart',
      'angular2|lib/src/core/annotations/annotations.dart': 'common.dart'
    },
        outputs: {
      'a|web/index.bootstrap.dart':
          'synthetic_ctor_files/expected/index.bootstrap.dart'
    })
  ];

  var cache = {};

  for (var config in tests) {
    // Read in input & output files.
    config.assetPathToInputPath.forEach((key, value) {
      config.assetPathToInputPath[key] =
          cache.putIfAbsent(value, () => new File(value).readAsStringSync());
    });
    config.assetPathToExpectedOutputPath.forEach((key, value) {
      config.assetPathToExpectedOutputPath[key] = cache.putIfAbsent(
          value, () => formatter.format(new File(value).readAsStringSync()));
    });
    testPhases(config.name, [
      [transform]
    ], config.assetPathToInputPath, config.assetPathToExpectedOutputPath, []);
  }
}
