/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {IMAGE_LOADER, NgOptimizedImage} from '@angular/common';
import {Component} from '../../../../../src/core';

@Component({
  selector: 'basic',
  standalone: true,
  imports: [NgOptimizedImage],
  template: `<img ngSrc="/e2e/a.png" width="150" height="150" priority>`,
  providers: [
    {
      provide: IMAGE_LOADER,
      useValue: () => 'https://angular.io/assets/images/logos/angular/angular.svg',
    },
  ],
})
export class BasicComponent {}
