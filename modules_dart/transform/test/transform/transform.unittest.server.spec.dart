library angular2.test.transform.transform.old.spec;

import 'package:guinness/guinness.dart';
import 'package:unittest/unittest.dart' hide expect;
import 'package:unittest/vm_config.dart';

import 'deferred_rewriter/all_tests.dart' as deferredRewriter;
import 'directive_metadata_linker/all_tests.dart' as directiveMeta;
import 'reflection_remover/all_tests.dart' as reflectionRemover;
import 'template_compiler/all_tests.dart' as templateCompiler;
import 'stylesheet_compiler/all_tests.dart' as stylesheetCompiler;

main() {
  useVMConfiguration();
  describe('Directive Metadata Linker', directiveMeta.allTests);
  describe('Reflection Remover', reflectionRemover.allTests);
  describe('Template Compiler', templateCompiler.allTests);
  describe('Deferred Rewriter', deferredRewriter.allTests);
  describe('Stylesheet Compiler', stylesheetCompiler.allTests);
}
