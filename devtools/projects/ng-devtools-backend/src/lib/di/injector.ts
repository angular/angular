/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AngularDevtoolsError} from '../shared/utils/error';

type Class<T> = new () => T;

/** An injection token that can be used for registering non-class dependencies. */
export class InjectorToken<T> {
  constructor(public name: string) {}
}

type Identifier<T> = Class<T> | InjectorToken<T>;

// NOTE: The following types are purely used to avoid code repetition
// when declaring Injector methods with multiple signatures.
export type SelectArgs<T> = [constructor: Class<T>] | [token: InjectorToken<T>];
export type RegisterArgs<T> =
  [constructor: Class<T>, factory?: () => T] | [token: InjectorToken<T>, factory: () => T];

/**
 * Provides a container and management of dependencies.
 */
export class DevtoolsInjector {
  private values = new Map<Identifier<unknown>, unknown>();
  private blueprints = new Map<Identifier<unknown>, () => unknown>();

  constructor(
    depsToRegister?: ({provide: Identifier<unknown>; factory: () => unknown} | Class<unknown>)[],
  ) {
    for (const dep of depsToRegister ?? []) {
      if (typeof dep === 'object') {
        this.register(dep.provide, dep.factory);
      } else {
        this.register(dep);
      }
    }
  }

  /**
   * Get a registered dependency. Will create if it doesn't exist.
   */
  get<T>(...[identifier]: SelectArgs<T>): T {
    if (!this.values.has(identifier)) {
      const blueprint = this.blueprints.get(identifier);
      if (!blueprint) {
        throw new AngularDevtoolsError('DI: Unable to find an instance for ' + identifier.name);
      }
      this.values.set(identifier, blueprint());
    }

    return this.values.get(identifier) as T;
  }

  /** Alias for `get` */
  inject<T>(...[identifier]: SelectArgs<T>): T {
    return this.get(identifier);
  }

  /**
   * Checks whether a dependency is registered.
   */
  has<T>(...[identifier]: SelectArgs<T>): boolean {
    return this.blueprints.has(identifier);
  }

  /**
   * Register a dependency. Will not create until requested via `get`.
   */
  register<T>(...[identifier, factory]: RegisterArgs<T>): DevtoolsInjector {
    if (factory) {
      this.blueprints.set(identifier, factory);
    } else {
      this.blueprints.set(identifier, () => new (identifier as Class<T>)());
    }

    return this;
  }

  /**
   * Register a dependency and return it (will create it).
   */
  registerAndGet<T>(...args: RegisterArgs<T>): T {
    this.register(...args);
    return this.get(args[0]);
  }

  /**
   * Destroy a created dependency (e.g. the instance).
   */
  destroy<T>(...[identifier]: SelectArgs<T>): void {
    this.values.delete(identifier);
  }

  /**
   * Destroy and deregister a dependency from the injector.
   * Requesting the dependency after that will throw an error.
   */
  deregister<T>(...[identifier]: SelectArgs<T>): void {
    this.destroy(identifier);
    this.blueprints.delete(identifier);
  }
}
