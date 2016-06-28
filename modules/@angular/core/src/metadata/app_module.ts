/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectableMetadata} from '../di/metadata';
import {Type} from '../facade/lang';

/**
 * Declares an Application Module.
 * @stable
 */
export class AppModuleMetadata extends InjectableMetadata {
  /**
   * Defines the set of injectable objects that are available in the injector
   * of this module.
   *
   * ## Simple Example
   *
   * Here is an example of a class that can be injected:
   *
   * ```
   * class Greeter {
   *    greet(name:string) {
   *      return 'Hello ' + name + '!';
   *    }
   * }
   *
   * @AppModule({
   *   providers: [
   *     Greeter
   *   ]
   * })
   * class HelloWorld {
   *   greeter:Greeter;
   *
   *   constructor(greeter:Greeter) {
   *     this.greeter = greeter;
   *   }
   * }
   * ```
   */
  get providers(): any[] { return this._providers; }
  private _providers: any[];


  /**
   * Specifies a list of directives that can be used within the template
   * of any component that is part of this application module.
   *
   * ### Example
   *
   * ```javascript
   * @AppModule({
   *   directives: [NgFor]
   * })
   * class MyAppModule {
   * }
   * ```
   */
  directives: Array<Type|any[]>;

  /**
   * Specifies a list of pipes that can be used within the template
   * of any component that is part of this application module.
   *
   * ### Example
   *
   * ```javascript
   * @AppModule({
   *   pipes: [SomePipe]
   * })
   * class MyAppModule {
   * }
   * ```
   */
  pipes: Array<Type|any[]>;

  /**
   * Defines the components that should be precompiled as well when
   * this component is defined. For each components listed here,
   * Angular will create a {@link ComponentFactory ComponentFactory} and store it in the
   * {@link ComponentFactoryResolver ComponentFactoryResolver}.
   */
  precompile: Array<Type|any[]>;

  /**
   * Defines modules that should be included into this module.
   * The providers / directives / pipes / precompile entries will be added
   * to this module.
   * Just like the main module, the modules listed here are also eagerly
   * created and accessible via DI.
   */
  modules: Array<Type|any[]>;

  constructor({providers, directives, pipes, precompile, modules}: {
    providers?: any[],
    directives?: Array<Type|any[]>,
    pipes?: Array<Type|any[]>,
    precompile?: Array<Type|any[]>,
    modules?: Array<Type|any[]>
  } = {}) {
    super();
    this._providers = providers;
    this.directives = directives;
    this.pipes = pipes;
    this.precompile = precompile;
    this.modules = modules;
  }
}
