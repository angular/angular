import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-title [subtitle]="subtitle"></app-title>
    <app-contact></app-contact>
  `
})
export class AppComponent {
  subtitle = '(v2)';
}
