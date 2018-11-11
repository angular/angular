/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactory, ComponentFactoryResolver, Injector, NgZone, Type} from '@angular/core';

import * as angular from './angular1';
import {$COMPILE, $INJECTOR, $PARSE, INJECTOR_KEY, LAZY_MODULE_REF, REQUIRE_INJECTOR, REQUIRE_NG_MODEL} from './constants';
import {DowngradeComponentAdapter} from './downgrade_component_adapter';
import {LazyModuleRef, controllerKey, getTypeName, isFunction, validateInjectionKey} from './util';


interface Thenable<T> {
  then(callback: (value: T) => any): any;
}

/**
 * @description
 *
 * A helper function that allows an Angular component to be used from AngularJS.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * This helper function returns a factory function to be used for registering
 * an AngularJS wrapper directive for "downgrading" an Angular component.
 *
 * @usageNotes
 * ### Examples
 *
 * Let's assume that you have an Angular component called `ng2Heroes` that needs
 * to be made available in AngularJS templates.
 *
 * {@example upgrade/static/ts/full/module.ts region="ng2-heroes"}
 *
 * We must create an AngularJS [directive](https://docs.angularjs.org/guide/directive)
 * that will make this Angular component available inside AngularJS templates.
 * The `downgradeComponent()` function returns a factory function that we
 * can use to define the AngularJS directive that wraps the "downgraded" component.
 *
 * {@example upgrade/static/ts/full/module.ts region="ng2-heroes-wrapper"}
 *
 * @param info contains information about the Component that is being downgraded:
 *
 * - `component: Type<any>`: The type of the Component that will be downgraded
 * - `downgradedModule?: string`: The name of the downgraded module (if any) that the component
 *   "belongs to", as returned by a call to `downgradeModule()`. It is the module, whose
 *   corresponding Angular module will be bootstrapped, when the component needs to be instantiated.
 *   <br />
 *   (This option is only necessary when using `downgradeModule()` to downgrade more than one
 *   Angular module.)
 * - `propagateDigest?: boolean`: Whether to perform {@link ChangeDetectorRef#detectChanges
 *   change detection} on the component on every
 *   [$digest](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest). If set to `false`,
 *   change detection will still be performed when any of the component's inputs changes.
 *   (Default: true)
 *
 * @returns a factory function that can be used to register the component in an
 * AngularJS module.
 *
 * @publicApi
 */
export function downgradeComponent(info: {
  component: Type<any>; downgradedModule?: string; propagateDigest?: boolean;
  /** @deprecated since v4. This parameter is no longer used */
  inputs?: string[];
  /** @deprecated since v4. This parameter is no longer used */
  outputs?: string[];
  /** @deprecated since v4. This parameter is no longer used */
  selectors?: string[];
}): any /* angular.IInjectable */ {
  const directiveFactory:
      angular.IAnnotatedFunction = function(
                                       $compile: angular.ICompileService,
                                       $injector: angular.IInjectorService,
                                       $parse: angular.IParseService): angular.IDirective {
    // When using `UpgradeModule`, we don't need to ensure callbacks to Angular APIs (e.g. change
    // detection) are run inside the Angular zone, because `$digest()` will be run inside the zone
    // (except if explicitly escaped, in which case we shouldn't force it back in).
    // When using `downgradeModule()` though, we need to ensure such callbacks are run inside the
    // Angular zone.
    let needsNgZone = false;
    let wrapCallback = <T>(cb: () => T) => cb;
    let ngZone: NgZone;

    return {
      restrict: 'E',
      terminal: true,
      require: [REQUIRE_INJECTOR, REQUIRE_NG_MODEL],
      link: (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes,
             required: any[]) => {
        // We might have to compile the contents asynchronously, because this might have been
        // triggered by `UpgradeNg1ComponentAdapterBuilder`, before the Angular templates have
        // been compiled.

        const ngModel: angular.INgModelController = required[1];
        let parentInjector: Injector|Thenable<Injector>|undefined = required[0];
        let ranAsync = false;

        if (!parentInjector) {
          const downgradedModule = info.downgradedModule || '';
          const lazyModuleRefKey = `${LAZY_MODULE_REF}${downgradedModule}`;
          const attemptedAction = `instantiating component '${getTypeName(info.component)}'`;

          validateInjectionKey($injector, downgradedModule, lazyModuleRefKey, attemptedAction);

          const lazyModuleRef = $injector.get(lazyModuleRefKey) as LazyModuleRef;
          needsNgZone = lazyModuleRef.needsNgZone;
          parentInjector = lazyModuleRef.injector || lazyModuleRef.promise as Promise<Injector>;
        }

        const doDowngrade = (injector: Injector) => {
          const componentFactoryResolver: ComponentFactoryResolver =
              injector.get(ComponentFactoryResolver);
          const componentFactory: ComponentFactory<any> =
              componentFactoryResolver.resolveComponentFactory(info.component) !;

          if (!componentFactory) {
            throw new Error(`Expecting ComponentFactory for: ${getTypeName(info.component)}`);
          }

          const injectorPromise = new ParentInjectorPromise(element);
          const facade = new DowngradeComponentAdapter(
              element, attrs, scope, ngModel, injector, $injector, $compile, $parse,
              componentFactory, wrapCallback);

          const projectableNodes = facade.compileContents();
          facade.createComponent(projectableNodes);
          facade.setupInputs(needsNgZone, info.propagateDigest);
          facade.setupOutputs();
          facade.registerCleanup();

          injectorPromise.resolve(facade.getInjector());

          if (ranAsync) {
            // If this is run async, it is possible that it is not run inside a
            // digest and initial input values will not be detected.
            scope.$evalAsync(() => {});
          }
        };

        const downgradeFn = !needsNgZone ? doDowngrade : (injector: Injector) => {
          if (!ngZone) {
            ngZone = injector.get(NgZone);
            wrapCallback = <T>(cb: () => T) => () =>
                NgZone.isInAngularZone() ? cb() : ngZone.run(cb);
          }

          wrapCallback(() => doDowngrade(injector))();
        };

        if (isThenable<Injector>(parentInjector)) {
          parentInjector.then(downgradeFn);
        } else {
          downgradeFn(parentInjector);
        }

        ranAsync = true;
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
  // TODO(issue/24571): remove '!'.
  private injector !: Injector;
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

function isThenable<T>(obj: object): obj is Thenable<T> {
  return isFunction((obj as any).then);
}
