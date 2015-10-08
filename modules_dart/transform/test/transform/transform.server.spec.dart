library angular2.test.transform;

import 'package:guinness/guinness.dart';
import 'package:unittest/unittest.dart' hide expect;
import 'package:unittest/vm_config.dart';

import 'common/async_string_writer_tests.dart' as asyncStringWriter;
import 'common/code/ng_deps_code_tests.dart' as ngDepsCode;
import 'common/ng_meta_test.dart' as ngMetaTest;
import 'common/url_resolver_tests.dart' as urlResolver;
import 'bind_generator/all_tests.dart' as bindGenerator;
import 'deferred_rewriter/all_tests.dart' as deferredRewriter;
import 'directive_metadata_linker/all_tests.dart' as directiveMeta;
import 'directive_processor/all_tests.dart' as directiveProcessor;
import 'inliner_for_test/all_tests.dart' as inliner;
import 'integration/all_tests.dart' as integration;
import 'reflection_remover/all_tests.dart' as reflectionRemover;
import 'template_compiler/all_tests.dart' as templateCompiler;
import 'stylesheet_compiler/all_tests.dart' as stylesheetCompiler;

main() {
  useVMConfiguration();
  describe('AsyncStringWriter', asyncStringWriter.allTests);
  describe('NgDepsCode', ngDepsCode.allTests);
  describe('NgMeta', ngMetaTest.allTests);
  describe('Bind Generator', bindGenerator.allTests);
  describe('Directive Metadata Linker', directiveMeta.allTests);
  describe('Directive Processor', directiveProcessor.allTests);
  describe('Inliner For Test', inliner.allTests);
  describe('Reflection Remover', reflectionRemover.allTests);
  describe('Template Compiler', templateCompiler.allTests);
  describe('Deferred Rewriter', deferredRewriter.allTests);
  describe('Stylesheet Compiler', stylesheetCompiler.allTests);
  describe('Url Resolver', urlResolver.allTests);
  // NOTE(kegluneq): These use `code_transformers#testPhases`, which is not
  // designed to work with `guinness`.
  group('Transformer Pipeline', integration.allTests);
}
