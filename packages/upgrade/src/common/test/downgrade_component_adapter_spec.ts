/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  Compiler,
  Component,
  ComponentFactory,
  Injector,
  NgModule,
  TestabilityRegistry,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';

import * as angular from '../src/angular1';
import {DowngradeComponentAdapter, groupNodesBySelector} from '../src/downgrade_component_adapter';

import {nodes, withEachNg1Version} from './helpers/common_test_helpers';

withEachNg1Version(() => {
  describe('DowngradeComponentAdapter', () => {
    describe('groupNodesBySelector', () => {
      it('should return an array of node collections for each selector', () => {
        const contentNodes = nodes(
          '<div class="x"><span>div-1 content</span></div>' +
            '<input type="number" name="myNum">' +
            '<input type="date" name="myDate">' +
            '<span>span content</span>' +
            '<div class="x"><span>div-2 content</span></div>',
        );

        const selectors = ['input[type=date]', 'span', '.x'];
        const projectableNodes = groupNodesBySelector(selectors, contentNodes);
        expect(projectableNodes[0]).toEqual(nodes('<input type="date" name="myDate">'));
        expect(projectableNodes[1]).toEqual(nodes('<span>span content</span>'));
        expect(projectableNodes[2]).toEqual(
          nodes(
            '<div class="x"><span>div-1 content</span></div>' +
              '<div class="x"><span>div-2 content</span></div>',
          ),
        );
      });

      it('should collect up unmatched nodes for the wildcard selector', () => {
        const contentNodes = nodes(
          '<div class="x"><span>div-1 content</span></div>' +
            '<input type="number" name="myNum">' +
            '<input type="date" name="myDate">' +
            '<span>span content</span>' +
            '<div class="x"><span>div-2 content</span></div>',
        );

        const selectors = ['.x', '*', 'input[type=date]'];
        const projectableNodes = groupNodesBySelector(selectors, contentNodes);

        expect(projectableNodes[0]).toEqual(
          nodes(
            '<div class="x"><span>div-1 content</span></div>' +
              '<div class="x"><span>div-2 content</span></div>',
          ),
        );
        expect(projectableNodes[1]).toEqual(
          nodes('<input type="number" name="myNum">' + '<span>span content</span>'),
        );
        expect(projectableNodes[2]).toEqual(nodes('<input type="date" name="myDate">'));
      });

      it('should return an array of empty arrays if there are no nodes passed in', () => {
        const selectors = ['.x', '*', 'input[type=date]'];
        const projectableNodes = groupNodesBySelector(selectors, []);
        expect(projectableNodes).toEqual([[], [], []]);
      });

      it('should return an empty array for each selector that does not match', () => {
        const contentNodes = nodes(
          '<div class="x"><span>div-1 content</span></div>' +
            '<input type="number" name="myNum">' +
            '<input type="date" name="myDate">' +
            '<span>span content</span>' +
            '<div class="x"><span>div-2 content</span></div>',
        );

        const projectableNodes = groupNodesBySelector([], contentNodes);
        expect(projectableNodes).toEqual([]);

        const noMatchSelectorNodes = groupNodesBySelector(['.not-there'], contentNodes);
        expect(noMatchSelectorNodes).toEqual([[]]);
      });
    });

    describe('testability', () => {
      let adapter: DowngradeComponentAdapter;
      let content: string;
      let compiler: Compiler;
      let registry: TestabilityRegistry;
      let element: angular.IAugmentedJQuery;

      class mockScope implements angular.IScope {
        private destroyListeners: (() => void)[] = [];

        $new() {
          return this;
        }
        $watch(exp: angular.Ng1Expression, fn?: (a1?: any, a2?: any) => void) {
          return () => {};
        }
        $on(event: string, fn?: (event?: any, ...args: any[]) => void) {
          if (event === '$destroy' && fn) {
            this.destroyListeners.push(fn);
          }
          return () => {};
        }
        $destroy() {
          let listener: (() => void) | undefined;
          while ((listener = this.destroyListeners.shift())) listener();
        }
        $apply(exp?: angular.Ng1Expression) {
          return () => {};
        }
        $digest() {
          return () => {};
        }
        $evalAsync(exp: angular.Ng1Expression, locals?: any) {
          return () => {};
        }
        $$childTail!: angular.IScope;
        $$childHead!: angular.IScope;
        $$nextSibling!: angular.IScope;
        [key: string]: any;
        $id = 'mockScope';
        $parent!: angular.IScope;
        $root!: angular.IScope;
        $$phase: any;
      }

      function getAdaptor(): DowngradeComponentAdapter {
        let attrs = undefined as any;
        let scope: angular.IScope; // mock
        let ngModel = undefined as any;
        let parentInjector: Injector; // testbed
        let $compile = undefined as any;
        let $parse = undefined as any;
        let componentFactory: ComponentFactory<any>; // testbed
        let wrapCallback = (cb: any) => cb;

        content = `
          <h1> new component </h1>
          <div> a great component </div>
          <comp></comp>
        `;
        element = angular.element(content);
        scope = new mockScope();

        @Component({
          selector: 'comp',
          template: '',
          standalone: false,
        })
        class NewComponent {}

        @NgModule({
          providers: [{provide: 'hello', useValue: 'component'}],
          declarations: [NewComponent],
        })
        class NewModule {}

        const modFactory = compiler.compileModuleSync(NewModule);
        const testBedInjector = TestBed.inject(Injector);
        const module = modFactory.create(testBedInjector);
        componentFactory = module.componentFactoryResolver.resolveComponentFactory(NewComponent)!;
        parentInjector = testBedInjector;

        return new DowngradeComponentAdapter(
          element,
          attrs,
          scope,
          ngModel,
          parentInjector,
          $compile,
          $parse,
          componentFactory,
          wrapCallback,
          /* unsafelyOverwriteSignalInputs */ false,
        );
      }

      beforeEach(() => {
        compiler = TestBed.inject(Compiler);
        registry = TestBed.inject(TestabilityRegistry);
        adapter = getAdaptor();
      });
      beforeEach(() => registry.unregisterAllApplications());
      afterEach(() => registry.unregisterAllApplications());

      it('should add testabilities hook when creating components', () => {
        let registry = TestBed.inject(TestabilityRegistry);
        adapter.createComponentAndSetup([]);
        expect(registry.getAllTestabilities().length).toEqual(1);

        adapter = getAdaptor(); // get a new adaptor to creat a new component
        adapter.createComponentAndSetup([]);
        expect(registry.getAllTestabilities().length).toEqual(2);
      });

      it('should remove the testability hook when destroy a component', () => {
        const registry = TestBed.inject(TestabilityRegistry);
        expect(registry.getAllTestabilities().length).toEqual(0);
        adapter.createComponentAndSetup([]);
        expect(registry.getAllTestabilities().length).toEqual(1);
        element.remove!();
        expect(registry.getAllTestabilities().length).toEqual(0);
      });
    });
  });
});
