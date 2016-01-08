import {
  it,
  iit,
  describe,
  ddescribe,
  expect,
  inject,
  injectAsync,
  TestComponentBuilder,
  beforeEachProviders,
  beforeEach,
} from 'angular2/testing';
import {provide, Component} from 'angular2/core';
import {DebugElement} from "angular2/core";

import {MdButton} from './button';
import {AsyncTestFn} from "angular2/testing";


describe('MdButton', () => {
  let builder: TestComponentBuilder;

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => { builder = tcb; }));

  describe('button[md-button]', () => {
    it('should handle a click on the button', (done: () => void) => {
      return builder.createAsync(TestApp).then((fixture) => {
        let testComponent = fixture.debugElement.componentInstance;
        let buttonDebugElement = getChildDebugElement(fixture.debugElement, 'button');

        buttonDebugElement.nativeElement.click();
        expect(testComponent.clickCount).toBe(1);
        done();
      });
    });

  });
});

/** Gets a child DebugElement by tag name. */
function getChildDebugElement(parent: DebugElement, tagName: string): DebugElement {
  return parent.query(debugEl => debugEl.nativeElement.tagName.toLowerCase() == tagName);
}

/** Test component that contains an MdButton. */
@Component({
  selector: 'test-app',
  directives: [MdButton],
  template:
      `<button md-button type="button" (click)="increment()" [disabled]="isDisabled">Go</button>`,
})
class TestApp {
  clickCount: number = 0;
  isDisabled: boolean = false;

  increment() {
    this.clickCount++;
  }
}
