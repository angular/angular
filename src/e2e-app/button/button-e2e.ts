import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'button-e2e',
  templateUrl: 'button-e2e.html',
})
export class ButtonE2E {
  isDisabled: boolean = false;
  clickCounter: number = 0;
}
