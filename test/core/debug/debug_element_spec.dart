library angular2.test.core.debug.debug_element_spec;

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
        beforeEachBindings,
        it,
        xit,
        TestComponentBuilder;
import "package:angular2/src/core/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/facade/async.dart"
    show PromiseWrapper, EventEmitter, ObservableWrapper;
import "package:angular2/core.dart" show Injectable, NgFor, NgIf;
import "package:angular2/src/core/debug.dart" show By, Scope;
import "package:angular2/src/core/metadata.dart"
    show Directive, Component, View;

@Injectable()
class Logger {
  List<String> log;
  Logger() {
    this.log = [];
  }
  add(String thing) {
    this.log.add(thing);
  }
}

@Directive(selector: "[message]", inputs: const ["message"])
@Injectable()
class MessageDir {
  Logger logger;
  MessageDir(Logger logger) {
    this.logger = logger;
  }
  set message(newMessage) {
    this.logger.add(newMessage);
  }
}

@Component(selector: "child-comp")
@View(
    template: '''<div class="child" message="child">
               <span class="childnested" message="nestedchild">Child</span>
             </div>
             <span class="child" [inner-html]="childBinding"></span>''',
    directives: const [MessageDir])
@Injectable()
class ChildComp {
  String childBinding;
  ChildComp() {
    this.childBinding = "Original";
  }
}

@Component(selector: "cond-content-comp", viewProviders: const [Logger])
@View(
    template:
        '''<div class="child" message="child" *ng-if="false"><ng-content></ng-content></div>''',
    directives: const [NgIf, MessageDir])
@Injectable()
class ConditionalContentComp {}

@Component(selector: "parent-comp", viewProviders: const [Logger])
@View(
    template: '''<div class="parent" message="parent">
               <span class="parentnested" message="nestedparent">Parent</span>
             </div>
             <span class="parent" [inner-html]="parentBinding"></span>
             <child-comp class="child-comp-class"></child-comp>
             <cond-content-comp class="cond-content-comp-class"></cond-content-comp>''',
    directives: const [ChildComp, MessageDir, ConditionalContentComp])
@Injectable()
class ParentComp {
  String parentBinding;
  ParentComp() {
    this.parentBinding = "OriginalParent";
  }
}

@Directive(selector: "custom-emitter", outputs: const ["myevent"])
@Injectable()
class CustomEmitter {
  EventEmitter<dynamic> myevent;
  CustomEmitter() {
    this.myevent = new EventEmitter();
  }
}

@Component(selector: "events-comp")
@View(
    template: '''<button (click)="handleClick()"></button>
             <custom-emitter (myevent)="handleCustom()"></custom-emitter>''',
    directives: const [CustomEmitter])
@Injectable()
class EventsComp {
  bool clicked;
  bool customed;
  EventsComp() {
    this.clicked = false;
    this.customed = false;
  }
  handleClick() {
    this.clicked = true;
  }

  handleCustom() {
    this.customed = true;
  }
}

@Component(selector: "using-for", viewProviders: const [Logger])
@View(
    template: '''<span *ng-for="#thing of stuff" [inner-html]="thing"></span>
            <ul message="list">
              <li *ng-for="#item of stuff" [inner-html]="item"></li>
            </ul>''',
    directives: const [NgFor, MessageDir])
@Injectable()
class UsingFor {
  List<String> stuff;
  UsingFor() {
    this.stuff = ["one", "two", "three"];
  }
}

