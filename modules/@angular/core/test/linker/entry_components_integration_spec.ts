/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncTestCompleter, beforeEach, ddescribe, xdescribe, describe, expect, iit, inject, beforeEachProviders, it, xit,} from '@angular/core/testing/testing_internal';
import {TestComponentBuilder, configureModule, configureCompiler} from '@angular/core/testing';
import {Component, ComponentFactoryResolver, NoComponentFactoryError, forwardRef, ANALYZE_FOR_ENTRY_COMPONENTS, ViewMetadata} from '@angular/core';
import {stringify} from '../../src/facade/lang';
import {Console} from '../../src/console';

export function main() {
  describe('jit', () => { declareTests({useJit: true}); });
  describe('no jit', () => { declareTests({useJit: false}); });
}

class DummyConsole implements Console {
  public warnings: string[] = [];

  log(message: string) {}
  warn(message: string) { this.warnings.push(message); }
}

function declareTests({useJit}: {useJit: boolean}) {
  describe('@Component.entryComponents', function() {
    var console: DummyConsole;
    beforeEach(() => {
      console = new DummyConsole();
      configureCompiler({useJit: useJit, providers: [{provide: Console, useValue: console}]});
      configureModule({declarations: [MainComp, ChildComp, NestedChildComp]});
    });

    it('should warn and auto declare if the component was not declared nor imported by the module',
       inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         @Component({selector: 'child', template: ''})
         class ChildComp {
         }

         @Component({template: 'comp', entryComponents: [ChildComp]})
         class SomeComp {
         }

         const compFixture = tcb.createSync(SomeComp);
         const cf = compFixture.componentRef.injector.get(ComponentFactoryResolver)
                        .resolveComponentFactory(ChildComp);
         expect(cf.componentType).toBe(ChildComp);

         expect(console.warnings).toEqual([
           `Component ${stringify(SomeComp)} in NgModule DynamicTestModule uses ${stringify(ChildComp)} via "entryComponents" but it was neither declared nor imported into the module! This warning will become an error after final.`
         ]);
       }));


    it('should resolve ComponentFactories from the same component',
       inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         const compFixture = tcb.createSync(MainComp);
         let mainComp: MainComp = compFixture.componentInstance;
         expect(compFixture.componentRef.injector.get(ComponentFactoryResolver)).toBe(mainComp.cfr);
         var cf = mainComp.cfr.resolveComponentFactory(ChildComp);
         expect(cf.componentType).toBe(ChildComp);
       }));


    it('should resolve ComponentFactories via ANALYZE_FOR_ENTRY_COMPONENTS',
       inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         let compFixture = tcb.createSync(CompWithAnalyzeEntryComponentsProvider);
         let mainComp: CompWithAnalyzeEntryComponentsProvider = compFixture.componentInstance;
         let cfr: ComponentFactoryResolver =
             compFixture.componentRef.injector.get(ComponentFactoryResolver);
         expect(cfr.resolveComponentFactory(ChildComp).componentType).toBe(ChildComp);
         expect(cfr.resolveComponentFactory(NestedChildComp).componentType).toBe(NestedChildComp);
       }));

    it('should be able to get a component form a parent component (view hiearchy)',
       inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         const compFixture =
             tcb.overrideView(
                    MainComp,
                    new ViewMetadata({template: '<child></child>', directives: [ChildComp]}))
                 .createSync(MainComp);
         let childCompEl = compFixture.debugElement.children[0];
         let childComp: ChildComp = childCompEl.componentInstance;
         // declared on ChildComp directly
         expect(childComp.cfr.resolveComponentFactory(NestedChildComp).componentType)
             .toBe(NestedChildComp);
         // inherited from MainComp
         expect(childComp.cfr.resolveComponentFactory(ChildComp).componentType).toBe(ChildComp);
       }));

    it('should not be able to get components from a parent component (content hierarchy)',
       inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         const compFixture = tcb.overrideView(MainComp, new ViewMetadata({
                                                template: '<child><nested></nested></child>',
                                                directives: [ChildComp, NestedChildComp]
                                              }))
                                 .overrideTemplate(ChildComp, '<ng-content></ng-content>')
                                 .createSync(MainComp);
         let nestedChildCompEl = compFixture.debugElement.children[0].children[0];
         let nestedChildComp: NestedChildComp = nestedChildCompEl.componentInstance;
         expect(nestedChildComp.cfr.resolveComponentFactory(ChildComp).componentType)
             .toBe(ChildComp);
         expect(() => nestedChildComp.cfr.resolveComponentFactory(NestedChildComp))
             .toThrow(new NoComponentFactoryError(NestedChildComp));
       }));

  });
}

@Component({selector: 'nested', template: ''})
class NestedChildComp {
  constructor(public cfr: ComponentFactoryResolver) {}
}

@Component({selector: 'child', entryComponents: [NestedChildComp], template: ''})
class ChildComp {
  constructor(public cfr: ComponentFactoryResolver) {}
}

@Component({
  selector: 'main',
  entryComponents: [ChildComp],
  template: '',
})
class MainComp {
  constructor(public cfr: ComponentFactoryResolver) {}
}

@Component({
  selector: 'comp-with-analyze',
  template: '',
  providers: [{
    provide: ANALYZE_FOR_ENTRY_COMPONENTS,
    multi: true,
    useValue: [
      {a: 'b', component: ChildComp},
      {b: 'c', anotherComponent: NestedChildComp},
    ]
  }]
})
class CompWithAnalyzeEntryComponentsProvider {
}
