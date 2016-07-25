/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import './init';

import {MainModule} from '../src/module';
import {CompUsingLibModuleDirectiveAndPipe, CompUsingRootModuleDirectiveAndPipe, SOME_TOKEN, ServiceUsingLibModule, SomeLibModule, SomeService} from '../src/module_fixtures';

import {createComponent, createModule} from './util';

describe('NgModule', () => {
  it('should support providers', () => {
    const moduleRef = createModule();
    expect(moduleRef.instance instanceof MainModule).toBe(true);
    expect(moduleRef.injector.get(MainModule) instanceof MainModule).toBe(true);
    expect(moduleRef.injector.get(SomeService) instanceof SomeService).toBe(true);
  });

  it('should support entryComponents components', () => {
    const moduleRef = createModule();
    const cf = moduleRef.componentFactoryResolver.resolveComponentFactory(
        CompUsingRootModuleDirectiveAndPipe);
    expect(cf.componentType).toBe(CompUsingRootModuleDirectiveAndPipe);
    const compRef = cf.create(moduleRef.injector);
    expect(compRef.instance instanceof CompUsingRootModuleDirectiveAndPipe).toBe(true);
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

  it('should support module directives and pipes', () => {
    const compFixture = createComponent(CompUsingRootModuleDirectiveAndPipe);
    compFixture.detectChanges();

    const debugElement = compFixture.debugElement;
    expect(debugElement.children[0].properties['title']).toBe('transformed someValue');
  });

  it('should support module directives and pipes on lib modules', () => {
    const compFixture = createComponent(CompUsingLibModuleDirectiveAndPipe);
    compFixture.detectChanges();

    const debugElement = compFixture.debugElement;
    expect(debugElement.children[0].properties['title']).toBe('transformed someValue');

    expect(debugElement.injector.get(SomeLibModule) instanceof SomeLibModule).toBe(true);
    expect(debugElement.injector.get(ServiceUsingLibModule) instanceof ServiceUsingLibModule)
        .toBe(true);
  });
});
