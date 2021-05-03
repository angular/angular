/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export function forceReflow() {
  (document.body as any)['_reflow'] = document.body.clientWidth;
}

export function makeAnimationEvent(
    startOrEnd: 'start'|'end', animationName: string, elapsedTime: number, timestamp?: number) {
  const e = new AnimationEvent('animation' + startOrEnd, {animationName, elapsedTime});
  if (timestamp) {
    (e as any)._ngTestManualTimestamp = timestamp;
  }
  return e;
}

export function supportsAnimationEventCreation() {
  let supported = false;
  try {
    makeAnimationEvent('end', 'test', 0);
    supported = true;
  } catch {
  }
  return supported;
}

export function findKeyframeDefinition(sheet: any): any|null {
  return sheet.cssRules[0] || null;
}

export function createElement() {
  return document.createElement('div');
}

export function assertStyle(element: any, prop: string, value: string) {
  expect(element.style[prop] || '').toEqual(value);
}

export function assertElementExistsInDom(element: any, yes?: boolean) {
  const exp = expect(element.parentNode);
  if (yes) {
    exp.toBeTruthy();
  } else {
    exp.toBeFalsy();
  }
}
