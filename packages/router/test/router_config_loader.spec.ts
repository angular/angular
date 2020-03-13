/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, Injector, NgModule} from '@angular/core';
import {TestBed} from '@angular/core/testing';

import {ROUTES, ROUTE_INITIALIZER, RouterConfigLoader} from '../src/router_config_loader';
import {SpyNgModuleFactoryLoader} from '../testing';

describe('router config loader', () => {
  let routerConfigLoader: RouterConfigLoader;

  beforeEach(() => {
    routerConfigLoader = new RouterConfigLoader(
        new SpyNgModuleFactoryLoader(TestBed.inject(Compiler)), TestBed.inject(Compiler));

  });

  it('should load normal routes', async(done) => {
    @NgModule({providers: [{provide: ROUTES, useValue: {}}]})
    class TestModule {
    }

    routerConfigLoader.load(TestBed.inject(Injector), {loadChildren: () => TestModule})
        .subscribe(loaded => {
          expect(loaded.module).toBeDefined();
          done();
        });
  });

  it('should load routes with initializer', async(done) => {
    @NgModule({
      providers: [
        {provide: ROUTE_INITIALIZER, useFactory: () => () => {}, multi: true},
        {provide: ROUTES, useValue: {}}
      ]
    })
    class TestModule {
    }
    routerConfigLoader.load(TestBed.inject(Injector), {loadChildren: () => TestModule})
        .subscribe(loaded => {
          expect(loaded.module).toBeDefined();
          expect(loaded.module.injector.get(ROUTE_INITIALIZER)).toBeDefined();
          expect(loaded.module.injector.get(ROUTE_INITIALIZER).length).toEqual(1);
          done();
        });
  });

  it('should load routes with multiple initializer', async(done) => {
    @NgModule({
      providers: [
        {provide: ROUTE_INITIALIZER, useFactory: () => () => 1, multi: true},
        {provide: ROUTE_INITIALIZER, useFactory: () => () => 2, multi: true},
        {provide: ROUTES, useValue: {}}
      ]
    })
    class TestModule {
    }
    routerConfigLoader.load(TestBed.inject(Injector), {loadChildren: () => TestModule})
        .subscribe(loaded => {
          expect(loaded.module).toBeDefined();
          expect(loaded.module.injector.get(ROUTE_INITIALIZER).length).toEqual(2);
          done();
        });
  });


  it('should load routes with child module initializer', async(done) => {
    @NgModule({providers: [{provide: ROUTE_INITIALIZER, useFactory: () => () => 2, multi: true}]})
    class TestChildModule {
    }

    @NgModule({
      imports: [TestChildModule],
      providers: [
        {provide: ROUTE_INITIALIZER, useFactory: () => () => 1, multi: true},
        {provide: ROUTES, useValue: {}}
      ]
    })
    class TestModule {
    }

    routerConfigLoader.load(TestBed.inject(Injector), {loadChildren: () => TestModule})
        .subscribe(loaded => {
          expect(loaded.module).toBeDefined();
          expect(loaded.module.injector.get(ROUTE_INITIALIZER).length).toEqual(2);
          done();
        });
  });


  it('shouldn\'t initialize lazy loaded child module initializer', async(done) => {
    @NgModule({providers: [{provide: ROUTE_INITIALIZER, useFactory: () => () => 2, multi: true}]})
    class TestChildModule {
    }

    @NgModule({
      imports: [],
      providers: [
        {provide: ROUTE_INITIALIZER, useFactory: () => () => 1, multi: true},
        {provide: ROUTES, useValue: [{loadChildren: () => TestChildModule}]}
      ]
    })
    class TestModule {
    }

    routerConfigLoader.load(TestBed.inject(Injector), {loadChildren: () => TestModule})
        .subscribe(loaded => {
          expect(loaded.module).toBeDefined();
          expect(loaded.module.injector.get(ROUTE_INITIALIZER).length).toEqual(1);
          done();
        });
  });

  it('should load routes with initializer and wait until they are resolved', async(done) => {
    let test = false;
    let initialized = false;
    @NgModule({
      providers: [
        {
          provide: ROUTE_INITIALIZER,
          useFactory: () => () => new Promise(
                          (res, rej) => setTimeout(
                              () => {
                                test = true;
                                res();
                              },
                              500)),
          multi: true
        },
        {
          provide: ROUTE_INITIALIZER,
          useFactory: () => () => new Promise(
                          (res, rej) => setTimeout(
                              () => {
                                initialized = true;
                                res();
                              },
                              600)),
          multi: true
        },
        {provide: ROUTES, useValue: {}}
      ]
    })

    class TestModule {
    }
    routerConfigLoader.load(TestBed.inject(Injector), {loadChildren: () => TestModule})
        .subscribe(loaded => {
          expect(loaded.module).toBeDefined();
          expect(test).toBeTruthy();
          expect(initialized).toBeTruthy();
          done();
        });
  });

  it('should load only his own ROUTE_INITIALIZERS', async(done) => {
    @NgModule({
      providers: [
        {provide: ROUTE_INITIALIZER, useFactory: () => () => {}, multi: true},
        {provide: ROUTES, useValue: {}}
      ]
    })
    class TestModule {
    }

    const injector = Injector.create(
        [{provide: ROUTE_INITIALIZER, useFactory: () => () => {}, multi: true, deps: []}],
        TestBed.inject(Injector));

    routerConfigLoader.load(injector, {loadChildren: () => TestModule}).subscribe(loaded => {
      expect(loaded.module).toBeDefined();
      expect(loaded.module.injector.get(ROUTE_INITIALIZER)).toBeDefined();
      expect(loaded.module.injector.get(ROUTE_INITIALIZER).length).toEqual(1);
      done();
    });
  });
});
