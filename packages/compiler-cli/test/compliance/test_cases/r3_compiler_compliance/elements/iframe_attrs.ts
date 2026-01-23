import {Component} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <iframe allow="camera 'none'" [attr.fetchpriority]="'low'" [attr.allowfullscreen]="fullscreen"></iframe>
  `,
    standalone: false
})
export class MyComponent {
  fullscreen = 'false';
}
