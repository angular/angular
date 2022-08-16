import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';

/** @title Listbox with disabled options. */
@Component({
  selector: 'cdk-listbox-disabled-example',
  exportAs: 'cdkListboxDisabledExample',
  templateUrl: 'cdk-listbox-disabled-example.html',
  styleUrls: ['cdk-listbox-disabled-example.css'],
})
export class CdkListboxDisabledExample {
  canDrinkCtrl = new FormControl(false);
}
