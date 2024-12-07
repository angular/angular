/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InstancedMesh, OGLRenderingContext, Plane, Transform} from 'ogl';

import {View} from './view';
import {LineGlyphProgram} from '../programs/line-glyph-program';
import {LineObject} from './line-object';

import {toRadians} from '../../utils/math';
import {loadTexture} from '../../utils/ogl';

// An index number used for the color of the line instance
enum InstanceColorIndex {
  Pink = 0,
  Purple = 1,
  Red = 2,
}

/**
 * An OGL `Transform` used for the animation of the lines section.
 *
 * The `userData` object is used for the GSAP animation, and the `override update(): void` method
 * applies the values to the `Transform`.
 */
export class Lines extends View {
  private mesh!: InstancedMesh;

  /**
   * Create the container view.
   */
  constructor(
    private readonly gl: OGLRenderingContext,
    private readonly divisions: number,
  ) {
    super();

    this.userData['x'] = 0;
    this.userData['y'] = 0;
    this.userData['rotation'] = 0;
    this.userData['scale'] = 1;
    this.userData['opacity'] = 1;
  }

  /**
   * Initialize geometry, program and mesh for the view.
   */
  override async init(): Promise<void> {
    const texture = await loadTexture(this.gl, 'assets/textures/line-msdf.png');
    texture.minFilter = this.gl.LINEAR;
    texture.generateMipmaps = false;

    const viewWidth = 235;
    const viewHeight = 300;
    const aspect = viewWidth / viewHeight;
    const size = 1.6;
    const width = size * aspect;
    const height = size;
    const widthDivisions = this.divisions;
    const heightDivisions = this.divisions;
    const numInstances = widthDivisions * heightDivisions;

    const geometry = new Plane(this.gl, {width, height});
    geometry.addAttribute('instanceMatrix', {
      instanced: 1,
      size: 16,
      data: new Float32Array(numInstances * 16),
    });
    geometry.addAttribute('instanceColorIndex', {
      instanced: 1,
      size: 1,
      data: new Float32Array(numInstances).map(
        (): InstanceColorIndex => Math.floor(Math.random() * 3),
      ),
    });
    geometry.addAttribute('instanceRandom', {
      instanced: 1,
      size: 1,
      data: new Float32Array(numInstances).map(() => Math.random()),
    });
    geometry.addAttribute('instanceOpacity', {
      instanced: 1,
      size: 1,
      data: new Float32Array(numInstances).fill(1),
    });

    const program = new LineGlyphProgram(this.gl, texture);

    const mesh = new InstancedMesh(this.gl, {geometry, program});
    // TODO: @pschroen add support for instanced mesh frustum culling
    // mesh.addFrustumCull();

    const object = new Transform();

    let index = 0;

    for (let y = 0; y < heightDivisions; y++) {
      for (let x = 0; x < widthDivisions; x++) {
        object.position.set(2 * x, 2 * y, 0);
        object.updateMatrix();

        object.matrix.toArray(mesh.geometry.attributes['instanceMatrix'].data, index * 16);

        const line = new LineObject(object.position.clone(), mesh, index);
        this.addChild(line);

        index++;
      }
    }

    mesh.geometry.attributes['instanceMatrix'].needsUpdate = true;

    // Add instanced mesh last
    this.addChild(mesh);

    this.mesh = mesh;
  }

  /**
   * Update position, rotation and scale of the view, time uniform of the program, and child views.
   */
  override update(time: number): void {
    this.position.x = this.userData['x'];
    this.position.y = -this.userData['y']; // Y flipped

    this.rotation.z = -toRadians(this.userData['rotation']);

    this.scale.set(this.userData['scale']);

    this.mesh.program.uniforms['uTime'].value = time;

    this.children.forEach((node: Transform) => {
      if (node instanceof View) {
        node.update();
      }
    });

    this.mesh.geometry.attributes['instanceMatrix'].needsUpdate = true;
    this.mesh.geometry.attributes['instanceOpacity'].needsUpdate = true;
  }
}
