/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, NO_ERRORS_SCHEMA, QueryList, TemplateRef, ViewChild, ViewChildren, ViewContainerRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {ivyEnabled, onlyInIvy, polyfillGoogGetMsg} from '@angular/private/testing';

describe('ViewContainerRef', () => {

  const TRANSLATIONS: any = {
    'Bar': 'o',
    '{$startTagBefore}{$closeTagBefore}{$startTagDiv}{$startTagInside}{$closeTagInside}{$closeTagDiv}{$startTagAfter}{$closeTagAfter}':
        'F{$startTagDiv}{$closeTagDiv}o',
    '{$startTagBefore}{$closeTagBefore}{$startTagDiv}{$startTagIn}{$closeTagIn}{$closeTagDiv}{$startTagAfter}{$closeTagAfter}':
        '{$startTagDiv}{$closeTagDiv}{$startTagBefore}{$closeTagBefore}'
  };

  beforeEach(() => {
    polyfillGoogGetMsg(TRANSLATIONS);
    TestBed.configureTestingModule(
        {declarations: [StructDir, ViewContainerRefComp, ViewContainerRefApp, DestroyCasesComp]});
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

});

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
  @ViewChild(ViewContainerRefComp) vcrComp !: ViewContainerRefComp;
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
