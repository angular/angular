/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AUTO_STYLE, AnimationPlayer} from '@angular/core';
import {MockAnimationPlayer} from '@angular/core/testing/testing_internal';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {el} from '@angular/platform-browser/testing/browser_util';

import {DomAnimatePlayer} from '../../src/dom/dom_animate_player';
import {WebAnimationsPlayer} from '../../src/dom/web_animations_player';
import {MockDomAnimatePlayer} from '../../testing/mock_dom_animate_player';

class ExtendedWebAnimationsPlayer extends WebAnimationsPlayer {
  private _overriddenDomPlayer = new MockDomAnimatePlayer();

  constructor(
      public element: HTMLElement, public keyframes: {[key: string]: string | number}[],
      public options: {[key: string]: string | number},
      public previousPlayers: WebAnimationsPlayer[] = []) {
    super(element, keyframes, options, previousPlayers);
  }

  get domPlayer() { return this._overriddenDomPlayer; }

  /** @internal */
  _triggerWebAnimation(elm: any, keyframes: any[], options: any): DomAnimatePlayer {
    this._overriddenDomPlayer._capture('trigger', {elm, keyframes, options});
    return this._overriddenDomPlayer;
  }
}

export function main() {
  function makePlayer(): {[key: string]: any} {
    const someElm = el('<div></div>');
    const player = new ExtendedWebAnimationsPlayer(someElm, [{}, {}], {}, []);
    player.init();
    return {'captures': player.domPlayer.captures, 'player': player};
  }

  describe('WebAnimationsPlayer', () => {
    let player: any /** TODO #9100 */, captures: any /** TODO #9100 */;
    beforeEach(() => {
      const newPlayer = makePlayer();
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
      let count = 0;
      const method = () => { count++; };

      player.onDone(method);
      player.onDone(method);
      player.onDone(method);

      expect(count).toEqual(0);
      captures['onfinish'][0]();
      expect(count).toEqual(3);
    });

    it('should finish right away when finish is called directly', () => {
      let completed = false;
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
         let count = 0;
         const method = () => { count++; };

         player.onDone(method);
         expect(count).toEqual(0);
         player.destroy();
         expect(count).toEqual(1);

         const player2 = makePlayer()['player'];
         player2.onDone(method);
         expect(count).toEqual(1);
         player2.finish();
         expect(count).toEqual(2);
         player2.destroy();
         expect(count).toEqual(2);
       });

    it('should not destroy itself automatically if a parent player is not present', () => {
      captures['cancel'] = [];
      player.finish();

      expect(captures['finish'].length).toEqual(1);
      expect(captures['cancel'].length).toEqual(0);

      const next = makePlayer();
      const player2 = next['player'];
      player2.parentPlayer = new MockAnimationPlayer();

      const captures2 = next['captures'];
      captures2['cancel'] = [];

      player2.finish();
      expect(captures2['finish'].length).toEqual(1);
      expect(captures2['cancel'].length).toEqual(0);
    });

    it('should run the onStart method when started but only once', () => {
      let calls = 0;
      player.onStart(() => calls++);
      expect(calls).toEqual(0);
      player.play();
      expect(calls).toEqual(1);
      player.pause();
      player.play();
      expect(calls).toEqual(1);
    });

    it('should not allow the player to be cancelled via destroy if it has already been destroyed unless reset',
       () => {
         captures['cancel'] = [];
         expect(captures['cancel'].length).toBe(0);
         player.destroy();
         expect(captures['cancel'].length).toBe(1);
         captures['cancel'] = [];
         player.destroy();
         expect(captures['cancel'].length).toBe(0);
         player.reset();
         captures['cancel'] = [];
         player.destroy();
         expect(captures['cancel'].length).toBe(1);
       });

    it('should resolve auto styles based on what is computed from the provided element', () => {
      const elm = el('<div></div>');
      document.body.appendChild(elm);  // required for getComputedStyle() to work
      elm.style.opacity = '0.5';

      const player = new ExtendedWebAnimationsPlayer(
          elm, [{opacity: AUTO_STYLE}, {opacity: '1'}], {duration: 1000}, []);

      player.init();

      const data = player.domPlayer.captures['trigger'][0];
      expect(data['keyframes']).toEqual([{opacity: '0.5'}, {opacity: '1'}]);
    });

    it('should allow the player to be destroyed before it is initialized', () => {
      const elm = el('<div></div>');
      const player = new ExtendedWebAnimationsPlayer(elm, [], {});
      expect(() => { player.destroy(); }).not.toThrowError();
    });

    describe('previousStyle', () => {
      it('should merge keyframe styles based on the previous styles passed in when the player has finished its operation',
         () => {
           const elm = el('<div></div>');
           const previousStyles = {width: '100px', height: '666px'};
           const previousPlayer =
               new ExtendedWebAnimationsPlayer(elm, [previousStyles, previousStyles], {}, []);
           previousPlayer.play();
           previousPlayer.finish();

           const player = new ExtendedWebAnimationsPlayer(
               elm,
               [
                 {width: '0px', height: '0px', opacity: 0, offset: 0},
                 {width: '0px', height: '0px', opacity: 1, offset: 1}
               ],
               {duration: 1000}, [previousPlayer]);

           player.init();

           const data = player.domPlayer.captures['trigger'][0];
           expect(data['keyframes']).toEqual([
             {width: '100px', height: '666px', opacity: 0, offset: 0},
             {width: '0px', height: '0px', opacity: 1, offset: 1}
           ]);
         });

      it('should allow previous styles to be merged into the starting keyframe of the animation that were not apart of the animation to begin with',
         () => {
           if (!getDOM().supportsWebAnimation()) return;

           const elm = el('<div></div>');
           document.body.appendChild(elm);
           elm.style.color = 'rgb(0,0,0)';

           const previousStyles = {color: 'red'};
           const previousPlayer =
               new ExtendedWebAnimationsPlayer(elm, [previousStyles, previousStyles], {}, []);
           previousPlayer.play();
           previousPlayer.finish();

           const player = new ExtendedWebAnimationsPlayer(
               elm, [{opacity: '0'}, {opacity: '1'}], {duration: 1000}, [previousPlayer]);

           player.init();

           const data = player.domPlayer.captures['trigger'][0];
           expect(data['keyframes']).toEqual([
             {opacity: '0', color: 'red'},
             {opacity: '1', color: 'rgb(0, 0, 0)'},
           ]);
         });

      it('should properly calculate the previous styles for the player even when its currently playing',
         () => {
           if (!getDOM().supportsWebAnimation()) return;

           const elm = el('<div></div>');
           document.body.appendChild(elm);

           const fromStyles = {width: '100px', height: '666px'};
           const toStyles = {width: '50px', height: '333px'};
           const previousPlayer =
               new WebAnimationsPlayer(elm, [fromStyles, toStyles], {duration: 1000}, []);
           previousPlayer.play();
           previousPlayer.setPosition(0.5);
           previousPlayer.pause();

           const newStyles = {width: '0px', height: '0px'};
           const player = new WebAnimationsPlayer(
               elm, [newStyles, newStyles], {duration: 1000}, [previousPlayer]);

           player.init();

           const data = player.previousStyles;
           expect(player.previousStyles).toEqual({width: '75px', height: '499.5px'});
         });
    });
  });
}
