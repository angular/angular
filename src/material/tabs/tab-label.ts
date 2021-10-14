/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  Inject,
  InjectionToken,
  Optional,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {CdkPortal} from '@angular/cdk/portal';

/**
 * Injection token that can be used to reference instances of `MatTabLabel`. It serves as
 * alternative token to the actual `MatTabLabel` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_TAB_LABEL = new InjectionToken<MatTabLabel>('MatTabLabel');

/**
 * Used to provide a tab label to a tab without causing a circular dependency.
 * @docs-private
 */
export const MAT_TAB = new InjectionToken<any>('MAT_TAB');

/** Used to flag tab labels for use with the portal directive */
@Directive({
  selector: '[mat-tab-label], [matTabLabel]',
  providers: [{provide: MAT_TAB_LABEL, useExisting: MatTabLabel}],
})
export class MatTabLabel extends CdkPortal {
  constructor(
    templateRef: TemplateRef<any>,
    viewContainerRef: ViewContainerRef,
    @Inject(MAT_TAB) @Optional() public _closestTab: any,
  ) {
    super(templateRef, viewContainerRef);
  }
}
