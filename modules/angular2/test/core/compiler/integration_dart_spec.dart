/// This file contains tests that make sense only in Dart
library angular2.test.di.integration_dart_spec;

import 'package:angular2/angular2.dart';
import 'package:angular2/di.dart';
import 'package:angular2/src/test_lib/test_bed.dart';
import 'package:angular2/test_lib.dart';

main() {
  describe('TypeLiteral', () {
    it('should publish via injectables',
        inject([TestBed, AsyncTestCompleter], (tb, async) {
      tb.overrideView(Dummy, new View(
        template: '<type-literal-component></type-literal-component>',
        directives: [TypeLiteralComponent]
      ));

      tb.createView(Dummy).then((view) {
        view.detectChanges();
        expect(view.rootNodes).toHaveText('[Hello, World]');
        async.done();
      });
    }));
  });
}

@Component(selector: 'dummy')
class Dummy {}

@Component(
  selector: 'type-literal-component',
  injectables: const [
      const Binding(
          const TypeLiteral<List<String>>(),
          toValue: const <String>['Hello', 'World'])
  ]
)
@View(
  template: '{{list}}'
)
class TypeLiteralComponent {
  final List<String> list;

  TypeLiteralComponent(this.list);
}
