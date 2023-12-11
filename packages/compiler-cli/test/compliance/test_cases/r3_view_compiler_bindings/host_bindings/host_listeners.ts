import {Component, HostListener} from '@angular/core';

@Component({
  selector: 'my-cmp',
  standalone: true,
  host: {
    '(document:dragover)': 'foo($event)',
  },
  template: `
  `
})
export class MyComponent {
  foo!: any;
}
