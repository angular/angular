import {
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit,
} from '@angular/core/testing/testing_internal';
import {TestComponentBuilder, ComponentFixture} from '@angular/compiler/testing';
import {AsyncTestCompleter} from '@angular/core/testing/testing_internal';
import {Component, Directive, TemplateRef, ContentChildren, QueryList} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';

export function main() {
  describe('insert', () => {
    it('should do nothing if templateRef is null',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
         var template = `<template [ngTemplateOutlet]="null"></template>`;
         tcb.overrideTemplate(TestComponent, template)
             .createAsync(TestComponent)
             .then((fixture) => {

               fixture.detectChanges();
               expect(fixture.nativeElement).toHaveText('');

               async.done();
             });
       }));

    it('should insert content specified by TemplateRef',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
         var template =
             `<tpl-refs #refs="tplRefs"><template>foo</template></tpl-refs><template [ngTemplateOutlet]="currentTplRef"></template>`;
         tcb.overrideTemplate(TestComponent, template)
             .createAsync(TestComponent)
             .then((fixture) => {

               fixture.detectChanges();
               expect(fixture.nativeElement).toHaveText('');

               var refs = fixture.debugElement.children[0].references['refs'];

               fixture.componentInstance.currentTplRef = refs.tplRefs.first;
               fixture.detectChanges();
               expect(fixture.nativeElement).toHaveText('foo');

               async.done();
             });
       }));

    it('should clear content if TemplateRef becomes null',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
         var template =
             `<tpl-refs #refs="tplRefs"><template>foo</template></tpl-refs><template [ngTemplateOutlet]="currentTplRef"></template>`;
         tcb.overrideTemplate(TestComponent, template)
             .createAsync(TestComponent)
             .then((fixture) => {

               fixture.detectChanges();
               var refs = fixture.debugElement.children[0].references['refs'];

               fixture.componentInstance.currentTplRef = refs.tplRefs.first;
               fixture.detectChanges();
               expect(fixture.nativeElement).toHaveText('foo');

               fixture.componentInstance.currentTplRef = null;
               fixture.detectChanges();
               expect(fixture.nativeElement).toHaveText('');

               async.done();
             });
       }));

    it('should swap content if TemplateRef changes',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
         var template = `<tpl-refs #refs="tplRefs"><template>foo</template><template>bar</template></tpl-refs><template [ngTemplateOutlet]="currentTplRef"></template>`;
         tcb.overrideTemplate(TestComponent, template)
             .createAsync(TestComponent)
             .then((fixture) => {

               fixture.detectChanges();
               var refs = fixture.debugElement.children[0].references['refs'];

               fixture.componentInstance.currentTplRef = refs.tplRefs.first;
               fixture.detectChanges();
               expect(fixture.nativeElement).toHaveText('foo');

               fixture.componentInstance.currentTplRef = refs.tplRefs.last;
               fixture.detectChanges();
               expect(fixture.nativeElement).toHaveText('bar');

               async.done();
             });
       }));

  });
}


@Directive({selector: 'tpl-refs', exportAs: 'tplRefs'})
class CaptureTplRefs {
  @ContentChildren(TemplateRef) tplRefs: QueryList<TemplateRef<any>>;
}

@Component({selector: 'test-cmp', directives: [NgTemplateOutlet, CaptureTplRefs], template: ''})
class TestComponent {
  currentTplRef: TemplateRef<any>;
}
