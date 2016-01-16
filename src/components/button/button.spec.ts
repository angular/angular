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
import {provide, Component, DebugElement} from 'angular2/core';
import {By} from 'angular2/platform/browser';

import {MdButton} from './button';
import {AsyncTestFn, FunctionWithParamTokens} from 'angular2/testing';


describe('MdButton', () => {
  let builder: TestComponentBuilder;

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => { builder = tcb; }));

  describe('button[md-button]', () => {
    it('should handle a click on the button', (done: () => void) => {
      return builder.createAsync(TestApp).then((fixture) => {
        let testComponent = fixture.debugElement.componentInstance;
        let buttonDebugElement = fixture.debugElement.query(By.css('button'));

        buttonDebugElement.nativeElement.click();
        expect(testComponent.clickCount).toBe(1);
        done();
      });
    });

    it('should not increment if disabled', (done: () => void) => {
      return builder.createAsync(TestApp).then((fixture) => {
        let testComponent = fixture.debugElement.componentInstance;
        let buttonDebugElement = fixture.debugElement.query(By.css('button'));

        testComponent.isDisabled = true;
        fixture.detectChanges();

        buttonDebugElement.nativeElement.click();

        expect(testComponent.clickCount).toBe(0);
        done();
      })
    });

  });
});


/** Shortcut function to use instead of `injectAsync` for less boilerplate on each `it`. */
function testAsync(fn: Function): FunctionWithParamTokens {
  return injectAsync([], fn);
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
