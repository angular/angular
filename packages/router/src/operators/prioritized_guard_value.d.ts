/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Observable, OperatorFunction } from 'rxjs';
import { GuardResult } from '../models';
export declare function prioritizedGuardValue(): OperatorFunction<Observable<GuardResult>[], GuardResult>;
