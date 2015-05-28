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
  IS_DARTIUM,
  beforeEachBindings,
  it,
  xit,
  TestComponentBuilder,
  By,
  Scope,
  inspectDomElement
} from 'angular2/test_lib';

import {global} from 'angular2/src/facade/lang';
import {APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/compiler/view_pool';

import {Injectable, bind} from 'angular2/di';

import {
  Directive,
  Component,
  View,
} from 'angular2/annotations';

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
               expect(inspectDomElement(rootTestComponent.domElement).componentInstance)
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
               expect(inspectDomElement(rootTestComponent.domElement)).toBe(null);

               async.done();
             });

       }));

    if (!IS_DARTIUM) {
      it('should provide a global function to inspect elements',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {
           tcb.overrideTemplate(MyComp, '')
               .createAsync(MyComp)
               .then((rootTestComponent) => {
                 expect(global['ngProbe'](rootTestComponent.domElement).componentInstance)
                     .toBeAnInstanceOf(MyComp);

                 async.done();
               });
         }));
    }
  });
}
