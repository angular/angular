import {Component} from '@angular/core';
import {MatButtonToggleAppearance} from '@angular/material/button-toggle';

/**
 * @title Testing with MatButtonToggleHarness
 */
@Component({
  selector: 'button-toggle-harness-example',
  templateUrl: 'button-toggle-harness-example.html',
})
export class ButtonToggleHarnessExample {
  disabled = false;
  appearance: MatButtonToggleAppearance = 'standard';
}
