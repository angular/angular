import { Component, ApplicationRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor(private appRef: ApplicationRef) {}

  changeTitle() {
    this.title = 'new Title';
  }

  changeTitleWithCD() {
    this.title = 'new Title After Change detection';
    this.appRef.tick();
  }
}
