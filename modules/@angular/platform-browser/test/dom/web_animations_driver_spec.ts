/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {beforeEach, describe, expect, it} from '@angular/core/testing/testing_internal';
import {el} from '@angular/platform-browser/testing/browser_util';

import {DomAnimatePlayer} from '../../src/dom/dom_animate_player';
import {WebAnimationsDriver} from '../../src/dom/web_animations_driver';
import {WebAnimationsPlayer} from '../../src/dom/web_animations_player';
import {AnimationKeyframe, AnimationStyles} from '../../src/private_import_core';
import {MockDomAnimatePlayer} from '../../testing/mock_dom_animate_player';

class ExtendedWebAnimationsDriver extends WebAnimationsDriver {
  public log: {[key: string]: any}[] = [];

  constructor() { super(); }

  /** @internal */
  _triggerWebAnimation(elm: any, keyframes: any[], options: any): DomAnimatePlayer {
    this.log.push({'elm': elm, 'keyframes': keyframes, 'options': options});
    return new MockDomAnimatePlayer();
  }
}

function _makeStyles(styles: {[key: string]: string | number}): AnimationStyles {
  return new AnimationStyles([styles]);
}

function _makeKeyframe(
    offset: number, styles: {[key: string]: string | number}): AnimationKeyframe {
  return new AnimationKeyframe(offset, _makeStyles(styles));
}

export function main() {
  describe('WebAnimationsDriver', () => {
    var driver: ExtendedWebAnimationsDriver;
    var elm: HTMLElement;
    beforeEach(() => {
      driver = new ExtendedWebAnimationsDriver();
      elm = el('<div></div>');
    });

    it('should use a fill mode of `both`', () => {
      var startingStyles = _makeStyles({});
      var styles = [_makeKeyframe(0, {'color': 'green'}), _makeKeyframe(1, {'color': 'red'})];

      var player = driver.animate(elm, startingStyles, styles, 1000, 1000, 'linear');
      var details = _formatOptions(player);
      var options = details['options'];
      expect(options['fill']).toEqual('both');
    });

    it('should apply the provided easing', () => {
      var startingStyles = _makeStyles({});
      var styles = [_makeKeyframe(0, {'color': 'green'}), _makeKeyframe(1, {'color': 'red'})];

      var player = driver.animate(elm, startingStyles, styles, 1000, 1000, 'ease-out');
      var details = _formatOptions(player);
      var options = details['options'];
      expect(options['easing']).toEqual('ease-out');
    });

    it('should only apply the provided easing if present', () => {
      var startingStyles = _makeStyles({});
      var styles = [_makeKeyframe(0, {'color': 'green'}), _makeKeyframe(1, {'color': 'red'})];

      var player = driver.animate(elm, startingStyles, styles, 1000, 1000, null);
      var details = _formatOptions(player);
      var options = details['options'];
      var keys = Object.keys(options);
      expect(keys.indexOf('easing')).toEqual(-1);
    });
  });
}

function _formatOptions(player: WebAnimationsPlayer): {[key: string]: any} {
  return {'element': player.element, 'keyframes': player.keyframes, 'options': player.options};
}
