/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, ViewContainerRef, inject} from '@angular/core';

@Directive({
  selector: '[appDynamic]',
  standalone: true,
})
export class DynamicDirective {
  private viewContainerRef = inject(ViewContainerRef);

  async ngOnInit() {
    this.viewContainerRef.clear();
    const {DynamicComponent: component} = await import('./dynamic.component');
    this.viewContainerRef.createComponent(component);
  }
}

@Component({
  selector: 'app-dynamic-comp-root',
  standalone: true,
  imports: [DynamicDirective],
  template: `<ng-template appDynamic></ng-template>`,
})
export class DynamicComponentRoot {}
