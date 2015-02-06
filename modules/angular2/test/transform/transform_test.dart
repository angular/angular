library angular2.test;

import 'package:barback/barback.dart';
import 'package:angular2/transformer.dart';
import 'package:code_transformers/tests.dart';
import 'package:unittest/unittest.dart';
import 'package:unittest/vm_config.dart';

import 'common.dart';

main() {
  useVMConfiguration();

  var transform = new AngularTransformer(
      'web/index.dart', 'web/index.bootstrap.dart', 'web/index.html');

  testPhases('Codegen for simple annotation', [[transform]], {
    'a|web/index.html': htmlEntryPointContent,
    'a|web/index.dart': '''
        library web_foo;

        import 'bar.dart';

        void main() {
          new Component2('Things');
        }
    ''',
    'a|web/bar.dart': '''
      library bar;

      import 'package:angular2/src/core/annotations/annotations.dart';
      import 'package:example/initialize.dart';
      import 'package:test_initializers/common.dart';

      @Directive(selector: 'soup')
      class Component {
        Component();
      }

    ''',
    // Mock out the Directive annotation.
    'angular2|lib/src/core/annotations/annotations.dart': mockDirective,
  }, {
    'a|web/index.bootstrap.dart': '''
        import 'package:angular2/src/reflection/reflection.dart' show reflector;
        import 'index.dart' as i0;
        import 'bar.dart' as i1;
        import 'package:angular2/src/core/annotations/annotations.dart' as i2;

        main() {
          /* NOTE(tjblasi): Breaks function until we have "annotations" generated correctly.
          reflector
            ..registerType(i1.Component, {
              "factory": () => new i1.Component(),
              "parameters": const [const []]
            });
          */
          i0.main();
        }
        '''.replaceAll('  ', '')
  }, []);

  testPhases('Codegen for annotation with injected dependency', [[transform]], {
    'a|web/index.html': '''
        <html><head></head><body>
          <script type="application/dart" src="index.dart"></script>
        </body></html>
    '''.replaceAll('  ', ''),
    'a|web/index.dart': '''
        library web_foo;

        import 'bar.dart';

        void main() {
          new Component2('Things');
        }
    ''',
    'a|web/foo.dart': '''
      library foo;

      class MyContext {
        final String s;
        MyContext(this.s);
      }

    ''',
    'a|web/bar.dart': '''
      library bar;

      import 'package:angular2/src/core/annotations/annotations.dart';
      import 'package:example/initialize.dart';
      import 'package:test_initializers/common.dart';
      import 'foo.dart';

      @Directive(selector: 'soup')
      class Component2 {
        final MyContext c;
        Component2(this.c);
      }

    ''',
    'angular2|lib/src/core/annotations/annotations.dart': mockDirective,
  }, {
    'a|web/index.bootstrap.dart': '''
        import 'package:angular2/src/reflection/reflection.dart' show reflector;
        import 'index.dart' as i0;
        import 'bar.dart' as i1;
        import 'package:angular2/src/core/annotations/annotations.dart' as i2;
        import 'foo.dart' as i3;

        main() {
          /* NOTE(tjblasi): Breaks function until we have "annotations" generated correctly.
          reflector
            ..registerType(i1.Component2, {
              "factory": (i3.MyContext c) => new i1.Component2(c),
              "parameters": const [const [i3.MyContext]]
            });
          */
          i0.main();
        }
        '''.replaceAll('  ', '')
  }, []);
}
