import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  dispatchEvent,
  expect,
  iit,
  inject,
  beforeEachProviders,
  it,
  xit,
  TestComponentBuilder,
} from 'angular2/testing_internal';
import {global} from 'angular2/src/facade/lang';
import {APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/linker/view_pool';
import {provide, Component, Directive, Injectable, View} from 'angular2/core';
import {inspectNativeElement} from 'angular2/platform/browser';
import {IS_DART} from 'angular2/src/facade/lang';

@Component({selector: 'my-comp'})
@View({directives: []})
@Injectable()
class MyComp {
  ctxProp: string;
}

export function main() {
  describe('element probe', function() {
    beforeEachProviders(() => [provide(APP_VIEW_POOL_CAPACITY, {useValue: 0})]);

    it('should return a TestElement from a dom element',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideTemplate(MyComp, '<div some-dir></div>')
             .createAsync(MyComp)
             .then((componentFixture) => {
               expect(inspectNativeElement(componentFixture.debugElement.nativeElement)
                          .componentInstance)
                   .toBeAnInstanceOf(MyComp);

               async.done();
             });
       }));

    it('should clean up whent the view is destroyed',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideTemplate(MyComp, '')
             .createAsync(MyComp)
             .then((componentFixture) => {
               componentFixture.destroy();
               expect(inspectNativeElement(componentFixture.debugElement.nativeElement)).toBe(null);

               async.done();
             });

       }));

    if (!IS_DART) {
      it('should provide a global function to inspect elements',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideTemplate(MyComp, '')
               .createAsync(MyComp)
               .then((componentFixture) => {
                 expect(global['ng']['probe'](componentFixture.debugElement.nativeElement)
                            .componentInstance)
                     .toBeAnInstanceOf(MyComp);

                 async.done();
               });
         }), 10000);
    }
  });
}
