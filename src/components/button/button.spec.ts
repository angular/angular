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
import {MdButton} from './button';


describe('MdButton', () => {
  let builder: TestComponentBuilder;

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => { builder = tcb; }));

  it('should ...', () => {
    return builder.createAsync(MdButton).then((fixture) => {
      fixture.detectChanges();
    });
  });




});



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
