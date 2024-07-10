/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Color, OGLRenderingContext, Vec2} from 'ogl';

import {AngularGlyph} from './angular-glyph';
import {AngularLogo} from './angular-logo';
import {View} from './view';

import {toRadians} from '../../utils/math';
import {loadTexture} from '../../utils/ogl';

/**
 * An OGL `Transform` used for the animation of the Angular logo.
 *
 * The `userData` object is used for the GSAP animation, and the `override update(): void` method
 * applies the values to the `Transform`.
 */
export class Angular extends View {
  private viewWidth = 700;
  private viewHeight = 172;
  private viewScale = 1;
  private origin: Vec2;

  /**
   * Create the Angular logo view.
   */
  constructor(private readonly gl: OGLRenderingContext) {
    super();

    this.userData['x'] = 0;
    this.userData['y'] = 0;
    this.userData['rotation'] = 0;
    this.userData['scale'] = 1;
    this.userData['opacity'] = 1;

    this.origin = new Vec2();
  }

  /**
   * Initialize child views.
   */
  override async init(): Promise<void> {
    const logo = new AngularLogo(this.gl, new Color(1, 1, 1));
    this.addChild(logo);

    const msdf = await Promise.all([
      loadTexture(this.gl, 'assets/textures/logo-2-msdf.png'),
      loadTexture(this.gl, 'assets/textures/logo-3-msdf.png'),
      loadTexture(this.gl, 'assets/textures/logo-4-msdf.png'),
      loadTexture(this.gl, 'assets/textures/logo-5-msdf.png'),
      loadTexture(this.gl, 'assets/textures/logo-6-msdf.png'),
      loadTexture(this.gl, 'assets/textures/logo-7-msdf.png'),
      loadTexture(this.gl, 'assets/textures/logo-8-msdf.png'),
      loadTexture(this.gl, 'assets/textures/logo-9-msdf.png'),
    ]);

    msdf.forEach((texture, i) => {
      texture.minFilter = this.gl.LINEAR;
      texture.generateMipmaps = false;

      const glyph = new AngularGlyph(
        this.gl,
        texture,
        new Color(1, 1, 1),
        i < 1 ? new Vec2(0.5 - 0.1123, 0) : new Vec2(0.5, -0.5),
      );
      this.addChild(glyph);
    });
  }

  /**
   * Update size and position of the view, based on the size of the screen.
   */
  override resize(width: number, height: number, dpr: number, scale: number): void {
    this.viewScale = scale;

    this.userData['width'] = this.viewWidth * this.viewScale;
    this.userData['height'] = this.viewHeight * this.viewScale;

    // Centered
    this.origin.set(
      Math.round((width - this.userData['width']) / 2),
      Math.round((height - this.userData['height']) / 2),
    );
  }

  /**
   * Update position, rotation and scale of the view, and child views.
   */
  override update(): void {
    this.position.x = this.origin.x + this.userData['x'];
    this.position.y = -this.origin.y + -this.userData['y']; // Y flipped

    this.rotation.z = -toRadians(this.userData['rotation']);

    this.scale.set(this.viewScale * this.userData['scale']);

    this.children.forEach((node) => {
      node.update();
    });
  }
}
