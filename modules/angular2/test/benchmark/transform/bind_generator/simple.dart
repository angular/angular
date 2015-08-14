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

Future<double> runBenchmark() async {
  var options = new TransformerOptions(['this_is_ignored.dart']);
  var files = {new AssetId('a', 'a.ng_deps.dart'): aContents};
  return new TransformerBenchmark([
    [new BindGenerator(options)]
  ], files).measure();
}

const aContents = '''
library bar.ng_deps.dart;

import 'bar.dart';
import 'package:angular2/src/core/metadata.dart';

bool _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(ToolTip, new ReflectionInfo(
      const [
        const Decorator(
            selector: '[tool-tip]', bind: const {'text': 'tool-tip'})
      ],
      const [],
      () => new ToolTip()
    ));
}''';
