/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationStyles} from './animation_styles';

/**
 * `AnimationKeyframe` consists of a series of styles (contained within {@link AnimationStyles
 * `AnimationStyles`})
 * and an offset value indicating when those styles are applied within the `duration/delay/easing`
 * timings.
 * `AnimationKeyframe` is mostly an internal class which is designed to be used alongside {@link
 * Renderer#animate-anchor `Renderer.animate`}.
 *
 * @experimental Animation support is experimental
 */
export class AnimationKeyframe {
  constructor(public offset: number, public styles: AnimationStyles) {}
}
