import {Component} from '@angular/core';

@Component({selector: 'demo', templateUrl: 'app-component.html', styleUrls: ['app-style.css']})
export class AppComponent {
  message: string =
      'I originated in an external template, but was inlined by my friend the offline compiler';
}
