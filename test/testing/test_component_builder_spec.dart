library angular2.test.testing.test_component_builder_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        ddescribe,
        xdescribe,
        describe,
        dispatchEvent,
        expect,
        iit,
        inject,
        beforeEachProviders,
        it,
        xit,
        TestComponentBuilder;
import "package:angular2/core.dart" show Injectable, provide;
import "package:angular2/common.dart" show NgIf;
import "package:angular2/src/core/metadata.dart"
    show Directive, Component, View, ViewMetadata;

@Component(selector: "child-comp")
@View(
    template: '''<span>Original {{childBinding}}</span>''',
    directives: const [])
@Injectable()
class ChildComp {
  String childBinding;
  ChildComp() {
    this.childBinding = "Child";
  }
}

@Component(selector: "child-comp")
@View(template: '''<span>Mock</span>''')
@Injectable()
class MockChildComp {}

@Component(selector: "parent-comp")
@View(
    template: '''Parent(<child-comp></child-comp>)''',
    directives: const [ChildComp])
@Injectable()
class ParentComp {}

@Component(selector: "my-if-comp")
@View(
    template: '''MyIf(<span *ng-if="showMore">More</span>)''',
    directives: const [NgIf])
@Injectable()
class MyIfComp {
  bool showMore = false;
}

@Component(selector: "child-child-comp")
@View(template: '''<span>ChildChild</span>''')
@Injectable()
class ChildChildComp {}

@Component(selector: "child-comp")
@View(
    template:
        '''<span>Original {{childBinding}}(<child-child-comp></child-child-comp>)</span>''',
    directives: const [ChildChildComp])
@Injectable()
class ChildWithChildComp {
  String childBinding;
  ChildWithChildComp() {
    this.childBinding = "Child";
  }
}

@Component(selector: "child-child-comp")
@View(template: '''<span>ChildChild Mock</span>''')
@Injectable()
class MockChildChildComp {}

class FancyService {
  String value = "real value";
}

class MockFancyService extends FancyService {
  String value = "mocked out value";
}

@Component(selector: "my-service-comp", bindings: const [FancyService])
@View(template: '''injected value: {{fancyService.value}}''')
class TestBindingsComp {
  FancyService fancyService;
  TestBindingsComp(this.fancyService) {}
}

@Component(selector: "my-service-comp", viewProviders: const [FancyService])
@View(template: '''injected value: {{fancyService.value}}''')
class TestViewBindingsComp {
  FancyService fancyService;
  TestViewBindingsComp(this.fancyService) {}
}

main() {
  describe("test component builder", () {
    it(
        "should instantiate a component with valid DOM",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(ChildComp).then((componentFixture) {
            componentFixture.detectChanges();
            expect(componentFixture.nativeElement).toHaveText("Original Child");
            async.done();
          });
        }));
    it(
        "should allow changing members of the component",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(MyIfComp).then((componentFixture) {
            componentFixture.detectChanges();
            expect(componentFixture.nativeElement).toHaveText("MyIf()");
            componentFixture.componentInstance.showMore = true;
            componentFixture.detectChanges();
            expect(componentFixture.nativeElement).toHaveText("MyIf(More)");
            async.done();
          });
        }));
    it(
        "should override a template",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb
              .overrideTemplate(MockChildComp, "<span>Mock</span>")
              .createAsync(MockChildComp)
              .then((componentFixture) {
            componentFixture.detectChanges();
            expect(componentFixture.nativeElement).toHaveText("Mock");
            async.done();
          });
        }));
    it(
        "should override a view",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb
              .overrideView(
                  ChildComp,
                  new ViewMetadata(
                      template: "<span>Modified {{childBinding}}</span>"))
              .createAsync(ChildComp)
              .then((componentFixture) {
            componentFixture.detectChanges();
            expect(componentFixture.nativeElement).toHaveText("Modified Child");
            async.done();
          });
        }));
    it(
        "should override component dependencies",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb
              .overrideDirective(ParentComp, ChildComp, MockChildComp)
              .createAsync(ParentComp)
              .then((componentFixture) {
            componentFixture.detectChanges();
            expect(componentFixture.nativeElement).toHaveText("Parent(Mock)");
            async.done();
          });
        }));
    it(
        "should override child component's dependencies",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb
              .overrideDirective(ParentComp, ChildComp, ChildWithChildComp)
              .overrideDirective(
                  ChildWithChildComp, ChildChildComp, MockChildChildComp)
              .createAsync(ParentComp)
              .then((componentFixture) {
            componentFixture.detectChanges();
            expect(componentFixture.nativeElement)
                .toHaveText("Parent(Original Child(ChildChild Mock))");
            async.done();
          });
        }));
    it(
        "should override a provider",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.overrideProviders(TestBindingsComp, [
            provide(FancyService, useClass: MockFancyService)
          ]).createAsync(TestBindingsComp).then((componentFixture) {
            componentFixture.detectChanges();
            expect(componentFixture.nativeElement)
                .toHaveText("injected value: mocked out value");
            async.done();
          });
        }));
    it(
        "should override a viewBinding",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.overrideViewProviders(TestViewBindingsComp, [
            provide(FancyService, useClass: MockFancyService)
          ]).createAsync(TestViewBindingsComp).then((componentFixture) {
            componentFixture.detectChanges();
            expect(componentFixture.nativeElement)
                .toHaveText("injected value: mocked out value");
            async.done();
          });
        }));
  });
}
