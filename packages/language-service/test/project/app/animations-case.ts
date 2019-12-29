/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

export function trigger(name: string) {
  return {name};
}

@Component({
  selector: 'animation-case',
  template: `
    <div
      [@.disabled~{disabled}]
      [animate-~{animate-prefix}]
      (@openClose~{trigger}.done)="onAnimationEvent($event)"
      (@openClose.~{event})="onAnimationEvent($event)"
    ></div>
  `,
  animations: [trigger('openClose')]
})
export class AnimationsCaseComponent {
}
