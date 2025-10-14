import {tick} from '@angular/core/testing';
export * from './async-observable-helpers';
export * from './jasmine-matchers';
///// Short utilities /////
/** Wait a tick, then detect changes */
export function advance(f) {
  tick();
  f.detectChanges();
}
// See https://developer.mozilla.org/docs/Web/API/MouseEvent/button
// #docregion click-event
/** Button events to pass to `DebugElement.triggerEventHandler` for RouterLink event handler */
export const ButtonClickEvents = {
  left: {button: 0},
  right: {button: 2},
};
/** Simulate element click. Defaults to mouse left-button click event. */
export function click(el, eventObj = ButtonClickEvents.left) {
  if (el instanceof HTMLElement) {
    el.click();
  } else {
    el.triggerEventHandler('click', eventObj);
  }
}
// #enddocregion click-event
//# sourceMappingURL=index.js.map
