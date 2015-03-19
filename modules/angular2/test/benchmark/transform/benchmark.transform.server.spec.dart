library angular2.test.benchmark.transform;

import 'package:guinness/guinness.dart';
import 'package:unittest/vm_config.dart';

import 'bind_generator/simple.dart' as bindGenerator;
import 'directive_linker/simple.dart' as directiveLinker;
import 'directive_processor/simple.dart' as directiveProcessor;
import 'integration/hello_world.dart' as helloWorld;
import 'reflection_remover/simple.dart' as reflectionRemover;
import 'template_compiler/inline.dart' as inlineTemplateCompiler;
import 'template_compiler/url.dart' as urlTemplateCompiler;

main() {
  useVMConfiguration();
  describe('Bind Generator Benchmark', bindGenerator.allTests);
  describe('Directive Linker Benchmark', directiveLinker.allTests);
  describe('Directive Processor Benchmark', directiveProcessor.allTests);
  describe('Hello World Transformer Benchmark', helloWorld.allTests);
  describe('Reflection Remover Benchmark', reflectionRemover.allTests);
  describe('Inline Template Compiler Benchmark',
      inlineTemplateCompiler.allTests);
  describe('Url Template Compiler Benchmark', urlTemplateCompiler.allTests);
}
