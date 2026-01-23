/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, InjectionToken, Injector, Optional} from '@angular/core';

{
  describe('Provider examples', () => {
    describe('TypeProvider', () => {
      it('works', () => {
        // #docregion TypeProvider
        @Injectable()
        class Greeting {
          salutation = 'Hello';
        }

        const injector = Injector.create({providers: [{provide: Greeting, useClass: Greeting}]});

        expect(injector.get(Greeting).salutation).toBe('Hello');
        // #enddocregion
      });
    });

    describe('ValueProvider', () => {
      it('works', () => {
        // #docregion ValueProvider
        const injector = Injector.create({providers: [{provide: String, useValue: 'Hello'}]});

        expect(injector.get(String)).toEqual('Hello');
        // #enddocregion
      });
    });

    describe('MultiProviderAspect', () => {
      it('works', () => {
        // #docregion MultiProviderAspect
        const locale = new InjectionToken<string[]>('locale');
        const injector = Injector.create({
          providers: [
            {provide: locale, multi: true, useValue: 'en'},
            {provide: locale, multi: true, useValue: 'sk'},
          ],
        });

        const locales: string[] = injector.get(locale);
        expect(locales).toEqual(['en', 'sk']);
        // #enddocregion
      });
    });

    describe('ClassProvider', () => {
      it('works', () => {
        // #docregion ClassProvider
        abstract class Shape {
          name!: string;
        }

        class Square extends Shape {
          override name = 'square';
        }

        const injector = Injector.create({providers: [{provide: Shape, useValue: new Square()}]});

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
          override salutation = 'Greetings';
        }

        const injector = Injector.create({
          providers: [
            {provide: FormalGreeting, useClass: FormalGreeting},
            {provide: Greeting, useClass: FormalGreeting},
          ],
        });

        // The injector returns different instances.
        // See: {provide: ?, useExisting: ?} if you want the same instance.
        expect(injector.get(FormalGreeting)).not.toBe(injector.get(Greeting));
        // #enddocregion
      });
    });

    describe('StaticClassProvider', () => {
      it('works', () => {
        // #docregion StaticClassProvider
        abstract class Shape {
          name!: string;
        }

        class Square extends Shape {
          override name = 'square';
        }

        const injector = Injector.create({
          providers: [{provide: Shape, useClass: Square, deps: []}],
        });

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
          override salutation = 'Greetings';
        }

        const injector = Injector.create({
          providers: [
            {provide: FormalGreeting, useClass: FormalGreeting, deps: []},
            {provide: Greeting, useClass: FormalGreeting, deps: []},
          ],
        });

        // The injector returns different instances.
        // See: {provide: ?, useExisting: ?} if you want the same instance.
        expect(injector.get(FormalGreeting)).not.toBe(injector.get(Greeting));
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

    describe('ExistingProvider', () => {
      it('works', () => {
        // #docregion ExistingProvider
        class Greeting {
          salutation = 'Hello';
        }

        class FormalGreeting extends Greeting {
          override salutation = 'Greetings';
        }

        const injector = Injector.create({
          providers: [
            {provide: FormalGreeting, deps: []},
            {provide: Greeting, useExisting: FormalGreeting},
          ],
        });

        expect(injector.get(Greeting).salutation).toEqual('Greetings');
        expect(injector.get(FormalGreeting).salutation).toEqual('Greetings');
        expect(injector.get(FormalGreeting)).toBe(injector.get(Greeting));
        // #enddocregion
      });
    });

    describe('FactoryProvider', () => {
      it('works', () => {
        // #docregion FactoryProvider
        const Location = new InjectionToken('location');
        const Hash = new InjectionToken('hash');

        const injector = Injector.create({
          providers: [
            {provide: Location, useValue: 'https://angular.io/#someLocation'},
            {
              provide: Hash,
              useFactory: (location: string) => location.split('#')[1],
              deps: [Location],
            },
          ],
        });

        expect(injector.get(Hash)).toEqual('someLocation');
        // #enddocregion
      });

      it('supports optional dependencies', () => {
        // #docregion FactoryProviderOptionalDeps
        const Location = new InjectionToken('location');
        const Hash = new InjectionToken('hash');

        const injector = Injector.create({
          providers: [
            {
              provide: Hash,
              useFactory: (location: string) => `Hash for: ${location}`,
              // use a nested array to define metadata for dependencies.
              deps: [[new Optional(), Location]],
            },
          ],
        });

        expect(injector.get(Hash)).toEqual('Hash for: null');
        // #enddocregion
      });
    });
  });
}
