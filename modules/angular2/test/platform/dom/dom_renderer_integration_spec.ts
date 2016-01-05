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
  TestComponentBuilder,
} from 'angular2/testing_internal';

import {Component, ViewMetadata} from 'angular2/src/core/metadata';

import {DOM} from 'angular2/src/platform/dom/dom_adapter';

export function main() {
  describe('DomRenderer integration', () => {

    describe('attribute', () => {

      it('should handle boolean attributes',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MyCmp, new ViewMetadata({template: '<p [attr.myattr]="value"></p>'}))
               .createAsync(MyCmp)
               .then((fixture) => {
                 let cmp = fixture.debugElement.componentInstance;
                 let pEl = DOM.firstChild(fixture.debugElement.nativeElement);

                 cmp.value = "some string";
                 fixture.detectChanges();
                 expect(DOM.getAttribute(pEl, 'myattr')).toEqual('some string');

                 cmp.value = true;
                 fixture.detectChanges();
                 expect(DOM.hasAttribute(pEl, 'myattr')).toEqual(true);
                 expect(DOM.getAttribute(pEl, 'myattr')).toEqual('');

                 cmp.value = false;
                 fixture.detectChanges();
                 expect(DOM.hasAttribute(pEl, 'myattr')).toEqual(false);

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
