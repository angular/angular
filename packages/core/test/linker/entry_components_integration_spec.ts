/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ANALYZE_FOR_ENTRY_COMPONENTS, Component, ComponentFactoryResolver, ɵivyEnabled as ivyEnabled} from '@angular/core';
import {Console} from '@angular/core/src/console';
import {noComponentFactoryError} from '@angular/core/src/linker/component_factory_resolver';
import {TestBed} from '@angular/core/testing';
import {obsoleteInIvy} from '@angular/private/testing';


if (ivyEnabled) {
  describe('ivy', () => {
    declareTests();
  });
} else {
  describe('jit', () => {
    declareTests({useJit: true});
  });
  describe('no jit', () => {
    declareTests({useJit: false});
  });
}

class DummyConsole implements Console {
  public warnings: string[] = [];

  log(message: string) {}
  warn(message: string) {
    this.warnings.push(message);
  }
}

function declareTests(config?: {useJit: boolean}) {
  describe('@Component.entryComponents', function() {
    let console: DummyConsole;
    beforeEach(() => {
      console = new DummyConsole();
      TestBed.configureCompiler({...config, providers: [{provide: Console, useValue: console}]});
      TestBed.configureTestingModule({declarations: [MainComp, ChildComp, NestedChildComp]});
    });

    it('should resolve ComponentFactories from the same component', () => {
      const compFixture = TestBed.createComponent(MainComp);
      const mainComp: MainComp = compFixture.componentInstance;
      expect(compFixture.componentRef.injector.get(ComponentFactoryResolver)).toBe(mainComp.cfr);
      const cf = mainComp.cfr.resolveComponentFactory(ChildComp)!;
      expect(cf.componentType).toBe(ChildComp);
    });

    it('should resolve ComponentFactories via ANALYZE_FOR_ENTRY_COMPONENTS', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule(
          {declarations: [CompWithAnalyzeEntryComponentsProvider, NestedChildComp, ChildComp]});
      const compFixture = TestBed.createComponent(CompWithAnalyzeEntryComponentsProvider);
      const mainComp: CompWithAnalyzeEntryComponentsProvider = compFixture.componentInstance;
      const cfr: ComponentFactoryResolver =
          compFixture.componentRef.injector.get(ComponentFactoryResolver);
      expect(cfr.resolveComponentFactory(ChildComp)!.componentType).toBe(ChildComp);
      expect(cfr.resolveComponentFactory(NestedChildComp)!.componentType).toBe(NestedChildComp);
    });

    it('should be able to get a component form a parent component (view hierarchy)', () => {
      TestBed.overrideComponent(MainComp, {set: {template: '<child></child>'}});

      const compFixture = TestBed.createComponent(MainComp);
      const childCompEl = compFixture.debugElement.children[0];
      const childComp: ChildComp = childCompEl.componentInstance;
      // declared on ChildComp directly
      expect(childComp.cfr.resolveComponentFactory(NestedChildComp)!.componentType)
          .toBe(NestedChildComp);
      // inherited from MainComp
      expect(childComp.cfr.resolveComponentFactory(ChildComp)!.componentType).toBe(ChildComp);
    });

    obsoleteInIvy('In Ivy, the ComponentFactoryResolver can resolve any component factory')
        .it('should not be able to get components from a parent component (content hierarchy)',
            () => {
              TestBed.overrideComponent(
                  MainComp, {set: {template: '<child><nested></nested></child>'}});
              TestBed.overrideComponent(ChildComp, {set: {template: '<ng-content></ng-content>'}});

              const compFixture = TestBed.createComponent(MainComp);
              const nestedChildCompEl = compFixture.debugElement.children[0].children[0];
              const nestedChildComp: NestedChildComp = nestedChildCompEl.componentInstance;
              expect(nestedChildComp.cfr.resolveComponentFactory(ChildComp)!.componentType)
                  .toBe(ChildComp);
              expect(() => nestedChildComp.cfr.resolveComponentFactory(NestedChildComp))
                  .toThrow(noComponentFactoryError(NestedChildComp));
            });
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
