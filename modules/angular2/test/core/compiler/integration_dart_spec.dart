/// This file contains tests that make sense only in Dart
library angular2.test.di.integration_dart_spec;

import 'package:angular2/angular2.dart';
import 'package:angular2/di.dart';
import 'package:angular2/src/test_lib/test_bed.dart';
import 'package:angular2/test_lib.dart';

class MockException implements Error { var message; var stackTrace; }
class NonError { var message; }

void functionThatThrows() {
  try { throw new MockException(); }
  catch(e, stack) {
    // If we lose the stack trace the message will no longer match
    // the first line in the stack
    e.message = stack.toString().split('\n')[0];
    e.stackTrace = stack;
    rethrow;
  }
}

void functionThatThrowsNonError() {
  try { throw new NonError(); }
  catch(e, stack) {
    // If we lose the stack trace the message will no longer match
    // the first line in the stack
    e.message = stack.toString().split('\n')[0];
    rethrow;
  }
}

main() {
  describe('TypeLiteral', () {
    it('should publish via appInjector',
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

  describe('Error handling', () {
    it('should preserve Error stack traces thrown from components',
        inject([TestBed, AsyncTestCompleter], (tb, async) {
      tb.overrideView(Dummy, new View(
        template: '<throwing-component></throwing-component>',
        directives: [ThrowingComponent]
      ));

      tb.createView(Dummy).catchError((e, stack) {
        expect(stack.toString().split('\n')[0]).toEqual(e.message);
        async.done();
      });
    }));

    it('should preserve non-Error stack traces thrown from components',
        inject([TestBed, AsyncTestCompleter], (tb, async) {
      tb.overrideView(Dummy, new View(
        template: '<throwing-component2></throwing-component2>',
        directives: [ThrowingComponent2]
      ));

      tb.createView(Dummy).catchError((e, stack) {
        expect(stack.toString().split('\n')[0]).toEqual(e.message);
        async.done();
      });
    }));
  });
}

@Component(selector: 'dummy')
class Dummy {}

@Component(
  selector: 'type-literal-component',
  appInjector: const [
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

@Component(
  selector: 'throwing-component'
)
@View(template: '')
class ThrowingComponent {
  ThrowingComponent() {
    functionThatThrows();
  }
}

@Component(
  selector: 'throwing-component2'
)
@View(template: '')
class ThrowingComponent2 {
  ThrowingComponent2() {
    functionThatThrowsNonError();
  }
}
