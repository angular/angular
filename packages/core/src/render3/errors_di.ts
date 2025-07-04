/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {ProviderToken} from '../di';
import {isEnvironmentProviders} from '../di/interface/provider';
import {formatRuntimeError, RuntimeError, RuntimeErrorCode} from '../errors';
import {Type} from '../interface/type';
import {stringify} from '../util/stringify';

import {stringifyForError} from './util/stringify_utils';

const NG_RUNTIME_ERROR_CODE = 'ngErrorCode';
const NG_RUNTIME_ERROR_MESSAGE = 'ngErrorMessage';
const NG_TOKEN_PATH = 'ngTokenPath';

/** Creates a circular dependency runtime error. */
export function cyclicDependencyError(token: string, path?: string[]): Error {
  const message = ngDevMode ? `Circular dependency detected for \`${token}\`.` : '';
  return createRuntimeError(message, RuntimeErrorCode.CYCLIC_DI_DEPENDENCY, path);
}

/** Creates a circular dependency runtime error including a dependency path in the error message. */
export function cyclicDependencyErrorWithDetails(token: string, path: string[]): Error {
  return augmentRuntimeError(cyclicDependencyError(token, path), null);
}

export function throwMixedMultiProviderError() {
  throw new Error(`Cannot mix multi providers and regular providers`);
}

export function throwInvalidProviderError(
  ngModuleType?: Type<unknown>,
  providers?: any[],
  provider?: any,
): never {
  if (ngModuleType && providers) {
    const providerDetail = providers.map((v) => (v == provider ? '?' + provider + '?' : '...'));
    throw new Error(
      `Invalid provider for the NgModule '${stringify(
        ngModuleType,
      )}' - only instances of Provider and Type are allowed, got: [${providerDetail.join(', ')}]`,
    );
  } else if (isEnvironmentProviders(provider)) {
    if (provider.ɵfromNgModule) {
      throw new RuntimeError(
        RuntimeErrorCode.PROVIDER_IN_WRONG_CONTEXT,
        `Invalid providers from 'importProvidersFrom' present in a non-environment injector. 'importProvidersFrom' can't be used for component providers.`,
      );
    } else {
      throw new RuntimeError(
        RuntimeErrorCode.PROVIDER_IN_WRONG_CONTEXT,
        `Invalid providers present in a non-environment injector. 'EnvironmentProviders' can't be used for component providers.`,
      );
    }
  } else {
    throw new Error('Invalid provider');
  }
}

/** Throws an error when a token is not found in DI. */
export function throwProviderNotFoundError(
  token: ProviderToken<unknown>,
  injectorName?: string,
): never {
  const errorMessage =
    ngDevMode &&
    `No provider for ${stringifyForError(token)} found${injectorName ? ` in ${injectorName}` : ''}`;
  throw new RuntimeError(RuntimeErrorCode.PROVIDER_NOT_FOUND, errorMessage);
}

/**
 * Given an Error instance and the current token - update the monkey-patched
 * dependency path info to include that token.
 *
 * @param error Current instance of the Error class.
 * @param token Extra token that should be appended.
 */
export function prependTokenToDependencyPath(error: any, token: unknown): void {
  error[NG_TOKEN_PATH] ??= [];
  // Append current token to the current token path. Since the error
  // is bubbling up, add the token in front of other tokens.
  const currentPath = error[NG_TOKEN_PATH];
  // Do not append the same token multiple times.
  if (currentPath[0] !== token) {
    error[NG_TOKEN_PATH].unshift(token);
  }
}

/**
 * Modifies an Error instance with an updated error message
 * based on the accumulated dependency path.
 *
 * @param error Current instance of the Error class.
 * @param source Extra info about the injector which started
 *    the resolution process, which eventually failed.
 */
export function augmentRuntimeError(error: any, source: string | null): Error {
  const tokenPath: string[] = error[NG_TOKEN_PATH];
  const errorCode = error[NG_RUNTIME_ERROR_CODE];
  const message = error[NG_RUNTIME_ERROR_MESSAGE] || error.message;
  error.message = formatErrorMessage(message, errorCode, tokenPath, source);
  return error;
}

/**
 * Creates an initial RuntimeError instance when a problem is detected.
 * Monkey-patches extra info in the RuntimeError instance, so that it can
 * be reused later, before throwing the final error.
 */
export function createRuntimeError(message: string, code: number, path?: string[]): Error {
  // Cast to `any`, so that extra info can be monkey-patched onto this instance.
  const error = new RuntimeError(code, message) as any;

  // Monkey-patch a runtime error code and a path onto an Error instance.
  error[NG_RUNTIME_ERROR_CODE] = code;
  error[NG_RUNTIME_ERROR_MESSAGE] = message;
  if (path) {
    error[NG_TOKEN_PATH] = path;
  }
  return error;
}

/**
 * Reads monkey-patched error code from the given Error instance.
 */
export function getRuntimeErrorCode(error: any): number | undefined {
  return error[NG_RUNTIME_ERROR_CODE];
}

function formatErrorMessage(
  text: string,
  code: number,
  path: string[] = [],
  source: string | null = null,
): string {
  let pathDetails = '';
  // If the path is empty or contains only one element (self) -
  // do not append additional info the error message.
  if (path && path.length > 1) {
    pathDetails = ` Path: ${path.map(stringifyForError).join(' -> ')}.`;
  }
  const sourceDetails = source ? ` Source: ${source}.` : '';
  return formatRuntimeError(code, `${text}${sourceDetails}${pathDetails}`);
}
