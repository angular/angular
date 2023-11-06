/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Mesh, Vec3} from 'ogl';

import {View} from './view';

import {toRadians} from '../../utils/math';

/**
 * An OGL `Transform` used for the animation of a line instance.
 *
 * The `userData` object is used for the GSAP animation, and the `override update(): void` method
 * applies the values to the `Transform`.
 */
export class LineObject extends View {
  /**
   * Create a line view.
   */
  constructor(
    private readonly origin: Vec3,
    private readonly mesh: Mesh,
    private readonly index: number,
  ) {
    super();

    this.userData['x'] = 0;
    this.userData['y'] = 0;
    this.userData['rotation'] = 0;
    this.userData['scale'] = 1;
    this.userData['opacity'] = 1;
  }

  /**
   * Update position, rotation and scale of the view, and alpha attribute of the geometry.
   */
  override update(): void {
    this.position.x = this.origin.x + this.userData['x'];
    this.position.y = this.origin.y + -this.userData['y']; // Y flipped

    this.rotation.z = -toRadians(this.userData['rotation']);

    this.scale.set(this.userData['scale']);

    this.updateMatrix();

    this.matrix.toArray(this.mesh.geometry.attributes['instanceMatrix'].data, this.index * 16);

    this.mesh.geometry.attributes['instanceOpacity'].data!.set(
      [this.userData['opacity'] * this.parent!.userData['opacity']],
      this.index,
    );
  }
}
