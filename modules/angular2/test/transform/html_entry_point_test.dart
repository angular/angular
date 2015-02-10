library angular2.test;

import 'package:barback/barback.dart';
import 'package:angular2/transformer.dart';
import 'package:code_transformers/tests.dart';
import 'package:unittest/unittest.dart';
import 'package:unittest/vm_config.dart';

import 'common.dart';

main() {
  useVMConfiguration();

  var transform = new AngularTransformer(new TransformerOptions(
      'web/index.dart', 'web/index.bootstrap.dart', 'web/index.html'));

  testPhases('Ensure bootstrap file is created & html entry point is patched', [
    [transform]
  ], {
    'a|web/index.html': htmlEntryPointContent,
    'a|web/index.dart': '''
        library web_foo;

        import 'package:angular2/src/core/annotations/annotations.dart';

        void main() {
        }
    ''',
    // Mock out the Directive annotation.
    'angular2|lib/src/core/annotations/annotations.dart': mockDirective,
  }, {
    'a|web/index.html': '''
        <html><head></head><body>
          <script type="application/dart" src="index.bootstrap.dart"></script>

        </body></html>'''.replaceAll('  ', '')
  }, []);
}
