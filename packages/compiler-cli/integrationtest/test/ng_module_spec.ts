/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import './init';

import {ComponentUsingThirdParty} from '../src/comp_using_3rdp';
import {ComponentUsingFlatModule} from '../src/comp_using_flat_module';
import {MainModule} from '../src/module';
import {CompUsingLibModuleDirectiveAndPipe, CompUsingRootModuleDirectiveAndPipe, ServiceUsingLibModule, SOME_TOKEN, SomeLibModule, SomeService} from '../src/module_fixtures';

import {createComponent, createModule} from './util';

describe('NgModule', () => {
  it('should support providers', () => {
    const moduleRef = createModule();
    expect(moduleRef.instance instanceof MainModule).toEqual(true);
    expect(moduleRef.injector.get(MainModule) instanceof MainModule).toEqual(true);
    expect(moduleRef.injector.get(SomeService) instanceof SomeService).toEqual(true);
  });

  it('should support entryComponents components', () => {
    const moduleRef = createModule();
    const cf = moduleRef.componentFactoryResolver.resolveComponentFactory(
        CompUsingRootModuleDirectiveAndPipe);
    expect(cf.componentType).toBe(CompUsingRootModuleDirectiveAndPipe);
    const compRef = cf.create(moduleRef.injector);
    expect(compRef.instance instanceof CompUsingRootModuleDirectiveAndPipe).toEqual(true);
  });

  it('should support entryComponents via the ANALYZE_FOR_ENTRY_COMPONENTS provider and function providers in components',
     () => {
       const moduleRef = createModule();
       const cf = moduleRef.componentFactoryResolver.resolveComponentFactory(
           CompUsingRootModuleDirectiveAndPipe);
       expect(cf.componentType).toBe(CompUsingRootModuleDirectiveAndPipe);
       // check that the function call that created the provider for ANALYZE_FOR_ENTRY_COMPONENTS
       // worked.
       expect(moduleRef.injector.get(SOME_TOKEN)).toEqual([
         {a: 'b', component: CompUsingLibModuleDirectiveAndPipe}
       ]);
     });

  describe('flat modules', () => {
    it('should support flat module entryComponents components', () => {
      // https://github.com/angular/angular/issues/15221
      const fixture = createComponent(ComponentUsingFlatModule);
      const bundleComp = fixture.nativeElement.children;
      expect(bundleComp[0].children[0].textContent).toEqual('flat module component');
    });
  });

  describe('third-party modules', () => {
    // https://github.com/angular/angular/issues/11889
    it('should support third party entryComponents components', () => {
      const fixture = createComponent(ComponentUsingThirdParty);
      const thirdPComps = fixture.nativeElement.children;
      expect(thirdPComps[0].children[0].textContent).toEqual('3rdP-component');
      expect(thirdPComps[1].children[0].textContent).toEqual(`other-3rdP-component
multi-lines`);
    });

    // https://github.com/angular/angular/issues/12428
    it('should support third party directives', () => {
      const fixture = createComponent(ComponentUsingThirdParty);
      const debugElement = fixture.debugElement;
      fixture.detectChanges();
      expect(debugElement.children[0].properties['title']).toEqual('from 3rd party');
    });
  });

  it('should support module directives and pipes', () => {
    const compFixture = createComponent(CompUsingRootModuleDirectiveAndPipe);
    compFixture.detectChanges();

    const debugElement = compFixture.debugElement;
    expect(debugElement.children[0].properties['title']).toEqual('transformed someValue');
  });

  it('should support module directives and pipes on lib modules', () => {
    const compFixture = createComponent(CompUsingLibModuleDirectiveAndPipe);
    compFixture.detectChanges();

    const debugElement = compFixture.debugElement;
    expect(debugElement.children[0].properties['title']).toEqual('transformed someValue');

    expect(debugElement.injector.get(SomeLibModule) instanceof SomeLibModule).toEqual(true);
    expect(debugElement.injector.get(ServiceUsingLibModule) instanceof ServiceUsingLibModule)
        .toEqual(true);
  });
});
