library angular2.benchmark.transform.reflection_remover.simple;

import 'dart:async';
import 'package:angular2/src/transform/common/options.dart';
import 'package:angular2/src/transform/reflection_remover/transformer.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/benchmarks.dart';
import 'package:unittest/unittest.dart';

Future main() => runBenchmark();

allTests() {
  test('Reflection Remover Benchmark Runs', runBenchmark);
}

Future runBenchmark() async {
  var options = new TransformerOptions(['web/index.dart']);
  var files = {new AssetId('a', 'web/index.dart'): indexContents,};
  return new TransformerBenchmark([
    [new ReflectionRemover(options)]
  ], files).measure();
}

const indexContents = '''
library web_foo;

import 'package:angular2/bootstrap.dart';
import 'package:angular2/src/core/reflection/reflection.dart';
import 'package:angular2/src/core/reflection/reflection_capabilities.dart';

void main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  bootstrap(MyComponent);
}''';
