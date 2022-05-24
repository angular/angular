/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵIMAGE_LOADER as IMAGE_LOADER, ɵNgOptimizedImageModule as NgOptimizedImageModule} from '@angular/common';
import {Component} from '@angular/core';

@Component({
  selector: 'basic',
  standalone: true,
  imports: [NgOptimizedImageModule],
  template: `<img rawSrc="/e2e/a.png" width="150" height="150" priority>`,
  providers: [{provide: IMAGE_LOADER, useValue: () => '/e2e/b.png'}],
})
export class BasicComponent {
}
