/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {CommonModule, NgIfContext, ɵgetDOM as getDOM} from '@angular/common';
import {Component, DebugElement, DebugNode, Directive, ElementRef, EmbeddedViewRef, EventEmitter, HostBinding, Injectable, Input, NO_ERRORS_SCHEMA, OnInit, Output, Renderer2, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {NgZone} from '@angular/core/src/zone';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {createMouseEvent, hasClass} from '@angular/platform-browser/testing/src/browser_util';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {ivyEnabled, onlyInIvy} from '@angular/private/testing';

@Injectable()
class Logger {
  logs: string[];

  constructor() {
    this.logs = [];
  }

  add(thing: string) {
    this.logs.push(thing);
  }
}

@Directive({selector: '[message]', inputs: ['message']})
class MessageDir {
  logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  set message(newMessage: string) {
    this.logger.add(newMessage);
  }
}

@Directive({selector: '[with-title]', inputs: ['title']})
class WithTitleDir {
  title = '';
}

@Component({
  selector: 'child-comp',
  template: `<div class="child" message="child">
               <span class="childnested" message="nestedchild">Child</span>
             </div>
             <span class="child" [innerHtml]="childBinding"></span>`,
})
class ChildComp {
  childBinding: string;

  constructor() {
    this.childBinding = 'Original';
  }
}

@Component({
  selector: 'parent-comp',
  viewProviders: [Logger],
  template: `<div class="parent" message="parent">
               <span class="parentnested" message="nestedparent">Parent</span>
             </div>
             <span class="parent" [innerHtml]="parentBinding"></span>
             <child-comp class="child-comp-class"></child-comp>`,
})
class ParentComp {
  parentBinding: string;
  constructor() {
    this.parentBinding = 'OriginalParent';
  }
}

@Directive({selector: 'custom-emitter', outputs: ['myevent']})
class CustomEmitter {
  myevent: EventEmitter<any>;

  constructor() {
    this.myevent = new EventEmitter();
  }
}

@Component({
  selector: 'events-comp',
  template: `<button (click)="handleClick()"></button>
             <custom-emitter (myevent)="handleCustom()"></custom-emitter>`,
})
class EventsComp {
  clicked: boolean;
  customed: boolean;

  constructor() {
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

@Component({
  selector: 'cond-content-comp',
  viewProviders: [Logger],
  template: `<div class="child" message="child" *ngIf="myBool"><ng-content></ng-content></div>`,
})
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
})
class ConditionalParentComp {
  parentBinding: string;
  constructor() {
    this.parentBinding = 'OriginalParent';
  }
}

@Component({
  selector: 'using-for',
  viewProviders: [Logger],
  template: `<span *ngFor="let thing of stuff" [innerHtml]="thing"></span>
            <ul message="list">
              <li *ngFor="let item of stuff" [innerHtml]="item"></li>
            </ul>`,
})
class UsingFor {
  stuff: string[];
  constructor() {
    this.stuff = ['one', 'two', 'three'];
  }
}

@Directive({selector: '[mydir]', exportAs: 'mydir'})
class MyDir {
}

@Component({
  selector: 'locals-comp',
  template: `
   <div mydir #alice="mydir"></div>
 `,
})
class LocalsComp {
}

@Component({
  selector: 'bank-account',
  template: `
   Bank Name: {{bank}}
   Account Id: {{id}}
 `,
  host: {
    'class': 'static-class',
    '[class.absent-class]': 'false',
    '[class.present-class]': 'true',
  },
})
class BankAccount {
  // TODO(issue/24571): remove '!'.
  @Input() bank!: string;
  // TODO(issue/24571): remove '!'.
  @Input('account') id!: string;

  // TODO(issue/24571): remove '!'.
  normalizedBankName!: string;
}

@Component({
  template: `
    <div class="content" #content>Some content</div>
 `
})
class SimpleContentComp {
  @ViewChild('content') content!: ElementRef;
}

@Component({
  selector: 'test-app',
  template: `
   <bank-account bank="RBC"
                 account="4747"
                 [style.width.px]="width"
                 [style.color]="color"
                 [class.closed]="isClosed"
                 [class.open]="!isClosed"></bank-account>
 `,
})
class TestApp {
  width = 200;
  color = 'red';
  isClosed = true;
}

@Component({selector: 'test-cmpt', template: ``})
class TestCmpt {
}

@Component({selector: 'test-cmpt-renderer', template: ``})
class TestCmptWithRenderer {
  constructor(public renderer: Renderer2) {}
}

@Component({selector: 'host-class-binding', template: ''})
class HostClassBindingCmp {
  @HostBinding('class') hostClasses = 'class-one class-two';
}

@Component({selector: 'test-cmpt-vcref', template: `<div></div>`})
class TestCmptWithViewContainerRef {
  constructor(private vcref: ViewContainerRef) {}
}

@Component({
  template: `
  <button
    [disabled]="disabled"
    [tabIndex]="tabIndex"
    [title]="title">Click me</button>
`
})
class TestCmptWithPropBindings {
  disabled = true;
  tabIndex = 1337;
  title = 'hello';
}

@Component({
  template: `
  <button title="{{0}}"></button>
  <button title="a{{1}}b"></button>
  <button title="a{{1}}b{{2}}c"></button>
  <button title="a{{1}}b{{2}}c{{3}}d"></button>
  <button title="a{{1}}b{{2}}c{{3}}d{{4}}e"></button>
  <button title="a{{1}}b{{2}}c{{3}}d{{4}}e{{5}}f"></button>
  <button title="a{{1}}b{{2}}c{{3}}d{{4}}e{{5}}f{{6}}g"></button>
  <button title="a{{1}}b{{2}}c{{3}}d{{4}}e{{5}}f{{6}}g{{7}}h"></button>
  <button title="a{{1}}b{{2}}c{{3}}d{{4}}e{{5}}f{{6}}g{{7}}h{{8}}i"></button>
  <button title="a{{1}}b{{2}}c{{3}}d{{4}}e{{5}}f{{6}}g{{7}}h{{8}}i{{9}}j"></button>
`
})
class TestCmptWithPropInterpolation {
}

{
  describe('debug element', () => {
    let fixture: ComponentFixture<any>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          ChildComp,
          ConditionalContentComp,
          ConditionalParentComp,
          CustomEmitter,
          EventsComp,
          LocalsComp,
          MessageDir,
          MyDir,
          ParentComp,
          TestApp,
          UsingFor,
          BankAccount,
          TestCmpt,
          HostClassBindingCmp,
          TestCmptWithViewContainerRef,
          SimpleContentComp,
          TestCmptWithPropBindings,
          TestCmptWithPropInterpolation,
          TestCmptWithRenderer,
          WithTitleDir,
        ],
        providers: [Logger],
        schemas: [NO_ERRORS_SCHEMA],
      });
    }));

    it('should list all child nodes', () => {
      fixture = TestBed.createComponent(ParentComp);
      fixture.detectChanges();
      expect(fixture.debugElement.childNodes.length).toEqual(3);
    });

    it('should list all component child elements', () => {
      fixture = TestBed.createComponent(ParentComp);
      fixture.detectChanges();
      const childEls = fixture.debugElement.children;

      // The root component has 3 elements in its view.
      expect(childEls.length).toEqual(3);
      expect(hasClass(childEls[0].nativeElement, 'parent')).toBe(true);
      expect(hasClass(childEls[1].nativeElement, 'parent')).toBe(true);
      expect(hasClass(childEls[2].nativeElement, 'child-comp-class')).toBe(true);

      const nested = childEls[0].children;
      expect(nested.length).toEqual(1);
      expect(hasClass(nested[0].nativeElement, 'parentnested')).toBe(true);

      const childComponent = childEls[2];

      const childCompChildren = childComponent.children;
      expect(childCompChildren.length).toEqual(2);
      expect(hasClass(childCompChildren[0].nativeElement, 'child')).toBe(true);
      expect(hasClass(childCompChildren[1].nativeElement, 'child')).toBe(true);

      const childNested = childCompChildren[0].children;
      expect(childNested.length).toEqual(1);
      expect(hasClass(childNested[0].nativeElement, 'childnested')).toBe(true);
    });

    it('should list conditional component child elements', () => {
      fixture = TestBed.createComponent(ConditionalParentComp);
      fixture.detectChanges();

      const childEls = fixture.debugElement.children;

      // The root component has 2 elements in its view.
      expect(childEls.length).toEqual(2);
      expect(hasClass(childEls[0].nativeElement, 'parent')).toBe(true);
      expect(hasClass(childEls[1].nativeElement, 'cond-content-comp-class')).toBe(true);

      const conditionalContentComp = childEls[1];

      expect(conditionalContentComp.children.length).toEqual(0);

      conditionalContentComp.componentInstance.myBool = true;
      fixture.detectChanges();

      expect(conditionalContentComp.children.length).toEqual(1);
    });

    it('should list child elements within viewports', () => {
      fixture = TestBed.createComponent(UsingFor);
      fixture.detectChanges();

      const childEls = fixture.debugElement.children;
      expect(childEls.length).toEqual(4);

      // The 4th child is the <ul>
      const list = childEls[3];

      expect(list.children.length).toEqual(3);
    });

    it('should list element attributes', () => {
      fixture = TestBed.createComponent(TestApp);
      fixture.detectChanges();
      const bankElem = fixture.debugElement.children[0];

      expect(bankElem.attributes['bank']).toEqual('RBC');
      expect(bankElem.attributes['account']).toEqual('4747');
    });

    it('should list element classes', () => {
      fixture = TestBed.createComponent(TestApp);
      fixture.detectChanges();
      const bankElem = fixture.debugElement.children[0];

      expect(bankElem.classes['closed']).toBe(true);
      expect(bankElem.classes['open']).toBeFalsy();
    });

    it('should get element classes from host bindings', () => {
      fixture = TestBed.createComponent(TestApp);
      fixture.detectChanges();
      const debugElement = fixture.debugElement.children[0];

      expect(debugElement.classes['present-class'])
          .toBe(true, 'Expected bound host CSS class "present-class" to be present');
      expect(debugElement.classes['absent-class'])
          .toBeFalsy('Expected bound host CSS class "absent-class" to be absent');
    });

    it('should list classes on SVG nodes', () => {
      // Class bindings on SVG elements require a polyfill
      // on IE which we don't include when running tests.
      if (typeof SVGElement !== 'undefined' && !('classList' in SVGElement.prototype)) {
        return;
      }

      TestBed.overrideTemplate(TestApp, `<svg [class.foo]="true" [class.bar]="true"></svg>`);
      fixture = TestBed.createComponent(TestApp);
      fixture.detectChanges();
      const classes = fixture.debugElement.children[0].classes;

      expect(classes['foo']).toBe(true);
      expect(classes['bar']).toBe(true);
    });

    it('should list element styles', () => {
      fixture = TestBed.createComponent(TestApp);
      fixture.detectChanges();
      const bankElem = fixture.debugElement.children[0];

      expect(bankElem.styles['width']).toEqual('200px');
      expect(bankElem.styles['color']).toEqual('red');
    });

    it('should query child elements by css', () => {
      fixture = TestBed.createComponent(ParentComp);
      fixture.detectChanges();

      const childTestEls = fixture.debugElement.queryAll(By.css('child-comp'));

      expect(childTestEls.length).toBe(1);
      expect(hasClass(childTestEls[0].nativeElement, 'child-comp-class')).toBe(true);
    });

    it('should query child elements by directive', () => {
      fixture = TestBed.createComponent(ParentComp);
      fixture.detectChanges();

      const childTestEls = fixture.debugElement.queryAll(By.directive(MessageDir));

      expect(childTestEls.length).toBe(4);
      expect(hasClass(childTestEls[0].nativeElement, 'parent')).toBe(true);
      expect(hasClass(childTestEls[1].nativeElement, 'parentnested')).toBe(true);
      expect(hasClass(childTestEls[2].nativeElement, 'child')).toBe(true);
      expect(hasClass(childTestEls[3].nativeElement, 'childnested')).toBe(true);
    });

    it('should query projected child elements by directive', () => {
      @Directive({selector: 'example-directive-a'})
      class ExampleDirectiveA {
      }

      @Component({
        selector: 'wrapper-component',
        template: `
          <ng-content select="example-directive-a"></ng-content>
        `
      })
      class WrapperComponent {
      }

      TestBed.configureTestingModule({
        declarations: [
          WrapperComponent,
          ExampleDirectiveA,
        ]
      });

      TestBed.overrideTemplate(TestApp, `<wrapper-component>
        <div></div>
        <example-directive-a></example-directive-a>
       </wrapper-component>`);

      const fixture = TestBed.createComponent(TestApp);
      fixture.detectChanges();

      const debugElement = fixture.debugElement.query(By.directive(ExampleDirectiveA));
      expect(debugElement).toBeTruthy();
    });

    it('should query re-projected child elements by directive', () => {
      @Directive({selector: 'example-directive-a'})
      class ExampleDirectiveA {
      }

      @Component({
        selector: 'proxy-component',
        template: `
          <ng-content></ng-content>
        `
      })
      class ProxyComponent {
      }

      @Component({
        selector: 'wrapper-component',
        template: `
          <proxy-component>
            <ng-content select="div"></ng-content>
            <ng-content select="example-directive-a"></ng-content>
          </proxy-component>
        `
      })
      class WrapperComponent {
      }

      TestBed.configureTestingModule({
        declarations: [
          ProxyComponent,
          WrapperComponent,
          ExampleDirectiveA,
        ]
      });

      TestBed.overrideTemplate(TestApp, `<wrapper-component>
        <div></div>
        <example-directive-a></example-directive-a>
       </wrapper-component>`);

      const fixture = TestBed.createComponent(TestApp);
      fixture.detectChanges();

      const debugElements = fixture.debugElement.queryAll(By.directive(ExampleDirectiveA));
      expect(debugElements.length).toBe(1);
    });

    it('should query directives on containers before directives in a view', () => {
      @Directive({selector: '[text]'})
      class TextDirective {
        @Input() text: string|undefined;
      }

      TestBed.configureTestingModule({declarations: [TextDirective]});
      TestBed.overrideTemplate(
          TestApp,
          `<ng-template text="first" [ngIf]="true"><div text="second"></div></ng-template>`);

      const fixture = TestBed.createComponent(TestApp);
      fixture.detectChanges();

      const debugNodes = fixture.debugElement.queryAllNodes(By.directive(TextDirective));
      expect(debugNodes.length).toBe(2);
      expect(debugNodes[0].injector.get(TextDirective).text).toBe('first');
      expect(debugNodes[1].injector.get(TextDirective).text).toBe('second');
    });

    it('should query directives on views moved in the DOM', () => {
      @Directive({selector: '[text]'})
      class TextDirective {
        @Input() text: string|undefined;
      }

      @Directive({selector: '[moveView]'})
      class ViewManipulatingDirective {
        constructor(private _vcRef: ViewContainerRef, private _tplRef: TemplateRef<any>) {}

        insert() {
          this._vcRef.createEmbeddedView(this._tplRef);
        }

        removeFromTheDom() {
          const viewRef = this._vcRef.get(0) as EmbeddedViewRef<any>;
          viewRef.rootNodes.forEach(rootNode => {
            getDOM().remove(rootNode);
          });
        }
      }

      TestBed.configureTestingModule({declarations: [TextDirective, ViewManipulatingDirective]});
      TestBed.overrideTemplate(
          TestApp, `<ng-template text="first" moveView><div text="second"></div></ng-template>`);

      const fixture = TestBed.createComponent(TestApp);
      fixture.detectChanges();

      const viewMover =
          fixture.debugElement.queryAllNodes(By.directive(ViewManipulatingDirective))[0]
              .injector.get(ViewManipulatingDirective);

      let debugNodes = fixture.debugElement.queryAllNodes(By.directive(TextDirective));

      // we've got just one directive on <ng-template>
      expect(debugNodes.length).toBe(1);
      expect(debugNodes[0].injector.get(TextDirective).text).toBe('first');

      // insert a view - now we expect to find 2 directive instances
      viewMover.insert();
      fixture.detectChanges();
      debugNodes = fixture.debugElement.queryAllNodes(By.directive(TextDirective));
      expect(debugNodes.length).toBe(2);

      // remove a view from the DOM (equivalent to moving it around)
      // the logical tree is the same but DOM has changed
      viewMover.removeFromTheDom();
      debugNodes = fixture.debugElement.queryAllNodes(By.directive(TextDirective));
      expect(debugNodes.length).toBe(2);
      expect(debugNodes[0].injector.get(TextDirective).text).toBe('first');
      expect(debugNodes[1].injector.get(TextDirective).text).toBe('second');
    });

    it('DebugElement.query should work with dynamically created elements', () => {
      @Directive({
        selector: '[dir]',
      })
      class MyDir {
        @Input('dir') dir: number|undefined;

        constructor(renderer: Renderer2, element: ElementRef) {
          const div = renderer.createElement('div');
          div.classList.add('myclass');
          renderer.appendChild(element.nativeElement, div);
        }
      }

      @Component({
        selector: 'app-test',
        template: '<div dir></div>',
      })
      class MyComponent {
      }

      TestBed.configureTestingModule({declarations: [MyComponent, MyDir]});
      const fixture = TestBed.createComponent(MyComponent);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('.myclass'))).toBeTruthy();
    });

    describe('DebugElement.query with dynamically created descendant elements', () => {
      let fixture: ComponentFixture<{}>;
      beforeEach(() => {
        @Directive({
          selector: '[dir]',
        })
        class MyDir {
          @Input('dir') dir: number|undefined;

          constructor(renderer: Renderer2, element: ElementRef) {
            const outerDiv = renderer.createElement('div');
            const innerDiv = renderer.createElement('div');
            innerDiv.classList.add('inner');
            const div = renderer.createElement('div');

            div.classList.add('myclass');

            renderer.appendChild(innerDiv, div);
            renderer.appendChild(outerDiv, innerDiv);
            renderer.appendChild(element.nativeElement, outerDiv);
          }
        }

        @Component({
          selector: 'app-test',
          template: '<div dir></div>',
        })
        class MyComponent {
        }

        TestBed.configureTestingModule({declarations: [MyComponent, MyDir]});
        fixture = TestBed.createComponent(MyComponent);
        fixture.detectChanges();
      });

      it('should find the dynamic elements from fixture root', () => {
        expect(fixture.debugElement.query(By.css('.myclass'))).toBeTruthy();
      });

      it('can use a dynamic element as root for another query', () => {
        const inner = fixture.debugElement.query(By.css('.inner'));
        expect(inner).toBeTruthy();
        expect(inner.query(By.css('.myclass'))).toBeTruthy();
      });
    });

    describe('DebugElement.query doesn\'t fail on elements outside Angular context', () => {
      @Component({template: '<div></div>'})
      class NativeEl {
        constructor(private elementRef: ElementRef) {}

        ngAfterViewInit() {
          const ul = document.createElement('ul');
          ul.appendChild(document.createElement('li'));
          this.elementRef.nativeElement.children[0].appendChild(ul);
        }
      }

      let el: DebugElement;
      beforeEach(() => {
        const fixture =
            TestBed.configureTestingModule({declarations: [NativeEl]}).createComponent(NativeEl);
        fixture.detectChanges();
        el = fixture.debugElement;
      });

      it('when searching for elements by name', () => {
        expect(() => el.query(e => e.name === 'any search text')).not.toThrow();
      });

      it('when searching for elements by their attributes', () => {
        expect(() => el.query(e => e.attributes!['name'] === 'any attribute')).not.toThrow();
      });

      it('when searching for elements by their classes', () => {
        expect(() => el.query(e => e.classes['any class'] === true)).not.toThrow();
      });

      it('when searching for elements by their styles', () => {
        expect(() => el.query(e => e.styles['any style'] === 'any value')).not.toThrow();
      });

      it('when searching for elements by their properties', () => {
        expect(() => el.query(e => e.properties['any prop'] === 'any value')).not.toThrow();
      });

      it('when searching by componentInstance', () => {
        expect(() => el.query(e => e.componentInstance === null)).not.toThrow();
      });

      it('when searching by context', () => {
        expect(() => el.query(e => e.context === null)).not.toThrow();
      });

      it('when searching by listeners', () => {
        expect(() => el.query(e => e.listeners.length === 0)).not.toThrow();
      });

      it('when searching by references', () => {
        expect(() => el.query(e => e.references === null)).not.toThrow();
      });

      it('when searching by providerTokens', () => {
        expect(() => el.query(e => e.providerTokens.length === 0)).not.toThrow();
      });

      it('when searching by injector', () => {
        expect(() => el.query(e => e.injector === null)).not.toThrow();
      });

      onlyInIvy('VE does not match elements created outside Angular context')
          .it('when using the out-of-context element as the DebugElement query root', () => {
            const debugElOutsideAngularContext = el.query(By.css('ul'));
            expect(debugElOutsideAngularContext.queryAll(By.css('li')).length).toBe(1);
            expect(debugElOutsideAngularContext.query(By.css('li'))).toBeDefined();
          });
    });

    it('DebugElement.queryAll should pick up both elements inserted via the view and through Renderer2',
       () => {
         @Directive({
           selector: '[dir]',
         })
         class MyDir {
           @Input('dir') dir: number|undefined;

           constructor(renderer: Renderer2, element: ElementRef) {
             const div = renderer.createElement('div');
             div.classList.add('myclass');
             renderer.appendChild(element.nativeElement, div);
           }
         }

         @Component({
           selector: 'app-test',
           template: '<div dir></div><span class="myclass"></span>',
         })
         class MyComponent {
         }

         TestBed.configureTestingModule({declarations: [MyComponent, MyDir]});
         const fixture = TestBed.createComponent(MyComponent);
         fixture.detectChanges();

         const results = fixture.debugElement.queryAll(By.css('.myclass'));

         expect(results.map(r => r.nativeElement.nodeName.toLowerCase())).toEqual(['div', 'span']);
       });

    it('should list providerTokens', () => {
      fixture = TestBed.createComponent(ParentComp);
      fixture.detectChanges();

      expect(fixture.debugElement.providerTokens).toContain(Logger);
    });

    it('should list locals', () => {
      fixture = TestBed.createComponent(LocalsComp);
      fixture.detectChanges();

      expect(fixture.debugElement.children[0].references!['alice']).toBeAnInstanceOf(MyDir);
    });

    it('should allow injecting from the element injector', () => {
      fixture = TestBed.createComponent(ParentComp);
      fixture.detectChanges();

      expect((<Logger>(fixture.debugElement.children[0].injector.get(Logger))).logs).toEqual([
        'parent', 'nestedparent', 'child', 'nestedchild'
      ]);
    });

    it('should list event listeners', () => {
      fixture = TestBed.createComponent(EventsComp);
      fixture.detectChanges();

      expect(fixture.debugElement.children[0].listeners.length).toEqual(1);
      expect(fixture.debugElement.children[1].listeners.length).toEqual(1);
    });

    it('should trigger event handlers', () => {
      fixture = TestBed.createComponent(EventsComp);
      fixture.detectChanges();

      expect(fixture.componentInstance.clicked).toBe(false);
      expect(fixture.componentInstance.customed).toBe(false);

      fixture.debugElement.children[0].triggerEventHandler('click', <Event>{});
      expect(fixture.componentInstance.clicked).toBe(true);

      fixture.debugElement.children[1].triggerEventHandler('myevent', <Event>{});
      expect(fixture.componentInstance.customed).toBe(true);
    });

    describe('properties', () => {
      it('should include classes in properties.className', () => {
        fixture = TestBed.createComponent(HostClassBindingCmp);
        fixture.detectChanges();

        const debugElement = fixture.debugElement;

        expect(debugElement.properties.className).toBe('class-one class-two');

        fixture.componentInstance.hostClasses = 'class-three';
        fixture.detectChanges();

        expect(debugElement.properties.className).toBe('class-three');

        fixture.componentInstance.hostClasses = '';
        fixture.detectChanges();

        expect(debugElement.properties.className).toBeFalsy();
      });

      it('should preserve the type of the property values', () => {
        const fixture = TestBed.createComponent(TestCmptWithPropBindings);
        fixture.detectChanges();

        const button = fixture.debugElement.query(By.css('button'));
        expect(button.properties.disabled).toEqual(true);
        expect(button.properties.tabIndex).toEqual(1337);
        expect(button.properties.title).toEqual('hello');
      });

      it('should include interpolated properties in the properties map', () => {
        const fixture = TestBed.createComponent(TestCmptWithPropInterpolation);
        fixture.detectChanges();

        const buttons = fixture.debugElement.children;

        expect(buttons.length).toBe(10);
        expect(buttons[0].properties.title).toBe('0');
        expect(buttons[1].properties.title).toBe('a1b');
        expect(buttons[2].properties.title).toBe('a1b2c');
        expect(buttons[3].properties.title).toBe('a1b2c3d');
        expect(buttons[4].properties.title).toBe('a1b2c3d4e');
        expect(buttons[5].properties.title).toBe('a1b2c3d4e5f');
        expect(buttons[6].properties.title).toBe('a1b2c3d4e5f6g');
        expect(buttons[7].properties.title).toBe('a1b2c3d4e5f6g7h');
        expect(buttons[8].properties.title).toBe('a1b2c3d4e5f6g7h8i');
        expect(buttons[9].properties.title).toBe('a1b2c3d4e5f6g7h8i9j');
      });

      it('should not include directive-shadowed properties in the properties map', () => {
        TestBed.overrideTemplate(
            TestCmptWithPropInterpolation,
            `<button with-title [title]="'goes to input'"></button>`);
        const fixture = TestBed.createComponent(TestCmptWithPropInterpolation);
        fixture.detectChanges();

        const button = fixture.debugElement.query(By.css('button'));
        expect(button.properties.title).not.toEqual('goes to input');
      });

      it('should return native properties from DOM element even if no binding present', () => {
        TestBed.overrideTemplate(TestCmptWithRenderer, `<button></button>`);
        const fixture = TestBed.createComponent(TestCmptWithRenderer);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css('button'));
        fixture.componentInstance.renderer.setProperty(button.nativeElement, 'title', 'myTitle');
        expect(button.properties.title).toBe('myTitle');
      });

      it('should not include patched properties (starting with __) and on* properties', () => {
        TestBed.overrideTemplate(
            TestCmptWithPropInterpolation, `<button title="myTitle" (click)="true;"></button>`);
        const fixture = TestBed.createComponent(TestCmptWithPropInterpolation);
        fixture.detectChanges();

        const host = fixture.debugElement;
        const button = fixture.debugElement.query(By.css('button'));
        expect(Object.keys(host.properties).filter(key => key.startsWith('__'))).toEqual([]);
        expect(Object.keys(host.properties).filter(key => key.startsWith('on'))).toEqual([]);
        expect(Object.keys(button.properties).filter(key => key.startsWith('__'))).toEqual([]);
        expect(Object.keys(button.properties).filter(key => key.startsWith('on'))).toEqual([]);
      });

      onlyInIvy('Show difference in behavior')
          .it('should pickup all of the element properties', () => {
            TestBed.overrideTemplate(
                TestCmptWithPropInterpolation, `<button title="myTitle"></button>`);
            const fixture = TestBed.createComponent(TestCmptWithPropInterpolation);
            fixture.detectChanges();

            const host = fixture.debugElement;
            const button = fixture.debugElement.query(By.css('button'));

            expect(button.properties.title).toEqual('myTitle');
          });
    });

    it('should trigger events registered via Renderer2', () => {
      @Component({template: ''})
      class TestComponent implements OnInit {
        count = 0;
        eventObj1: any;
        eventObj2: any;
        constructor(
            private renderer: Renderer2, private elementRef: ElementRef, private ngZone: NgZone) {}

        ngOnInit() {
          this.renderer.listen(this.elementRef.nativeElement, 'click', (event: any) => {
            this.count++;
            this.eventObj1 = event;
          });
          this.ngZone.runOutsideAngular(() => {
            this.renderer.listen(this.elementRef.nativeElement, 'click', (event: any) => {
              this.count++;
              this.eventObj2 = event;
            });
          });
        }
      }

      TestBed.configureTestingModule({declarations: [TestComponent]});
      const fixture = TestBed.createComponent(TestComponent);

      // Ivy depends on `eventListeners` to pick up events that haven't been registered through
      // Angular templates. At the time of writing Zone.js doesn't add `eventListeners` in Node
      // environments so we have to skip the test.
      if (!ivyEnabled || typeof fixture.debugElement.nativeElement.eventListeners === 'function') {
        const event = {value: true};
        fixture.detectChanges();
        fixture.debugElement.triggerEventHandler('click', event);
        expect(fixture.componentInstance.count).toBe(2);
        expect(fixture.componentInstance.eventObj2).toBe(event);
      }
    });

    it('should be able to trigger an event with a null value', () => {
      let value = undefined;

      @Component({template: '<button (click)="handleClick($event)"></button>'})
      class TestComponent {
        handleClick(_event: any) {
          value = _event;

          // Returning `false` is what causes the renderer to call `event.preventDefault`.
          return false;
        }
      }

      TestBed.configureTestingModule({declarations: [TestComponent]});
      const fixture = TestBed.createComponent(TestComponent);
      const button = fixture.debugElement.query(By.css('button'));

      expect(() => {
        button.triggerEventHandler('click', null);
        fixture.detectChanges();
      }).not.toThrow();

      expect(value).toBeNull();
    });

    describe('componentInstance on DebugNode', () => {
      it('should return component associated with a node if a node is a component host', () => {
        TestBed.overrideTemplate(TestCmpt, `<parent-comp></parent-comp>`);
        fixture = TestBed.createComponent(TestCmpt);

        const debugEl = fixture.debugElement.children[0];
        expect(debugEl.componentInstance).toBeAnInstanceOf(ParentComp);
      });

      it('should return component associated with a node if a node is a component host (content projection)',
         () => {
           TestBed.overrideTemplate(
               TestCmpt, `<parent-comp><child-comp></child-comp></parent-comp>`);
           fixture = TestBed.createComponent(TestCmpt);

           const debugEl = fixture.debugElement.query(By.directive(ChildComp));
           expect(debugEl.componentInstance).toBeAnInstanceOf(ChildComp);
         });

      it('should return host component instance if a node has no associated component and there is no component projecting this node',
         () => {
           TestBed.overrideTemplate(TestCmpt, `<div></div>`);
           fixture = TestBed.createComponent(TestCmpt);

           const debugEl = fixture.debugElement.children[0];
           expect(debugEl.componentInstance).toBeAnInstanceOf(TestCmpt);
         });

      it('should return host component instance if a node has no associated component and there is no component projecting this node (nested embedded views)',
         () => {
           TestBed.overrideTemplate(TestCmpt, `
                <ng-template [ngIf]="true">
                  <ng-template [ngIf]="true">
                    <div mydir></div>
                  </ng-template>
                </ng-template>`);
           fixture = TestBed.createComponent(TestCmpt);
           fixture.detectChanges();

           const debugEl = fixture.debugElement.query(By.directive(MyDir));
           expect(debugEl.componentInstance).toBeAnInstanceOf(TestCmpt);
         });

      it('should return component instance that projects a given node if a node has no associated component',
         () => {
           TestBed.overrideTemplate(
               TestCmpt, `<parent-comp><span><div></div></span></parent-comp>`);
           fixture = TestBed.createComponent(TestCmpt);

           const debugEl = fixture.debugElement.children[0].children[0].children[0];  // <div>
           expect(debugEl.componentInstance).toBeAnInstanceOf(ParentComp);
         });
    });

    describe('context on DebugNode', () => {
      it('should return component associated with the node if both a structural directive and a component match the node',
         () => {
           @Component({selector: 'example-component', template: ''})
           class ExampleComponent {
           }

           TestBed.configureTestingModule(
               {imports: [CommonModule], declarations: [ExampleComponent]});
           TestBed.overrideTemplate(
               TestApp, '<example-component *ngIf="true"></example-component>');

           const fixture = TestBed.createComponent(TestApp);
           fixture.detectChanges();
           const debugNode = fixture.debugElement.query(By.directive(ExampleComponent));

           expect(debugNode.context instanceof ExampleComponent).toBe(true);
         });

      it('should return structural directive context if there is a structural directive on the node',
         () => {
           TestBed.configureTestingModule({imports: [CommonModule]});
           TestBed.overrideTemplate(TestApp, '<span *ngIf="true"></span>');

           const fixture = TestBed.createComponent(TestApp);
           fixture.detectChanges();
           const debugNode = fixture.debugElement.query(By.css('span'));

           expect(debugNode.context instanceof NgIfContext).toBe(true);
         });

      it('should return the containing component if there is no structural directive or component on the node',
         () => {
           TestBed.configureTestingModule({declarations: [MyDir]});
           TestBed.overrideTemplate(TestApp, '<span mydir></span>');

           const fixture = TestBed.createComponent(TestApp);
           fixture.detectChanges();
           const debugNode = fixture.debugElement.query(By.directive(MyDir));

           expect(debugNode.context instanceof TestApp).toBe(true);
         });
    });

    it('should be able to query for elements that are not in the same DOM tree anymore', () => {
      fixture = TestBed.createComponent(SimpleContentComp);
      fixture.detectChanges();

      const parent = fixture.nativeElement.parentElement;
      const content = fixture.componentInstance.content.nativeElement;

      // Move the content element outside the component
      // so that it can't be reached via querySelector.
      parent.appendChild(content);

      expect(fixture.debugElement.query(By.css('.content'))).toBeTruthy();

      getDOM().remove(content);
    });

    it('should support components with ViewContainerRef', () => {
      fixture = TestBed.createComponent(TestCmptWithViewContainerRef);

      const divEl = fixture.debugElement.query(By.css('div'));
      expect(divEl).not.toBeNull();
    });

    it('should support querying on any debug element', () => {
      TestBed.overrideTemplate(TestCmpt, `<span><div id="a"><div id="b"></div></div></span>`);
      fixture = TestBed.createComponent(TestCmpt);

      const divA = fixture.debugElement.query(By.css('div'));
      expect(divA.nativeElement.getAttribute('id')).toBe('a');

      const divB = divA.query(By.css('div'));
      expect(divB.nativeElement.getAttribute('id')).toBe('b');
    });

    it('should be an instance of DebugNode', () => {
      fixture = TestBed.createComponent(ParentComp);
      fixture.detectChanges();
      expect(fixture.debugElement).toBeAnInstanceOf(DebugNode);
    });

    it('should return the same element when queried twice', () => {
      fixture = TestBed.createComponent(ParentComp);
      fixture.detectChanges();

      const childTestElsFirst = fixture.debugElement.queryAll(By.css('child-comp'));
      const childTestElsSecond = fixture.debugElement.queryAll(By.css('child-comp'));

      expect(childTestElsFirst.length).toBe(1);
      expect(childTestElsSecond[0]).toBe(childTestElsFirst[0]);
    });

    it('should not query the descendants of a sibling node', () => {
      @Component({
        selector: 'my-comp',
        template: `
          <div class="div.1">
            <p class="p.1">
              <span class="span.1">span.1</span>
              <span class="span.2">span.2</span>
            </p>
            <p class="p.2">
              <span class="span.3">span.3</span>
              <span class="span.4">span.4</span>
            </p>
          </div>
          <div class="div.2">
            <p class="p.3">
              <span class="span.5">span.5</span>
              <span class="span.6">span.6</span>
            </p>
            <p class="p.4">
              <span class="span.7">span.7</span>
              <span class="span.8">span.8</span>
            </p>
          </div>
        `
      })
      class MyComp {
      }

      TestBed.configureTestingModule({declarations: [MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const firstDiv = fixture.debugElement.query(By.css('div'));
      const firstDivChildren = firstDiv.queryAll(By.css('span'));

      expect(firstDivChildren.map(child => child.nativeNode.textContent.trim())).toEqual([
        'span.1', 'span.2', 'span.3', 'span.4'
      ]);
    });

    it('should preserve the attribute case in DebugNode.attributes', () => {
      @Component({selector: 'my-icon', template: ''})
      class Icon {
        @Input() svgIcon: any = '';
      }
      @Component({template: `<my-icon svgIcon="test"></my-icon>`})
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, Icon]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const element = fixture.debugElement.children[0];

      // Assert that the camel-case attribute is correct.
      expect(element.attributes.svgIcon).toBe('test');

      // Make sure that we somehow didn't preserve the native lower-cased value.
      expect(element.attributes.svgicon).toBeFalsy();
    });


    it('should include namespaced attributes in DebugNode.attributes', () => {
      @Component({
        template: `<div xlink:href="foo"></div>`,
      })
      class Comp {
      }

      TestBed.configureTestingModule({declarations: [Comp]});
      const fixture = TestBed.createComponent(Comp);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('div')).attributes['xlink:href']).toBe('foo');
    });

    it('should include attributes added via Renderer2 in DebugNode.attributes', () => {
      @Component({
        template: '<div></div>',
      })
      class Comp {
        constructor(public renderer: Renderer2) {}
      }

      TestBed.configureTestingModule({declarations: [Comp]});
      const fixture = TestBed.createComponent(Comp);
      const div = fixture.debugElement.query(By.css('div'));

      fixture.componentInstance.renderer.setAttribute(div.nativeElement, 'foo', 'bar');

      expect(div.attributes.foo).toBe('bar');
    });

    it('should clear event listeners when node is destroyed', () => {
      let calls = 0;
      @Component({
        selector: 'cancel-button',
        template: '',
      })
      class CancelButton {
        @Output() cancel = new EventEmitter<void>();
      }

      @Component({
        template: '<cancel-button *ngIf="visible" (cancel)="cancel()"></cancel-button>',
      })
      class App {
        visible = true;
        cancel() {
          calls++;
        }
      }

      TestBed.configureTestingModule({declarations: [App, CancelButton]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.directive(CancelButton));
      button.triggerEventHandler('cancel', {});

      expect(calls).toBe(1, 'Expected calls to be 1 after one event.');

      fixture.componentInstance.visible = false;
      fixture.detectChanges();

      button.triggerEventHandler('cancel', {});

      expect(calls).toBe(1, 'Expected calls to stay 1 after destroying the node.');
    });
  });

  it('should not error when accessing node name', () => {
    @Component({template: ''})
    class EmptyComponent {
    }

    const fixture = TestBed.configureTestingModule({declarations: [EmptyComponent]})
                        .createComponent(EmptyComponent);
    let node = fixture.debugElement;
    let superParentName = '';
    // Traverse upwards, all the way to #document, which is not a
    // Node.ELEMENT_NODE
    while (node) {
      superParentName = node.name;
      node = node.parent!;
    }
    expect(superParentName).not.toEqual('');
  });

  it('should match node name with declared casing', () => {
    @Component({template: `<div></div><myComponent></myComponent>`})
    class Wrapper {
    }

    @Component({selector: 'myComponent', template: ''})
    class MyComponent {
    }

    const fixture = TestBed.configureTestingModule({declarations: [Wrapper, MyComponent]})
                        .createComponent(Wrapper);
    expect(fixture.debugElement.query(e => e.name === 'myComponent')).toBeTruthy();
    expect(fixture.debugElement.query(e => e.name === 'div')).toBeTruthy();
  });

  it('does not call event listeners added outside angular context', () => {
    let listenerCalled = false;
    const eventToTrigger = createMouseEvent('mouseenter');
    function listener() {
      listenerCalled = true;
    }
    @Component({template: ''})
    class MyComp {
      constructor(private readonly zone: NgZone, private readonly element: ElementRef) {}
      ngOnInit() {
        this.zone.runOutsideAngular(() => {
          this.element.nativeElement.addEventListener('mouseenter', listener);
        });
      }
    }
    const fixture =
        TestBed.configureTestingModule({declarations: [MyComp]}).createComponent(MyComp);
    fixture.detectChanges();
    fixture.debugElement.triggerEventHandler('mouseenter', eventToTrigger);
    expect(listenerCalled).toBe(false);
  });
}
