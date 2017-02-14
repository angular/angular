/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// having an import prevents dgeni from truncating out
// the class description in the docs. DO NOT REMOVE.
import {isPresent} from '../facade/lang';

/**
 * `AnimationStyles` consists of a collection of key/value maps containing CSS-based style data
 * that can either be used as initial styling data or apart of a series of keyframes within an
 * animation.
 * This class is mostly internal, and it is designed to be used alongside
 * {@link AnimationKeyframe `AnimationKeyframe`} and {@link Renderer#animate-anchor
 * `Renderer.animate`}.
 *
 * @experimental Animation support is experimental
 */
export class AnimationStyles {
  constructor(public styles: {[key: string]: string | number}[]) {}
}
