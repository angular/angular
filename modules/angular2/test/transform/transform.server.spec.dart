library angular2.test.transform;

import 'package:unittest/unittest.dart';
import 'package:unittest/vm_config.dart';

import 'bind_generator/all_tests.dart' as bindGenerator;
import 'directive_processor/all_tests.dart' as directiveProcessor;
import 'integration/all_tests.dart' as integration;
import 'reflection_remover/all_tests.dart' as reflectionRemover;
import 'template_parser/all_tests.dart' as templateParser;

main() {
  useVMConfiguration();
  group('Bind Generator', bindGenerator.allTests);
  group('Directive Processor', directiveProcessor.allTests);
  group('Reflection Remover', reflectionRemover.allTests);
  group('Transformer Pipeline', integration.allTests);
  group('Template Parser', templateParser.allTests);
}
