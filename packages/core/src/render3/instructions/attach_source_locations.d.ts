/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Sets the location within the source template at which
 * each element in the current view was defined.
 *
 * @param index Index at which the DOM node was created.
 * @param templatePath Path to the template at which the node was defined.
 * @param locations Element locations to which to attach the source location.
 *
 * @codeGenApi
 */
export declare function ɵɵattachSourceLocations(templatePath: string, locations: [index: number, offset: number, line: number, column: number][]): void;
