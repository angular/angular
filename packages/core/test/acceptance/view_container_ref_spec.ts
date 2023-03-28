/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, DOCUMENT} from '@angular/common';
import {computeMsgId} from '@angular/compiler';
import {ChangeDetectorRef, Compiler, Component, createComponent, createEnvironmentInjector, Directive, DoCheck, ElementRef, EmbeddedViewRef, EnvironmentInjector, ErrorHandler, InjectionToken, Injector, Input, NgModule, NgModuleRef, NO_ERRORS_SCHEMA, OnDestroy, OnInit, Pipe, PipeTransform, QueryList, Renderer2, RendererFactory2, RendererType2, Sanitizer, TemplateRef, ViewChild, ViewChildren, ViewContainerRef, ɵsetDocument} from '@angular/core';
import {ngDevModeResetPerfCounters} from '@angular/core/src/util/ng_dev_mode';
import {ComponentFixture, TestBed, TestComponentRenderer} from '@angular/core/testing';
import {clearTranslations, loadTranslations} from '@angular/localize';
import {By, DomSanitizer} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';

describe('ViewContainerRef', () => {
  /**
   * Gets the inner HTML of the given element with all HTML comments and Angular internal
   * reflect attributes omitted. This makes HTML comparisons easier and less verbose.
   */
  function getElementHtml(element: Element) {
    return element.innerHTML.replace(/<!--(\W|\w)*?-->/g, '')
        .replace(/\sng-reflect-\S*="[^"]*"/g, '');
  }

  /**
   * Helper method to retrieve the text content of the given element. This method also strips all
   * leading and trailing whitespace and removes all newlines. This makes element content
   * comparisons easier and less verbose.
   */
  function getElementText(element: Element): string {
    return element.textContent!.trim().replace(/\r?\n/g, ' ').replace(/ +/g, ' ');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        StructDir, ViewContainerRefComp, ViewContainerRefApp, DestroyCasesComp, ConstructorDir,
        ConstructorApp, ConstructorAppWithQueries
      ]
    });
  });

  afterEach(() => clearTranslations());

  describe('create', () => {
    it('should support view queries inside embedded views created in dir constructors', () => {
      const fixture = TestBed.createComponent(ConstructorApp);
      fixture.detectChanges();
      expect(fixture.componentInstance.foo).toBeAnInstanceOf(ElementRef);
      expect(fixture.componentInstance.foo.nativeElement)
          .toEqual(fixture.debugElement.nativeElement.querySelector('span'));
    });

    it('should ensure results in views created in constructors do not appear before template node results',
       () => {
         const fixture = TestBed.createComponent(ConstructorAppWithQueries);
         fixture.detectChanges();
         expect(fixture.componentInstance.foo).toBeAnInstanceOf(TemplateRef);
       });

    it('should construct proper TNode / DOM tree when embedded views are created in a directive constructor',
       () => {
         @Component({
           selector: 'view-insertion-test-cmpt',
           template:
               `<div>before<ng-template constructorDir><span>|middle|</span></ng-template>after</div>`
         })
         class ViewInsertionTestCmpt {
         }

         TestBed.configureTestingModule({declarations: [ViewInsertionTestCmpt, ConstructorDir]});

         const fixture = TestBed.createComponent(ViewInsertionTestCmpt);
         expect(fixture.nativeElement).toHaveText('before|middle|after');
       });

    it('should use comment node of host ng-container as insertion marker', () => {
      @Component({template: 'hello'})
      class HelloComp {
      }

      @Component({
        template: `
          <ng-container vcref></ng-container>
        `
      })
      class TestComp {
        @ViewChild(VCRefDirective, {static: true}) vcRefDir!: VCRefDirective;
      }

      TestBed.configureTestingModule({declarations: [TestComp, VCRefDirective, HelloComp]});
      const fixture = TestBed.createComponent(TestComp);
      const {vcref, elementRef} = fixture.componentInstance.vcRefDir;
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML)
          .toMatch(/<!--(ng-container)?-->/, 'Expected only one comment node to be generated.');

      const testParent = document.createElement('div');
      testParent.appendChild(elementRef.nativeElement);

      expect(testParent.textContent).toBe('');
      expect(testParent.childNodes.length).toBe(1);
      expect(testParent.childNodes[0].nodeType).toBe(Node.COMMENT_NODE);

      // Add a test component to the view container ref to ensure that
      // the "ng-container" comment was used as marker for the insertion.
      vcref.createComponent(HelloComp);
      fixture.detectChanges();

      expect(testParent.textContent).toBe('hello');
      expect(testParent.childNodes.length).toBe(2);
      expect(testParent.childNodes[0].nodeType).toBe(Node.ELEMENT_NODE);
      expect(testParent.childNodes[0].textContent).toBe('hello');
      expect(testParent.childNodes[1].nodeType).toBe(Node.COMMENT_NODE);
    });

    it('should support attribute selectors in dynamically created components', () => {
      @Component({selector: '[hello]', template: 'Hello'})
      class HelloComp {
      }

      @Component({
        template: `
          <ng-container #container></ng-container>
        `
      })
      class TestComp {
        @ViewChild('container', {read: ViewContainerRef}) vcRef!: ViewContainerRef;

        createComponent() {
          this.vcRef.createComponent(HelloComp);
        }
      }

      TestBed.configureTestingModule({declarations: [TestComp, HelloComp]});
      const fixture = TestBed.createComponent(TestComp);
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.innerHTML).not.toContain('Hello');

      fixture.componentInstance.createComponent();
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.innerHTML).toContain('Hello');
    });

    it('should view queries in dynamically created components', () => {
      @Component({
        selector: 'dynamic-cmpt-with-view-queries',
        template: `<div #foo></div>`,
      })
      class DynamicCompWithViewQueries {
        @ViewChildren('foo') fooList!: QueryList<ElementRef>;
      }

      @Component({
        selector: 'test-cmp',
        template: ``,
      })
      class TestCmp {
        constructor(readonly vcRf: ViewContainerRef) {}
      }

      const fixture = TestBed.createComponent(TestCmp);
      const cmpRef = fixture.componentInstance.vcRf.createComponent(DynamicCompWithViewQueries);
      fixture.detectChanges();

      expect(cmpRef.instance.fooList.length).toBe(1);
      expect(cmpRef.instance.fooList.first).toBeAnInstanceOf(ElementRef);
    });

    describe('element namespaces', () => {
      function runTestWithSelectors(svgSelector: string, mathMLSelector: string) {
        it('should be set correctly for host elements of dynamically created components', () => {
          @Component({
            selector: svgSelector,
            template: '<svg><g></g></svg>',
          })
          class SvgComp {
          }

          @Component({
            selector: mathMLSelector,
            template: '<math><matrix></matrix></math>',
          })
          class MathMLComp {
          }

          @Component({
            template: `
              <ng-container #svg></ng-container>
              <ng-container #mathml></ng-container>
            `
          })
          class TestComp {
            @ViewChild('svg', {read: ViewContainerRef}) svgVCRef!: ViewContainerRef;
            @ViewChild('mathml', {read: ViewContainerRef}) mathMLVCRef!: ViewContainerRef;

            constructor() {}

            createDynamicComponents() {
              this.svgVCRef.createComponent(SvgComp);
              this.mathMLVCRef.createComponent(MathMLComp);
            }
          }

          function _document(): any {
            // Tell Ivy about the global document
            ɵsetDocument(document);
            return document;
          }

          TestBed.configureTestingModule({
            declarations: [TestComp, SvgComp, MathMLComp],
            providers: [
              {provide: DOCUMENT, useFactory: _document, deps: []},
            ],
          });
          const fixture = TestBed.createComponent(TestComp);
          fixture.detectChanges();

          fixture.componentInstance.createDynamicComponents();
          fixture.detectChanges();

          expect(fixture.nativeElement.querySelector('svg').namespaceURI)
              .toEqual('http://www.w3.org/2000/svg');
          expect(fixture.nativeElement.querySelector('math').namespaceURI)
              .toEqual('http://www.w3.org/1998/MathML/');
        });
      }

      runTestWithSelectors('svg[some-attr]', 'math[some-attr]');

      // Also test with selector that has element name in uppercase
      runTestWithSelectors('SVG[some-attr]', 'MATH[some-attr]');
    });

    it('should apply attributes and classes to host element based on selector', () => {
      @Component({
        selector: '[attr-a=a].class-a:not(.class-b):not([attr-b=b]).class-c[attr-c]',
        template: 'Hello'
      })
      class HelloComp {
      }

      @Component({
        template: `
          <div id="factory" attr-a="a-original" class="class-original"></div>
          <div id="vcr">
            <ng-container #container></ng-container>
          </div>
        `
      })
      class TestComp {
        @ViewChild('container', {read: ViewContainerRef}) vcRef!: ViewContainerRef;


        constructor(public injector: EnvironmentInjector, private elementRef: ElementRef) {}

        createComponentViaVCRef() {
          this.vcRef.createComponent(HelloComp);
        }

        createComponentViaFactory() {
          createComponent(HelloComp, {
            environmentInjector: this.injector,
            hostElement: this.elementRef.nativeElement.querySelector('#factory')
          });
        }
      }

      TestBed.configureTestingModule({declarations: [TestComp, HelloComp]});
      const fixture = TestBed.createComponent(TestComp);
      fixture.detectChanges();
      fixture.componentInstance.createComponentViaVCRef();
      fixture.componentInstance.createComponentViaFactory();
      fixture.detectChanges();

      // Verify host element for a component created via  `vcRef.createComponent` method
      const vcrHostElement = fixture.nativeElement.querySelector('#vcr > div');

      expect(vcrHostElement.classList.contains('class-a')).toBe(true);
      // `class-b` should not be present, since it's wrapped in `:not()` selector
      expect(vcrHostElement.classList.contains('class-b')).toBe(false);
      expect(vcrHostElement.classList.contains('class-c')).toBe(true);

      expect(vcrHostElement.getAttribute('attr-a')).toBe('a');
      // `attr-b` should not be present, since it's wrapped in `:not()` selector
      expect(vcrHostElement.getAttribute('attr-b')).toBe(null);
      expect(vcrHostElement.getAttribute('attr-c')).toBe('');

      // Verify host element for a component created using `factory.createComponent` method when
      // also passing element selector as an argument
      const factoryHostElement = fixture.nativeElement.querySelector('#factory');

      //  Verify original attrs and classes are still present
      expect(factoryHostElement.classList.contains('class-original')).toBe(true);
      expect(factoryHostElement.getAttribute('attr-a')).toBe('a-original');

      // Make sure selector-based attrs and classes were not added to the host element
      expect(factoryHostElement.classList.contains('class-a')).toBe(false);
      expect(factoryHostElement.getAttribute('attr-c')).toBe(null);
    });
  });

  describe('insert', () => {
    it('should not blow up on destroy when inserting a view that is already attached', () => {
      const fixture = TestBed.createComponent(ViewContainerRefApp);
      fixture.detectChanges();

      const template0 = fixture.componentInstance.vcrComp.templates.first;
      const viewContainerRef = fixture.componentInstance.vcrComp.vcr;
      const ref0 = viewContainerRef.createEmbeddedView(template0);

      // Insert the view again at the same index
      viewContainerRef.insert(ref0, 0);

      expect(() => {
        fixture.destroy();
      }).not.toThrow();

      expect(fixture.nativeElement.textContent).toEqual('0');
    });

    it('should move views if they are already attached', () => {
      const fixture = TestBed.createComponent(ViewContainerRefApp);
      fixture.detectChanges();

      const templates = fixture.componentInstance.vcrComp.templates.toArray();
      const viewContainerRef = fixture.componentInstance.vcrComp.vcr;
      const ref0 = viewContainerRef.createEmbeddedView(templates[0]);
      const ref1 = viewContainerRef.createEmbeddedView(templates[1]);
      const ref2 = viewContainerRef.createEmbeddedView(templates[2]);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toEqual('012');

      // Insert the view again at a different index
      viewContainerRef.insert(ref0, 2);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toEqual('120');
    });

    it('should do nothing when a view is re-inserted / moved at the same index', () => {
      const fixture = TestBed.createComponent(ViewContainerRefApp);
      fixture.detectChanges();

      const templates = fixture.componentInstance.vcrComp.templates.toArray();
      const viewContainerRef = fixture.componentInstance.vcrComp.vcr;

      const ref0 = viewContainerRef.createEmbeddedView(templates[0]);

      expect(fixture.nativeElement.textContent).toEqual('0');

      // insert again at the same place but without specifying any index
      viewContainerRef.insert(ref0);
      expect(fixture.nativeElement.textContent).toEqual('0');
    });

    it('should insert a view already inserted into another container', () => {
      @Component({
        selector: 'test-cmpt',
        template: `
          <ng-template #t>content</ng-template>
          before|<ng-template #c1></ng-template>|middle|<ng-template #c2></ng-template>|after
        `
      })
      class TestComponent {
        @ViewChild('t', {static: true}) t!: TemplateRef<{}>;
        @ViewChild('c1', {static: true, read: ViewContainerRef}) c1!: ViewContainerRef;
        @ViewChild('c2', {static: true, read: ViewContainerRef}) c2!: ViewContainerRef;
      }

      TestBed.configureTestingModule({declarations: [TestComponent]});
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      const cmpt = fixture.componentInstance;
      const native = fixture.nativeElement;

      expect(native.textContent.trim()).toEqual('before||middle||after');

      // create and insert an embedded view into the c1 container
      const viewRef = cmpt.c1.createEmbeddedView(cmpt.t, {});
      expect(native.textContent.trim()).toEqual('before|content|middle||after');
      expect(cmpt.c1.indexOf(viewRef)).toBe(0);
      expect(cmpt.c2.indexOf(viewRef)).toBe(-1);

      // move the existing embedded view into the c2 container
      cmpt.c2.insert(viewRef);
      expect(native.textContent.trim()).toEqual('before||middle|content|after');
      expect(cmpt.c1.indexOf(viewRef)).toBe(-1);
      expect(cmpt.c2.indexOf(viewRef)).toBe(0);
    });

    it('should add embedded views at the right position in the DOM tree (ng-template next to other ng-template)',
       () => {
         @Component({
           template: `before|<ng-template #a>A</ng-template><ng-template #b>B</ng-template>|after`
         })
         class TestCmp {
           @ViewChild('a', {static: true}) ta!: TemplateRef<{}>;
           @ViewChild('b', {static: true}) tb!: TemplateRef<{}>;
           @ViewChild('a', {static: true, read: ViewContainerRef}) ca!: ViewContainerRef;
           @ViewChild('b', {static: true, read: ViewContainerRef}) cb!: ViewContainerRef;
         }

         const fixture = TestBed.createComponent(TestCmp);
         const testCmpInstance = fixture.componentInstance;

         fixture.detectChanges();
         expect(fixture.nativeElement.textContent).toBe('before||after');

         testCmpInstance.cb.createEmbeddedView(testCmpInstance.tb);
         fixture.detectChanges();
         expect(fixture.nativeElement.textContent).toBe('before|B|after');

         testCmpInstance.ca.createEmbeddedView(testCmpInstance.ta);
         fixture.detectChanges();
         expect(fixture.nativeElement.textContent).toBe('before|AB|after');
       });
  });

  describe('move', () => {
    it('should insert detached views in move()', () => {
      const fixture = TestBed.createComponent(ViewContainerRefApp);
      fixture.detectChanges();

      const templates = fixture.componentInstance.vcrComp.templates.toArray();
      const viewContainerRef = fixture.componentInstance.vcrComp.vcr;
      const ref0 = viewContainerRef.createEmbeddedView(templates[0]);
      const ref1 = viewContainerRef.createEmbeddedView(templates[1]);
      const ref2 = viewContainerRef.createEmbeddedView(templates[2]);

      viewContainerRef.detach(0);
      viewContainerRef.move(ref0, 0);

      expect(fixture.nativeElement.textContent).toEqual('012');
    });
  });

  it('should not throw when calling remove() on an empty container', () => {
    const fixture = TestBed.createComponent(ViewContainerRefApp);
    fixture.detectChanges();

    const viewContainerRef = fixture.componentInstance.vcrComp.vcr;

    expect(viewContainerRef.length).toBe(0);
    expect(() => viewContainerRef.remove()).not.toThrow();
  });

  it('should not throw when calling detach() on an empty container', () => {
    const fixture = TestBed.createComponent(ViewContainerRefApp);
    fixture.detectChanges();

    const viewContainerRef = fixture.componentInstance.vcrComp.vcr;

    expect(viewContainerRef.length).toBe(0);
    expect(() => viewContainerRef.detach()).not.toThrow();
  });

  describe('destroy should clean the DOM in all cases:', () => {
    function executeTest(template: string) {
      TestBed.overrideTemplate(DestroyCasesComp, template).configureTestingModule({
        schemas: [NO_ERRORS_SCHEMA]
      });

      const fixture = TestBed.createComponent(DestroyCasesComp);
      fixture.detectChanges();
      const initial = fixture.nativeElement.innerHTML;

      const structDirs = fixture.componentInstance.structDirs.toArray();

      structDirs.forEach(structDir => structDir.create());
      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('Foo');

      structDirs.forEach(structDir => structDir.destroy());
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual(initial);
    }

    it('when nested ng-container', () => {
      executeTest(`
        <ng-template structDir>
          <before></before>
          <ng-container>
            <before></before>
            <ng-container>
              <inside>Foo</inside>
            </ng-container>
            <after></after>
          </ng-container>
          <after></after>
        </ng-template>`);
    });

    it('when ViewContainerRef is on a ng-container', () => {
      executeTest(`
        <ng-template #foo>
          <span>Foo</span>
        </ng-template>

        <ng-template structDir>
          <before></before>
          <ng-container [ngTemplateOutlet]="foo">
            <inside></inside>
          </ng-container>
          <after></after>
        </ng-template>`);
    });

    it('when ViewContainerRef is on an element', () => {
      executeTest(`
      <ng-template #foo>
        <span>Foo</span>
      </ng-template>

      <ng-template structDir>
        <before></before>
        <div [ngTemplateOutlet]="foo">
          <inside></inside>
        </div>
        <after></after>
      </ng-template>`);
    });

    it('when ViewContainerRef is on a ng-template', () => {
      executeTest(`
      <ng-template #foo>
        <span>Foo</span>
      </ng-template>

      <ng-template structDir>
        <before></before>
        <ng-template [ngTemplateOutlet]="foo"></ng-template>
        <after></after>
      </ng-template>`);
    });

    it('when ViewContainerRef is on an element inside a ng-container', () => {
      executeTest(`
      <ng-template #foo>
        <span>Foo</span>
      </ng-template>

      <ng-template structDir>
        <before></before>
        <ng-container>
          <before></before>
          <div [ngTemplateOutlet]="foo">
            <inside></inside>
          </div>
          <after></after>
        </ng-container>
        <after></after>
      </ng-template>`);
    });

    it('when ViewContainerRef is on an element inside a ng-container with i18n', () => {
      loadTranslations({
        [computeMsgId('Bar')]: 'o',
        [computeMsgId(
            '{$START_TAG_BEFORE}{$CLOSE_TAG_BEFORE}{$START_TAG_DIV}{$START_TAG_INSIDE}{$CLOSE_TAG_INSIDE}{$CLOSE_TAG_DIV}{$START_TAG_AFTER}{$CLOSE_TAG_AFTER}')]:
            'F{$START_TAG_DIV}{$CLOSE_TAG_DIV}o',
      });
      executeTest(`
      <ng-template #foo>
        <span i18n>Bar</span>
      </ng-template>

      <ng-template structDir>
        <before></before>
        <ng-container i18n>
          <before></before>
          <div [ngTemplateOutlet]="foo">
            <inside></inside>
          </div>
          <after></after>
        </ng-container>
        <after></after>
      </ng-template>`);
    });

    it('when ViewContainerRef is on an element, and i18n is on the parent ViewContainerRef', () => {
      loadTranslations({
        [computeMsgId(
            '{$START_TAG_BEFORE}{$CLOSE_TAG_BEFORE}{$START_TAG_DIV}{$START_TAG_IN}{$CLOSE_TAG_IN}{$CLOSE_TAG_DIV}{$START_TAG_AFTER}{$CLOSE_TAG_AFTER}')]:
            '{$START_TAG_DIV}{$CLOSE_TAG_DIV}{$START_TAG_BEFORE}oo{$CLOSE_TAG_BEFORE}',
        [computeMsgId('{VAR_SELECT, select, other {|{INTERPOLATION}|}}')]:
            '{VAR_SELECT, select, other {|{INTERPOLATION}|}}',
      });
      executeTest(`
      <ng-template #foo>
        <span>F</span>
      </ng-template>

      <ng-template structDir i18n>
        <before></before>
        <div [ngTemplateOutlet]="foo">
          <in></in>
        </div>
        <after></after>
      </ng-template>`);
    });
  });

  describe('length', () => {
    it('should return the number of embedded views', () => {
      TestBed.configureTestingModule({declarations: [EmbeddedViewInsertionComp, VCRefDirective]});
      const fixture = TestBed.createComponent(EmbeddedViewInsertionComp);
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);
      fixture.detectChanges();

      expect(vcRefDir.vcref.length).toEqual(0);

      vcRefDir.createView('A');
      vcRefDir.createView('B');
      vcRefDir.createView('C');
      fixture.detectChanges();
      expect(vcRefDir.vcref.length).toEqual(3);

      vcRefDir.vcref.detach(1);
      fixture.detectChanges();
      expect(vcRefDir.vcref.length).toEqual(2);

      vcRefDir.vcref.clear();
      fixture.detectChanges();
      expect(vcRefDir.vcref.length).toEqual(0);
    });
  });

  describe('get and indexOf', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({declarations: [EmbeddedViewInsertionComp, VCRefDirective]});
    });

    it('should retrieve a ViewRef from its index, and vice versa', () => {
      const fixture = TestBed.createComponent(EmbeddedViewInsertionComp);
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);
      fixture.detectChanges();

      vcRefDir.createView('A');
      vcRefDir.createView('B');
      vcRefDir.createView('C');
      fixture.detectChanges();

      let viewRef = vcRefDir.vcref.get(0);
      expect(vcRefDir.vcref.indexOf(viewRef!)).toEqual(0);

      viewRef = vcRefDir.vcref.get(1);
      expect(vcRefDir.vcref.indexOf(viewRef!)).toEqual(1);

      viewRef = vcRefDir.vcref.get(2);
      expect(vcRefDir.vcref.indexOf(viewRef!)).toEqual(2);
    });

    it('should handle out of bounds cases', () => {
      const fixture = TestBed.createComponent(EmbeddedViewInsertionComp);
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);
      fixture.detectChanges();

      vcRefDir.createView('A');
      fixture.detectChanges();

      expect(vcRefDir.vcref.get(-1)).toBeNull();
      expect(vcRefDir.vcref.get(42)).toBeNull();

      const viewRef = vcRefDir.vcref.get(0);
      vcRefDir.vcref.remove(0);
      expect(vcRefDir.vcref.indexOf(viewRef!)).toEqual(-1);
    });

    it('should return -1 as indexOf when no views were inserted', () => {
      const fixture = TestBed.createComponent(ViewContainerRefComp);
      fixture.detectChanges();

      const cmpt = fixture.componentInstance;
      const viewRef = cmpt.templates.first.createEmbeddedView({});

      // ViewContainerRef is empty and we've got a reference to a view that was not attached
      // anywhere
      expect(cmpt.vcr.indexOf(viewRef)).toBe(-1);

      cmpt.vcr.insert(viewRef);
      expect(cmpt.vcr.indexOf(viewRef)).toBe(0);

      cmpt.vcr.remove(0);
      expect(cmpt.vcr.indexOf(viewRef)).toBe(-1);
    });
  });

  describe('move', () => {
    it('should move embedded views and associated DOM nodes without recreating them', () => {
      TestBed.configureTestingModule({declarations: [EmbeddedViewInsertionComp, VCRefDirective]});
      const fixture = TestBed.createComponent(EmbeddedViewInsertionComp);
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);
      fixture.detectChanges();

      vcRefDir.createView('A');
      vcRefDir.createView('B');
      vcRefDir.createView('C');

      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>ABC');

      // The DOM is manually modified here to ensure that the text node is actually moved
      fixture.nativeElement.childNodes[2].nodeValue = '**A**';
      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>**A**BC');

      let viewRef = vcRefDir.vcref.get(0);
      vcRefDir.vcref.move(viewRef!, 2);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>BC**A**');

      vcRefDir.vcref.move(viewRef!, 0);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>**A**BC');

      vcRefDir.vcref.move(viewRef!, 1);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>B**A**C');

      expect(() => vcRefDir.vcref.move(viewRef!, -1)).toThrow();
      expect(() => vcRefDir.vcref.move(viewRef!, 42)).toThrow();
    });
  });

  describe('getters for the anchor node', () => {
    it('should work on templates', () => {
      @Component({
        template: `
          <ng-template vcref let-name>{{name}}</ng-template>
          <footer></footer>
        `
      })
      class TestComponent {
        @ViewChild(VCRefDirective, {static: true}) vcRefDir!: VCRefDirective;
      }

      TestBed.configureTestingModule({declarations: [VCRefDirective, TestComponent]});
      const fixture = TestBed.createComponent(TestComponent);
      const {vcRefDir} = fixture.componentInstance;
      fixture.detectChanges();

      expect(vcRefDir.vcref.element.nativeElement.nodeType).toBe(Node.COMMENT_NODE);
      // In Ivy, the comment for the view container ref has text that implies
      // that the comment is a placeholder for a container.
      expect(vcRefDir.vcref.element.nativeElement.textContent).toEqual('container');

      expect(vcRefDir.vcref.injector.get(ElementRef).nativeElement.textContent)
          .toEqual('container');
      expect(getElementHtml(vcRefDir.vcref.parentInjector.get(ElementRef).nativeElement))
          .toBe('<footer></footer>');
    });

    it('should work on elements', () => {
      @Component({
        template: `
          <header vcref></header>
          <footer></footer>
        `
      })
      class TestComponent {
        @ViewChild(VCRefDirective, {static: true}) vcRefDir!: VCRefDirective;
      }

      TestBed.configureTestingModule({declarations: [VCRefDirective, TestComponent]});
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      const vcref = fixture.componentInstance.vcRefDir.vcref;

      expect(vcref.element.nativeElement.tagName.toLowerCase()).toEqual('header');
      expect(vcref.injector.get(ElementRef).nativeElement.tagName.toLowerCase()).toEqual('header');
    });

    it('should work on components', () => {
      @Component({selector: 'header-cmp', template: ``})
      class HeaderCmp {
      }

      @Component({
        template: `
          <header-cmp vcref></header-cmp>
          <footer></footer>
        `
      })
      class TestComponent {
        @ViewChild(VCRefDirective, {static: true}) vcRefDir!: VCRefDirective;
      }

      TestBed.configureTestingModule({declarations: [HeaderCmp, VCRefDirective, TestComponent]});
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      const vcref = fixture.componentInstance.vcRefDir.vcref;

      expect(vcref.element.nativeElement.tagName.toLowerCase()).toEqual('header-cmp');
      expect(vcref.injector.get(ElementRef).nativeElement.tagName.toLowerCase())
          .toEqual('header-cmp');
    });
  });

  describe('detach', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({declarations: [EmbeddedViewInsertionComp, VCRefDirective]});

      // Tests depend on perf counters. In order to have clean perf counters at the beginning of a
      // test, we reset those here.
      ngDevModeResetPerfCounters();
    });

    it('should detach the right embedded view when an index is specified', () => {
      const fixture = TestBed.createComponent(EmbeddedViewInsertionComp);
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);
      fixture.detectChanges();

      const viewA = vcRefDir.createView('A');
      vcRefDir.createView('B');
      vcRefDir.createView('C');
      const viewD = vcRefDir.createView('D');
      vcRefDir.createView('E');
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>ABCDE');

      vcRefDir.vcref.detach(3);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>ABCE');
      expect(viewD.destroyed).toBeFalsy();

      vcRefDir.vcref.detach(0);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>BCE');
      expect(viewA.destroyed).toBeFalsy();

      expect(() => vcRefDir.vcref.detach(-1)).toThrow();
      expect(() => vcRefDir.vcref.detach(42)).toThrow();
      expect(ngDevMode!.rendererDestroyNode).toBe(0);
    });

    it('should detach the last embedded view when no index is specified', () => {
      const fixture = TestBed.createComponent(EmbeddedViewInsertionComp);
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);
      fixture.detectChanges();

      vcRefDir.createView('A');
      vcRefDir.createView('B');
      vcRefDir.createView('C');
      vcRefDir.createView('D');
      const viewE = vcRefDir.createView('E');
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>ABCDE');

      vcRefDir.vcref.detach();
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>ABCD');
      expect(viewE.destroyed).toBeFalsy();
      expect(ngDevMode!.rendererDestroyNode).toBe(0);
    });

    it('should not throw when destroying a detached component view', () => {
      @Component({selector: 'dynamic-cmp'})
      class DynamicCmp {
      }

      @Component({selector: 'test-cmp'})
      class TestCmp {
        constructor(public vcRef: ViewContainerRef) {}
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();

      const vcRef = fixture.componentInstance.vcRef;
      const cmpRef = vcRef.createComponent(DynamicCmp);
      fixture.detectChanges();

      vcRef.detach(vcRef.indexOf(cmpRef.hostView));

      expect(() => {
        cmpRef.destroy();
      }).not.toThrow();
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({declarations: [EmbeddedViewInsertionComp, VCRefDirective]});

      const _origRendererFactory = TestBed.inject(RendererFactory2);
      const _origCreateRenderer = _origRendererFactory.createRenderer;

      _origRendererFactory.createRenderer = function(element: any, type: RendererType2|null) {
        const renderer = _origCreateRenderer.call(_origRendererFactory, element, type);
        renderer.destroyNode = () => {};
        return renderer;
      };

      // Tests depend on perf counters. In order to have clean perf counters at the beginning of a
      // test, we reset those here.
      ngDevModeResetPerfCounters();
    });

    it('should remove the right embedded view when an index is specified', () => {
      const fixture = TestBed.createComponent(EmbeddedViewInsertionComp);
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);
      fixture.detectChanges();

      const viewA = vcRefDir.createView('A');
      vcRefDir.createView('B');
      vcRefDir.createView('C');
      const viewD = vcRefDir.createView('D');
      vcRefDir.createView('E');
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>ABCDE');

      vcRefDir.vcref.remove(3);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>ABCE');
      expect(viewD.destroyed).toBeTruthy();

      vcRefDir.vcref.remove(0);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>BCE');
      expect(viewA.destroyed).toBeTruthy();

      expect(() => vcRefDir.vcref.remove(-1)).toThrow();
      expect(() => vcRefDir.vcref.remove(42)).toThrow();
      expect(ngDevMode!.rendererDestroyNode).toBe(2);
    });

    it('should remove the last embedded view when no index is specified', () => {
      const fixture = TestBed.createComponent(EmbeddedViewInsertionComp);
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);
      fixture.detectChanges();

      vcRefDir.createView('A');
      vcRefDir.createView('B');
      vcRefDir.createView('C');
      vcRefDir.createView('D');
      const viewE = vcRefDir.createView('E');
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>ABCDE');

      vcRefDir.vcref.remove();
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>ABCD');
      expect(viewE.destroyed).toBeTruthy();
      expect(ngDevMode!.rendererDestroyNode).toBe(1);
    });

    it('should throw when trying to insert a removed or destroyed view', () => {
      const fixture = TestBed.createComponent(EmbeddedViewInsertionComp);
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);
      fixture.detectChanges();

      const viewA = vcRefDir.createView('A');
      const viewB = vcRefDir.createView('B');
      fixture.detectChanges();

      vcRefDir.vcref.remove();
      fixture.detectChanges();
      expect(() => vcRefDir.vcref.insert(viewB)).toThrow();

      viewA.destroy();
      fixture.detectChanges();
      expect(() => vcRefDir.vcref.insert(viewA)).toThrow();
    });
  });

  describe('dependant views', () => {
    it('should not throw when view removes another view upon removal', () => {
      @Component({
        template: `
          <div *ngIf="visible" [template]="parent">I host a template</div>
          <ng-template #parent>
              <div [template]="child">I host a child template</div>
          </ng-template>
          <ng-template #child>
              I am child template
          </ng-template>
        `
      })
      class AppComponent {
        visible = true;

        constructor(private readonly vcr: ViewContainerRef) {}

        add<C>(template: TemplateRef<C>): EmbeddedViewRef<C> {
          return this.vcr.createEmbeddedView(template);
        }

        remove<C>(viewRef: EmbeddedViewRef<C>) {
          this.vcr.remove(this.vcr.indexOf(viewRef));
        }
      }

      @Directive({selector: '[template]'})
      class TemplateDirective<C> implements OnInit, OnDestroy {
        @Input() template!: TemplateRef<C>;
        ref!: EmbeddedViewRef<C>;

        constructor(private readonly host: AppComponent) {}

        ngOnInit() {
          this.ref = this.host.add(this.template);
          this.ref.detectChanges();
        }

        ngOnDestroy() {
          this.host.remove(this.ref);
        }
      }

      TestBed.configureTestingModule({
        imports: [CommonModule],
        declarations: [AppComponent, TemplateDirective],
      });

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      fixture.componentRef.instance.visible = false;
      fixture.detectChanges();
    });
  });

  describe('createEmbeddedView (incl. insert)', () => {
    it('should work on elements', () => {
      @Component({
        template: `
        <ng-template #tplRef let-name>{{name}}</ng-template>
        <header vcref [tplRef]="tplRef"></header>
        <footer></footer>
      `,
      })
      class TestComponent {
      }

      TestBed.configureTestingModule({declarations: [TestComponent, VCRefDirective]});

      const fixture = TestBed.createComponent(TestComponent);
      const vcRef =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);

      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement))
          .toEqual('<header vcref=""></header><footer></footer>');

      vcRef.createView('A');
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement))
          .toEqual('<header vcref=""></header>A<footer></footer>');

      vcRef.createView('B');
      vcRef.createView('C');
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement))
          .toEqual('<header vcref=""></header>ABC<footer></footer>');

      vcRef.createView('Y', 0);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement))
          .toEqual('<header vcref=""></header>YABC<footer></footer>');

      expect(() => vcRef.createView('Z', -1)).toThrow();
      expect(() => vcRef.createView('Z', 5)).toThrow();
    });

    it('should work on components', () => {
      @Component({selector: 'header-cmp', template: ``})
      class HeaderComponent {
      }

      @Component({
        template: `
          <ng-template #tplRef let-name>{{name}}</ng-template>
          <header-cmp vcref [tplRef]="tplRef"></header-cmp>
          <footer></footer>
          `,
      })
      class TestComponent {
      }

      TestBed.configureTestingModule(
          {declarations: [TestComponent, HeaderComponent, VCRefDirective]});
      const fixture = TestBed.createComponent(TestComponent);
      const vcRef =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement))
          .toEqual('<header-cmp vcref=""></header-cmp><footer></footer>');

      vcRef.createView('A');
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement))
          .toEqual('<header-cmp vcref=""></header-cmp>A<footer></footer>');

      vcRef.createView('B');
      vcRef.createView('C');
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement))
          .toEqual('<header-cmp vcref=""></header-cmp>ABC<footer></footer>');

      vcRef.createView('Y', 0);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement))
          .toEqual('<header-cmp vcref=""></header-cmp>YABC<footer></footer>');

      expect(() => vcRef.createView('Z', -1)).toThrow();
      expect(() => vcRef.createView('Z', 5)).toThrow();
    });

    it('should work with multiple instances of view container refs', () => {
      @Component({
        template: `
          <ng-template #tplRef let-name>{{name}}</ng-template>
          <div vcref [tplRef]="tplRef"></div>
          <div vcref [tplRef]="tplRef"></div>
        `,
      })
      class TestComponent {
      }

      TestBed.configureTestingModule({declarations: [TestComponent, VCRefDirective]});
      const fixture = TestBed.createComponent(TestComponent);
      const vcRefs = fixture.debugElement.queryAll(By.directive(VCRefDirective))
                         .map(debugEl => debugEl.injector.get(VCRefDirective));
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement))
          .toEqual('<div vcref=""></div><div vcref=""></div>');

      vcRefs[0].createView('A');
      vcRefs[1].createView('B');
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement))
          .toEqual('<div vcref=""></div>A<div vcref=""></div>B');
    });

    it('should work on templates', () => {
      @Component({
        template: `
          <ng-template vcref #tplRef [tplRef]="tplRef" let-name>{{name}}</ng-template>
          <footer></footer>
        `
      })
      class TestComponent {
        @ViewChild(VCRefDirective, {static: true}) vcRef!: VCRefDirective;
      }

      TestBed.configureTestingModule({declarations: [TestComponent, VCRefDirective]});
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      const {vcRef} = fixture.componentInstance;

      expect(getElementHtml(fixture.nativeElement)).toEqual('<footer></footer>');

      vcRef.createView('A');
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('A<footer></footer>');

      vcRef.createView('B');
      vcRef.createView('C');
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('ABC<footer></footer>');

      vcRef.createView('Y', 0);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('YABC<footer></footer>');
      expect(() => vcRef!.createView('Z', -1)).toThrow();
      expect(() => vcRef!.createView('Z', 5)).toThrow();
    });

    it('should apply directives and pipes of the host view to the TemplateRef', () => {
      @Component({selector: 'child', template: `{{name}}`})
      class Child {
        @Input() name: string|undefined;
      }

      @Pipe({name: 'starPipe'})
      class StarPipe implements PipeTransform {
        transform(value: any) {
          return `**${value}**`;
        }
      }

      @Component({
        template: `
            <ng-template #foo>
              <child [name]="'C' | starPipe"></child>
            </ng-template>
            <child vcref [tplRef]="foo" [name]="'A' | starPipe"></child>
            <child [name]="'B' | starPipe"></child>
          `
      })
      class SomeComponent {
      }

      TestBed.configureTestingModule(
          {declarations: [Child, StarPipe, SomeComponent, VCRefDirective]});
      const fixture = TestBed.createComponent(SomeComponent);
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);
      fixture.detectChanges();

      vcRefDir.vcref.createEmbeddedView(vcRefDir.tplRef!);
      vcRefDir.vcref.createEmbeddedView(vcRefDir.tplRef!);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement))
          .toEqual(
              '<child vcref="">**A**</child><child>**C**</child><child>**C**</child><child>**B**</child>');
    });
  });

  describe('createComponent', () => {
    let templateExecutionCounter = 0;

    beforeEach(() => templateExecutionCounter = 0);

    it('should work without Injector and NgModuleRef', () => {
      @Component({selector: 'embedded-cmp', template: `foo`})
      class EmbeddedComponent implements DoCheck, OnInit {
        ngOnInit() {
          templateExecutionCounter++;
        }

        ngDoCheck() {
          templateExecutionCounter++;
        }
      }

      TestBed.configureTestingModule(
          {declarations: [EmbeddedViewInsertionComp, VCRefDirective, EmbeddedComponent]});
      const fixture = TestBed.createComponent(EmbeddedViewInsertionComp);
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>');
      expect(templateExecutionCounter).toEqual(0);

      const componentRef = vcRefDir.vcref.createComponent(EmbeddedComponent);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement))
          .toEqual('<p vcref=""></p><embedded-cmp>foo</embedded-cmp>');
      expect(templateExecutionCounter).toEqual(2);

      vcRefDir.vcref.detach(0);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>');
      expect(templateExecutionCounter).toEqual(2);

      vcRefDir.vcref.insert(componentRef.hostView);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement))
          .toEqual('<p vcref=""></p><embedded-cmp>foo</embedded-cmp>');
      expect(templateExecutionCounter).toEqual(3);
    });

    it('should work with NgModuleRef and Injector', () => {
      @Component({
        selector: 'embedded-cmp',
        template: `foo`,
      })
      class EmbeddedComponent implements DoCheck, OnInit {
        constructor(public s: String) {}

        ngOnInit() {
          templateExecutionCounter++;
        }

        ngDoCheck() {
          templateExecutionCounter++;
        }
      }

      TestBed.configureTestingModule(
          {declarations: [EmbeddedViewInsertionComp, VCRefDirective, EmbeddedComponent]});

      @NgModule({
        providers: [
          {provide: String, useValue: 'root_module'},
          // We need to provide the following tokens because otherwise view engine
          // will throw when creating a component factory in debug mode.
          {provide: Sanitizer, useValue: TestBed.inject(DomSanitizer)},
          {provide: ErrorHandler, useValue: TestBed.inject(ErrorHandler)},
          {provide: RendererFactory2, useValue: TestBed.inject(RendererFactory2)},
        ]
      })
      class MyAppModule {
      }

      @NgModule({providers: [{provide: String, useValue: 'some_module'}]})
      class SomeModule {
      }

      // Compile test modules in order to be able to pass the NgModuleRef or the
      // module injector to the ViewContainerRef create component method.
      const compiler = TestBed.inject(Compiler);
      const appModuleFactory = compiler.compileModuleSync(MyAppModule);
      const someModuleFactory = compiler.compileModuleSync(SomeModule);
      const appModuleRef = appModuleFactory.create(null);
      const someModuleRef = someModuleFactory.create(null);

      const fixture = TestBed.createComponent(EmbeddedViewInsertionComp);
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>');
      expect(templateExecutionCounter).toEqual(0);

      let componentRef = vcRefDir.vcref.createComponent(
          EmbeddedComponent, {index: 0, injector: someModuleRef.injector});
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement))
          .toEqual('<p vcref=""></p><embedded-cmp>foo</embedded-cmp>');
      expect(templateExecutionCounter).toEqual(2);
      expect(componentRef.instance.s).toEqual('some_module');

      componentRef =
          vcRefDir.vcref.createComponent(EmbeddedComponent, {index: 0, ngModuleRef: appModuleRef});
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement))
          .toEqual(
              '<p vcref=""></p><embedded-cmp>foo</embedded-cmp><embedded-cmp>foo</embedded-cmp>');
      expect(componentRef.instance.s).toEqual('root_module');
      expect(templateExecutionCounter).toEqual(5);
    });

    it('should support projectable nodes', () => {
      TestBed.configureTestingModule({
        declarations: [EmbeddedViewInsertionComp, VCRefDirective, EmbeddedComponentWithNgContent],
      });
      const fixture = TestBed.createComponent(EmbeddedViewInsertionComp);
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>');

      const myNode = document.createElement('div');
      const myText = document.createTextNode('bar');
      const myText2 = document.createTextNode('baz');
      myNode.appendChild(myText);
      myNode.appendChild(myText2);

      vcRefDir.vcref.createComponent(
          EmbeddedComponentWithNgContent, {index: 0, projectableNodes: [[myNode]]});
      fixture.detectChanges();


      expect(getElementHtml(fixture.nativeElement))
          .toEqual(
              '<p vcref=""></p><embedded-cmp-with-ngcontent><div>barbaz</div><hr></embedded-cmp-with-ngcontent>');
    });

    it('should support reprojection of projectable nodes', () => {
      @Component({
        selector: 'reprojector',
        template:
            `<embedded-cmp-with-ngcontent><ng-content></ng-content></embedded-cmp-with-ngcontent>`,
      })
      class Reprojector {
      }

      TestBed.configureTestingModule({
        declarations: [
          EmbeddedViewInsertionComp, VCRefDirective, Reprojector, EmbeddedComponentWithNgContent
        ],
      });
      const fixture = TestBed.createComponent(EmbeddedViewInsertionComp);
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>');

      const myNode = document.createElement('div');
      const myText = document.createTextNode('bar');
      const myText2 = document.createTextNode('baz');
      myNode.appendChild(myText);
      myNode.appendChild(myText2);

      vcRefDir.vcref.createComponent(Reprojector, {index: 0, projectableNodes: [[myNode]]});
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement))
          .toEqual(
              '<p vcref=""></p><reprojector><embedded-cmp-with-ngcontent><hr><div>barbaz</div></embedded-cmp-with-ngcontent></reprojector>');
    });

    it('should support many projectable nodes with many slots', () => {
      TestBed.configureTestingModule({
        declarations: [EmbeddedViewInsertionComp, VCRefDirective, EmbeddedComponentWithNgContent]
      });
      const fixture = TestBed.createComponent(EmbeddedViewInsertionComp);
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>');

      vcRefDir.vcref.createComponent(EmbeddedComponentWithNgContent, {
        index: 0,
        projectableNodes: [
          [document.createTextNode('1'), document.createTextNode('2')],
          [document.createTextNode('3'), document.createTextNode('4')]
        ]
      });
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement))
          .toEqual(
              '<p vcref=""></p><embedded-cmp-with-ngcontent>12<hr>34</embedded-cmp-with-ngcontent>');
    });

    it('should not throw when calling destroy() multiple times for a ComponentRef', () => {
      @Component({template: ''})
      class App {
      }

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentRef.destroy();
      expect(() => fixture.componentRef.destroy()).not.toThrow();
    });

    it('should create the root node in the correct namespace when previous node is SVG', () => {
      @Component({
        template: `
          <div>Some random content</div>
          <!-- Note that it's important for the test that the <svg> element is last. -->
          <svg></svg>
        `
      })
      class TestComp {
        constructor(public viewContainerRef: ViewContainerRef) {}
      }

      @Component({selector: 'dynamic-comp', template: ''})
      class DynamicComponent {
      }

      TestBed.configureTestingModule({declarations: [DynamicComponent]});
      const fixture = TestBed.createComponent(TestComp);

      // Note: it's important that we **don't** call `fixture.detectChanges` between here and
      // the component being created, because running change detection will reset Ivy's
      // namespace state which will make the test pass.

      const componentRef =
          fixture.componentInstance.viewContainerRef.createComponent(DynamicComponent);
      const element = componentRef.location.nativeElement;
      expect((element.namespaceURI || '').toLowerCase()).not.toContain('svg');
    });

    it('should be compatible with componentRef generated via TestBed.createComponent in component factory',
       () => {
         @Component({
           selector: 'child',
           template: `Child Component`,
         })
         class Child {
         }

         @Component({
           selector: 'comp',
           template: '<ng-template #ref></ng-template>',
         })
         class Comp {
           @ViewChild('ref', {read: ViewContainerRef, static: true})
           viewContainerRef!: ViewContainerRef;

           ngOnInit() {
             const makeComponentFactory = (componentType: any) => ({
               create: () => TestBed.createComponent(componentType).componentRef,
             });
             this.viewContainerRef.createComponent(makeComponentFactory(Child) as any);
           }
         }

         TestBed.configureTestingModule({declarations: [Comp, Child]});

         const fixture = TestBed.createComponent(Comp);
         fixture.detectChanges();

         expect(fixture.debugElement.nativeElement.innerHTML).toContain('Child Component');
       });

    it('should return ComponentRef with ChangeDetectorRef attached to root view', () => {
      @Component({selector: 'dynamic-cmp', template: ``})
      class DynamicCmp {
        doCheckCount = 0;

        ngDoCheck() {
          this.doCheckCount++;
        }
      }

      @Component({template: ``})
      class TestCmp {
        constructor(public viewContainerRef: ViewContainerRef) {}
      }

      const fixture = TestBed.createComponent(TestCmp);
      const testCmpInstance = fixture.componentInstance;
      const dynamicCmpRef = testCmpInstance.viewContainerRef.createComponent(DynamicCmp);

      // change detection didn't run at all
      expect(dynamicCmpRef.instance.doCheckCount).toBe(0);

      // running change detection on the dynamicCmpRef level
      dynamicCmpRef.changeDetectorRef.detectChanges();
      expect(dynamicCmpRef.instance.doCheckCount).toBe(1);

      // running change detection on the TestBed fixture level
      fixture.changeDetectorRef.detectChanges();
      expect(dynamicCmpRef.instance.doCheckCount).toBe(2);

      // The injector should retrieve the change detector ref for DynamicComp. As such,
      // the doCheck hook for DynamicComp should NOT run upon ref.detectChanges().
      const changeDetector = dynamicCmpRef.injector.get(ChangeDetectorRef);
      changeDetector.detectChanges();
      expect(dynamicCmpRef.instance.doCheckCount).toBe(2);
    });

    describe('createComponent using Type', () => {
      const TOKEN_A = new InjectionToken('A');
      const TOKEN_B = new InjectionToken('B');

      @Component({
        selector: 'child-a',
        template: `[Child Component A]`,
      })
      class ChildA {
      }

      @Component({
        selector: 'child-b',
        template: `
          [Child Component B]
          <ng-content></ng-content>
          {{ tokenA }}
          {{ tokenB }}
        `,
      })
      class ChildB {
        constructor(private injector: Injector, public renderer: Renderer2) {}
        get tokenA() {
          return this.injector.get(TOKEN_A);
        }
        get tokenB() {
          return this.injector.get(TOKEN_B);
        }
      }

      @Component({
        selector: 'app',
        template: '',
        providers: [
          {provide: TOKEN_B, useValue: '[TokenB - Value]'},
        ]
      })
      class App {
        constructor(
            public viewContainerRef: ViewContainerRef, public ngModuleRef: NgModuleRef<unknown>,
            public injector: Injector) {}
      }

      @NgModule({
        declarations: [App, ChildA, ChildB],
        providers: [
          {provide: TOKEN_A, useValue: '[TokenA - Value]'},
        ]
      })
      class AppModule {
      }

      let fixture!: ComponentFixture<App>;
      beforeEach(() => {
        TestBed.configureTestingModule({imports: [AppModule]});
        fixture = TestBed.createComponent(App);
        fixture.detectChanges();
      });

      it('should be able to create a component when Type is provided', () => {
        fixture.componentInstance.viewContainerRef.createComponent(ChildA);
        expect(fixture.nativeElement.parentNode.textContent).toContain('[Child Component A]');
      });

      it('should maintain connection with module injector when custom injector is provided', () => {
        const comp = fixture.componentInstance;
        const environmentInjector = createEnvironmentInjector(
            [
              {provide: TOKEN_B, useValue: '[TokenB - CustomValue]'},
            ],
            TestBed.inject(EnvironmentInjector));

        // Use factory-less way of creating a component.
        comp.viewContainerRef.createComponent(ChildB, {injector: environmentInjector});
        fixture.detectChanges();

        // Custom injector provides only `TOKEN_B`,
        // so `TOKEN_A` should be retrieved from the module injector.
        expect(getElementText(fixture.nativeElement.parentNode))
            .toContain('[TokenA - Value] [TokenB - CustomValue]');

        // Use factory-based API to compare the output with the factory-less one.
        const factoryBasedChildB = createComponent(ChildB, {environmentInjector});
        fixture.detectChanges();

        // Custom injector provides only `TOKEN_B`,
        // so `TOKEN_A` should be retrieved from the module injector
        expect(getElementText(fixture.nativeElement.parentNode))
            .toContain('[TokenA - Value] [TokenB - CustomValue]');
      });

      it('should throw if class without @Component decorator is used as Component type', () => {
        class MyClassWithoutComponentDecorator {}
        const createComponent = () => {
          fixture.componentInstance.viewContainerRef.createComponent(
              MyClassWithoutComponentDecorator);
        };
        expect(createComponent)
            .toThrowError(/Provided Component class doesn't contain Component definition./);
      });

      describe('`options` argument handling', () => {
        it('should work correctly when an empty object is provided', () => {
          fixture.componentInstance.viewContainerRef.createComponent(ChildA, {});
          expect(fixture.nativeElement.parentNode.textContent).toContain('[Child Component A]');
        });

        it('should take provided `options` arguments into account', () => {
          const {viewContainerRef, ngModuleRef, injector} = fixture.componentInstance;
          viewContainerRef.createComponent(ChildA);

          const projectableNode = document.createElement('div');
          const textNode = document.createTextNode('[Projectable Node]');
          projectableNode.appendChild(textNode);
          const projectableNodes = [[projectableNode]];

          // Insert ChildB in front of ChildA (since index = 0)
          viewContainerRef.createComponent(
              ChildB, {index: 0, injector, ngModuleRef, projectableNodes});

          fixture.detectChanges();

          expect(getElementText(fixture.nativeElement.parentNode))
              .toContain(
                  '[Child Component B] ' +
                  '[Projectable Node] ' +
                  '[TokenA - Value] ' +
                  '[TokenB - Value] ' +
                  '[Child Component A]');
        });
      });
    });
  });

  describe('insertion points and declaration points', () => {
    @Directive({selector: '[tplDir]'})
    class InsertionDir {
      @Input()
      set tplDir(tpl: TemplateRef<any>|null) {
        tpl ? this.vcr.createEmbeddedView(tpl) : this.vcr.clear();
      }

      constructor(public vcr: ViewContainerRef) {}
    }

    // see running stackblitz example: https://stackblitz.com/edit/angular-w3myy6
    it('should work with a template declared in a different component view from insertion', () => {
      @Component({selector: 'child', template: `<div [tplDir]="tpl">{{name}}</div>`})
      class Child {
        @Input() tpl: TemplateRef<any>|null = null;
        name = 'Child';
      }

      @Component({
        template: `
          <ng-template #foo>
            <div>{{name}}</div>
          </ng-template>

          <child [tpl]="foo"></child>
        `
      })
      class Parent {
        name = 'Parent';
      }

      TestBed.configureTestingModule({declarations: [Child, Parent, InsertionDir]});
      const fixture = TestBed.createComponent(Parent);
      const child = fixture.debugElement.query(By.directive(Child)).componentInstance;
      fixture.detectChanges();

      // Context should be inherited from the declaration point, not the
      // insertion point, so the template should read 'Parent'.
      expect(getElementHtml(fixture.nativeElement))
          .toEqual(`<child><div>Child</div><div>Parent</div></child>`);

      child.tpl = null;
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual(`<child><div>Child</div></child>`);
    });

    // see running stackblitz example: https://stackblitz.com/edit/angular-3vplec
    it('should work with nested for loops with different declaration / insertion points', () => {
      @Component({
        selector: 'loop-comp',
        template: `
          <ng-template ngFor [ngForOf]="rows" [ngForTemplate]="tpl">
          </ng-template>
        `,
      })
      class LoopComp {
        @Input() tpl!: TemplateRef<any>;
        @Input() rows!: any[];
        name = 'Loop';
      }

      @Component({
        template: `
          <ng-template #rowTemplate let-row>
            <ng-template #cellTemplate let-cell>
              <div>{{cell}} - {{row.value}} - {{name}}</div>
            </ng-template>

            <loop-comp [tpl]="cellTemplate" [rows]="row.data"></loop-comp>
          </ng-template>

          <loop-comp [tpl]="rowTemplate" [rows]="rows"></loop-comp>
        `,
      })
      class Parent {
        name = 'Parent';
        rows = [{data: ['1', '2'], value: 'one'}, {data: ['3', '4'], value: 'two'}];
      }

      TestBed.configureTestingModule({declarations: [LoopComp, Parent], imports: [CommonModule]});
      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement))
          .toEqual(
              '<loop-comp>' +
              '<loop-comp><div>1 - one - Parent</div><div>2 - one - Parent</div></loop-comp>' +
              '<loop-comp><div>3 - two - Parent</div><div>4 - two - Parent</div></loop-comp>' +
              '</loop-comp>');

      fixture.componentInstance.rows =
          [{data: ['5', '6'], value: 'three'}, {data: ['7'], value: 'four'}];
      fixture.componentInstance.name = 'New name!';
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement))
          .toEqual(
              '<loop-comp>' +
              '<loop-comp><div>5 - three - New name!</div><div>6 - three - New name!</div></loop-comp>' +
              '<loop-comp><div>7 - four - New name!</div></loop-comp>' +
              '</loop-comp>');
    });

    it('should insert elements in the proper order when template root is an ng-container', () => {
      @Component({
        template: `
          <ng-container *ngFor="let item of items">|{{ item }}|</ng-container>
        `
      })
      class App {
        items = ['one', 'two', 'three'];
      }

      TestBed.configureTestingModule({imports: [CommonModule], declarations: [App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('|one||two||three|');

      fixture.componentInstance.items.unshift('zero');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('|zero||one||two||three|');

      fixture.componentInstance.items.push('four');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('|zero||one||two||three||four|');

      fixture.componentInstance.items.splice(3, 0, 'two point five');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent)
          .toBe('|zero||one||two||two point five||three||four|');
    });

    it('should insert elements in the proper order when template root is an ng-container and is wrapped by an ng-container',
       () => {
         @Component({
           template: `
              <ng-container>
                <ng-container *ngFor="let item of items">|{{ item }}|</ng-container>
              </ng-container>
            `
         })
         class App {
           items = ['one', 'two', 'three'];
         }

         TestBed.configureTestingModule({imports: [CommonModule], declarations: [App]});
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();

         expect(fixture.nativeElement.textContent).toBe('|one||two||three|');

         fixture.componentInstance.items.unshift('zero');
         fixture.detectChanges();

         expect(fixture.nativeElement.textContent).toBe('|zero||one||two||three|');

         fixture.componentInstance.items.push('four');
         fixture.detectChanges();

         expect(fixture.nativeElement.textContent).toBe('|zero||one||two||three||four|');

         fixture.componentInstance.items.splice(3, 0, 'two point five');
         fixture.detectChanges();

         expect(fixture.nativeElement.textContent)
             .toBe('|zero||one||two||two point five||three||four|');
       });

    it('should insert elements in the proper order when template root is an ng-container and first node is a ng-container',
       () => {
         @Component({
           template: `
            <ng-container *ngFor="let item of items"><ng-container>|{{ item }}|</ng-container></ng-container>
          `
         })
         class App {
           items = ['one', 'two', 'three'];
         }

         TestBed.configureTestingModule({imports: [CommonModule], declarations: [App]});
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();

         expect(fixture.nativeElement.textContent).toBe('|one||two||three|');

         fixture.componentInstance.items.unshift('zero');
         fixture.detectChanges();

         expect(fixture.nativeElement.textContent).toBe('|zero||one||two||three|');

         fixture.componentInstance.items.push('four');
         fixture.detectChanges();

         expect(fixture.nativeElement.textContent).toBe('|zero||one||two||three||four|');

         fixture.componentInstance.items.splice(3, 0, 'two point five');
         fixture.detectChanges();

         expect(fixture.nativeElement.textContent)
             .toBe('|zero||one||two||two point five||three||four|');
       });

    it('should insert elements in the proper order when template root is an ng-container, wrapped in an ng-container with the root node as an ng-container',
       () => {
         @Component({
           template: `
            <ng-container>
              <ng-container *ngFor="let item of items"><ng-container>|{{ item }}|</ng-container></ng-container>
            </ng-container>
          `
         })
         class App {
           items = ['one', 'two', 'three'];
         }

         TestBed.configureTestingModule({imports: [CommonModule], declarations: [App]});
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();

         expect(fixture.nativeElement.textContent).toBe('|one||two||three|');

         fixture.componentInstance.items.unshift('zero');
         fixture.detectChanges();

         expect(fixture.nativeElement.textContent).toBe('|zero||one||two||three|');

         fixture.componentInstance.items.push('four');
         fixture.detectChanges();

         expect(fixture.nativeElement.textContent).toBe('|zero||one||two||three||four|');

         fixture.componentInstance.items.splice(3, 0, 'two point five');
         fixture.detectChanges();

         expect(fixture.nativeElement.textContent)
             .toBe('|zero||one||two||two point five||three||four|');
       });

    it('should insert elements in the proper order when the first child node is an ICU expression',
       () => {
         @Component({
           template: `
          <ng-container *ngFor="let item of items">{count, select, other {|{{ item }}|}}</ng-container>
        `
         })
         class App {
           items = ['one', 'two', 'three'];
         }

         TestBed.configureTestingModule({imports: [CommonModule], declarations: [App]});
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();

         expect(fixture.nativeElement.textContent).toBe('|one||two||three|');

         fixture.componentInstance.items.unshift('zero');
         fixture.detectChanges();

         expect(fixture.nativeElement.textContent).toBe('|zero||one||two||three|');

         fixture.componentInstance.items.push('four');
         fixture.detectChanges();

         expect(fixture.nativeElement.textContent).toBe('|zero||one||two||three||four|');

         fixture.componentInstance.items.splice(3, 0, 'two point five');
         fixture.detectChanges();

         expect(fixture.nativeElement.textContent)
             .toBe('|zero||one||two||two point five||three||four|');
       });
  });

  describe('lifecycle hooks', () => {
    // Angular 5 reference: https://stackblitz.com/edit/lifecycle-hooks-vcref
    const log: string[] = [];

    @Component({selector: 'hooks', template: `{{name}}`})
    class ComponentWithHooks {
      @Input() name: string|undefined;

      private log(msg: string) {
        log.push(msg);
      }

      ngOnChanges() {
        this.log('onChanges-' + this.name);
      }
      ngOnInit() {
        this.log('onInit-' + this.name);
      }
      ngDoCheck() {
        this.log('doCheck-' + this.name);
      }

      ngAfterContentInit() {
        this.log('afterContentInit-' + this.name);
      }
      ngAfterContentChecked() {
        this.log('afterContentChecked-' + this.name);
      }

      ngAfterViewInit() {
        this.log('afterViewInit-' + this.name);
      }
      ngAfterViewChecked() {
        this.log('afterViewChecked-' + this.name);
      }

      ngOnDestroy() {
        this.log('onDestroy-' + this.name);
      }
    }

    it('should call all hooks in correct order when creating with createEmbeddedView', () => {
      @Component({
        template: `
          <ng-template #foo>
            <hooks [name]="'C'"></hooks>
          </ng-template>
          <hooks vcref [tplRef]="foo" [name]="'A'"></hooks>
          <hooks [name]="'B'"></hooks>
        `
      })
      class SomeComponent {
      }

      log.length = 0;

      TestBed.configureTestingModule({
        declarations: [SomeComponent, ComponentWithHooks, VCRefDirective],
      });
      const fixture = TestBed.createComponent(SomeComponent);
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);

      fixture.detectChanges();
      expect(log).toEqual([
        'onChanges-A', 'onInit-A', 'doCheck-A', 'onChanges-B', 'onInit-B', 'doCheck-B',
        'afterContentInit-A', 'afterContentChecked-A', 'afterContentInit-B',
        'afterContentChecked-B', 'afterViewInit-A', 'afterViewChecked-A', 'afterViewInit-B',
        'afterViewChecked-B'
      ]);

      log.length = 0;
      fixture.detectChanges();
      expect(log).toEqual([
        'doCheck-A', 'doCheck-B', 'afterContentChecked-A', 'afterContentChecked-B',
        'afterViewChecked-A', 'afterViewChecked-B'
      ]);

      log.length = 0;
      vcRefDir.vcref.createEmbeddedView(vcRefDir.tplRef!);
      expect(getElementHtml(fixture.nativeElement))
          .toEqual('<hooks vcref="">A</hooks><hooks></hooks><hooks>B</hooks>');
      expect(log).toEqual([]);

      log.length = 0;
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement))
          .toEqual('<hooks vcref="">A</hooks><hooks>C</hooks><hooks>B</hooks>');
      expect(log).toEqual([
        'doCheck-A', 'doCheck-B', 'onChanges-C', 'onInit-C', 'doCheck-C', 'afterContentInit-C',
        'afterContentChecked-C', 'afterViewInit-C', 'afterViewChecked-C', 'afterContentChecked-A',
        'afterContentChecked-B', 'afterViewChecked-A', 'afterViewChecked-B'
      ]);

      log.length = 0;
      fixture.detectChanges();
      expect(log).toEqual([
        'doCheck-A', 'doCheck-B', 'doCheck-C', 'afterContentChecked-C', 'afterViewChecked-C',
        'afterContentChecked-A', 'afterContentChecked-B', 'afterViewChecked-A', 'afterViewChecked-B'
      ]);

      log.length = 0;
      const viewRef = vcRefDir.vcref.detach(0);
      fixture.detectChanges();
      expect(log).toEqual([
        'doCheck-A', 'doCheck-B', 'afterContentChecked-A', 'afterContentChecked-B',
        'afterViewChecked-A', 'afterViewChecked-B'
      ]);

      log.length = 0;
      vcRefDir.vcref.insert(viewRef!);
      fixture.detectChanges();
      expect(log).toEqual([
        'doCheck-A', 'doCheck-B', 'doCheck-C', 'afterContentChecked-C', 'afterViewChecked-C',
        'afterContentChecked-A', 'afterContentChecked-B', 'afterViewChecked-A', 'afterViewChecked-B'
      ]);

      log.length = 0;
      vcRefDir.vcref.remove(0);
      fixture.detectChanges();
      expect(log).toEqual([
        'onDestroy-C', 'doCheck-A', 'doCheck-B', 'afterContentChecked-A', 'afterContentChecked-B',
        'afterViewChecked-A', 'afterViewChecked-B'
      ]);
    });

    it('should call all hooks in correct order when creating with createComponent', () => {
      @Component({
        template: `
          <hooks vcref [name]="'A'"></hooks>
          <hooks [name]="'B'"></hooks>
        `
      })
      class SomeComponent {
      }

      log.length = 0;

      TestBed.configureTestingModule(
          {declarations: [SomeComponent, VCRefDirective, ComponentWithHooks]});
      const fixture = TestBed.createComponent(SomeComponent);
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);

      fixture.detectChanges();
      expect(log).toEqual([
        'onChanges-A', 'onInit-A', 'doCheck-A', 'onChanges-B', 'onInit-B', 'doCheck-B',
        'afterContentInit-A', 'afterContentChecked-A', 'afterContentInit-B',
        'afterContentChecked-B', 'afterViewInit-A', 'afterViewChecked-A', 'afterViewInit-B',
        'afterViewChecked-B'
      ]);

      log.length = 0;
      fixture.detectChanges();
      expect(log).toEqual([
        'doCheck-A', 'doCheck-B', 'afterContentChecked-A', 'afterContentChecked-B',
        'afterViewChecked-A', 'afterViewChecked-B'
      ]);

      log.length = 0;
      const componentRef = vcRefDir.vcref.createComponent(ComponentWithHooks);
      expect(getElementHtml(fixture.nativeElement))
          .toEqual('<hooks vcref="">A</hooks><hooks></hooks><hooks>B</hooks>');
      expect(log).toEqual([]);

      componentRef.instance.name = 'D';
      log.length = 0;
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement))
          .toEqual('<hooks vcref="">A</hooks><hooks>D</hooks><hooks>B</hooks>');
      expect(log).toEqual([
        'doCheck-A', 'doCheck-B', 'onInit-D', 'doCheck-D', 'afterContentInit-D',
        'afterContentChecked-D', 'afterViewInit-D', 'afterViewChecked-D', 'afterContentChecked-A',
        'afterContentChecked-B', 'afterViewChecked-A', 'afterViewChecked-B'
      ]);

      log.length = 0;
      fixture.detectChanges();
      expect(log).toEqual([
        'doCheck-A', 'doCheck-B', 'doCheck-D', 'afterContentChecked-D', 'afterViewChecked-D',
        'afterContentChecked-A', 'afterContentChecked-B', 'afterViewChecked-A', 'afterViewChecked-B'
      ]);

      log.length = 0;
      const viewRef = vcRefDir.vcref.detach(0);
      fixture.detectChanges();
      expect(log).toEqual([
        'doCheck-A', 'doCheck-B', 'afterContentChecked-A', 'afterContentChecked-B',
        'afterViewChecked-A', 'afterViewChecked-B'
      ]);

      log.length = 0;
      vcRefDir.vcref.insert(viewRef!);
      fixture.detectChanges();
      expect(log).toEqual([
        'doCheck-A', 'doCheck-B', 'doCheck-D', 'afterContentChecked-D', 'afterViewChecked-D',
        'afterContentChecked-A', 'afterContentChecked-B', 'afterViewChecked-A', 'afterViewChecked-B'
      ]);

      log.length = 0;
      vcRefDir.vcref.remove(0);
      fixture.detectChanges();
      expect(log).toEqual([
        'onDestroy-D', 'doCheck-A', 'doCheck-B', 'afterContentChecked-A', 'afterContentChecked-B',
        'afterViewChecked-A', 'afterViewChecked-B'
      ]);
    });
  });

  describe('host bindings', () => {
    it('should support host bindings on dynamically created components', () => {
      @Component(
          {selector: 'host-bindings', host: {'id': 'attribute', '[title]': 'title'}, template: ``})
      class HostBindingCmpt {
        title = 'initial';
      }

      @Component({template: `<ng-template vcref></ng-template>`})
      class TestComponent {
        @ViewChild(VCRefDirective, {static: true}) vcRefDir!: VCRefDirective;
      }

      TestBed.configureTestingModule(
          {declarations: [TestComponent, VCRefDirective, HostBindingCmpt]});
      const fixture = TestBed.createComponent(TestComponent);
      const {vcRefDir} = fixture.componentInstance;

      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toBe('');

      const componentRef = vcRefDir.vcref.createComponent(HostBindingCmpt);
      fixture.detectChanges();

      expect(fixture.nativeElement.children[0].tagName).toBe('HOST-BINDINGS');
      expect(fixture.nativeElement.children[0].getAttribute('id')).toBe('attribute');
      expect(fixture.nativeElement.children[0].getAttribute('title')).toBe('initial');

      componentRef.instance.title = 'changed';
      fixture.detectChanges();

      expect(fixture.nativeElement.children[0].tagName).toBe('HOST-BINDINGS');
      expect(fixture.nativeElement.children[0].getAttribute('id')).toBe('attribute');
      expect(fixture.nativeElement.children[0].getAttribute('title')).toBe('changed');
    });
  });

  describe('projection', () => {
    it('should project the ViewContainerRef content along its host, in an element', () => {
      @Component({selector: 'child', template: '<div><ng-content></ng-content></div>'})
      class Child {
      }

      @Component({
        selector: 'parent',
        template: `
          <ng-template #foo>
            <span>{{name}}</span>
          </ng-template>

          <child>
            <header vcref [tplRef]="foo" [name]="name">blah</header>
          </child>`
      })
      class Parent {
        name: string = 'bar';
      }

      TestBed.configureTestingModule({declarations: [Child, Parent, VCRefDirective]});
      const fixture = TestBed.createComponent(Parent);
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement))
          .toEqual('<child><div><header vcref="">blah</header></div></child>');

      vcRefDir.vcref.createEmbeddedView(vcRefDir.tplRef!);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement))
          .toEqual('<child><div><header vcref="">blah</header><span>bar</span></div></child>');
    });

    it('should project the ViewContainerRef content along its host, in a view', () => {
      @Component({
        selector: 'child-with-view',
        template: `Before (inside)-<ng-content *ngIf="show"></ng-content>-After (inside)`
      })
      class ChildWithView {
        show: boolean = true;
      }

      @Component({
        selector: 'parent',
        template: `
          <ng-template #foo>
            <span>{{name}}</span>
          </ng-template>
          <child-with-view>
            Before projected
            <header vcref [tplRef]="foo" [name]="name">blah</header>
            After projected
          </child-with-view>`
      })
      class Parent {
        name: string = 'bar';
      }

      TestBed.configureTestingModule({declarations: [ChildWithView, Parent, VCRefDirective]});
      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);

      expect(getElementHtml(fixture.nativeElement))
          .toEqual(
              '<child-with-view>Before (inside)- Before projected <header vcref="">blah</header> After projected -After (inside)</child-with-view>');

      vcRefDir.vcref.createEmbeddedView(vcRefDir.tplRef!);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement))
          .toEqual(
              '<child-with-view>Before (inside)- Before projected <header vcref="">blah</header><span>bar</span> After projected -After (inside)</child-with-view>');
    });

    it('should handle empty re-projection into the root of a view', () => {
      @Component({
        selector: 'root-comp',
        template: `<ng-template [ngIf]="show"><ng-content></ng-content></ng-template>`,
      })
      class RootComp {
        @Input() show: boolean = true;
      }

      @Component({
        selector: 'my-app',
        template: `<root-comp [show]="show"><ng-content></ng-content><div></div></root-comp>`
      })
      class MyApp {
        show = true;
      }

      TestBed.configureTestingModule({declarations: [MyApp, RootComp]});
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('div').length).toBe(1);

      fixture.componentInstance.show = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('div').length).toBe(0);
    });

    describe('with select', () => {
      @Component({
        selector: 'child-with-selector',
        template: `
          <p class="a"><ng-content select="header"></ng-content></p>
          <p class="b"><ng-content></ng-content></p>`,
      })
      class ChildWithSelector {
      }

      it('should project the ViewContainerRef content along its host, when the host matches a selector',
         () => {
           @Component({
             selector: 'parent',
             template: `
            <ng-template #foo>
              <span>{{name}}</span>
            </ng-template>
            <child-with-selector>
              <header vcref [tplRef]="foo" [name]="name">blah</header>
            </child-with-selector>
          `
           })
           class Parent {
             name: string = 'bar';
           }

           TestBed.configureTestingModule(
               {declarations: [Parent, ChildWithSelector, VCRefDirective]});
           const fixture = TestBed.createComponent(Parent);
           const vcRefDir = fixture.debugElement.query(By.directive(VCRefDirective))
                                .injector.get(VCRefDirective);
           fixture.detectChanges();

           expect(getElementHtml(fixture.nativeElement))
               .toEqual(
                   '<child-with-selector><p class="a"><header vcref="">blah</header></p><p class="b"></p></child-with-selector>');

           vcRefDir.vcref.createEmbeddedView(vcRefDir.tplRef!);
           fixture.detectChanges();

           expect(getElementHtml(fixture.nativeElement))
               .toEqual(
                   '<child-with-selector><p class="a"><header vcref="">blah</header><span>bar</span></p><p class="b"></p></child-with-selector>');
         });

      it('should create embedded view when ViewContainerRef is inside projection', () => {
        @Component({
          selector: 'content-comp',
          template: '<ng-content></ng-content>',
        })
        class ContentComp {
        }

        @Component({
          selector: 'my-comp',
          template: `
          <content-comp>
            <div #target></div>
          </content-comp>

          <ng-template #source>My Content</ng-template>
        `
        })
        class MyComp {
          @ViewChild('source', {static: true}) source!: TemplateRef<{}>;

          @ViewChild('target', {read: ViewContainerRef, static: true}) target!: ViewContainerRef;

          ngOnInit() {
            this.target.createEmbeddedView(this.source);
          }
        }

        TestBed.configureTestingModule({declarations: [MyComp, ContentComp]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
        expect(fixture.debugElement.nativeElement.innerHTML).toContain('My Content');
      });

      it('should not project the ViewContainerRef content, when the host does not match a selector',
         () => {
           @Component({
             selector: 'parent',
             template: `
            <ng-template #foo>
              <span>{{name}}</span>
            </ng-template>
            <child-with-selector>
              <footer vcref [tplRef]="foo" [name]="name">blah</footer>
            </child-with-selector>
          `
           })
           class Parent {
             name: string = 'bar';
           }

           TestBed.configureTestingModule(
               {declarations: [Parent, ChildWithSelector, VCRefDirective]});
           const fixture = TestBed.createComponent(Parent);
           const vcRefDir = fixture.debugElement.query(By.directive(VCRefDirective))
                                .injector.get(VCRefDirective);
           fixture.detectChanges();

           expect(getElementHtml(fixture.nativeElement))
               .toEqual(
                   '<child-with-selector><p class="a"></p><p class="b"><footer vcref="">blah</footer></p></child-with-selector>');

           vcRefDir.vcref.createEmbeddedView(vcRefDir.tplRef!);
           fixture.detectChanges();

           expect(getElementHtml(fixture.nativeElement))
               .toEqual(
                   '<child-with-selector><p class="a"></p><p class="b"><footer vcref="">blah</footer><span>bar</span></p></child-with-selector>');
         });
    });
  });

  describe('root view container ref', () => {
    let containerEl: HTMLElement|null = null;

    beforeEach(() => containerEl = null);

    /**
     * Creates a new test component renderer instance that wraps the root element
     * in another element. This allows us to test if elements have been inserted into
     * the parent element of the root component.
     */
    function createTestComponentRenderer(document: any): TestComponentRenderer {
      return {
        insertRootElement(rootElementId: string) {
          const rootEl = document.createElement('div');
          rootEl.id = rootElementId;

          containerEl = document.createElement('div');
          document.body.appendChild(containerEl);
          containerEl!.appendChild(rootEl);
        },
        removeAllRootElements() {
          if (containerEl) {
            containerEl.parentNode?.removeChild(containerEl);
          }
        }
      };
    }

    const TEST_COMPONENT_RENDERER = {
      provide: TestComponentRenderer,
      useFactory: createTestComponentRenderer,
      deps: [DOCUMENT]
    };

    it('should check bindings for components dynamically created by root component', () => {
      @Component({
        selector: 'dynamic-cmpt-with-bindings',
        template: `check count: {{checkCount}}`,
      })
      class DynamicCompWithBindings implements DoCheck {
        checkCount = 0;

        ngDoCheck() {
          this.checkCount++;
        }
      }

      @Component({template: ``})
      class TestComp {
        constructor(public vcRef: ViewContainerRef) {}
      }


      TestBed.configureTestingModule({
        declarations: [TestComp, DynamicCompWithBindings],
        providers: [TEST_COMPONENT_RENDERER]
      });
      const fixture = TestBed.createComponent(TestComp);
      const {vcRef} = fixture.componentInstance;
      fixture.detectChanges();

      expect(containerEl!.childNodes.length).toBe(2);
      expect(containerEl!.childNodes[1].nodeType).toBe(Node.COMMENT_NODE);

      expect((containerEl!.childNodes[0] as Element).tagName).toBe('DIV');

      vcRef.createComponent(DynamicCompWithBindings);
      fixture.detectChanges();

      expect(containerEl!.childNodes.length).toBe(3);
      expect(containerEl!.childNodes[1].textContent).toBe('check count: 1');

      fixture.detectChanges();

      expect(containerEl!.childNodes.length).toBe(3);
      expect(containerEl!.childNodes[1].textContent).toBe('check count: 2');
    });

    it('should create deep DOM tree immediately for dynamically created components', () => {
      @Component({template: ``})
      class TestComp {
        constructor(public vcRef: ViewContainerRef) {}
      }

      @Component({selector: 'child', template: `<div>{{name}}</div>`})
      class Child {
        name = 'text';
      }

      @Component({selector: 'dynamic-cmpt-with-children', template: `<child></child>`})
      class DynamicCompWithChildren {
      }


      TestBed.configureTestingModule({
        declarations: [TestComp, DynamicCompWithChildren, Child],
        providers: [TEST_COMPONENT_RENDERER]
      });

      const fixture = TestBed.createComponent(TestComp);
      const {vcRef} = fixture.componentInstance;
      fixture.detectChanges();

      expect(containerEl!.childNodes.length).toBe(2);
      expect(containerEl!.childNodes[1].nodeType).toBe(Node.COMMENT_NODE);

      expect((containerEl!.childNodes[0] as Element).tagName).toBe('DIV');

      vcRef.createComponent(DynamicCompWithChildren);

      expect(containerEl!.childNodes.length).toBe(3);
      expect(getElementHtml(containerEl!.childNodes[1] as Element))
          .toBe('<child><div></div></child>');

      fixture.detectChanges();

      expect(containerEl!.childNodes.length).toBe(3);
      expect(getElementHtml(containerEl!.childNodes[1] as Element))
          .toBe(`<child><div>text</div></child>`);
    });
  });
});

