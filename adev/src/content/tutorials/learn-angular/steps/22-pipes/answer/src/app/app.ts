import {Component} from '@angular/core';
import {LowerCasePipe} from '@angular/common';

@Component({
  selector: 'app-root',
  template: `
    {{ username | lowercase }}
  `,
  imports: [LowerCasePipe],
})
export class App {
  username = 'yOunGTECh';
}
