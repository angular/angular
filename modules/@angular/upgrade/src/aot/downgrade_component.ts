/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactory, ComponentFactoryResolver, Injector, Type} from '@angular/core';

import * as angular from '../angular_js';

import {$INJECTOR, $PARSE, INJECTOR_KEY} from './constants';
import {DowngradeComponentAdapter} from './downgrade_component_adapter';

let downgradeCount = 0;

/**
 * @whatItDoes
 *
 * *Part of the [upgrade/static](/docs/ts/latest/api/#!?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * Allows an Angular 2+ component to be used from Angular 1.
 *
 * @howToUse
 *
 * Let's assume that you have an Angular 2+ component called `ng2Heroes` that needs
 * to be made available in Angular 1 templates.
 *
 * {@example upgrade/static/ts/module.ts region="ng2-heroes"}
 *
 * We must create an Angular 1 [directive](https://docs.angularjs.org/guide/directive)
 * that will make this Angular 2+ component available inside Angular 1 templates.
 * The `downgradeComponent()` function returns a factory function that we
 * can use to define the Angular 1 directive that wraps the "downgraded" component.
 *
 * {@example upgrade/static/ts/module.ts region="ng2-heroes-wrapper"}
 *
 * In this example you can see that we must provide information about the component being
 * "downgraded". This is because once the AoT compiler has run, all metadata about the
 * component has been removed from the code, and so cannot be inferred.
 *
 * We must do the following:
 * * specify the Angular 2+ component class that is to be downgraded
 * * specify all inputs and outputs that the Angular 1 component expects
 *
 * @description
 *
 * A helper function that returns a factory function to be used for registering an
 * Angular 1 wrapper directive for "downgrading" an Angular 2+ component.
 *
 * The parameter contains information about the Component that is being downgraded:
 *
 * * `component: Type<any>`: The type of the Component that will be downgraded
 * * `inputs: string[]`: A collection of strings that specify what inputs the component accepts.
 * * `outputs: string[]`: A collection of strings that specify what outputs the component emits.
 *
 * The `inputs` and `outputs` are strings that map the names of properties to camelCased
 * attribute names. They are of the form `"prop: attr"`; or simply `"propAndAttr" where the
 * property and attribute have the same identifier.
 *
 * @experimental
 */
export function downgradeComponent(info: /* ComponentInfo */ {
  component: Type<any>;
  inputs?: string[];
  outputs?: string[];
}): any /* angular.IInjectable */ {
  const idPrefix = `NG2_UPGRADE_${downgradeCount++}_`;
  let idCount = 0;

  const directiveFactory:
      angular.IAnnotatedFunction = function(
                                       $injector: angular.IInjectorService,
                                       $parse: angular.IParseService): angular.IDirective {

    return {
      restrict: 'E',
      require: '?^' + INJECTOR_KEY,
      link: (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes,
             parentInjector: Injector, transclude: angular.ITranscludeFunction) => {

        if (parentInjector === null) {
          parentInjector = $injector.get(INJECTOR_KEY);
        }

        const componentFactoryResolver: ComponentFactoryResolver =
            parentInjector.get(ComponentFactoryResolver);
        const componentFactory: ComponentFactory<any> =
            componentFactoryResolver.resolveComponentFactory(info.component);

        if (!componentFactory) {
          throw new Error('Expecting ComponentFactory for: ' + info.component);
        }

        const facade = new DowngradeComponentAdapter(
            idPrefix + (idCount++), info, element, attrs, scope, parentInjector, $parse,
            componentFactory);
        facade.setupInputs();
        facade.createComponent();
        facade.projectContent();
        facade.setupOutputs();
        facade.registerCleanup();
      }
    };
  };

  directiveFactory.$inject = [$INJECTOR, $PARSE];
  return directiveFactory;
}