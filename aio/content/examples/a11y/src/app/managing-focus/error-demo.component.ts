import { Component } from '@angular/core';

// #docregion
@Component({
  selector: 'app-error-demo',
  templateUrl: './error-demo.component.html'
})
export class ErrorDemoComponent {
  hideErrorConfirmation = true;

  setFocusOn(element: any): void {
    this.hideErrorConfirmation = false;
    setTimeout(() => {
      element.focus();
    }, 200);
  }
}
// #enddocregion
