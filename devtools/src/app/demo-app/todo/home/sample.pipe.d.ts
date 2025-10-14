/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { OnDestroy, PipeTransform } from '@angular/core';
export declare class SamplePipe implements PipeTransform, OnDestroy {
    transform(val: unknown): unknown;
    ngOnDestroy(): void;
}
