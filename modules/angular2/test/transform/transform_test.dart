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

  testPhases('Simple annotation', [[transform]], {
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

      @Directive(context: 'soup')
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
          reflector
            ..registerType(i1.Component, {
              "factory": () => new i1.Component(),
              "parameters": const [const []],
              "annotations": const [const i2.Directive(context: 'soup')]
            });
          i0.main();
        }
        '''.replaceAll('  ', '')
  }, []);

  testPhases('Annotation with two injected dependencies', [[transform]], {
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

      const contextString = 'soup';

      class MyContext {
        final String s;
        const MyContext(this.s);
      }

    ''',
    'a|web/bar.dart': '''
      library bar;

      import 'package:angular2/src/core/annotations/annotations.dart';
      import 'package:example/initialize.dart';
      import 'package:test_initializers/common.dart';
      import 'foo.dart';

      @Directive(context: const MyContext(contextString))
      class Component2 {
        final MyContext c;
        final String generatedValue;
        Component2(this.c, String inValue) {
          generatedValue = 'generated ' + inValue;
        }
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
          reflector
            ..registerType(i1.Component2, {
              "factory": (i3.MyContext c, String inValue) => new i1.Component2(c, inValue),
              "parameters": const [const [i3.MyContext, String]],
              "annotations": const [const i2.Directive(context: const i3.MyContext(i3.contextString))]
            });
          i0.main();
        }
        '''.replaceAll('  ', '')
  }, []);

  testPhases('Annotation with list of types', [[transform]], {
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
        const MyContext(this.s);
      }

    ''',
      'a|web/bar.dart': '''
      library bar;

      import 'package:angular2/src/core/annotations/annotations.dart';
      import 'package:example/initialize.dart';
      import 'package:test_initializers/common.dart';
      import 'foo.dart';

      @Directive(context: const [MyContext])
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
          reflector
            ..registerType(i1.Component2, {
              "factory": (i3.MyContext c) => new i1.Component2(c),
              "parameters": const [const [i3.MyContext]],
              "annotations": const [const i2.Directive(context: const [i3.MyContext])]
            });
          i0.main();
        }
        '''.replaceAll('  ', '')
  }, []);

  testPhases('Constructor with default value', [[transform]], {
      'a|web/index.html': '''
        <html><head></head><body>
          <script type="application/dart" src="index.dart"></script>
        </body></html>
    '''.replaceAll('  ', ''),
      'a|web/index.dart': '''
        library web_foo;

        import 'bar.dart';

        void main() {
          new Component2();
        }
    ''',
      'a|web/bar.dart': '''
      library bar;

      import 'package:angular2/src/core/annotations/annotations.dart';
      import 'package:example/initialize.dart';
      import 'package:test_initializers/common.dart';

      @Directive(context: 'soup')
      class Component2 {
        final dynamic c;
        Component2(this.c = 'sandwich');
      }

    ''',
      'angular2|lib/src/core/annotations/annotations.dart': mockDirective,
  }, {
      'a|web/index.bootstrap.dart': '''
        import 'package:angular2/src/reflection/reflection.dart' show reflector;
        import 'index.dart' as i0;
        import 'bar.dart' as i1;
        import 'package:angular2/src/core/annotations/annotations.dart' as i2;

        main() {
          reflector
            ..registerType(i1.Component2, {
              "factory": (dynamic c) => new i1.Component2(c),
              "parameters": const [const [dynamic]],
              "annotations": const [const i2.Directive(context: 'soup')]
            });
          i0.main();
        }
        '''.replaceAll('  ', '')
  }, []);
}
