/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewChild, ViewContainerRef} from '@angular/core';

@Component({
  selector: 'app-dynamic-comp-root',
  template: `<div #placeToRender></div>`,
})
export class DynamicComponentRoot {
  @ViewChild('placeToRender', {read: ViewContainerRef}) viewContainerRef:
    | ViewContainerRef
    | undefined;

  async ngOnInit() {
    this.viewContainerRef?.clear();
    const {DynamicComponent: component} = await import('./dynamic.component');
    this.viewContainerRef?.createComponent(component);
  }
}
