/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, InjectionToken, Injector, InjectorDefType, NgModule, Optional, ReflectiveInjector} from '@angular/core';

{
  describe('Provider examples', () => {
    describe('TypeProvider', () => {
      it('works', () => {
        // #docregion TypeProvider
        @Injectable()
        class Greeting {
          salutation = 'Hello';
        }

        const injector = ReflectiveInjector.resolveAndCreate([
          Greeting,  // Shorthand for { provide: Greeting, useClass: Greeting }
        ]);

        expect(injector.get(Greeting).salutation).toBe('Hello');
        // #enddocregion
      });
    });

    describe('ValueSansProvider', () => {
      it('works', () => {
        // #docregion ValueSansProvider
        @NgModule()
        class MyModule {
        }

        @Injectable(MyModule, {useValue: 'Hello'})
        class MyClass {
        }
        const injector = Injector.create([MyModule as InjectorDefType<any>]);

        expect(injector.get(MyClass)).toEqual('Hello');
        // #enddocregion
      });
    });

    describe('ValueProvider', () => {
      it('works', () => {
        // #docregion ValueProvider
        const injector = Injector.create([{provide: String, useValue: 'Hello'}]);

        expect(injector.get(String)).toEqual('Hello');
        // #enddocregion
      });
    });

    describe('MultiProviderAspect', () => {
      it('works', () => {
        // #docregion MultiProviderAspect
        const locale = new InjectionToken<string[]>('locale');
        const injector = Injector.create([
          {provide: locale, multi: true, useValue: 'en'},
          {provide: locale, multi: true, useValue: 'sk'},
        ]);

        const locales: string[] = injector.get(locale);
        expect(locales).toEqual(['en', 'sk']);
        // #enddocregion
      });
    });

    describe('ClassSansProvider', () => {
      it('works', () => {
        // #docregion ClassSansProvider
        @NgModule()
        class ShapeModule {
        }

        @Injectable(ShapeModule)
        class Square {
          name = 'square';
        }

        @Injectable(ShapeModule, {useClass: Square})
        abstract class Shape {
          name: string;
        }

        const injector = Injector.create([ShapeModule as InjectorDefType<any>]);

        const shape: Shape = injector.get(Shape);
        expect(shape.name).toEqual('square');
        expect(shape instanceof Square).toBe(true);
        // #enddocregion
      });

      it('is different then useExisting', () => {
        // #docregion ClassSansProviderDifference
        @NgModule()
        class SalutationModule {
        }


        @Injectable(SalutationModule)
        class FormalGreeting {
          salutation = 'Greetings';
        }

        @Injectable(SalutationModule, {useClass: FormalGreeting})
        class Greeting {
          salutation = 'Hello';
        }

        const injector = Injector.create([SalutationModule as InjectorDefType<any>]);

        // The injector returns different instances.
        // See: {provide: ?, useExisting: ?} if you want the same instance.
        expect(injector.get(FormalGreeting)).not.toBe(injector.get(Greeting));
        // #enddocregion
      });
    });

    describe('ClassProvider', () => {
      it('works', () => {
        // #docregion ClassProvider
        abstract class Shape { name: string; }

        class Square extends Shape {
          name = 'square';
        }

        const injector = ReflectiveInjector.resolveAndCreate([{provide: Shape, useClass: Square}]);

        const shape: Shape = injector.get(Shape);
        expect(shape.name).toEqual('square');
        expect(shape instanceof Square).toBe(true);
        // #enddocregion
      });

      it('is different then useExisting', () => {
        // #docregion ClassProviderDifference
        class Greeting {
          salutation = 'Hello';
        }

        class FormalGreeting extends Greeting {
          salutation = 'Greetings';
        }

        const injector = ReflectiveInjector.resolveAndCreate(
            [FormalGreeting, {provide: Greeting, useClass: FormalGreeting}]);

        // The injector returns different instances.
        // See: {provide: ?, useExisting: ?} if you want the same instance.
        expect(injector.get(FormalGreeting)).not.toBe(injector.get(Greeting));
        // #enddocregion
      });
    });

    describe('StaticClassSansProvider', () => {
      it('works', () => {
        // #docregion StaticClassSansProvider

        @NgModule()
        class MyShapeModule {
        }

        class Square {
          name = 'square';
        }

        @Injectable(MyShapeModule, {useClass: Square, deps: []})
        class Shape {
          name: string;
        }

        const injector = Injector.create([MyShapeModule as InjectorDefType<any>]);

        const shape: Shape = injector.get(Shape);
        expect(shape.name).toEqual('square');
        expect(shape instanceof Square).toBe(true);
        // #enddocregion
      });
    });

    describe('StaticClassProvider', () => {
      it('works', () => {
        // #docregion StaticClassProvider
        abstract class Shape { name: string; }

        class Square extends Shape {
          name = 'square';
        }

        const injector = Injector.create([{provide: Shape, useClass: Square, deps: []}]);

        const shape: Shape = injector.get(Shape);
        expect(shape.name).toEqual('square');
        expect(shape instanceof Square).toBe(true);
        // #enddocregion
      });

      it('is different then useExisting', () => {
        // #docregion StaticClassProviderDifference
        class Greeting {
          salutation = 'Hello';
        }

        class FormalGreeting extends Greeting {
          salutation = 'Greetings';
        }

        const injector = Injector.create([
          {provide: FormalGreeting, useClass: FormalGreeting, deps: []},
          {provide: Greeting, useClass: FormalGreeting, deps: []}
        ]);

        // The injector returns different instances.
        // See: {provide: ?, useExisting: ?} if you want the same instance.
        expect(injector.get(FormalGreeting)).not.toBe(injector.get(Greeting));
        // #enddocregion
      });
    });

    describe('ConstructorSansProvider', () => {
      it('works', () => {
        // #docregion ConstructorSansProvider
        @NgModule()
        class MyShapeModule {
        }

        @Injectable(MyShapeModule, {deps: []})
        class Square {
          name = 'square';
        }

        const injector = Injector.create([MyShapeModule as InjectorDefType<any>]);

        const shape: Square = injector.get(Square);
        expect(shape.name).toEqual('square');
        expect(shape instanceof Square).toBe(true);
        // #enddocregion
      });
    });

    describe('ConstructorProvider', () => {
      it('works', () => {
        // #docregion ConstructorProvider
        class Square {
          name = 'square';
        }

        const injector = Injector.create({providers: [{provide: Square, deps: []}]});

        const shape: Square = injector.get(Square);
        expect(shape.name).toEqual('square');
        expect(shape instanceof Square).toBe(true);
        // #enddocregion
      });
    });

    describe('ExistingSansProvider', () => {
      it('works', () => {
        // #docregion ExistingSansProvider
        abstract class AbstractGreeting { salutation: string; }

        @NgModule()
        class MyGreetingModule {
        }

        @Injectable(MyGreetingModule, {deps: []})
        class FormalGreeting extends AbstractGreeting {
          salutation = 'Greetings';
        }

        @Injectable(MyGreetingModule, {useExisting: FormalGreeting})
        class Greeting extends AbstractGreeting {
          salutation = 'Hello';
        }

        const injector = Injector.create([MyGreetingModule as InjectorDefType<any>]);

        expect(injector.get(Greeting).salutation).toEqual('Greetings');
        expect(injector.get(FormalGreeting).salutation).toEqual('Greetings');
        expect(injector.get(FormalGreeting)).toBe(injector.get(Greeting));
        // #enddocregion
      });
    });

    describe('ExistingProvider', () => {
      it('works', () => {
        // #docregion ExistingProvider
        class Greeting {
          salutation = 'Hello';
        }

        class FormalGreeting extends Greeting {
          salutation = 'Greetings';
        }

        const injector = Injector.create([
          {provide: FormalGreeting, deps: []}, {provide: Greeting, useExisting: FormalGreeting}
        ]);

        expect(injector.get(Greeting).salutation).toEqual('Greetings');
        expect(injector.get(FormalGreeting).salutation).toEqual('Greetings');
        expect(injector.get(FormalGreeting)).toBe(injector.get(Greeting));
        // #enddocregion
      });
    });

    describe('FactorySansProvider', () => {
      it('works', () => {
        // #docregion FactorySansProvider
        @NgModule()
        class MyLocationModule {
        }

        @Injectable(MyLocationModule, {useValue: 'http://angular.io/#someLocation'})
        class Location {
        }

        @Injectable(
            MyLocationModule,
            {useFactory: (location: string) => location.split('#')[1], deps: [Location]})
        class Hash {
        }

        const injector = Injector.create([MyLocationModule as InjectorDefType<any>]);

        expect(injector.get(Location)).toEqual('http://angular.io/#someLocation');
        expect(injector.get(Hash)).toEqual('someLocation');
        // #enddocregion
      });
    });

    describe('FactoryProvider', () => {
      it('works', () => {
        // #docregion FactoryProvider
        const Location = new InjectionToken('location');
        const Hash = new InjectionToken('hash');

        const injector = Injector.create([
          {provide: Location, useValue: 'http://angular.io/#someLocation'}, {
            provide: Hash,
            useFactory: (location: string) => location.split('#')[1],
            deps: [Location]
          }
        ]);

        expect(injector.get(Hash)).toEqual('someLocation');
        // #enddocregion
      });

      it('supports optional dependencies', () => {
        // #docregion FactoryProviderOptionalDeps
        const Location = new InjectionToken('location');
        const Hash = new InjectionToken('hash');

        const injector = Injector.create([{
          provide: Hash,
          useFactory: (location: string) => `Hash for: ${location}`,
          // use a nested array to define metadata for dependencies.
          deps: [[new Optional(), Location]]
        }]);

        expect(injector.get(Hash)).toEqual('Hash for: null');
        // #enddocregion
      });
    });

  });
}
