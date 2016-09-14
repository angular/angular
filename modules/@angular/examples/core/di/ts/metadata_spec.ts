/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, Host, Inject, Injectable, Optional, ReflectiveInjector, Self, SkipSelf} from '@angular/core';
import {TestBed} from '@angular/core/testing';

export function main() {
  describe('di metadata examples', () => {
    describe('Inject', () => {
      it('works', () => {
        // #docregion Inject
        class Engine {}

        @Injectable()
        class Car {
          constructor(@Inject('MyEngine') public engine: Engine) {}
        }

        const injector =
            ReflectiveInjector.resolveAndCreate([{provide: 'MyEngine', useClass: Engine}, Car]);

        expect(injector.get(Car).engine instanceof Engine).toBe(true);
        // #enddocregion
      });

      it('works without decorator', () => {
        // #docregion InjectWithoutDecorator
        class Engine {}

        @Injectable()
        class Car {
          constructor(public engine: Engine) {
          }  // same as constructor(@Inject(Engine) engine:Engine)
        }

        const injector = ReflectiveInjector.resolveAndCreate([Engine, Car]);
        expect(injector.get(Car).engine instanceof Engine).toBe(true);
        // #enddocregion
      });
    });

    describe('Optional', () => {
      it('works', () => {
        // #docregion Optional
        class Engine {}

        @Injectable()
        class Car {
          constructor(@Optional() public engine: Engine) {}
        }

        const injector = ReflectiveInjector.resolveAndCreate([Car]);
        expect(injector.get(Car).engine).toBeNull();
        // #enddocregion
      });
    });

    describe('Injectable', () => {
      it('works', () => {
        // #docregion Injectable
        @Injectable()
        class UsefulService {
        }

        @Injectable()
        class NeedsService {
          constructor(public service: UsefulService) {}
        }

        const injector = ReflectiveInjector.resolveAndCreate([NeedsService, UsefulService]);
        expect(injector.get(NeedsService).service instanceof UsefulService).toBe(true);
        // #enddocregion
      });

      it('throws without Injectable', () => {
        // #docregion InjectableThrows
        class UsefulService {}

        class NeedsService {
          constructor(public service: UsefulService) {}
        }

        expect(() => ReflectiveInjector.resolveAndCreate([NeedsService, UsefulService])).toThrow();
        // #enddocregion
      });
    });

    describe('Self', () => {
      it('works', () => {
        // #docregion Self
        class Dependency {}

        @Injectable()
        class NeedsDependency {
          constructor(@Self() public dependency: Dependency) {}
        }

        let inj = ReflectiveInjector.resolveAndCreate([Dependency, NeedsDependency]);
        const nd = inj.get(NeedsDependency);

        expect(nd.dependency instanceof Dependency).toBe(true);

        inj = ReflectiveInjector.resolveAndCreate([Dependency]);
        const child = inj.resolveAndCreateChild([NeedsDependency]);
        expect(() => child.get(NeedsDependency)).toThrowError();
        // #enddocregion
      });
    });

    describe('SkipSelf', () => {
      it('works', () => {
        // #docregion SkipSelf
        class Dependency {}

        @Injectable()
        class NeedsDependency {
          constructor(@SkipSelf() public dependency: Dependency) { this.dependency = dependency; }
        }

        const parent = ReflectiveInjector.resolveAndCreate([Dependency]);
        const child = parent.resolveAndCreateChild([NeedsDependency]);
        expect(child.get(NeedsDependency).dependency instanceof Dependency).toBe(true);

        const inj = ReflectiveInjector.resolveAndCreate([Dependency, NeedsDependency]);
        expect(() => inj.get(NeedsDependency)).toThrowError();
        // #enddocregion
      });
    });

    describe('Host', () => {
      it('works', () => {
        // #docregion Host
        class OtherService {}
        class HostService {}

        @Directive({selector: 'child-directive'})
        class ChildDirective {
          constructor(@Optional() @Host() os: OtherService, @Optional() @Host() hs: HostService) {
            console.log('os is null', os);
            console.log('hs is NOT null', hs);
          }
        }

        @Component({
          selector: 'parent-cmp',
          providers: [HostService],
          template: `
            Dir: <child-directive></child-directive>
          `
        })
        class ParentCmp {
        }

        @Component({
          selector: 'app',
          providers: [OtherService],
          template: `Parent: <parent-cmp></parent-cmp>`
        })
        class App {
        }
        // #enddocregion

        TestBed.configureTestingModule({
          declarations: [App, ParentCmp, ChildDirective],
        });
        expect(() => TestBed.createComponent(App)).not.toThrow();
      });
    });

  });
}
