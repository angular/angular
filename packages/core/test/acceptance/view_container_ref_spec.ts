/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, QueryList, TemplateRef, ViewChild, ViewChildren, ViewContainerRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {ivyEnabled, onlyInIvy} from '@angular/private/testing';

describe('ViewContainerRef', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({declarations: [ViewContainerRefComp, ViewContainerRefApp]});
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
