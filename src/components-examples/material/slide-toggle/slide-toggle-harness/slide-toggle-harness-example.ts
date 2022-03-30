import {Component} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';

/**
 * @title Testing with MatSlideToggleHarness
 */
@Component({
  selector: 'slide-toggle-harness-example',
  templateUrl: 'slide-toggle-harness-example.html',
})
export class SlideToggleHarnessExample {
  disabled = true;
  ctrl = new UntypedFormControl(true);
}
