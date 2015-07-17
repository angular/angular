// Because Angular is using dart:html, we need these tests to run on an actual
// browser. This means that it should be run with `-p dartium` or `-p chrome`.
@TestOn("browser")
import "package:test/test.dart"; // Instead, import angular test lib?
import "package:angular2/angular2.dart"
    show Component, View, NgFor, Injector, Key;
import "package:angular2/test.dart"
    show TestComponentBuilder, inject, createTestInjector;
import 'package:angular2/src/dom/browser_adapter.dart'; // for BrowserDomAdapter
import 'package:angular2/src/reflection/reflection.dart'; // for reflector
import 'package:angular2/src/reflection/reflection_capabilities.dart'; // For ReflectionCapabilities

// This is the component we will be testing.
@Component(selector: 'test-cmp')
@View(directives: const [NgFor])
class TestComponent {
  List<num> items;
  TestComponent() {
    this.items = [1, 2];
  }
}

void main() {
  test("normal, synchronous test", () {
    var string = "foo,bar,baz";
    expect(string.split(","), equals(["foo", "bar", "baz"]));
  });

  var TEMPLATE =
      "<div><copy-me template=\"ng-for #item of items\">{{item.toString()}};</copy-me></div>";

  test("create a component using the TCB", () {
    BrowserDomAdapter.makeCurrent();
    reflector.reflectionCapabilities = new ReflectionCapabilities();

    Injector testInjector = createTestInjector([]);

    inject([TestComponentBuilder], (TestComponentBuilder tcb) {
      var future = tcb
          .overrideTemplate(TestComponent, TEMPLATE)
          .createAsync(TestComponent)
          .then((rootTC) {
        rootTC.detectChanges();
        expect(rootTC.nativeElement.text, equals("1;2;"));
      });

      expect(future, completes);
    }).execute(testInjector);
  });

  test("should reflect added elements", () {
    BrowserDomAdapter.makeCurrent();
    reflector.reflectionCapabilities = new ReflectionCapabilities();

    Injector testInjector = createTestInjector([]);

    inject([TestComponentBuilder], (TestComponentBuilder tcb) {
      var future = tcb
          .overrideTemplate(TestComponent, TEMPLATE)
          .createAsync(TestComponent)
          .then((rootTC) {
        rootTC.detectChanges();
        ((rootTC.componentInstance.items as List<num>)).add(3);
        rootTC.detectChanges();
        expect(rootTC.nativeElement.text, equals("1;2;3;"));
      });
      expect(future, completes);
    }).execute(testInjector);
  });
}
