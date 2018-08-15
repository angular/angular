/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationMetadata, AnimationOptions} from './animation_metadata';
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
 * 1. Use the `build()` method to create a programmatic animation using the
 * `animate()` function. The method returns an `AnimationFactory` instance.
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
 */
export abstract class AnimationBuilder {
  /**
   * Builds a factory for producing a defined animation.
   * @param animation A reusable animation definition.
   * @returns A factory object that can create a player for the defined animation.
   * @see `animate()`
   */
  abstract build(animation: AnimationMetadata|AnimationMetadata[]): AnimationFactory;
}

/**
 * A factory object returned from the `AnimationBuilder`.`build()` method.
 *
 * @publicApi
 */
export abstract class AnimationFactory {
  /**
   * Creates an `AnimationPlayer` instance for the reusable animation defined by
   * the `AnimationBuilder`.`build()` method that created this factory.
   * Attaches the new player a DOM element.
   * @param element The DOM element to which to attach the animation.
   * @param options A set of options that can include a time delay and
   * additional developer-defined parameters.
   */
  abstract create(element: any, options?: AnimationOptions): AnimationPlayer;
}
