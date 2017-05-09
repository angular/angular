/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactory, ComponentFactoryResolver, Injector, Type} from '@angular/core';

import * as angular from './angular1';
import {$COMPILE, $INJECTOR, $PARSE, INJECTOR_KEY, REQUIRE_INJECTOR, REQUIRE_NG_MODEL} from './constants';
import {DowngradeComponentAdapter} from './downgrade_component_adapter';
import {controllerKey, getComponentName} from './util';

let downgradeCount = 0;

/**
 * @whatItDoes
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * Allows an Angular component to be used from AngularJS.
 *
 * @howToUse
 *
 * Let's assume that you have an Angular component called `ng2Heroes` that needs
 * to be made available in AngularJS templates.
 *
 * {@example upgrade/static/ts/module.ts region="ng2-heroes"}
 *
 * We must create an AngularJS [directive](https://docs.angularjs.org/guide/directive)
 * that will make this Angular component available inside AngularJS templates.
 * The `downgradeComponent()` function returns a factory function that we
 * can use to define the AngularJS directive that wraps the "downgraded" component.
 *
 * {@example upgrade/static/ts/module.ts region="ng2-heroes-wrapper"}
 *
 * @description
 *
 * A helper function that returns a factory function to be used for registering an
 * AngularJS wrapper directive for "downgrading" an Angular component.
 *
 * The parameter contains information about the Component that is being downgraded:
 *
 * * `component: Type<any>`: The type of the Component that will be downgraded
 *
 * @experimental
 */
export function downgradeComponent(info: {
  component: Type<any>;
  /** @deprecated since v4. This parameter is no longer used */
  inputs?: string[];
  /** @deprecated since v4. This parameter is no longer used */
  outputs?: string[];
  /** @deprecated since v4. This parameter is no longer used */
  selectors?: string[];
}): any /* angular.IInjectable */ {
  const idPrefix = `NG2_UPGRADE_${downgradeCount++}_`;
  let idCount = 0;

  const directiveFactory:
      angular.IAnnotatedFunction = function(
                                       $compile: angular.ICompileService,
                                       $injector: angular.IInjectorService,
                                       $parse: angular.IParseService): angular.IDirective {

    return {
      restrict: 'E',
      terminal: true,
      require: [REQUIRE_INJECTOR, REQUIRE_NG_MODEL],
      link: (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes,
             required: any[]) => {
        // We might have to compile the contents asynchronously, because this might have been
        // triggered by `UpgradeNg1ComponentAdapterBuilder`, before the Angular templates have
        // been compiled.

        const parentInjector: Injector|ParentInjectorPromise =
            required[0] || $injector.get(INJECTOR_KEY);
        const ngModel: angular.INgModelController = required[1];

        const downgradeFn = (injector: Injector) => {
          const componentFactoryResolver: ComponentFactoryResolver =
              injector.get(ComponentFactoryResolver);
          const componentFactory: ComponentFactory<any> =
              componentFactoryResolver.resolveComponentFactory(info.component) !;

          if (!componentFactory) {
            throw new Error('Expecting ComponentFactory for: ' + getComponentName(info.component));
          }

          const id = idPrefix + (idCount++);
          const injectorPromise = new ParentInjectorPromise(element);
          const facade = new DowngradeComponentAdapter(
              id, element, attrs, scope, ngModel, injector, $injector, $compile, $parse,
              componentFactory);

          const projectableNodes = facade.compileContents();
          facade.createComponent(projectableNodes);
          facade.setupInputs();
          facade.setupOutputs();
          facade.registerCleanup();

          injectorPromise.resolve(facade.getInjector());
        };

        if (parentInjector instanceof ParentInjectorPromise) {
          parentInjector.then(downgradeFn);
        } else {
          downgradeFn(parentInjector);
        }
      }
    };
  };

  // bracket-notation because of closure - see #14441
  directiveFactory['$inject'] = [$COMPILE, $INJECTOR, $PARSE];
  return directiveFactory;
}

/**
 * Synchronous promise-like object to wrap parent injectors,
 * to preserve the synchronous nature of Angular 1's $compile.
 */
class ParentInjectorPromise {
  private injector: Injector;
  private injectorKey: string = controllerKey(INJECTOR_KEY);
  private callbacks: ((injector: Injector) => any)[] = [];

  constructor(private element: angular.IAugmentedJQuery) {
    // Store the promise on the element.
    element.data !(this.injectorKey, this);
  }

  then(callback: (injector: Injector) => any) {
    if (this.injector) {
      callback(this.injector);
    } else {
      this.callbacks.push(callback);
    }
  }

  resolve(injector: Injector) {
    this.injector = injector;

    // Store the real injector on the element.
    this.element.data !(this.injectorKey, injector);

    // Release the element to prevent memory leaks.
    this.element = null !;

    // Run the queued callbacks.
    this.callbacks.forEach(callback => callback(injector));
    this.callbacks.length = 0;
  }
}
