library angular2.test.transform;

import 'package:guinness/guinness.dart';
import 'package:unittest/unittest.dart' hide expect;
import 'package:unittest/vm_config.dart';

import 'bind_generator/all_tests.dart' as bindGenerator;
import 'directive_linker/all_tests.dart' as directiveLinker;
import 'directive_metadata_extractor/all_tests.dart' as directiveMeta;
import 'directive_processor/all_tests.dart' as directiveProcessor;
import 'integration/all_tests.dart' as integration;
import 'reflection_remover/all_tests.dart' as reflectionRemover;
import 'template_compiler/all_tests.dart' as templateCompiler;

main() {
  useVMConfiguration();
  describe('Bind Generator', bindGenerator.allTests);
  describe('Directive Linker', directiveLinker.allTests);
  describe('Directive Metadata Extractor', directiveMeta.allTests);
  describe('Directive Processor', directiveProcessor.allTests);
  describe('Reflection Remover', reflectionRemover.allTests);
  describe('Template Compiler', templateCompiler.allTests);
  // NOTE(kegluneq): These use `code_transformers#testPhases`, which is not
  // designed to work with `guinness`.
  group('Transformer Pipeline', integration.allTests);
}
