library angular2.test.benchmark.transform.run_all;

import 'package:angular2/src/transform/common/formatter.dart' as formatter;
import 'package:dart_style/dart_style.dart';

import 'bind_generator/simple.dart' as bindGenerator;
import 'directive_linker/simple.dart' as directiveLinker;
import 'directive_processor/simple.dart' as directiveProcessor;
import 'integration/hello_world.dart' as helloWorld;
import 'reflection_remover/simple.dart' as reflectionRemover;
import 'template_compiler/inline.dart' as inlineTemplateCompiler;
import 'template_compiler/url.dart' as urlTemplateCompiler;

main() async {
  formatter.init(new DartFormatter());
  printResult('BindGenerator', await bindGenerator.runBenchmark());
  printResult('DirectiveLinker', await directiveLinker.runBenchmark());
  printResult('HelloWorld', await helloWorld.runBenchmark());
  printResult('ReflectionRemover', await reflectionRemover.runBenchmark());
  printResult(
      'InlineTemplateCompiler', await inlineTemplateCompiler.runBenchmark());
  printResult('UrlTemplateCompiler', await urlTemplateCompiler.runBenchmark());
}

void printResult(String name, double result) {
  print('ng2.transform.$name(RunTime): $result us.');
}
