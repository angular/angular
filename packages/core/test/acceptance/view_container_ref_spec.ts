/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, DOCUMENT} from '@angular/common';
import {Compiler, Component, ComponentFactoryResolver, Directive, DoCheck, ElementRef, EmbeddedViewRef, ErrorHandler, NO_ERRORS_SCHEMA, NgModule, OnInit, Pipe, PipeTransform, QueryList, RendererFactory2, RendererType2, Sanitizer, TemplateRef, ViewChild, ViewChildren, ViewContainerRef, ɵi18nConfigureLocalize} from '@angular/core';
import {Input} from '@angular/core/src/metadata';
import {ngDevModeResetPerfCounters} from '@angular/core/src/util/ng_dev_mode';
import {TestBed, TestComponentRenderer} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {ivyEnabled, onlyInIvy} from '@angular/private/testing';

describe('ViewContainerRef', () => {

  const TRANSLATIONS: any = {
    'Bar': 'o',
    '{$startTagBefore}{$closeTagBefore}{$startTagDiv}{$startTagInside}{$closeTagInside}{$closeTagDiv}{$startTagAfter}{$closeTagAfter}':
        'F{$startTagDiv}{$closeTagDiv}o',
    '{$startTagBefore}{$closeTagBefore}{$startTagDiv}{$startTagIn}{$closeTagIn}{$closeTagDiv}{$startTagAfter}{$closeTagAfter}':
        '{$startTagDiv}{$closeTagDiv}{$startTagBefore}{$closeTagBefore}'
  };

  /**
   * Gets the inner HTML of the given element with all HTML comments and Angular internal
   * reflect attributes omitted. This makes HTML comparisons easier and less verbose.
   */
  function getElementHtml(element: Element) {
    return element.innerHTML.replace(/<!--(\W|\w)*?-->/g, '')
        .replace(/\sng-reflect-\S*="[^"]*"/g, '');
  }

  beforeEach(() => {
    ɵi18nConfigureLocalize({translations: TRANSLATIONS});
    TestBed.configureTestingModule({
      declarations: [
        StructDir, ViewContainerRefComp, ViewContainerRefApp, DestroyCasesComp, ConstructorDir,
        ConstructorApp, ConstructorAppWithQueries
      ]
    });
  });

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

    it('should use comment node of host ng-container as insertion marker', () => {
      @Component({template: 'hello'})
      class HelloComp {
      }

      @NgModule({entryComponents: [HelloComp], declarations: [HelloComp]})
      class HelloCompModule {
      }

      @Component({
        template: `
          <ng-container vcref></ng-container>
        `
      })
      class TestComp {
        @ViewChild(VCRefDirective, {static: true}) vcRefDir !: VCRefDirective;
      }

      TestBed.configureTestingModule(
          {declarations: [TestComp, VCRefDirective], imports: [HelloCompModule]});
      const fixture = TestBed.createComponent(TestComp);
      const {vcref, cfr, elementRef} = fixture.componentInstance.vcRefDir;
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
      vcref.createComponent(cfr.resolveComponentFactory(HelloComp));
      fixture.detectChanges();

      expect(testParent.textContent).toBe('hello');
      expect(testParent.childNodes.length).toBe(2);

      // With Ivy, views are inserted before the container comment marker.
      if (ivyEnabled) {
        expect(testParent.childNodes[0].nodeType).toBe(Node.ELEMENT_NODE);
        expect(testParent.childNodes[0].textContent).toBe('hello');
        expect(testParent.childNodes[1].nodeType).toBe(Node.COMMENT_NODE);
      } else {
        expect(testParent.childNodes[0].nodeType).toBe(Node.COMMENT_NODE);
        expect(testParent.childNodes[1].nodeType).toBe(Node.ELEMENT_NODE);
        expect(testParent.childNodes[1].textContent).toBe('hello');
      }
    });

    it('should support attribute selectors in dynamically created components', () => {
      @Component({selector: '[hello]', template: 'Hello'})
      class HelloComp {
      }

      @NgModule({entryComponents: [HelloComp], declarations: [HelloComp]})
      class HelloCompModule {
      }

      @Component({
        template: `
          <ng-container #container></ng-container>
        `
      })
      class TestComp {
        @ViewChild('container', {read: ViewContainerRef, static: false}) vcRef !: ViewContainerRef;

        constructor(public cfr: ComponentFactoryResolver) {}

        createComponent() {
          const factory = this.cfr.resolveComponentFactory(HelloComp);
          this.vcRef.createComponent(factory);
        }
      }

      TestBed.configureTestingModule({declarations: [TestComp], imports: [HelloCompModule]});
      const fixture = TestBed.createComponent(TestComp);
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.innerHTML).not.toContain('Hello');

      fixture.componentInstance.createComponent();
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.innerHTML).toContain('Hello');
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

      expect(() => { fixture.destroy(); }).not.toThrow();

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

      // In Ivy, we correctly move the "0" view to index 2. VE
      // has a bug that duplicates the view, so it's at index 1.
      if (ivyEnabled) {
        expect(fixture.nativeElement.textContent).toEqual('120');
      } else {
        expect(fixture.nativeElement.textContent).toEqual('102');
      }
    });
  });

  describe('move', () => {
    onlyInIvy('Ivy will insert detached views in move')
        .it('should insert detached views in move()', () => {
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

    onlyInIvy('Ivy i18n logic')
        .it('when ViewContainerRef is on an element inside a ng-container with i18n', () => {
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

    onlyInIvy('Ivy i18n logic')
        .it('when ViewContainerRef is on an element, and i18n is on the parent ViewContainerRef',
            () => {
              executeTest(`
      <ng-template #foo>
        <span>Foo</span>
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
      expect(vcRefDir.vcref.indexOf(viewRef !)).toEqual(0);

      viewRef = vcRefDir.vcref.get(1);
      expect(vcRefDir.vcref.indexOf(viewRef !)).toEqual(1);

      viewRef = vcRefDir.vcref.get(2);
      expect(vcRefDir.vcref.indexOf(viewRef !)).toEqual(2);
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
      expect(vcRefDir.vcref.indexOf(viewRef !)).toEqual(-1);
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
      vcRefDir.vcref.move(viewRef !, 2);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>BC**A**');

      vcRefDir.vcref.move(viewRef !, 0);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>**A**BC');

      vcRefDir.vcref.move(viewRef !, 1);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>B**A**C');

      // Invalid indices when detaching throws an exception in Ivy: FW-1330.
      ivyEnabled && expect(() => vcRefDir.vcref.move(viewRef !, -1)).toThrow();
      ivyEnabled && expect(() => vcRefDir.vcref.move(viewRef !, 42)).toThrow();
    });
  });

  describe('getters', () => {
    it('should work on templates', () => {
      @Component({
        template: `
          <ng-template vcref let-name>{{name}}</ng-template>
          <footer></footer>
        `
      })
      class TestComponent {
        @ViewChild(VCRefDirective, {static: true}) vcRefDir !: VCRefDirective;
      }

      TestBed.configureTestingModule({declarations: [VCRefDirective, TestComponent]});
      const fixture = TestBed.createComponent(TestComponent);
      const {vcRefDir} = fixture.componentInstance;
      fixture.detectChanges();

      expect(vcRefDir.vcref.element.nativeElement.nodeType).toBe(Node.COMMENT_NODE);
      // In Ivy, the comment for the view container ref has text that implies
      // that the comment is a placeholder for a container.
      ivyEnabled && expect(vcRefDir.vcref.element.nativeElement.textContent).toEqual('container');

      expect(vcRefDir.vcref.injector.get(ElementRef).nativeElement.textContent);
      expect(getElementHtml(vcRefDir.vcref.parentInjector.get(ElementRef).nativeElement))
          .toBe('<footer></footer>');
    });
  });

  describe('detach', () => {

    beforeEach(() => {
      TestBed.configureTestingModule({declarations: [EmbeddedViewInsertionComp, VCRefDirective]});

      // Tests depend on perf counters when running with Ivy. In order to have
      // clean perf counters at the beginning of a test, we reset those here.
      ivyEnabled && ngDevModeResetPerfCounters();
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

      // Invalid indices when detaching throws an exception in Ivy: FW-1330.
      ivyEnabled && expect(() => vcRefDir.vcref.detach(-1)).toThrow();
      ivyEnabled && expect(() => vcRefDir.vcref.detach(42)).toThrow();
      ivyEnabled && expect(ngDevMode !.rendererDestroyNode).toBe(0);
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
      ivyEnabled && expect(ngDevMode !.rendererDestroyNode).toBe(0);
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({declarations: [EmbeddedViewInsertionComp, VCRefDirective]});

      const _origRendererFactory = TestBed.get(RendererFactory2) as RendererFactory2;
      const _origCreateRenderer = _origRendererFactory.createRenderer;

      _origRendererFactory.createRenderer = function(element: any, type: RendererType2|null) {
        const renderer = _origCreateRenderer.call(_origRendererFactory, element, type);
        renderer.destroyNode = () => {};
        return renderer;
      };

      // Tests depend on perf counters when running with Ivy. In order to have
      // clean perf counters at the beginning of a test, we reset those here.
      ivyEnabled && ngDevModeResetPerfCounters();
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

      // Invalid indices when detaching throws an exception in Ivy: FW-1330.
      ivyEnabled && expect(() => vcRefDir.vcref.remove(-1)).toThrow();
      ivyEnabled && expect(() => vcRefDir.vcref.remove(42)).toThrow();
      ivyEnabled && expect(ngDevMode !.rendererDestroyNode).toBe(2);
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
      ivyEnabled && expect(ngDevMode !.rendererDestroyNode).toBe(1);
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

      // Invalid indices when detaching throws an exception in Ivy: FW-1330.
      ivyEnabled && expect(() => vcRef.createView('Z', -1)).toThrow();
      ivyEnabled && expect(() => vcRef.createView('Z', 5)).toThrow();
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

      // Invalid indices when detaching throws an exception in Ivy: FW-1330.
      ivyEnabled && expect(() => vcRef.createView('Z', -1)).toThrow();
      ivyEnabled && expect(() => vcRef.createView('Z', 5)).toThrow();
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
        @ViewChild(VCRefDirective, {static: true}) vcRef !: VCRefDirective;
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

      // Invalid indices when detaching throws an exception in Ivy: FW-1330.
      ivyEnabled && expect(() => vcRef !.createView('Z', -1)).toThrow();
      ivyEnabled && expect(() => vcRef !.createView('Z', 5)).toThrow();
    });

    it('should apply directives and pipes of the host view to the TemplateRef', () => {
      @Component({selector: 'child', template: `{{name}}`})
      class Child {
        @Input() name: string|undefined;
      }

      @Pipe({name: 'starPipe'})
      class StarPipe implements PipeTransform {
        transform(value: any) { return `**${value}**`; }
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

      vcRefDir.vcref.createEmbeddedView(vcRefDir.tplRef !);
      vcRefDir.vcref.createEmbeddedView(vcRefDir.tplRef !);
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
        ngOnInit() { templateExecutionCounter++; }

        ngDoCheck() { templateExecutionCounter++; }
      }

      @NgModule({entryComponents: [EmbeddedComponent], declarations: [EmbeddedComponent]})
      class EmbeddedComponentModule {
      }

      TestBed.configureTestingModule({
        declarations: [EmbeddedViewInsertionComp, VCRefDirective],
        imports: [EmbeddedComponentModule]
      });
      const fixture = TestBed.createComponent(EmbeddedViewInsertionComp);
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>');
      expect(templateExecutionCounter).toEqual(0);

      const componentRef =
          vcRefDir.vcref.createComponent(vcRefDir.cfr.resolveComponentFactory(EmbeddedComponent));
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
      class EmbeddedComponent implements DoCheck,
          OnInit {
        constructor(public s: String) {}

        ngOnInit() { templateExecutionCounter++; }

        ngDoCheck() { templateExecutionCounter++; }
      }

      @NgModule({entryComponents: [EmbeddedComponent], declarations: [EmbeddedComponent]})
      class EmbeddedComponentModule {
      }

      TestBed.configureTestingModule({
        declarations: [EmbeddedViewInsertionComp, VCRefDirective],
        imports: [EmbeddedComponentModule]
      });

      @NgModule({
        providers: [
          {provide: String, useValue: 'root_module'},
          // We need to provide the following tokens because otherwise view engine
          // will throw when creating a component factory in debug mode.
          {provide: Sanitizer, useValue: TestBed.get(Sanitizer)},
          {provide: ErrorHandler, useValue: TestBed.get(ErrorHandler)},
          {provide: RendererFactory2, useValue: TestBed.get(RendererFactory2)},
        ]
      })
      class MyAppModule {
      }

      @NgModule({providers: [{provide: String, useValue: 'some_module'}]})
      class SomeModule {
      }

      // Compile test modules in order to be able to pass the NgModuleRef or the
      // module injector to the ViewContainerRef create component method.
      const compiler = TestBed.get(Compiler) as Compiler;
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
          vcRefDir.cfr.resolveComponentFactory(EmbeddedComponent), 0, someModuleRef.injector);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement))
          .toEqual('<p vcref=""></p><embedded-cmp>foo</embedded-cmp>');
      expect(templateExecutionCounter).toEqual(2);
      expect(componentRef.instance.s).toEqual('some_module');

      componentRef = vcRefDir.vcref.createComponent(
          vcRefDir.cfr.resolveComponentFactory(EmbeddedComponent), 0, undefined, undefined,
          appModuleRef);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement))
          .toEqual(
              '<p vcref=""></p><embedded-cmp>foo</embedded-cmp><embedded-cmp>foo</embedded-cmp>');
      expect(componentRef.instance.s).toEqual('root_module');
      expect(templateExecutionCounter).toEqual(5);
    });

    it('should support projectable nodes', () => {
      TestBed.configureTestingModule({
        declarations: [EmbeddedViewInsertionComp, VCRefDirective],
        imports: [EmbeddedComponentWithNgZoneModule]
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
          vcRefDir.cfr.resolveComponentFactory(EmbeddedComponentWithNgContent), 0, undefined,
          [[myNode]]);
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

      @NgModule({
        exports: [Reprojector, EmbeddedComponentWithNgContent],
        declarations: [Reprojector, EmbeddedComponentWithNgContent],
        entryComponents: [Reprojector]
      })
      class ReprojectorModule {
      }

      TestBed.configureTestingModule({
        declarations: [EmbeddedViewInsertionComp, VCRefDirective],
        imports: [ReprojectorModule]
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
          vcRefDir.cfr.resolveComponentFactory(Reprojector), 0, undefined, [[myNode]]);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement))
          .toEqual(
              '<p vcref=""></p><reprojector><embedded-cmp-with-ngcontent><hr><div>barbaz</div></embedded-cmp-with-ngcontent></reprojector>');
    });

    it('should support many projectable nodes with many slots', () => {
      TestBed.configureTestingModule({
        declarations: [EmbeddedViewInsertionComp, VCRefDirective],
        imports: [EmbeddedComponentWithNgZoneModule]
      });
      const fixture = TestBed.createComponent(EmbeddedViewInsertionComp);
      const vcRefDir =
          fixture.debugElement.query(By.directive(VCRefDirective)).injector.get(VCRefDirective);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement)).toEqual('<p vcref=""></p>');

      vcRefDir.vcref.createComponent(
          vcRefDir.cfr.resolveComponentFactory(EmbeddedComponentWithNgContent), 0, undefined, [
            [document.createTextNode('1'), document.createTextNode('2')],
            [document.createTextNode('3'), document.createTextNode('4')]
          ]);
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
        constructor(
            public viewContainerRef: ViewContainerRef,
            public componentFactoryResolver: ComponentFactoryResolver) {}
      }

      @Component({selector: 'dynamic-comp', template: ''})
      class DynamicComponent {
      }

      @NgModule({declarations: [DynamicComponent], entryComponents: [DynamicComponent]})
      class DeclaresDynamicComponent {
      }

      TestBed.configureTestingModule(
          {imports: [DeclaresDynamicComponent], declarations: [TestComp]});
      const fixture = TestBed.createComponent(TestComp);

      // Note: it's important that we **don't** call `fixture.detectChanges` between here and
      // the component being created, because running change detection will reset Ivy's
      // namespace state which will make the test pass.

      const {viewContainerRef, componentFactoryResolver} = fixture.componentInstance;
      const componentRef = viewContainerRef.createComponent(
          componentFactoryResolver.resolveComponentFactory(DynamicComponent));
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
           viewContainerRef?: ViewContainerRef;

           ngOnInit() {
             const makeComponentFactory = (componentType: any) => ({
               create: () => TestBed.createComponent(componentType).componentRef,
             });
             this.viewContainerRef !.createComponent(makeComponentFactory(Child) as any);
           }
         }

         TestBed.configureTestingModule({declarations: [Comp, Child]});

         const fixture = TestBed.createComponent(Comp);
         fixture.detectChanges();

         expect(fixture.debugElement.nativeElement.innerHTML).toContain('Child Component');
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
        @Input() tpl !: TemplateRef<any>;
        @Input() rows !: any[];
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

  });

  describe('lifecycle hooks', () => {

    // Angular 5 reference: https://stackblitz.com/edit/lifecycle-hooks-vcref
    const log: string[] = [];

    @Component({selector: 'hooks', template: `{{name}}`})
    class ComponentWithHooks {
      @Input() name: string|undefined;

      private log(msg: string) { log.push(msg); }

      ngOnChanges() { this.log('onChanges-' + this.name); }
      ngOnInit() { this.log('onInit-' + this.name); }
      ngDoCheck() { this.log('doCheck-' + this.name); }

      ngAfterContentInit() { this.log('afterContentInit-' + this.name); }
      ngAfterContentChecked() { this.log('afterContentChecked-' + this.name); }

      ngAfterViewInit() { this.log('afterViewInit-' + this.name); }
      ngAfterViewChecked() { this.log('afterViewChecked-' + this.name); }

      ngOnDestroy() { this.log('onDestroy-' + this.name); }
    }

    @NgModule({
      declarations: [ComponentWithHooks],
      exports: [ComponentWithHooks],
      entryComponents: [ComponentWithHooks]
    })
    class ComponentWithHooksModule {
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
      vcRefDir.vcref.createEmbeddedView(vcRefDir.tplRef !);
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
      vcRefDir.vcref.insert(viewRef !);
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
          {declarations: [SomeComponent, VCRefDirective], imports: [ComponentWithHooksModule]});
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
      const componentRef =
          vcRefDir.vcref.createComponent(vcRefDir.cfr.resolveComponentFactory(ComponentWithHooks));
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
      vcRefDir.vcref.insert(viewRef !);
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
        @ViewChild(VCRefDirective, {static: true}) vcRefDir !: VCRefDirective;
      }

      @NgModule({declarations: [HostBindingCmpt], entryComponents: [HostBindingCmpt]})
      class TestModule {
      }

      TestBed.configureTestingModule(
          {declarations: [TestComponent, VCRefDirective], imports: [TestModule]});
      const fixture = TestBed.createComponent(TestComponent);
      const {vcRefDir} = fixture.componentInstance;

      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toBe('');

      const componentRef =
          vcRefDir.vcref.createComponent(vcRefDir.cfr.resolveComponentFactory(HostBindingCmpt));
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

      vcRefDir.vcref.createEmbeddedView(vcRefDir.tplRef !);
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

      vcRefDir.vcref.createEmbeddedView(vcRefDir.tplRef !);
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

           vcRefDir.vcref.createEmbeddedView(vcRefDir.tplRef !);
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
          @ViewChild('source', {static: true})
          source !: TemplateRef<{}>;

          @ViewChild('target', {read: ViewContainerRef, static: true})
          target !: ViewContainerRef;

          ngOnInit() { this.target.createEmbeddedView(this.source); }
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

           vcRefDir.vcref.createEmbeddedView(vcRefDir.tplRef !);
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
          containerEl !.appendChild(rootEl);
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

        ngDoCheck() { this.checkCount++; }
      }

      @Component({template: ``})
      class TestComp {
        constructor(public vcRef: ViewContainerRef, public cfResolver: ComponentFactoryResolver) {}
      }

      @NgModule(
          {entryComponents: [DynamicCompWithBindings], declarations: [DynamicCompWithBindings]})
      class DynamicCompWithBindingsModule {
      }


      TestBed.configureTestingModule({
        declarations: [TestComp],
        imports: [DynamicCompWithBindingsModule],
        providers: [TEST_COMPONENT_RENDERER]
      });
      const fixture = TestBed.createComponent(TestComp);
      const {vcRef, cfResolver} = fixture.componentInstance;
      fixture.detectChanges();

      // Ivy inserts a comment for the root view container ref instance. This is not
      // the case for view engine and we need to adjust the assertions.
      expect(containerEl !.childNodes.length).toBe(ivyEnabled ? 2 : 1);
      ivyEnabled && expect(containerEl !.childNodes[1].nodeType).toBe(Node.COMMENT_NODE);

      expect((containerEl !.childNodes[0] as Element).tagName).toBe('DIV');

      vcRef.createComponent(cfResolver.resolveComponentFactory(DynamicCompWithBindings));
      fixture.detectChanges();

      expect(containerEl !.childNodes.length).toBe(ivyEnabled ? 3 : 2);
      expect(containerEl !.childNodes[1].textContent).toBe('check count: 1');

      fixture.detectChanges();

      expect(containerEl !.childNodes.length).toBe(ivyEnabled ? 3 : 2);
      expect(containerEl !.childNodes[1].textContent).toBe('check count: 2');
    });

    it('should create deep DOM tree immediately for dynamically created components', () => {
      @Component({template: ``})
      class TestComp {
        constructor(public vcRef: ViewContainerRef, public cfResolver: ComponentFactoryResolver) {}
      }

      @Component({selector: 'child', template: `<div>{{name}}</div>`})
      class Child {
        name = 'text';
      }

      @Component({selector: 'dynamic-cmpt-with-children', template: `<child></child>`})
      class DynamicCompWithChildren {
      }

      @NgModule({
        entryComponents: [DynamicCompWithChildren],
        declarations: [DynamicCompWithChildren, Child]
      })
      class DynamicCompWithChildrenModule {
      }

      TestBed.configureTestingModule({
        declarations: [TestComp],
        imports: [DynamicCompWithChildrenModule],
        providers: [TEST_COMPONENT_RENDERER]
      });

      const fixture = TestBed.createComponent(TestComp);
      const {vcRef, cfResolver} = fixture.componentInstance;
      fixture.detectChanges();

      // Ivy inserts a comment for the root view container ref instance. This is not
      // the case for view engine and we need to adjust the assertions.
      expect(containerEl !.childNodes.length).toBe(ivyEnabled ? 2 : 1);
      ivyEnabled && expect(containerEl !.childNodes[1].nodeType).toBe(Node.COMMENT_NODE);

      expect((containerEl !.childNodes[0] as Element).tagName).toBe('DIV');

      vcRef.createComponent(cfResolver.resolveComponentFactory(DynamicCompWithChildren));

      expect(containerEl !.childNodes.length).toBe(ivyEnabled ? 3 : 2);
      expect(getElementHtml(containerEl !.childNodes[1] as Element))
          .toBe('<child><div></div></child>');

      fixture.detectChanges();

      expect(containerEl !.childNodes.length).toBe(ivyEnabled ? 3 : 2);
      expect(getElementHtml(containerEl !.childNodes[1] as Element))
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
  constructor(
      public vcref: ViewContainerRef, public cfr: ComponentFactoryResolver,
      public elementRef: ElementRef) {}

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

@NgModule({
  exports: [EmbeddedComponentWithNgContent],
  entryComponents: [EmbeddedComponentWithNgContent],
  declarations: [EmbeddedComponentWithNgContent],
})
class EmbeddedComponentWithNgZoneModule {
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
  @ViewChildren(TemplateRef) templates !: QueryList<TemplateRef<any>>;

  constructor(public vcr: ViewContainerRef) {}
}

@Component({
  selector: 'view-container-ref-app',
  template: `
    <view-container-ref-comp></view-container-ref-comp>
  `
})
class ViewContainerRefApp {
  @ViewChild(ViewContainerRefComp, {static: false}) vcrComp !: ViewContainerRefComp;
}

@Directive({selector: '[structDir]'})
export class StructDir {
  constructor(private vcref: ViewContainerRef, private tplRef: TemplateRef<any>) {}

  create() { this.vcref.createEmbeddedView(this.tplRef); }

  destroy() { this.vcref.clear(); }
}

@Component({selector: 'destroy-cases', template: `  `})
class DestroyCasesComp {
  @ViewChildren(StructDir) structDirs !: QueryList<StructDir>;
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
  @ViewChild('foo', {static: true}) foo !: ElementRef;
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
  @ViewChild('foo', {static: true}) foo !: TemplateRef<any>;
}
