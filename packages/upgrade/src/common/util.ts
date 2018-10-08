/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, Type} from '@angular/core';
import * as angular from './angular1';
import {DOWNGRADED_MODULE_COUNT_KEY, UPGRADE_APP_TYPE_KEY} from './constants';

const DIRECTIVE_PREFIX_REGEXP = /^(?:x|data)[:\-_]/i;
const DIRECTIVE_SPECIAL_CHARS_REGEXP = /[:\-_]+(.)/g;

export function onError(e: any) {
  // TODO: (misko): We seem to not have a stack trace here!
  if (console.error) {
    console.error(e, e.stack);
  } else {
    // tslint:disable-next-line:no-console
    console.log(e, e.stack);
  }
  throw e;
}

export function controllerKey(name: string): string {
  return '$' + name + 'Controller';
}

export function directiveNormalize(name: string): string {
  return name.replace(DIRECTIVE_PREFIX_REGEXP, '')
      .replace(DIRECTIVE_SPECIAL_CHARS_REGEXP, (_, letter) => letter.toUpperCase());
}

export function getTypeName(type: Type<any>): string {
  // Return the name of the type or the first line of its stringified version.
  return (type as any).overriddenName || type.name || type.toString().split('\n')[0];
}

export function getDowngradedModuleCount($injector: angular.IInjectorService): number {
  return $injector.has(DOWNGRADED_MODULE_COUNT_KEY) ? $injector.get(DOWNGRADED_MODULE_COUNT_KEY) :
                                                      0;
}

export function getUpgradeAppType($injector: angular.IInjectorService): UpgradeAppType {
  return $injector.has(UPGRADE_APP_TYPE_KEY) ? $injector.get(UPGRADE_APP_TYPE_KEY) :
                                               UpgradeAppType.None;
}

export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

export function validateInjectionKey(
    $injector: angular.IInjectorService, downgradedModule: string, injectionKey: string,
    attemptedAction: string): void {
  const upgradeAppType = getUpgradeAppType($injector);
  const downgradedModuleCount = getDowngradedModuleCount($injector);

  // Check for common errors.
  switch (upgradeAppType) {
    case UpgradeAppType.Dynamic:
    case UpgradeAppType.Static:
      if (downgradedModule) {
        throw new Error(
            `Error while ${attemptedAction}: 'downgradedModule' unexpectedly specified.\n` +
            'You should not specify a value for \'downgradedModule\', unless you are downgrading ' +
            'more than one Angular module (via \'downgradeModule()\').');
      }
      break;
    case UpgradeAppType.Lite:
      if (!downgradedModule && (downgradedModuleCount >= 2)) {
        throw new Error(
            `Error while ${attemptedAction}: 'downgradedModule' not specified.\n` +
            'This application contains more than one downgraded Angular module, thus you need to ' +
            'always specify \'downgradedModule\' when downgrading components and injectables.');
      }

      if (!$injector.has(injectionKey)) {
        throw new Error(
            `Error while ${attemptedAction}: Unable to find the specified downgraded module.\n` +
            'Did you forget to downgrade an Angular module or include it in the AngularJS ' +
            'application?');
      }

      break;
    default:
      throw new Error(
          `Error while ${attemptedAction}: Not a valid '@angular/upgrade' application.\n` +
          'Did you forget to downgrade an Angular module or include it in the AngularJS ' +
          'application?');
  }
}

export class Deferred<R> {
  promise: Promise<R>;
  // TODO(issue/24571): remove '!'.
  resolve !: (value?: R | PromiseLike<R>) => void;
  // TODO(issue/24571): remove '!'.
  reject !: (error?: any) => void;

  constructor() {
    this.promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }
}

export interface LazyModuleRef {
  // Whether the AngularJS app has been bootstrapped outside the Angular zone
  // (in which case calls to Angular APIs need to be brought back in).
  needsNgZone: boolean;
  injector?: Injector;
  promise?: Promise<Injector>;
}

export const enum UpgradeAppType {
  // App NOT using `@angular/upgrade`. (This should never happen in an `ngUpgrade` app.)
  None,

  // App using the deprecated `@angular/upgrade` APIs (a.k.a. dynamic `ngUpgrade`).
  Dynamic,

  // App using `@angular/upgrade/static` with `UpgradeModule`.
  Static,

  // App using @angular/upgrade/static` with `downgradeModule()` (a.k.a `ngUpgrade`-lite ).
  Lite,
}

/**
 * @return Whether the passed-in component implements the subset of the
 *     `ControlValueAccessor` interface needed for AngularJS `ng-model`
 *     compatibility.
 */
function supportsNgModel(component: any) {
  return typeof component.writeValue === 'function' &&
      typeof component.registerOnChange === 'function';
}

/**
 * Glue the AngularJS `NgModelController` (if it exists) to the component
 * (if it implements the needed subset of the `ControlValueAccessor` interface).
 */
export function hookupNgModel(ngModel: angular.INgModelController, component: any) {
  if (ngModel && supportsNgModel(component)) {
    ngModel.$render = () => { component.writeValue(ngModel.$viewValue); };
    component.registerOnChange(ngModel.$setViewValue.bind(ngModel));
    if (typeof component.registerOnTouched === 'function') {
      component.registerOnTouched(ngModel.$setTouched.bind(ngModel));
    }
  }
}

/**
 * Test two values for strict equality, accounting for the fact that `NaN !== NaN`.
 */
export function strictEquals(val1: any, val2: any): boolean {
  return val1 === val2 || (val1 !== val1 && val2 !== val2);
}
