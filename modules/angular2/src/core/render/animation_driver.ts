import {NoOpAnimationPlayer, AnimationPlayer} from 'angular2/src/core/animation/animation_player';
import {AnimationKeyframe} from 'angular2/src/core/animation/animation_keyframe';
import {AnimationStyles} from 'angular2/src/core/animation/animation_styles';

export abstract class AnimationDriver {
  abstract animate(element: any, startingStyles: AnimationStyles[], keyframes: AnimationKeyframe[], duration: number, delay: number,
                   easing: string): AnimationPlayer;
}

export class NoOpAnimationDriver extends AnimationDriver {
  animate(element: any, startingStyles: AnimationStyles[], keyframes: AnimationKeyframe[], duration: number, delay: number,
          easing: string): AnimationPlayer {
    return new NoOpAnimationPlayer();
  }
}
