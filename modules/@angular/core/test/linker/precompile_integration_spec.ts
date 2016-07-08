/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {beforeEach, ddescribe, xdescribe, describe, expect, iit, inject, beforeEachProviders, it, xit,} from '@angular/core/testing/testing_internal';
import {TestComponentBuilder} from '@angular/core/testing';
import {AsyncTestCompleter} from '@angular/core/testing/testing_internal';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {Component, ViewChild, ViewContainerRef, ComponentFactoryResolver, NoComponentFactoryError, ComponentRef, forwardRef, ANALYZE_FOR_PRECOMPILE} from '@angular/core';
import {CompilerConfig} from '@angular/compiler';

export function main() {
  describe('jit', () => { declareTests({useJit: true}); });
  describe('no jit', () => { declareTests({useJit: false}); });
}

function declareTests({useJit}: {useJit: boolean}) {
  describe('@Component.precompile', function() {
    it('should resolve ComponentFactories from the same component',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             tcb.createAsync(MainComp).then((compFixture) => {
               let mainComp: MainComp = compFixture.componentInstance;
               expect(compFixture.debugElement.injector.get(ComponentFactoryResolver))
                   .toBe(mainComp.cfr);
               var cf = mainComp.cfr.resolveComponentFactory(ChildComp);
               expect(cf.componentType).toBe(ChildComp);
               async.done();
             });
           }));


    it('should resolve ComponentFactories via ANALYZE_FOR_PRECOMPILE',
       inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         let compFixture = tcb.createSync(CompWithAnalyzePrecompileProvider);
         let mainComp: CompWithAnalyzePrecompileProvider = compFixture.componentInstance;
         let cfr: ComponentFactoryResolver =
             compFixture.debugElement.injector.get(ComponentFactoryResolver);
         expect(cfr.resolveComponentFactory(ChildComp).componentType).toBe(ChildComp);
         expect(cfr.resolveComponentFactory(NestedChildComp).componentType).toBe(NestedChildComp);
       }));

    it('should be able to get a component form a parent component (view hiearchy)',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             tcb.overrideTemplate(MainComp, '<child></child>')
                 .createAsync(MainComp)
                 .then((compFixture) => {
                   let childCompEl = compFixture.debugElement.children[0];
                   let childComp: ChildComp = childCompEl.componentInstance;
                   // declared on ChildComp directly
                   expect(childComp.cfr.resolveComponentFactory(NestedChildComp).componentType)
                       .toBe(NestedChildComp);
                   // inherited from MainComp
                   expect(childComp.cfr.resolveComponentFactory(ChildComp).componentType)
                       .toBe(ChildComp);
                   async.done();
                 });
           }));

    it('should not be able to get components from a parent component (content hierarchy)',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             tcb.overrideTemplate(MainComp, '<child><nested></nested></child>')
                 .overrideTemplate(ChildComp, '<ng-content></ng-content>')
                 .createAsync(MainComp)
                 .then((compFixture) => {
                   let nestedChildCompEl = compFixture.debugElement.children[0].children[0];
                   let nestedChildComp: NestedChildComp = nestedChildCompEl.componentInstance;
                   expect(nestedChildComp.cfr.resolveComponentFactory(ChildComp).componentType)
                       .toBe(ChildComp);
                   expect(() => nestedChildComp.cfr.resolveComponentFactory(NestedChildComp))
                       .toThrow(new NoComponentFactoryError(NestedChildComp));
                   async.done();
                 });
           }));

  });
}

var DIRECTIVES: any[] = [
  forwardRef(() => NestedChildComp),
  forwardRef(() => ChildComp),
  forwardRef(() => MainComp),
];

@Component({selector: 'nested', directives: DIRECTIVES, template: ''})
class NestedChildComp {
  constructor(public cfr: ComponentFactoryResolver) {}
}

@Component({selector: 'child', precompile: [NestedChildComp], directives: DIRECTIVES, template: ''})
class ChildComp {
  constructor(public cfr: ComponentFactoryResolver) {}
}

@Component({
  selector: 'main',
  precompile: [ChildComp],
  directives: DIRECTIVES,
  template: '',
})
class MainComp {
  constructor(public cfr: ComponentFactoryResolver) {}
}

@Component({
  selector: 'comp-with-analyze',
  template: '',
  providers: [{
    provide: ANALYZE_FOR_PRECOMPILE,
    multi: true,
    useValue: [
      {a: 'b', component: ChildComp},
      {b: 'c', anotherComponent: NestedChildComp},
    ]
  }]
})
class CompWithAnalyzePrecompileProvider {
}
