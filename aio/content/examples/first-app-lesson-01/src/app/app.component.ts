import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  // #docregion app-comp-template
  template: `<h1>Hello world!</h1>`,
  // #enddocregion
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  // #docregion app-comp-title
  title = 'homes';
  // #enddocregion
}
