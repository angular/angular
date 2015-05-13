import {
  afterEach,
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  dispatchEvent,
  el,
  expect,
  iit,
  inject,
  it,
  xit
} from 'angular2/test_lib';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {Injector, bind} from 'angular2/di';
import {ViewProxy} from 'angular2/src/test_lib/test_bed';
import {Component} from 'angular2/src/core/annotations_impl/annotations';
import {View} from 'angular2/src/core/annotations_impl/view';
import {DynamicComponentLoader, ComponentRef} from 'angular2/src/core/compiler/dynamic_component_loader';
import {DOCUMENT_TOKEN} from 'angular2/src/render/dom/dom_renderer';

import {Testability} from 'angular2/src/core/testability/testability';


@Component({
  selector: 'test-component'
})
@View({
  template: `<div>
               <span id='span1'>{{aaa}} and {{bbb}}</span>
               <span id='span2' [title]="ccc">I have a title</span>
               <div id='container'>
                 <span id='nestedspan'>{{aa}}</span>
               </div>
               <nested-component></nested-component>
             </div>`,
  directives: [NestedComponent]
})
class TestComponent {
  aa: String;
  aaa: String;
  bbb: String;
  ccc: String;

  constructor() {
    this.aa = 'AA';
    this.aaa = 'AAA';
    this.bbb = 'BBB';
    this.ccc = 'CCC';
  }
}


@Component({
  selector: 'nested-component',
})
@View({
  template: `<div>
              <span id='childspan'>{{qux}}</span>
            </div>`
})
class NestedComponent {
  qux;

  constructor() {
    this.qux = 'Qux';
  }
}

export function main() {
  describe('Testability', () => {
    var executed;

    beforeEach(() => {
      executed = false;
    });

    function initTestComponent(loader, injector) {
      var doc = injector.get(DOCUMENT_TOKEN);
      var rootEl = el('<div id="root"></div>');
      DOM.appendChild(doc.body, rootEl);

      var componentBinding = bind(TestComponent).toValue(new TestComponent());

      return loader.loadIntoNewLocation(componentBinding, null, '#root', injector)
    }

    describe('find bindings', () => {
      it('should find interpolated text bindings',
        inject([DynamicComponentLoader, Injector, AsyncTestCompleter], (loader, injector, async) => {
          // We cannot use TestBed directly, because we need to get a hold of the hostComponentRef below
          // to instantiate Testability.
          initTestComponent(loader, injector).then((hostComponentRef) => {
            var testability = new Testability(hostComponentRef);
            var view = new ViewProxy(hostComponentRef);
            var span1 = view.querySelector('#span1');
            expect(testability.findBindings(view.rootNodes[0], 'aaa', true)).toEqual([span1]);
            expect(testability.findBindings(view.rootNodes[0], 'bbb', true)).toEqual([span1]);
            async.done();
          });
      }));

      it('should find attribute bindings',
        inject([DynamicComponentLoader, Injector, AsyncTestCompleter], (loader, injector, async) => {
          initTestComponent(loader, injector).then((hostComponentRef) => {
            var testability = new Testability(hostComponentRef);
            var view = new ViewProxy(hostComponentRef);
            var span2 = view.querySelector('#span2');
            expect(testability.findBindings(view.rootNodes[0], 'ccc', true)).toEqual([span2]);
            async.done();
          });
      }));


      it('should find partial matches',
        inject([DynamicComponentLoader, Injector, AsyncTestCompleter], (loader, injector, async) => {
          initTestComponent(loader, injector).then((hostComponentRef) => {
            var testability = new Testability(hostComponentRef);
            var view = new ViewProxy(hostComponentRef);
            var span1 = view.querySelector('#span1');
            var nestedspan = view.querySelector('#nestedspan');
            expect(testability.findBindings(view.rootNodes[0], 'a', false)).toEqual([span1, nestedspan]);
            async.done();
          });
      }));

      it('should find bindings from child components',
        inject([DynamicComponentLoader, Injector, AsyncTestCompleter], (loader, injector, async) => {
          initTestComponent(loader, injector).then((hostComponentRef) => {
            var testability = new Testability(hostComponentRef);
            var view = new ViewProxy(hostComponentRef);
            var childspan = view.querySelector('#childspan');
            expect(testability.findBindings(view.rootNodes[0], 'qux', false)).toEqual([childspan]);
            async.done();
          });
      }));

      it('should limit search to children of the root',
        inject([DynamicComponentLoader, Injector, AsyncTestCompleter], (loader, injector, async) => {
          initTestComponent(loader, injector).then((hostComponentRef) => {
            var testability = new Testability(hostComponentRef);
            var view = new ViewProxy(hostComponentRef);
            var nestedspan = view.querySelector('#nestedspan');
            var container = view.querySelector('#container');
            expect(testability.findBindings(container, 'a', false)).toEqual([nestedspan]);
            async.done();
          });
      }));
    });

    it('should start with a pending count of 0',
      inject([DynamicComponentLoader, Injector, AsyncTestCompleter], (loader, injector, async) => {
        initTestComponent(loader, injector).then((hostComponentRef) => {
          var testability = new Testability(hostComponentRef);
          expect(testability.getPendingCount()).toEqual(0);
          async.done();
        });
    }));


    it('should fire whenstable callbacks if pending count is 0',
      inject([DynamicComponentLoader, Injector, AsyncTestCompleter], (loader, injector, async) => {
        initTestComponent(loader, injector).then((hostComponentRef) => {
          var testability = new Testability(hostComponentRef);
          testability.whenStable(() => executed = true);
          expect(executed).toBe(true);
          async.done();
        });
    }));

    it('should not call whenstable callbacks when there are pending counts',
      inject([DynamicComponentLoader, Injector, AsyncTestCompleter], (loader, injector, async) => {
        initTestComponent(loader, injector).then((hostComponentRef) => {
          var testability = new Testability(hostComponentRef);
          testability.increaseCount(2);
          testability.whenStable(() => executed = true);

          expect(executed).toBe(false);
          testability.increaseCount(-1);
          expect(executed).toBe(false);
          async.done();
        });
    }));

    it('should not call whenstable callbacks when there are pending counts',
      inject([DynamicComponentLoader, Injector, AsyncTestCompleter], (loader, injector, async) => {
        initTestComponent(loader, injector).then((hostComponentRef) => {
          var testability = new Testability(hostComponentRef);
          testability.increaseCount(2);
          testability.whenStable(() => executed = true);

          expect(executed).toBe(false);

          testability.increaseCount(-2);
          expect(executed).toBe(true);
          async.done();
        });
    }));
  });
}