main() {
  describe("debug element", () {
    it(
        "should list component child elements",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(ParentComp).then((componentFixture) {
            componentFixture.detectChanges();
            var childEls = componentFixture.debugElement.children;
            // The root is a lone component, and has no children in the light dom.
            expect(childEls.length).toEqual(0);
            var rootCompChildren =
                componentFixture.debugElement.componentViewChildren;
            // The root component has 4 elements in its shadow view.
            expect(rootCompChildren.length).toEqual(4);
            expect(DOM.hasClass(rootCompChildren[0].nativeElement, "parent"))
                .toBe(true);
            expect(DOM.hasClass(rootCompChildren[1].nativeElement, "parent"))
                .toBe(true);
            expect(DOM.hasClass(
                    rootCompChildren[2].nativeElement, "child-comp-class"))
                .toBe(true);
            expect(DOM.hasClass(rootCompChildren[3].nativeElement,
                "cond-content-comp-class")).toBe(true);
            var nested = rootCompChildren[0].children;
            expect(nested.length).toEqual(1);
            expect(DOM.hasClass(nested[0].nativeElement, "parentnested"))
                .toBe(true);
            var childComponent = rootCompChildren[2];
            expect(childComponent.children.length).toEqual(0);
            var childCompChildren = childComponent.componentViewChildren;
            expect(childCompChildren.length).toEqual(2);
            expect(DOM.hasClass(childCompChildren[0].nativeElement, "child"))
                .toBe(true);
            expect(DOM.hasClass(childCompChildren[1].nativeElement, "child"))
                .toBe(true);
            var childNested = childCompChildren[0].children;
            expect(childNested.length).toEqual(1);
            expect(DOM.hasClass(childNested[0].nativeElement, "childnested"))
                .toBe(true);
            var conditionalContentComp = rootCompChildren[3];
            expect(conditionalContentComp.children.length).toEqual(0);
            expect(conditionalContentComp.componentViewChildren.length)
                .toEqual(1);
            var ngIfWithProjectedNgContent =
                conditionalContentComp.componentViewChildren[0];
            expect(ngIfWithProjectedNgContent.children.length).toBe(0);
            expect(ngIfWithProjectedNgContent.componentViewChildren.length)
                .toBe(0);
            async.done();
          });
        }));
    it(
        "should list child elements within viewports",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(UsingFor).then((componentFixture) {
            componentFixture.detectChanges();
            var childEls = componentFixture.debugElement.componentViewChildren;
            // TODO should this count include the <template> element?
            expect(childEls.length).toEqual(5);
            var list = childEls[4];
            expect(list.children.length).toEqual(4);
            async.done();
          });
        }));
    it(
        "should query child elements",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(ParentComp).then((componentFixture) {
            componentFixture.detectChanges();
            var childTestEls = componentFixture.debugElement
                .queryAll(By.directive(MessageDir));
            expect(childTestEls.length).toBe(4);
            expect(DOM.hasClass(childTestEls[0].nativeElement, "parent"))
                .toBe(true);
            expect(DOM.hasClass(childTestEls[1].nativeElement, "parentnested"))
                .toBe(true);
            expect(DOM.hasClass(childTestEls[2].nativeElement, "child"))
                .toBe(true);
            expect(DOM.hasClass(childTestEls[3].nativeElement, "childnested"))
                .toBe(true);
            async.done();
          });
        }));
    it(
        "should query child elements in the light DOM",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(ParentComp).then((componentFixture) {
            componentFixture.detectChanges();
            var parentEl =
                componentFixture.debugElement.componentViewChildren[0];
            var childTestEls =
                parentEl.queryAll(By.directive(MessageDir), Scope.light);
            expect(childTestEls.length).toBe(1);
            expect(DOM.hasClass(childTestEls[0].nativeElement, "parentnested"))
                .toBe(true);
            async.done();
          });
        }));
    it(
        "should query child elements in the current component view DOM",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(ParentComp).then((componentFixture) {
            componentFixture.detectChanges();
            var childTestEls = componentFixture.debugElement
                .queryAll(By.directive(MessageDir), Scope.view);
            expect(childTestEls.length).toBe(2);
            expect(DOM.hasClass(childTestEls[0].nativeElement, "parent"))
                .toBe(true);
            expect(DOM.hasClass(childTestEls[1].nativeElement, "parentnested"))
                .toBe(true);
            async.done();
          });
        }));
    it(
        "should allow injecting from the element injector",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(ParentComp).then((componentFixture) {
            componentFixture.detectChanges();
            expect(componentFixture.debugElement.componentViewChildren[0]
                    .inject(Logger)
                    .log)
                .toEqual(["parent", "nestedparent", "child", "nestedchild"]);
            async.done();
          });
        }));
    it(
        "should trigger event handlers",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(EventsComp).then((componentFixture) {
            componentFixture.detectChanges();
            expect(componentFixture.debugElement.componentInstance.clicked)
                .toBe(false);
            expect(componentFixture.debugElement.componentInstance.customed)
                .toBe(false);
            componentFixture.debugElement.componentViewChildren[0]
                .triggerEventHandler("click", ({} as dynamic));
            expect(componentFixture.debugElement.componentInstance.clicked)
                .toBe(true);
            componentFixture.debugElement.componentViewChildren[1]
                .triggerEventHandler("myevent", ({} as dynamic));
            expect(componentFixture.debugElement.componentInstance.customed)
                .toBe(true);
            async.done();
          });
        }));
  });
}
