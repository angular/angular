/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import './init';
import {NestedModule, NestedService, ParentComp, SomeComp, SomeModule, SomeService} from '../src/module_fixtures';
import {SomeModuleNgFactory, SomeModuleUsingParentCompNgFactory} from '../src/module_fixtures.ngfactory';
import {createComponent, createModule} from './util';

describe('AppModule', () => {
  it('should support providers', () => {
    var moduleRef = createModule(SomeModuleNgFactory);
    expect(moduleRef.instance instanceof SomeModule).toBe(true);
    expect(moduleRef.injector.get(SomeModule) instanceof SomeModule).toBe(true);
    expect(moduleRef.injector.get(SomeService) instanceof SomeService).toBe(true);
  });

  it('should support precompile components', () => {
    var moduleRef = createModule(SomeModuleNgFactory);
    var cf = moduleRef.componentFactoryResolver.resolveComponentFactory(SomeComp);
    expect(cf.componentType).toBe(SomeComp);
    var compRef = cf.create(moduleRef.injector);
    expect(compRef.instance instanceof SomeComp).toBe(true);
  });

  it('should support module directives and pipes', () => {
    var compFixture = createComponent(SomeComp, SomeModuleNgFactory);
    var debugElement = compFixture.debugElement;

    // NgIf should work, is being used as module directive
    expect(debugElement.children.length).toBe(1);
    compFixture.detectChanges();
    expect(debugElement.children.length).toBe(2);
    expect(debugElement.children[0].properties['title']).toBe('hello');
  });

  it('should support module directives and pipes on nested components', () => {
    var compFixture = createComponent(ParentComp, SomeModuleUsingParentCompNgFactory);
    var debugElement = compFixture.debugElement;

    debugElement = debugElement.children[0];
    // NgIf should work, is being used as module directive
    expect(debugElement.children.length).toBe(1);
    compFixture.detectChanges();
    expect(debugElement.children.length).toBe(2);
    expect(debugElement.children[0].properties['title']).toBe('hello');
  });

  it('should support child moduless', () => {
    var moduleRef = createModule(SomeModuleNgFactory);
    expect(moduleRef.instance instanceof SomeModule).toBe(true);
    expect(moduleRef.injector.get(NestedModule) instanceof NestedModule).toBe(true);
    expect(moduleRef.injector.get(NestedService) instanceof NestedService).toBe(true);
  });

});
