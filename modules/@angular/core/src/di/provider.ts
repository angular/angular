/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../type';

/**
 * Configures the {@link Injector} to return an instance of `Type` when `Type' is used as token.
 *
 * Create an instance by invoking the `new` operator and supplying additional arguments.
 * This form is a short form of `TypeProvider`;
 *
 * ### Example
 * ```javascript
 * @Injectable()
 * class Greeting {
 *   text: 'Hello';
 * }
 *
 * @Injectable()
 * class MyClass {
 *   greeting:string;
 *   constructor(greeting: Greeting) {
 *     this.greeting = greeting.text;
 *   }
 * }
 *
 * const injector = Injector.resolveAndCreate([
 *   Greeting, // Shorthand for { provide: Greeting, useClass: Greeting }
 *   MyClass   // Shorthand for { provide: MyClass,  useClass: MyClass }
 * ]);
 *
 * const myClass: MyClass = injector.get(MyClass);
 * expect(myClass.greeting).toEqual('Hello');
 * ```
 *
 * @stable
 */
export interface TypeProvider extends Type<any> {}

/**
 * Configures the {@link Injector} to return a value for a token.
 *
 * ### Example
 * ```javascript
 * const injector = Injector.resolveAndCreate([
 *   {provide: String, useValue: 'Hello'}
 * ]);
 *
 * expect(injector.get(String)).toEqual('Hello');
 * ```
 * @stable
 */
export interface ValueProvider {
  /**
   * An injection token. (Typically an instance of `Type` or `OpaqueToken`, but can be `any`).
   */
  provide: any;

  /**
   * The value to inject.
   */
  useValue: any;

  /**
   * If true, than injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   *
   * ### Example
   * ```javascript
   * var locale = new OpaqueToken('local');
   *
   * const injector = Injector.resolveAndCreate([
   *   { provide: locale, multi: true, useValue: 'en' },
   *   { provide: locale, multi: true, useValue: 'sk' },
   * ]);
   *
   * const locales: string[] = injector.get(locale);
   * expect(locales).toEqual(['en', 'sk']);
   * ```
   */
  multi?: boolean;
}

/**
 * Configures the {@link Injector} to return an instance of `useClass` for a token.
 *
 * ### Example
 * ```javascript
 * abstract class Shape {
 *   name: string;
 * }
 *
 * class Square extends Shape {
 *   name = 'square';
 * }
 *
 * const injector = Injector.resolveAndCreate([
 *   {provide: Shape, useClass: Square}
 * ]);
 *
 * const shape: Shape = injector.get(Shape);
 * expect(shape.name).toEqual('square');
 * expect(shape instanceof Square).toBe(true);
 * ```
 *
 * Note that following is not equal:
 * ```javascript
 * class Greeting {
 *   salutation = 'Hello';
 * }
 *
 * class FormalGreeting extends Greeting {
 *   salutation = 'Greetings';
 * }
 *
 * const injector = Injector.resolveAndCreate([
 *   FormalGreeting,
 *   {provide: Greeting, useClass: FormalGreeting}
 * ]);
 *
 * // The injector returns different instances.
 * // See: {provide: ?, useExisting: ?} if you want the same instance.
 * expect(injector.get(FormalGreeting)).not.toBe(injector.get(Greeting));
 * ```
 *
 * @stable
 */
export interface ClassProvider {
  /**
   * An injection token. (Typically an instance of `Type` or `OpaqueToken`, but can be `any`).
   */
  provide: any;

  /**
   * Class to instantiate for the `token`.
   */
  useClass: Type<any>;

  /**
   * If true, than injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   *
   * ### Example
   * ```javascript
   * abstract class Locale {
   *   name: string;
   * };
   *
   * @Injectable()
   * class EnLocale extends Locale {
   *   name: 'en';
   * };
   *
   * @Injectable()
   * class SkLocale extends Locale {
   *   name: 'sk';
   * };
   *
   * const injector = Injector.resolveAndCreate([
   *   { provide: Locale, useValue: EnLocale, multi: true },
   *   { provide: Locale, useValue: SkLocale, multi: true },
   * ]);
   *
   * const locales: Locale[] = injector.get(Locale);
   * const localeNames: string[] = locals.map((l) => l.name);
   * expect(localeNames).toEqual(['en', 'sk']);
   * ```
   */
  multi?: boolean;
}

/**
 * Configures the {@link Injector} to return a value of another `useExisting` token.
 *
 * ### Example
 * ```javascript
 * class Greeting {
 *   salutation = 'Hello';
 * }
 *
 * class FormalGreeting extends Greeting {
 *   salutation = 'Greetings';
 * }
 *
 * const injector = Injector.resolveAndCreate([
 *   FormalGreeting,
 *   {provide: Greeting, useExisting: FormalGreeting}
 * ]);
 *
 * expect(injector.get(Greeting).name).toEqual('Hello');
 * expect(injector.get(FormalGreeting).name).toEqual('Hello');
 * expect(injector.get(Salutation).name).toBe(injector.get(Greeting));
 * ```
 * @stable
 */
