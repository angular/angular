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
  remove = jasmine.createSpy('remove spy');
  add = jasmine.createSpy('add spy');
}
