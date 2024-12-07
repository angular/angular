import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <div [innerHtml]="evil"></div>
    <link [href]="evil" />
    <div [attr.style]="evil"></div>
    <img [src]="evil" />
    <iframe [sandbox]="evil"></iframe>
    <a href="{{evil}}{{evil}}"></a>
    <div attr.style="{{evil}}{{evil}}"></div>
  `
})
export class MyComponent {
  evil = 'evil';
}
