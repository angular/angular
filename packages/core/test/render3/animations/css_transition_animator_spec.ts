/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CssTransitionAnimator} from '../../../src/render3/animations/css_transition_animator';
import {AnimatorState, RenderUtil, StylingEffect} from '../../../src/render3/animations/interfaces';
import {applyTransition, parseTimingExp} from '../../../src/render3/animations/util';

import {assertClass, assertStyle, assertTransition, makeElement, triggerTransitionEndEvent} from './shared';

describe('CssTransitionAnimator', () => {
  // Internet Explorer 10 and 11 have issues with reading
  // transition-duration values as well as overriding
  // the timeStamp value inside of the AnimationEvent
  // object. There is no real purpose in changing the
  // tests to suit IE 10/11 therefore the tests will be
  // ignored (Edge does work fine and the animation
  // world demo does fully render on IE 10/11).
  if (isIE10or11()) return;

  it('should animate a series of styles using CSS transitions', () => {
    const element = makeElement();
    const animator = new CssTransitionAnimator(element, new TestRenderUtil());
    animator.addEffect({
      styles: {'font-size': '100px', 'border-width': '200px'},
      classes: null,
      timing: parseTimingExp('1s')
    });

    assertTransition(element, '');
    assertStyle(element, 'font-size', '');
    assertStyle(element, 'border-width', '');

    animator.flushEffects();
    assertTransition(element, '1000ms all 0ms');
    assertStyle(element, 'font-size', '100px');
    assertStyle(element, 'border-width', '200px');
  });

  it('should animate a series of classes using CSS transitions', () => {
    const element = makeElement();
    element.classList.add('bar');

    const animator = new CssTransitionAnimator(element, new TestRenderUtil());
    animator.addEffect({
      styles: null,
      classes: {foo: true, bar: false, baz: true},
      timing: parseTimingExp('2s 1s')
    });

    assertTransition(element, '');
    assertClass(element, 'foo', false);
    assertClass(element, 'bar', true);
    assertClass(element, 'baz', false);

    animator.flushEffects();
    assertTransition(element, '2000ms all 1000ms');
    assertClass(element, 'foo', true);
    assertClass(element, 'bar', false);
    assertClass(element, 'baz', true);
  });

  it('should animate a series of multiple style/class effects with different transition timings',
     () => {
       const element = makeElement();
       const renderUtil = new TestRenderUtil();
       const animator = new CssTransitionAnimator(element, renderUtil);
       animator.addEffect({
         styles: {opacity: '1', 'font-size': '10px'},
         classes: null,
         timing: parseTimingExp(123)
       });
       animator.addEffect({styles: null, classes: {foo: true}, timing: parseTimingExp(578)});

       assertTransition(element, '');
       assertStyle(element, 'opacity', '');
       assertStyle(element, 'font-size', '');
       assertClass(element, 'foo', false);

       animator.flushEffects();
       assertTransition(element, '123ms all 0ms');
       assertStyle(element, 'opacity', '1');
       assertStyle(element, 'font-size', '10px');
       assertClass(element, 'foo', false);

       renderUtil.flushReflows();
       assertTransition(element, ['123ms all 0ms', '578ms all 0ms']);
       assertStyle(element, 'opacity', '1');
       assertStyle(element, 'font-size', '10px');
       assertClass(element, 'foo', true);
     });

  it('should expose the state of the animation when effects are processed and run', () => {
    const element = makeElement();
    const renderUtil = new TestRenderUtil();
    const animator = new CssTransitionAnimator(element, renderUtil);
    animator.addEffect(
        {styles: {color: 'red'}, classes: {active: true}, timing: parseTimingExp(123)});
    animator.addEffect(
        {styles: {'font-size': '100px'}, classes: null, timing: parseTimingExp(4567)});

    expect(animator.state).toEqual(AnimatorState.Idle);

    animator.flushEffects();
    expect(animator.state).toEqual(AnimatorState.ProcessingEffects);

    renderUtil.flushReflows();
    expect(animator.state).toEqual(AnimatorState.Running);

    animator.finishAll();
    expect(animator.state).toEqual(AnimatorState.Exiting);

    renderUtil.flushReflows();
    expect(animator.state).toEqual(AnimatorState.Idle);

    animator.destroy();
    expect(animator.state).toEqual(AnimatorState.Exiting);

    renderUtil.flushReflows();
    expect(animator.state).toEqual(AnimatorState.Destroyed);
  });

  it('should remove the final transition string once the transition has finished', () => {
    const element = makeElement();
    const renderUtil = new TestRenderUtil();
    const animator = new CssTransitionAnimator(element, renderUtil);
    animator.addEffect({styles: {'font-size': '10px'}, classes: null, timing: parseTimingExp(123)});
    animator.addEffect({styles: {color: 'red'}, classes: null, timing: parseTimingExp(578)});

    animator.flushEffects();
    renderUtil.flushReflows();
    assertTransition(element, ['123ms font-size 0ms', '578ms color 0ms']);

    animator.finishAll();
    renderUtil.flushReflows();
    assertTransition(element, '');
  });

  it('should finish the transition once finishAll is called', () => {
    const element = makeElement();
    const renderUtil = new TestRenderUtil();
    const animator = new CssTransitionAnimator(element, renderUtil);
    animator.addEffect({styles: {'font-size': '10px'}, classes: null, timing: parseTimingExp(123)});
    animator.addEffect({styles: {color: 'red'}, classes: null, timing: parseTimingExp(578)});

    let done = false;
    animator.onAllEffectsDone(() => done = true);
    expect(done).toBeFalsy();

    animator.flushEffects();
    expect(done).toBeFalsy();

    renderUtil.flushReflows();
    expect(animator.state).toEqual(AnimatorState.Running);
    expect(done).toBeFalsy();

    animator.finishAll();
    expect(done).toBeFalsy();

    renderUtil.flushReflows();
    expect(done).toBeTruthy();
  });

  it('should finish the transition once the expected `transitionend` is dispatched', () => {
    const element = makeElement();
    const renderUtil = new TestRenderUtil();
    const animator = new CssTransitionAnimator(element, renderUtil);
    animator.addEffect({styles: {color: 'red'}, classes: null, timing: parseTimingExp(1000)});
    animator.addEffect(
        {styles: {'font-size': '200px'}, classes: null, timing: parseTimingExp('1s 0.5s')});

    let done = false;
    animator.onAllEffectsDone(() => done = true);
    expect(done).toBeFalsy();

    animator.flushEffects();
    expect(done).toBeFalsy();

    renderUtil.flushReflows();
    expect(animator.state).toEqual(AnimatorState.Running);
    expect(done).toBeFalsy();

    triggerTransitionEndEvent(element, 500);
    expect(done).toBeFalsy();

    triggerTransitionEndEvent(element, 1000);
    expect(done).toBeFalsy();

    triggerTransitionEndEvent(element, 1500);
    expect(done).toBeTruthy();
  });

  it('should finish the transition once the expected timeout delay has passed', () => {
    const element = makeElement();
    const renderUtil = new TestRenderUtil();
    const animator = new CssTransitionAnimator(element, renderUtil);
    animator.addEffect(
        {styles: {'font-size': '100px'}, classes: null, timing: parseTimingExp(1000)});
    animator.addEffect({styles: {color: 'red'}, classes: null, timing: parseTimingExp('1s 0.5s')});

    let done = false;
    animator.onAllEffectsDone(() => done = true);
    expect(done).toBeFalsy();

    animator.flushEffects();
    expect(done).toBeFalsy();

    renderUtil.flushReflows();
    expect(animator.state).toEqual(AnimatorState.Running);
    expect(done).toBeFalsy();

    renderUtil.fowardTime(500);
    expect(done).toBeFalsy();

    renderUtil.fowardTime(500);
    expect(done).toBeFalsy();

    renderUtil.fowardTime(500);
    expect(done).toBeFalsy();

    renderUtil.fowardTime(500);
    expect(done).toBeTruthy();
  });

  it('should merge in follow-up styling effects into an ongoing transition', async() => {
    const element = makeElement();
    const renderUtil = new TestRenderUtil();
    const animator = new CssTransitionAnimator(element, renderUtil);
    animator.addEffect({styles: {color: 'red'}, classes: null, timing: parseTimingExp('1s 100ms')});

    animator.flushEffects();
    renderUtil.flushReflows();
    expect(animator.state).toEqual(AnimatorState.Running);
    assertTransition(element, '1000ms color 100ms');

    animator.addEffect(
        {styles: {'font-size': '10px'}, classes: null, timing: parseTimingExp('2s 200ms')});

    animator.flushEffects();
    renderUtil.flushReflows();
    expect(animator.state).toEqual(AnimatorState.Running);
    assertTransition(element, ['1000ms color 100ms', '2000ms font-size 200ms']);
  });

  it('should finalize an ongoing transition with an updated `transitionend` time if a new effect is added even when a transition is running',
     () => {
       const element = makeElement();
       const renderUtil = new TestRenderUtil();
       const animator = new CssTransitionAnimator(element, renderUtil);

       let done = false;
       animator.onAllEffectsDone(() => done = true);

       animator.addEffect(
           {styles: {width: '100px'}, classes: null, timing: parseTimingExp('1s 500ms')});

       animator.flushEffects();
       renderUtil.flushReflows();
       expect(animator.state).toEqual(AnimatorState.Running);

       animator.addEffect(
           {styles: {height: '100px'}, classes: null, timing: parseTimingExp('2s 500ms')});

       animator.flushEffects();
       renderUtil.flushReflows();
       expect(animator.state).toEqual(AnimatorState.Running);

       triggerTransitionEndEvent(element, 1200);
       expect(done).toBeFalsy();

       triggerTransitionEndEvent(element, 2200);
       expect(done).toBeFalsy();

       triggerTransitionEndEvent(element, 3200);
       expect(done).toBeTruthy();
     });

  it('should pre-emptively compute auto styles for width and height properties when removed',
     () => {
       const element = makeElement();
       const renderUtil = new TestRenderUtil();
       const animator = new CssTransitionAnimator(element, renderUtil);

       const transitionStyleLog: string[] = [];
       renderUtil.transitionLogFn = (element: HTMLElement, value: string | null) =>
           transitionStyleLog.push(value !);

       expect(renderUtil.gcsLog).toEqual([]);
       animator.addEffect(
           {styles: {width: null, height: null}, classes: null, timing: parseTimingExp(1500)});

       expect(transitionStyleLog.length).toEqual(0);
       expect(renderUtil.gcsLog).toEqual([]);

       animator.flushEffects();
       renderUtil.flushReflows();

       assertTransition(transitionStyleLog.shift() !, ['1500ms all -1500ms']);
       assertTransition(transitionStyleLog.shift() !, ['1500ms all 0ms']);
       expect(renderUtil.gcsLog).toEqual(['width', 'height', 'width', 'height']);
     });

  it('should pre-emptively compute auto styles for width and height properties if they are animated to',
     () => {
       const element = makeElement();
       const renderUtil = new TestRenderUtil();
       const animator = new CssTransitionAnimator(element, renderUtil);

       const transitionStyleLog: string[] = [];
       renderUtil.transitionLogFn = (element: HTMLElement, value: string | null) =>
           transitionStyleLog.push(value !);

       renderUtil.gcsAlias.width = '123px';
       renderUtil.gcsAlias.height = '456px';

       animator.addEffect({
         styles: {width: '100px', height: '200px'},
         classes: null,
         timing: parseTimingExp(1500)
       });
       assertStyle(element, 'width', '');
       assertStyle(element, 'height', '');

       animator.flushEffects();
       assertTransition(transitionStyleLog.shift() !, ['0s all']);
       assertStyle(element, 'width', '123px');
       assertStyle(element, 'height', '456px');

       renderUtil.flushReflows();
       assertTransition(transitionStyleLog.shift() !, ['0s all', '1500ms all 0ms']);
       assertStyle(element, 'width', '100px');
       assertStyle(element, 'height', '200px');
     });

  it('should pre-emptively compute auto styles width/height properties but only transition one prop when only one prop is used',
     () => {
       const element = makeElement();
       const renderUtil = new TestRenderUtil();
       const animator = new CssTransitionAnimator(element, renderUtil);

       const transitionStyleLog: string[] = [];
       renderUtil.transitionLogFn = (element: HTMLElement, value: string | null) =>
           transitionStyleLog.push(value !);

       renderUtil.gcsAlias.width = '123px';
       animator.addEffect({styles: {width: '100px'}, classes: null, timing: parseTimingExp(1500)});

       animator.flushEffects();
       assertTransition(transitionStyleLog.shift() !, ['0s width']);

       renderUtil.flushReflows();
       assertTransition(transitionStyleLog.shift() !, ['0s width', '1500ms width 0ms']);
     });

  it('should forcefully preCompute any values that are signified with a AUTO_STYLE value', () => {
    const element = makeElement();
    const renderUtil = new TestRenderUtil();
    const animator = new CssTransitionAnimator(element, renderUtil);

    const transitionStyleLog: string[] = [];
    renderUtil.transitionLogFn = (element: HTMLElement, value: string | null) =>
        transitionStyleLog.push(value !);

    animator.addEffect(
        {styles: {opacity: '1', color: 'red'}, classes: null, timing: parseTimingExp(1000)});

    animator.flushEffects();
    renderUtil.flushReflows();

    assertTransition(transitionStyleLog.shift() !, '1000ms all 0ms');
    expect(renderUtil.gcsLog).toEqual([]);

    animator.addEffect({
      styles: {opacity: '*', color: '*'},
      classes: null,
      timing: parseTimingExp('2000ms 500ms')
    });

    expect(transitionStyleLog).toEqual([]);
    expect(renderUtil.gcsLog).toEqual([]);

    animator.flushEffects();
    renderUtil.flushReflows();

    assertTransition(transitionStyleLog.shift() !, ['1000ms all 0ms', '2000ms all -2000ms']);
    assertTransition(transitionStyleLog.shift() !, ['1000ms all 0ms', '2000ms all 500ms']);
    expect(renderUtil.gcsLog).toEqual(['opacity', 'color', 'opacity', 'color']);
  });

  it('should not issue any reflows if only one effect is being rendered', () => {
    const element = makeElement();
    const renderUtil = new TestRenderUtil();
    const animator = new CssTransitionAnimator(element, renderUtil);

    expect(renderUtil.totalQueuedReflows).toEqual(0);
    expect(renderUtil.totalFlushedReflows).toEqual(0);

    animator.addEffect({
      styles: {'font-size': '100px', color: 'red'},
      classes: {active: true},
      timing: parseTimingExp(1000)
    });

    expect(renderUtil.totalQueuedReflows).toEqual(0);
    expect(renderUtil.totalFlushedReflows).toEqual(0);

    animator.flushEffects();
    expect(renderUtil.totalQueuedReflows).toEqual(0);
    expect(renderUtil.totalFlushedReflows).toEqual(0);

    renderUtil.flushReflows();
    expect(renderUtil.totalQueuedReflows).toEqual(0);
    expect(renderUtil.totalFlushedReflows).toEqual(0);
  });

  it('should only issue one reflow between effects', () => {
    const element = makeElement();
    const renderUtil = new TestRenderUtil();
    const animator = new CssTransitionAnimator(element, renderUtil);

    expect(renderUtil.totalQueuedReflows).toEqual(0);
    expect(renderUtil.totalFlushedReflows).toEqual(0);

    animator.addEffect({
      styles: {'font-size': '100px', opacity: 0},
      classes: {active: true},
      timing: parseTimingExp(1000)
    });

    animator.addEffect({
      styles: {'font-size': '200px', opacity: 1},
      classes: {active: true},
      timing: parseTimingExp(1000)
    });

    expect(renderUtil.totalQueuedReflows).toEqual(0);
    expect(renderUtil.totalFlushedReflows).toEqual(0);

    animator.flushEffects();
    expect(renderUtil.totalQueuedReflows).toEqual(1);
    expect(renderUtil.totalFlushedReflows).toEqual(0);

    renderUtil.flushReflows();
    expect(renderUtil.totalQueuedReflows).toEqual(0);
    expect(renderUtil.totalFlushedReflows).toEqual(1);
  });

  it('should only issue one reflow when a flush is scheduled and not call it multple times', () => {
    const element = makeElement();
    const renderUtil = new TestRenderUtil();
    const animator = new CssTransitionAnimator(element, renderUtil);
    animator.addEffect({
      styles: {opacity: '0', 'font-size': '200px'},
      classes: null,
      timing: parseTimingExp(1000)
    });

    animator.scheduleFlush();
    expect(renderUtil.totalQueuedReflows).toEqual(1);
    expect(renderUtil.totalFlushedReflows).toEqual(0);

    animator.scheduleFlush();
    expect(renderUtil.totalQueuedReflows).toEqual(1);
    expect(renderUtil.totalFlushedReflows).toEqual(0);

    renderUtil.flushReflows();
    expect(renderUtil.totalQueuedReflows).toEqual(0);
    expect(renderUtil.totalFlushedReflows).toEqual(1);
  });

  it('should issue multiple reflows when styles are being pre-compiled', () => {
    const element = makeElement();
    const renderUtil = new TestRenderUtil();
    const animator = new CssTransitionAnimator(element, renderUtil);

    animator.addEffect(
        {styles: {height: null, width: null}, classes: null, timing: parseTimingExp(1000)});

    animator.addEffect({styles: {opacity: '1'}, classes: null, timing: parseTimingExp(1000)});

    expect(renderUtil.totalQueuedReflows).toEqual(0);
    expect(renderUtil.totalFlushedReflows).toEqual(0);

    animator.flushEffects();

    // 1 = between effects
    expect(renderUtil.totalQueuedReflows).toEqual(1);

    /*
     * Reflows:
     * 1 = compute backup height
     * 2 = compute backup width
     * 3 = compute final height
     * 4 = compute final width
     * 5 = force backup restoration transition reflow
     */
    expect(renderUtil.totalFlushedReflows).toEqual(5);

    renderUtil.flushReflows();
    expect(renderUtil.totalQueuedReflows).toEqual(0);

    /*
     * Reflows:
     * 1-5 (same as above)
     * 6 = between effects
     */
    expect(renderUtil.totalFlushedReflows).toEqual(6);
  });

  it('should issue a single reflow when finishAll is called before clearing the styles', () => {
    const element = makeElement();
    const renderUtil = new TestRenderUtil();
    const animator = new CssTransitionAnimator(element, renderUtil);

    animator.addEffect({
      styles: {'font-size': '100px', 'border-width': '200px'},
      classes: null,
      timing: parseTimingExp('1000ms ease-out')
    });

    animator.addEffect(
        {styles: {opacity: '1'}, classes: null, timing: parseTimingExp('123ms 5s ease-in')});

    expect(renderUtil.totalQueuedReflows).toEqual(0);
    expect(renderUtil.totalFlushedReflows).toEqual(0);

    animator.flushEffects();
    renderUtil.flushReflows();
    expect(renderUtil.totalQueuedReflows).toEqual(0);
    expect(renderUtil.totalFlushedReflows).toEqual(1);

    assertStyle(element, 'border-width', '200px');
    assertStyle(element, 'font-size', '100px');
    assertStyle(element, 'opacity', '1');

    assertTransition(element, ['1000ms all 0ms ease-out', '123ms opacity 5000ms ease-in']);
    animator.finishAll();
    expect(renderUtil.totalQueuedReflows).toEqual(1);
    expect(renderUtil.totalFlushedReflows).toEqual(1);
    assertTransition(element, '0s none');
    assertStyle(element, 'border-width', '200px');
    assertStyle(element, 'font-size', '100px');
    assertStyle(element, 'opacity', '1');

    renderUtil.flushReflows();
    expect(renderUtil.totalQueuedReflows).toEqual(0);
    expect(renderUtil.totalFlushedReflows).toEqual(2);
    assertTransition(element, '');
    assertStyle(element, 'border-width', '200px');
    assertStyle(element, 'font-size', '100px');
    assertStyle(element, 'opacity', '1');
  });

  it('should issue a single reflow when finish on a spefic style is called before clearing the styles',
     () => {
       const element = makeElement();
       const renderUtil = new TestRenderUtil();
       const animator = new CssTransitionAnimator(element, renderUtil);

       let e1 !: StylingEffect;
       animator.addEffect(e1 = {
         styles: {'font-size': '100px', 'border-width': '200px'},
         classes: null,
         timing: parseTimingExp('1000ms ease-out')
       });

       let e2 !: StylingEffect;
       animator.addEffect(e2 = {
         styles: {opacity: '1', 'border-radius': '10px'},
         classes: null,
         timing: parseTimingExp('123ms 5s ease-in')
       });

       expect(renderUtil.totalQueuedReflows).toEqual(0);
       expect(renderUtil.totalFlushedReflows).toEqual(0);

       animator.flushEffects();
       renderUtil.flushReflows();
       expect(renderUtil.totalQueuedReflows).toEqual(0);
       expect(renderUtil.totalFlushedReflows).toEqual(1);

       assertStyle(element, 'border-width', '200px');
       assertStyle(element, 'font-size', '100px');
       assertStyle(element, 'opacity', '1');
       assertStyle(element, 'border-radius', '10px');

       assertTransition(element, ['1000ms all 0ms ease-out', '123ms all 5000ms ease-in']);
       animator.finishEffect(e1);
       expect(renderUtil.totalQueuedReflows).toEqual(1);
       expect(renderUtil.totalFlushedReflows).toEqual(1);
       assertTransition(element, ['1000ms all 0ms ease-out', '123ms all 5000ms ease-in']);

       renderUtil.flushReflows(1);
       assertTransition(element, ['1000ms all 0ms ease-out', '123ms all 5000ms ease-in', '0s all']);
       assertStyle(element, 'border-width', '');
       assertStyle(element, 'font-size', '');
       assertStyle(element, 'opacity', '1');
       assertStyle(element, 'border-radius', '10px');

       expect(renderUtil.totalQueuedReflows).toEqual(1);
       expect(renderUtil.totalFlushedReflows).toEqual(2);
       renderUtil.flushReflows(1);

       assertStyle(element, 'border-width', '200px');
       assertStyle(element, 'font-size', '100px');
       assertStyle(element, 'opacity', '1');

       expect(renderUtil.totalQueuedReflows).toEqual(1);
       expect(renderUtil.totalFlushedReflows).toEqual(3);
       assertTransition(element, ['1000ms all 0ms ease-out', '123ms all 5000ms ease-in', '0s all']);
     });

  it('should issue a single reflow when destroy is called before clearing everything up', () => {
    const element = makeElement();
    const renderUtil = new TestRenderUtil();
    const animator = new CssTransitionAnimator(element, renderUtil, true);

    animator.addEffect({
      styles: {opacity: '1', 'font-size': '10px'},
      classes: null,
      timing: parseTimingExp('1000ms ease-out')
    });

    animator.flushEffects();
    renderUtil.flushReflows();
    assertStyle(element, 'opacity', '1');
    assertStyle(element, 'font-size', '10px');

    assertTransition(element, '1000ms all 0ms ease-out');
    animator.destroy();
    assertTransition(element, '0s none');
    assertStyle(element, 'opacity', '1');
    assertStyle(element, 'font-size', '10px');

    renderUtil.flushReflows();
    assertTransition(element, '');
    assertStyle(element, 'opacity', '');
    assertStyle(element, 'font-size', '');
  });

  it('should reuse the previous transition string if it matches the next one', () => {
    const element = makeElement();
    const renderUtil = new TestRenderUtil();
    const animator = new CssTransitionAnimator(element, renderUtil);
    animator.addEffect({
      styles: {opacity: '1', 'font-size': '200px'},
      classes: null,
      timing: parseTimingExp('1000ms ease-out')
    });

    animator.addEffect({
      styles: {color: 'red', 'border-radius': '200px'},
      classes: null,
      timing: parseTimingExp('1s ease-out')
    });

    animator.flushEffects();
    renderUtil.flushReflows();
    assertTransition(element, '1000ms all 0ms ease-out');
  });

  it('should apply an auto style and remove it once the effect is finished', () => {
    const element = makeElement();
    const renderUtil = new TestRenderUtil();
    const animator = new CssTransitionAnimator(element, renderUtil);
    let e: StylingEffect;
    animator.addEffect(e = {
      styles: {height: '*', width: '200px'},
      classes: null,
      timing: parseTimingExp('1000ms ease-out')
    });

    renderUtil.gcsAlias['height'] = '456px';
    animator.flushEffects();
    renderUtil.flushReflows();
    assertStyle(element, 'height', '456px');

    animator.finishEffect(e);
    assertStyle(element, 'height', '456px');

    renderUtil.flushReflows();
    assertStyle(element, 'height', '');
  });

  it('should apply multiple AUTO_STYLE styles, but only remove the ones that remain the same as AUTO_STYLE values once finished',
     () => {
       const element = makeElement();
       const renderUtil = new TestRenderUtil();
       const animator = new CssTransitionAnimator(element, renderUtil);
       animator.addEffect({
         styles: {height: '*', width: '*'},
         classes: null,
         timing: parseTimingExp('1000ms ease-out')
       });

       animator.addEffect({
         styles: {height: '555px', width: '*'},
         classes: null,
         timing: parseTimingExp('1000ms ease-out')
       });

       renderUtil.gcsAlias['width'] = '333px';
       renderUtil.gcsAlias['height'] = '999px';

       animator.flushEffects();
       renderUtil.flushReflows();
       assertStyle(element, 'width', '333px');
       assertStyle(element, 'height', '555px');

       animator.finishAll();
       assertStyle(element, 'width', '333px');
       assertStyle(element, 'height', '555px');

       renderUtil.flushReflows();
       assertStyle(element, 'width', '');
       assertStyle(element, 'height', '555px');
     });

  it('should apply multiple single property effects with different timings into a single reflow',
     () => {
       const element = makeElement();
       const renderUtil = new TestRenderUtil();
       const animator = new CssTransitionAnimator(element, renderUtil);
       animator.addEffect({styles: {opacity: '1'}, classes: null, timing: parseTimingExp(123)});

       animator.addEffect({
         styles: {'font-size': '100px'},
         classes: null,
         timing: parseTimingExp('456ms 5s ease-out')
       });

       animator.addEffect({
         styles: {'border-radius': '10px'},
         classes: {active: true},
         timing: parseTimingExp(789)
       });

       expect(renderUtil.totalQueuedReflows).toEqual(0);
       expect(renderUtil.totalFlushedReflows).toEqual(0);

       animator.flushEffects();
       assertTransition(
           element, ['123ms opacity 0ms', '456ms font-size 5000ms ease-out', '789ms all 0ms']);
       expect(renderUtil.totalQueuedReflows).toEqual(0);
       expect(renderUtil.totalFlushedReflows).toEqual(0);
     });
});

