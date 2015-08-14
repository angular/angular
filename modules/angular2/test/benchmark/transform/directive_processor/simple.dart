library angular2.benchmark.transform.directive_processor.simple;

import 'dart:async';
import 'package:angular2/src/transform/common/options.dart';
import 'package:angular2/src/transform/directive_processor/transformer.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/benchmarks.dart';
import 'package:unittest/unittest.dart';

Future main() => runBenchmark();

allTests() {
  test('Directive Processor Benchmark Runs', runBenchmark);
}

Future runBenchmark() async {
  var options = new TransformerOptions(['this_is_ignored.dart']);
  var files = {new AssetId('a', 'a.dart'): aContents,};
  return new TransformerBenchmark([
    [new DirectiveProcessor(options)]
  ], files).measure();
}

const aContents = '''
library dinner.soup;

import 'package:angular2/src/core/metadata.dart';

@Component(selector: '[soup]')
class SoupComponent {
  SoupComponent(@Tasty String description, @Inject(Salt) salt);
}
''';