@Component({
  template: `
    <ng-template #tplRef let-name>{{name}}</ng-template>
    <p vcref [tplRef]="tplRef"></p>
  `,
})
class EmbeddedViewInsertionComp {
}

@Directive({
  selector: '[vcref]',
})
class VCRefDirective {
  @Input() tplRef: TemplateRef<any>|undefined;
  @Input() name: string = '';

  // Injecting the ViewContainerRef to create a dynamic container in which
  // embedded views will be created
  constructor(public vcref: ViewContainerRef, public elementRef: ElementRef) {}

  createView(s: string, index?: number): EmbeddedViewRef<any> {
    if (!this.tplRef) {
      throw new Error('No template reference passed to directive.');
    }

    return this.vcref.createEmbeddedView(this.tplRef, {$implicit: s}, index);
  }
}

@Component({
  selector: `embedded-cmp-with-ngcontent`,
  template: `<ng-content></ng-content><hr><ng-content></ng-content>`
})
class EmbeddedComponentWithNgContent {
}

@Component({
  selector: 'view-container-ref-comp',
  template: `
    <ng-template #ref0>0</ng-template>
    <ng-template #ref1>1</ng-template>
    <ng-template #ref2>2</ng-template>
  `
})
class ViewContainerRefComp {
  @ViewChildren(TemplateRef) templates!: QueryList<TemplateRef<any>>;