class TestRenderUtil implements RenderUtil {
  totalFlushedReflows: number = 0;
  transitionLogFn: ((element: HTMLElement, value: string|null) => any)|null = null;
  gcsLog: string[] = [];
  gcsAlias: {[prop: string]: any} = {};

  private _time: number = 0;
  private _nextID = 1;
  private _reflowFnQueue: Function[] = [];
  private _timeoutFnQueue: {time: number, fn: Function, id: number}[] = [];

  currentTransitionString: string|null = null;

  setTransition(element: HTMLElement, value: string|null) {
    applyTransition(element, value);
    this.currentTransitionString = value;
    this.transitionLogFn && this.transitionLogFn(element, value);
  }

  fireReflow(element: HTMLElement, frameCallback?: Function): void {
    if (frameCallback) {
      this._reflowFnQueue.push(frameCallback);
    } else {
      this.totalFlushedReflows++;
    }
  }

  get totalQueuedReflows() { return this._reflowFnQueue.length; }

  get totalQueuedTimeouts() { return this._timeoutFnQueue.length; }

  flushReflows(limit: number = 0) {
    limit = limit ? Math.min(limit, this._reflowFnQueue.length) : this._reflowFnQueue.length;
    for (let i = 0; i < limit; i++) {
      this._reflowFnQueue.shift() !();
      this.totalFlushedReflows++;
    }
  }

  clearTimeout(id: any): void {
    for (let i = 0; i < this._timeoutFnQueue.length; i++) {
      const entry = this._timeoutFnQueue[i];
      if (entry.id === id) {
        this._timeoutFnQueue.splice(i, 1);
        break;
      }
    }
  }

  setTimeout(fn: Function, time: number): any {
    const id = this._nextID++;
    this._timeoutFnQueue.push({time, fn, id});
  }

  fowardTime(time: number) {
    this._time += time;
    for (let i = 0; i < this._timeoutFnQueue.length; i++) {
      const entry = this._timeoutFnQueue[i];
      if (entry.time <= this._time) {
        this._timeoutFnQueue.splice(i, 1);
        entry.fn();
        i--;  // the next item has now shifted
      }
    }
  }

  getComputedStyle(element: HTMLElement, prop: string): string {
    this.totalFlushedReflows++;
    this.gcsLog.push(prop);
    return this.gcsAlias[prop] || '';
  }
}

function isIE10or11(): boolean {
  if (typeof navigator !== 'undefined') {
    return navigator.appVersion.indexOf('MSIE 10') >= 0  // IE10
        ||
        !!(window as any)['MSInputMethodContext'] && !!(document as any)['documentMode'];  // IE11
  }
  return false;
}