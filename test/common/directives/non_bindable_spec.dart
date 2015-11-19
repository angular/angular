library angular2.test.common.directives.non_bindable_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        TestComponentBuilder,
        beforeEach,
        ddescribe,
        describe,
        el,
        expect,
        iit,
        inject,
        it,
        xit;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/core.dart" show Component, Directive, View;
import "package:angular2/src/core/linker/element_ref.dart" show ElementRef;

main() {
  describe("non-bindable", () {
    it(
        "should not interpolate children",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          var template =
              "<div>{{text}}<span ng-non-bindable>{{text}}</span></div>";
          tcb
              .overrideTemplate(TestComponent, template)
              .createAsync(TestComponent)
              .then((fixture) {
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement)
                .toHaveText("foo{{text}}");
            async.done();
          });
        }));
    it(
        "should ignore directives on child nodes",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          var template =
              "<div ng-non-bindable><span id=child test-dec>{{text}}</span></div>";
          tcb
              .overrideTemplate(TestComponent, template)
              .createAsync(TestComponent)
              .then((fixture) {
            fixture.detectChanges();
            // We must use DOM.querySelector instead of fixture.query here

            // since the elements inside are not compiled.
            var span =
                DOM.querySelector(fixture.debugElement.nativeElement, "#child");
            expect(DOM.hasClass(span, "compiled")).toBeFalsy();
            async.done();
          });
        }));
    it(
        "should trigger directives on the same node",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          var template =
              "<div><span id=child ng-non-bindable test-dec>{{text}}</span></div>";
          tcb
              .overrideTemplate(TestComponent, template)
              .createAsync(TestComponent)
              .then((fixture) {
            fixture.detectChanges();
            var span =
                DOM.querySelector(fixture.debugElement.nativeElement, "#child");
            expect(DOM.hasClass(span, "compiled")).toBeTruthy();
            async.done();
          });
        }));
  });
}

@Directive(selector: "[test-dec]")
class TestDirective {
  TestDirective(ElementRef el) {
    DOM.addClass(el.nativeElement, "compiled");
  }
}

@Component(selector: "test-cmp")
@View(directives: const [TestDirective])
class TestComponent {
  String text;
  TestComponent() {
    this.text = "foo";
  }
}
