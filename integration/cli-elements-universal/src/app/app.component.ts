import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<app-title-ce [appName]="title"></app-title-ce>',
  standalone: false,
})
export class AppComponent {
  title = 'cli-elements-universal';
}
