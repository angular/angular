/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Camera,
  Color,
  Mesh,
  OGLRenderingContext,
  RenderTarget,
  Renderer,
  Transform,
  Triangle,
} from 'ogl';

import {MaskProgram} from './programs/mask-program';
import {GradientView} from './views/gradient-view';
import {AngularView} from './views/angular-view';
import {LinesView} from './views/lines-view';
import {BuildView} from './views/build-view';

import {BREAKPOINT} from '../home-animation-constants';

/**
 * Controller class for managing the WebGL canvas, OGL renderer and scenes.
 */
export class Canvas {
  private renderer!: Renderer;
  private gl!: OGLRenderingContext;
  private gradientScene!: Transform;
  private gradientCamera!: Camera;
  private angularScene!: Transform;
  private angularCamera!: Camera;
  private linesScene!: Transform;
  private linesCamera!: Camera;
  private buildScene!: Transform;
  private buildCamera!: Camera;
  private screen!: Mesh;
  private renderTargetA!: RenderTarget;
  private renderTargetB!: RenderTarget;
  private maskProgram!: MaskProgram;

  private currentClearColor: Color = new Color();
  private needsUpdate: boolean = false;

  gradient!: GradientView;
  angular!: AngularView;
  lines!: LinesView;
  build!: BuildView;

  linesProgress = 0;

  /**
   * Create the controller.
   */
  constructor(
    private readonly element: Element,
    private readonly document: Document,
    private readonly window: Window,
  ) {
    this.init();
    this.initMesh();
    this.initViews();
  }

  /**
   * Initialize the OGL renderer and scenes.
   */
  init(): void {
    this.renderer = new Renderer({
      powerPreference: 'high-performance',
      depth: false,
    });
    this.gl = this.renderer.gl;
    this.element.appendChild(this.gl.canvas as HTMLCanvasElement);

    // Gradient scene
    this.gradientScene = new Transform();
    this.gradientCamera = new Camera(this.gl, {
      left: -1,
      right: 1,
      top: 1,
      bottom: -1,
      near: 0,
      far: 1,
    });

    // Angular scene
    this.angularScene = new Transform();
    this.angularCamera = new Camera(this.gl, {
      left: -1,
      right: 1,
      top: 1,
      bottom: -1,
      near: 0,
      far: 1,
    });

    // Lines scene
    this.linesScene = new Transform();
    this.linesCamera = new Camera(this.gl, {fov: 30, near: 0.5, far: 40});
    this.linesCamera.position.z = 10;
    this.linesCamera.lookAt([0, 0, 0]);

    // Build scene
    this.buildScene = new Transform();
    this.buildCamera = new Camera(this.gl, {
      left: -1,
      right: 1,
      top: 1,
      bottom: -1,
      near: 0,
      far: 1,
    });
  }

  /**
   * Initialize a fullscreen triangle geometry and mesh for rendering scene composites or
   * post-processing, plus render targets and programs.
   */
  initMesh(): void {
    // Fullscreen triangle
    const geometry = new Triangle(this.gl);
    this.screen = new Mesh(this.gl, {geometry});
    this.screen.frustumCulled = false;

    // Render targets
    this.renderTargetA = new RenderTarget(this.gl, {depth: false});
    this.renderTargetB = new RenderTarget(this.gl, {depth: false});

    // Mask program
    this.maskProgram = new MaskProgram(this.gl, this.window);
    this.maskProgram.uniforms['tMap'].value = this.renderTargetA.texture;
    this.maskProgram.uniforms['tMask'].value = this.renderTargetB.texture;
    this.screen.program = this.maskProgram;
  }

  /**
   * Initialize views.
   */
  initViews(): void {
    this.gradient = new GradientView(this.gl, this.document, this.window);
    this.gradientScene.addChild(this.gradient);

    this.angular = new AngularView(this.gl);
    this.angularScene.addChild(this.angular);

    this.lines = new LinesView(this.gl);
    this.linesScene.addChild(this.lines);

    this.build = new BuildView(this.gl, this.document);
    this.buildScene.addChild(this.build);
  }

  /**
   * Theme event handler.
   */
  theme(): void {
    const rootStyle = getComputedStyle(this.document.querySelector(':root')!);

    this.currentClearColor.set(rootStyle.getPropertyValue('--webgl-page-background').trim());
    this.gl.clearColor(
      ...(this.currentClearColor as unknown as [red: number, green: number, blue: number]),
      1,
    );

    // Views
    this.gradient.theme();
  }

