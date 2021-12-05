// #docplaster
// #docregion
// Import the native Angular services.
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  template: `
    <p>
      Select a title to set on the current HTML document:
    </p>

    <ul>
      <!-- eslint-disable @angular-eslint/template/click-events-have-key-events -->
      <li><a (click)="setTitle('Good morning!')">Good morning</a>.</li>
      <li><a (click)="setTitle('Good afternoon!')">Good afternoon</a>.</li>
      <li><a (click)="setTitle('Good evening!')">Good evening</a>.</li>
      <!-- eslint-enable @angular-eslint/template/click-events-have-key-events -->
    </ul>
  `,
})
// #docregion class
export class AppComponent {
  public constructor(private titleService: Title) { }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }
}
// #enddocregion class
