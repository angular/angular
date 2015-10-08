library angular2.test.transform.integration.deferred;

// This stored as a constant because we need to be careful to avoid modifying
// source lines for files we rewrite.
// That is, we expect that modifications we make to input files do not change
// line numbers, and storing this expected output as code would allow it to be
// formatted, breaking our tests.
const indexContents = '''
library web_foo;

import 'index.ng_deps.dart' as ngStaticInit;import 'bar.ng_deps.dart' deferred as bar;

void main() {
  bar.loadLibrary().then((_) {bar.initReflector();}).then((_) {
    bar.execImmediate();
  });
}
''';
