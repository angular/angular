/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {DOCUMENT} from '@angular/common';
import {
  ANIMATION_MODULE_TYPE,
  Inject,
  inject,
  Injectable,
  Renderer2,
  RendererFactory2,
  RendererType2,
  ViewEncapsulation,
  ɵAnimationRendererType as AnimationRendererType,
  ɵRuntimeError as RuntimeError,
} from '@angular/core';

import {AnimationMetadata, AnimationOptions, sequence} from './animation_metadata';
import {RuntimeErrorCode} from './errors';
import {AnimationPlayer} from './players/animation_player';

/**
 * An injectable service that produces an animation sequence programmatically within an
 * Angular component or directive.
 * Provided by the `BrowserAnimationsModule` or `NoopAnimationsModule`.
 *
 * @usageNotes
 *
 * To use this service, add it to your component or directive as a dependency.
 * The service is instantiated along with your component.
 *
 * Apps do not typically need to create their own animation players, but if you
 * do need to, follow these steps:
 *
 * 1. Use the <code>[AnimationBuilder.build](api/animations/AnimationBuilder#build)()</code> method
 * to create a programmatic animation. The method returns an `AnimationFactory` instance.
 *
 * 2. Use the factory object to create an `AnimationPlayer` and attach it to a DOM element.
 *
 * 3. Use the player object to control the animation programmatically.
 *
 * For example:
 *
 * ```ts
 * // import the service from BrowserAnimationsModule
 * import {AnimationBuilder} from '@angular/animations';
 * // require the service as a dependency
 * class MyCmp {
 *   constructor(private _builder: AnimationBuilder) {}
 *
 *   makeAnimation(element: any) {
 *     // first define a reusable animation
 *     const myAnimation = this._builder.build([
 *       style({ width: 0 }),
 *       animate(1000, style({ width: '100px' }))
 *     ]);
 *
 *     // use the returned factory object to create a player
 *     const player = myAnimation.create(element);
 *
 *     player.play();
 *   }
 * }
 * ```
 *
 * @publicApi
 *
 * @deprecated 20.2 Use `animate.enter` or `animate.leave` instead. Intent to remove in v23
 */
@Injectable({providedIn: 'root', useFactory: () => inject(BrowserAnimationBuilder)})
export abstract class AnimationBuilder {
  /**
   * Builds a factory for producing a defined animation.
   * @param animation A reusable animation definition.
   * @returns A factory object that can create a player for the defined animation.
   * @see {@link animate}
   */
  abstract build(animation: AnimationMetadata | AnimationMetadata[]): AnimationFactory;
}

/**
 * A factory object returned from the
 * <code>[AnimationBuilder.build](api/animations/AnimationBuilder#build)()</code>
 * method.
 *
 * @publicApi
 *
 * @deprecated 20.2 Use `animate.enter` or `animate.leave` instead. Intent to remove in v23
 */
export abstract class AnimationFactory {
  /**
   * Creates an `AnimationPlayer` instance for the reusable animation defined by
   * the <code>[AnimationBuilder.build](api/animations/AnimationBuilder#build)()</code>
   * method that created this factory and attaches the new player a DOM element.
   *
   * @param element The DOM element to which to attach the player.
   * @param options A set of options that can include a time delay and
   * additional developer-defined parameters.
   */
  abstract create(element: any, options?: AnimationOptions): AnimationPlayer;
}

@Injectable({providedIn: 'root'})
export class BrowserAnimationBuilder extends AnimationBuilder {
  private animationModuleType = inject(ANIMATION_MODULE_TYPE, {optional: true});
  private _nextAnimationId = 0;
  private _renderer: Renderer2;

