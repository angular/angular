import {Component} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';

/** @title Disabled select */
@Component({
  selector: 'select-disabled-example',
  templateUrl: 'select-disabled-example.html',
})
export class SelectDisabledExample {
  disableSelect = new UntypedFormControl(false);
}
