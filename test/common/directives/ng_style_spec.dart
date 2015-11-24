library angular2.test.common.directives.ng_style_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        TestComponentBuilder,
        beforeEach,
        beforeEachBindings,
        ddescribe,
        xdescribe,
        describe,
        el,
        expect,
        iit,
        inject,
        it,
        xit;
import "package:angular2/src/facade/collection.dart" show StringMapWrapper;
import "package:angular2/core.dart" show Component, View;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/common/directives/ng_style.dart" show NgStyle;

main() {
  describe("binding to CSS styles", () {
    it(
        "should add styles specified in an object literal",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          var template =
              '''<div [ng-style]="{\'max-width\': \'40px\'}"></div>''';
          tcb
              .overrideTemplate(TestComponent, template)
              .createAsync(TestComponent)
              .then((fixture) {
            fixture.detectChanges();
            expect(DOM.getStyle(
                fixture.debugElement.componentViewChildren[0].nativeElement,
                "max-width")).toEqual("40px");
            async.done();
          });
        }));
    it(
        "should add and change styles specified in an object expression",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          var template = '''<div [ng-style]="expr"></div>''';
          tcb
              .overrideTemplate(TestComponent, template)
              .createAsync(TestComponent)
              .then((fixture) {
            Map<String, dynamic> expr;
            fixture.debugElement.componentInstance.expr = {"max-width": "40px"};
            fixture.detectChanges();
            expect(DOM.getStyle(
                fixture.debugElement.componentViewChildren[0].nativeElement,
                "max-width")).toEqual("40px");
            expr = fixture.debugElement.componentInstance.expr;
            expr["max-width"] = "30%";
            fixture.detectChanges();
            expect(DOM.getStyle(
                fixture.debugElement.componentViewChildren[0].nativeElement,
                "max-width")).toEqual("30%");
            async.done();
          });
        }));
    it(
        "should remove styles when deleting a key in an object expression",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          var template = '''<div [ng-style]="expr"></div>''';
          tcb
              .overrideTemplate(TestComponent, template)
              .createAsync(TestComponent)
              .then((fixture) {
            fixture.debugElement.componentInstance.expr = {"max-width": "40px"};
            fixture.detectChanges();
            expect(DOM.getStyle(
                fixture.debugElement.componentViewChildren[0].nativeElement,
                "max-width")).toEqual("40px");
            StringMapWrapper.delete(
                fixture.debugElement.componentInstance.expr, "max-width");
            fixture.detectChanges();
            expect(DOM.getStyle(
                fixture.debugElement.componentViewChildren[0].nativeElement,
                "max-width")).toEqual("");
            async.done();
          });
        }));
    it(
        "should co-operate with the style attribute",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          var template =
              '''<div style="font-size: 12px" [ng-style]="expr"></div>''';
          tcb
              .overrideTemplate(TestComponent, template)
              .createAsync(TestComponent)
              .then((fixture) {
            fixture.debugElement.componentInstance.expr = {"max-width": "40px"};
            fixture.detectChanges();
            expect(DOM.getStyle(
                fixture.debugElement.componentViewChildren[0].nativeElement,
                "max-width")).toEqual("40px");
            expect(DOM.getStyle(
                fixture.debugElement.componentViewChildren[0].nativeElement,
                "font-size")).toEqual("12px");
            StringMapWrapper.delete(
                fixture.debugElement.componentInstance.expr, "max-width");
            fixture.detectChanges();
            expect(DOM.getStyle(
                fixture.debugElement.componentViewChildren[0].nativeElement,
                "max-width")).toEqual("");
            expect(DOM.getStyle(
                fixture.debugElement.componentViewChildren[0].nativeElement,
                "font-size")).toEqual("12px");
            async.done();
          });
        }));
    it(
        "should co-operate with the style.[styleName]=\"expr\" special-case in the compiler",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          var template =
              '''<div [style.font-size.px]="12" [ng-style]="expr"></div>''';
          tcb
              .overrideTemplate(TestComponent, template)
              .createAsync(TestComponent)
              .then((fixture) {
            fixture.debugElement.componentInstance.expr = {"max-width": "40px"};
            fixture.detectChanges();
            expect(DOM.getStyle(
                fixture.debugElement.componentViewChildren[0].nativeElement,
                "max-width")).toEqual("40px");
            expect(DOM.getStyle(
                fixture.debugElement.componentViewChildren[0].nativeElement,
                "font-size")).toEqual("12px");
            StringMapWrapper.delete(
                fixture.debugElement.componentInstance.expr, "max-width");
            expect(DOM.getStyle(
                fixture.debugElement.componentViewChildren[0].nativeElement,
                "font-size")).toEqual("12px");
            fixture.detectChanges();
            expect(DOM.getStyle(
                fixture.debugElement.componentViewChildren[0].nativeElement,
                "max-width")).toEqual("");
            async.done();
          });
        }));
  });
}

@Component(selector: "test-cmp")
@View(directives: const [NgStyle])
class TestComponent {
  var expr;
}
