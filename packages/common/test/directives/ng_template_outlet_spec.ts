/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component, ContentChildren, Directive, NO_ERRORS_SCHEMA, QueryList, TemplateRef} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

export function main() {
  describe('NgTemplateOutlet', () => {
    let fixture: ComponentFixture<any>;

    function setTplRef(value: any): void { fixture.componentInstance.currentTplRef = value; }

    function detectChangesAndExpectText(text: string): void {
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement).toHaveText(text);
    }

    afterEach(() => { fixture = null as any; });

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [
          TestComponent,
          CaptureTplRefs,
        ],
        imports: [CommonModule],
      });
    });

    // https://github.com/angular/angular/issues/14778
    it('should accept the component as the context', async(() => {
         const template = `<ng-container *ngTemplateOutlet="tpl; context: this"></ng-container>` +
             `<ng-template #tpl>{{context.foo}}</ng-template>`;

         fixture = createTestComponent(template);
         detectChangesAndExpectText('bar');
       }));

    it('should do nothing if templateRef is `null`', async(() => {
         const template = `<ng-container [ngTemplateOutlet]="null"></ng-container>`;
         fixture = createTestComponent(template);
         detectChangesAndExpectText('');
       }));

    it('should insert content specified by TemplateRef', async(() => {
         const template = `<ng-template #tpl>foo</ng-template>` +
             `<ng-container [ngTemplateOutlet]="tpl"></ng-container>`;
         fixture = createTestComponent(template);
         detectChangesAndExpectText('foo');
       }));

    it('should clear content if TemplateRef becomes `null`', async(() => {
         const template = `<tpl-refs #refs="tplRefs"><ng-template>foo</ng-template></tpl-refs>` +
             `<ng-container [ngTemplateOutlet]="currentTplRef"></ng-container>`;
         fixture = createTestComponent(template);
         fixture.detectChanges();
         const refs = fixture.debugElement.children[0].references !['refs'];

         setTplRef(refs.tplRefs.first);
         detectChangesAndExpectText('foo');

         setTplRef(null);
         detectChangesAndExpectText('');
       }));

    it('should swap content if TemplateRef changes', async(() => {
         const template =
             `<tpl-refs #refs="tplRefs"><ng-template>foo</ng-template><ng-template>bar</ng-template></tpl-refs>` +
             `<ng-container [ngTemplateOutlet]="currentTplRef"></ng-container>`;
         fixture = createTestComponent(template);

         fixture.detectChanges();
         const refs = fixture.debugElement.children[0].references !['refs'];

         setTplRef(refs.tplRefs.first);
         detectChangesAndExpectText('foo');

         setTplRef(refs.tplRefs.last);
         detectChangesAndExpectText('bar');
       }));

    it('should display template if context is `null`', async(() => {
         const template = `<ng-template #tpl>foo</ng-template>` +
             `<ng-container *ngTemplateOutlet="tpl; context: null"></ng-container>`;
         fixture = createTestComponent(template);
         detectChangesAndExpectText('foo');
       }));

    it('should reflect initial context and changes', async(() => {
         const template = `<ng-template let-foo="foo" #tpl>{{foo}}</ng-template>` +
             `<ng-container *ngTemplateOutlet="tpl; context: context"></ng-container>`;
         fixture = createTestComponent(template);

         fixture.detectChanges();
         detectChangesAndExpectText('bar');

         fixture.componentInstance.context.foo = 'alter-bar';
         detectChangesAndExpectText('alter-bar');
       }));

    it('should reflect user defined `$implicit` property in the context', async(() => {
         const template = `<ng-template let-ctx #tpl>{{ctx.foo}}</ng-template>` +
             `<ng-container *ngTemplateOutlet="tpl; context: context"></ng-container>`;
         fixture = createTestComponent(template);
         fixture.componentInstance.context = {$implicit: {foo: 'bra'}};
         detectChangesAndExpectText('bra');
       }));

    it('should reflect context re-binding', async(() => {
         const template =
             `<ng-template let-shawshank="shawshank" #tpl>{{shawshank}}</ng-template>` +
             `<ng-container *ngTemplateOutlet="tpl; context: context"></ng-container>`;
         fixture = createTestComponent(template);

         fixture.componentInstance.context = {shawshank: 'brooks'};
         detectChangesAndExpectText('brooks');

         fixture.componentInstance.context = {shawshank: 'was here'};
         detectChangesAndExpectText('was here');
       }));
  });
}

@Directive({selector: 'tpl-refs', exportAs: 'tplRefs'})
class CaptureTplRefs {
  @ContentChildren(TemplateRef) tplRefs: QueryList<TemplateRef<any>>;
}

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  currentTplRef: TemplateRef<any>;
  context: any = {foo: 'bar'};
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}})
      .configureTestingModule({schemas: [NO_ERRORS_SCHEMA]})
      .createComponent(TestComponent);
}
