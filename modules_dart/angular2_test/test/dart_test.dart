// Because Angular is using dart:html, we need these tests to run on an actual
// browser. This means that it should be run with `-p dartium` or `-p chrome`.
@TestOn("browser")
import "package:angular2/angular2.dart"
    show Component, View, NgFor, Injector, Key;

import 'package:angular2/src/dom/browser_adapter.dart'; // for BrowserDomAdapter
import 'package:angular2/src/reflection/reflection.dart'; // for reflector
import 'package:angular2/src/reflection/reflection_capabilities.dart'; // For ReflectionCapabilities

import 'package:angular2/src/test_lib/test_component_builder.dart';
import 'package:angular2/src/test_lib/test_injector.dart';

import "package:test/test.dart"; // Instead, import angular test lib?

// This is the component we will be testing.
@Component(selector: 'test-cmp')
@View(directives: const [NgFor])
class TestComponent {
  List<num> items;
  TestComponent() {
    this.items = [1, 2];
  }
}

const TEMPLATE =
    "<div><copy-me template=\"ng-for #item of items\">{{item.toString()}};</copy-me></div>";

void main() {
  test("create a component using the TCB", () async {
    BrowserDomAdapter.makeCurrent();
    reflector.reflectionCapabilities = new ReflectionCapabilities();

    Injector testInjector = createTestInjector([]);

    await inject([TestComponentBuilder], (TestComponentBuilder tcb) async {
      var rootTC = await tcb
          .overrideTemplate(TestComponent, TEMPLATE)
          .createAsync(TestComponent);

      rootTC.detectChanges();
      expect(rootTC.nativeElement.text, equals("1;2;"));
    }).execute(testInjector);
  });

  test("should reflect added elements", () async {
    BrowserDomAdapter.makeCurrent();
    reflector.reflectionCapabilities = new ReflectionCapabilities();

    Injector testInjector = createTestInjector([]);

    await inject([TestComponentBuilder], (TestComponentBuilder tcb) async {
      var rootTC = await tcb
          .overrideTemplate(TestComponent, TEMPLATE)
          .createAsync(TestComponent);

      rootTC.detectChanges();
      ((rootTC.componentInstance.items as List<num>)).add(3);
      rootTC.detectChanges();
      expect(rootTC.nativeElement.text, equals("1;2;3;"));
    }).execute(testInjector);
  });
}
