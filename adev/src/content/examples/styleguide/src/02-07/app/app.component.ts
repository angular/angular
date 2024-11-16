import {Component} from '@angular/core';

@Component({
  selector: 'sg-app',
  template: `
    <toh-hero></toh-hero>
    <admin-users></admin-users>
  `,
  standalone: false,
})
export class AppComponent {}