export interface ExistingProvider {
  /**
   * An injection token. (Typically an instance of `Type` or `OpaqueToken`, but can be `any`).
   */
  provide: any;

  /**
   * Existing `token` to return. (equivalent to `injector.get(useExisting)`)
   */
  useExisting: any;

  /**
   * If true, than injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   *
   * ### Example
   * ```javascript
   * abstract class Locale {
   *   name: string;
   * };
   *
   * @Injectable()
   * class EnLocale extends Locale {
   *   name: 'en';
   * };
   *
   * @Injectable()
   * class SkLocale extends Locale {
   *   name: 'sk';
   * };
   *
   * const injector = Injector.resolveAndCreate([
   *   EnLocale,
   *   SkLocale
   *   { provide: Locale, useExisting: EnLocale, multi: true },
   *   { provide: Locale, useExisting: SkLocale, multi: true },
   * ]);
   *
   * const locales: Locale[] = injector.get(Locale);
   * const localeNames: string[] = locals.map((l) => l.name);
   * expect(localeNames).toEqual(['en', 'sk']);
   * ```
   */
  multi?: boolean;
}

/**
 * Configures the {@link Injector} to return a value by invoking a `useFactory` function.
 *
 * ### Example
 * ```javascript
 * const HASH = new OpaqueToken('hash');
 *
 * const injector = Injector.resolveAndCreate([
 *   {provide: Location, useValue: window.location},
 *   {provide: HASH, useFactory: (location: Location) => location.hash, deps: [Location]}
 * ]);
 *
 *
 * // Assume location is: http://angular.io/#someLocation
 * expect(injector.get(HASH)).toEqual('someLocation');
 * ``
 * @stable
 */
export interface FactoryProvider {
  /**
   * An injection token. (Typically an instance of `Type` or `OpaqueToken`, but can be `any`).
   */
  provide: any;

  /**
   * A function to invoke to create a value for this `token`. The function is invoked with
   * resolved values of `token`s in the `deps` field.
   */
  useFactory: Function;

  /**
   * A list of `token`s which need to be resolved by the injector. The list of values is than
   * used as arguments to the `useFactory` function.
   */
  deps?: any[];

  /**
   * If true, than injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   *
   * ### Example
   * ```javascript
   * class Locale {
   *   constructor(public name: string) {}
   * };
   * const PRIMARY = new OpequeToken('primary');
   * const SECONDARY = new OpequeToken('secondary');
   *
   * const injector = Injector.resolveAndCreate([
   *   { provide: PRIMARY: useValue: 'en'},
   *   { provide: SECONDARY: useValue: 'sk'},
   *   { provide: Locale, useFactory: (n) => new Locale(n), deps: [PRIMARY], multi: true},
   *   { provide: Locale, useFactory: (n) => new Locale(n), deps: [SECONDARY], multi: true},
   * ]);
   *
   * const locales: Locale[] = injector.get(Locale);
   * const localeNames: string[] = locals.map((l) => l.name);
   * expect(localeNames).toEqual(['en', 'sk']);
   * ```
   */
  multi?: boolean;
}

/**
 * Describes how the {@link Injector} should be configured.
 *
 * See {@link TypeProvider}, {@link ValueProvider}, {@link ClassProvider}, {@link ExistingProvider},
 * {@link FactoryProvider}.
 *
 * ```javascript
 * class Greeting {
 *   salutation = 'Hello';
 * }
 *
 * class FormalGreeting extends Greeting {
 *   salutation = 'Greetings';
 * }
 *
 * abstract class Operation {
 *   apply(a,b): any;
 * }
 *
 * class AddOperation extends Operation {
 *   apply(a,b) { return a+b; }
 * }
 *
 *
 * const injector = Injector.resolveAndCreate([
 *   FormalGreeting,
 *   {provide: String, useValue: 'Hello World!'},
 *   {provide: Greeting, useExisting: FormalGreeting},
 *   {provide: Operation, useClass: AddOperation},
 *   {provide: Number, useFactory: (op) =>op.apply(1,2), deps: [Operation] }
 * ]);
 *
 * expect(injector.get(FormalGreeting).name).toEqual('Greetings');
 * expect(injector.get(String).name).toEqual('Hello World!');
 * expect(injector.get(Greeting).name).toBe(injector.get(FormalGreeting));
 * expect(injector.get(Number).toEqual(3);
 * ```
 * @stable
 */
export type Provider =
    TypeProvider | ValueProvider | ClassProvider | ExistingProvider | FactoryProvider | any[];
