/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ComponentFactoryResolver, Directive, ElementRef, EmbeddedViewRef, NO_ERRORS_SCHEMA, QueryList, TemplateRef, ViewChild, ViewChildren, ViewContainerRef, ɵi18nConfigureLocalize} from '@angular/core';
import {Input, NgModule} from '@angular/core/src/metadata';
import {TestBed} from '@angular/core/testing';
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

  describe('createComponent', () => {
    let templateExecutionCounter = 0;

    beforeEach(() => templateExecutionCounter = 0);

    it('should support projectable nodes', () => {
      TestBed.configureTestingModule({
        declarations: [EmbeddedViewInsertionComp, VCRefDirective],
        imports: [EmbeddedComponentWithNgContentModule]
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
        imports: [EmbeddedComponentWithNgContentModule]
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
class EmbeddedComponentWithNgContentModule {
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
