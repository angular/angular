/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Underlying strategy used by the NgElement to expose the component's
 * properties on the Custom Element.
 *
 * @experimental
 */
export interface NgElementPropertyStrategy {
  defineElementInputProperty: (element: object, propName: string, templateName: string) => void;
  updateExistingInputProperty: (element: object, propName: string, templateName: string) => void;
}