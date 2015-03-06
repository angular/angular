library angular2.test.transform;

import 'package:unittest/unittest.dart';
import 'package:unittest/vm_config.dart';

import 'directive_processor/all_tests.dart' as directiveProcessor;
import 'integration/all_tests.dart' as integration;
import 'reflection_remover/all_tests.dart' as reflectionRemover;

main() {
  useVMConfiguration();
  group('Directive Processor', directiveProcessor.allTests);
  group('Reflection Remover', reflectionRemover.allTests);
  group('Transformer Pipeline', integration.allTests);
}
