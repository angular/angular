/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';
import {FieldTree} from '../api/types';

/** A function to register a signal form as a WebMCP tool. */
export const REGISTER_WEBMCP_FORM = new InjectionToken<RegisterWebMcpForm>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'REGISTER_WEBMCP_FORM' : '',
);

/**
 * Registers a Signal Form as a WebMCP tool.
 *
 * @param formTree The form to register.
 * @param options Configuration options for the tool.
 */
export type RegisterWebMcpForm = (
  form: FieldTree<unknown>,
  options: {name: string; description: string},
) => void;
