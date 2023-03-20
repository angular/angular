/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {IMAGE_LOADER, NgOptimizedImageModule} from '@angular/common';
import {Component, NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'basic',
  template: `<img ngSrc="/e2e/a.png" width="150" height="150" priority>`,
})
export class BasicComponent {
}

@NgModule({
  declarations: [BasicComponent],
  imports: [
    NgOptimizedImageModule,
    RouterModule.forChild([{
      path: '',
      component: BasicComponent,
    }]),
  ],
  providers: [{
    provide: IMAGE_LOADER,
    useValue: () => 'https://angular.io/assets/images/logos/angular/angular.svg'
  }]
})
export class BasicModule {
}
