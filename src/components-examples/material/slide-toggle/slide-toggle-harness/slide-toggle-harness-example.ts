import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';

/**
 * @title Testing with MatSlideToggleHarness
 */
@Component({
  selector: 'slide-toggle-harness-example',
  templateUrl: 'slide-toggle-harness-example.html',
})
export class SlideToggleHarnessExample {
  disabled = true;
  ctrl = new FormControl(true);
}
