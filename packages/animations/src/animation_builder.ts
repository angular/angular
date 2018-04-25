/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationMetadata, AnimationOptions} from './animation_metadata';
import {AnimationPlayer} from './players/animation_player';

/**
 * @description An injectable service that produces an animation sequence 
 * programmatically within an Angular component or directive.
 *
 * @usageNotes
 * This service is available to apps that use the {@link BrowserAnimationsModule BrowserAnimationsModule} or 
 * {@link NoopAnimationsModule NoopAnimationsModule} modules.
 *
 * - Use the 'build()` method to define an animation, using animation functions.  
 *  -- The `build()` method returns an {@link AnimationFactory AnimationFactory}. 
 * - When you attach the defined animation to an element, use the factory's `create()` method 
 *   to create an {@link AnimationPlayer AnimationPlayer} instance. 
 * - Use {@link AnimationPlayer AnimationPlayer} methods to control the animation. 
 * 
 * Here's an example; remember to include the {@link BrowserAnimationsModule BrowserAnimationsModule} for this to work.
 *
 * ```ts
 * import {AnimationBuilder} from '@angular/animations';
 *
 * class MyCmp {
 *   constructor(private _builder: AnimationBuilder) {}
 *
 *   makeAnimation(element: any) {
 *     // first build the animation
 *     const myAnimation = this._builder.build([
 *       style({ width: 0 }),
 *       animate(1000, style({ width: '100px' }))
 *     ]);
 *
 *     // then create a player from it
 *     const player = myAnimation.create(element);
 *
 *     player.play();
 *   }
 * }
 * ```
 */
export abstract class AnimationBuilder {

  /**
   * Creates a factory instance with which to run a given animation. 
   * 
   * @param animation One or more animation definitions of any type,
   *   created with animation functions.
   * @see {@link AnimationMetadataType AnimationMetadataType}
   */
  abstract build(animation: AnimationMetadata|AnimationMetadata[]): AnimationFactory;
}

/**
 * Creates an {@link AnimationPlayer AnimationPlayer} that can then be
 * used to attach an associated animation to an element and start it.
 * 
 * Created and returned by {@link AnimationBuilder#build AnimationBuilder.build}.
 *
 */
export abstract class AnimationFactory {
  /**
   * Creates an animation player for a given element. 
   * Use the player's methods to control the animation. 
   * 
   * @param element The element to be animated.
   * @param options  Optional. An options object that can contain a delay and 
   *    override values for developer-defined parameters.
   * @returns An {@link AnimationPlayer AnimationPlayer} instance. 
   */
  abstract create(element: any, options?: AnimationOptions): AnimationPlayer;
}
