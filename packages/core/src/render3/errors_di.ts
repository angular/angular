/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {InjectorType} from '../di/interface/defs';
import {stringify} from '../util/stringify';
import {RuntimeError, RuntimeErrorCode} from './error_code';
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
    ngModuleType?: InjectorType<any>, providers?: any[], provider?: any) {
  let ngModuleDetail = '';
  if (ngModuleType && providers) {
    const providerDetail = providers.map(v => v == provider ? '?' + provider + '?' : '...');
    ngModuleDetail =
        ` - only instances of Provider and Type are allowed, got: [${providerDetail.join(', ')}]`;
  }

  throw new Error(
      `Invalid provider for the NgModule '${stringify(ngModuleType)}'` + ngModuleDetail);
}


/** Throws an error when a token is not found in DI. */
export function throwProviderNotFoundError(token: any, injectorName?: string): never {
  const injectorDetails = injectorName ? ` in ${injectorName}` : '';
  throw new RuntimeError(
      RuntimeErrorCode.PROVIDER_NOT_FOUND,
      `No provider for ${stringifyForError(token)} found${injectorDetails}`);
}
