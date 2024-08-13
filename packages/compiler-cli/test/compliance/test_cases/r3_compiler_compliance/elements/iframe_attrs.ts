import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <iframe allow="camera 'none'" [attr.fetchpriority]="'low'" [attr.allowfullscreen]="fullscreen"></iframe>
  `
})
export class MyComponent {
  fullscreen = 'false';
}
