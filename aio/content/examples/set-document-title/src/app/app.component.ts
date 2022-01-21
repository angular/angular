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
      <li><button type="button" (click)="setTitle('Good morning!')">Good morning</button></li>
      <li><button type="button" (click)="setTitle('Good afternoon!')">Good afternoon</button></li>
      <li><button type="button" (click)="setTitle('Good evening!')">Good evening</button></li>
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
