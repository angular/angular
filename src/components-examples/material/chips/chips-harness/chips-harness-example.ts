import {Component} from '@angular/core';

/**
 * @title Testing with MatChipsHarness
 */
@Component({
  selector: 'chips-harness-example',
  templateUrl: 'chips-harness-example.html',
})
export class ChipsHarnessExample {
  isDisabled = false;
  remove: () => void = jasmine.createSpy('remove spy');
  add: () => void = jasmine.createSpy('add spy');
}
