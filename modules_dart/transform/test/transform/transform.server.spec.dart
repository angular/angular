@TestOn('vm')
library angular2.test.transform.transform.server.spec;

import 'package:test/test.dart';

import 'common/annotation_matcher_test.dart' as annotationMatcher;
import 'common/async_string_writer_tests.dart' as asyncStringWriter;
import 'common/code/ng_deps_code_tests.dart' as ngDepsCode;
import 'common/ng_meta_test.dart' as ngMetaTest;
import 'common/url_resolver_tests.dart' as urlResolver;

main() {
  group('AnnotationMatcher', annotationMatcher.allTests);
  group('AsyncStringWriter', asyncStringWriter.allTests);
  group('NgDepsCode', ngDepsCode.allTests);
  group('NgMeta', ngMetaTest.allTests);
  group('Url Resolver', urlResolver.allTests);
}
