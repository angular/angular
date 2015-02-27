library angular2.test.transform;

import 'dart:io';
import 'package:barback/barback.dart';
import 'package:angular2/transformer.dart';
import 'package:code_transformers/tests.dart';
import 'package:dart_style/dart_style.dart';
import 'package:unittest/unittest.dart';
import 'package:unittest/vm_config.dart';

import 'reflection_remover_files/expected/index.dart'
    as reflection_remover_output;

main() {
  useVMConfiguration();
  group('Integration tests:', _integrationTests);
}

var formatter = new DartFormatter();
var transform = new AngularTransformerGroup(new TransformerOptions(
    'web/index.dart', reflectionEntryPoint: 'web/index.dart'));

class IntegrationTestConfig {
  final String name;
  final Map<String, String> assetPathToInputPath;
  final Map<String, String> assetPathToExpectedOutputPath;

  IntegrationTestConfig(this.name,
      {Map<String, String> inputs, Map<String, String> outputs})
      : this.assetPathToInputPath = inputs,
        this.assetPathToExpectedOutputPath = outputs;
}

void _integrationTests() {
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
    'angular2|lib/src/core/application.dart': 'common/application.dart',
    'angular2|lib/src/reflection/reflection_capabilities.dart':
        'common/reflection_capabilities.dart'
  };

  var tests = [
    new IntegrationTestConfig('Simple',
        inputs: {
      'a|web/index.dart': 'simple_annotation_files/index.dart',
      'a|web/bar.dart': 'simple_annotation_files/bar.dart'
    },
        outputs: {
      'a|web/bar.ngDeps.dart':
          'simple_annotation_files/expected/bar.ngDeps.dart',
      'a|web/index.ngDeps.dart':
          'simple_annotation_files/expected/index.ngDeps.dart'
    }),
    new IntegrationTestConfig('Reflection Remover',
        inputs: {'a|web/index.dart': 'reflection_remover_files/index.dart'},
        outputs: {'a|web/index.dart': reflection_remover_output.code}),
    new IntegrationTestConfig('Two injected dependencies',
        inputs: {
      'a|web/index.dart': 'two_deps_files/index.dart',
      'a|web/foo.dart': 'two_deps_files/foo.dart',
      'a|web/bar.dart': 'two_deps_files/bar.dart'
    },
        outputs: {
      'a|web/bar.ngDeps.dart': 'two_deps_files/expected/bar.ngDeps.dart'
    }),
    new IntegrationTestConfig('List of types',
        inputs: {
      'a|web/index.dart': 'list_of_types_files/index.dart',
      'a|web/foo.dart': 'list_of_types_files/foo.dart',
      'a|web/bar.dart': 'list_of_types_files/bar.dart'
    },
        outputs: {
      'a|web/bar.ngDeps.dart': 'list_of_types_files/expected/bar.ngDeps.dart'
    }),
    new IntegrationTestConfig('Component with synthetic Constructor',
        inputs: {
      'a|web/index.dart': 'synthetic_ctor_files/index.dart',
      'a|web/bar.dart': 'synthetic_ctor_files/bar.dart'
    },
        outputs: {
      'a|web/bar.ngDeps.dart': 'synthetic_ctor_files/expected/bar.ngDeps.dart'
    }),
    new IntegrationTestConfig('Component with two annotations',
        inputs: {
      'a|web/index.dart': 'two_annotations_files/index.dart',
      'a|web/bar.dart': 'two_annotations_files/bar.dart',
      'angular2|lib/src/core/annotations/template.dart':
          '../../lib/src/core/annotations/template.dart'
    },
        outputs: {
      'a|web/bar.ngDeps.dart': 'two_annotations_files/expected/bar.ngDeps.dart'
    }),
    new IntegrationTestConfig('Basic `bind`',
        inputs: {
      'a|web/index.dart': 'basic_bind_files/index.dart',
      'a|web/bar.dart': 'basic_bind_files/bar.dart'
    },
        outputs: {
      'a|web/bar.ngDeps.dart': 'basic_bind_files/expected/bar.ngDeps.dart'
    }),
    new IntegrationTestConfig('Chained dependencies',
        inputs: {
      'a|web/index.dart': 'chained_deps_files/index.dart',
      'a|web/foo.dart': 'chained_deps_files/foo.dart',
      'a|web/bar.dart': 'chained_deps_files/bar.dart'
    },
        outputs: {
      'a|web/bar.ngDeps.dart': 'chained_deps_files/expected/bar.ngDeps.dart',
      'a|web/foo.ngDeps.dart': 'chained_deps_files/expected/foo.ngDeps.dart'
    })
  ];

  var cache = {};

  for (var config in tests) {

    // Read in input & output files.
    config.assetPathToInputPath
      ..addAll(commonInputs)
      ..forEach((key, value) {
        config.assetPathToInputPath[key] =
            cache.putIfAbsent(value, () => _readFile(value));
      });
    config.assetPathToExpectedOutputPath.forEach((key, value) {
      config.assetPathToExpectedOutputPath[key] = cache.putIfAbsent(value, () {
        var code = _readFile(value);
        return value.endsWith('dart') ? formatter.format(code) : code;
      });
    });
    testPhases(config.name, [
      [transform]
    ], config.assetPathToInputPath, config.assetPathToExpectedOutputPath, []);
  }
}

/// Smooths over differences in CWD between IDEs and running tests in Travis.
String _readFile(String path) {
  for (var myPath in [path, 'test/transform/${path}']) {
    var file = new File(myPath);
    if (file.existsSync()) {
      return file.readAsStringSync();
    }
  }
  return path;
}
