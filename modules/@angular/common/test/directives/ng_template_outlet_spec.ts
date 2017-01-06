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
import {expect} from '@angular/platform-browser/testing/matchers';

export function main() {
  describe('NgTemplateOutlet', () => {
    let fixture: ComponentFixture<any>;

    function setTplRef(value: any): void { fixture.componentInstance.currentTplRef = value; }

    function detectChangesAndExpectText(text: string): void {
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement).toHaveText(text);
    }

    afterEach(() => { fixture = null; });

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [
          TestComponent,
          CaptureTplRefs,
        ],
        imports: [CommonModule],
      });
    });

    it('should do nothing if templateRef is null', async(() => {
         const template = `<template [ngTemplateOutlet]="null"></template>`;
         fixture = createTestComponent(template);

         detectChangesAndExpectText('');
       }));

    it('should insert content specified by TemplateRef', async(() => {
         const template =
             `<tpl-refs #refs="tplRefs"><template>foo</template></tpl-refs><template [ngTemplateOutlet]="currentTplRef"></template>`;
         fixture = createTestComponent(template);

         detectChangesAndExpectText('');

         const refs = fixture.debugElement.children[0].references['refs'];

         setTplRef(refs.tplRefs.first);
         detectChangesAndExpectText('foo');
       }));

    it('should clear content if TemplateRef becomes null', async(() => {
         const template =
             `<tpl-refs #refs="tplRefs"><template>foo</template></tpl-refs><template [ngTemplateOutlet]="currentTplRef"></template>`;
         fixture = createTestComponent(template);
         fixture.detectChanges();
         const refs = fixture.debugElement.children[0].references['refs'];

         setTplRef(refs.tplRefs.first);
         detectChangesAndExpectText('foo');

         setTplRef(null);
         detectChangesAndExpectText('');
       }));

    it('should swap content if TemplateRef changes', async(() => {
         const template =
             `<tpl-refs #refs="tplRefs"><template>foo</template><template>bar</template></tpl-refs><template [ngTemplateOutlet]="currentTplRef"></template>`;
         fixture = createTestComponent(template);

         fixture.detectChanges();
         const refs = fixture.debugElement.children[0].references['refs'];

         setTplRef(refs.tplRefs.first);
         detectChangesAndExpectText('foo');

         setTplRef(refs.tplRefs.last);
         detectChangesAndExpectText('bar');
       }));

    it('should display template if context is null', async(() => {
         const template =
             `<tpl-refs #refs="tplRefs"><template>foo</template></tpl-refs><template [ngTemplateOutlet]="currentTplRef" [ngOutletContext]="null"></template>`;
         fixture = createTestComponent(template);
         detectChangesAndExpectText('');

         const refs = fixture.debugElement.children[0].references['refs'];

         setTplRef(refs.tplRefs.first);
         detectChangesAndExpectText('foo');
       }));

    it('should reflect initial context and changes', async(() => {
         const template =
             `<tpl-refs #refs="tplRefs"><template let-foo="foo"><span>{{foo}}</span></template></tpl-refs><template [ngTemplateOutlet]="currentTplRef" [ngOutletContext]="context"></template>`;
         fixture = createTestComponent(template);

         fixture.detectChanges();

         const refs = fixture.debugElement.children[0].references['refs'];
         setTplRef(refs.tplRefs.first);

         detectChangesAndExpectText('bar');

         fixture.componentInstance.context.foo = 'alter-bar';

         detectChangesAndExpectText('alter-bar');
       }));

    it('should reflect user defined $implicit property in the context', async(() => {
         const template =
             `<tpl-refs #refs="tplRefs"><template let-ctx><span>{{ctx.foo}}</span></template></tpl-refs><template [ngTemplateOutlet]="currentTplRef" [ngOutletContext]="context"></template>`;
         fixture = createTestComponent(template);

         fixture.detectChanges();

         const refs = fixture.debugElement.children[0].references['refs'];
         setTplRef(refs.tplRefs.first);

         fixture.componentInstance.context = {$implicit: fixture.componentInstance.context};
         detectChangesAndExpectText('bar');
       }));

    it('should reflect context re-binding', async(() => {
         const template =
             `<tpl-refs #refs="tplRefs"><template let-shawshank="shawshank"><span>{{shawshank}}</span></template></tpl-refs><template [ngTemplateOutlet]="currentTplRef" [ngOutletContext]="context"></template>`;
         fixture = createTestComponent(template);

         fixture.detectChanges();

         const refs = fixture.debugElement.children[0].references['refs'];
         setTplRef(refs.tplRefs.first);
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