/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isEnvironmentProviders} from '../di/interface/provider';
import {RuntimeError, RuntimeErrorCode} from '../errors';
import {Type} from '../interface/type';
import {stringify} from '../util/stringify';

import {stringifyForError} from './util/stringify_utils';


/** Called when directives inject each other (creating a circular dependency) */
export function throwCyclicDependencyError(token: string, path?: string[]): never {
  const depPath = path ? `. Dependency path: ${path.join(' > ')} > ${token}` : '';
  throw new RuntimeError(
      RuntimeErrorCode.CYCLIC_DI_DEPENDENCY,
      `Circular dependency in DI detected for ${token}${depPath}`);
}

export function throwMixedMultiProviderError() {
  throw new Error(`Cannot mix multi providers and regular providers`);
}

export function throwInvalidProviderError(
    ngModuleType?: Type<unknown>, providers?: any[], provider?: any): never {
  if (ngModuleType && providers) {
    const providerDetail = providers.map(v => v == provider ? '?' + provider + '?' : '...');
    throw new Error(`Invalid provider for the NgModule '${
        stringify(ngModuleType)}' - only instances of Provider and Type are allowed, got: [${
        providerDetail.join(', ')}]`);
  } else if (isEnvironmentProviders(provider)) {
    if (provider.ɵfromNgModule) {
      throw new RuntimeError(
          RuntimeErrorCode.PROVIDER_IN_WRONG_CONTEXT,
          `Invalid providers from 'importProvidersFrom' present in a non-environment injector. 'importProvidersFrom' can't be used for component providers.`);
    } else {
      throw new RuntimeError(
          RuntimeErrorCode.PROVIDER_IN_WRONG_CONTEXT,
          `Invalid providers present in a non-environment injector. 'EnvironmentProviders' can't be used for component providers.`);
    }
  } else {
    throw new Error('Invalid provider');
  }
}


/** Throws an error when a token is not found in DI. */
export function throwProviderNotFoundError(token: any, injectorName?: string): never {
  const injectorDetails = injectorName ? ` in ${injectorName}` : '';
  throw new RuntimeError(
      RuntimeErrorCode.PROVIDER_NOT_FOUND,
      ngDevMode && `No provider for ${stringifyForError(token)} found${injectorDetails}`);
}
