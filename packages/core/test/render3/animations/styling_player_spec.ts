/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {StylingEffect} from '../../../src/render3/animations/interfaces';
import {StylingPlayer} from '../../../src/render3/animations/styling_player';
import {parseTimingExp} from '../../../src/render3/animations/util';
import {PlayState} from '../../../src/render3/interfaces/player';

import {MockAnimator} from './mock_animator';
import {makeElement} from './shared';

describe('StylingPlayer', () => {
  it('should flush the provided animator when the player is first started', () => {
    const element = makeElement();
    const animator = new MockAnimator();
    const player =
        new StylingPlayer(element, animator, parseTimingExp('1s'), null, {width: '100px'});

    expect(animator.log['scheduleFlush']).toBeFalsy();
    player.play();

    expect(animator.log['scheduleFlush']).toBeTruthy();
  });

  it('should add the styling effect to the animator once the player is started', () => {
    const element = makeElement();
    const animator = new MockAnimator();
    const player = new StylingPlayer(
        element, animator, parseTimingExp('2s'), {active: true}, {width: '100px'});
    expect(animator.log['addEffect']).toBeFalsy();

    player.play();
    const value = animator.log['addEffect'] !.pop() as StylingEffect;
    expect(value.timing.duration).toEqual(2000);
    expect(value.styles).toEqual({width: '100px'});
    expect(value.classes).toEqual({active: true});
  });

  it('should hyphenate all props before they are issued in anyway to the animator', () => {
    const element = makeElement();
    const animator = new MockAnimator();
    const player = new StylingPlayer(
        element, animator, parseTimingExp('2s'), null, {fontSize: '10px', paddingTopLeft: '120px'});
    expect(animator.log['addEffect']).toBeFalsy();

    player.play();
    let value = animator.log['addEffect'] !.pop() as StylingEffect;
    expect(value.styles).toEqual({'font-size': '10px', 'padding-top-left': '120px'});

    player.finish();
    value = animator.log['finishEffect'] !.pop() as StylingEffect;
    expect(value.styles).toEqual({'font-size': '10px', 'padding-top-left': '120px'});

    player.destroy();
    value = animator.log['destroyEffect'] !.pop() as StylingEffect;
    expect(value.styles).toEqual({'font-size': '10px', 'padding-top-left': '120px'});
  });

  it('should only add the styling effect to the animator once the player once', () => {
    const element = makeElement();
    const animator = new MockAnimator();
    const player =
        new StylingPlayer(element, animator, parseTimingExp('2s'), null, {width: '100px'});
    expect(animator.log['addEffect']).toBeFalsy();

    player.play();
    expect(animator.log['addEffect'].pop()).toBeTruthy();
    expect(animator.log['addEffect'].length).toEqual(0);

    player.play();
    expect(animator.log['addEffect'].length).toEqual(0);
  });

  it('should finish the effect from the animator if the player is finished', () => {
    const element = makeElement();
    const animator = new MockAnimator();
    const player = new StylingPlayer(
        element, animator, parseTimingExp('3s'), {active: true}, {width: '100px'});
    expect(animator.log['finishEffect']).toBeFalsy();

    player.play();
    expect(animator.log['finishEffect']).toBeFalsy();

    player.finish();
    const value = animator.log['finishEffect'] !.pop() as StylingEffect;
    expect(value.timing.duration).toEqual(3000);
    expect(value.styles).toEqual({width: '100px'});
    expect(value.classes).toEqual({active: true});
  });

  it('should remove the effect from the animator if the player is destroyed', () => {
    const element = makeElement();
    const animator = new MockAnimator();
    const player = new StylingPlayer(
        element, animator, parseTimingExp('1s'), {active: true}, {width: '100px'});
    expect(animator.log['destroyEffect']).toBeFalsy();

    player.play();
    expect(animator.log['destroyEffect']).toBeFalsy();

    player.destroy();
    const value = animator.log['destroyEffect'] !.pop() as StylingEffect;
    expect(value.timing.duration).toEqual(1000);
    expect(value.styles).toEqual({width: '100px'});
    expect(value.classes).toEqual({active: true});
  });

  it('should emit the state of the player when it is started, finished and destroyed and set to pause',
     () => {
       const element = makeElement();
       const animator = new MockAnimator();
       const player =
           new StylingPlayer(element, animator, parseTimingExp('1s'), null, {width: '100px'});

       const log: PlayState[] = [];
       player.getStatus().subscribe(state => log.push(state as PlayState));

       player.play();
       expect(log.shift()).toEqual(PlayState.Running);

       player.pause();
       expect(log.shift()).toEqual(PlayState.Paused);

       player.finish();
       expect(log.shift()).toEqual(PlayState.Finished);

       player.destroy();
       expect(log.shift()).toEqual(PlayState.Destroyed);
     });

  it('should emit that the player is finished when the animator says so', () => {
    const element = makeElement();
    const animator = new MockAnimator();
    const player =
        new StylingPlayer(element, animator, parseTimingExp('1s'), null, {width: '100px'});

    let done = false;
    player.getStatus().subscribe(state => {
      if (state === PlayState.Finished) {
        done = true;
      }
    });

    player.play();
    expect(done).toBeFalsy();
    expect(player.state).not.toEqual(PlayState.Finished);

    (animator.log['onAllEffectsDone'].pop() as Function)();
    expect(done).toBeTruthy();
    expect(player.state).toEqual(PlayState.Finished);
  });

  it('should only emit that it is finished once', () => {
    const element = makeElement();
    const animator = new MockAnimator();
    const player =
        new StylingPlayer(element, animator, parseTimingExp('1s'), null, {width: '100px'});

    let done = false;
    player.getStatus().subscribe(state => {
      if (state === PlayState.Finished) {
        done = true;
      }
    });

    player.play();
    expect(done).toBeFalsy();
    expect(player.state).not.toEqual(PlayState.Finished);

    player.finish();
    expect(done).toBeTruthy();
    expect(player.state).toEqual(PlayState.Finished);

    done = false;

    (animator.log['onAllEffectsDone'].pop() as Function)();
    expect(done).toBeFalsy();
    expect(player.state).toEqual(PlayState.Finished);
  });

  it('should emit that is it finished and destroyed when destroyed', () => {
    const element = makeElement();
    const animator = new MockAnimator();
    const player =
        new StylingPlayer(element, animator, parseTimingExp('1s'), null, {width: '100px'});

    let done = false;
    let destroyed = false;
    player.getStatus().subscribe(state => {
      if (state === PlayState.Finished) {
        done = true;
      } else if (state === PlayState.Destroyed) {
        destroyed = true;
      }
    });

    player.play();
    expect(done).toBeFalsy();
    expect(destroyed).toBeFalsy();

    player.destroy();
    expect(done).toBeTruthy();
    expect(destroyed).toBeTruthy();
  });

  it('should complete itself when destroyed', () => {
    const element = makeElement();
    const animator = new MockAnimator();
    const player =
        new StylingPlayer(element, animator, parseTimingExp('1s'), null, {width: '100px'});

    let completed = false;
    player.getStatus().subscribe(() => {}, () => {}, () => { completed = true; });

    player.play();
    expect(completed).toBeFalsy();

    player.destroy();
    expect(completed).toBeTruthy();
  });
});