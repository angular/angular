/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, Host, Injectable, Injector, Optional, Self, SkipSelf} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

{
  describe('di metadata examples', () => {
    describe('Inject', () => {
      it('works without decorator', () => {
        // #docregion InjectWithoutDecorator
        class Engine {}

        @Injectable()
        class Car {
          constructor(public engine: Engine) {
          }  // same as constructor(@Inject(Engine) engine:Engine)
        }

        const injector = Injector.create(
            {providers: [{provide: Engine, deps: []}, {provide: Car, deps: [Engine]}]});
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

        const injector =
            Injector.create({providers: [{provide: Car, deps: [[new Optional(), Engine]]}]});
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

        const injector = Injector.create({
          providers:
              [{provide: NeedsService, deps: [UsefulService]}, {provide: UsefulService, deps: []}]
        });
        expect(injector.get(NeedsService).service instanceof UsefulService).toBe(true);
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

        let inj = Injector.create({
          providers: [
            {provide: Dependency, deps: []},
            {provide: NeedsDependency, deps: [[new Self(), Dependency]]}
          ]
        });
        const nd = inj.get(NeedsDependency);

        expect(nd.dependency instanceof Dependency).toBe(true);

        const child = Injector.create({
          providers: [{provide: NeedsDependency, deps: [[new Self(), Dependency]]}],
          parent: inj
        });
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
          constructor(@SkipSelf() public dependency: Dependency) {}
        }

        const parent = Injector.create({providers: [{provide: Dependency, deps: []}]});
        const child =
            Injector.create({providers: [{provide: NeedsDependency, deps: [Dependency]}], parent});
        expect(child.get(NeedsDependency).dependency instanceof Dependency).toBe(true);

        const inj = Injector.create(
            {providers: [{provide: NeedsDependency, deps: [[new Self(), Dependency]]}]});
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
          logs: string[] = [];

          constructor(@Optional() @Host() os: OtherService, @Optional() @Host() hs: HostService) {
            // os is null: true
            this.logs.push(`os is null: ${os === null}`);
            // hs is an instance of HostService: true
            this.logs.push(`hs is an instance of HostService: ${hs instanceof HostService}`);
          }
        }

        @Component({
          selector: 'parent-cmp',
          viewProviders: [HostService],
          template: '<child-directive></child-directive>',
        })
        class ParentCmp {
        }

        @Component({
          selector: 'app',
          viewProviders: [OtherService],
          template: '<parent-cmp></parent-cmp>',
        })
        class App {
        }
        // #enddocregion

        TestBed.configureTestingModule({
          declarations: [App, ParentCmp, ChildDirective],
        });

        let cmp: ComponentFixture<App> = undefined!;
        expect(() => cmp = TestBed.createComponent(App)).not.toThrow();

        expect(cmp.debugElement.children[0].children[0].injector.get(ChildDirective).logs).toEqual([
          'os is null: true',
          'hs is an instance of HostService: true',
        ]);
      });
    });
  });
}
