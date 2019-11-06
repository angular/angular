import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';

/** @title Disabled select */
@Component({
  selector: 'select-disabled-example',
  templateUrl: 'select-disabled-example.html',
  styleUrls: ['select-disabled-example.css'],
})
export class SelectDisabledExample {
  disableSelect = new FormControl(false);
}
