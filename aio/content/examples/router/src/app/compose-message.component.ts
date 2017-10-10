// #docregion
import { Component, HostBinding } from '@angular/core';
import { Router }                 from '@angular/router';

@Component({
  templateUrl: './compose-message.component.html',
  styles: [ ':host { position: relative; bottom: 10%; }' ]
})
export class ComposeMessageComponent {
  details: string;
  message: string;
  sending = false;

  constructor(private router: Router) {}

  send() {
    this.sending = true;
    this.details = 'Sending Message...';

    setTimeout(() => {
      this.sending = false;
      this.closePopup();
    }, 1000);
  }

  cancel() {
    this.closePopup();
  }

  // #docregion closePopup
  closePopup() {
    // Providing a `null` value to the named outlet
    // clears the contents of the named outlet
    this.router.navigate([{ outlets: { popup: null }}]);
  }
  // #enddocregion closePopup
}
