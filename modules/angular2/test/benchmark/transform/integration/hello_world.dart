library angular2.benchmark.transform.integration.hello_world;

import 'dart:async';
import 'package:angular2/src/transform/common/options.dart';
import 'package:angular2/src/transform/transformer.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/benchmarks.dart';
import 'package:unittest/unittest.dart';

Future main() => runBenchmark();

allTests() {
  test('Hello World Benchmark Runs', runBenchmark);
}

Future runBenchmark() async {
  var options = new TransformerOptions(['index.dart']);
  var files = {
    new AssetId('a', 'web/index.dart'): indexContents,
    new AssetId('a', 'web/index_common.dart'): indexCommonContents,
  };
  var benchmark = new TransformerBenchmark(
      new AngularTransformerGroup(options).phases, files);
  print('\nRunning hello_world benchmark...');
  var result = await benchmark.measure();
  print('Done, took ${result.round()}μs on average.');
}

const indexContents = '''
library examples.src.hello_world.index;

import "index_common.dart" as app;
import "package:angular2/src/reflection/reflection.dart" show reflector;
import "package:angular2/src/reflection/reflection_capabilities.dart"
    show ReflectionCapabilities;

main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  app.main();
}
''';

const indexCommonContents = '''
library examples.src.hello_world.index_common;

import "package:angular2/angular2.dart"
    show bootstrap, Component, Decorator, Template, NgElement;
import "package:angular2/di.dart" show Injectable;

@Component(selector: "hello-app", services: const [GreetingService])
@Template(
    inline: '<div class="greeting">{{greeting}} <span red>world</span>!</div>'
        '<button class="changeButton" (click)="changeGreeting()">'
        'change greeting</button><content></content>',
    directives: const [RedDec])
class HelloCmp {
  String greeting;
  HelloCmp(GreetingService service) {
    this.greeting = service.greeting;
  }
  changeGreeting() {
    this.greeting = "howdy";
  }
}

@Decorator(selector: "[red]")
class RedDec {
  RedDec(NgElement el) {
    el.domElement.style.color = "red";
  }
}

@Injectable()
class GreetingService {
  String greeting;
  GreetingService() {
    this.greeting = "hello";
  }
}

main() {
  bootstrap(HelloCmp);
}
''';
