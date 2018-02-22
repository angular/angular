/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  Directive,
  ViewContainerRef,
} from '@angular/core';

/**
 * Outlet for nested CdkNode. Put `[cdkTreeNodeOutlet]` on a tag to place children dataNodes
 * inside the outlet.
 */
@Directive({
  selector: '[cdkTreeNodeOutlet]'
})
export class CdkTreeNodeOutlet {
  constructor(public viewContainer: ViewContainerRef) {}
}
