import { Component } from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <div [innerHtml]="evil"></div>
    <link [href]="evil" />
    <div [attr.style]="evil"></div>
    <img [src]="nonEvil" />
    <iframe [sandbox]="evil"></iframe>
    <a href="{{evil}}{{evil}}"></a>
    <div attr.style="{{evil}}{{evil}}"></div>
    <div [(innerHTML)]="evil"></div>
    <iframe [(srcdoc)]="evil"></iframe>
    <img [(src)]="evil" />
    <iframe [(src)]="evil"></iframe>
    <object [(data)]="evil"></object>
    <link [(href)]="evil" />
    <iframe [(sandbox)]="evil"></iframe>
  `
})
export class MyComponent {
  evil = 'evil';
  nonEvil = 'nonEvil';
}
