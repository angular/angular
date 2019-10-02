import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'mdc-progress-bar-e2e',
  templateUrl: 'mdc-progress-bar-e2e.html',
  styles: [`
    mat-progress-bar {
      margin-bottom: 10px;
    }
  `]
})
export class MdcProgressBarE2E {
  determinateValue: number = 57;
  bufferValue: number = 35;
}
