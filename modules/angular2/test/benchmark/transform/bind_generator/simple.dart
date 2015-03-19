library angular2.benchmark.transform.bind_generator.simple;

import 'dart:async';
import 'package:angular2/src/transform/common/options.dart';
import 'package:angular2/src/transform/bind_generator/transformer.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/benchmarks.dart';
import 'package:unittest/unittest.dart';

Future main() => runBenchmark();

allTests() {
  test('Bind Generator Benchmark Runs', runBenchmark);
}

Future runBenchmark() async {
  var options = new TransformerOptions(['this_is_ignored.dart']);
  var files = {new AssetId('a', 'a.ng_deps.dart'): aContents};
  var benchmark =
      new TransformerBenchmark([[new BindGenerator(options)]], files);
  print('\nRunning bind_generator benchmark...');
  var result = await benchmark.measure();
  print('Done, took ${result.round()}μs on average.');
}

const aContents = '''
library bar.ng_deps.dart;

import 'bar.dart';
import 'package:angular2/src/core/annotations/annotations.dart';

bool _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(ToolTip, {
      'factory': () => new ToolTip(),
      'parameters': const [],
      'annotations': const [
        const Decorator(
            selector: '[tool-tip]', bind: const {'text': 'tool-tip'})
      ]
    });
}''';
