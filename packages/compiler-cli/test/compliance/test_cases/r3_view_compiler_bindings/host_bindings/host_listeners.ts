import {Component, HostListener} from '@angular/core';

@Component({
    selector: 'my-cmp',
    host: {
        '(document:dragover)': 'foo($event)',
    },
    template: `
  `
})
export class MyComponent {
  foo!: any;
}
