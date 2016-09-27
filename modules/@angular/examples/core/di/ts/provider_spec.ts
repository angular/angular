/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, OpaqueToken, Optional, ReflectiveInjector} from '@angular/core';

export function main() {
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

    describe('ValueProvider', () => {
      it('works', () => {
        // #docregion ValueProvider
        const injector =
            ReflectiveInjector.resolveAndCreate([{provide: String, useValue: 'Hello'}]);

        expect(injector.get(String)).toEqual('Hello');
        // #enddocregion
      });
    });

    describe('MultiProviderAspect', () => {
      it('works', () => {
        // #docregion MultiProviderAspect
        const injector = ReflectiveInjector.resolveAndCreate([
          {provide: 'local', multi: true, useValue: 'en'},
          {provide: 'local', multi: true, useValue: 'sk'},
        ]);

        const locales: string[] = injector.get('local');
        expect(locales).toEqual(['en', 'sk']);
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

    describe('ExistingProvider', () => {
      it('works', () => {
        // #docregion ExistingProvider
        class Greeting {
          salutation = 'Hello';
        }

        class FormalGreeting extends Greeting {
          salutation = 'Greetings';
        }

        const injector = ReflectiveInjector.resolveAndCreate(
            [FormalGreeting, {provide: Greeting, useExisting: FormalGreeting}]);

        expect(injector.get(Greeting).salutation).toEqual('Greetings');
        expect(injector.get(FormalGreeting).salutation).toEqual('Greetings');
        expect(injector.get(FormalGreeting)).toBe(injector.get(Greeting));
        // #enddocregion
      });
    });

    describe('FactoryProvider', () => {
      it('works', () => {
        // #docregion FactoryProvider
        const Location = new OpaqueToken('location');
        const Hash = new OpaqueToken('hash');

        const injector = ReflectiveInjector.resolveAndCreate([
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
        const Location = new OpaqueToken('location');
        const Hash = new OpaqueToken('hash');

        const injector = ReflectiveInjector.resolveAndCreate([{
          provide: Hash,
          useFactory: (location: string) => `Hash for: ${location}`,
          // use a nested array to define metadata for dependencies.
          deps: [[new Optional(), new Inject(Location)]]
        }]);

        expect(injector.get(Hash)).toEqual('Hash for: null');
        // #enddocregion
      });
    });

  });
}
