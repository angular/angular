/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵIMAGE_LOADER as IMAGE_LOADER, ɵNgOptimizedImage as NgOptimizedImage} from '@angular/common';
import {Component} from '@angular/core';

@Component({
  selector: 'basic',
  standalone: true,
  imports: [NgOptimizedImage],
  template: `<img rawSrc="./a.png" width="150" height="150" priority>`,
  providers: [{provide: IMAGE_LOADER, useValue: () => 'b.png'}],
})
export class BasicComponent {
}
