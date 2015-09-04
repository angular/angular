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
  beforeEachBindings,
  it,
  xit,
  TestComponentBuilder,
} from 'angular2/test_lib';
import {global} from 'angular2/src/core/facade/lang';
import {APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/compiler/view_pool';
import {bind, Component, Directive, Injectable, View} from 'angular2/core';
import {inspectNativeElement} from 'angular2/src/core/debug';
import {IS_DART} from '../../platform';

@Component({selector: 'my-comp'})
@View({directives: []})
@Injectable()
class MyComp {
  ctxProp: string;
}

export function main() {
  describe('element probe', function() {
    beforeEachBindings(() => [bind(APP_VIEW_POOL_CAPACITY).toValue(0)]);

    it('should return a TestElement from a dom element',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {
         tcb.overrideTemplate(MyComp, '<div some-dir></div>')
             .createAsync(MyComp)
             .then((rootTestComponent) => {
               expect(inspectNativeElement(rootTestComponent.nativeElement).componentInstance)
                   .toBeAnInstanceOf(MyComp);

               async.done();
             });
       }));

    it('should clean up whent the view is destroyed',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {
         tcb.overrideTemplate(MyComp, '')
             .createAsync(MyComp)
             .then((rootTestComponent) => {
               rootTestComponent.destroy();
               expect(inspectNativeElement(rootTestComponent.nativeElement)).toBe(null);

               async.done();
             });

       }));

    if (!IS_DART) {
      it('should provide a global function to inspect elements',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {
           tcb.overrideTemplate(MyComp, '')
               .createAsync(MyComp)
               .then((rootTestComponent) => {
                 expect(global['ng']['probe'](rootTestComponent.nativeElement).componentInstance)
                     .toBeAnInstanceOf(MyComp);

                 async.done();
               });
         }));
    }
  });
}
