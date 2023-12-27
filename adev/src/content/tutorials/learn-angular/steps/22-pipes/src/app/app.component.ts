import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    {{ username }}
  `,
  standalone: true,
  imports: [],
})
export class AppComponent {
  username = 'yOunGTECh';
}
