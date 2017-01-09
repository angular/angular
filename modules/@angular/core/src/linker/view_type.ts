/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export enum ViewType {
  // A view that contains the host element with bound component directive.
  // Contains a COMPONENT view
  HOST,
  // The view of the component can contain 0 to n EMBEDDED views
  COMPONENT,
  // A view is embedded into another View via a <ng-template> element inside of a COMPONENT view
  EMBEDDED
}
