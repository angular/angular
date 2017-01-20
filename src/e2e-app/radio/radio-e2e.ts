import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'radio-e2e',
  templateUrl: 'radio-e2e.html',
})
export class SimpleRadioButtons {
  isGroupDisabled: boolean = false;
  groupValue: string;
}
