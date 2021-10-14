/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/*
 * Type definitions for "zone.js". We cannot reference the official types
 * using a triple-slash types directive because the types would bring in
 * the NodeJS types into the compilation unit. This would cause unexpected
 * type checking failures. We just create minimal type definitions for Zone
 * here and use these for our interceptor logic.
 */

declare interface Zone {
  current: any;
}
declare const Zone: Zone | undefined;
declare type ZoneDelegate = Object;
declare type HasTaskState = {microTask: boolean; macroTask: boolean};
