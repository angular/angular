/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MockAnimationPlayer, beforeEach, describe, expect, it} from '@angular/core/testing/testing_internal';
import {el} from '@angular/platform-browser/testing/browser_util';

import {DomAnimatePlayer} from '../../src/dom/dom_animate_player';
import {WebAnimationsPlayer} from '../../src/dom/web_animations_player';
import {MockDomAnimatePlayer} from '../../testing/mock_dom_animate_player';

class ExtendedWebAnimationsPlayer extends WebAnimationsPlayer {
  public domPlayer = new MockDomAnimatePlayer();

  constructor(
      public element: HTMLElement, public keyframes: {[key: string]: string | number}[],
      public options: {[key: string]: string | number}) {
    super(element, keyframes, options);
  }

  /** @internal */
  _triggerWebAnimation(elm: any, keyframes: any[], options: any): DomAnimatePlayer {
    return this.domPlayer;
  }
}

export function main() {
  function makePlayer(): {[key: string]: any} {
    var someElm = el('<div></div>');
    var player = new ExtendedWebAnimationsPlayer(someElm, [], {});
    player.init();
    return {'captures': player.domPlayer.captures, 'player': player};
  }

  describe('WebAnimationsPlayer', () => {
    var player: any /** TODO #9100 */, captures: any /** TODO #9100 */;
    beforeEach(() => {
      var newPlayer = makePlayer();
      captures = <{[key: string]: any}>newPlayer['captures'];
      player = <WebAnimationsPlayer>newPlayer['player'];
    });

    it('should pause the animation', () => {
      expect(captures['pause']).toBeFalsy();
      player.pause();
      expect(captures['pause'].length).toEqual(1);
    });

    it('should play the animation', () => {
      expect(captures['play']).toBeFalsy();
      player.play();
      expect(captures['play'].length).toEqual(1);
    });

    it('should finish the animation', () => {
      expect(captures['finish']).toBeFalsy();
      player.finish();
      expect(captures['finish'].length).toEqual(1);
    });

    it('should make use of the onfinish function',
       () => { expect(captures['onfinish'].length).toEqual(1); });

    it('should trigger the subscribe functions when complete', () => {
      var count = 0;
      var method = () => { count++; };

      player.onDone(method);
      player.onDone(method);
      player.onDone(method);

      expect(count).toEqual(0);
      captures['onfinish'][0]();
      expect(count).toEqual(3);
    });

    it('should finish right away when finish is called directly', () => {
      var completed = false;
      player.onDone(() => completed = true);
      expect(completed).toEqual(false);

      player.finish();
      expect(completed).toEqual(true);

      completed = false;
      player.finish();
      expect(completed).toEqual(false);
    });

    it('should trigger finish when destroy is called if the animation has not finished already',
       () => {
         var count = 0;
         var method = () => { count++; };

         player.onDone(method);
         expect(count).toEqual(0);
         player.destroy();
         expect(count).toEqual(1);

         var player2 = makePlayer()['player'];
         player2.onDone(method);
         expect(count).toEqual(1);
         player2.finish();
         expect(count).toEqual(2);
         player2.destroy();
         expect(count).toEqual(2);
       });

    it('should destroy itself automatically if a parent player is not present', () => {
      captures['cancel'] = [];
      player.finish();

      expect(captures['finish'].length).toEqual(1);
      expect(captures['cancel'].length).toEqual(1);

      var next = makePlayer();
      var player2 = next['player'];
      player2.parentPlayer = new MockAnimationPlayer();

      var captures2 = next['captures'];
      captures2['cancel'] = [];

      player2.finish();
      expect(captures2['finish'].length).toEqual(1);
      expect(captures2['cancel'].length).toEqual(0);
    });

    it('should run the onStart method when started but only once', () => {
      var calls = 0;
      player.onStart(() => calls++);
      expect(calls).toEqual(0);
      player.play();
      expect(calls).toEqual(1);
      player.pause();
      player.play();
      expect(calls).toEqual(1);
    });
  });
}
