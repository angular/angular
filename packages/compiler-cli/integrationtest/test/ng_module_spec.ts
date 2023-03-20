/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import './init';

import {ComponentUsingThirdParty} from '../src/comp_using_3rdp';
import {MainModule} from '../src/module';
import {CompUsingLibModuleDirectiveAndPipe, CompUsingRootModuleDirectiveAndPipe, ServiceUsingLibModule, SomeLibModule, SomeService} from '../src/module_fixtures';

import {createComponent, createModule} from './util';

describe('NgModule', () => {
  it('should support providers', () => {
    const moduleRef = createModule();
    expect(moduleRef.instance instanceof MainModule).toEqual(true);
    expect(moduleRef.injector.get(MainModule) instanceof MainModule).toEqual(true);
    expect(moduleRef.injector.get(SomeService) instanceof SomeService).toEqual(true);
  });

  describe('third-party modules', () => {
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
