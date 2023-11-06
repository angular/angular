import {Component} from '@angular/core';
import {ReversePipe} from './reverse.pipe';

@Component({
  selector: 'app-root',
  template: `
    Reverse Machine: {{ word | reverse }}
  `,
  standalone: true,
  imports: [ReversePipe],
})
export class AppComponent {
  word = 'You are a champion';
}
