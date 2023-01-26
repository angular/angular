/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {mapToCanActivate, Route} from '@angular/router';

// #docregion CanActivate
@Injectable({providedIn: 'root'})
export class AdminGuard {
  canActivate() {
    return true;
  }
}

const route: Route = {
  path: 'admin',
  canActivate: mapToCanActivate([AdminGuard]),
};
// #enddocregion
