/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactoryResolver, DebugElement, ReflectiveInjector, getDebugNode, lockRunMode} from '@angular/core';
import {BROWSER_APP_PROVIDERS, By} from '@angular/platform-browser';
import {serverPlatform} from '@angular/platform-server';

import {NestedModule, NestedService, ParentComp, SomeComp, SomeModule, SomeService} from '../src/app_module';
import {SomeModuleNgFactory, SomeModuleUsingParentCompNgFactory} from '../src/app_module.ngfactory';


// Need to lock the mode explicitely as this test is not using Angular's testing framework.
lockRunMode();

describe('AppModule', () => {
  it('should support providers', () => {
    var moduleRef = SomeModuleNgFactory.create();
    expect(moduleRef.instance instanceof SomeModule).toBe(true);
    expect(moduleRef.injector.get(SomeModule) instanceof SomeModule).toBe(true);
    expect(moduleRef.injector.get(SomeService) instanceof SomeService).toBe(true);
  });

  it('should support precompile components', () => {
    const appInjector =
        ReflectiveInjector.resolveAndCreate(BROWSER_APP_PROVIDERS, serverPlatform().injector);
    var moduleRef = SomeModuleNgFactory.create(appInjector);
    var cf = moduleRef.injector.get(ComponentFactoryResolver).resolveComponentFactory(SomeComp);
    expect(cf.componentType).toBe(SomeComp);
    var comp = cf.create(moduleRef.injector);
  });

  it('should support module directives and pipes', () => {
    const appInjector =
        ReflectiveInjector.resolveAndCreate(BROWSER_APP_PROVIDERS, serverPlatform().injector);
    var moduleRef = SomeModuleNgFactory.create(appInjector);
    var cf = moduleRef.injector.get(ComponentFactoryResolver).resolveComponentFactory(SomeComp);
    var comp = cf.create(moduleRef.injector);
    var debugElement = <DebugElement>getDebugNode(comp.location.nativeElement);

    // NgIf should work, is being used as module directive
    expect(debugElement.children.length).toBe(1);
    comp.changeDetectorRef.detectChanges();
    expect(debugElement.children.length).toBe(2);
    expect(debugElement.children[0].properties['title']).toBe('hello');
  });

  it('should support module directives and pipes on nested components', () => {
    const appInjector =
        ReflectiveInjector.resolveAndCreate(BROWSER_APP_PROVIDERS, serverPlatform().injector);
    var moduleRef = SomeModuleUsingParentCompNgFactory.create(appInjector);
    var cf = moduleRef.injector.get(ComponentFactoryResolver).resolveComponentFactory(ParentComp);
    var comp = cf.create(moduleRef.injector);
    var debugElement = <DebugElement>getDebugNode(comp.location.nativeElement);

    debugElement = debugElement.children[0];
    // NgIf should work, is being used as module directive
    expect(debugElement.children.length).toBe(1);
    comp.changeDetectorRef.detectChanges();
    expect(debugElement.children.length).toBe(2);
    expect(debugElement.children[0].properties['title']).toBe('hello');
  });

  it('should support child moduless', () => {
    var moduleRef = SomeModuleNgFactory.create();
    expect(moduleRef.instance instanceof SomeModule).toBe(true);
    expect(moduleRef.injector.get(NestedModule) instanceof NestedModule).toBe(true);
    expect(moduleRef.injector.get(NestedService) instanceof NestedService).toBe(true);
  });

});
