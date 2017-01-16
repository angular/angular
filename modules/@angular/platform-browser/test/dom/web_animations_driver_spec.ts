/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationPlayer} from '@angular/core';
import {el} from '@angular/platform-browser/testing/browser_util';

import {WebAnimationsDriver} from '../../src/dom/web_animations_driver';
import {WebAnimationsPlayer} from '../../src/dom/web_animations_player';
import {AnimationKeyframe, AnimationStyles, NoOpAnimationPlayer} from '../../src/private_import_core';

function _makeStyles(styles: {[key: string]: string | number}): AnimationStyles {
  return new AnimationStyles([styles]);
}

function _makeKeyframe(
    offset: number, styles: {[key: string]: string | number}): AnimationKeyframe {
  return new AnimationKeyframe(offset, _makeStyles(styles));
}

export function main() {
  describe('WebAnimationsDriver', () => {
    let driver: WebAnimationsDriver;
    let elm: HTMLElement;
    beforeEach(() => {
      driver = new WebAnimationsDriver();
      elm = el('<div></div>');
    });

    it('should use a fill mode of `both`', () => {
      const startingStyles = _makeStyles({});
      const styles = [_makeKeyframe(0, {'color': 'green'}), _makeKeyframe(1, {'color': 'red'})];
      const player = driver.animate(elm, startingStyles, styles, 1000, 1000, 'linear', []);
      const details = _formatOptions(player);
      const options = details['options'];
      expect(options['fill']).toEqual('both');
    });

    it('should apply the provided easing', () => {
      const startingStyles = _makeStyles({});
      const styles = [_makeKeyframe(0, {'color': 'green'}), _makeKeyframe(1, {'color': 'red'})];
      const player = driver.animate(elm, startingStyles, styles, 1000, 1000, 'ease-out', []);
      const details = _formatOptions(player);
      const options = details['options'];
      expect(options['easing']).toEqual('ease-out');
    });

    it('should only apply the provided easing if present', () => {
      const startingStyles = _makeStyles({});
      const styles = [_makeKeyframe(0, {'color': 'green'}), _makeKeyframe(1, {'color': 'red'})];
      const player = driver.animate(elm, startingStyles, styles, 1000, 1000, null, []);
      const details = _formatOptions(player);
      const options = details['options'];
      const keys = Object.keys(options);
      expect(keys.indexOf('easing')).toEqual(-1);
    });

    it('should only apply the provided easing if present', () => {
      const previousPlayers = [
        new NoOpAnimationPlayerWithStyles(),
        new NoOpAnimationPlayerWithStyles(),
        new NoOpAnimationPlayerWithStyles(),
      ];
      const startingStyles = _makeStyles({});
      const styles = [_makeKeyframe(0, {}), _makeKeyframe(1, {})];
      const player = driver.animate(
          elm, startingStyles, styles, 1000, 1000, null, <AnimationPlayer[]>previousPlayers);
      expect(player.previousStyles).toEqual({});
    });

    it('should round down offset values that are bigger than 1', () => {
      const startingStyles = _makeStyles({});
      const styles = [_makeKeyframe(0, {}), _makeKeyframe(2, {})];
      const player = driver.animate(elm, startingStyles, styles, 1000, 1000, null);
      expect(player.keyframes.pop()['offset']).toEqual(1);
    });

    it('should round down offset values that are bigger less than 0', () => {
      const startingStyles = _makeStyles({});
      const styles = [_makeKeyframe(-99, {}), _makeKeyframe(-0.1, {}), _makeKeyframe(1, {})];
      const player = driver.animate(elm, startingStyles, styles, 1000, 1000, null);
      player.keyframes.pop();  // remove the final keyframe that is `1`
      const allZero = player.keyframes.every(kf => kf['offset'] == 0);
      expect(allZero).toBe(true);
    });

    it('should create an animation with only starting-styles as data', () => {
      const startingStyles = _makeStyles({color: 'red', fontSize: '20px'});

      const player = driver.animate(elm, startingStyles, [], 1000, 1000, null);

      expect(player.keyframes).toEqual([
        {color: 'red', fontSize: '20px'},
        {color: 'red', fontSize: '20px'},
      ]);
    });

    it('should create a balanced animation when only one keyframe is passed in', () => {
      const startingStyles = _makeStyles({color: 'red', fontSize: '20px'});

      const keyframeStyles: any = [_makeKeyframe(1, {color: 'blue'})];

      const player = driver.animate(elm, startingStyles, keyframeStyles, 1000, 1000, null);

      const kf0 = player.keyframes[0];
      const kf1 = player.keyframes[1];

      expect(kf0['color']).toEqual('red');
      expect(kf0['fontSize']).toEqual('20px');
      expect(kf1['color']).toEqual('blue');
      expect(kf1['fontSize']).toEqual('20px');
    });
  });
}

class NoOpAnimationPlayerWithStyles extends NoOpAnimationPlayer {
  private _captureStyles() { return {color: 'red'}; }
}

function _formatOptions(player: WebAnimationsPlayer): {[key: string]: any} {
  return {'element': player.element, 'keyframes': player.keyframes, 'options': player.options};
}
