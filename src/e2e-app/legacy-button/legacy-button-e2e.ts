import {Component} from '@angular/core';

@Component({
  selector: 'legacy-button-e2e',
  templateUrl: 'legacy-button-e2e.html',
})
export class LegacyButtonE2e {
  isDisabled: boolean = false;
  clickCounter: number = 0;
}
