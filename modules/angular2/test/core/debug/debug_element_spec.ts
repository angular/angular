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
  beforeEachBindings,
  it,
  xit,
  TestComponentBuilder
} from 'angular2/testing_internal';

import {DOM} from 'angular2/src/core/dom/dom_adapter';

import {PromiseWrapper, EventEmitter, ObservableWrapper} from 'angular2/src/core/facade/async';

import {Injectable, NgFor, NgIf} from 'angular2/core';
import {By, Scope} from 'angular2/src/core/debug';

import {
  Directive,
  Component,
  View,
} from 'angular2/src/core/metadata';

@Injectable()
class Logger {
  log: string[];

  constructor() { this.log = []; }

  add(thing: string) { this.log.push(thing); }
}

@Directive({selector: '[message]', inputs: ['message']})
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
             <span class="child" [inner-html]="childBinding"></span>`,
  directives: [MessageDir],
})
@Injectable()
class ChildComp {
  childBinding: string;

  constructor() { this.childBinding = 'Original'; }
}

@Component({selector: 'cond-content-comp', viewProviders: [Logger]})
@View({
  template: `<div class="child" message="child" *ng-if="false"><ng-content></ng-content></div>`,
  directives: [NgIf, MessageDir],
})
@Injectable()
class ConditionalContentComp {
}

@Component({selector: 'parent-comp', viewProviders: [Logger]})
@View({
  template: `<div class="parent" message="parent">
               <span class="parentnested" message="nestedparent">Parent</span>
             </div>
             <span class="parent" [inner-html]="parentBinding"></span>
             <child-comp class="child-comp-class"></child-comp>
             <cond-content-comp class="cond-content-comp-class"></cond-content-comp>`,
  directives: [ChildComp, MessageDir, ConditionalContentComp],
})
@Injectable()
class ParentComp {
  parentBinding: string;
  constructor() { this.parentBinding = 'OriginalParent'; }
}

@Directive({selector: 'custom-emitter', outputs: ['myevent']})
@Injectable()
class CustomEmitter {
  myevent: EventEmitter<any>;

  constructor() { this.myevent = new EventEmitter(); }
}

@Component({selector: 'events-comp'})
@View({
  template: `<button (click)="handleClick()"></button>
             <custom-emitter (myevent)="handleCustom()"></custom-emitter>`,
  directives: [CustomEmitter],
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

@Component({selector: 'using-for', viewProviders: [Logger]})
@View({
  template: `<span *ng-for="#thing of stuff" [inner-html]="thing"></span>
            <ul message="list">
              <li *ng-for="#item of stuff" [inner-html]="item"></li>
            </ul>`,
  directives: [NgFor, MessageDir],
})
@Injectable()
class UsingFor {
  stuff: string[];

  constructor() { this.stuff = ['one', 'two', 'three']; }
}

export function main() {
  describe('debug element', function() {

    it('should list component child elements',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {

         tcb.createAsync(ParentComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();

               var childEls = rootTestComponent.debugElement.children;
               // The root is a lone component, and has no children in the light dom.
               expect(childEls.length).toEqual(0);

               var rootCompChildren = rootTestComponent.debugElement.componentViewChildren;
               // The root component has 4 elements in its shadow view.
               expect(rootCompChildren.length).toEqual(4);
               expect(DOM.hasClass(rootCompChildren[0].nativeElement, 'parent')).toBe(true);
               expect(DOM.hasClass(rootCompChildren[1].nativeElement, 'parent')).toBe(true);
               expect(DOM.hasClass(rootCompChildren[2].nativeElement, 'child-comp-class'))
                   .toBe(true);
               expect(DOM.hasClass(rootCompChildren[3].nativeElement, 'cond-content-comp-class'))
                   .toBe(true);

               var nested = rootCompChildren[0].children;
               expect(nested.length).toEqual(1);
               expect(DOM.hasClass(nested[0].nativeElement, 'parentnested')).toBe(true);

               var childComponent = rootCompChildren[2];
               expect(childComponent.children.length).toEqual(0);

               var childCompChildren = childComponent.componentViewChildren;
               expect(childCompChildren.length).toEqual(2);
               expect(DOM.hasClass(childCompChildren[0].nativeElement, 'child')).toBe(true);
               expect(DOM.hasClass(childCompChildren[1].nativeElement, 'child')).toBe(true);

               var childNested = childCompChildren[0].children;
               expect(childNested.length).toEqual(1);
               expect(DOM.hasClass(childNested[0].nativeElement, 'childnested')).toBe(true);

               var conditionalContentComp = rootCompChildren[3];
               expect(conditionalContentComp.children.length).toEqual(0);

               expect(conditionalContentComp.componentViewChildren.length).toEqual(1);
               var ngIfWithProjectedNgContent = conditionalContentComp.componentViewChildren[0];
               expect(ngIfWithProjectedNgContent.children.length).toBe(0);
               expect(ngIfWithProjectedNgContent.componentViewChildren.length).toBe(0);

               async.done();
             });
       }));

    it('should list child elements within viewports',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {

         tcb.createAsync(UsingFor).then((rootTestComponent) => {
           rootTestComponent.detectChanges();

           var childEls = rootTestComponent.debugElement.componentViewChildren;
           // TODO should this count include the <template> element?
           expect(childEls.length).toEqual(5);

           var list = childEls[4];
           expect(list.children.length).toEqual(4);

           async.done();
         });
       }));

    it('should query child elements',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {

         tcb.createAsync(ParentComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();

               var childTestEls = rootTestComponent.debugElement.queryAll(By.directive(MessageDir));

               expect(childTestEls.length).toBe(4);
               expect(DOM.hasClass(childTestEls[0].nativeElement, 'parent')).toBe(true);
               expect(DOM.hasClass(childTestEls[1].nativeElement, 'parentnested')).toBe(true);
               expect(DOM.hasClass(childTestEls[2].nativeElement, 'child')).toBe(true);
               expect(DOM.hasClass(childTestEls[3].nativeElement, 'childnested')).toBe(true);
               async.done();
             });
       }));

    it('should query child elements in the light DOM',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {

         tcb.createAsync(ParentComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();

               var parentEl = rootTestComponent.debugElement.componentViewChildren[0];

               var childTestEls = parentEl.queryAll(By.directive(MessageDir), Scope.light);

               expect(childTestEls.length).toBe(1);
               expect(DOM.hasClass(childTestEls[0].nativeElement, 'parentnested')).toBe(true);

               async.done();
             });
       }));

    it('should query child elements in the current component view DOM',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {

         tcb.createAsync(ParentComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();

               var childTestEls =
                   rootTestComponent.debugElement.queryAll(By.directive(MessageDir), Scope.view);

               expect(childTestEls.length).toBe(2);
               expect(DOM.hasClass(childTestEls[0].nativeElement, 'parent')).toBe(true);
               expect(DOM.hasClass(childTestEls[1].nativeElement, 'parentnested')).toBe(true);

               async.done();
             });
       }));

    it('should allow injecting from the element injector',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {

         tcb.createAsync(ParentComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();

               expect(rootTestComponent.debugElement.componentViewChildren[0].inject(Logger).log)
                   .toEqual(['parent', 'nestedparent', 'child', 'nestedchild']);

               async.done();
             });
       }));

    it('should trigger event handlers',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {

         tcb.createAsync(EventsComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();

               expect(rootTestComponent.debugElement.componentInstance.clicked).toBe(false);
               expect(rootTestComponent.debugElement.componentInstance.customed).toBe(false);

               rootTestComponent.debugElement.componentViewChildren[0].triggerEventHandler(
                   'click', <Event>{});
               expect(rootTestComponent.debugElement.componentInstance.clicked).toBe(true);

               rootTestComponent.debugElement.componentViewChildren[1].triggerEventHandler(
                   'myevent', <Event>{});
               expect(rootTestComponent.debugElement.componentInstance.customed).toBe(true);

               async.done();
             });
       }));
  });
}
