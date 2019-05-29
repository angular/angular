import { Component } from '@angular/core';

@Component({
  selector: 'app-fails',
  templateUrl: './fails.component.html',
  styles: [
    `
      input {
      font-weight: bold;
      }

      label {
      color: #808080;
      }
     `
  ]
})
export class FailsComponent {
  model: any = {};

  hideSuccessConfirmation = true;

  submit(): void {
    this.hideSuccessConfirmation = false;
  }

}
