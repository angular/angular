/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * This module provides a set of common Services.
 */
import { DateService } from './date_service';

export {
  DateService
}

/**
 * A collection of Angular services that are likely to be used in each and every application.
 */
export const COMMON_PROVIDERS = [
  DateService
]
