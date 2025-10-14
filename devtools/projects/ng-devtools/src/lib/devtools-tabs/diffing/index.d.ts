/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DefaultIterableDiffer } from '@angular/core';
export interface MovedRecord {
    currentIndex: number;
    previousIndex: number;
}
export declare const diff: <T>(differ: DefaultIterableDiffer<T>, a: T[], b: T[]) => {
    newItems: T[];
    removedItems: T[];
    movedItems: T[];
};
