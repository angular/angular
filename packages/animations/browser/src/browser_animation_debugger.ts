/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationDebugger} from '@angular/animations';

export class NoopAnimationDebugger extends AnimationDebugger {
  debug(element: any, phase: string, data: any, debugFlagValue?: any): void {}
}

export class BrowserAnimationDebugger implements AnimationDebugger {
  debugFlagRequired = true;

  constructor() {
    this._breakDown('ANIMATIONS: Animations Debugger Loaded');
    this._log(
        '- use', {debug: true}, 'for trigger() and transition() functions to enable debugging');
    this._log(
        '- animation debugging is enabled by default during devMode is enabled (use enableProdMode() to disable)');
    this._breakUp();
  }

  debug(element: any, phase: string, data: {[key: string]: any}, debugFlagValue?: any): void {
    switch (phase) {
      case 'build':
        this._onBuild(element, data);
        break;
      case 'start':
        this._onStart(element, data, debugFlagValue);
        break;
      case 'transition':
        this._onTransition(element, data);
        break;
      case 'query':
        this._onQuery(element, data, debugFlagValue);
        break;
      case 'animate':
        this._onAnimate(element, data, debugFlagValue);
        break;
      case 'done':
        this._onDone(element, data, debugFlagValue);
        break;
    }
  }

  private _onBuild(element: any, data: {[key: string]: any}): void {
    const {triggerName} = data;
    this._log(`ANIMATION REGISTER: animation trigger @${triggerName} has been built...`);
  }

  private _onTransition(element: any, data: {[key: string]: any}): void {
    const {originalExpression} = data;
    this._log(`ANIMATION TRANSITION: detected and running animation transition "foo"`);
  }

  private _onStart(element: any, data: {[key: string]: any}, debugFlagValue?: any): void {
    const {triggerName} = data;
    const isTrigger = triggerName ? true : false;
    if (isTrigger) {
      this._breakDown(`ANIMATIONS: @${triggerName} animation kicked off`);
      this._log(
          `TRIGGER: transitioning from ${data.fromState} to ${data.toState} (matched transition is ...)`);
    } else {
      this._breakDown('timeline animation');
    }

    this._log(`START: this animation will animate for ${data.totalTime}ms`);
    this._lineBreak();
  }

  private _onAnimate(element: any, data: {[key: string]: any}, debugFlagValue?: any): void {
    const {options, keyframes} = data;
    const {duration, easing} = options;
    this._log('-> STEP:', {element, duration, easing, keyframes});
  }

  private _onQuery(element: any, data: {[key: string]: any}, debugFlagValue?: any): void {
    const {selector, results, limit} = data;
    this._log(
        `-> QUERY: query("${selector}", ...) run (${results.length} detected)`,
        {elements: results});
  }

  private _onDone(element: any, data: {[key: string]: any}, debugFlagValue?: any): void {
    const {triggerName} = data;
    this._lineBreak();
    this._log(`DONE: animation complete`);
    this._breakUp();
  }

  private _log(...msg: any[]) { console.log(...msg); }

  private _lineBreak() { console.log('\n'); }

  private _breakUp() { console.groupEnd(); }

  private _breakDown(msg: string) { console.group(msg); }

  private _break(ext: string) { console.log('------------', ext); }
}
