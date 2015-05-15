import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  dispatchEvent,
  expect,
  iit,
  inject,
  IS_DARTIUM,
  beforeEachBindings,
  it,
  xit
} from 'angular2/test_lib';

import {TestComponentBuilder, By, Scope} from 'angular2/src/test_lib/test_component_builder';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {List, ListWrapper} from 'angular2/src/facade/collection';
import {PromiseWrapper, EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';

import {Injectable} from 'angular2/di';

import {
  Directive,
  Component,
  View,
} from 'angular2/annotations';

import * as viewAnn from 'angular2/src/core/annotations_impl/view';

import {NgIf} from 'angular2/src/directives/ng_if';
import {NgFor} from 'angular2/src/directives/ng_for';

@Injectable()
class Logger {
  log: List<string>;

  constructor() { this.log = ListWrapper.create(); }

  add(thing: string) { ListWrapper.push(this.log, thing); }
}

@Directive({selector: '[message]', properties: {'message': 'message'}})
@Injectable()
class MessageDir {
  logger: Logger;

  constructor(logger: Logger) { this.logger = logger; }

  set message(newMessage) { this.logger.add(newMessage); }
}

@Component({selector: 'child-comp'})
@View({
  template: `<div class="child" message="child">
               <span class="childnested" message="nestedchild">Child</span>
             </div>
             <span class="child">{{childBinding}}</span>`,
  directives: [MessageDir]
})
@Injectable()
class ChildComp {
  childBinding: string;

  constructor() { this.childBinding = 'Original'; }
}

@Component({selector: 'child-comp'})
@View({template: `<span>Mock</span>`})
@Injectable()
class MockChildComp {
}

@Component({selector: 'parent-comp', appInjector: [Logger]})
@View({
  template: `<div class="parent" message="parent">
               <span class="parentnested" message="nestedparent">Parent</span>
             </div>
             <span class="parent">{{parentBinding}}</span>
             <child-comp class="child-comp-class"></child-comp>`,
  directives: [ChildComp, MessageDir]
})
@Injectable()
class ParentComp {
  parentBinding: string;
  constructor() { this.parentBinding = 'OriginalParent'; }
}

@Component({selector: 'my-if-comp'})
@View({template: `<span *ng-if="showMore">More</span>`, directives: [NgIf]})
@Injectable()
class MyIfComp {
  showMore: boolean = false;
}

@Directive({selector: 'custom-emitter', events: ['myevent']})
@Injectable()
class CustomEmitter {
  myevent: EventEmitter;

  constructor() { this.myevent = new EventEmitter(); }
}

@Component({selector: 'events-comp'})
@View({
  template: `<button (click)="handleClick()"></button>
             <custom-emitter (myevent)="handleCustom()"></custom-emitter>`,
  directives: [CustomEmitter]
})
@Injectable()
class EventsComp {
  clicked: boolean;
  customed: boolean;

  constructor() {
    this.clicked = false;
    this.customed = false;
  }

  handleClick() { this.clicked = true; }

  handleCustom() { this.customed = true; }
}

@Component({selector: 'using-for', appInjector: [Logger]})
@View({
  template: `<span *ng-for="#thing of stuff">{{thing}}</span>
            <ul message="list">
              <li *ng-for="#item of stuff">{{item}}</li>
            </ul>`,
  directives: [NgFor, MessageDir]
})
@Injectable()
class UsingFor {
  stuff: List<string>;

  constructor() { this.stuff = ['one', 'two', 'three']; }
}
export function main() {
  describe('test component builder', function() {
    it('should instantiate a component with valid DOM',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.createAsync(MockChildComp)
             .then((rootTestComponent) => {
               var childSpans = DOM.querySelectorAll(rootTestComponent.domElement, 'span');
               expect(DOM.getInnerHTML(childSpans[0])).toEqual('Mock');
               async.done();
             });
       }));

    it('should allow changing members of the component',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.createAsync(MyIfComp).then((rootTestComponent) => {
           rootTestComponent.detectChanges();
           var childSpans = DOM.querySelectorAll(rootTestComponent.domElement, 'span');
           expect(childSpans.length).toEqual(0);

           rootTestComponent.componentInstance.showMore = true;
           rootTestComponent.detectChanges();
           childSpans = DOM.querySelectorAll(rootTestComponent.domElement, 'span');
           expect(childSpans.length).toEqual(1);

           async.done();
         });
       }));

    it('should list component child elements',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.createAsync(ParentComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();

               var childEls = rootTestComponent.children;
               // The root is a lone component, and has no children in the light dom.
               expect(childEls.length).toEqual(0);

               var rootCompChildren = rootTestComponent.componentViewChildren;
               // The root component has 3 elements in its shadow view.
               expect(rootCompChildren.length).toEqual(3);
               expect(DOM.hasClass(rootCompChildren[0].domElement, 'parent')).toBe(true);
               expect(DOM.hasClass(rootCompChildren[1].domElement, 'parent')).toBe(true);
               expect(DOM.hasClass(rootCompChildren[2].domElement, 'child-comp-class')).toBe(true);

               var nested = rootCompChildren[0].children;
               expect(nested.length).toEqual(1);
               expect(DOM.hasClass(nested[0].domElement, 'parentnested')).toBe(true);

               var childComponent = rootCompChildren[2];
               expect(childComponent.children.length).toEqual(0);

               var childCompChildren = childComponent.componentViewChildren;
               expect(childCompChildren.length).toEqual(2);
               expect(DOM.hasClass(childCompChildren[0].domElement, 'child')).toBe(true);
               expect(DOM.hasClass(childCompChildren[1].domElement, 'child')).toBe(true);

               var childNested = childCompChildren[0].children;
               expect(childNested.length).toEqual(1);
               expect(DOM.hasClass(childNested[0].domElement, 'childnested')).toBe(true);

               async.done();
             });
       }));

    it('should list child elements within viewports',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.createAsync(UsingFor).then((rootTestComponent) => {
           rootTestComponent.detectChanges();

           var childEls = rootTestComponent.componentViewChildren;
           // TODO should this count include the <template> element?
           expect(childEls.length).toEqual(5);

           var list = childEls[4];
           expect(list.children.length).toEqual(4);

           async.done();
         });
       }));

    it('should query child elements',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.createAsync(ParentComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();

               var childTestEls = rootTestComponent.queryAll(By.directive(MessageDir));

               expect(childTestEls.length).toBe(4);
               expect(DOM.hasClass(childTestEls[0].domElement, 'parent')).toBe(true);
               expect(DOM.hasClass(childTestEls[1].domElement, 'parentnested')).toBe(true);
               expect(DOM.hasClass(childTestEls[2].domElement, 'child')).toBe(true);
               expect(DOM.hasClass(childTestEls[3].domElement, 'childnested')).toBe(true);
               async.done();
             });
       }));

    it('should query child elements in the light DOM',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.createAsync(ParentComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();

               var parentEl = rootTestComponent.componentViewChildren[0];

               var childTestEls = parentEl.queryAll(By.directive(MessageDir), Scope.light);

               expect(childTestEls.length).toBe(1);
               expect(DOM.hasClass(childTestEls[0].domElement, 'parentnested')).toBe(true);

               async.done();
             });
       }));

    it('should query child elements in the current component view DOM',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.createAsync(ParentComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();

               var childTestEls = rootTestComponent.queryAll(By.directive(MessageDir), Scope.view);

               expect(childTestEls.length).toBe(2);
               expect(DOM.hasClass(childTestEls[0].domElement, 'parent')).toBe(true);
               expect(DOM.hasClass(childTestEls[1].domElement, 'parentnested')).toBe(true);

               async.done();
             });
       }));

    it('should allow injecting from the element injector',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.createAsync(ParentComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();

               expect(rootTestComponent.componentViewChildren[0].inject(Logger).log)
                   .toEqual(['parent', 'nestedparent', 'child', 'nestedchild']);

               async.done();
             });
       }));

    it('should override a template',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.overrideTemplate(MockChildComp, '<span>Modified</span>')
             .createAsync(MockChildComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();
               var childSpans = DOM.querySelectorAll(rootTestComponent.domElement, 'span');
               expect(childSpans.length).toEqual(1);
               expect(DOM.getInnerHTML(childSpans[0])).toEqual('Modified');

               async.done();
             });
       }));

    it('should override a view',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.overrideView(ChildComp,
                          new viewAnn.View({template: '<span>Modified {{childBinding}}</span>'}))
             .createAsync(ChildComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();
               var childSpans = DOM.querySelectorAll(rootTestComponent.domElement, 'span');
               expect(childSpans.length).toEqual(1);
               expect(DOM.getInnerHTML(childSpans[0])).toEqual('Modified Original');

               async.done();
             });
       }));

    it('should override component dependencies',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.overrideDirective(ParentComp, ChildComp, MockChildComp)
             .createAsync(ParentComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();
               var childSpans = DOM.querySelectorAll(rootTestComponent.domElement, 'span');
               expect(childSpans.length).toEqual(3);
               expect(DOM.getInnerHTML(childSpans[2])).toEqual('Mock');

               async.done();
             });
       }));

    it('should trigger event handlers',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.createAsync(EventsComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();

               expect(rootTestComponent.componentInstance.clicked).toBe(false);
               expect(rootTestComponent.componentInstance.customed).toBe(false);

               rootTestComponent.componentViewChildren[0].triggerEventHandler('click', {});
               expect(rootTestComponent.componentInstance.clicked).toBe(true);

               rootTestComponent.componentViewChildren[1].triggerEventHandler('myevent', {});
               expect(rootTestComponent.componentInstance.customed).toBe(true);

               async.done();
             });
       }));
  });
}
