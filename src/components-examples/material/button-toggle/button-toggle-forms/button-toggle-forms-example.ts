import {Component} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';

/**
 * @title Button-toggles with forms
 */
@Component({
  selector: 'button-toggle-forms-example',
  templateUrl: 'button-toggle-forms-example.html',
})
export class ButtonToggleFormsExample {
  fontStyleControl = new UntypedFormControl();
  fontStyle?: string;
}
