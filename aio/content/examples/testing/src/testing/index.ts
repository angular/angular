import { DebugElement } from '@angular/core';
import { tick, ComponentFixture } from '@angular/core/testing';

export * from './async-observable-helpers';
export * from './activated-route-stub';
export * from './jasmine-matchers';
export * from './router-link-directive-stub';

///// Short utilities /////

/** Wait a tick, then detect changes */
export function advance(f: ComponentFixture<any>): void {
  tick();
  f.detectChanges();
}

// See https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
// #docregion click-event
/** RouterLink 이벤트 핸들러를 위해 버튼 이벤트 객체의 일부를 다시 선언합니다. */
export const ButtonClickEvents = {
   left:  { button: 0 },
   right: { button: 2 }
};

/** 엘리먼트 클릭을 처리합니다. 이벤트 객체의 기본값은 마우스 왼쪽 버튼 클릭 이벤트입니다. */
export function click(el: DebugElement | HTMLElement, eventObj: any = ButtonClickEvents.left): void {
  if (el instanceof HTMLElement) {
    el.click();
  } else {
    el.triggerEventHandler('click', eventObj);
  }
}
// #enddocregion click-event
