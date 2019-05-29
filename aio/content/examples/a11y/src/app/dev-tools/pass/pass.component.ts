import { Component } from '@angular/core';

@Component({
  selector: 'app-fails',
  templateUrl: './pass.component.html'
})
export class PassComponent {
  model: any = {};

  hideSuccessConfirmation = true;

  submit(messageElement: any): void {
    this.hideSuccessConfirmation = false;
    setTimeout(() => {
      messageElement.focus();
    }, 200);
  }

}
