/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, ElementRef, inject, input} from '@angular/core';

/**
 * Use on elements that are deemed to be animation layers.
 */
@Directive({
  selector: '[adevAnimationLayer]',
})
export class AnimationLayerDirective {
  readonly elementRef = inject(ElementRef);

  readonly id = input.required<string>({alias: 'layerId'});
}
