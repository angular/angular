/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ResourceLoader} from '@angular/compiler';
import {CompileMetadataResolver} from '@angular/compiler/src/metadata_resolver';
import {MockResourceLoader} from '@angular/compiler/testing/src/resource_loader_mock';
import {Component, Directive, Injectable, NgModule, Pipe, Type} from '@angular/core';
import {TestBed, async, getTestBed} from '@angular/core/testing';

export function main() {
  describe('Jit Summaries', () => {
    let instances: Map<any, Base>;

    class SomeDep {}

    class Base {
      static annotations: any[];
      static parameters: any[][];

      constructor(public dep: SomeDep) {
        instances.set(Object.getPrototypeOf(this).constructor, this);
      }
    }

    function expectInstanceCreated(type: any) {
      const instance = instances.get(type) !;
      expect(instance).toBeDefined();
      expect(instance.dep instanceof SomeDep).toBe(true);
    }

    class SomeModule extends Base {}

    class SomePrivateComponent extends Base {}

    class SomePublicComponent extends Base {}

    class SomeDirective extends Base {}

    class SomePipe extends Base {
      transform(value: any) { return value; }
    }

    class SomeService extends Base {}

    function resetTestEnvironmentWithSummaries(summaries?: () => any[]) {
      const {platform, ngModule} = getTestBed();
      TestBed.resetTestEnvironment();
      TestBed.initTestEnvironment(ngModule, platform, summaries);
    }

    function createSummaries() {
      const resourceLoader = new MockResourceLoader();

      setMetadata(resourceLoader);

      TestBed.configureCompiler({providers: [{provide: ResourceLoader, useValue: resourceLoader}]});
      TestBed.configureTestingModule({imports: [SomeModule], providers: [SomeDep]});

      TestBed.compileComponents().then(() => {
        const metadataResolver = TestBed.get(CompileMetadataResolver) as CompileMetadataResolver;
        const summaries = [
          metadataResolver.getNgModuleSummary(SomeModule),
          // test nesting via closures, as we use this in the generated code too.
          () =>
              [metadataResolver.getDirectiveSummary(SomePublicComponent),
               metadataResolver.getDirectiveSummary(SomePrivateComponent),
        ],
          metadataResolver.getDirectiveSummary(SomeDirective),
          metadataResolver.getPipeSummary(SomePipe),
          metadataResolver.getInjectableSummary(SomeService)
        ];
        clearMetadata();
        resetTestEnvironmentWithSummaries(() => summaries);
      });

      resourceLoader.flush();
    }

    function setMetadata(resourceLoader: MockResourceLoader) {
      Base.parameters = [[SomeDep]];

      SomeModule.annotations = [new NgModule({
        declarations: [SomePublicComponent, SomePrivateComponent, SomeDirective, SomePipe],
        exports: [SomeDirective, SomePipe, SomePublicComponent],
        providers: [SomeService]
      })];

      SomePublicComponent.annotations = [new Component({templateUrl: 'somePublicUrl.html'})];
      resourceLoader.expect('somePublicUrl.html', `Hello public world!`);

      SomePrivateComponent.annotations = [new Component({templateUrl: 'somePrivateUrl.html'})];
      resourceLoader.expect('somePrivateUrl.html', `Hello private world!`);

      SomeDirective.annotations = [new Directive({selector: '[someDir]'})];

      SomePipe.annotations = [new Pipe({name: 'somePipe'})];

      SomeService.annotations = [new Injectable()];
    }

    function clearMetadata() {
      Base.parameters = [];
      SomeModule.annotations = [];
      SomePublicComponent.annotations = [];
      SomePrivateComponent.annotations = [];
      SomeDirective.annotations = [];
      SomePipe.annotations = [];
      SomeService.annotations = [];
    }

    beforeEach(async(() => {
      instances = new Map<any, any>();
      createSummaries();
    }));

    afterEach(() => { resetTestEnvironmentWithSummaries(); });

    it('should use directive metadata from summaries', () => {
      @Component({template: '<div someDir></div>'})
      class TestComp {
      }

      TestBed
          .configureTestingModule({providers: [SomeDep], declarations: [TestComp, SomeDirective]})
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
      TestBed.get(SomeService);
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

    it('should throw when trying to mock a type with a summary', () => {
      TestBed.resetTestingModule();
      expect(() => TestBed.overrideComponent(SomePrivateComponent, {add: {}}).compileComponents())
          .toThrowError(
              'SomePrivateComponent was AOT compiled, so its metadata cannot be changed.');
      TestBed.resetTestingModule();
      expect(() => TestBed.overrideDirective(SomeDirective, {add: {}}).compileComponents())
          .toThrowError('SomeDirective was AOT compiled, so its metadata cannot be changed.');
      TestBed.resetTestingModule();
      expect(() => TestBed.overridePipe(SomePipe, {add: {name: 'test'}}).compileComponents())
          .toThrowError('SomePipe was AOT compiled, so its metadata cannot be changed.');
      TestBed.resetTestingModule();
      expect(() => TestBed.overrideModule(SomeModule, {add: {}}).compileComponents())
          .toThrowError('SomeModule was AOT compiled, so its metadata cannot be changed.');
    });
  });
}