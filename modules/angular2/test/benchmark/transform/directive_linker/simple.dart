library angular2.benchmark.transform.directive_linker.simple;

import 'dart:async';
import 'package:angular2/src/transform/common/options.dart';
import 'package:angular2/src/transform/directive_linker/transformer.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/benchmarks.dart';
import 'package:unittest/unittest.dart';

Future main() => runBenchmark();

allTests() {
  test('Directive Linker Benchmark Runs', runBenchmark);
}

Future<double> runBenchmark() async {
  var files = {
    new AssetId('a', 'a.ng_deps.dart'): aContents,
    new AssetId('a', 'b.ng_deps.dart'): bContents,
    new AssetId('a', 'c.ng_deps.dart'): cContents,
  };
  return new TransformerBenchmark([
    [new DirectiveLinker()]
  ], files).measure();
}

const aContents = '''
library a.ng_deps.dart;

import 'package:angular2/src/core/application.dart';
import 'package:angular2/src/core/reflection/reflection_capabilities.dart';
import 'b.dart';

bool _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
}''';

const bContents = '''
library b.ng_deps.dart;

import 'b.dart';
import 'package:angular2/src/core/metadata.dart';

bool _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(DependencyComponent, new ReflectionInfo(
      const [const Component(selector: '[salad]')],
      const [],
      () => new DependencyComponent()
    ));
}
''';

const cContents = '''
library c.ng_deps.dart;

import 'c.dart';
import 'package:angular2/src/core/metadata.dart';
import 'b.dart' as dep;

bool _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(MyComponent, new ReflectionInfo(
      const [
        const Component(
            selector: '[soup]', services: const [dep.DependencyComponent])
      ],
      const [],
      () => new MyComponent()
    ));
}''';
