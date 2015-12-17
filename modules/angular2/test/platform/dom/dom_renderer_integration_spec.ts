import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
  beforeEachProviders,
  SpyObject,
  TestComponentBuilder,
} from 'angular2/testing_internal';

import {Component, ViewMetadata} from 'angular2/src/core/metadata';

import {DOM} from 'angular2/src/platform/dom/dom_adapter';

export function main() {
  describe('DomRenderer integration', () => {

    describe('attributes', () => {

      it('should support attributes with namespace',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyCmp, new ViewMetadata({template: '<svg:use xlink:href="#id" />'}))
               .createAsync(MyCmp)
               .then((fixture) => {
                 let useEl = DOM.firstChild(fixture.debugElement.nativeElement);
                 expect(DOM.getAttributeNS(useEl, 'http://www.w3.org/1999/xlink', 'href'))
                     .toEqual('#id');
                 async.done();
               });
         }));

      it('should support binding to attributes with namespace',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyCmp,
                            new ViewMetadata({template: '<svg:use [attr.xlink:href]="value" />'}))
               .createAsync(MyCmp)
               .then((fixture) => {
                 let cmp = fixture.debugElement.componentInstance;
                 let useEl = DOM.firstChild(fixture.debugElement.nativeElement);

                 cmp.value = "#id";
                 fixture.detectChanges();

                 expect(DOM.getAttributeNS(useEl, 'http://www.w3.org/1999/xlink', 'href'))
                     .toEqual('#id');

                 async.done();
               });
         }));

    });

  });
}

@Component({selector: 'my-cmp', inputs: ['value']})
class MyCmp {
  value: any;
}
