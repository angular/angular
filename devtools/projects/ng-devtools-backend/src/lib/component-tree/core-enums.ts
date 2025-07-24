/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Need to be kept in sync with Angular framework
// We can't directly import it from framework now
// because this also pulls up the security policies
// for Trusted Types, which we reinstantiate.
export enum ChangeDetectionStrategy {
  OnPush = 0,
  Default = 1,
}

export enum AcxChangeDetectionStrategy {
  Default = 0,
  OnPush = 1,
}

export enum Framework {
  Angular = 'angular',
  ACX = 'acx',
  Wiz = 'wiz',
}