  /**
   * Resize event handler.
   */
  resize(width: number, height: number, dpr: number, scale: number): void {
    this.renderer.dpr = dpr;
    this.renderer.setSize(width, height);

    // Views
    this.gradient.resize(width, height, dpr, scale);
    this.angular.resize(width, height, dpr, scale);
    this.build.resize(width, height, dpr, scale);

    // Gradient scene
    this.gradientCamera.left = -width / 2;
    this.gradientCamera.right = width / 2;
    this.gradientCamera.top = height / 2;
    this.gradientCamera.bottom = -height / 2;
    this.gradientCamera.orthographic();
    // The camera position is offset for 2D positioning of objects top left
    this.gradientCamera.position.x = width / 2;
    this.gradientCamera.position.y = -height / 2;

    // Angular scene
    this.angularCamera.left = -width / 2;
    this.angularCamera.right = width / 2;
    this.angularCamera.top = height / 2;
    this.angularCamera.bottom = -height / 2;
    this.angularCamera.orthographic();
    // The camera position is offset for 2D positioning of objects top left
    this.angularCamera.position.x = width / 2;
    this.angularCamera.position.y = -height / 2;

    // Lines scene
    this.linesCamera.aspect = width / height;
    this.linesCamera.perspective();

    if (width < BREAKPOINT) {
      this.linesCamera.position.z = 20;
    } else {
      this.linesCamera.position.z = height / 60;
    }

    // Build scene
    this.buildCamera.left = -width / 2;
    this.buildCamera.right = width / 2;
    this.buildCamera.top = height / 2;
    this.buildCamera.bottom = -height / 2;
    this.buildCamera.orthographic();
    // The camera position is offset for 2D positioning of objects top left
    this.buildCamera.position.x = width / 2;
    this.buildCamera.position.y = -height / 2;

    // Render targets
    const effectiveWidth = width * dpr;
    const effectiveHeight = height * dpr;

    this.renderTargetA.setSize(effectiveWidth, effectiveHeight);
    this.renderTargetB.setSize(effectiveWidth, effectiveHeight);
  }

  /**
   * Update event handler.
   */
  update(time: number, deltaTime: number, frame: number, progress: number): void {
    // Reset gradient progress
    if (progress >= 0 && progress <= 0.16) {
      this.gradient.background.userData['progress'] = 0;
    }

    this.gradient.update(time);
    this.angular.update();
    this.lines.update(time);
    this.build.update();

    // Disable animation at end of page
    if (
      !this.gradient.visible &&
      !this.angular.visible &&
      !this.lines.visible &&
      !this.build.visible
    ) {
      if (this.needsUpdate) {
        this.needsUpdate = false;
      } else {
        return;
      }
    } else {
      this.needsUpdate = true;
    }

    const {renderer, renderTargetA, renderTargetB} = this;

    // Gradient pass
    renderer.render({
      scene: this.gradientScene,
      camera: this.gradientCamera,
      target: renderTargetA,
    });

    // Angular pass (mask on transparent background)
    this.gl.clearColor(0, 0, 0, 0);
    renderer.render({
      scene: this.angularScene,
      camera: this.angularCamera,
      target: renderTargetB,
    });

    // Build pass (mask on transparent background)
    renderer.render({
      scene: this.buildScene,
      camera: this.buildCamera,
      target: renderTargetB,
      clear: false,
    });

    // Set clear color back to default
    this.gl.clearColor(
      ...(this.currentClearColor as unknown as [red: number, green: number, blue: number]),
      1,
    );

    // Mask pass (render to screen)
    renderer.render({scene: this.screen});

    // Camera parallax/pan/zoom by moving the entire scene
    this.linesScene.position.z = -6 + 6 * (1 - (-0.5 + this.linesProgress));
    this.linesCamera.lookAt([0, 0, 0]);

    // Lines pass
    renderer.render({
      scene: this.linesScene,
      camera: this.linesCamera,
      clear: false,
    });
  }

  /**
   * Promise for the views when they're ready.
   */
  ready(): Promise<void[]> {
    return Promise.all([
      this.gradient.ready(),
      this.angular.ready(),
      this.lines.ready(),
      this.build.ready(),
    ]);
  }

  /**
   * Destroys the views, all child views and WebGL context.
   */
  destroy(): void {
    this.gradient.destroy();
    this.angular.destroy();
    this.lines.destroy();
    this.build.destroy();

    const extension = this.gl.getExtension('WEBGL_lose_context');
    if (extension) extension.loseContext();
  }
}
