import {AnimationDriver} from 'angular2/src/core/render/animation_driver';
import {AnimationKeyframe} from 'angular2/src/core/animation/animation_keyframe';
import {AnimationPlayer} from 'angular2/src/core/animation/animation_player';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {MockAnimationPlayer} from 'angular2/src/mock/mock_animation_player';
import {AnimationStyles} from 'angular2/src/core/animation/animation_styles';

export class MockAnimationDriver extends AnimationDriver {
  log = [];
  computeStyle(element: any, prop: string): string { return ''; }
  animate(element: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[], duration: number, delay: number,
          easing: string): AnimationPlayer {
    var player = new MockAnimationPlayer();
    this.log.push({
      'element': element,
      'startingStyles': _serializeStyles(startingStyles),
      'keyframes': keyframes,
      'keyframeLookup': _serializeKeyframes(keyframes),
      'duration': duration,
      'delay': delay,
      'easing': easing,
      'player': player
    });
    return player;
  }
}

function _serializeKeyframes(keyframes: AnimationKeyframe[]): any[] {
  return keyframes.map(keyframe => [keyframe.offset, _serializeStyles(keyframe.styles)]);
}

function _serializeStyles(styles: AnimationStyles): {[key: string]: any} {
  var flatStyles = {};
  styles.styles.forEach(entry => StringMapWrapper.forEach(entry, (val, prop) => { flatStyles[prop] = val; }));
  return flatStyles;
}
