/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactory, ComponentFactoryResolver, Injector} from '@angular/core';

import * as angular from '../angular_js';

import {ComponentInfo} from './component_info';
import {$INJECTOR, $PARSE, INJECTOR_KEY} from './constants';
import {DowngradeComponentAdapter} from './downgrade_component_adapter';

let downgradeCount = 0;

/**
 * @experimental
 */
export function downgradeComponent(info: ComponentInfo): angular.IInjectable {
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