  constructor(public vcr: ViewContainerRef) {}
}

@Component({
  selector: 'view-container-ref-app',
  template: `
    <view-container-ref-comp></view-container-ref-comp>
  `
})
class ViewContainerRefApp {
  @ViewChild(ViewContainerRefComp) vcrComp!: ViewContainerRefComp;
}

@Directive({selector: '[structDir]'})
export class StructDir {
  constructor(private vcref: ViewContainerRef, private tplRef: TemplateRef<any>) {}

  create() {
    this.vcref.createEmbeddedView(this.tplRef);
  }

  destroy() {
    this.vcref.clear();
  }
}

@Component({selector: 'destroy-cases', template: `  `})
class DestroyCasesComp {
  @ViewChildren(StructDir) structDirs!: QueryList<StructDir>;
}

@Directive({selector: '[constructorDir]'})
class ConstructorDir {
  constructor(vcref: ViewContainerRef, tplRef: TemplateRef<any>) {
    vcref.createEmbeddedView(tplRef);
  }
}

@Component({
  selector: 'constructor-app',
  template: `
    <div *constructorDir>
      <span *constructorDir #foo></span>
    </div>
  `
})
class ConstructorApp {
  @ViewChild('foo', {static: true}) foo!: ElementRef;
}

@Component({
  selector: 'constructor-app-with-queries',
  template: `
    <ng-template constructorDir #foo>
      <div #foo></div>
    </ng-template>
  `
})
class ConstructorAppWithQueries {
  @ViewChild('foo', {static: true}) foo!: TemplateRef<any>;
}
