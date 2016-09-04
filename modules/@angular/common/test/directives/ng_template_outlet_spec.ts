/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component, ContentChildren, Directive, NO_ERRORS_SCHEMA, QueryList, TemplateRef} from '@angular/core';
import {TestBed, async} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/matchers';

export function main() {
  describe('insert', () => {

    beforeEach(() => {
      TestBed.configureTestingModule(
          {declarations: [TestComponent, CaptureTplRefs], imports: [CommonModule]});
    });

    it('should do nothing if templateRef is null', async(() => {
         const template = `<template [ngTemplateOutlet]="null"></template>`;
         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);

         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('');
       }));

    it('should insert content specified by TemplateRef', async(() => {
         const template =
             `<tpl-refs #refs="tplRefs"><template>foo</template></tpl-refs><template [ngTemplateOutlet]="currentTplRef"></template>`;
         TestBed.overrideComponent(TestComponent, {set: {template: template}})
             .configureTestingModule({schemas: [NO_ERRORS_SCHEMA]});

         let fixture = TestBed.createComponent(TestComponent);

         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('');

         var refs = fixture.debugElement.children[0].references['refs'];

         fixture.componentInstance.currentTplRef = refs.tplRefs.first;
         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('foo');
       }));

    it('should clear content if TemplateRef becomes null', async(() => {
         const template =
             `<tpl-refs #refs="tplRefs"><template>foo</template></tpl-refs><template [ngTemplateOutlet]="currentTplRef"></template>`;
         TestBed.overrideComponent(TestComponent, {set: {template: template}})
             .configureTestingModule({schemas: [NO_ERRORS_SCHEMA]});
         let fixture = TestBed.createComponent(TestComponent);

         fixture.detectChanges();
         var refs = fixture.debugElement.children[0].references['refs'];

         fixture.componentInstance.currentTplRef = refs.tplRefs.first;
         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('foo');

         fixture.componentInstance.currentTplRef = null;
         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('');
       }));

    it('should swap content if TemplateRef changes', async(() => {
         const template =
             `<tpl-refs #refs="tplRefs"><template>foo</template><template>bar</template></tpl-refs><template [ngTemplateOutlet]="currentTplRef"></template>`;
         TestBed.overrideComponent(TestComponent, {set: {template: template}})
             .configureTestingModule({schemas: [NO_ERRORS_SCHEMA]});
         let fixture = TestBed.createComponent(TestComponent);

         fixture.detectChanges();
         var refs = fixture.debugElement.children[0].references['refs'];

         fixture.componentInstance.currentTplRef = refs.tplRefs.first;
         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('foo');

         fixture.componentInstance.currentTplRef = refs.tplRefs.last;
         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('bar');
       }));

    it('should display template if context is null', async(() => {
         const template =
             `<tpl-refs #refs="tplRefs"><template>foo</template></tpl-refs><template [ngTemplateOutlet]="currentTplRef" [ngOutletContext]="null"></template>`;
         TestBed.overrideComponent(TestComponent, {set: {template: template}})
             .configureTestingModule({schemas: [NO_ERRORS_SCHEMA]});
         let fixture = TestBed.createComponent(TestComponent);

         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('');

         var refs = fixture.debugElement.children[0].references['refs'];

         fixture.componentInstance.currentTplRef = refs.tplRefs.first;
         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('foo');
       }));

    it('should reflect initial context and changes', async(() => {
         const template =
             `<tpl-refs #refs="tplRefs"><template let-foo="foo"><span>{{foo}}</span></template></tpl-refs><template [ngTemplateOutlet]="currentTplRef" [ngOutletContext]="context"></template>`;
         TestBed.overrideComponent(TestComponent, {set: {template: template}})
             .configureTestingModule({schemas: [NO_ERRORS_SCHEMA]});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.detectChanges();

         var refs = fixture.debugElement.children[0].references['refs'];
         fixture.componentInstance.currentTplRef = refs.tplRefs.first;

         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('bar');

         fixture.componentInstance.context.foo = 'alter-bar';

         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('alter-bar');
       }));

    it('should reflect user defined $implicit property in the context', async(() => {
         const template =
             `<tpl-refs #refs="tplRefs"><template let-ctx><span>{{ctx.foo}}</span></template></tpl-refs><template [ngTemplateOutlet]="currentTplRef" [ngOutletContext]="context"></template>`;
         TestBed.overrideComponent(TestComponent, {set: {template: template}})
             .configureTestingModule({schemas: [NO_ERRORS_SCHEMA]});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.detectChanges();

         var refs = fixture.debugElement.children[0].references['refs'];
         fixture.componentInstance.currentTplRef = refs.tplRefs.first;

         fixture.componentInstance.context = {$implicit: fixture.componentInstance.context};
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('bar');
       }));

    it('should reflect context re-binding', async(() => {
         const template =
             `<tpl-refs #refs="tplRefs"><template let-shawshank="shawshank"><span>{{shawshank}}</span></template></tpl-refs><template [ngTemplateOutlet]="currentTplRef" [ngOutletContext]="context"></template>`;
         TestBed.overrideComponent(TestComponent, {set: {template: template}})
             .configureTestingModule({schemas: [NO_ERRORS_SCHEMA]});

         let fixture = TestBed.createComponent(TestComponent);
         fixture.detectChanges();

         var refs = fixture.debugElement.children[0].references['refs'];
         fixture.componentInstance.currentTplRef = refs.tplRefs.first;
         fixture.componentInstance.context = {shawshank: 'brooks'};

         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('brooks');

         fixture.componentInstance.context = {shawshank: 'was here'};

         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('was here');
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