  constructor(rootRenderer: RendererFactory2, @Inject(DOCUMENT) doc: Document) {
    super();
    const typeData: RendererType2 = {
      id: '0',
      encapsulation: ViewEncapsulation.None,
      styles: [],
      data: {animation: []},
    };
    this._renderer = rootRenderer.createRenderer(doc.body, typeData);

    if (this.animationModuleType === null && !isAnimationRenderer(this._renderer)) {
      // We only support AnimationRenderer & DynamicDelegationRenderer for this AnimationBuilder

      throw new RuntimeError(
        RuntimeErrorCode.BROWSER_ANIMATION_BUILDER_INJECTED_WITHOUT_ANIMATIONS,
        (typeof ngDevMode === 'undefined' || ngDevMode) &&
          'Angular detected that the `AnimationBuilder` was injected, but animation support was not enabled. ' +
            'Please make sure that you enable animations in your application by calling `provideAnimations()` or `provideAnimationsAsync()` function.',
      );
    }
  }

  override build(animation: AnimationMetadata | AnimationMetadata[]): AnimationFactory {
    const id = this._nextAnimationId;
    this._nextAnimationId++;
    const entry = Array.isArray(animation) ? sequence(animation) : animation;
    issueAnimationCommand(this._renderer, null, id, 'register', [entry]);
    return new BrowserAnimationFactory(id, this._renderer);
  }
}

class BrowserAnimationFactory extends AnimationFactory {
  constructor(
    private _id: number,
    private _renderer: Renderer2,
  ) {
    super();
  }

  override create(element: any, options?: AnimationOptions): AnimationPlayer {
    return new RendererAnimationPlayer(this._id, element, options || {}, this._renderer);
  }
}

class RendererAnimationPlayer implements AnimationPlayer {
  public parentPlayer: AnimationPlayer | null = null;
  private _started = false;

  constructor(
    public id: number,
    public element: any,
    options: AnimationOptions,
    private _renderer: Renderer2,
  ) {
    this._command('create', options);
  }

  private _listen(eventName: string, callback: (event: any) => any): () => void {
    return this._renderer.listen(this.element, `@@${this.id}:${eventName}`, callback);
  }

  private _command(command: string, ...args: any[]): void {
    issueAnimationCommand(this._renderer, this.element, this.id, command, args);
  }

  onDone(fn: () => void): void {
    this._listen('done', fn);
  }

  onStart(fn: () => void): void {
    this._listen('start', fn);
  }

  onDestroy(fn: () => void): void {
    this._listen('destroy', fn);
  }

  init(): void {
    this._command('init');
  }

  hasStarted(): boolean {
    return this._started;
  }

  play(): void {
    this._command('play');
    this._started = true;
  }

  pause(): void {
    this._command('pause');
  }

  restart(): void {
    this._command('restart');
  }

  finish(): void {
    this._command('finish');
  }

  destroy(): void {
    this._command('destroy');
  }

  reset(): void {
    this._command('reset');
    this._started = false;
  }

  setPosition(p: number): void {
    this._command('setPosition', p);
  }

  getPosition(): number {
    return unwrapAnimationRenderer(this._renderer)?.engine?.players[this.id]?.getPosition() ?? 0;
  }

  public totalTime = 0;
}

function issueAnimationCommand(
  renderer: Renderer2,
  element: any,
  id: number,
  command: string,
  args: any[],
): void {
  renderer.setProperty(element, `@@${id}:${command}`, args);
}

/**
 * The following 2 methods cannot reference their correct types (AnimationRenderer &
 * DynamicDelegationRenderer) since this would introduce a import cycle.
 */

function unwrapAnimationRenderer(
  renderer: Renderer2,
): {engine: {players: AnimationPlayer[]}} | null {
  const type = (renderer as unknown as {ɵtype: AnimationRendererType}).ɵtype;
  if (type === AnimationRendererType.Regular) {
    return renderer as any;
  } else if (type === AnimationRendererType.Delegated) {
    return (renderer as any).animationRenderer;
  }

  return null;
}

function isAnimationRenderer(renderer: Renderer2): boolean {
  const type = (renderer as unknown as {ɵtype: AnimationRendererType}).ɵtype;
  return type === AnimationRendererType.Regular || type === AnimationRendererType.Delegated;
}
