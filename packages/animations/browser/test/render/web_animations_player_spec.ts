/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {DOMAnimation} from '../../src/render/web_animations/dom_animation';
import {WebAnimationsPlayer} from '../../src/render/web_animations/web_animations_player';

export function main() {
  describe('WebAnimationsPlayer', function() {
    // these tests are only mean't to be run within the DOM
    if (typeof Element == 'undefined') return;

    let element: any;
    beforeEach(() => {
      element = document.createElement('div');
      document.body.appendChild(element);
    });

    afterEach(() => { document.body.removeChild(element); });

    it('should properly balance any previous player styles into the animation keyframes', () => {
      element.style.height = '666px';
      element.style.width = '333px';

      const prevPlayer1 = new MockWebAnimationsPlayer(
          element, [{width: '0px', offset: 0}, {width: '200px', offset: 1}], {});
      prevPlayer1.play();
      prevPlayer1.finish();

      const prevPlayer2 = new MockWebAnimationsPlayer(
          element, [{height: '0px', offset: 0}, {height: '200px', offset: 1}], {});
      prevPlayer2.play();
      prevPlayer2.finish();

      // what needs to happen here is the player below should
      // examine which styles are present in the provided previous
      // players and use them as input data for the keyframes of
      // the new player. Given that the players are in their finished
      // state, the styles are copied over as the starting keyframe
      // for the animation and if the styles are missing in later keyframes
      // then the styling is resolved by computing the styles
      const player = new MockWebAnimationsPlayer(
          element, [{width: '100px', offset: 0}, {width: '500px', offset: 1}], {},
          [prevPlayer1, prevPlayer2]);

      player.init();
      expect(player.capturedKeyframes).toEqual([
        {height: '200px', width: '200px', offset: 0},
        {height: '666px', width: '500px', offset: 1}
      ]);
    });
  });
}

class MockWebAnimationsPlayer extends WebAnimationsPlayer {
  capturedKeyframes: any[];

  _triggerWebAnimation(element: any, keyframes: any[], options: any): any {
    this.capturedKeyframes = keyframes;
    return new MockDOMAnimation();
  }
}

class MockDOMAnimation implements DOMAnimation {
  onfinish = (callback: (e: any) => any) => {};
  position = 0;
  currentTime = 0;

  cancel(): void {}
  play(): void {}
  pause(): void {}
  finish(): void {}
  addEventListener(eventName: string, handler: (event: any) => any): any { return null; }
  dispatchEvent(eventName: string): any { return null; }
}
