library angular2.test.transform;

import 'package:unittest/unittest.dart';
import 'package:unittest/vm_config.dart';

import 'bind_generator/all_tests.dart' as bindGenerator;
import 'directive_linker/all_tests.dart' as directiveLinker;
import 'directive_processor/all_tests.dart' as directiveProcessor;
import 'integration/all_tests.dart' as integration;
import 'reflection_remover/all_tests.dart' as reflectionRemover;
import 'template_compiler/all_tests.dart' as templateCompiler;

main() {
  useVMConfiguration();
  group('Bind Generator', bindGenerator.allTests);
  group('Directive Linker', directiveLinker.allTests);
  group('Directive Processor', directiveProcessor.allTests);
  group('Reflection Remover', reflectionRemover.allTests);
  group('Template Compiler', templateCompiler.allTests);
  group('Transformer Pipeline', integration.allTests);
}
