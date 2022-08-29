import {Component} from '@angular/core';

@Component({
  selector: 'legacy-progress-bar-e2e',
  templateUrl: 'legacy-progress-bar-e2e.html',
  styles: [
    `
    mat-progress-bar {
      margin-bottom: 10px;
    }
  `,
  ],
})
export class LegacyProgressBarE2e {
  determinateValue: number = 57;
  bufferValue: number = 35;
}
