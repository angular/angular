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
  beforeEachProviders,
  it,
  xit,
  TestComponentBuilder
} from 'angular2/testing_internal';

import {DOM} from 'angular2/src/platform/dom/dom_adapter';

import {PromiseWrapper, EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';

import {Injectable} from 'angular2/core';
import {NgFor, NgIf} from 'angular2/common';
import {By} from 'angular2/platform/common_dom';

import {Directive, Component, Input} from 'angular2/src/core/metadata';

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

@Component({
  selector: 'child-comp',
  template: `<div class="child" message="child">
               <span class="childnested" message="nestedchild">Child</span>
             </div>
             <span class="child" [innerHtml]="childBinding"></span>`,
  directives: [MessageDir],
})
@Injectable()
class ChildComp {
  childBinding: string;

  constructor() { this.childBinding = 'Original'; }
}

@Component({
  selector: 'parent-comp',
  viewProviders: [Logger],
  template: `<div class="parent" message="parent">
               <span class="parentnested" message="nestedparent">Parent</span>
             </div>
             <span class="parent" [innerHtml]="parentBinding"></span>
             <child-comp class="child-comp-class"></child-comp>`,
  directives: [ChildComp, MessageDir],
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

@Component({
  selector: 'events-comp',
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

@Component({
  selector: 'cond-content-comp',
  viewProviders: [Logger],
  template: `<div class="child" message="child" *ngIf="myBool"><ng-content></ng-content></div>`,
  directives: [NgIf, MessageDir],
})
@Injectable()
class ConditionalContentComp {
  myBool: boolean = false;
}

@Component({
  selector: 'conditional-parent-comp',
  viewProviders: [Logger],
  template: `<span class="parent" [innerHtml]="parentBinding"></span>
            <cond-content-comp class="cond-content-comp-class">
              <span class="from-parent"></span>
            </cond-content-comp>`,
  directives: [ConditionalContentComp],
})
@Injectable()
class ConditionalParentComp {
  parentBinding: string;
  constructor() { this.parentBinding = 'OriginalParent'; }
}

@Component({
  selector: 'using-for',
  viewProviders: [Logger],
  template: `<span *ngFor="#thing of stuff" [innerHtml]="thing"></span>
            <ul message="list">
              <li *ngFor="#item of stuff" [innerHtml]="item"></li>
            </ul>`,
  directives: [NgFor, MessageDir],
})
@Injectable()
class UsingFor {
  stuff: string[];
  constructor() { this.stuff = ['one', 'two', 'three']; }
}

@Directive({selector: '[mydir]', exportAs: 'mydir'})
class MyDir {
}

@Component({
  selector: 'locals-comp',
  template: `
   <div mydir #alice="mydir"></div>
 `,
  directives: [MyDir]
})
class LocalsComp {
}


@Component({
  selector: 'bank-account',
  template: `
   Bank Name: {{bank}}
   Account Id: {{id}}
 `
})
class BankAccount {
  @Input() bank: string;
  @Input('account') id: string;

  normalizedBankName: string;
}

@Component({
  selector: 'test-app',
  template: `
   <bank-account bank="RBC" account="4747"></bank-account>
 `,
  directives: [BankAccount]
})
class TestApp {
}

export function main() {
  describe('debug element', function() {
    it('should list all child nodes',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.createAsync(ParentComp)
             .then((fixture) => {
               fixture.detectChanges();

               // The root component has 3 elements and 2 text node children.
               expect(fixture.debugElement.childNodes.length).toEqual(5);
               async.done();
             });
       }));

    it('should list all component child elements',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {

         tcb.createAsync(ParentComp)
             .then((fixture) => {
               fixture.detectChanges();

               var childEls = fixture.debugElement.children;

               // The root component has 3 elements in its view.
               expect(childEls.length).toEqual(3);
               expect(DOM.hasClass(childEls[0].nativeElement, 'parent')).toBe(true);
               expect(DOM.hasClass(childEls[1].nativeElement, 'parent')).toBe(true);
               expect(DOM.hasClass(childEls[2].nativeElement, 'child-comp-class')).toBe(true);

               var nested = childEls[0].children;
               expect(nested.length).toEqual(1);
               expect(DOM.hasClass(nested[0].nativeElement, 'parentnested')).toBe(true);

               var childComponent = childEls[2];

               var childCompChildren = childComponent.children;
               expect(childCompChildren.length).toEqual(2);
               expect(DOM.hasClass(childCompChildren[0].nativeElement, 'child')).toBe(true);
               expect(DOM.hasClass(childCompChildren[1].nativeElement, 'child')).toBe(true);

               var childNested = childCompChildren[0].children;
               expect(childNested.length).toEqual(1);
               expect(DOM.hasClass(childNested[0].nativeElement, 'childnested')).toBe(true);

               async.done();
             });
       }));

    it('should list conditional component child elements',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.createAsync(ConditionalParentComp)
             .then((fixture) => {
               fixture.detectChanges();

               var childEls = fixture.debugElement.children;

               // The root component has 2 elements in its view.
               expect(childEls.length).toEqual(2);
               expect(DOM.hasClass(childEls[0].nativeElement, 'parent')).toBe(true);
               expect(DOM.hasClass(childEls[1].nativeElement, 'cond-content-comp-class'))
                   .toBe(true);

               var conditionalContentComp = childEls[1];

               expect(conditionalContentComp.children.length).toEqual(0);

               conditionalContentComp.componentInstance.myBool = true;
               fixture.detectChanges();

               expect(conditionalContentComp.children.length).toEqual(1);
               async.done();
             });
       }));

    it('should list child elements within viewports',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.createAsync(UsingFor).then((fixture) => {
           fixture.detectChanges();

           var childEls = fixture.debugElement.children;
           expect(childEls.length).toEqual(4);

           // The 4th child is the <ul>
           var list = childEls[3];

           expect(list.children.length).toEqual(3);

           async.done();
         });
       }));

    it('should list element attributes',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.createAsync(TestApp).then((fixture) => {
           fixture.detectChanges();
           var bankElem = fixture.debugElement.children[0];

           expect(bankElem.attributes['bank']).toEqual('RBC');
           expect(bankElem.attributes['account']).toEqual('4747');
           async.done();
         });
       }));

    it('should query child elements by css',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.createAsync(ParentComp)
             .then((fixture) => {
               fixture.detectChanges();

               var childTestEls = fixture.debugElement.queryAll(By.css('child-comp'));

               expect(childTestEls.length).toBe(1);
               expect(DOM.hasClass(childTestEls[0].nativeElement, 'child-comp-class')).toBe(true);

               async.done();
             });
       }));

    it('should query child elements by directive',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.createAsync(ParentComp)
             .then((fixture) => {
               fixture.detectChanges();

               var childTestEls = fixture.debugElement.queryAll(By.directive(MessageDir));

               expect(childTestEls.length).toBe(4);
               expect(DOM.hasClass(childTestEls[0].nativeElement, 'parent')).toBe(true);
               expect(DOM.hasClass(childTestEls[1].nativeElement, 'parentnested')).toBe(true);
               expect(DOM.hasClass(childTestEls[2].nativeElement, 'child')).toBe(true);
               expect(DOM.hasClass(childTestEls[3].nativeElement, 'childnested')).toBe(true);

               async.done();
             });
       }));

    it('should list providerTokens',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {

         tcb.createAsync(ParentComp)
             .then((fixture) => {
               fixture.detectChanges();

               expect(fixture.debugElement.providerTokens).toContain(Logger);

               async.done();
             });
       }));

    it('should list locals',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.createAsync(LocalsComp)
             .then((fixture) => {
               fixture.detectChanges();

               expect(fixture.debugElement.children[0].getLocal('alice')).toBeAnInstanceOf(MyDir);

               async.done();
             });
       }));

    it('should allow injecting from the element injector',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {

         tcb.createAsync(ParentComp)
             .then((fixture) => {
               fixture.detectChanges();

               expect(fixture.debugElement.children[0].inject(Logger).log)
                   .toEqual(['parent', 'nestedparent', 'child', 'nestedchild']);

               async.done();
             });
       }));

    it('should list event listeners',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {

         tcb.createAsync(EventsComp)
             .then((fixture) => {
               fixture.detectChanges();

               expect(fixture.debugElement.children[0].listeners.length).toEqual(1);
               expect(fixture.debugElement.children[1].listeners.length).toEqual(1);

               async.done();
             });
       }));


    it('should trigger event handlers',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {

         tcb.createAsync(EventsComp)
             .then((fixture) => {
               fixture.detectChanges();

               expect(fixture.debugElement.componentInstance.clicked).toBe(false);
               expect(fixture.debugElement.componentInstance.customed).toBe(false);

               fixture.debugElement.children[0].triggerEventHandler('click', <Event>{});
               expect(fixture.debugElement.componentInstance.clicked).toBe(true);

               fixture.debugElement.children[1].triggerEventHandler('myevent', <Event>{});
               expect(fixture.debugElement.componentInstance.customed).toBe(true);

               async.done();
             });
       }));
  });
}
