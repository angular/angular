/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {platformServerTesting, ServerTestingModule} from '@angular/platform-server/testing';

import {expectInstanceCreated, SomeDep, SomeDirective, SomeModule, SomePipe, SomePrivateComponent, SomeService} from '../src/jit_summaries';
import {SomeModuleNgSummary} from '../src/jit_summaries.ngsummary';

describe('Jit Summaries', () => {
  beforeEach(() => {
    TestBed.initTestEnvironment(ServerTestingModule, platformServerTesting(), SomeModuleNgSummary);
  });

  afterEach(() => {
    TestBed.resetTestEnvironment();
  });

  it('should use directive metadata from summaries', () => {
    @Component({template: '<div someDir></div>'})
    class TestComp {
    }

    TestBed.configureTestingModule({providers: [SomeDep], declarations: [TestComp, SomeDirective]})
        .createComponent(TestComp);
    expectInstanceCreated(SomeDirective);
  });

  it('should use pipe metadata from summaries', () => {
    @Component({template: '{{1 | somePipe}}'})
    class TestComp {
    }

    TestBed.configureTestingModule({providers: [SomeDep], declarations: [TestComp, SomePipe]})
        .createComponent(TestComp);
    expectInstanceCreated(SomePipe);
  });

  it('should use Service metadata from summaries', () => {
    TestBed.configureTestingModule({
      providers: [SomeService, SomeDep],
    });
    TestBed.inject(SomeService);
    expectInstanceCreated(SomeService);
  });

  it('should use NgModule metadata from summaries', () => {
    @Component({template: '<div someDir>{{1 | somePipe}}</div>'})
    class TestComp {
      constructor(service: SomeService) {}
    }

    TestBed
        .configureTestingModule(
            {providers: [SomeDep], declarations: [TestComp], imports: [SomeModule]})
        .createComponent(TestComp);

    expectInstanceCreated(SomeModule);
    expectInstanceCreated(SomeDirective);
    expectInstanceCreated(SomePipe);
    expectInstanceCreated(SomeService);
  });

  it('should allow to create private components from imported NgModule summaries', () => {
    TestBed.configureTestingModule({providers: [SomeDep], imports: [SomeModule]})
        .createComponent(SomePrivateComponent);
    expectInstanceCreated(SomePrivateComponent);
  });
});
