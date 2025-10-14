/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare class CookieRecipe {
    count: import("@angular/core").WritableSignal<number>;
    butter: import("@angular/core").Signal<number>;
    sugar: import("@angular/core").Signal<number>;
    flour: import("@angular/core").Signal<number>;
    update(event: Event): void;
}
